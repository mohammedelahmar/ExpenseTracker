import React, { useCallback, useEffect, useRef, useState } from 'react';
import bankService from '../../services/bankService';

function loadPlaidScript() {
  return new Promise((resolve, reject) => {
    if (window.Plaid) return resolve();
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

const PlaidLinkButton = ({ onSuccess, onExit, onLinked }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handlerRef = useRef(null);

  const init = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      await loadPlaidScript();
      const data = await bankService.createPlaidLinkToken();
      const token = data.link_token;
      handlerRef.current = window.Plaid.create({
        token,
        onSuccess: async (public_token, metadata) => {
          try {
            const result = await bankService.exchangePlaidPublicToken(public_token, metadata);
            if (onLinked) onLinked(result.accounts || []);
            if (onSuccess) onSuccess(result);
            // Re-create handler for another link if needed
            handlerRef.current?.destroy?.();
            await init();
          } catch (e) {
            setError(e?.message || 'Failed to link bank account.');
          }
        },
        onExit: (err, meta) => {
          if (onExit) onExit(err || new Error('Plaid Link exited'));
        },
      });
    } catch (e) {
      setError('Failed to initialize Plaid.');
    } finally {
      setLoading(false);
    }
  }, [onExit, onLinked, onSuccess]);

  useEffect(() => {
    init();
    return () => {
      handlerRef.current?.destroy?.();
    };
  }, [init]);

  const open = () => handlerRef.current && handlerRef.current.open();

  return (
    <div className="plaid-link-container">
      {error && <div className="alert alert-danger">{error}</div>}
      <button className="btn btn-primary" onClick={open} disabled={loading}>
        Connect via Plaid
      </button>
    </div>
  );
};

export default PlaidLinkButton;
