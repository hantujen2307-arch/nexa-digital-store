import { Suspense } from 'react';
import AdminPortalView from '@/components/admin/AdminPortalView';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Kelola Pulsa & Token — Admin ALPINO PREM',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPulsaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      }
    >
      <AdminPortalView initialTab="pulsa-token" />
    </Suspense>
  );
}
