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
import { useJobContext } from '~/context/JobContext';

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
  const [error, setError] = useState<string | null>(null);
  const [optimisticJob, setOptimisticJob] = useState<Job | null>(null);
  
  const { jobs } = useJobContext();

  // Clear optimistic job when it appears in the actual jobs list
  useEffect(() => {
    if (optimisticJob && jobs.some(job => 
      job.source_file.includes(optimisticJob.source_file.split('/').pop() || '')
    )) {
      setOptimisticJob(null);
    }
  }, [jobs, optimisticJob]);

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
    
    // Create optimistic job entry
    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    setOptimisticJob({
      id: tempId,
      source_file: selectedFile.name,
      status: 'pending',
      created_at: now,
      updated_at: now
    });
    
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
      // Remove optimistic job on error
      setOptimisticJob(null);
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

  // Combine real jobs with optimistic job
  const displayJobs = optimisticJob 
    ? [optimisticJob, ...jobs]
    : jobs;

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
        {displayJobs.length > 0 ? (
          displayJobs.map((job) => (
            <ListItem 
              key={job.id} 
              divider
              sx={{
                opacity: job.id.startsWith('temp-') ? 0.7 : 1,
                position: 'relative'
              }}
            >
              {job.id.startsWith('temp-') && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.05)', 
                    zIndex: 1 
                  }} 
                />
              )}
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
                      Job ID: {job.id.startsWith('temp-') ? 'Processing...' : job.id} | Created: {new Date(job.created_at).toLocaleString()}
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