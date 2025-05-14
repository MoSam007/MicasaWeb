import React, { createContext, useContext, useState } from 'react';
import Toast, { ToastType } from '../components/Toast';

interface UIContextType {
  showToast: (message: string, type: ToastType) => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const UIContext = createContext<UIContextType>({} as UIContextType);

export const useUI = () => useContext(UIContext);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  return (
    <UIContext.Provider value={{ showToast, setLoading: setIsLoading, isLoading }}>
      {children}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </UIContext.Provider>
  );
};