import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { applicationDefault, cert, getApps as getAdminApps, initializeApp as initializeAdminApp } from 'firebase-admin/app';
import type { ServiceAccount } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import type { Firestore as AdminFirestore } from 'firebase-admin/firestore';
import { COMMERCIAL_PLAN_CONFIG } from './src/config/commercialPlans';
import {
  DEFAULT_QUOTA_TIMEZONE,
  determineAuthoritativePlanType,
  getDocumentPermitValidUntil,
  getQuotaPeriod,
} from './src/server/quotaPolicy';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));


// ============================================================================
// FIREBASE ADMIN + SERVER-AUTHORITATIVE QUOTAS
// ============================================================================

type AuthenticatedRequest = Request & {
  authUser?: { uid: string; email?: string };
};

type QuotaKind = 'document' | 'ai';

interface QuotaSnapshot {
  period: string;
  planType: 'FREE' | 'PRO';
  documentsCreatedThisMonth: number;
  aiRequestsThisMonth: number;
  documentsLimit: number;
  aiLimit: number;
}

class QuotaLimitError extends Error {
  constructor(
    public kind: QuotaKind,
    public current: number,
    public limit: number,
    public planType: 'FREE' | 'PRO'
  ) {
    super(`Limite mensal de ${kind === 'document' ? 'documentos' : 'consultas IA'} atingido.`);
  }
}

class DuplicateQuotaRequestError extends Error {
  constructor(public kind: QuotaKind) {
    super(kind === 'ai'
      ? 'Esta solicitação de IA já foi processada ou está em processamento.'
      : 'Esta solicitação de documento já foi processada.');
  }
}

let adminDb: AdminFirestore | null = null;
let adminInitAttempted = false;

function getServerEnvironment(): string {
  return (process.env.APP_ENV || process.env.VITE_APP_ENV || process.env.NODE_ENV || 'development').toLowerCase();
}

function isProductionServer(): boolean {
  return getServerEnvironment() === 'production';
}

function getAdminDatabase(): AdminFirestore | null {
  if (adminDb) return adminDb;
  if (adminInitAttempted) return null;
  adminInitAttempted = true;

  try {
    let adminApp;
    if (getAdminApps().length > 0) {
      adminApp = getAdminApps()[0];
    } else {
      const rawServiceAccount = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
      const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

      if (rawServiceAccount) {
        const parsed = JSON.parse(rawServiceAccount) as ServiceAccount;
        adminApp = initializeAdminApp({ credential: cert(parsed), projectId: projectId || parsed.projectId });
      } else {
        adminApp = initializeAdminApp({ credential: applicationDefault(), projectId });
      }
    }

    const databaseId =
      process.env.FIREBASE_ADMIN_FIRESTORE_DATABASE_ID ||
      process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
      'ai-studio-evoluienf-029b73c0-0ca3-4300-b3d2-dfecae6b686e';

    adminDb = getAdminFirestore(adminApp, databaseId);
    return adminDb;
  } catch (error) {
    console.error('[Server] Firebase Admin indisponível:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function requireFirebaseAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!bearer) {
    if (!isProductionServer() && process.env.ALLOW_DEV_AUTH_BYPASS === 'true') {
      req.authUser = {
        uid: String(req.headers['x-dev-user-id'] || 'dev-local-user'),
      };
      return next();
    }
    return res.status(401).json({ success: false, errorType: 'auth_required', error: 'Sessão autenticada necessária.' });
  }

  try {
    const db = getAdminDatabase();
    if (!db) {
      return res.status(503).json({ success: false, errorType: 'auth_backend_unavailable', error: 'Serviço de autenticação temporariamente indisponível.' });
    }
    const decoded = await getAdminAuth().verifyIdToken(bearer);
    req.authUser = { uid: decoded.uid, email: decoded.email };
    return next();
  } catch {
    return res.status(401).json({ success: false, errorType: 'invalid_token', error: 'Sessão inválida ou expirada. Entre novamente.' });
  }
}

function getCurrentQuotaPeriod(date = new Date()): string {
  return getQuotaPeriod(date, process.env.QUOTA_TIMEZONE || DEFAULT_QUOTA_TIMEZONE);
}

function safeQuotaKey(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 220);
}

function determinePlanType(data: Record<string, any> | undefined): 'FREE' | 'PRO' {
  return determineAuthoritativePlanType(data);
}

async function getQuotaSnapshot(uid: string): Promise<QuotaSnapshot> {
  const db = getAdminDatabase();
  if (!db) throw new Error('Firebase Admin indisponível para consulta de cota.');
  const period = getCurrentQuotaPeriod();
  const usageId = `${uid}_${period}`;
  const [usageSnap, subSnap, legacySubSnap] = await Promise.all([
    db.collection('usage').doc(usageId).get(),
    db.collection('subscriptions').doc(uid).get(),
    db.collection('user_subscriptions').doc(uid).get(),
  ]);
  const subscriptionData = subSnap.exists ? subSnap.data() : (legacySubSnap.exists ? legacySubSnap.data() : undefined);
  const planType = determinePlanType(subscriptionData);
  const usage = usageSnap.exists ? usageSnap.data() || {} : {};
  const limits = COMMERCIAL_PLAN_CONFIG[planType];
  return {
    period,
    planType,
    documentsCreatedThisMonth: Number(usage.documentsCreatedThisMonth || usage.totalAtendimentos || 0),
    aiRequestsThisMonth: Number(usage.aiRequestsThisMonth || usage.totalRefinamentosIA || 0),
    documentsLimit: limits.documentsPerMonth,
    aiLimit: limits.aiRequestsPerMonth,
  };
}

async function reserveQuota(
  uid: string,
  kind: QuotaKind,
  idempotencyKey: string,
  resourceId?: string
): Promise<QuotaSnapshot & { permitId: string; alreadyReserved: boolean }> {
  const db = getAdminDatabase();
  if (!db) throw new Error('Firebase Admin indisponível para reserva de cota.');

  const period = getCurrentQuotaPeriod();
  const usageId = `${uid}_${period}`;
  const stableKey = safeQuotaKey(kind === 'document' ? (resourceId || idempotencyKey) : idempotencyKey);
  const permitId = safeQuotaKey(`${uid}_${period}_${kind}_${stableKey}`);
  const usageRef = db.collection('usage').doc(usageId);
  const subscriptionRef = db.collection('subscriptions').doc(uid);
  const legacySubscriptionRef = db.collection('user_subscriptions').doc(uid);
  const permitRef = db.collection('quotaPermits').doc(permitId);

  return db.runTransaction(async (tx) => {
    const [permitSnap, usageSnap, subSnap, legacySubSnap] = await Promise.all([
      tx.get(permitRef),
      tx.get(usageRef),
      tx.get(subscriptionRef),
      tx.get(legacySubscriptionRef),
    ]);

    const subscriptionData = subSnap.exists ? subSnap.data() : (legacySubSnap.exists ? legacySubSnap.data() : undefined);
    const planType = determinePlanType(subscriptionData);
    const limits = COMMERCIAL_PLAN_CONFIG[planType];
    const usage = usageSnap.exists ? usageSnap.data() || {} : {};
    const documentsCurrent = Number(usage.documentsCreatedThisMonth || usage.totalAtendimentos || 0);
    const aiCurrent = Number(usage.aiRequestsThisMonth || usage.totalRefinamentosIA || 0);

    if (permitSnap.exists && permitSnap.data()?.status !== 'released') {
      // Documento: a mesma autorização pode ser consultada novamente sem consumir cota.
      // IA: o mesmo requestId não pode disparar novas chamadas externas gratuitamente.
      if (kind === 'ai') {
        throw new DuplicateQuotaRequestError('ai');
      }
      return {
        period,
        planType,
        documentsCreatedThisMonth: documentsCurrent,
        aiRequestsThisMonth: aiCurrent,
        documentsLimit: limits.documentsPerMonth,
        aiLimit: limits.aiRequestsPerMonth,
        permitId,
        alreadyReserved: true,
      };
    }

    const current = kind === 'document' ? documentsCurrent : aiCurrent;
    const limit = kind === 'document' ? limits.documentsPerMonth : limits.aiRequestsPerMonth;
    if (current >= limit) {
      throw new QuotaLimitError(kind, current, limit, planType);
    }

    const nextDocuments = kind === 'document' ? documentsCurrent + 1 : documentsCurrent;
    const nextAI = kind === 'ai' ? aiCurrent + 1 : aiCurrent;
    const now = new Date().toISOString();

    tx.set(
      usageRef,
      {
        id: usageId,
        usuarioId: uid,
        userId: uid,
        mesAno: period,
        period,
        documentsCreatedThisMonth: nextDocuments,
        aiRequestsThisMonth: nextAI,
        totalAtendimentos: nextDocuments,
        totalRefinamentosIA: nextAI,
        ultimoUso: now,
        updatedAt: now,
      },
      { merge: true }
    );

    tx.set(
      permitRef,
      {
        id: permitId,
        usuarioId: uid,
        userId: uid,
        period,
        kind,
        resourceId: resourceId || null,
        idempotencyKey,
        status: 'reserved',
        createdAt: permitSnap.exists ? permitSnap.data()?.createdAt || now : now,
        updatedAt: now,
        validUntil: getDocumentPermitValidUntil(),
      },
      { merge: true }
    );

    return {
      period,
      planType,
      documentsCreatedThisMonth: nextDocuments,
      aiRequestsThisMonth: nextAI,
      documentsLimit: limits.documentsPerMonth,
      aiLimit: limits.aiRequestsPerMonth,
      permitId,
      alreadyReserved: false,
    };
  });
}

async function markAiQuotaConsumed(uid: string, permitId: string): Promise<void> {
  const db = getAdminDatabase();
  if (!db || !permitId) return;
  const permitRef = db.collection('quotaPermits').doc(permitId);
  await db.runTransaction(async (tx) => {
    const permitSnap = await tx.get(permitRef);
    if (!permitSnap.exists) return;
    const permit = permitSnap.data() || {};
    if (permit.userId !== uid || permit.kind !== 'ai' || permit.status !== 'reserved') return;
    tx.set(permitRef, { status: 'consumed', consumedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, { merge: true });
  });
}

async function releaseAiQuota(uid: string, permitId: string): Promise<void> {
  const db = getAdminDatabase();
  if (!db || !permitId) return;
  const permitRef = db.collection('quotaPermits').doc(permitId);

  await db.runTransaction(async (tx) => {
    const permitSnap = await tx.get(permitRef);
    if (!permitSnap.exists) return;
    const permit = permitSnap.data() || {};
    if (permit.userId !== uid || permit.kind !== 'ai' || permit.status !== 'reserved') return;

    const usageId = `${uid}_${permit.period}`;
    const usageRef = db.collection('usage').doc(usageId);
    const usageSnap = await tx.get(usageRef);
    const usage = usageSnap.exists ? usageSnap.data() || {} : {};
    const aiCurrent = Number(usage.aiRequestsThisMonth || usage.totalRefinamentosIA || 0);
    const nextAI = Math.max(0, aiCurrent - 1);
    const now = new Date().toISOString();

    tx.set(usageRef, { aiRequestsThisMonth: nextAI, totalRefinamentosIA: nextAI, ultimoUso: now, updatedAt: now }, { merge: true });
    tx.set(permitRef, { status: 'released', updatedAt: now }, { merge: true });
  });
}

async function consumeAiQuota(req: AuthenticatedRequest): Promise<QuotaSnapshot & { permitId: string; alreadyReserved: boolean }> {
  const uid = req.authUser?.uid;
  if (!uid) throw new Error('Usuário autenticado ausente.');
  const requestId = String(req.headers['x-evoluienf-request-id'] || req.body?.requestId || `ai_${Date.now()}`);
  return reserveQuota(uid, 'ai', requestId);
}

function quotaErrorResponse(res: Response, error: unknown) {
  if (error instanceof DuplicateQuotaRequestError) {
    return res.status(409).json({
      success: false,
      errorType: 'duplicate_request',
      quotaKind: error.kind,
      error: error.message,
    });
  }
  if (error instanceof QuotaLimitError) {
    return res.status(429).json({
      success: false,
      errorType: 'quota_exceeded',
      quotaKind: error.kind,
      current: error.current,
      limit: error.limit,
      planType: error.planType,
      error: error.kind === 'document'
        ? `Você atingiu o limite mensal de ${error.limit} documentos do plano ${error.planType}. Seus registros existentes permanecem disponíveis.`
        : `Você atingiu o limite mensal de ${error.limit} consultas ao Assistente IA do plano ${error.planType}.`,
    });
  }
  return res.status(503).json({
    success: false,
    errorType: 'quota_backend_unavailable',
    error: 'Não foi possível validar sua cota agora. Tente novamente quando a conexão estiver disponível.',
  });
}

// Lazy Google GenAI initializer
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const DEFAULT_GEMINI_MODEL = 'gemini-3.7-flash';

function getActiveModelName(): string {
  return process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
}

const SYSTEM_INSTRUCTION = `Você é um assistente estritamente linguístico para a área da enfermagem hospitalar.
Sua única função é reorganizar o texto clínico fornecido para melhorar exclusivamente:
- concordância verbal e nominal;
- pontuação;
- fluidez;
- clareza;
- transição entre frases;
- redução de repetições desnecessárias.

REGRAS INQUEBRÁVEIS:
1. É terminantemente proibido adicionar, deduzir, interpretar, completar, corrigir clinicamente ou substituir qualquer informação.
2. É proibido inventar valores numéricos, medicamentos, dispositivos, procedimentos, queixas, diagnósticos ou condições clínicas.
3. É proibido utilizar termos diagnósticos ou classificações de gravidade não presentes nos fatos autorizados (como hipertenso, febril, hipoxêmico, instável, grave, séptico, desidratado, rebaixado).
4. É proibido afirmar "sem intercorrências" se isso não constar expressamente nos fatos autorizados fornecidos.
5. Se houver aparente contradição nos dados fornecidos, mantenha a contradição exatamente como descrita. Não deduza e não corrija.
6. Todos os números, frações, unidades e dosagens devem permanecer idênticos.
7. A saída deve ser retornada estritamente no esquema JSON especificado, com a lista de parágrafos e os factIds que justificam cada parágrafo.`;

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Endpoint to inspect active AI model configuration
app.get('/api/ai/model-info', (req, res) => {
  res.json({
    model: getActiveModelName(),
    provider: 'gemini',
  });
});

// Endpoint for dev connectivity test (uses strictly dummy non-clinical text)
app.post('/api/ai/test-connectivity', requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  const startTime = Date.now();
  const ai = getAIClient();
  const modelName = getActiveModelName();

  if (!ai) {
    return res.status(200).json({
      success: false,
      errorType: 'provider_error',
      error: 'GEMINI_API_KEY não configurada no ambiente.',
      model: modelName,
      durationMs: Date.now() - startTime,
    });
  }

  try {
    const dummyPrompt = `Texto base fictício para teste de conectividade:\n"Mantém AVP em MSD. AVP pérvio e funcionante. Curativo limpo, seco e íntegro."\n\nReorganize o texto mantendo fidelidade absoluta e retorne o JSON com parágrafos e factIds fictícios.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: dummyPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            paragraphs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  factIds: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['text', 'factIds'],
              },
            },
          },
          required: ['paragraphs'],
        },
      },
    });

    const duration = Date.now() - startTime;
    const text = response.text;
    const parsed = text ? JSON.parse(text) : null;

    return res.json({
      success: true,
      model: modelName,
      durationMs: duration,
      result: parsed,
      source: 'gemini_api',
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    return res.status(500).json({
      success: false,
      errorType: 'provider_error',
      error: error?.message || 'Falha de conectividade com a API Gemini.',
      model: modelName,
      durationMs: duration,
      statusCode: error?.status || error?.statusCode || 500,
      code: error?.code || error?.name || 'API_ERROR',
    });
  }
});

// API endpoint for AI Refinement V1
app.post('/api/ai/refine-text', requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  const startTime = Date.now();
  const { authorizedFacts, canonicalNarrative } = req.body;

  if (!authorizedFacts || !canonicalNarrative) {
    return res.status(400).json({
      success: false,
      errorType: 'client_error',
      error: 'Parâmetros authorizedFacts e canonicalNarrative são obrigatórios.',
    });
  }

  const ai = getAIClient();
  const modelName = getActiveModelName();

  if (!ai) {
    // If no API key configured, return fallback mock with strict linguistic refinement
    const duration = Date.now() - startTime;
    console.log(
      JSON.stringify({
        event: 'AI_REFINEMENT_MOCK_FALLBACK',
        durationMs: duration,
        reason: 'GEMINI_API_KEY not configured',
        model: modelName,
        success: true,
      })
    );

    // Extract all valid fact IDs
    const factIds: string[] = [];
    Object.values(authorizedFacts).forEach((list) => {
      if (Array.isArray(list)) {
        list.forEach((f: any) => {
          if (f && f.id) factIds.push(f.id);
        });
      }
    });

    return res.json({
      success: true,
      result: {
        paragraphs: [
          {
            text: canonicalNarrative,
            factIds: factIds,
          },
        ],
      },
      model: modelName,
      source: 'deterministic_mock',
    });
  }

  let quotaReservation: (QuotaSnapshot & { permitId: string; alreadyReserved: boolean }) | null = null;
  try {
    quotaReservation = await consumeAiQuota(req);
  } catch (quotaError) {
    return quotaErrorResponse(res, quotaError);
  }

  try {
    const prompt = `Fatos Clínicos Autorizados:\n${JSON.stringify(authorizedFacts, null, 2)}\n\nTexto Canônico Determinístico Base:\n${canonicalNarrative}\n\nReorganize o texto mantendo fidelidade absoluta aos fatos acima e retorne o JSON com parágrafos e factIds.`;

    // Note: No temperature, top_p, top_k, candidate_count for Gemini 3.7 Flash
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            paragraphs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: {
                    type: Type.STRING,
                    description: 'Texto do parágrafo refinado apenas linguisticamente.',
                  },
                  factIds: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Lista de IDs dos fatos autorizados correspondentes a este parágrafo.',
                  },
                },
                required: ['text', 'factIds'],
              },
            },
          },
          required: ['paragraphs'],
        },
      },
    });

    const duration = Date.now() - startTime;
    // Log ONLY technical metadata (STRICT PRIVACY: never log patient text, prompt or output)
    console.log(
      JSON.stringify({
        event: 'AI_REFINEMENT_CALL',
        durationMs: duration,
        model: modelName,
        success: true,
      })
    );

    const text = response.text;
    if (!text) {
      throw new Error('Resposta vazia da IA.');
    }

    const parsedJson = JSON.parse(text);

    if (quotaReservation && req.authUser?.uid) {
      await markAiQuotaConsumed(req.authUser.uid, quotaReservation.permitId).catch(() => undefined);
    }

    return res.json({
      success: true,
      result: parsedJson,
      model: modelName,
      source: 'gemini_api',
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const statusCode = error?.status || error?.statusCode || 500;
    const code = error?.code || error?.name || 'API_ERROR';

    console.error(
      JSON.stringify({
        event: 'AI_REFINEMENT_PROVIDER_ERROR',
        durationMs: duration,
        model: modelName,
        success: false,
        statusCode,
        code,
        error: error?.message || 'Unknown error',
      })
    );

    if (quotaReservation && !quotaReservation.alreadyReserved && req.authUser?.uid) {
      await releaseAiQuota(req.authUser.uid, quotaReservation.permitId).catch(() => undefined);
    }

    return res.status(502).json({
      success: false,
      errorType: 'provider_error',
      error: 'Não foi possível realizar o refinamento automático neste momento. A anotação estruturada foi preservada.',
      providerDetails: {
        provider: 'gemini',
        model: modelName,
        statusCode,
        code,
        message: error?.message || 'Erro de comunicação com o provedor de IA.',
      },
    });
  }
});

// Endpoint for AI Copilot - Narrative Improvement
app.post('/api/ai/assistant/improve-narrative', requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Parâmetro text é obrigatório.',
    });
  }

  const ai = getAIClient();
  const modelName = getActiveModelName();

  if (!ai) {
    return res.json({
      success: true,
      improvedText: text,
      source: 'deterministic_fallback',
    });
  }

  let quotaReservation: (QuotaSnapshot & { permitId: string; alreadyReserved: boolean }) | null = null;
  try {
    quotaReservation = await consumeAiQuota(req);
  } catch (quotaError) {
    return quotaErrorResponse(res, quotaError);
  }

  try {
    const assistantPrompt = `Melhore exclusivamente a terminologia técnica de enfermagem e redação da anotação abaixo sem alterar significado, sem inventar fatos, sem criar diagnósticos médicos e sem prescrever medicamentos:\n"${text}"`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: assistantPrompt,
      config: {
        systemInstruction: `Você é um copiloto assistencial de enfermagem. Sua única atribuição é melhorar a linguagem técnica e concordância das anotações dos profissionais. NUNCA crie diagnósticos médicos. NUNCA prescreva medicamentos. NUNCA adicione sinais vitais ou dados clínicos não informados. Retorne um JSON com o campo "improvedText" e "changes" (lista de alterações linguísticas).`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            improvedText: { type: Type.STRING },
            changes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['improvedText'],
        },
      },
    });

    const parsed = response.text ? JSON.parse(response.text) : { improvedText: text, changes: [] };
    if (quotaReservation && req.authUser?.uid) {
      await markAiQuotaConsumed(req.authUser.uid, quotaReservation.permitId).catch(() => undefined);
    }
    return res.json({
      success: true,
      improvedText: parsed.improvedText || text,
      changes: parsed.changes || [],
      source: 'gemini_api',
    });
  } catch (error: any) {
    if (quotaReservation && !quotaReservation.alreadyReserved && req.authUser?.uid) {
      await releaseAiQuota(req.authUser.uid, quotaReservation.permitId).catch(() => undefined);
    }
    return res.status(502).json({
      success: false,
      errorType: 'provider_error',
      improvedText: text,
      source: 'error_fallback',
      error: 'O Assistente IA está temporariamente indisponível. O texto original foi preservado.',
    });
  }
});


// Migração segura e idempotente da assinatura legada para a coleção canônica
app.post('/api/subscriptions/migrate-legacy', requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const db = getAdminDatabase();
    if (!db) throw new Error('Firebase Admin indisponível.');
    const uid = req.authUser!.uid;
    const canonicalRef = db.collection('subscriptions').doc(uid);
    const legacyRef = db.collection('user_subscriptions').doc(uid);

    const result = await db.runTransaction(async (tx) => {
      const [canonicalSnap, legacySnap] = await Promise.all([tx.get(canonicalRef), tx.get(legacyRef)]);
      if (canonicalSnap.exists) return { migrated: false, reason: 'canonical_exists' };
      if (!legacySnap.exists) return { migrated: false, reason: 'legacy_not_found' };

      const legacy = legacySnap.data() || {};
      const ownerId = legacy.userId || legacy.usuarioId;
      if (ownerId !== uid) throw new Error('Assinatura legada não pertence ao usuário autenticado.');

      tx.set(canonicalRef, {
        ...legacy,
        userId: uid,
        usuarioId: uid,
        migratedFrom: 'user_subscriptions',
        migratedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { migrated: true, reason: 'ok' };
    });

    return res.json({ success: true, ...result });
  } catch {
    return res.status(503).json({ success: false, error: 'Não foi possível migrar a assinatura legada agora.' });
  }
});

// Consulta autoritativa de consumo mensal
app.get('/api/quota/current', requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const snapshot = await getQuotaSnapshot(req.authUser!.uid);
    return res.json({ success: true, ...snapshot });
  } catch (error) {
    return quotaErrorResponse(res, error);
  }
});

// Reserva idempotente de uma vaga de documento vinculada a um único atendimento
app.post('/api/quota/documents/reserve', requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  const resourceId = typeof req.body?.resourceId === 'string' ? req.body.resourceId.trim() : '';
  if (!resourceId) {
    return res.status(400).json({ success: false, errorType: 'client_error', error: 'resourceId obrigatório.' });
  }

  try {
    const result = await reserveQuota(req.authUser!.uid, 'document', resourceId, resourceId);
    return res.json({ success: true, ...result });
  } catch (error) {
    return quotaErrorResponse(res, error);
  }
});

// ==========================================
// COMMERCIAL & SUBSCRIPTION INFRASTRUCTURE
// ==========================================

// In-memory idempotency cache for webhooks (prevents duplicate event processing)
const processedWebhookEvents = new Set<string>();

// Endpoint to create checkout session
app.post('/api/checkout/create-session', requireFirebaseAuth, async (req: AuthenticatedRequest, res) => {
  const { planId, returnUrl, cancelUrl } = req.body;
  const userId = req.authUser?.uid || '';
  const userEmail = req.authUser?.email || '';

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'Sessão autenticada obrigatória para iniciar checkout.',
    });
  }

  const gatewayProvider = (process.env.PAYMENT_GATEWAY_PROVIDER || 'NONE').toUpperCase();

  // If no external gateway is officially configured in environment:
  if (gatewayProvider === 'NONE' || !process.env.PAYMENT_GATEWAY_SECRET) {
    return res.json({
      success: false,
      gatewayStatus: 'GATEWAY_EXTERNO_PENDENTE',
      provider: gatewayProvider,
      message:
        'GATEWAY EXTERNO PENDENTE: A contratação comercial direta via gateway de pagamento está em fase de homologação técnica. Em breve novos métodos de pagamento serão disponibilizados.',
    });
  }

  // Future gateway integration hook (Mercado Pago / Stripe)
  return res.json({
    success: false,
    gatewayStatus: 'GATEWAY_EXTERNO_PENDENTE',
    provider: gatewayProvider,
    message: 'GATEWAY EXTERNO PENDENTE: Aguardando credenciais de produção.',
  });
});

// Endpoint for Webhooks (Idempotent, Backend-authoritative, zero clinical data)
app.post('/api/webhooks/subscription', async (req, res) => {
  const eventId = req.headers['x-event-id'] as string || req.body?.id || req.body?.eventId;

  // 1. Idempotency verification
  if (eventId && processedWebhookEvents.has(eventId)) {
    return res.status(200).json({
      success: true,
      idempotent: true,
      message: 'Evento de webhook já processado anteriormente.',
    });
  }

  const signature = req.headers['x-signature'] || req.headers['stripe-signature'];
  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;

  if (webhookSecret && !signature) {
    return res.status(401).json({
      success: false,
      error: 'Assinatura de segurança do webhook ausente.',
    });
  }

  if (eventId) {
    processedWebhookEvents.add(eventId);
    // Limit cache size to 10,000 entries
    if (processedWebhookEvents.size > 10000) {
      const first = processedWebhookEvents.values().next().value;
      if (first) processedWebhookEvents.delete(first);
    }
  }

  // Log minimum non-clinical metadata
  console.log(
    JSON.stringify({
      event: 'WEBHOOK_PROCESSED',
      eventId: eventId || 'anonymous',
      timestamp: new Date().toISOString(),
      provider: process.env.PAYMENT_GATEWAY_PROVIDER || 'NONE',
    })
  );

  return res.status(200).json({
    success: true,
    handled: true,
    message: 'Webhook recebido e registrado com sucesso.',
  });
});

// Endpoint to verify subscription status
app.get('/api/subscriptions/status/:userId', requireFirebaseAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.authUser?.uid || ''; 
  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId obrigatório.' });
  }

  return res.json({
    success: true,
    userId,
    gatewayStatus: process.env.PAYMENT_GATEWAY_PROVIDER ? 'CONFIGURADO' : 'GATEWAY_EXTERNO_PENDENTE',
    time: new Date().toISOString(),
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EvoluiEnf Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
