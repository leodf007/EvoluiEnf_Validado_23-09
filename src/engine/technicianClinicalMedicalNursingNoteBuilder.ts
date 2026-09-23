import { AuthorizedClinicalFacts, ClinicalFact } from './types';
import {
  auditDeterministicNarrative,
  AuditResult,
  NarrativeFactTrace,
} from './deterministicNarrativeFactAuditor';

export interface GeneratedNarrativeWithTraces {
  narrative: string;
  traces: NarrativeFactTrace[];
  auditResult: AuditResult;
}

/**
 * TechnicianClinicalMedicalNursingNoteBuilder
 * 
 * Strict Builder for Nursing Technician notes in Clinical Medical Inpatient Ward.
 * 
 * CRITICAL ARCHITECTURAL CONSTRAINTS:
 * 1. Consumes ONLY AuthorizedClinicalFacts.
 * 2. PROHIBITED from accessing rawForm.
 * 3. Emits individual traceable segments with explicit factIds: { text, factIds }.
 * 4. Passes all emitted segments through DeterministicNarrativeFactAuditor.
 * 5. Uses strictly factual, objective nursing technician vocabulary.
 * 6. No nursing diagnoses, no nursing prescriptions, no clinical severity extrapolation.
 */
export class TechnicianClinicalMedicalNursingNoteBuilder {
  /**
   * Generates the deterministic nursing note strictly from AuthorizedClinicalFacts.
   */
  public static build(facts: AuthorizedClinicalFacts): GeneratedNarrativeWithTraces {
    const traces: NarrativeFactTrace[] = [];

    // ==========================================
    // 1. Context & Identification
    // ==========================================
    const ctxFacts = facts.context || [];
    const momentFact = ctxFacts.find((f) => f.id === 'ctx-moment');
    const locationFact = ctxFacts.find((f) => f.id === 'ctx-location');
    const accFact = ctxFacts.find((f) => f.id === 'ctx-accompaniment');
    const wristFact = ctxFacts.find((f) => f.id === 'ctx-wristband');
    const bedFact = ctxFacts.find((f) => f.id === 'ctx-bedsign');
    const precFact = ctxFacts.find((f) => f.id === 'ctx-precaution');

    if (momentFact || locationFact) {
      const parts: string[] = [];
      const factIds: string[] = [];

      if (momentFact) {
        parts.push(String(momentFact.value));
        factIds.push(momentFact.id);
      }
      if (locationFact) {
        parts.push(`em ${String(locationFact.value)}`);
        factIds.push(locationFact.id);
      }
      if (accFact) {
        parts.push(
          String(accFact.value).toLowerCase() === 'desacompanhado'
            ? 'desacompanhado'
            : `acompanhado por ${String(accFact.value).toLowerCase()}`
        );
        factIds.push(accFact.id);
      }

      traces.push({
        text: `${parts.join(' ')}.`,
        factIds,
        category: 'context',
      });
    }

    // Identificação do paciente
    const idParts: string[] = [];
    const idFactIds: string[] = [];
    if (wristFact) {
      idParts.push('pulseira de identificação conferida');
      idFactIds.push(wristFact.id);
    }
    if (bedFact) {
      idParts.push('identificação no leito conferida');
      idFactIds.push(bedFact.id);
    }
    if (idParts.length > 0) {
      traces.push({
        text: `Identificação checada: ${idParts.join(' e ')}.`,
        factIds: idFactIds,
        category: 'context',
      });
    }

    // Precaução
    if (precFact) {
      traces.push({
        text: `Precaução adotada: ${String(precFact.value)}.`,
        factIds: [precFact.id],
        category: 'context',
      });
    }

    // ==========================================
    // 2. General Assessment & Neurological state
    // ==========================================
    const genFacts = facts.general || [];
    const stateFact = genFacts.find((f) => f.id === 'gen-observed-state');
    const compFact = genFacts.find((f) => f.id === 'gen-complaints');
    const srcFact = genFacts.find((f) => f.id === 'gen-source');
    const hygFact = genFacts.find((f) => f.id === 'gen-hygiene');
    const mobFact = genFacts.find((f) => f.id === 'gen-mobility');

    if (stateFact || compFact || mobFact) {
      const genParts: string[] = [];
      const genFactIds: string[] = [];

      if (stateFact) {
        genParts.push(`Encontra-se ${String(stateFact.value)}`);
        genFactIds.push(stateFact.id);
      }
      if (compFact) {
        const cVal = String(compFact.value);
        if (cVal === 'sem queixas referidas') {
          const informant = srcFact ? ` pelo ${String(srcFact.value)}` : '';
          genParts.push(`sem queixas referidas no momento${informant}`);
        } else {
          genParts.push(cVal);
        }
        genFactIds.push(compFact.id);
        if (srcFact) genFactIds.push(srcFact.id);
      }
      if (mobFact) {
        genParts.push(`apresenta mobilidade: ${String(mobFact.value)}`);
        genFactIds.push(mobFact.id);
      }

      if (genParts.length > 0) {
        traces.push({
          text: `${genParts.join(', ')}.`,
          factIds: genFactIds,
          category: 'general',
        });
      }
    }

    if (hygFact) {
      traces.push({
        text: `Condição de higiene: ${String(hygFact.value)}.`,
        factIds: [hygFact.id],
        category: 'general',
      });
    }

    // ==========================================
    // 3. Vital Signs
    // ==========================================
    const vsFacts = facts.vitalSigns || [];
    if (vsFacts.length > 0) {
      const vsTexts: string[] = [];
      const vsFactIds: string[] = [];

      vsFacts.forEach((f) => {
        if (f.id === 'vs-bp') {
          vsTexts.push(`PA: ${f.value} mmHg`);
          vsFactIds.push(f.id);
        } else if (f.id === 'vs-map') {
          vsTexts.push(`PAM (aferida): ${f.value} mmHg`);
          vsFactIds.push(f.id);
        } else if (f.id === 'vs-hr') {
          vsTexts.push(`FC: ${f.value} bpm`);
          vsFactIds.push(f.id);
        } else if (f.id === 'vs-rr') {
          vsTexts.push(`FR: ${f.value} irpm`);
          vsFactIds.push(f.id);
        } else if (f.id === 'vs-spo2') {
          vsTexts.push(`SpO2: ${f.value}%`);
          vsFactIds.push(f.id);
        } else if (f.id === 'vs-temp') {
          vsTexts.push(`Temp: ${f.value} °C`);
          vsFactIds.push(f.id);
        } else if (f.id === 'vs-glucose') {
          vsTexts.push(`Glicemia capilar: ${f.value} mg/dL`);
          vsFactIds.push(f.id);
        }
      });

      if (vsTexts.length > 0) {
        traces.push({
          text: `Sinais vitais aferidos: ${vsTexts.join(', ')}.`,
          factIds: vsFactIds,
          category: 'vitalSigns',
        });
      }
    }

    // ==========================================
    // 4. Pain
    // ==========================================
    const painFacts = facts.pain || [];
    const pStatus = painFacts.find((f) => f.id === 'pain-status');
    const pScore = painFacts.find((f) => f.id === 'pain-score');
    const pLoc = painFacts.find((f) => f.id === 'pain-location');

    if (pStatus || pScore) {
      const pFactIds: string[] = [];
      let pText = '';

      if (pStatus && (pStatus.value === 'não avaliável' || pStatus.value === 'não informada')) {
        pText = `Dor: ${String(pStatus.value)}.`;
        pFactIds.push(pStatus.id);
      } else if (pScore) {
        pText = `Dor avaliada por escala numérica: ${pScore.value}/10`;
        pFactIds.push(pScore.id);
        if (pStatus) pFactIds.push(pStatus.id);
        if (pLoc) {
          pText += ` em ${String(pLoc.value)}`;
          pFactIds.push(pLoc.id);
        }
        pText += '.';
      } else if (pStatus) {
        pText = `Avaliação de dor: ${String(pStatus.value)}.`;
        pFactIds.push(pStatus.id);
      }

      if (pText) {
        traces.push({
          text: pText,
          factIds: pFactIds,
          category: 'pain',
        });
      }
    }

    // ==========================================
    // 5. Respiratory
    // ==========================================
    const respFacts = facts.respiratory || [];
    if (respFacts.length > 0) {
      const rSupport = respFacts.find((f) => f.id === 'resp-support');
      const rPattern = respFacts.find((f) => f.id === 'resp-pattern');
      const rDiscomfort = respFacts.find((f) => f.id === 'resp-discomfort');
      const rDevice = respFacts.find((f) => f.id === 'resp-ox-device');
      const rFlow = respFacts.find((f) => f.id === 'resp-ox-flow');

      const rParts: string[] = [];
      const rFactIds: string[] = [];

      if (rSupport) {
        let supTxt = `em ${String(rSupport.value)}`;
        rFactIds.push(rSupport.id);
        if (rSupport.value === 'oxigenoterapia') {
          if (rDevice) {
            supTxt += ` via ${String(rDevice.value)}`;
            rFactIds.push(rDevice.id);
          }
          if (rFlow) {
            supTxt += ` a ${String(rFlow.value)} L/min`;
            rFactIds.push(rFlow.id);
          }
        }
        rParts.push(supTxt);
      }

      if (rPattern) {
        rParts.push(`padrão respiratório ${String(rPattern.value)}`);
        rFactIds.push(rPattern.id);
      }

      if (rDiscomfort) {
        rParts.push(`desconforto respiratório ${String(rDiscomfort.value)}`);
        rFactIds.push(rDiscomfort.id);
      }

      if (rParts.length > 0) {
        traces.push({
          text: `Aspecto respiratório: ${rParts.join(', ')}.`,
          factIds: rFactIds,
          category: 'respiratory',
        });
      }
    }

    // ==========================================
    // 6. Cardiovascular
    // ==========================================
    const cvFacts = facts.cardiovascular || [];
    if (cvFacts.length > 0) {
      const cvPerf = cvFacts.find((f) => f.id === 'cv-perfusion');
      const cvExt = cvFacts.find((f) => f.id === 'cv-extremities');
      const cvEdema = cvFacts.find((f) => f.id === 'cv-edema');

      const cvParts: string[] = [];
      const cvFactIds: string[] = [];

      if (cvPerf) {
        cvParts.push(`perfusão periférica ${String(cvPerf.value)}`);
        cvFactIds.push(cvPerf.id);
      }
      if (cvExt) {
        cvParts.push(`extremidades ${String(cvExt.value)}`);
        cvFactIds.push(cvExt.id);
      }
      if (cvEdema) {
        cvParts.push(`edema ${String(cvEdema.value)}`);
        cvFactIds.push(cvEdema.id);
      }

      if (cvParts.length > 0) {
        traces.push({
          text: `Avaliação cardiovascular: ${cvParts.join(', ')}.`,
          factIds: cvFactIds,
          category: 'cardiovascular',
        });
      }
    }

    // ==========================================
    // 7. Nutrition
    // ==========================================
    const nutrFacts = facts.nutrition || [];
    if (nutrFacts.length > 0) {
      const nRoute = nutrFacts.find((f) => f.id === 'nutr-route');
      const nOral = nutrFacts.find((f) => f.id === 'nutr-oral-acceptance');
      const nDev = nutrFacts.find((f) => f.id === 'nutr-enteral-device');
      const nRate = nutrFacts.find((f) => f.id === 'nutr-enteral-rate');
      const nTol = nutrFacts.find((f) => f.id === 'nutr-enteral-tolerance');

      const nParts: string[] = [];
      const nFactIds: string[] = [];

      if (nRoute) {
        nParts.push(`dieta por via ${String(nRoute.value)}`);
        nFactIds.push(nRoute.id);
      }
      if (nOral) {
        nParts.push(`aceitação ${String(nOral.value)}`);
        nFactIds.push(nOral.id);
      }
      if (nDev) {
        let entTxt = `por ${String(nDev.value)}`;
        nFactIds.push(nDev.id);
        if (nRate) {
          entTxt += ` (${String(nRate.value)})`;
          nFactIds.push(nRate.id);
        }
        if (nTol) {
          entTxt += `, tolerância: ${String(nTol.value)}`;
          nFactIds.push(nTol.id);
        }
        nParts.push(entTxt);
      }

      if (nParts.length > 0) {
        traces.push({
          text: `Nutrição: ${nParts.join(', ')}.`,
          factIds: nFactIds,
          category: 'nutrition',
        });
      }
    }

    // ==========================================
    // 8. Eliminations
    // ==========================================
    const urFact = (facts.urinary || []).find((f) => f.id === 'elim-urinary') ||
      (facts.eliminations || []).find((f) => f.id === 'elim-urinary');
    const boFact = (facts.bowel || []).find((f) => f.id === 'elim-bowel') ||
      (facts.eliminations || []).find((f) => f.id === 'elim-bowel');

    if (urFact || boFact) {
      const elParts: string[] = [];
      const elFactIds: string[] = [];

      if (urFact) {
        elParts.push(`diurese ${String(urFact.value)}`);
        elFactIds.push(urFact.id);
      }
      if (boFact) {
        elParts.push(`evacuação ${String(boFact.value)}`);
        elFactIds.push(boFact.id);
      }

      traces.push({
        text: `Eliminações: ${elParts.join('; ')}.`,
        factIds: elFactIds,
        category: 'eliminations',
      });
    }

    // ==========================================
    // 9. Devices
    // ==========================================
    const devFacts = facts.devices || [];
    if (devFacts.length > 0) {
      const devSentences: string[] = [];
      const devFactIds: string[] = [];

      devFacts.forEach((df) => {
        const val = df.value;
        const typeStr = val?.type || 'Dispositivo';
        const locStr = val?.location ? ` em ${val.location}` : '';
        const permStr = val?.permeability ? `, ${val.permeability.toLowerCase()}` : '';
        const phlogStr = val?.phlogisticSigns ? `, sinais flogísticos ${val.phlogisticSigns.toLowerCase()}` : '';
        const dressStr = val?.dressing ? `, curativo ${val.dressing}` : '';

        devSentences.push(`Mantém ${typeStr}${locStr}${permStr}${dressStr}${phlogStr}`);
        devFactIds.push(df.id);
      });

      traces.push({
        text: `Dispositivos invasivos: ${devSentences.join('; ')}.`,
        factIds: devFactIds,
        category: 'devices',
      });
    }

    // ==========================================
    // 10. Skin
    // ==========================================
    const skinFacts = facts.skin || [];
    if (skinFacts.length > 0) {
      const sInteg = skinFacts.find((f) => f.id === 'skin-integrity');
      const sHyd = skinFacts.find((f) => f.id === 'skin-hydration');

      const sParts: string[] = [];
      const sFactIds: string[] = [];

      if (sInteg) {
        sParts.push(`integridade cutânea: ${String(sInteg.value)}`);
        sFactIds.push(sInteg.id);
      }
      if (sHyd) {
        sParts.push(`pele ${String(sHyd.value)}`);
        sFactIds.push(sHyd.id);
      }

      if (sParts.length > 0) {
        traces.push({
          text: `Pele e anexos: ${sParts.join(', ')}.`,
          factIds: sFactIds,
          category: 'skin',
        });
      }
    }

    // ==========================================
    // 11. Bath & Hygiene
    // ==========================================
    const bathFacts = facts.bath || [];
    if (bathFacts.length > 0) {
      const bPerf = bathFacts.find((f) => f.id === 'bath-performed');
      const bTol = bathFacts.find((f) => f.id === 'bath-tolerance');

      if (bPerf) {
        let bText = '';
        const bFactIds: string[] = [bPerf.id];

        if (bPerf.value === 'não') {
          bText = 'Banho não realizado no período.';
        } else {
          bText = `Realizado ${String(bPerf.value)}`;
          if (bTol) {
            bText += `, com tolerância ${String(bTol.value)}`;
            bFactIds.push(bTol.id);
          }
          bText += '.';
        }

        traces.push({
          text: bText,
          factIds: bFactIds,
          category: 'bath',
        });
      }
    }

    // ==========================================
    // 12. Care actions performed
    // ==========================================
    const careFacts = facts.care || [];
    if (careFacts.length > 0) {
      const careTexts: string[] = [];
      const careFactIds: string[] = [];

      careFacts.forEach((cf) => {
        careTexts.push(String(cf.value));
        careFactIds.push(cf.id);
      });

      traces.push({
        text: `Cuidados de enfermagem executados: ${careTexts.join('; ')}.`,
        factIds: careFactIds,
        category: 'care',
      });
    }

    // ==========================================
    // 13. Complications
    // ==========================================
    const compFacts = facts.complications || [];
    if (compFacts.length > 0) {
      const cNone = compFacts.find((f) => f.id === 'comp-none');
      const cPres = compFacts.find((f) => f.id === 'comp-presence');
      const cDesc = compFacts.find((f) => f.id === 'comp-desc');
      const cCond = compFacts.find((f) => f.id === 'comp-conduct');
      const cComm = compFacts.find((f) => f.id === 'comp-communication');

      if (cNone) {
        traces.push({
          text: 'Sem intercorrências registradas no período.',
          factIds: [cNone.id],
          category: 'complications',
        });
      } else if (cPres || cDesc) {
        const cParts: string[] = [];
        const cFactIds: string[] = [];

        if (cDesc) {
          cParts.push(`Intercorrência: ${String(cDesc.value)}`);
          cFactIds.push(cDesc.id);
        } else if (cPres) {
          cParts.push('Intercorrência registrada no plantão');
          cFactIds.push(cPres.id);
        }

        if (cCond) {
          cParts.push(`conduta realizada: ${String(cCond.value)}`);
          cFactIds.push(cCond.id);
        }

        if (cComm) {
          cParts.push(`comunicado a ${String(cComm.value)}`);
          cFactIds.push(cComm.id);
        }

        traces.push({
          text: `${cParts.join('; ')}.`,
          factIds: cFactIds,
          category: 'complications',
        });
      }
    }

    // ==========================================
    // 14. Final Status
    // ==========================================
    const fsFact = (facts.finalStatus || []).find((f) => f.id === 'final-status');
    if (fsFact) {
      traces.push({
        text: `Situação final: ${String(fsFact.value)}.`,
        factIds: [fsFact.id],
        category: 'finalStatus',
      });
    }

    // ==========================================
    // Pass strictly through DeterministicNarrativeFactAuditor
    // ==========================================
    const auditResult = auditDeterministicNarrative(traces, facts);

    return {
      narrative: auditResult.filteredNarrative,
      traces,
      auditResult,
    };
  }
}

/**
 * Functional wrapper for deterministic note generation.
 * Accepts ONLY AuthorizedClinicalFacts.
 */
export function buildTechnicianClinicalMedicalNursingNote(
  facts: AuthorizedClinicalFacts
): string {
  const result = TechnicianClinicalMedicalNursingNoteBuilder.build(facts);
  return result.narrative;
}
