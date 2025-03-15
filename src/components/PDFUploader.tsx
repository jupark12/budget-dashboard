import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText,
  Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

interface Job {
  id: string;
  source_file: string;
  status: string;
  created_at: string;
  updated_at: string;
  error?: string;
}

const PDFUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);

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
          return prevJobs.map(job => 
            job.id === data.job_id 
              ? { ...job, status: data.status, error: data.error } 
              : job
          );
        });
        
        // If it's a new job that we don't have yet, fetch all jobs
        fetchJobs();
      }
    };
    
    socket.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Failed to connect to server for real-time updates');
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
      setError('Failed to fetch jobs');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0 && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('pdfFile', selectedFile);
    
    try {
      const response = await fetch('http://localhost:8080/jobs', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Upload successful:', result);
      
      // Clear selected file after successful upload
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending':
        return <Chip icon={<HourglassEmptyIcon />} label="Pending" color="warning" />;
      case 'processing':
        return <Chip icon={<CircularProgress size={16} />} label="Processing" color="info" />;
      case 'completed':
        return <Chip icon={<CheckCircleIcon />} label="Completed" color="success" />;
      case 'failed':
        return <Chip icon={<ErrorIcon />} label="Failed" color="error" />;
      default:
        return <Chip label={status} />;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Upload Bank Statement
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
          sx={{ mr: 2 }}
          disabled={uploading}
        >
          Select PDF
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            hidden
            onChange={handleFileChange}
          />
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? <CircularProgress size={24} /> : 'Upload'}
        </Button>
        
        {selectedFile && (
          <Typography variant="body2" sx={{ ml: 2 }}>
            {selectedFile.name}
          </Typography>
        )}
      </Box>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Typography variant="h6" gutterBottom>
        Recent Jobs
      </Typography>
      
      <List>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <ListItem key={job.id} divider>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1">
                      {job.source_file.split('/').pop()}
                    </Typography>
                    {getStatusChip(job.status)}
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" component="span">
                      Job ID: {job.id} | Created: {new Date(job.created_at).toLocaleString()}
                    </Typography>
                    {job.error && (
                      <Typography variant="body2" color="error">
                        Error: {job.error}
                      </Typography>
                    )}
                  </>
                }
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No jobs found" />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default PDFUploader;