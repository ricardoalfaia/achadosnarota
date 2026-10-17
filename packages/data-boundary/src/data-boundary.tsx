"use client";

import { Component, Suspense, type ReactNode } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";

interface ErrorBoundaryState {
  error: Error | null;
}

interface InnerErrorBoundaryProps {
  reset: () => void;
  errorFallback?: (error: Error, reset: () => void) => ReactNode;
  children: ReactNode;
}

class InnerErrorBoundary extends Component<
  InnerErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  private resetError = () => {
    this.props.reset();
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      const { errorFallback } = this.props;
      if (errorFallback) return errorFallback(error, this.resetError);
      return (
        <div
          role="alert"
          className="flex flex-col items-center gap-2 p-6 text-sm text-danger"
        >
          <p>Algo deu errado.</p>
          <button
            type="button"
            onClick={this.resetError}
            className="underline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export interface DataBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  canFetch?: boolean;
  errorFallback?: (error: Error, reset: () => void) => ReactNode;
}

export function DataBoundary({
  fallback,
  children,
  canFetch = true,
  errorFallback,
}: DataBoundaryProps) {
  if (!canFetch) return null;

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <InnerErrorBoundary reset={reset} errorFallback={errorFallback}>
          <Suspense fallback={fallback}>{children}</Suspense>
        </InnerErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
