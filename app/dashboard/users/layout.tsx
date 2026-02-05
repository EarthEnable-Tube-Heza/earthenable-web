import { pageMetadata } from "@/src/lib/metadata";
import UsersLayoutClient from "./UsersLayoutClient";

export const metadata = pageMetadata.users;

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return <UsersLayoutClient>{children}</UsersLayoutClient>;
}
