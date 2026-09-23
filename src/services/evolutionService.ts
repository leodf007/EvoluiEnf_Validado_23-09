import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { EvolucaoDocument } from '../types';
import { PrivacyGuard } from './privacyGuard';

const EVOLUCOES_COLLECTION = 'evolucoes';

// In-memory runtime cache for volatile session storage (zero disk/localStorage persistence of clinical data)
const inMemoryEvolucoes = new Map<string, EvolucaoDocument>();

// Remove any legacy/stale keys from localStorage if present
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    window.localStorage.removeItem('evoluienf_evolucoes_v1');
  } catch {
    // ignore
  }
}

function readMemoryEvolucoes(): EvolucaoDocument[] {
  return Array.from(inMemoryEvolucoes.values()).sort(
    (a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
  );
}

function writeMemoryEvolucao(item: EvolucaoDocument): void {
  inMemoryEvolucoes.set(item.id, item);
}

export class EvolutionService {
  /**
   * Salva uma nova evolução clínica gerada, aplicando as travas do PrivacyGuard.
   * Persiste no Firestore e mantém cache local resiliente.
   */
  static async salvarEvolucao(
    dados: Omit<EvolucaoDocument, 'id' | 'dataCriacao'> & { id?: string; dataCriacao?: string }
  ): Promise<EvolucaoDocument> {
    const sanitizedInitials =
      PrivacyGuard.validateAnonymousIdentifier(dados.identificacao).suggestedInitials ||
      dados.identificacao;

    // Sanitiza qualquer fragmento de texto da narrativa contra PII acidental
    const sanitizedNarrative = PrivacyGuard.maskFullNames(
      PrivacyGuard.sanitizeClinicalInput(dados.narrativa)
    );

    const id = dados.id || `evo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const dataCriacao = dados.dataCriacao || new Date().toISOString();

    const evolucao: EvolucaoDocument = {
      id,
      usuarioId: dados.usuarioId,
      atendimentoId: dados.atendimentoId || '',
      identificacao: sanitizedInitials.toUpperCase(),
      setor: dados.setor || 'Geral',
      tipoRegistro: dados.tipoRegistro,
      moduloId: dados.moduloId || 'CLINICAL_MODULE',
      narrativa: sanitizedNarrative,
      fatosAutorizados: dados.fatosAutorizados,
      dataCriacao,
    };

    // Atualiza cache em memória imediatamente (volátil na sessão atual)
    writeMemoryEvolucao(evolucao);

    // Persiste no Firestore
    try {
      const docRef = doc(db, EVOLUCOES_COLLECTION, id);
      await setDoc(docRef, evolucao);
    } catch (err) {
      console.warn('Falha ao salvar evolução no Firestore, mantida em cache de memória:', err);
    }

    return evolucao;
  }

  /**
   * Lista o histórico de evoluções de um profissional, podendo filtrar por atendimento.
   */
  static async listarHistorico(
    usuarioId: string,
    atendimentoId?: string
  ): Promise<EvolucaoDocument[]> {
    try {
      const q = atendimentoId
        ? query(
            collection(db, EVOLUCOES_COLLECTION),
            where('usuarioId', '==', usuarioId),
            where('atendimentoId', '==', atendimentoId),
            orderBy('dataCriacao', 'desc')
          )
        : query(
            collection(db, EVOLUCOES_COLLECTION),
            where('usuarioId', '==', usuarioId),
            orderBy('dataCriacao', 'desc')
          );

      const snap = await getDocs(q);
      const docs: EvolucaoDocument[] = [];
      snap.forEach((d) => {
        const docData = d.data() as EvolucaoDocument;
        docs.push(docData);
        writeMemoryEvolucao(docData);
      });

      if (docs.length > 0) {
        return docs;
      }
    } catch (err) {
      console.warn('Consulta ao Firestore falhou, usando cache de memória:', err);
    }

    // Fallback: Cache em memória
    const locais = readMemoryEvolucoes().filter((e) => e.usuarioId === usuarioId);
    if (atendimentoId) {
      return locais.filter((e) => e.atendimentoId === atendimentoId);
    }
    return locais;
  }

  /**
   * Recupera uma evolução específica pelo seu ID.
   */
  static async recuperarEvolucao(id: string): Promise<EvolucaoDocument | null> {
    try {
      const docRef = doc(db, EVOLUCOES_COLLECTION, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const docData = snap.data() as EvolucaoDocument;
        writeMemoryEvolucao(docData);
        return docData;
      }
    } catch (err) {
      console.warn(`Erro ao recuperar evolução ${id} no Firestore:`, err);
    }

    const locais = readMemoryEvolucoes();
    return locais.find((e) => e.id === id) || null;
  }

  /**
   * Versão síncrona para acesso rápido da interface.
   */
  static listarHistoricoSync(usuarioId: string, atendimentoId?: string): EvolucaoDocument[] {
    const locais = readMemoryEvolucoes().filter((e) => e.usuarioId === usuarioId);
    if (atendimentoId) {
      return locais.filter((e) => e.atendimentoId === atendimentoId);
    }
    return locais;
  }
}

// Exportações nomeadas para flexibilidade de importação
export const evolutionService = EvolutionService;
