import { Navigate } from 'react-router-dom';

// Vote form is now edited per-building under /admin/buildings?id=X&tab=vote-form.
export default function AdminVoteFormConfig() {
  return <Navigate to="/admin/buildings" replace />;
}
