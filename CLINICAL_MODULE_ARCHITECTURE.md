# EvoluiEnf — Clinical Module Architecture V1

Este documento descreve a arquitetura técnica, os contratos formais, as políticas de segurança profissional e os fluxos de dados do **EvoluiEnf (Clinical Module Factory V1)**.

---

## 1. ModuleRegistry

O `MODULE_REGISTRY` é a **fonte única de verdade (Single Source of Truth)** para o catálogo e a disponibilidade de módulos assistenciais na aplicação:
- Módulos registrados:
  - `technician_nursing_note` (Anotação de Enfermagem — Técnico)
  - `technician_admission` (Admissão / Anotação — Técnico)
  - `nurse_evolution` (Evolução de Enfermagem — Enfermeiro)
  - `nurse_admission` (Admissão / Evolução — Enfermeiro)
  - `nurse_wounds` (Em desenvolvimento)
  - `nurse_soap` (Em desenvolvimento)
- Cada módulo mapeia suas áreas assistenciais (`emergency`, `icu`, `medicalClinic`, `surgicalClinic`, `pediatrics`) com status estrito (`available` vs `development`) e rotas canônicas.

---

## 2. ClinicalModuleDefinition

A `ClinicalModuleDefinition` é uma estrutura de configuração pura da aplicação (nunca armazena dados de pacientes). Ela define:
- `id`: Identificador único do módulo.
- `moduleId`: Referência canônica ao `ModuleId`.
- `professionalRole`: `'technician'` ou `'nurse'`.
- `documentType`: `'TECHNICIAN_NURSING_NOTE'`, `'TECHNICIAN_ADMISSION_NOTE'`, `'NURSE_ADMISSION'` ou `'NURSE_EVOLUTION'`.
- `clinicalArea`: Área assistencial (ex: `emergency`, `icu`).
- `title`: Título descritivo do módulo.
- `sections`: Lista de seções (`ClinicalSectionDefinition[]`).
- `capabilities`: Configuração explícita de capacidades clínicas (`ClinicalModuleCapabilities`).

---

## 3. ClinicalModuleContract

Cada fluxo assistencial disponível implementa obrigatoriamente um `ClinicalModuleContract` fortemente tipado contendo:
- `definition`: Definição do módulo.
- `route`: Rota de tela correspondente no app.
- `formComponentId`: Identificador do componente visual de formulário.
- `createInitialForm`: Fábrica de formulário zerado (sem defaults clínicos).
- `normalizer`: Função de sanitização e eliminação de resíduos incoerentes.
- `factsBuilder`: Construtor de `AuthorizedClinicalFacts`.
- `deterministicBuilder`: Construtor determinístico canônico da narrativa.
- `consistencyValidator`: Validador de consistência clínica cruzada (alertas não-bloqueantes).
- `narrativeAuditor`: Auditor factual que mapeia sentenças a `factIds`.
- `postGenerationVerifier`: Verificador pós-geração com travas de segurança.
- `aiRefinementPolicy`: Diretrizes gerais e específicas para IA.

---

## 4. ProfessionalRolePolicy

A `ProfessionalRolePolicy` impõe as fronteiras legais da enfermagem brasileira (Lei do Exercício Profissional / COFEN) no código:
- **Técnico de Enfermagem**:
  - `supportsNurseClinicalSynthesis`: `false` (estritamente proibido).
  - Bloqueio de termos privativos (`diagnóstico de enfermagem`, `prescrição de enfermagem`, `evolução de enfermagem`).
  - Proibição de conclusões subjetivas ou declarações de estabilidade clínica (`hemodinamicamente estável`, `bom estado`).
- **Enfermeiro**:
  - `supportsNurseClinicalSynthesis`: `true` (julgamento clínico manual estruturado).
  - Proibição de geração autônoma de diagnósticos ou prescrições por IA sem intervenção humana.
- **Isolamento de Rotas (Anti-Leakage)**: Rotas do enfermeiro são bloqueadas para o técnico e vice-versa.

---

## 5. Fluxo de Execução dos Dados

```
FORM (Interface de entrada do usuário)
  ↓
NORMALIZER (Limpeza e sanitização de resíduos condicionais)
  ↓
AUTHORIZED CLINICAL FACTS (Fatos autorizados com proveniência rastreável e factId determinístico)
  ↓
MODULE-SPECIFIC BUILDER (Construção da anotação/evolução específica da área e perfil)
  ↓
NARRATIVE FACT TRACE (Mapeamento de segmentos de texto para factIds)
  ↓
DETERMINISTIC AUDITOR (Auditoria estrita de 100% de correspondência factual)
  ↓
OPTIONAL AI REFINEMENT (Refinamento textual opcional restrito às diretrizes de estilo)
  ↓
POST GENERATION VERIFIER (Verificação com travas duras / locks especializados)
  ↓
HUMAN REVIEW (Revisão, edição e validação final pelo profissional de enfermagem)
```

---

## 5.1. Regras Absolutas de Autorização e Semântica

> **“Raw form data does not grant narrative authorization.”**
> (Dados brutos de formulário não concedem autorização narrativa. Apenas fatos devidamente normalizados, validados e convertidos em AuthorizedClinicalFacts possuem autorização para compor a narrativa clínica.)

> **“Module Factory does not generate clinical judgment or clinical narrative semantics.”**
> (A Factory fornece exclusivamente contratos, orquestração de infraestrutura, tipagem e interfaces. Ela jamais gera julgamento clínico autônomo, hipóteses diagnósticas ou semântica narrativa clínica.)


---

## 6. NarrativeFactTrace & NarrativeComposer

- Cada sentença produzida possui rastreabilidade factual através de `NarrativeSegment`:
  ```typescript
  interface NarrativeSegment {
    text: string;
    factIds: string[];
    isStructural?: boolean;
  }
  ```
- O `NarrativeComposer` é responsável por formatar espaçamento, pontuação e parágrafos sem jamais criar ou alterar conteúdos clínicos.

---

## 7. Registries de Segurança

- `AuthorizedDeviceRegistry`: Agrega dispositivos invasivos informados (vasculares, drenos, sondas).
- `AuthorizedMedicationRegistry`: Preserva fármacos e infusões informados.
- `AuthorizedClinicalActionRegistry`: Registra cuidados e procedimentos executados.

---

## 8. Política de IA e Travas (Locks)

- `CommonAIRefinementPolicy`: Proíbe criação de fatos, alteração de números, inclusão de medicamentos não declarados ou suposição de diagnósticos.
- `BasePostGenerationVerifier`: Valida identidade factual e bloqueia saídas contendo PII ou termos não autorizados.
- Locks especializados: `MedicationLock`, `DeviceLock`, `ClinicalActionLock`, `NurseJudgmentLock`, `PhysicalExamFactLock`, `VentilatorParameterLock`, `OriginFactLock`, `ExistingVsInstalledDevicesLock`.

---

## 9. Como Criar um Novo Módulo Futuramente (Checklist de 11 Passos)

Quando for necessário expandir a aplicação para novas áreas (e.g., Clínica Médica, Clínica Cirúrgica, Pediatria):

1. **Declarar Module Definition**: Criar a definição em `src/engine/factory/moduleDefinitions.ts` com metadados e capabilities estritas.
2. **Selecionar Componentes**: Mapear os componentes necessários no `ClinicalComponentRegistry`.
3. **Criar Tipagem de Formulário**: Definir a tipagem em `src/types/` garantindo que todos os campos comecem vazios.
4. **Criar Normalizer Específico**: Desenvolver o normalizador condicional que remove dados residuais.
5. **Criar Facts Builder Específico**: Criar o construtor de fatos autorizados com namespace dedicado.
6. **Criar Regras de Consistência**: Implementar o validador de inconsistências cruzadas (não-bloqueante).
7. **Criar Builder Profissional Específico**: Desenvolver o construtor determinístico de anotação ou evolução.
8. **Configurar Locks de Segurança**: Integrar locks pós-geração pertinentes ao tipo de documento.
9. **Configurar Políticas de IA**: Definir diretrizes específicas do perfil e documento.
10. **Criar Suíte de Testes Automatizados**: Criar testes unitários e de equivalência.
11. **Marcar como `available` no `MODULE_REGISTRY`**: Somente após todos os 10 passos estarem completos e validados pelo `validateClinicalModuleRegistry()`.

---

## 10. Regras Invioláveis do Sistema

1. **NÃO CRIAR BUILDER UNIVERSAL**: A factory compartilha contratos e infraestrutura, nunca a semântica assistencial ou julgamento profissional.
2. **SEM DEFAULTS CLÍNICOS**: Ausência de seleção sempre significa "Dado não informado".
3. **PAM NUNCA CALCULADA**: PAM é manual e opcional.
4. **ZERO PERSISTÊNCIA DE DADOS CLÍNICOS**: Proibido usar `localStorage`, `sessionStorage` ou `IndexedDB` para dados de pacientes.
5. **PRIVACY FIRST**: Toda entrada de texto livre passa por interceptação de PII (CPF, telefone, e-mail).
