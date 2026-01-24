/**
 * Icon System
 *
 * Centralized icon exports for the navigation system.
 * Uses lucide-react for consistent, accessible icons.
 *
 * Benefits of this export file:
 * - Single import location for navigation icons
 * - Easy to swap icon library in the future
 * - Type safety with LucideIcon type
 */

// Re-export lucide-react icons used in navigation
export {
  // Navigation module icons
  Home,
  LayoutDashboard,
  Briefcase,
  DollarSign,
  Users,
  BarChart3,
  Settings,

  // Navigation item icons
  ClipboardList,
  Phone,
  FileText,
  UserCog,
  Activity,
  Server,
  RefreshCw,
  Bell,
  MessageSquare,
  Palette,

  // UI icons for sidebar controls
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  MoreHorizontal,

  // Additional utility icons
  LogOut,
  User,
  Building,
  Shield,
  Lock,
  Unlock,
  Check,
  AlertCircle,
  Info,
  HelpCircle,
} from "lucide-react";

// Export the LucideIcon type for type safety
export type { LucideIcon } from "lucide-react";
