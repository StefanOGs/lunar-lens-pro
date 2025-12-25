import { Component, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-destructive" aria-hidden="true" />
          </div>
          
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Нещо се обърка
          </h2>
          
          <p className="text-muted-foreground max-w-sm mb-6">
            Възникна неочаквана грешка. Моля, опитайте отново.
          </p>
          
          <Button 
            onClick={this.handleRetry}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Опитай отново
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
