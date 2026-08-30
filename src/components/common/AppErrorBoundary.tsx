import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level safety net.
 *
 * Previously an uncaught render error anywhere in the tree — a failed WebGL
 * context, a malformed API payload, a missing GLTF — unmounted the entire app
 * and left the visitor on a blank white page. This keeps the failure
 * observable and, critically, recoverable without losing the session.
 */
class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the component stack — React strips it from the bare Error object.
    console.error('[AppErrorBoundary] Unhandled render error:', error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-950 px-4 py-10 text-white">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-gray-900/80 p-6 text-center">
          <h1 className="text-lg font-bold text-red-400">Something went wrong</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">
            An unexpected error interrupted the page. You can retry without losing your place, or
            reload for a clean start.
          </p>

          {import.meta.env.DEV && (
            <pre className="custom-scrollbar mt-4 max-h-40 overflow-auto rounded-lg bg-black/60 p-3 text-left text-[11px] leading-relaxed text-red-300">
              {error.message}
            </pre>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={this.handleReset}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-blue-500 active:scale-[0.98]"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10 active:scale-[0.98]"
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
