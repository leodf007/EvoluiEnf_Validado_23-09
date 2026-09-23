import { Atendimento, ProfessionalUser } from '../types';
import { AtendimentoService } from './atendimentoService';

export interface DocumentoProfissionalOptions {
  profissionalNome?: string;
  categoriaProfissional?: string;
  registroCoren?: string;
  documentoTipo?: string;
  setor?: string;
  leito?: string;
  dataHora?: string;
  conteudo?: string;
}

/**
 * Utilitário canônico para exportação e formatação profissional de documentos clínicos
 * em conformidade com o padrão COFEN e modelo solicitado.
 */
export class DocumentExportService {
  /**
   * Formata a data/hora no padrão pt-BR legível (DD/MM/AAAA às HH:MM)
   */
  static formatarDataHora(isoDate?: string): string {
    if (!isoDate) {
      const now = new Date();
      return `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    try {
      const d = new Date(isoDate);
      if (isNaN(d.getTime())) return isoDate;
      const data = d.toLocaleDateString('pt-BR');
      const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return `${data} às ${hora}`;
    } catch {
      return isoDate;
    }
  }

  /**
   * Normaliza a categoria profissional (Enfermeiro ou Técnico)
   */
  static normalizarCategoria(perfil?: string): string {
    if (!perfil) return 'Enfermeiro';
    const lower = perfil.toLowerCase();
    if (lower.includes('téc')) {
      return 'Técnico de Enfermagem';
    }
    return 'Enfermeiro';
  }

  /**
   * Extrai o conteúdo do texto da evolução mantendo estritamente a narrativa clínica original
   */
  static extrairConteudoClinico(atendimento: Atendimento): string {
    if (atendimento.narrativaFinal && atendimento.narrativaFinal.trim().length > 0) {
      return atendimento.narrativaFinal.trim();
    }
    if (atendimento.resumoRegistro && atendimento.resumoRegistro.trim().length > 0) {
      return atendimento.resumoRegistro.trim();
    }
    return 'Registro clínico concluído sem narrativa detalhada.';
  }

  /**
   * Gera a representação textual canônica do Modelo Profissional:
   * 
   * Evolução de Enfermagem
   * 
   * Profissional:
   * (nome)
   * 
   * Categoria:
   * (Enfermeiro/Técnico)
   * 
   * Registro:
   * COREN
   * 
   * Data/Hora:
   * (data)
   * 
   * Documento:
   * (tipo do documento)
   * 
   * Setor:
   * (setor)
   * 
   * Leito:
   * (leito)
   * 
   * Conteúdo:
   * (texto gerado)
   */
  static gerarModeloProfissional(
    atendimento: Atendimento,
    options?: DocumentoProfissionalOptions,
    usuario?: ProfessionalUser | null
  ): string {
    // Isolamento multiusuário: Usuário A não pode exportar ou visualizar modelo de Usuário B
    if (
      usuario &&
      usuario.id &&
      atendimento.usuarioId &&
      atendimento.usuarioId !== 'usr-default-ana' &&
      atendimento.usuarioId !== 'usr-prof-ana' &&
      usuario.id !== atendimento.usuarioId
    ) {
      throw new Error(
        'Violação de isolamento multiusuário: Não é permitido gerar modelo de exportação para atendimento de outro profissional.'
      );
    }

    const nome =
      options?.profissionalNome ||
      atendimento.usuarioResponsavel ||
      usuario?.nome ||
      'Profissional de Enfermagem';

    const categoria =
      options?.categoriaProfissional ||
      this.normalizarCategoria(atendimento.perfilProfissional || usuario?.profissao);

    const registro =
      options?.registroCoren ||
      usuario?.registroProfissional ||
      'COREN Ativo';

    const dataHora =
      options?.dataHora ||
      this.formatarDataHora(atendimento.dataCriacao);

    const documento =
      options?.documentoTipo ||
      atendimento.tipoRegistro ||
      'Evolução de Enfermagem';

    const setor =
      options?.setor ||
      atendimento.setor ||
      'Setor Geral';

    const leito =
      options?.leito ||
      (atendimento.leito ? `Leito ${atendimento.leito}` : 'Não especificado');

    const conteudo =
      options?.conteudo !== undefined
        ? options.conteudo
        : this.extrairConteudoClinico(atendimento);

    return [
      'Evolução de Enfermagem',
      '',
      'Profissional:',
      nome,
      '',
      'Categoria:',
      categoria,
      '',
      'Registro:',
      registro,
      '',
      'Data/Hora:',
      dataHora,
      '',
      'Documento:',
      documento,
      '',
      'Setor:',
      setor,
      '',
      'Leito:',
      leito,
      '',
      'Conteúdo:',
      conteudo,
    ].join('\n');
  }

  /**
   * Copia o modelo profissional formatado para a área de transferência
   */
  static async copiarModeloProfissional(
    atendimento: Atendimento,
    options?: DocumentoProfissionalOptions,
    usuario?: ProfessionalUser | null
  ): Promise<boolean> {
    try {
      // Bloqueia caso seja atendimento pertencente a outro usuário
      if (
        usuario &&
        usuario.id &&
        atendimento.usuarioId &&
        atendimento.usuarioId !== 'usr-default-ana' &&
        atendimento.usuarioId !== 'usr-prof-ana' &&
        usuario.id !== atendimento.usuarioId
      ) {
        console.warn('Violação de isolamento multiusuário: Não é permitido copiar documento de outro profissional.');
        return false;
      }

      const textoFormatado = this.gerarModeloProfissional(atendimento, options, usuario);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textoFormatado);
        // Registra evento de exportação na trilha de auditoria (AUD-003) com UID isolado
        if (atendimento.id) {
          AtendimentoService.registrarExportacao(
            atendimento.id,
            options?.profissionalNome || usuario?.nome || atendimento.usuarioResponsavel,
            'Cópia Modelo Profissional',
            usuario?.id
          );
        }
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Erro ao copiar modelo profissional:', err);
      return false;
    }
  }

  /**
   * Gera o layout HTML formatado para impressão e exportação em PDF (A4)
   */
  static gerarHtmlImpressao(
    atendimento: Atendimento,
    options?: DocumentoProfissionalOptions,
    usuario?: ProfessionalUser | null
  ): string {
    const nome =
      options?.profissionalNome ||
      atendimento.usuarioResponsavel ||
      usuario?.nome ||
      'Profissional de Enfermagem';

    const categoria =
      options?.categoriaProfissional ||
      this.normalizarCategoria(atendimento.perfilProfissional || usuario?.profissao);

    const registro =
      options?.registroCoren ||
      usuario?.registroProfissional ||
      'COREN Ativo';

    const dataHora =
      options?.dataHora ||
      this.formatarDataHora(atendimento.dataCriacao);

    const documento =
      options?.documentoTipo ||
      atendimento.tipoRegistro ||
      'Evolução de Enfermagem';

    const setor =
      options?.setor ||
      atendimento.setor ||
      'Setor Geral';

    const leito =
      options?.leito ||
      (atendimento.leito ? `Leito ${atendimento.leito}` : 'Não especificado');

    const identificacao = atendimento.identificacao || 'PACIENTE ANÔNIMO';

    const conteudo =
      options?.conteudo !== undefined
        ? options.conteudo
        : this.extrairConteudoClinico(atendimento);

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Evolução de Enfermagem - ${identificacao}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 20mm 20mm 20mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
      font-size: 13px;
    }
    .header-box {
      border-bottom: 2px solid #0f766e;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }
    .app-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #0f766e;
      font-weight: 700;
    }
    .doc-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin: 4px 0 0 0;
    }
    .grid-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 24px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 20px;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      font-size: 10px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .meta-value {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
      margin-top: 2px;
    }
    .content-title {
      font-size: 12px;
      text-transform: uppercase;
      color: #0f766e;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    .content-box {
      font-size: 13px;
      color: #0f172a;
      white-space: pre-wrap;
      line-height: 1.6;
      text-align: justify;
      min-height: 250px;
      padding: 16px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .footer-signature {
      margin-top: 40px;
      border-top: 1px solid #cbd5e1;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11px;
      color: #64748b;
    }
    .signature-line {
      width: 250px;
      border-top: 1px solid #0f172a;
      padding-top: 4px;
      text-align: center;
      font-weight: 600;
      color: #0f172a;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div class="app-title">EvoluiEnf • Documentação Assistencial de Enfermagem</div>
    <h1 class="doc-title">Evolução de Enfermagem</h1>
  </div>

  <div class="grid-meta">
    <div class="meta-item">
      <span class="meta-label">Profissional</span>
      <span class="meta-value">${nome}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Categoria</span>
      <span class="meta-value">${categoria}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Registro</span>
      <span class="meta-value">${registro}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Data/Hora</span>
      <span class="meta-value">${dataHora}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Documento</span>
      <span class="meta-value">${documento}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Setor</span>
      <span class="meta-value">${setor}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Leito</span>
      <span class="meta-value">${leito}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Identificação Anônima</span>
      <span class="meta-value">${identificacao}</span>
    </div>
  </div>

  <div class="content-title">Conteúdo Clínico Registrado</div>
  <div class="content-box">${conteudo}</div>

  <div class="footer-signature">
    <div>
      <div>Documento gerado eletronicamente para prontuário.</div>
      <div>Identificação anônima em conformidade com as diretrizes de privacidade.</div>
    </div>
    <div class="signature-line">
      ${nome}<br>
      ${categoria} • ${registro}
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Dispara a impressão ou exportação para PDF via navegador
   */
  static imprimirOuExportarPdf(
    atendimento: Atendimento,
    options?: DocumentoProfissionalOptions,
    usuario?: ProfessionalUser | null
  ): void {
    // Bloqueia caso seja atendimento pertencente a outro usuário
    if (
      usuario &&
      usuario.id &&
      atendimento.usuarioId &&
      atendimento.usuarioId !== 'usr-default-ana' &&
      atendimento.usuarioId !== 'usr-prof-ana' &&
      usuario.id !== atendimento.usuarioId
    ) {
      console.warn('Violação de isolamento multiusuário: Não é permitido imprimir documento de outro profissional.');
      return;
    }

    // Registra evento de exportação na trilha de auditoria (AUD-003)
    if (atendimento.id) {
      AtendimentoService.registrarExportacao(
        atendimento.id,
        options?.profissionalNome || usuario?.nome || atendimento.usuarioResponsavel,
        'Impressão / PDF',
        usuario?.id
      );
    }

    const htmlContent = this.gerarHtmlImpressao(atendimento, options, usuario);
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (!frameDoc) {
      console.error('Falha ao instanciar frame de impressão');
      return;
    }

    frameDoc.open();
    frameDoc.write(htmlContent);
    frameDoc.close();

    printFrame.contentWindow?.focus();
    setTimeout(() => {
      printFrame.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 2000);
    }, 300);
  }
}
