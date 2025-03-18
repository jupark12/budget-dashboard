import React, { createContext, useContext, useState, useEffect } from 'react';

interface Job {
  id: string;
  source_file: string;
  status: string;
  created_at: string;
  updated_at: string;
  error?: string;
}

interface GlobalContextType {
  refreshTransactions: () => void;
  shouldRefreshTransactions: boolean;
  progress: string;
  setProgress: React.Dispatch<React.SetStateAction<string>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  totalBalance: number;
}

const GlobalContext = createContext<GlobalContextType>({
  refreshTransactions: () => { },
  shouldRefreshTransactions: false,
  progress: "",
  setProgress: () => { },
  transactions: [],
  setTransactions: () => { },
  error: null,
  setError: () => { },
  totalTransactions: 0,
  totalIncome: 0,
  totalExpenses: 0,
  totalBalance: 0,
});

export const useGlobalContext = () => useContext(GlobalContext);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shouldRefreshTransactions, setShouldRefreshTransactions] = useState<boolean>(false);
  const [progress, setProgress] = useState<string>("");
  const [currentFile, setCurrentFile] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [totalBalance, setTotalBalance] = useState<number>(0);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:8050/transactions');

      if (!response.ok) {
        setError('Failed to fetch transactions. Please try again later.');
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setTransactions(data);
      setError(null);

      const statsResponse = await fetch('http://localhost:8050/stats')

      if (!statsResponse.ok) {
        setError('Failed to fetch stats. Please try again later.');
        throw new Error(`HTTP error! Status: ${statsResponse.status}`);
      }

      const statsData = await statsResponse.json();
      statsData.total_credits = statsData.total_credits;
      statsData.total_debits = statsData.total_debits;
      setTotalTransactions(statsData.total_transactions);
      setTotalIncome(statsData.total_credits);
      setTotalExpenses(statsData.total_debits);
      setTotalBalance(statsData.total_credits + statsData.total_debits)
    } catch (err) {
      setError('Failed to fetch transactions. Please try again later.');
      console.error('Error fetching transactions:', err);
    }
  };

  // Function to trigger transaction refresh
  const refreshTransactions = () => {
    fetchTransactions();
  };

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    fetchTransactions(); // Initial Transaciton fetch

    const socket = new WebSocket('ws://localhost:8080/ws');

    socket.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'initial_jobs') {
        console.log(data)
      } else if (data.type === 'job_update') {
        setCurrentFile(data.source_file)
        setProgress(data.status);
        if (data.status === 'completed') {
          refreshTransactions();
        }
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    // Clean up on unmount
    return () => {
      socket.close();
    };
  }, []);

  // Reset the refresh flag after it's been consumed
  useEffect(() => {
    if (shouldRefreshTransactions) {
      fetchTransactions();
    }
  }, [shouldRefreshTransactions]);

  return (
    <GlobalContext.Provider value={{
      refreshTransactions,
      shouldRefreshTransactions,
      progress,
      setProgress,
      transactions,
      setTransactions,
      error,
      setError,
      totalTransactions,
      totalIncome,
      totalExpenses,
      totalBalance,
    }}>
      {children}
    </GlobalContext.Provider>
  );
};