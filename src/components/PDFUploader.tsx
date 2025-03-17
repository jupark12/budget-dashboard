import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
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
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const { progress, setProgress } = useJobContext();

  const isProcessing = progress && progress !== "completed" && progress !== "";

  // Add useEffect to handle live progress updates
  useEffect(() => {
    // This effect will run whenever the progress value changes
    console.log('Progress updated:', progress);

    // You could add additional logic here if needed
    // For example, play a sound when processing completes
    if (progress === "completed") {
      console.log('Processing completed!');
    }
  }, [progress]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0 && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please upload a PDF file');
      }
    }
  }, []);

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

      setProgress("processing");

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

  return (
    <>
      <Box
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.400',
          borderRadius: 2,
          p: 4,
          mb: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDragActive ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          minHeight: 200,
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('pdf-upload')?.click()}
      >
        <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" align="center" gutterBottom>
          Drag and drop PDF bank statements
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary">
          or click to browse files
        </Typography>
        <input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          hidden
          onChange={handleFileChange}
        />

        {selectedFile ? (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Selected:
            </Typography>
            <Typography variant="body2" sx={{ ml: 1 }}>
              {selectedFile.name}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', visibility: 'hidden' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              No file selected
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', flexFlow: 'column' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          sx={{ minWidth: 120 }}
        >
          {uploading ? <CircularProgress size={24} /> : 'Process PDF'}
        </Button>
        {/* Progress indicator */}
        {isProcessing && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
          </Box>
        )}
      </Box>

      {error && (
        <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      )}
    </>
  );
};

export default PDFUploader;