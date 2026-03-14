import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import AppRouter from './router';
import LoadingSpinner from './components/common/LoadingSpinner';
import ViewAsRoleBanner from './components/common/ViewAsRoleBanner';

export default function App() {
  const { restoreSession, token, user, viewAsRole } = useAuthStore();
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

  const showBanner = user?.role === 'admin' && !!viewAsRole;

  return (
    <div className={showBanner ? 'pt-9' : ''}>
      <ViewAsRoleBanner />
      <AppRouter />
    </div>
  );
}
