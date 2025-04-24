import { toast } from 'sonner';

interface FraudCheck {
  id: string;
  type: 'duplicate_payment' | 'unusual_pattern' | 'multiple_region';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: string;
}

export class FraudDetectionService {
  private static instance: FraudDetectionService;
  private checkInterval: number = 5 * 60 * 1000; // 5 minutes
  private intervalId?: NodeJS.Timeout;

  private constructor() {
    this.startMonitoring();
  }

  public static getInstance(): FraudDetectionService {
    if (!FraudDetectionService.instance) {
      FraudDetectionService.instance = new FraudDetectionService();
    }
    return FraudDetectionService.instance;
  }

  private async checkForFraud(): Promise<FraudCheck[]> {
    try {
      const response = await fetch('/api/fraud-detection/check');
      const checks = await response.json();
      
      checks.forEach((check: FraudCheck) => {
        const toastMessage = `Fraud Alert: ${check.description}`;
        switch (check.severity) {
          case 'high':
            toast.error(toastMessage, {
              duration: 10000,
              action: {
                label: 'View Details',
                onClick: () => window.location.href = `/fraud-alerts/${check.id}`,
              },
            });
            break;
          case 'medium':
            toast.warning(toastMessage);
            break;
          case 'low':
            toast.info(toastMessage);
            break;
        }
      });

      return checks;
    } catch (error) {
      console.error('Fraud detection check failed:', error);
      return [];
    }
  }

  private startMonitoring() {
    this.intervalId = setInterval(() => {
      this.checkForFraud();
    }, this.checkInterval);
  }

  public stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

// Initialize the service
export const fraudDetectionService = FraudDetectionService.getInstance(); 