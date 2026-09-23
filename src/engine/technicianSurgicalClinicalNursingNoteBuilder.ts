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
 * TechnicianSurgicalClinicalNursingNoteBuilder
 * 
 * Strict Builder for Nursing Technician notes in Surgical Clinic (Enfermaria Cirúrgica).
 * 
 * CRITICAL ARCHITECTURAL CONSTRAINTS:
 * 1. Consumes ONLY AuthorizedClinicalFacts.
 * 2. PROHIBITED from accessing rawForm.
 * 3. Emits individual traceable segments with explicit factIds: { text, factIds, category }.
 * 4. Passes all emitted segments through DeterministicNarrativeFactAuditor.
 * 5. Strictly factual, objective nursing technician vocabulary.
 * 6. NO medical diagnosis, NO nursing diagnosis, NO surgical complication extrapolation,
 *    NO clinical judgment, NO prescriptions.
 */
export class TechnicianSurgicalClinicalNursingNoteBuilder {
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

    // Identificação checada
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
    // 2. Surgical Context (Informações Cirúrgicas Registradas)
    // ==========================================
    const surgFacts = facts.surgicalContext || [];
    const sitFact = surgFacts.find((f) => f.id === 'surg-situation');
    const procFact = surgFacts.find((f) => f.id === 'surg-procedure');

    if (sitFact || procFact) {
      const sParts: string[] = [];
      const sFactIds: string[] = [];

      if (sitFact) {
        sParts.push(`Situação cirúrgica informada: ${String(sitFact.value)}`);
        sFactIds.push(sitFact.id);
      }
      if (procFact) {
        sParts.push(`procedimento cirúrgico informado: ${String(procFact.value)}`);
        sFactIds.push(procFact.id);
      }

      traces.push({
        text: `${sParts.join('; ')}.`,
        factIds: sFactIds,
        category: 'context',
      });
    }

    // ==========================================
    // 3. General Assessment
    // ==========================================
    const genFacts = facts.general || [];
    const stateFact = genFacts.find((f) => f.id === 'gen-state');
    const compFact = genFacts.find((f) => f.id === 'gen-complaints');
    const compDetFact = genFacts.find((f) => f.id === 'gen-complaints-details');
    const sourceFact = genFacts.find((f) => f.id === 'gen-source');
    const hygFact = genFacts.find((f) => f.id === 'gen-hygiene');
    const mobFact = genFacts.find((f) => f.id === 'gen-mobility');

    if (stateFact) {
      traces.push({
        text: `Ao exame inicial, paciente apresenta-se ${String(stateFact.value).toLowerCase()}.`,
        factIds: [stateFact.id],
        category: 'general',
      });
    }

    if (compFact) {
      const compVal = String(compFact.value).toLowerCase();
      if (compVal === 'sem queixas') {
        traces.push({
          text: 'Nega queixas álgicas ou outros desconfortos no momento da avaliação.',
          factIds: [compFact.id],
          category: 'general',
        });
      } else {
        const cParts: string[] = [`Refere ${compVal}`];
        const cFactIds: string[] = [compFact.id];

        if (compDetFact) {
          cParts.push(`(${String(compDetFact.value)})`);
          cFactIds.push(compDetFact.id);
        }
        if (sourceFact) {
          cParts.push(`informação fornecida por ${String(sourceFact.value)}`);
          cFactIds.push(sourceFact.id);
        }

        traces.push({
          text: `${cParts.join(' ')}.`,
          factIds: cFactIds,
          category: 'general',
        });
      }
    }

    if (hygFact || mobFact) {
      const gParts: string[] = [];
      const gFactIds: string[] = [];

      if (hygFact) {
        gParts.push(`Higiene corporal ${String(hygFact.value).toLowerCase()}`);
        gFactIds.push(hygFact.id);
      }
      if (mobFact) {
        gParts.push(`mobilidade: ${String(mobFact.value).toLowerCase()}`);
        gFactIds.push(mobFact.id);
      }

      traces.push({
        text: `${gParts.join('; ')}.`,
        factIds: gFactIds,
        category: 'general',
      });
    }

    // ==========================================
    // 4. Pain Assessment
    // ==========================================
    const painFacts = facts.pain || [];
    const painStatusFact = painFacts.find((f) => f.id === 'pain-status');
    const painScaleFact = painFacts.find((f) => f.id === 'pain-scale');
    const painLocFact = painFacts.find((f) => f.id === 'pain-location');

    if (painStatusFact) {
      const pStatus = String(painStatusFact.value);
      if (pStatus === 'sem dor') {
        traces.push({
          text: 'Avaliação de dor: paciente nega dor no momento da avaliação.',
          factIds: [painStatusFact.id],
          category: 'pain',
        });
      } else if (pStatus === 'avaliada') {
        const pParts: string[] = ['Dor avaliada'];
        const pFactIds: string[] = [painStatusFact.id];

        if (painScaleFact) {
          pParts.push(`intensidade ${painScaleFact.value}/10 pela escala numérica`);
          pFactIds.push(painScaleFact.id);
        }
        if (painLocFact) {
          pParts.push(`em ${String(painLocFact.value)}`);
          pFactIds.push(painLocFact.id);
        }

        traces.push({
          text: `${pParts.join(', ')}.`,
          factIds: pFactIds,
          category: 'pain',
        });
      } else if (pStatus === 'não avaliada') {
        traces.push({
          text: 'Dor não avaliada no momento.',
          factIds: [painStatusFact.id],
          category: 'pain',
        });
      }
    }

    // ==========================================
    // 5. Vital Signs
    // ==========================================
    const vitFacts = facts.vitalSigns || [];
    const paFact = vitFacts.find((f) => f.id === 'vital-pa');
    const pamFact = vitFacts.find((f) => f.id === 'vital-pam');
    const fcFact = vitFacts.find((f) => f.id === 'vital-fc');
    const frFact = vitFacts.find((f) => f.id === 'vital-fr');
    const spo2Fact = vitFacts.find((f) => f.id === 'vital-spo2');
    const tempFact = vitFacts.find((f) => f.id === 'vital-temp');
    const hgtFact = vitFacts.find((f) => f.id === 'vital-glicemia');

    const vParts: string[] = [];
    const vFactIds: string[] = [];

    if (paFact) {
      vParts.push(`PA: ${String(paFact.value)} mmHg`);
      vFactIds.push(paFact.id);
    }
    if (pamFact) {
      vParts.push(`PAM: ${String(pamFact.value)} mmHg`);
      vFactIds.push(pamFact.id);
    }
    if (fcFact) {
      vParts.push(`FC: ${String(fcFact.value)} bpm`);
      vFactIds.push(fcFact.id);
    }
    if (frFact) {
      vParts.push(`FR: ${String(frFact.value)} irpm`);
      vFactIds.push(frFact.id);
    }
    if (spo2Fact) {
      vParts.push(`SpO2: ${String(spo2Fact.value)}%`);
      vFactIds.push(spo2Fact.id);
    }
    if (tempFact) {
      vParts.push(`Tax: ${String(tempFact.value)} °C`);
      vFactIds.push(tempFact.id);
    }
    if (hgtFact) {
      vParts.push(`Glicemia capilar: ${String(hgtFact.value)} mg/dL`);
      vFactIds.push(hgtFact.id);
    }

    if (vParts.length > 0) {
      traces.push({
        text: `Sinais vitais aferidos: ${vParts.join(', ')}.`,
        factIds: vFactIds,
        category: 'vitalSigns',
      });
    }

    // ==========================================
    // 6. Respiratory Support
    // ==========================================
    const respFacts = facts.respiratory || [];
    const rSuppFact = respFacts.find((f) => f.id === 'resp-support');
    const rPatFact = respFacts.find((f) => f.id === 'resp-pattern');
    const rDiscFact = respFacts.find((f) => f.id === 'resp-discomfort');
    const rOxDevFact = respFacts.find((f) => f.id === 'resp-ox-device');
    const rOxFlowFact = respFacts.find((f) => f.id === 'resp-ox-flow');

    if (rSuppFact || rPatFact || rDiscFact) {
      const rParts: string[] = [];
      const rFactIds: string[] = [];

      if (rSuppFact) {
        if (rSuppFact.value === 'oxigenoterapia') {
          const oxParts: string[] = ['em oxigenoterapia'];
          if (rOxDevFact) {
            oxParts.push(`sob ${String(rOxDevFact.value)}`);
            rFactIds.push(rOxDevFact.id);
          }
          if (rOxFlowFact) {
            oxParts.push(`a ${String(rOxFlowFact.value)} L/min`);
            rFactIds.push(rOxFlowFact.id);
          }
          rParts.push(oxParts.join(' '));
        } else {
          rParts.push(`em ${String(rSuppFact.value)}`);
        }
        rFactIds.push(rSuppFact.id);
      }

      if (rPatFact) {
        rParts.push(`padrão respiratório ${String(rPatFact.value)}`);
        rFactIds.push(rPatFact.id);
      }

      if (rDiscFact) {
        rParts.push(
          rDiscFact.value === 'ausente'
            ? 'sem sinais de desconforto respiratório'
            : 'com presença de desconforto respiratório'
        );
        rFactIds.push(rDiscFact.id);
      }

      traces.push({
        text: `Padrão ventilatório: ${rParts.join(', ')}.`,
        factIds: rFactIds,
        category: 'respiratory',
      });
    }

    // ==========================================
    // 7. Wound & Dressing Assessment
    // ==========================================
    const woundFacts = facts.wound || [];
    const wHasFact = woundFacts.find((f) => f.id === 'wound-has-dressing');
    const wLocFact = woundFacts.find((f) => f.id === 'wound-location');
    const wCondFact = woundFacts.find((f) => f.id === 'wound-condition');
    const wDetFact = woundFacts.find((f) => f.id === 'wound-condition-details');

    if (wHasFact) {
      if (wHasFact.value === 'sim') {
        const wParts: string[] = ['Curativo em ferida cirúrgica presente'];
        const wFactIds: string[] = [wHasFact.id];

        if (wLocFact) {
          wParts.push(`localizado em ${String(wLocFact.value)}`);
          wFactIds.push(wLocFact.id);
        }
        if (wCondFact) {
          wParts.push(`apresenta-se ${String(wCondFact.value)}`);
          wFactIds.push(wCondFact.id);
        }
        if (wDetFact) {
          wParts.push(`observação: ${String(wDetFact.value)}`);
          wFactIds.push(wDetFact.id);
        }

        traces.push({
          text: `${wParts.join(', ')}.`,
          factIds: wFactIds,
          category: 'wound',
        });
      } else if (wHasFact.value === 'não') {
        traces.push({
          text: 'Sem presença de curativo cirúrgico no momento.',
          factIds: [wHasFact.id],
          category: 'wound',
        });
      }
    }

    // ==========================================
    // 8. Drains & Invasive Devices
    // ==========================================
    const devFacts = facts.devices || [];
    if (devFacts.length > 0) {
      devFacts.forEach((devFact) => {
        traces.push({
          text: `Dispositivo invasivo / dreno em uso: ${String(devFact.value)}.`,
          factIds: [devFact.id],
          category: 'devices',
        });
      });
    }

    // ==========================================
    // 9. Nutrition
    // ==========================================
    const nutFacts = facts.nutrition || [];
    const nRouteFact = nutFacts.find((f) => f.id === 'nut-route');
    const nOralFact = nutFacts.find((f) => f.id === 'nut-oral-acceptance');
    const nEntDevFact = nutFacts.find((f) => f.id === 'nut-enteral-device');
    const nEntRateFact = nutFacts.find((f) => f.id === 'nut-enteral-rate');
    const nEntTolFact = nutFacts.find((f) => f.id === 'nut-enteral-tolerance');

    if (nRouteFact) {
      const nParts: string[] = [];
      const nFactIds: string[] = [nRouteFact.id];

      if (nRouteFact.value === 'jejum') {
        nParts.push('Paciente mantido em jejum');
      } else {
        nParts.push(`Dieta por via ${String(nRouteFact.value)}`);
      }

      if (nOralFact) {
        nParts.push(`com aceitação ${String(nOralFact.value)}`);
        nFactIds.push(nOralFact.id);
      }
      if (nEntDevFact) {
        nParts.push(`administrada por ${String(nEntDevFact.value)}`);
        nFactIds.push(nEntDevFact.id);
      }
      if (nEntRateFact) {
        nParts.push(`vazão ${String(nEntRateFact.value)}`);
        nFactIds.push(nEntRateFact.id);
      }
      if (nEntTolFact) {
        nParts.push(`tolerância: ${String(nEntTolFact.value)}`);
        nFactIds.push(nEntTolFact.id);
      }

      traces.push({
        text: `${nParts.join(', ')}.`,
        factIds: nFactIds,
        category: 'nutrition',
      });
    }

    // ==========================================
    // 10. Eliminations
    // ==========================================
    const elimFacts = facts.eliminations || [];
    const eUriFact = elimFacts.find((f) => f.id === 'elim-urinary');
    const eUriRouteFact = elimFacts.find((f) => f.id === 'elim-urinary-route');
    const eBowFact = elimFacts.find((f) => f.id === 'elim-bowel');
    const eBowAspFact = elimFacts.find((f) => f.id === 'elim-bowel-aspect');

    if (eUriFact || eBowFact) {
      const eParts: string[] = [];
      const eFactIds: string[] = [];

      if (eUriFact) {
        let uriText = `Diurese ${String(eUriFact.value)}`;
        if (eUriRouteFact) {
          uriText += ` via ${String(eUriRouteFact.value)}`;
          eFactIds.push(eUriRouteFact.id);
        }
        eParts.push(uriText);
        eFactIds.push(eUriFact.id);
      }

      if (eBowFact) {
        let bowText = `evacuação ${String(eBowFact.value)}`;
        if (eBowAspFact) {
          bowText += ` de aspecto ${String(eBowAspFact.value)}`;
          eFactIds.push(eBowAspFact.id);
        }
        eParts.push(bowText);
        eFactIds.push(eBowFact.id);
      }

      traces.push({
        text: `Eliminações: ${eParts.join('; ')}.`,
        factIds: eFactIds,
        category: 'eliminations',
      });
    }

    // ==========================================
    // 11. Mobility & Ambulation
    // ==========================================
    const mobFacts = facts.mobility || [];
    const mAmbFact = mobFacts.find((f) => f.id === 'mob-ambulation');
    const mAssFact = mobFacts.find((f) => f.id === 'mob-assistance');

    if (mAmbFact) {
      const mParts: string[] = [];
      const mFactIds: string[] = [mAmbFact.id];

      if (mAmbFact.value === 'realizada') {
        mParts.push('Deambulação realizada no período');
        if (mAssFact) {
          mParts.push(String(mAssFact.value));
          mFactIds.push(mAssFact.id);
        }
      } else if (mAmbFact.value === 'restrito ao leito') {
        mParts.push('Paciente restrito ao leito');
      } else {
        mParts.push('Deambulação não realizada no período');
      }

      traces.push({
        text: `${mParts.join(', ')}.`,
        factIds: mFactIds,
        category: 'mobility',
      });
    }

    // ==========================================
    // 12. Bath & Hygiene
    // ==========================================
    const bathFacts = facts.bath || [];
    const bTypeFact = bathFacts.find((f) => f.id === 'bath-type');
    const bTolFact = bathFacts.find((f) => f.id === 'bath-tolerance');

    if (bTypeFact) {
      if (bTypeFact.value === 'não realizado') {
        traces.push({
          text: 'Banho não realizado no plantão.',
          factIds: [bTypeFact.id],
          category: 'bath',
        });
      } else {
        const bParts: string[] = [`Realizado ${String(bTypeFact.value).toLowerCase()}`];
        const bFactIds: string[] = [bTypeFact.id];

        if (bTolFact) {
          bParts.push(`com boa tolerância relatada: ${String(bTolFact.value)}`);
          bFactIds.push(bTolFact.id);
        }

        traces.push({
          text: `${bParts.join(' ')}.`,
          factIds: bFactIds,
          category: 'bath',
        });
      }
    }

    // ==========================================
    // 13. Nursing Care Performed
    // ==========================================
    const careFacts = facts.care || [];
    if (careFacts.length > 0) {
      const actionFacts = careFacts.filter((f) => f.id.startsWith('care-action-'));
      const otherFact = careFacts.find((f) => f.id === 'care-other');

      const actionsText = actionFacts.map((f) => String(f.value));
      const actionIds = actionFacts.map((f) => f.id);

      if (actionsText.length > 0) {
        traces.push({
          text: `Cuidados de enfermagem executados: ${actionsText.join('; ')}.`,
          factIds: actionIds,
          category: 'care',
        });
      }

      if (otherFact) {
        traces.push({
          text: `Outros cuidados prestados: ${String(otherFact.value)}.`,
          factIds: [otherFact.id],
          category: 'care',
        });
      }
    }

    // ==========================================
    // 14. Complications
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
    // 15. Final Status
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
export function buildTechnicianSurgicalClinicNursingNote(
  facts: AuthorizedClinicalFacts
): string {
  const result = TechnicianSurgicalClinicalNursingNoteBuilder.build(facts);
  return result.narrative;
}
