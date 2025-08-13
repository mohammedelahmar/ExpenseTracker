import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ReceiptViewer = ({ show, onHide, receiptUrl, description }) => {
  // Determine modal size based on screen width
  const getModalSize = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'sm' : 'lg';
    }
    return 'lg';
  };

  // Calculate responsive height
  const getContentHeight = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 576) {
        return '50vh';
      } else if (window.innerWidth < 768) {
        return '60vh';
      }
    }
    return '70vh';
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size={getModalSize()} 
      centered
      className="receipt-viewer-modal"
    >
      <Modal.Header closeButton className="receipt-modal-header">
        <Modal.Title className="receipt-modal-title">
          Receipt {description && `for "${description}"`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center receipt-modal-body">
        {receiptUrl ? (
          /\.pdf($|\?)/i.test(receiptUrl) ? (
            <iframe
              title="Receipt PDF"
              src={receiptUrl}
              style={{ 
                width: '100%', 
                height: getContentHeight(), 
                border: 'none',
                borderRadius: '8px'
              }}
            />
          ) : (
            <img 
              src={receiptUrl} 
              alt="Receipt" 
              className="img-fluid receipt-full" 
              style={{ 
                maxHeight: getContentHeight(),
                maxWidth: '100%',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/400x600?text=Receipt+Image+Not+Available";
              }}
            />
          )
        ) : (
          <div className="alert alert-info receipt-no-data">
            <i className="fas fa-receipt mb-2" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
            <p className="mb-0">No receipt available</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="receipt-modal-footer">
        {receiptUrl && (
          <Button 
            variant="primary" 
            href={receiptUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="receipt-open-btn"
          >
            <i className="fas fa-external-link-alt me-2"></i>
            Open in New Tab
          </Button>
        )}
        <Button variant="secondary" onClick={onHide} className="receipt-close-btn">
          <i className="fas fa-times me-2"></i>
          Close
        </Button>
      </Modal.Footer>
      
      <style jsx>{`
        .receipt-viewer-modal .modal-content {
          border-radius: 16px;
          border: none;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        .receipt-modal-header {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-bottom: 1px solid #dee2e6;
          border-radius: 16px 16px 0 0;
          padding: 1.5rem;
        }
        
        .receipt-modal-title {
          font-weight: 600;
          color: #495057;
          font-size: 1.1rem;
        }
        
        .receipt-modal-body {
          padding: 1.5rem;
          background: #fff;
        }
        
        .receipt-modal-footer {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-top: 1px solid #dee2e6;
          border-radius: 0 0 16px 16px;
          padding: 1rem 1.5rem;
          gap: 0.5rem;
        }
        
        .receipt-open-btn {
          background: linear-gradient(45deg, #4361ee, #48cae4);
          border: none;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .receipt-open-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(67, 97, 238, 0.3);
        }
        
        .receipt-close-btn {
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .receipt-close-btn:hover {
          transform: translateY(-2px);
        }
        
        .receipt-no-data {
          border-radius: 12px;
          background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
          border: 1px solid #bbdefb;
          color: #1976d2;
          padding: 2rem;
        }
        
        @media (max-width: 768px) {
          .receipt-modal-header,
          .receipt-modal-body,
          .receipt-modal-footer {
            padding: 1rem;
          }
          
          .receipt-modal-title {
            font-size: 1rem;
          }
          
          .receipt-modal-footer {
            flex-direction: column;
          }
          
          .receipt-open-btn,
          .receipt-close-btn {
            width: 100%;
            justify-content: center;
          }
        }
        
        @media (max-width: 576px) {
          .receipt-modal-header,
          .receipt-modal-body,
          .receipt-modal-footer {
            padding: 0.75rem;
          }
          
          .receipt-modal-title {
            font-size: 0.9rem;
            line-height: 1.3;
          }
          
          .receipt-no-data {
            padding: 1.5rem;
          }
        }
      `}</style>
    </Modal>
  );
};

export default ReceiptViewer;