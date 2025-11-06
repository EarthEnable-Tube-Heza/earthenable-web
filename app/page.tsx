import { redirect } from 'next/navigation';

/**
 * Root Page
 *
 * Redirects to the component showcase page.
 * TODO: Replace with proper landing page or dashboard redirect.
 */
export default function HomePage() {
  redirect('/dashboard/components');
}
