import { redirect } from 'next/navigation';

export default function PromosRedirect() {
  redirect('/?admin=open');
}
