import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useGlobalContext } from '~/context/GlobalContext';

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
  const { progress, setProgress } = useGlobalContext();

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

  // Modified to trigger upload immediately after file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0 && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      uploadFile(file);
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

  // Modified drop handler to upload immediately
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        setSelectedFile(file);
        setError(null);
        uploadFile(file);
      } else {
        setError('Please upload a PDF file');
      }
    }
  }, []);

  // New function to handle file upload
  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('pdfFile', file);

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

      // We don't clear the selected file immediately to show the user what was uploaded
      // It will be cleared when a new file is selected or when processing completes

    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file');
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  // Clear selected file when processing completes
  useEffect(() => {
    if (progress === "completed") {
      setSelectedFile(null);
      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  }, [progress]);

  return (
    <>
      <div className='flex w-full max-w-[1026px] justify-center'>
        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: 100,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            minHeight: 200,
            width: '80%',
            height: '200px',
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('pdf-upload')?.click()}
        >
          {isProcessing ? (
            <>
              <CircularProgress size={60} sx={{ mb: 2 }} />
            </>
          ) : (
            <>
              <CloudUploadIcon sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.5)', mb: 2 }} />
              <Typography className='text-white' align="center" gutterBottom>
                Drop PDF file
              </Typography>
              <Typography variant="body2" align="center" color="white">
                or click to browse
              </Typography>
            </>
          )}

          <input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            hidden
            onChange={handleFileChange}
          />

          {selectedFile && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ ml: 1, color: 'white' }}>
                {selectedFile.name}
              </Typography>
            </Box>
          )}
        </Box>
      </div>

      {error && (
        <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      )}
    </>
  );
};

export default PDFUploader;