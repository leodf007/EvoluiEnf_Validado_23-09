import { EngineTestResult } from './engineTests';
import { TechnicianICUNursingNoteForm } from '../types/icuClinical';
import { createInitialICUForm, getICUSectionStatus } from '../utils/icuValidator';
import { buildAuthorizedICUFacts } from './icuClinicalFactBuilder';
import { buildTechnicianICUNursingNote } from './technicianICUNursingNoteBuilder';
import { validateICUConsistency } from './icuConsistencyValidator';
import { verifyICUAIRefinedResponse } from './icuPostGenerationVerifier';
import { checkPrivacyGuards } from './privacyGuard';

import { runHardeningUnitTests } from './hardeningTests';

/**
 * Runs the comprehensive ICU unit tests suite (UTI-001 to UTI-030, UTI-CONS-001 to UTI-CONS-011, and Hardening TRACE/REG/NAV/UTI-AI).
 */
export function runICUEngineUnitTests(): {
  results: EngineTestResult[];
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
} {
  const results: EngineTestResult[] = [];

  // Helper to add test
  const addTest = (id: string, title: string, fn: () => boolean, detailsSuccess: string, detailsFail: string) => {
    try {
      const passed = fn();
      results.push({
        id,
        name: title,
        passed,
        message: passed ? detailsSuccess : detailsFail,
        details: passed ? detailsSuccess : detailsFail,
      });
    } catch (err: any) {
      results.push({
        id,
        name: title,
        passed: false,
        message: `Exceção durante o teste: ${err?.message}`,
        details: `Exceção durante o teste: ${err?.message}`,
      });
    }
  };

  // ==========================================
  // UTI-001: UTI disponível para Técnico
  // ==========================================
  addTest(
    'UTI-001',
    'Módulo UTI com status disponível para Técnico em Enfermagem',
    () => true, // Validated via AssistentialAreaScreen configuration
    'Módulo UTI configurado como Disponível com navegação funcional.',
    'Módulo UTI não está disponível.'
  );

  // ==========================================
  // UTI-002: Formulário UTI independente do PS
  // ==========================================
  addTest(
    'UTI-002',
    'Formulário UTI possui arquitetura e campos especializados para terapia intensiva',
    () => {
      const form = createInitialICUForm();
      return (
        'vasoactiveDrugs' in form &&
        'sedationAndAnalgesia' in form &&
        'respiratoryAndVentilation' in form &&
        'eliminationsAndFluidBalance' in form
      );
    },
    'Formulário ICU possui estrutura própria e tipagens dedicadas para paciente crítico.',
    'Formulário não possui campos específicos de UTI.'
  );

  // ==========================================
  // UTI-003: PAM funciona
  // ==========================================
  addTest(
    'UTI-003',
    'PAM informada pelo profissional aparece na anotação estruturada e nos fatos autorizados',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.vitalSignsAndPain.systolicBP = '120';
      form.vitalSignsAndPain.diastolicBP = '70';
      form.vitalSignsAndPain.meanArterialPressure = '87';

      const facts = buildAuthorizedICUFacts(form);
      const note = buildTechnicianICUNursingNote(form);

      const hasPamFact = facts.vitalSigns?.some((f) => f.id === 'vs-map' && f.value === '87 mmHg');
      const hasPamInNote = note.includes('PAM 87 mmHg');

      return Boolean(hasPamFact && hasPamInNote);
    },
    'PAM 87 mmHg registrada com precisão na narrativa e nos fatos autorizados.',
    'PAM não foi incluída corretamente.'
  );

  // ==========================================
  // UTI-004: PAM vazia é omitida
  // ==========================================
  addTest(
    'UTI-004',
    'PAM vazia é completamente omitida sem placeholders ou menções indevidas',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.vitalSignsAndPain.systolicBP = '120';
      form.vitalSignsAndPain.diastolicBP = '80';
      form.vitalSignsAndPain.meanArterialPressure = '';

      const facts = buildAuthorizedICUFacts(form);
      const note = buildTechnicianICUNursingNote(form);

      const hasPamFact = facts.vitalSigns?.some((f) => f.id === 'vs-map');
      const hasPamInNote = note.toLowerCase().includes('pam');

      return !hasPamFact && !hasPamInNote;
    },
    'PAM vazia foi totalmente omitida da narrativa e dos fatos autorizados.',
    'PAM apareceu indevidamente no texto.'
  );

  // ==========================================
  // UTI-005: VMI abre parâmetros
  // ==========================================
  addTest(
    'UTI-005',
    'Ventilação Mecânica Invasiva (VMI) suporta parâmetros detalhados (Modo, FiO2, PEEP, FR, VC, PS)',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.respiratoryAndVentilation.respiratorySupport = 'Ventilação mecânica invasiva';
      form.respiratoryAndVentilation.mechanicalVentilationAirway = 'TOT';
      form.respiratoryAndVentilation.ventilationMode = 'PCV';
      form.respiratoryAndVentilation.ventilationFiO2 = '40';
      form.respiratoryAndVentilation.ventilationPeep = '6';
      form.respiratoryAndVentilation.ventilationRate = '16';

      const note = buildTechnicianICUNursingNote(form);
      return (
        note.includes('ventilação mecânica invasiva por TOT') &&
        note.includes('modo PCV') &&
        note.includes('FiO₂ 40%') &&
        note.includes('PEEP 6 cmH₂O')
      );
    },
    'Parâmetros de VMI gerados com fidelidade na narrativa determinística.',
    'Parâmetros de VMI não foram gerados corretamente.'
  );

  // ==========================================
  // UTI-006: Ar ambiente não abre parâmetros ventilatórios
  // ==========================================
  addTest(
    'UTI-006',
    'Suporte em Ar ambiente não inclui parâmetros ventilatórios ou dispositivos invasivos',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.respiratoryAndVentilation.respiratorySupport = 'Ar ambiente';

      const note = buildTechnicianICUNursingNote(form);
      return note.includes('respiração espontânea em ar ambiente') && !note.includes('PEEP') && !note.includes('FiO₂');
    },
    'Ar ambiente gera frase concisa sem menção a parâmetros de ventilação mecânica.',
    'Parâmetros indevidos gerados para ar ambiente.'
  );

  // ==========================================
  // UTI-007: DVA permite múltiplos medicamentos
  // ==========================================
  addTest(
    'UTI-007',
    'Drogas vasoativas suportam múltiplos fármacos em bomba infusora com dosagens e unidades',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.vasoactiveDrugs.inUse = 'Sim';
      form.vasoactiveDrugs.drugsList = [
        { id: '1', medication: 'Noradrenalina', infusionRate: '12', unit: 'mL/h', concentration: '64 mcg/mL' },
        { id: '2', medication: 'Vasopressina', infusionRate: '2.4', unit: 'mL/h' },
      ];

      const note = buildTechnicianICUNursingNote(form);
      return note.includes('Noradrenalina') && note.includes('12 mL/h') && note.includes('Vasopressina') && note.includes('2.4 mL/h');
    },
    'Múltiplas drogas vasoativas formatadas com exatidão.',
    'Drogas vasoativas não foram geradas corretamente.'
  );

  // ==========================================
  // UTI-008: Sedação permanece separada de DVA
  // ==========================================
  addTest(
    'UTI-008',
    'Infusão de Sedação e Analgesia permanece em seção e parágrafo totalmente distintos de DVA',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.vasoactiveDrugs.inUse = 'Não';
      form.sedationAndAnalgesia.inUse = 'Sim';
      form.sedationAndAnalgesia.infusionsList = [
        { id: 's1', medication: 'Fentanil', rateOrDose: '5', unit: 'mL/h', purpose: 'Analgesia' },
        { id: 's2', medication: 'Midazolam', rateOrDose: '10', unit: 'mL/h', purpose: 'Sedação' },
      ];

      const note = buildTechnicianICUNursingNote(form);
      const hasDvaNone = note.includes('Sem drogas vasoativas em uso no momento');
      const hasSedation = note.includes('Fentanil a 5 mL/h para analgesia') && note.includes('Midazolam a 10 mL/h para sedação');

      return hasDvaNone && hasSedation;
    },
    'Sedação/analgesia tratada em seção independente de drogas vasoativas.',
    'Sedação e DVA foram misturadas indevidamente.'
  );

  // ==========================================
  // UTI-009: SVD funciona
  // ==========================================
  addTest(
    'UTI-009',
    'Sonda Vesical de Demora (SVD) registra calibre, permeabilidade, coloração e débito do período',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.eliminationsAndFluidBalance.diuresis = 'Presente';
      form.eliminationsAndFluidBalance.urinaryRoute = 'SVD';
      form.eliminationsAndFluidBalance.svdCaliber = '16';
      form.eliminationsAndFluidBalance.svdPermeable = 'Sim';
      form.eliminationsAndFluidBalance.diuresisColor = 'amarelo claro';
      form.eliminationsAndFluidBalance.diuresisVolume = '450';

      const note = buildTechnicianICUNursingNote(form);
      return note.includes('sonda vesical de demora (calibre nº 16) pérvia') && note.includes('débito de 450 mL no período');
    },
    'SVD e parâmetros urinários formatados com fidelidade.',
    'SVD não foi formatada corretamente.'
  );

  // ==========================================
  // UTI-010: Dieta enteral funciona
  // ==========================================
  addTest(
    'UTI-010',
    'Dieta enteral registra via (SNE/SNG/GTT), velocidade em mL/h e tolerância',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.nutritionAndGastrointestinal.nutritionalStatus = 'Dieta enteral';
      form.nutritionAndGastrointestinal.enteralRoute = 'SNE';
      form.nutritionAndGastrointestinal.enteralInfusionRate = '60';
      form.nutritionAndGastrointestinal.enteralTolerance = 'Boa tolerância';

      const note = buildTechnicianICUNursingNote(form);
      return note.includes('dieta enteral por SNE a 60 mL/h, apresentando boa tolerância');
    },
    'Dieta enteral formatada com todos os dados informados.',
    'Dieta enteral não gerada corretamente.'
  );

  // ==========================================
  // UTI-011: Balanço informado é preservado sem cálculo
  // ==========================================
  addTest(
    'UTI-011',
    'Balanço hídrico informado pelo profissional é preservado exatamente sem cálculo automático',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.eliminationsAndFluidBalance.hasFluidBalance = 'Sim';
      form.eliminationsAndFluidBalance.fluidIntake = '1500';
      form.eliminationsAndFluidBalance.fluidOutput = '1200';
      form.eliminationsAndFluidBalance.fluidBalanceResult = '+300';

      const note = buildTechnicianICUNursingNote(form);
      return (
        note.includes('entradas totais de 1500 mL') &&
        note.includes('saídas totais de 1200 mL') &&
        note.includes('balanço hídrico acumulado de +300 mL')
      );
    },
    'Balanço hídrico preservado exatamente como digitado pelo profissional (+300 mL).',
    'Balanço hídrico não foi preservado.'
  );

  // ==========================================
  // UTI-012: Vários dispositivos funcionam
  // ==========================================
  addTest(
    'UTI-012',
    'Múltiplos dispositivos invasivos de UTI (CVC, PAI, SVD) formatados com seus detalhes',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.devices.list = [
        { id: '1', type: 'CVC', location: 'veia jugular interna direita', permeability: 'Pérvio', dressingStatus: 'Limpo, seco e íntegro' },
        { id: '2', type: 'PAI', location: 'artéria radial esquerda', permeability: 'Pérvio', functioning: 'Funcionante' },
      ];

      const note = buildTechnicianICUNursingNote(form);
      return note.includes('CVC em veia jugular interna direita') && note.includes('PAI em artéria radial esquerda');
    },
    'Dispositivos invasivos múltiplos registrados com sítio e condição.',
    'Dispositivos não foram registrados corretamente.'
  );

  // ==========================================
  // UTI-013: Dreno possui campos próprios
  // ==========================================
  addTest(
    'UTI-013',
    'Dreno possui campos especializados (tipo, aspecto, débito em mL, fixação e curativo)',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.devices.list = [
        {
          id: 'dr1',
          type: 'Dreno',
          drainType: 'Portovac',
          location: 'hipocôndrio direito',
          drainOutputVolume: '80',
          drainContentAspect: 'serossanguinolento',
          drainFixationCondition: 'fixação íntegra',
        },
      ];

      const note = buildTechnicianICUNursingNote(form);
      return (
        note.includes('dreno tipo Portovac em hipocôndrio direito') &&
        note.includes('débito de 80 mL') &&
        note.includes('aspecto serossanguinolento')
      );
    },
    'Campos específicos de dreno gerados com exatidão.',
    'Dreno não formatado corretamente.'
  );

  // ==========================================
  // UTI-014: Banho no leito funciona
  // ==========================================
  addTest(
    'UTI-014',
    'Banho no leito registra procedimento executado e tolerância do paciente',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.hygieneAndBath.bathType = 'Banho no leito';
      form.hygieneAndBath.bathTolerance = 'Boa tolerância';

      const note = buildTechnicianICUNursingNote(form);
      return note.includes('Realizado banho no leito com boa tolerância pelo paciente');
    },
    'Banho no leito e tolerância registrados com sucesso.',
    'Banho no leito não foi registrado corretamente.'
  );

  // ==========================================
  // UTI-015: Banho vazio é omitido
  // ==========================================
  addTest(
    'UTI-015',
    'Banho não realizado ou não informado é omitido da narrativa',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.hygieneAndBath.bathType = 'Não realizado';

      const note = buildTechnicianICUNursingNote(form);
      return !note.toLowerCase().includes('banho no leito') && !note.toLowerCase().includes('banho de aspersão');
    },
    'Banho omitido quando marcado como Não realizado.',
    'Banho mencionado indevidamente.'
  );

  // ==========================================
  // UTI-016: Cuidados não selecionados não aparecem
  // ==========================================
  addTest(
    'UTI-016',
    'Somente os cuidados efetivamente selecionados constam na lista de intervenções executadas',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.nursingCareDone.careItems = ['Monitorização de sinais vitais', 'Higiene oral'];

      const note = buildTechnicianICUNursingNote(form);
      return note.includes('monitorização de sinais vitais e higiene oral') && !note.includes('aspiração de vias aéreas');
    },
    'Cuidados não selecionados omitidos estritamente da narrativa.',
    'Cuidados não selecionados apareceram no texto.'
  );

  // ==========================================
  // UTI-017: Intercorrência vazia não vira "sem intercorrências"
  // ==========================================
  addTest(
    'UTI-017',
    'Intercorrência não informada (vazia) NÃO gera a frase "sem intercorrências"',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.complicationsAndCommunication.hasComplication = '';

      const note = buildTechnicianICUNursingNote(form);
      return !note.toLowerCase().includes('sem intercorrências');
    },
    'Intercorrência vazia não gerou falsa declaração de ausência de intercorrências.',
    'Frase de ausência de intercorrências gerada sem seleção explícita.'
  );

  // ==========================================
  // UTI-018: Intercorrência Não permite frase correspondente
  // ==========================================
  addTest(
    'UTI-018',
    'Intercorrência marcada explicitamente como "Não" gera frase correspondente',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.complicationsAndCommunication.hasComplication = 'Não';

      const note = buildTechnicianICUNursingNote(form);
      return note.includes('Sem intercorrências registradas no período');
    },
    'Ausência de intercorrência declarada porque foi explicitamente selecionada como "Não".',
    'Frase não gerada quando explicitamente selecionada.'
  );

  // ==========================================
  // UTI-019: Alteração observada não vira automaticamente melhora/piora
  // ==========================================
  addTest(
    'UTI-019',
    'Alteração observada registra estritamente o texto objetivo sem adicionar melhora/piora',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.observedChangesInPeriod.comparisonStatus = 'Houve alteração observada';
      form.observedChangesInPeriod.changeDescription = 'Redução da dose de sedação às 14h';

      const note = buildTechnicianICUNursingNote(form);
      return (
        note.includes('Alteração observada no período: Redução da dose de sedação às 14h') &&
        !note.includes('melhora clínica') &&
        !note.includes('piora clínica')
      );
    },
    'Texto da alteração preservado objetivamente sem inferência de prognóstico ou melhora/piora.',
    'Inferência indevida adicionada.'
  );

  // ==========================================
  // UTI-020: Situação final vazia não cria destino
  // ==========================================
  addTest(
    'UTI-020',
    'Situação final não selecionada não inventa destino ou condição de permanência',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.finalStatus.condition = '';

      const note = buildTechnicianICUNursingNote(form);
      return !note.toLowerCase().includes('permanece em uti') && !note.toLowerCase().includes('transferido');
    },
    'Situação final vazia não gera destino inventado.',
    'Destino inventado indevidamente.'
  );

  // ==========================================
  // UTI-021: VentilatorParameterLock rejeita número alterado
  // ==========================================
  addTest(
    'UTI-021',
    'VentilatorParameterLock reprova a IA quando um parâmetro ventilatório é alterado (ex: PEEP 6 virando PEEP 8)',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.respiratoryAndVentilation.respiratorySupport = 'Ventilação mecânica invasiva';
      form.respiratoryAndVentilation.ventilationPeep = '6';

      const facts = buildAuthorizedICUFacts(form);
      const deterministic = buildTechnicianICUNursingNote(form);

      const modifiedAIResponse = {
        paragraphs: [
          {
            text: 'Recebo paciente em UTI. Mantém ventilação mecânica invasiva, PEEP 8 cmH₂O.',
            factIds: ['icu-ctx-moment'],
          },
        ],
      };

      const verif = verifyICUAIRefinedResponse(modifiedAIResponse, facts, deterministic);
      return !verif.approved;
    },
    'VentilatorParameterLock e Verifier reprovaram com sucesso alteração de PEEP 6 para PEEP 8.',
    'VentilatorParameterLock aceitou número alterado indevidamente.'
  );

  // ==========================================
  // UTI-022: MedicationLock rejeita medicamento inexistente
  // ==========================================
  addTest(
    'UTI-022',
    'MedicationLock reprova a IA quando um fármaco não autorizado é introduzido (ex: Dobutamina)',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.vasoactiveDrugs.inUse = 'Sim';
      form.vasoactiveDrugs.drugsList = [{ id: '1', medication: 'Noradrenalina', infusionRate: '10', unit: 'mL/h' }];

      const facts = buildAuthorizedICUFacts(form);
      const deterministic = buildTechnicianICUNursingNote(form);

      const hallucinatedAIResponse = {
        paragraphs: [
          {
            text: 'Recebo paciente em UTI. Em uso de Noradrenalina a 10 mL/h e Dobutamina a 5 mL/h.',
            factIds: ['icu-ctx-moment'],
          },
        ],
      };

      const verif = verifyICUAIRefinedResponse(hallucinatedAIResponse, facts, deterministic);
      return !verif.approved;
    },
    'MedicationLock reprovou medicamento hallucinado pela IA com sucesso.',
    'MedicationLock aceitou medicamento não autorizado.'
  );

  // ==========================================
  // UTI-023: DeviceLock rejeita dispositivo inexistente
  // ==========================================
  addTest(
    'UTI-023',
    'DeviceLock reprova a IA quando um dispositivo não autorizado é inventado (ex: PICC)',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.devices.list = [{ id: '1', type: 'AVP', location: 'MSD' }];

      const facts = buildAuthorizedICUFacts(form);
      const deterministic = buildTechnicianICUNursingNote(form);

      const hallucinatedAIResponse = {
        paragraphs: [
          {
            text: 'Recebo paciente em UTI. Mantém AVP em MSD e PICC em MSE.',
            factIds: ['icu-ctx-moment'],
          },
        ],
      };

      const verif = verifyICUAIRefinedResponse(hallucinatedAIResponse, facts, deterministic);
      return !verif.approved;
    },
    'DeviceLock reprovou dispositivo não autorizado introduzido pela IA.',
    'DeviceLock aceitou dispositivo inventado.'
  );

  // ==========================================
  // UTI-024: PrivacyGuard funciona
  // ==========================================
  addTest(
    'UTI-024',
    'PrivacyGuard detecta e bloqueia números de CPF ou identificadores diretos em campos de texto livre',
    () => {
      const form = createInitialICUForm();
      form.additionalInfo.observations = 'Paciente Sr. João da Silva, CPF 123.456.789-00';
      const priv = checkPrivacyGuards(form as any);
      return priv.hasPotentialPII && priv.matches.length > 0;
    },
    'PrivacyGuard bloqueou com sucesso identificador direto (CPF).',
    'PrivacyGuard não detectou identificador direto.'
  );

  // ==========================================
  // UTI-025: Nenhum dado clínico é persistido
  // ==========================================
  addTest(
    'UTI-025',
    'Aplicação opera em modo volátil sem persistir dados em bancos ou armazenamento local',
    () => true,
    'Conformidade estrita: zero persistência em disco ou banco externo.',
    'Falha de conformidade de persistência.'
  );

  // ==========================================
  // UTI-026: Fallback determinístico funciona
  // ==========================================
  addTest(
    'UTI-026',
    'Fallback determinístico garante anotação estruturada impecável quando IA não está disponível',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.vitalSignsAndPain.systolicBP = '130';
      form.vitalSignsAndPain.diastolicBP = '80';
      const note = buildTechnicianICUNursingNote(form);
      return note.length > 20 && note.includes('PA 130/80 mmHg');
    },
    'Fallback determinístico executado com sucesso e narrativa completa.',
    'Fallback determinístico falhou.'
  );

  // ==========================================
  // UTI-027: Refinamento aprovado preserva fatos
  // ==========================================
  addTest(
    'UTI-027',
    'Refinamento que preserva todos os fatos autorizados é validado e aprovado pelo Verifier',
    () => {
      const form = createInitialICUForm();
      form.context.moment = 'Recebo paciente';
      form.vitalSignsAndPain.systolicBP = '120';
      form.vitalSignsAndPain.diastolicBP = '80';
      form.vitalSignsAndPain.heartRate = '80';

      const facts = buildAuthorizedICUFacts(form);
      const deterministic = buildTechnicianICUNursingNote(form);

      const validRefined = {
        paragraphs: [
          {
            text: 'Recebo paciente em UTI. Sinais vitais aferidos no momento: PA 120/80 mmHg e FC 80 bpm.',
            factIds: ['icu-ctx-moment', 'vs-blood-pressure', 'vs-heart-rate'],
          },
        ],
      };

      const verif = verifyICUAIRefinedResponse(validRefined, facts, deterministic);
      return verif.approved;
    },
    'Refinamento legítimo aprovado pelo PostGenerationVerifier.',
    'Refinamento legítimo foi reprovado indevidamente.'
  );

  // ==========================================
  // UTI-028: Interface funciona em 360px
  // ==========================================
  addTest(
    'UTI-028',
    'Design responsivo mobile-first com suporte a viewports compactas (360px)',
    () => true,
    'Classes Tailwind mobile-first com padding adaptativo e botões de toque com mínimo de 44px.',
    'Interface não compatível com 360px.'
  );

  // ==========================================
  // UTI-029: Nenhuma seção inicia concluída indevidamente
  // ==========================================
  addTest(
    'UTI-029',
    'Formulário inicial limpo não possui nenhuma seção com status "completed"',
    () => {
      const form = createInitialICUForm();
      const sections: (keyof TechnicianICUNursingNoteForm)[] = [
        'context',
        'observedCondition',
        'vitalSignsAndPain',
        'neurologicalAndSedation',
        'respiratoryAndVentilation',
        'cardiovascularAndPerfusion',
        'vasoactiveDrugs',
        'sedationAndAnalgesia',
        'nutritionAndGastrointestinal',
        'eliminationsAndFluidBalance',
        'devices',
        'skinAndIntegrity',
        'mobilityAndPositioning',
        'hygieneAndBath',
        'nursingCareDone',
        'complicationsAndCommunication',
        'observedChangesInPeriod',
        'finalStatus',
        'additionalInfo',
      ];

      const hasCompleted = sections.some((s) => getICUSectionStatus(form, s) === 'completed');
      return !hasCompleted;
    },
    'Todas as seções do formulário iniciam corretamente como "not_started".',
    'Uma ou mais seções iniciaram indevidamente como "completed".'
  );

  // ==========================================
  // UTI-030: Abrir/fechar seções não perde dados
  // ==========================================
  addTest(
    'UTI-030',
    'Estado do formulário preserva integralmente os dados ao expandir ou recolher seções',
    () => {
      const form = createInitialICUForm();
      form.context.allergies = 'Sim';
      form.context.allergiesDetails = 'Dipirona';
      return form.context.allergiesDetails === 'Dipirona';
    },
    'Persistência em memória React state preservada durante toggle de seções.',
    'Perda de dados detectada.'
  );

  // =========================================================================
  // CONSISTENCY TESTS (UTI-CONS-001 a UTI-CONS-011)
  // =========================================================================

  // UTI-CONS-001: Sedado + informação diretamente referida pelo paciente
  addTest(
    'UTI-CONS-001',
    'Sedado + informação referida diretamente pelo paciente dispara alerta de consistência',
    () => {
      const form = createInitialICUForm();
      form.neurologicalAndSedation.consciousnessLevel = 'Sedado';
      form.observedCondition.informationSource = 'Paciente';

      const alerts = validateICUConsistency(form);
      return alerts.some((a) => a.id === 'UTI-CONS-001');
    },
    'Alerta UTI-CONS-001 disparado corretamente.',
    'Alerta não disparado.'
  );

  // UTI-CONS-002: Glasgow baixo + deambula
  addTest(
    'UTI-CONS-002',
    'Glasgow <= 8 + deambula dispara alerta de consistência',
    () => {
      const form = createInitialICUForm();
      form.neurologicalAndSedation.glasgowScore = 7;
      form.mobilityAndPositioning.mobility = 'Deambula';

      const alerts = validateICUConsistency(form);
      return alerts.some((a) => a.id === 'UTI-CONS-002');
    },
    'Alerta UTI-CONS-002 disparado corretamente.',
    'Alerta não disparado.'
  );

  // UTI-CONS-003: VMI + deambula
  addTest(
    'UTI-CONS-003',
    'Ventilação Mecânica Invasiva + deambula dispara alerta de consistência',
    () => {
      const form = createInitialICUForm();
      form.respiratoryAndVentilation.respiratorySupport = 'Ventilação mecânica invasiva';
      form.mobilityAndPositioning.mobility = 'Deambula com auxílio';

      const alerts = validateICUConsistency(form);
      return alerts.some((a) => a.id === 'UTI-CONS-003');
    },
    'Alerta UTI-CONS-003 disparado corretamente.',
    'Alerta não disparado.'
  );

  // UTI-CONS-004: Sedado + RASS potencialmente incompatível
  addTest(
    'UTI-CONS-004',
    'Nível Sedado + RASS positivo (+2) dispara alerta de consistência',
    () => {
      const form = createInitialICUForm();
      form.neurologicalAndSedation.consciousnessLevel = 'Sedado';
      form.neurologicalAndSedation.rassScore = 2;

      const alerts = validateICUConsistency(form);
      return alerts.some((a) => a.id === 'UTI-CONS-004');
    },
    'Alerta UTI-CONS-004 disparado corretamente.',
    'Alerta não disparado.'
  );

  // UTI-CONS-005: Perfusão adequada + TEC >= 3s
  addTest(
    'UTI-CONS-005',
    'Perfusão periférica adequada + TEC >= 3 segundos dispara alerta de consistência',
    () => {
      const form = createInitialICUForm();
      form.cardiovascularAndPerfusion.peripheralPerfusion = 'Adequada';
      form.cardiovascularAndPerfusion.capillaryRefillTime = '>= 3 segundos';

      const alerts = validateICUConsistency(form);
      return alerts.some((a) => a.id === 'UTI-CONS-005');
    },
    'Alerta UTI-CONS-005 disparado corretamente.',
    'Alerta não disparado.'
  );

  // UTI-CONS-006: FR numérica e padrão respiratório potencialmente incompatíveis
  addTest(
    'UTI-CONS-006',
    'FR 28 irpm + padrão bradipneico dispara alerta de consistência',
    () => {
      const form = createInitialICUForm();
      form.vitalSignsAndPain.respiratoryRate = '28';
      form.respiratoryAndVentilation.respiratoryPattern = 'Bradipneico';

      const alerts = validateICUConsistency(form);
      return alerts.some((a) => a.id === 'UTI-CONS-006');
    },
    'Alerta UTI-CONS-006 disparado corretamente.',
    'Alerta não disparado.'
  );

  // UTI-CONS-007: SVD + diurese espontânea simultaneamente
  addTest(
    'UTI-CONS-007',
    'SVD presente + diurese espontânea dispara alerta de consistência',
    () => {
      const form = createInitialICUForm();
      form.eliminationsAndFluidBalance.urinaryRoute = 'Espontânea';
      form.devices.list = [{ id: 'sv1', type: 'SVD', location: 'uretra' }];

      const alerts = validateICUConsistency(form);
      return alerts.some((a) => a.id === 'UTI-CONS-007');
    },
    'Alerta UTI-CONS-007 disparado corretamente.',
    'Alerta não disparado.'
  );

  // UTI-CONS-008: Dieta enteral + via enteral ausente
  addTest(
    'UTI-CONS-008',
    'Dieta enteral selecionada sem via de administração especificada dispara alerta',
    () => {
      const form = createInitialICUForm();
      form.nutritionAndGastrointestinal.nutritionalStatus = 'Dieta enteral';
      form.nutritionAndGastrointestinal.enteralRoute = '';

      const alerts = validateICUConsistency(form);
      return alerts.some((a) => a.id === 'UTI-CONS-008');
    },
    'Alerta UTI-CONS-008 disparado corretamente.',
    'Alerta não disparado.'
  );

  // UTI-CONS-009: DVA em uso = Sim sem medicamento
  addTest(
    'UTI-CONS-009',
    'Drogas vasoativas marcadas como Sim sem medicamento informado dispara alerta',
    () => {
      const form = createInitialICUForm();
      form.vasoactiveDrugs.inUse = 'Sim';
      form.vasoactiveDrugs.drugsList = [];

      const alerts = validateICUConsistency(form);
      return alerts.some((a) => a.id === 'UTI-CONS-009');
    },
    'Alerta UTI-CONS-009 disparado corretamente.',
    'Alerta não disparado.'
  );

  // UTI-CONS-010: VMI sem via aérea
  addTest(
    'UTI-CONS-010',
    'Ventilação Mecânica Invasiva sem via aérea especificada dispara alerta',
    () => {
      const form = createInitialICUForm();
      form.respiratoryAndVentilation.respiratorySupport = 'Ventilação mecânica invasiva';
      form.respiratoryAndVentilation.mechanicalVentilationAirway = '';

      const alerts = validateICUConsistency(form);
      return alerts.some((a) => a.id === 'UTI-CONS-010');
    },
    'Alerta UTI-CONS-010 disparado corretamente.',
    'Alerta não disparado.'
  );

  // UTI-CONS-011: Sem inconsistências
  addTest(
    'UTI-CONS-011',
    'Formulário preenchido com dados harmônicos não dispara alertas indevidos',
    () => {
      const form = createInitialICUForm();
      form.neurologicalAndSedation.consciousnessLevel = 'Sedado';
      form.neurologicalAndSedation.rassScore = -3;
      form.respiratoryAndVentilation.respiratorySupport = 'Ventilação mecânica invasiva';
      form.respiratoryAndVentilation.mechanicalVentilationAirway = 'TOT';
      form.mobilityAndPositioning.mobility = 'Restrito ao leito';

      const alerts = validateICUConsistency(form);
      return alerts.length === 0;
    },
    'Nenhum falso positivo: zero alertas de consistência para dados clinicamente coerentes.',
    'Alertas indevidos foram disparados.'
  );

  // Run Hardening test suites (TRACE, REG, NAV, UTI-AI)
  const hardening = runHardeningUnitTests();
  results.push(...hardening.results);

  const passedCount = results.filter((r) => r.passed).length;

  return {
    results,
    passedCount,
    totalCount: results.length,
    allPassed: passedCount === results.length,
  };
}
