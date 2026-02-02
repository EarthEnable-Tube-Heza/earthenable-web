import { redirect } from "next/navigation";

/**
 * Root Page
 *
 * Redirects to the dashboard home page.
 */
export default function HomePage() {
  redirect("/dashboard");
}
