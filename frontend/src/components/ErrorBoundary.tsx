import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-4 rounded border border-red-500/30 bg-red-500/10 text-red-500 font-mono text-sm max-w-full overflow-hidden">
          <p className="font-bold">Component Error:</p>
          <p>{this.state.error?.message || "Unknown error"}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
