import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result } from 'antd';
import { ReloadOutlined, WarningOutlined } from '@ant-design/icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught runtime error:', error, errorInfo);

    // If dynamic chunk failed to fetch (e.g. after server restart or redeploy), auto-reload once
    const isChunkLoadFailed =
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Importing a module script failed') ||
      error.message?.includes('Loading chunk');

    if (isChunkLoadFailed) {
      const reloadKey = 'chunk_reload_timestamp';
      const lastReload = Number(sessionStorage.getItem(reloadKey) || 0);
      const now = Date.now();
      // Only auto-reload if not already reloaded in the last 10 seconds
      if (now - lastReload > 10000) {
        sessionStorage.setItem(reloadKey, String(now));
        window.location.reload();
      }
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isChunkError =
        this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
        this.state.error?.message?.includes('Importing a module script failed');

      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
          <Result
            status="warning"
            icon={<WarningOutlined className="text-amber-500 text-5xl" />}
            title={<span className="text-white text-lg font-mono">Terminal Environment Notice</span>}
            subTitle={
              <span className="text-slate-400 text-xs font-mono max-w-md block mx-auto">
                {isChunkError
                  ? 'A module update occurred during server startup. Please refresh the terminal workspace to load the latest bundle.'
                  : this.state.error?.message || 'An unexpected runtime error occurred.'}
              </span>
            }
            extra={[
              <Button
                type="primary"
                key="reload"
                icon={<ReloadOutlined />}
                onClick={this.handleReload}
                className="bg-emerald-600 hover:bg-emerald-500 font-mono text-xs"
              >
                Reload Workspace
              </Button>,
              <Button
                key="retry"
                onClick={this.handleReset}
                className="border-slate-700 text-slate-300 font-mono text-xs"
              >
                Try Again
              </Button>
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
