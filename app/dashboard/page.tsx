import { redirect } from 'next/navigation';

import Dashboard from '../../components/Dashboard';
import { auth } from '../auth';

export const instant = false;


export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return <Dashboard email={session.user.email ?? ''} />;
}