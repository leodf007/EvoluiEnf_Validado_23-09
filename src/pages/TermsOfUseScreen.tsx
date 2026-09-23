import React from 'react';
import { ArrowLeft, BookOpen, AlertTriangle, Scale, Stethoscope, CheckCircle2, Award } from 'lucide-react';
import { AppScreen } from '../types';

interface TermsOfUseScreenProps {
  onNavigate: (screen: AppScreen) => void;
}

export const TermsOfUseScreen: React.FC<TermsOfUseScreenProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Botão Voltar */}
      <div>
        <button
          type="button"
          id="btn-back-from-terms"
          onClick={() => onNavigate('account')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Minha Conta</span>
        </button>
      </div>

      {/* Cabeçalho */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/80">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Acordo de Licença e Condições de Uso</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Termos de Uso
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Última atualização: Setembro de 2026 • Versão 1.2
        </p>
      </div>

      {/* Destaque Ético e Legal Mandatório */}
      <div className="p-4.5 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-950 text-xs sm:text-sm space-y-2 leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Aviso Fundamental de Responsabilidade Profissional</span>
        </div>
        <p>
          O <strong>EvoluiEnf</strong> é uma ferramenta tecnológica de apoio à redação e padronização da documentação de enfermagem. <strong>A aplicação NÃO substitui o raciocínio clínico, o julgamento profissional, o exame físico, nem os protocolos da instituição de saúde do usuário.</strong>
        </p>
        <p>
          O sistema não realiza prescrição medicamentosa, conduta terapêutica autônoma nem diagnóstico nosológico. Toda e qualquer anotação ou evolução gerada com apoio do sistema deve ser obrigatoriamente <strong>revisada, validada e chancelada</strong> pelo profissional antes da inclusão no prontuário do paciente.
        </p>
      </div>

      {/* Cláusulas */}
      <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        {/* 1. Objeto e Natureza do Serviço */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">1</span>
            <span>Objeto e Natureza da Aplicação</span>
          </h2>
          <p>
            O EvoluiEnf disponibiliza formulários estruturados, guias de checagem clínica, assistência textual baseada em inteligência artificial e ferramentas de exportação para auxiliar enfermeiros e técnicos de enfermagem na elaboração de anotações e evoluções em conformidade com as boas práticas documentais.
          </p>
          <p>
            A plataforma opera como um assistente de documentação de uso estritamente profissional e individual.
          </p>
        </section>

        {/* 2. Prerrogativas Profissionais e Legislação COFEN/COREN */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">2</span>
            <span>Atribuições Legais e Resoluções do COFEN</span>
          </h2>
          <p>
            O EvoluiEnf respeita e preserva integralmente as atribuições e competências legais definidas na Lei do Exercício Profissional da Enfermagem (Lei Federal nº 7.498/1986, regulamentada pelo Decreto nº 94.406/1987) e resoluções aplicáveis do Conselho Federal de Enfermagem (COFEN), em especial as relativas ao Processo de Enfermagem:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
            <li>
              <strong>Módulos Privativos do Enfermeiro:</strong> O Exame Físico Céfalo-Caudal sistematizado, a Admissão de Enfermagem e o Diagnóstico/Planejamento do Cuidado constituem prerrogativa privativa do Enfermeiro habilitado.
            </li>
            <li>
              <strong>Módulos do Técnico de Enfermagem:</strong> As Anotações de Enfermagem e checagens pontuais de cuidados executados subordinam-se à supervisão do Enfermeiro.
            </li>
            <li>
              <strong>Inalterabilidade por Plano Comercial:</strong> Nenhuma assinatura, seja ela Free ou PRO, confere ao usuário o direito ou a capacidade técnica de burlar ou ultrapassar as barreiras legais e éticas de sua respectiva categoria profissional.
            </li>
          </ul>
        </section>

        {/* 3. Responsabilidade Exclusiva sobre o Conteúdo */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">3</span>
            <span>Responsabilidade Ética, Civil e Criminal</span>
          </h2>
          <p>
            A veracidade, integridade e fidelidade das informações clínicas inseridas nos campos de texto são de responsabilidade única e exclusiva do usuário profissional.
          </p>
          <p>
            A assinatura final do registro perante a instituição de saúde e os órgãos regulatórios (COREN/COFEN) cabe unicamente ao profissional detentor do respectivo número de registro.
          </p>
        </section>

        {/* 4. Planos, Contratação e Cancelamento */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">4</span>
            <span>Planos de Acesso, Cobrança e Cancelamento</span>
          </h2>
          <p>
            O serviço pode oferecer modalidades de acesso gratuito (Plano Free) com limites de criação de documentos e recursos de apoio, bem como planos por assinatura (Plano PRO) com recursos avançados.
          </p>
          <p>
            A contratação de planos pagos é processada através de gateways de pagamento parceiros autorizados. O usuário poderá cancelar a renovação automática a qualquer momento através de sua conta, mantendo o acesso aos benefícios contratados até o término do período vigente.
          </p>
        </section>

        {/* 5. Disponibilidade e Operação Offline */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">5</span>
            <span>Disponibilidade e Tolerância a Falhas</span>
          </h2>
          <p>
            O EvoluiEnf disponibiliza recursos de funcionamento offline e sincronização posterior para proporcionar continuidade assistencial durante eventuais instabilidades de conectividade hospitalar. Contudo, o usuário é orientado a manter cópia ou registro final no prontuário físico/eletrônico institucional conforme a rotina do serviço.
          </p>
        </section>

        {/* 6. Foro e Disposições Finais */}
        <section className="space-y-2 border-t border-slate-200 pt-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">6</span>
            <span>Disposições Finais e Foro</span>
          </h2>
          <p>
            Estes termos são regidos pelas leis da República Federativa do Brasil. Para dirimir quaisquer litígios decorrentes destes Termos de Uso, elege-se o foro da comarca da sede da entidade mantenedora.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <p><strong>Entidade Licenciante:</strong> [RAZÃO SOCIAL A DEFINIR]</p>
            <p><strong>Contato Institucional:</strong> [CONTATO DE PRIVACIDADE A DEFINIR]</p>
          </div>
        </section>
      </div>
    </div>
  );
};
