// Define types first
type Page = 'dashboard' | 'settings' | 'analytics';

interface Transaction {
    id: number;
    date: string;
    description: string;
    amount: number;
    type: string;
    created_at: string;
  }