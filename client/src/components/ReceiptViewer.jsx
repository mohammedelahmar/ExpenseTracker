import React from 'react';
import Modal from './common/Modal';
import { ExternalLink, Receipt, X } from 'lucide-react';
// import { Modal, Button } from 'react-bootstrap'; // Removed

const ReceiptViewer = ({ show, onHide, receiptUrl, description }) => {
  // Determine modal size based on content logic if needed, but 'lg' is generally fine for viewers
  
  // Calculate responsive height for iframe/img
  const getContentHeight = () => {
    // Tailwind classes handle responsiveness better, but for inline styles if needed:
    return '70vh';
  };

  return (
    <Modal 
      isOpen={show} 
      onClose={onHide} 
      title={description ? `Receipt for "${description}"` : "Receipt"}
      size="lg"
    >
      <div className="text-center h-[60vh] md:h-[70vh] flex flex-col justify-center bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
        {receiptUrl ? (
          /\.pdf($|\?)/i.test(receiptUrl) ? (
            <iframe
              title="Receipt PDF"
              src={receiptUrl}
              className="w-full h-full border-0"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img 
                src={receiptUrl} 
                alt="Receipt" 
                className="max-h-full max-w-full object-contain rounded shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/400x600?text=Receipt+Image+Not+Available";
                }}
              />
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-blue-500 bg-blue-50 rounded-lg m-4">
            <Receipt size={64} className="mb-4 opacity-50" />
            <p className="font-medium">No receipt available</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
        {receiptUrl && (
          <a 
            href={receiptUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all"
          >
            <ExternalLink size={18} />
            Open in New Tab
          </a>
        )}
        <button 
          onClick={onHide} 
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
        >
          <X size={18} />
          Close
        </button>
      </div>
    </Modal>
  );
};

export default ReceiptViewer;