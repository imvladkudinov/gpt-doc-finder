import { Component, ReactNode } from "react";
import { ButtonLow } from "@/components/ui/ButtonLow";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // You can log error info here
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
          <h1 className="text-[26px] font-bold mb-0">Something went wrong</h1>
          <p className="text-body pb-[16px]">Try reload page</p>
          <ButtonLow variant="primary" onClick={() => window.location.reload()}>Reload</ButtonLow>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
