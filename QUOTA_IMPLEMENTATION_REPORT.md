# EvoluiEnf — Etapa 7 v2: Cotas Autoritativas

## Implementado

- FREE: 10 documentos/mês e 5 consultas IA/mês.
- PRO: R$ 34,97/mês, 100 documentos/mês e 100 consultas IA/mês.
- Autorização de cota de documentos no backend autenticado com Firebase ID Token.
- Contadores mensais em `usage/{uid_YYYY-MM}`, alteráveis somente pelo backend/Admin SDK.
- `quotaPermits` idempotentes e vinculados ao usuário, período e `resourceId`.
- Firestore Rules exigem quota permit válido, reservado, pertencente ao usuário e ao atendimento.
- Cota de IA consumida no backend antes da chamada ao provedor, com liberação em falha do provedor.
- Interface de consumo passa a usar o plano autoritativo retornado pelo servidor quando online.
- Competência mensal configurada por padrão em `America/Sao_Paulo` (`QUOTA_TIMEZONE`).
- Permissão de documento válida por 180 dias para suportar sincronização offline tardia.
- Plano PRO interpreta corretamente datas ISO, `Date` e Timestamp-like do Firestore; data inválida é tratada de forma conservadora.

## Preservado

- Histórico e documentos existentes.
- Edição de documentos já existentes sem novo consumo de cota.
- Modo offline: documentos locais não são apagados quando a cota não pode ser validada.
- Fila de sincronização e idempotência.
- RBAC/COFEN independente de plano comercial.

## Validação realizada neste ambiente

- QTA-001: virada mensal em America/Sao_Paulo — APROVADO.
- QTA-002: limites FREE/PRO e preço R$ 34,97 — APROVADO.
- QTA-003: plano PRO com datas Firestore / expiração — APROVADO.
- QTA-004: validade offline de 180 dias — APROVADO.
- Total específico desta etapa: 4/4 testes aprovados.
- Transpilação sintática dos arquivos modificados: APROVADA.
- Asserções estáticas das Firestore Rules e ausência dos valores comerciais antigos: APROVADAS.

## Limitação da validação local

O projeto foi recebido sem `node_modules`. A tentativa de `npm install` excedeu o limite de execução do ambiente, portanto a suíte completa anterior (148 testes), `vite build` e o typecheck integral com dependências não foram reexecutados aqui. O `tsc` global confirmou que a ausência das dependências impede o typecheck integral; isso não deve ser interpretado como falha do código do projeto.

## Próximo passo

Integração real do Mercado Pago em ambiente de teste/homologação, com checkout, webhook idempotente, atualização da assinatura canônica e fluxo de cancelamento/renovação.
