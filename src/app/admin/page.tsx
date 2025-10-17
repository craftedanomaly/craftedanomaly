import { redirect } from 'next/navigation';

export default function AdminIndex() {
  // Always route /admin to the dashboard. AuthGuard will gate access.
  redirect('/admin/dashboard');
}
