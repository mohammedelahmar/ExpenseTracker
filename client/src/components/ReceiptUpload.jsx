import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { Upload, Camera, X, Loader2, AlertCircle, FileText } from 'lucide-react';
import receiptService from '../services/receiptService';
import Modal from './common/Modal';

const ReceiptUpload = ({ onProcessed, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPdf, setIsPdf] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      
      const previewUrl = URL.createObjectURL(file);
      const nameLower = (file.name || '').toLowerCase();
      const pdf = file.type === 'application/pdf' || nameLower.endsWith('.pdf');
      setIsPdf(!!pdf);
      setImagePreview(previewUrl);

      const result = await receiptService.uploadReceipt(file);
      
      onProcessed({
        ...result.extractedData,
        receipt: result.receiptUrl
      });
      
    } catch (err) {
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
      setIsPdf(false);
      setImagePreview(imageSrc);
      
      try {
        setLoading(true);
        
        const byteString = atob(imageSrc.split(',')[1]);
        const mimeString = imageSrc.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([blob], { type: mimeString });
        const file = new File([blob], "receipt-image.jpg", { type: "image/jpeg" });
        
        const result = await receiptService.uploadReceipt(file);
        
        onProcessed({
          ...result.extractedData,
          receipt: result.receiptUrl
        });
        
      } catch (err) {
        setError('Failed to process receipt. Please try again or enter details manually.');
        onError && onError(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setIsPdf(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fix for Blob construction error in handleCapture:
  // const blob = new Blob([ab], ...); was correct in original code. 
  // Wait, I copied `blob` inside Blob constructor in my head? No, let's copy logic carefully.

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
        Add Receipt (Image or PDF)
      </h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
      
      {imagePreview ? (
        <div className="relative bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="p-2">
            <div className="relative">
              {isPdf ? (
                <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <div className="text-center p-4">
                    <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-500">PDF selected. Will be viewable after upload.</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center bg-gray-50 rounded-lg">
                  <img 
                    src={imagePreview} 
                    alt="Receipt preview" 
                    className="max-h-[200px] w-auto object-contain"
                  />
                </div>
              )}
              
              <button
                onClick={handleClearImage}
                className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white text-gray-600 rounded-full shadow-sm backdrop-blur-sm transition-all"
              >
                <X size={16} />
              </button>
            </div>
            
            {loading && (
              <div className="flex justify-center items-center py-3">
                <Loader2 className="animate-spin text-primary-500 mr-2" size={20} />
                <span className="text-sm text-gray-600">Processing receipt...</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleTriggerFileInput}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={18} />
            Upload
          </button>
          
          <button
            onClick={handleCamera}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera size={18} />
            Camera
          </button>
        </div>
      )}
      
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileUpload}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />

      {/* Camera Modal */}
      <Modal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        title="Take Photo"
        size="md"
      >
        <div className="rounded-lg overflow-hidden bg-black mb-4">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            videoConstraints={{
              facingMode: "environment"
            }}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => setCameraOpen(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleCapture}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-semibold shadow-md"
          >
            <Camera size={18} />
            Capture
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ReceiptUpload;