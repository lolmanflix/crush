import React, { useEffect, useState, createContext, useContext } from 'react';
interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
}
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
interface LoadingProviderProps {
  children: React.ReactNode;
  minimumLoadingTime?: number;
}
export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  minimumLoadingTime = 2000 // Default minimum loading time in ms (2 seconds)
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTimer, setLoadingTimer] = useState<NodeJS.Timeout | null>(null);
  const setLoading = (loading: boolean) => {
    if (loading) {
      setIsLoading(true);
    } else {
      if (loadingTimer) {
        clearTimeout(loadingTimer);
      }
      // Set a minimum loading time for a better UX
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, minimumLoadingTime);
      setLoadingTimer(timer);
    }
  };
  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);
  // Auto-stop loading after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, minimumLoadingTime);
    return () => {
      clearTimeout(timer);
    };
  }, [minimumLoadingTime]);
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (loadingTimer) {
        clearTimeout(loadingTimer);
      }
    };
  }, [loadingTimer]);
  return <LoadingContext.Provider value={{
    isLoading,
    setLoading,
    startLoading,
    stopLoading
  }}>
      {children}
    </LoadingContext.Provider>;
};