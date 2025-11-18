/**
 * App Documentation Landing Page
 * Overview of all available documentation
 */

"use client";

import Link from "next/link";
import {
  Download,
  BookOpen,
  HelpCircle,
  Smartphone,
  CheckCircle2,
  Zap,
  MapPin,
} from "lucide-react";

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
    <div className="space-y-8 sm:space-y-12 px-1 sm:px-3 md:px-0 w-full overflow-hidden">
      {/* Welcome & Introduction */}
      <div className="text-center w-full">
        <div className="mx-auto mb-4 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary/10">
          <Smartphone className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
        </div>
        <h1 className="mb-3 sm:mb-4 text-xl sm:text-3xl md:text-4xl font-bold text-text-primary px-2 break-words">
          EarthEnable Mobile App Documentation
        </h1>
        <p className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg text-text-secondary px-2 sm:px-4 break-words">
          Welcome to the complete documentation for the EarthEnable field operations mobile app.
          Find installation instructions, user guides, and support resources here.
        </p>

        <div className="mt-8 sm:mt-12 rounded-lg border border-border-light bg-white p-3 sm:p-6 md:p-8 shadow-sm w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm font-semibold text-text-secondary">
                CURRENT VERSION
              </p>
              <p className="mt-1 text-lg sm:text-2xl font-bold text-text-primary">1.0.0</p>
              <p className="mt-1 text-xs sm:text-sm text-text-secondary">Released November 2025</p>
            </div>
            <div className="rounded-lg bg-green/10 px-2 sm:px-4 py-1 sm:py-2">
              <p className="text-xs sm:text-sm font-semibold text-green whitespace-nowrap">
                Production Release
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About the App */}
      <div className="w-full overflow-hidden">
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-bold text-text-primary break-words px-1">
          About the App
        </h2>
        <div className="rounded-lg border border-border-light bg-white p-3 sm:p-6 md:p-8 shadow-sm w-full overflow-hidden">
          <p className="mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-text-secondary break-words">
            The EarthEnable mobile app is an offline-first cross-platform field operations tool
            designed for staff across Rwanda, Uganda, and Kenya.
          </p>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 w-full">
            <div className="rounded-lg bg-background-light p-3 sm:p-4 overflow-hidden">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <h3 className="font-semibold text-sm sm:text-base text-text-primary break-words">
                  Secure Authentication
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary break-words">
                Sign in safely with your earthenable.org Google account
              </p>
            </div>

            <div className="rounded-lg bg-background-light p-3 sm:p-4 overflow-hidden">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <h3 className="font-semibold text-sm sm:text-base text-text-primary break-words">
                  Multilingual Support
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary break-words">
                Switch between English and Kinyarwanda for your preferred language
              </p>
            </div>

            <div className="rounded-lg bg-background-light p-3 sm:p-4 overflow-hidden">
              <div className="mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <h3 className="font-semibold text-sm sm:text-base text-text-primary break-words">
                  Offline Task Management
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary break-words">
                View and update task status even without internet connection
              </p>
            </div>

            <div className="rounded-lg bg-background-light p-3 sm:p-4 overflow-hidden">
              <div className="mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <h3 className="font-semibold text-sm sm:text-base text-text-primary break-words">
                  Location & Navigation
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary break-words">
                View task locations and navigate with Google Maps integration
              </p>
            </div>

            <div className="rounded-lg bg-background-light p-3 sm:p-4 overflow-hidden">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <h3 className="font-semibold text-sm sm:text-base text-text-primary break-words">
                  Real-time Statistics
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary break-words">
                Monitor progress with task completion stats and analytics
              </p>
            </div>

            <div className="rounded-lg bg-background-light p-3 sm:p-4 overflow-hidden">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <h3 className="font-semibold text-sm sm:text-base text-text-primary break-words">
                  Automatic Sync
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary break-words">
                Data syncs automatically with Salesforce when online
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="w-full overflow-hidden">
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-bold text-text-primary break-words px-1">
          Key Features
        </h2>
        <div className="space-y-3 sm:space-y-4 w-full">
          <div className="rounded-lg border border-border-light bg-white p-3 sm:p-4 md:p-6 shadow-sm w-full overflow-hidden">
            <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-text-primary break-words">
              Detailed Task Information
            </h3>
            <p className="text-sm sm:text-base text-text-secondary break-words">
              Access all relevant customer details and task requirements. View complete contact
              information, addresses, and special instructions for each assignment.
            </p>
          </div>

          <div className="rounded-lg border border-border-light bg-white p-3 sm:p-4 md:p-6 shadow-sm w-full overflow-hidden">
            <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-text-primary break-words">
              Flexible Task Completion
            </h3>
            <p className="text-sm sm:text-base text-text-secondary break-words">
              Complete tasks via phone calls and/or redirect to FormYoula for quality evaluation
              surveys. Support for multiple completion methods ensures flexibility in the field.
            </p>
          </div>

          <div className="rounded-lg border border-border-light bg-white p-3 sm:p-4 md:p-6 shadow-sm w-full overflow-hidden">
            <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-text-primary break-words">
              Offline Status Updates
            </h3>
            <p className="text-sm sm:text-base text-text-secondary break-words">
              Update task status immediately, even without connectivity. Changes sync automatically
              with Salesforce when connection is restored, ensuring no data loss.
            </p>
          </div>

          <div className="rounded-lg border border-border-light bg-white p-3 sm:p-4 md:p-6 shadow-sm w-full overflow-hidden">
            <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-text-primary break-words">
              Dynamic Feedback Surveys
            </h3>
            <p className="text-sm sm:text-base text-text-secondary break-words">
              Structured feedback collection to assess app usage and effectiveness. Help us improve
              the platform with your insights and suggestions.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Capabilities */}
      <div className="w-full overflow-hidden">
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-bold text-text-primary break-words px-1">
          Additional Capabilities
        </h2>
        <div className="space-y-3 sm:space-y-4 w-full">
          <div className="rounded-lg border border-border-light bg-white p-3 sm:p-4 md:p-6 shadow-sm w-full overflow-hidden">
            <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-text-primary break-words">
              Built-in Issue Reporting
            </h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base text-text-secondary break-words">
              Report bugs and technical issues directly from the app with automatic device
              diagnostics. Our support team receives detailed information to resolve problems
              quickly.
            </p>
            <div className="rounded-lg bg-blue/10 p-2 sm:p-3 md:p-4 overflow-hidden">
              <p className="text-xs sm:text-sm font-semibold text-blue break-words">
                💡 Pro Tip: Include screenshots when reporting issues for faster resolution
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border-light bg-white p-3 sm:p-4 md:p-6 shadow-sm w-full overflow-hidden">
            <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-text-primary break-words">
              Seamless Updates
            </h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base text-text-secondary break-words">
              Receive automatic updates via Google Play Store and over-the-air (OTA) for instant bug
              fixes and new features without requiring full app reinstallation.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
              <div className="flex-1 rounded-lg bg-green/10 p-2 sm:p-3 overflow-hidden">
                <p className="text-xs font-semibold text-green">PLAY STORE</p>
                <p className="mt-1 text-xs sm:text-sm text-text-secondary break-words">
                  Major updates & new features
                </p>
              </div>
              <div className="flex-1 rounded-lg bg-primary/10 p-2 sm:p-3 overflow-hidden">
                <p className="text-xs font-semibold text-primary">OTA UPDATES</p>
                <p className="mt-1 text-xs sm:text-sm text-text-secondary break-words">
                  Bug fixes & improvements
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Sections */}
      <div className="w-full overflow-hidden">
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-bold text-text-primary break-words px-1">
          Documentation
        </h2>
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.href}
                href={section.href}
                className="group block rounded-lg border border-border-light bg-white p-3 sm:p-4 md:p-6 shadow-sm transition-all hover:border-primary hover:shadow-md w-full overflow-hidden"
              >
                <div className="mb-3 sm:mb-4 flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white">
                    <Icon size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <span
                    className={`rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold whitespace-nowrap ${section.badgeColor}`}
                  >
                    {section.badge}
                  </span>
                </div>
                <h3 className="mb-2 text-lg sm:text-xl font-bold text-text-primary group-hover:text-primary break-words">
                  {section.title}
                </h3>
                <p className="text-sm sm:text-base text-text-secondary break-words">
                  {section.description}
                </p>
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-semibold text-primary">
                  Read documentation →
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Help & Support */}
      <div className="w-full overflow-hidden">
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-bold text-text-primary break-words px-1">
          Need Help?
        </h2>
        <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full">
          <div className="rounded-lg border border-border-light bg-white p-3 sm:p-4 md:p-6 lg:p-8 shadow-sm w-full overflow-hidden">
            <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-text-primary break-words">
              Technical Support
            </h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base text-text-secondary break-words">
              For technical issues or questions about the app, our support team is here to help:
            </p>
            <a
              href="mailto:support@earthenable.org"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Contact Support
            </a>
          </div>

          <div className="rounded-lg border border-border-light bg-white p-3 sm:p-4 md:p-6 lg:p-8 shadow-sm w-full overflow-hidden">
            <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-text-primary break-words">
              Report an Issue
            </h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base text-text-secondary break-words">
              Found a bug or have feedback? Use the app&apos;s built-in issue reporting feature or
              contact our support team directly. We appreciate your feedback!
            </p>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 w-full">
              <div className="rounded-lg bg-background-light p-3 sm:p-4 overflow-hidden">
                <p className="mb-1 text-xs sm:text-sm font-semibold text-text-primary break-words">
                  In-App Reporting
                </p>
                <p className="text-[10px] sm:text-xs text-text-secondary break-words">
                  Settings → Help & Support → Report Issue
                </p>
              </div>
              <div className="rounded-lg bg-background-light p-3 sm:p-4 overflow-hidden">
                <p className="mb-1 text-xs sm:text-sm font-semibold text-text-primary break-words">
                  Email Support
                </p>
                <p className="text-[10px] sm:text-xs text-text-secondary break-words">
                  support@earthenable.org
                </p>
              </div>
            </div>
          </div>

          <div className="text-center w-full">
            <p className="text-xs sm:text-sm text-text-secondary break-words px-2">
              © {new Date().getFullYear()} EarthEnable. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
