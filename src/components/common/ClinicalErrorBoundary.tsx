import React, { Component } from 'react';
import { AlertOctagon, RotateCcw, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  onReset?: () => void;
  onNavigateHome?: () => void;
  areaTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
}

export class ClinicalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log without PII
    console.error('ClinicalErrorBoundary caught an unhandled rendering error:', error.message);
    this.setState({ errorInfo });
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleGoBack = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome();
    }
  };

  private toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto my-8 p-6 sm:p-8 bg-white rounded-2xl border border-rose-200 shadow-sm text-slate-800 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Ocorreu uma falha na renderização do formulário
              </h2>
              <p className="text-sm text-slate-600">
                {this.props.areaTitle
                  ? `Houve um imprevisto na seção "${this.props.areaTitle}". Nenhum dado clínico permanente foi corrompido.`
                  : 'Os dados foram preservados e você pode reiniciar a seção ou retornar com segurança.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tentar recarregar seção</span>
            </button>

            {this.props.onNavigateHome && (
              <button
                type="button"
                onClick={this.handleGoBack}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar com segurança</span>
              </button>
            )}

            <button
              type="button"
              onClick={this.toggleDetails}
              className="ml-auto inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
            >
              <span>Detalhes técnicos</span>
              {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {this.state.showDetails && (
            <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto space-y-2">
              <p className="font-semibold text-rose-400">
                {this.state.error?.name}: {this.state.error?.message}
              </p>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-slate-400 whitespace-pre-wrap text-[11px] leading-relaxed">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
