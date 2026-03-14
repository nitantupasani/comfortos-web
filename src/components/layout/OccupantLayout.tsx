import { Outlet } from 'react-router-dom';
import OccupantShell from './OccupantShell';

export default function OccupantLayout() {
  return (
    <OccupantShell showNav>
      <Outlet />
    </OccupantShell>
  );
}
