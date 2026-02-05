import { pageMetadata } from "@/src/lib/metadata";

export const metadata = pageMetadata.settings;

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
