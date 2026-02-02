
import React, { createContext, useContext, useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface SnackbarContextType {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error'>('success');

  const showError = (msg: string) => {
    setMessage(msg);
    setSeverity('error');
    setOpen(true);
  };

  const showSuccess = (msg: string) => {
    setMessage(msg);
    setSeverity('success');
    setOpen(true);
  };

  useEffect(() => {
    const handleError = (e: any) => {
      showError(e.detail.message);
    };
    window.addEventListener('app-error', handleError);
    return () => window.removeEventListener('app-error', handleError);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showError, showSuccess }}>
      {children}
      <Snackbar 
        open={open} 
        autoHideDuration={6000} 
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpen(false)} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) throw new Error('useSnackbar must be used within SnackbarProvider');
  return context;
};
