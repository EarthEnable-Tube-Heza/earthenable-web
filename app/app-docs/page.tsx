/**
 * App Documentation Landing Page
 * Overview of all available documentation with quick links
 */

import Link from "next/link";
import { Download, BookOpen, HelpCircle, Smartphone } from "lucide-react";

export default function AppDocsPage() {
  const sections = [
    {
      title: "Installation Guide",
      description:
        "Step-by-step instructions to download and install the EarthEnable mobile app from Managed Google Play.",
      icon: Download,
      href: "/app-docs/installation",
      badge: "Start Here",
      badgeColor: "bg-primary text-white",
    },
    {
      title: "User Guide",
      description:
        "Complete guide on using the app including signing in, viewing tasks, completing surveys, and syncing data.",
      icon: BookOpen,
      href: "/app-docs/user-guide",
      badge: "Essential",
      badgeColor: "bg-green text-white",
    },
    {
      title: "FAQ & Troubleshooting",
      description:
        "Common questions and solutions to frequently encountered issues. Find quick answers here.",
      icon: HelpCircle,
      href: "/app-docs/faq",
      badge: "Help",
      badgeColor: "bg-blue text-white",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Smartphone className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mb-4 text-4xl font-bold text-text-primary">
          EarthEnable Mobile App Documentation
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-text-secondary">
          Welcome to the complete documentation for the EarthEnable field operations mobile app.
          Find installation instructions, user guides, and support resources here.
        </p>
      </div>

      {/* App Overview */}
      <div className="mb-12 rounded-lg border border-border-light bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-text-primary">About the App</h2>
        <p className="mb-4 text-text-secondary">
          The EarthEnable mobile app is an offline-first cross-platform field operations tool
          designed for staff across Rwanda, Uganda, and Kenya. It enables users to:
        </p>
        <ul className="ml-6 list-disc space-y-2 text-text-secondary">
          <li>
            <strong>Secure authentication</strong> - Sign in safely with your earthenable.org Google
            account
          </li>
          <li>
            <strong>Multilingual support</strong> - Switch between English and Kinyarwanda for your
            preferred language
          </li>
          <li>
            <strong>Offline task management</strong> - View complete task lists and update status
            even without internet connection
          </li>
          <li>
            <strong>Location mapping with navigation</strong> - View task locations on Google Maps
            and navigate directly (requires internet unless offline maps are pre-downloaded)
          </li>
          <li>
            <strong>Task completion statistics</strong> - Monitor progress with real-time stats for
            full visibility into task completion
          </li>
          <li>
            <strong>Detailed task information</strong> - Access all relevant customer details and
            task requirements
          </li>
          <li>
            <strong>Flexible task completion</strong> - Complete tasks via phone calls and/or
            redirect to FormYoula for quality evaluation surveys
          </li>
          <li>
            <strong>Offline status updates</strong> - Update task status immediately, syncs to
            Salesforce when connection is restored
          </li>
          <li>
            <strong>Automatic data sync</strong> - Task data synchronizes automatically when online,
            keeping everything up to date
          </li>
          <li>
            <strong>Dynamic feedback surveys</strong> - Collect structured feedback and quality
            assurance data
          </li>
          <li>
            <strong>Built-in issue reporting</strong> - Report bugs and technical issues directly
            from the app with automatic device diagnostics
          </li>
          <li>
            <strong>Seamless updates</strong> - Receive automatic updates via Google Play Store and
            over-the-air (OTA) for instant bug fixes
          </li>
        </ul>
      </div>

      {/* Current Version */}
      <div className="mb-12 rounded-lg bg-background-light p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-secondary">CURRENT VERSION</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">1.0.0</p>
            <p className="mt-1 text-sm text-text-secondary">Released January 2025</p>
          </div>
          <div className="rounded-lg bg-green/10 px-4 py-2">
            <p className="text-sm font-semibold text-green">Production Release</p>
          </div>
        </div>
      </div>

      {/* Documentation Sections */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-text-primary">Documentation</h2>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.href}
                href={section.href}
                className="group block rounded-lg border border-border-light bg-white p-6 shadow-sm transition-all hover:border-primary hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white">
                    <Icon size={24} />
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${section.badgeColor}`}
                  >
                    {section.badge}
                  </span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-text-primary group-hover:text-primary">
                  {section.title}
                </h3>
                <p className="text-text-secondary">{section.description}</p>
                <p className="mt-4 text-sm font-semibold text-primary">Read documentation →</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="rounded-lg border border-border-light bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-text-primary">Need Help?</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold text-text-primary">Technical Support</h3>
            <p className="mb-2 text-sm text-text-secondary">
              For technical issues or questions about the app:
            </p>
            <a
              href="mailto:support@earthenable.org"
              className="text-sm font-medium text-primary hover:underline"
            >
              support@earthenable.org
            </a>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-text-primary">Report an Issue</h3>
            <p className="mb-2 text-sm text-text-secondary">
              Found a bug or have feedback? Use the app&apos;s built-in issue reporting feature or
              contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
