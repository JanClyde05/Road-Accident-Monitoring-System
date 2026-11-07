import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[RAMS ErrorBoundary caught an error]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-neutral-950/90 text-neutral-100 font-mono select-none">
          <div className="max-w-md w-full p-5 rounded-2xl border border-rose-500/50 bg-neutral-900 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-rose-400 font-black text-sm uppercase tracking-wider">
              <span>[SYSTEM RECOVERY NOTICE]</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {this.props.fallbackTitle || 'A non-fatal rendering glitch occurred while processing live telemetry.'}
            </p>
            {this.state.error && (
              <pre className="p-2.5 rounded bg-black/60 border border-neutral-800 text-[10px] text-rose-300 overflow-x-auto whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                [RECOVER INTERFACE]
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

