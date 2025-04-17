import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { Button, Box, Typography, CircularProgress, Alert, Card, CardContent, Grid, Dialog, DialogContent, DialogActions, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import UploadIcon from '@mui/icons-material/Upload';
import CheckIcon from '@mui/icons-material/Check';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import receiptService from '../services/receiptService';

const ReceiptUpload = ({ onProcessed, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      
      // Show image preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Process the receipt
      const result = await receiptService.uploadReceipt(file);
      
      // Pass extracted data to parent component
      onProcessed({
        ...result.extractedData,
        receipt: result.receiptUrl
      });
      
    } catch (err) {
      console.error('Receipt upload failed:', err);
      setError('Failed to process receipt. Please try again or enter details manually.');
      onError && onError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCamera = () => {
    setCameraOpen(true);
  };

  const handleCapture = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCameraOpen(false);
      setImagePreview(imageSrc);
      
      try {
        setLoading(true);
        
        // Convert base64 to blob
        const byteString = atob(imageSrc.split(',')[1]);
        const mimeString = imageSrc.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: mimeString });
        const file = new File([blob], "receipt-image.jpg", { type: "image/jpeg" });
        
        // Process the receipt
        const result = await receiptService.uploadReceipt(file);
        
        // Pass extracted data to parent component
        onProcessed({
          ...result.extractedData,
          receipt: result.receiptUrl
        });
        
      } catch (err) {
        console.error('Receipt processing failed:', err);
        setError('Failed to process receipt. Please try again or enter details manually.');
        onError && onError(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseCameraDialog = () => {
    setCameraOpen(false);
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleClearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Add Receipt Image
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {imagePreview ? (
        <Card variant="outlined" sx={{ mb: 2, position: 'relative' }}>
          <CardContent sx={{ p: 1, pb: '8px !important' }}>
            <Box sx={{ position: 'relative' }}>
              <img 
                src={imagePreview} 
                alt="Receipt preview" 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  maxHeight: '200px',
                  objectFit: 'contain'
                }}
              />
              <IconButton
                size="small"
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0,
                  backgroundColor: 'rgba(255,255,255,0.7)'
                }}
                onClick={handleClearImage}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Processing receipt...
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              fullWidth
              onClick={handleTriggerFileInput}
              disabled={loading}
            >
              Upload
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="outlined"
              startIcon={<CameraAltIcon />}
              fullWidth
              onClick={handleCamera}
              disabled={loading}
            >
              Camera
            </Button>
          </Grid>
        </Grid>
      )}
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />

      {/* Camera Dialog */}
      <Dialog 
        open={cameraOpen} 
        onClose={handleCloseCameraDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ p: 1 }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            videoConstraints={{
              facingMode: "environment"
            }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCapture}
            startIcon={<AddAPhotoIcon />}
          >
            Take Photo
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleCloseCameraDialog}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReceiptUpload;