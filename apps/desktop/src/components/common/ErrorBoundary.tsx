import React, { type PropsWithChildren } from 'react';

type ErrorBoundaryProps = PropsWithChildren<{
    onReset?: () => void;
}>;

type ErrorBoundaryState = {
    hasError: boolean;
    message?: string;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, message: error?.message || 'Unexpected error' };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center', height: '100%', padding: 24 }}>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>Something went wrong</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{this.state.message}</div>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, message: undefined });
                            this.props.onReset?.();
                        }}
                        style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    >
                        Reset
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
