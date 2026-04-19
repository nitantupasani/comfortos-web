import { Navigate } from 'react-router-dom';

// Vote form is now edited per-building under /fm/buildings?id=X&tab=vote-form.
export default function FMVoteFormConfig() {
  return <Navigate to="/fm/buildings" replace />;
}
