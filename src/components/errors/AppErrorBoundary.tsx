import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from 'antd';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  message: string | null;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    message: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('[AppErrorBoundary]', error, info.componentStack);
    }
  }

  private handleReload = () => {
    window.location.assign('/');
  };

  private handleRetry = () => {
    this.setState({ hasError: false, message: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-6">
        <div className="w-full max-w-md text-center animate-fade-up">
          <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-danger/10 text-danger flex items-center justify-center">
            <AlertTriangle size={24} strokeWidth={1.75} />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-ink tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {this.state.message ?? 'An unexpected error occurred.'}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button onClick={this.handleRetry}>Try again</Button>
            <Button type="primary" onClick={this.handleReload}>
              Go home
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
