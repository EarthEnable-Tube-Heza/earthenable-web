import { pageMetadata } from "@/src/lib/metadata";

export const metadata = pageMetadata.expenses;

export default function ExpensesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
