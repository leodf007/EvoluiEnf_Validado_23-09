import React from 'react';
import { ArrowLeft, Shield, Lock, FileText, CheckCircle2, UserX, Database, Cpu, AlertCircle } from 'lucide-react';
import { AppScreen } from '../types';

interface PrivacyPolicyScreenProps {
  onNavigate: (screen: AppScreen) => void;
}

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Botão Voltar */}
      <div>
        <button
          type="button"
          id="btn-back-from-privacy"
          onClick={() => onNavigate('account')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Minha Conta</span>
        </button>
      </div>

      {/* Cabeçalho */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/80">
          <Shield className="w-3.5 h-3.5" />
          <span>Transparência e Governança de Dados</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Política de Privacidade
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Última atualização: Setembro de 2026 • Versão 1.2
        </p>
      </div>

      {/* Card de Aviso Central */}
      <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 text-xs sm:text-sm space-y-1.5 leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-teal-900">
          <Lock className="w-4 h-4 text-teal-700 shrink-0" />
          <span>Princípio Central de Privacidade por Padrão</span>
        </div>
        <p>
          O <strong>EvoluiEnf</strong> não é um prontuário eletrônico do paciente (PEP). O aplicativo é uma ferramenta individual de apoio à redação e estruturação da documentação técnica de enfermagem. O sistema foi desenvolvido sob as diretrizes de <em>Privacy by Default</em> para minimizar a coleta de quaisquer dados pessoais identificáveis de pacientes.
        </p>
      </div>

      {/* Seções da Política */}
      <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        {/* 1. Dados do Profissional */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">1</span>
            <span>Dados de Cadastro do Profissional de Enfermagem</span>
          </h2>
          <p>
            Para utilização da aplicação e vinculação das anotações ao autor devidamente habilitado, coletamos dados básicos do profissional:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
            <li>Nome completo e e-mail profissional;</li>
            <li>Registro profissional (número do COREN e UF de atuação);</li>
            <li>Categoria profissional (Enfermeiro ou Técnico em Enfermagem);</li>
            <li>Informações sobre o plano contratado (Free ou PRO) e dados de autenticação segura via Firebase Authentication.</li>
          </ul>
        </section>

        {/* 2. Tratamento das Informações de Pacientes */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">2</span>
            <span>Informações Clínicas e Anonimização de Pacientes</span>
          </h2>
          <p>
            O EvoluiEnf orienta que <strong>nenhum dado pessoal identificável (PII) de pacientes</strong> (como CPF, RG, nome civil completo, telefone ou endereço residencial) seja inserido nos formulários. Recomenda-se estritamente o uso de <strong>iniciais (ex: J.S.F.) ou identificador de leito/setor</strong>.
          </p>
          <p>
            Antes de qualquer processamento por modelos de inteligência artificial, o serviço de filtragem <strong>PrivacyGuard</strong> executa higienização ativa no texto para mitigar o trânsito de menções a identificadores pessoais residuais.
          </p>
        </section>

        {/* 3. Armazenamento, Sincronização e Firebase */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">3</span>
            <span>Armazenamento, Sincronização e Nuvem Segura</span>
          </h2>
          <p>
            Os registros e rascunhos criados pelo profissional são armazenados localmente no navegador ou dispositivo do usuário (para garantir continuidade operacional mesmo em plantões sem conectividade à internet) e sincronizados na nuvem através do Google Cloud Firestore sob o identificador exclusivo (UID) do usuário autenticado.
          </p>
          <p>
            Regras de segurança rigorosas (Firestore Security Rules) garantem que nenhum profissional possa visualizar, editar ou exportar documentos pertencentes a outro usuário.
          </p>
        </section>

        {/* 4. Recursos de Inteligência Artificial */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">4</span>
            <span>Processamento de Inteligência Artificial</span>
          </h2>
          <p>
            Os recursos de IA destinam-se exclusivamente ao suporte linguístico, organização sintática, concordância gramatical e clareza da redação assistencial. Os dados enviados para refinamento:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
            <li>Não são utilizados para treinamento de modelos públicos com dados clínicos de usuários;</li>
            <li>São processados em tráfego seguro criptografado (TLS/HTTPS);</li>
            <li>Nunca realizam diagnósticos médicos autônomos nem prescrevem tratamentos.</li>
          </ul>
        </section>

        {/* 5. Segurança da Informação */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">5</span>
            <span>Medidas de Segurança da Informação</span>
          </h2>
          <p>
            Adotamos medidas técnicas e organizacionais proporcionais para salvaguardar os dados dos profissionais contra acessos não autorizados, interceptação ou modificação ilícita, incluindo:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
            <li>Criptografia em repouso e em trânsito;</li>
            <li>Trilha de auditoria interna imutável com data, versão e autor de cada alteração em atendimento;</li>
            <li>Bloqueio de credenciais e fallbacks inseguros em ambientes de produção.</li>
          </ul>
        </section>

        {/* 6. Direitos do Titular e Exclusão de Conta */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">6</span>
            <span>Direitos do Usuário e Exclusão Definitiva de Conta</span>
          </h2>
          <p>
            O titular dos dados cadastrais tem o direito de acessar, retificar, atualizar ou solicitar a exclusão de sua conta e dos registros a ela vinculados a qualquer momento através da opção <strong>"Excluir Minha Conta"</strong> na tela Minha Conta.
          </p>
          <p>
            A exclusão apaga os dados locais no dispositivo, a fila de sincronização e desassocia os registros em nuvem vinculados ao UID, respeitando eventuais prazos legais mínimos de guarda contábil de assinaturas quando aplicável.
          </p>
        </section>

        {/* 7. Responsável e Contato */}
        <section className="space-y-2 border-t border-slate-200 pt-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">7</span>
            <span>Identificação e Contato</span>
          </h2>
          <p>
            Para esclarecimentos sobre esta Política de Privacidade ou solicitações relativas ao tratamento de dados, o contato pode ser estabelecido através de:
          </p>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <p><strong>Entidade Operadora:</strong> [RAZÃO SOCIAL A DEFINIR]</p>
            <p><strong>Canal de Atendimento de Privacidade:</strong> [CONTATO DE PRIVACIDADE A DEFINIR]</p>
            <p><strong>Aplicação:</strong> EvoluiEnf — Assistência e Documentação de Enfermagem</p>
          </div>
        </section>
      </div>
    </div>
  );
};
