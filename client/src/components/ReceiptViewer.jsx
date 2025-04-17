import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ReceiptViewer = ({ show, onHide, receiptUrl, description }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Receipt {description && `for "${description}"`}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        {receiptUrl ? (
          <img 
            src={receiptUrl} 
            alt="Receipt" 
            className="img-fluid receipt-full" 
            style={{ maxHeight: '70vh' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/400x600?text=Receipt+Image+Not+Available";
            }}
          />
        ) : (
          <div className="alert alert-info">No receipt available</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {receiptUrl && (
          <Button 
            variant="primary" 
            href={receiptUrl} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Open in New Tab
          </Button>
        )}
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReceiptViewer;