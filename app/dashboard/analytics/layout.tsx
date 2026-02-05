import { pageMetadata } from "@/src/lib/metadata";
import AnalyticsLayoutClient from "./AnalyticsLayoutClient";

export const metadata = pageMetadata.analytics;

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <AnalyticsLayoutClient>{children}</AnalyticsLayoutClient>;
}
