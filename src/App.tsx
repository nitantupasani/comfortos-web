import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import AppRouter from './router';
import LoadingSpinner from './components/common/LoadingSpinner';

export default function App() {
  const { restoreSession, token } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (token) {
      restoreSession().finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return <AppRouter />;
}
