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
  jobs: Job[];
  refreshTransactions: () => void;
  lastCompletedJob: Job | null;
}

const JobContext = createContext<JobContextType>({
  jobs: [],
  refreshTransactions: () => {},
  lastCompletedJob: null,
});

export const useJobContext = () => useContext(JobContext);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [lastCompletedJob, setLastCompletedJob] = useState<Job | null>(null);
  const [shouldRefreshTransactions, setShouldRefreshTransactions] = useState<boolean>(false);

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
        // Initialize jobs list
        setJobs(data.jobs);
      } else if (data.type === 'job_update') {
        // Update a specific job
        setJobs(prevJobs => {
          const updatedJobs = prevJobs.map(job => 
            job.id === data.job_id 
              ? { ...job, status: data.status, error: data.error } 
              : job
          );
          
          // If a job was just completed, set it as the last completed job
          if (data.status === 'completed') {
            const completedJob = updatedJobs.find(job => job.id === data.job_id);
            if (completedJob) {
              setLastCompletedJob(completedJob);
              // Trigger transaction refresh
              refreshTransactions();
            }
          }
          
          return updatedJobs;
        });
        
        // If it's a new job that we don't have yet, fetch all jobs
        fetchJobs();
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
  
  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);
  
  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:8080/jobs');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  // Reset the refresh flag after it's been consumed
  useEffect(() => {
    if (shouldRefreshTransactions) {
      setShouldRefreshTransactions(false);
    }
  }, [shouldRefreshTransactions]);

  return (
    <JobContext.Provider value={{ 
      jobs, 
      refreshTransactions,
      lastCompletedJob
    }}>
      {children}
    </JobContext.Provider>
  );
};