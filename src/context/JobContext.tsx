import React, { createContext, useContext, useState, useEffect } from 'react';

interface Job {
  id: string;
  source_file: string;
  status: string;
  created_at: string;
  updated_at: string;
  error?: string;
}

interface JobContextType {
  refreshTransactions: () => void;
  shouldRefreshTransactions: boolean;
  progress: string;
  setProgress: React.Dispatch<React.SetStateAction<string>>;
}

const JobContext = createContext<JobContextType>({
  refreshTransactions: () => { },
  shouldRefreshTransactions: false,
  progress: "",
  setProgress: () => { },
});

export const useJobContext = () => useContext(JobContext);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shouldRefreshTransactions, setShouldRefreshTransactions] = useState<boolean>(false);
  const [progress, setProgress] = useState<string>("");
  const [currentFile, setCurrentFile] = useState<string>("");

  // Function to trigger transaction refresh
  const refreshTransactions = () => {
    setShouldRefreshTransactions(true);
  };

  // Connect to WebSocket for real-time updates
  useEffect(() => {
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
      setShouldRefreshTransactions(false);
    }
  }, [shouldRefreshTransactions]);

  return (
    <JobContext.Provider value={{
      refreshTransactions,
      shouldRefreshTransactions,
      progress,
      setProgress
    }}>
      {children}
    </JobContext.Provider>
  );
};