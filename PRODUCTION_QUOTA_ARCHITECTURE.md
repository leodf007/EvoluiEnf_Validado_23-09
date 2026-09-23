# EvoluiEnf — Cotas Autoritativas de Produção

## Regras comerciais

- FREE: 10 documentos/mês e 5 consultas ao Assistente IA/mês.
- PRO: R$ 34,97/mês, 100 documentos/mês e 100 consultas ao Assistente IA/mês.
- O plano comercial nunca amplia permissões profissionais COFEN/RBAC.

## Fonte de verdade

O navegador mantém apenas um cache visual. A autorização real ocorre no backend autenticado pelo Firebase Admin SDK.

- `GET /api/quota/current`: retorna consumo e plano efetivos.
- `POST /api/quota/documents/reserve`: reserva idempotente vinculada ao `resourceId` do atendimento.
- Endpoints `/api/ai/*`: consomem cota de IA no próprio backend antes de chamar o provedor.
- `usage/{uid_YYYY-MM}`: contador mensal atualizado somente pelo Admin SDK.
- `quotaPermits/{permitId}`: autorização assinada logicamente pelo backend, vinculada a usuário, período, tipo e recurso.

## Segurança

- `usage` e `quotaPermits` são somente leitura no cliente; criação/alteração/exclusão são bloqueadas pelas Firestore Rules.
- Um novo atendimento remoto só pode ser criado quando o payload contém um `quotaPermitId` válido, do mesmo usuário e do mesmo `atendimentoId`.
- Atualizações de documentos já existentes não consomem uma nova cota.
- Alterar localStorage, estado React ou o plano exibido na interface não aumenta a cota real.
- O backend usa a coleção `subscriptions` como fonte canônica e lê `user_subscriptions` somente como compatibilidade legada.

## Offline e idempotência

- Um atendimento pode nascer offline e permanecer localmente como `pending`.
- Na primeira sincronização, o backend tenta reservar a cota. Se o limite foi atingido, o documento local é preservado e não é enviado ao Firestore.
- Reservas de documentos usam `resourceId` como chave idempotente: repetir a mesma sincronização não consome a cota novamente.
- Permissões de documento possuem 180 dias de validade para permitir sincronização tardia sem recontar a competência original.
- Falhas do provedor de IA liberam a reserva de IA quando a chamada externa não foi concluída.

## Competência mensal

Por padrão, a virada mensal usa `America/Sao_Paulo` (`QUOTA_TIMEZONE`) para evitar reset antecipado por UTC. Cada competência usa um documento separado em `usage`, portanto o reset mensal é natural e não depende de zerar contadores antigos.

## Interface

`UsageStatusCard` consulta o snapshot autoritativo do backend e usa o plano retornado pelo servidor para exibir os limites. Em indisponibilidade de rede, o último cache visual pode permanecer na interface, mas não concede autorização.
