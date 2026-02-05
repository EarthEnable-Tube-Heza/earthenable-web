import { pageMetadata } from "@/src/lib/metadata";
import TasksLayoutClient from "./TasksLayoutClient";

export const metadata = pageMetadata.tasks;

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return <TasksLayoutClient>{children}</TasksLayoutClient>;
}
