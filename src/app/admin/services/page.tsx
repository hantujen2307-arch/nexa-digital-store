import { redirect } from 'next/navigation';

export default function ServicesRedirect() {
  redirect('/?admin=open');
}
