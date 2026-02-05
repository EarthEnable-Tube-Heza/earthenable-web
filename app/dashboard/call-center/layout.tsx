import { pageMetadata } from "@/src/lib/metadata";

export const metadata = pageMetadata.callCenter;

/**
 * Call Center Section Layout
 *
 * Simple passthrough layout - each page handles its own header and tabs
 * to allow page-specific actions in the header area.
 */
export default function CallCenterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
