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
import { useLanguage } from "@/src/contexts/LanguageContext";

// Translations
const translations = {
  en: {
    title: "EarthEnable Mobile App Documentation",
    subtitle:
      "Welcome to the complete documentation for the EarthEnable field operations mobile app. Find installation instructions, user guides, and support resources here.",
    currentVersion: "CURRENT VERSION",
    releaseDate: "Released November 2025",
    productionRelease: "Production Release",
    aboutApp: "About the App",
    aboutDescription:
      "The EarthEnable mobile app is an offline-first cross-platform field operations tool designed for staff across Rwanda, Uganda, and Kenya.",
    features: {
      secureAuth: {
        title: "Secure Authentication",
        description: "Sign in safely with your earthenable.org Google account",
      },
      multilingual: {
        title: "Multilingual Support",
        description: "Switch between English and Kinyarwanda for your preferred language",
      },
      offlineTask: {
        title: "Offline Task Management",
        description: "View and update task status even without internet connection",
      },
      location: {
        title: "Location & Navigation",
        description: "View task locations and navigate with Google Maps integration",
      },
      stats: {
        title: "Real-time Statistics",
        description: "Monitor progress with task completion stats and analytics",
      },
      sync: {
        title: "Automatic Sync",
        description: "Data syncs automatically with Salesforce when online",
      },
    },
    keyFeatures: "Key Features",
    detailedTask: {
      title: "Detailed Task Information",
      description:
        "Access all relevant customer details and task requirements. View complete contact information, addresses, and special instructions for each assignment.",
    },
    flexibleCompletion: {
      title: "Flexible Task Completion",
      description:
        "Complete tasks via phone calls and/or redirect to FormYoula for quality evaluation surveys. Support for multiple completion methods ensures flexibility in the field.",
    },
    offlineUpdates: {
      title: "Offline Status Updates",
      description:
        "Update task status immediately, even without connectivity. Changes sync automatically with Salesforce when connection is restored, ensuring no data loss.",
    },
    feedbackSurveys: {
      title: "Dynamic Feedback Surveys",
      description:
        "Structured feedback collection to assess app usage and effectiveness. Help us improve the platform with your insights and suggestions.",
    },
    additionalCapabilities: "Additional Capabilities",
    issueReporting: {
      title: "Built-in Issue Reporting",
      description:
        "Report bugs and technical issues directly from the app with automatic device diagnostics. Our support team receives detailed information to resolve problems quickly.",
      tip: "💡 Pro Tip: Include screenshots when reporting issues for faster resolution",
    },
    seamlessUpdates: {
      title: "Seamless Updates",
      description:
        "Receive automatic updates via Google Play Store and over-the-air (OTA) for instant bug fixes and new features without requiring full app reinstallation.",
      playStore: "PLAY STORE",
      playStoreDesc: "Major updates & new features",
      otaUpdates: "OTA UPDATES",
      otaDesc: "Bug fixes & improvements",
    },
    documentation: "Documentation",
    sections: {
      installation: {
        title: "Installation Guide",
        description:
          "Step-by-step instructions to download and install the EarthEnable mobile app from Managed Google Play.",
        badge: "Start Here",
      },
      userGuide: {
        title: "User Guide",
        description:
          "Complete guide on using the app including signing in, viewing tasks, completing surveys, and syncing data.",
        badge: "Essential",
      },
      faq: {
        title: "FAQ & Troubleshooting",
        description:
          "Common questions and solutions to frequently encountered issues. Find quick answers here.",
        badge: "Help",
      },
    },
    readDocs: "Read documentation →",
    needHelp: "Need Help?",
    technicalSupport: {
      title: "Technical Support",
      description:
        "For technical issues or questions about the app, our support team is here to help:",
      button: "Contact Support",
    },
    reportIssue: {
      title: "Report an Issue",
      description:
        "Found a bug or have feedback? Use the app's built-in issue reporting feature or contact our support team directly. We appreciate your feedback!",
      inApp: "In-App Reporting",
      inAppPath: "Settings → Help & Support → Report Issue",
      email: "Email Support",
    },
    copyright: `© ${new Date().getFullYear()} EarthEnable. All rights reserved.`,
  },
  rw: {
    title: "Inyandiko za Porogaramu ya EarthEnable",
    subtitle:
      "Murakaza neza ku nyandiko zuzuye za porogaramu ya terefone ya EarthEnable. Ushobora kubona amabwiriza yo kwishyiriraho, ibikubiyemo n'ubufasha hano.",
    currentVersion: "VERISIYO IGEZWEHO",
    releaseDate: "Yasohotse mu Gushyingo 2025",
    productionRelease: "Verisiyo ya Nyuma",
    aboutApp: "Ibyerekeye Porogaramu",
    aboutDescription:
      "Porogaramu ya terefone ya EarthEnable ni igikoresho gikora nta murandasi gikenewe, cyakozwe kubakozi bo mu Rwanda, Uganda, na Kenya.",
    features: {
      secureAuth: {
        title: "Kwinjira Bifite Umutekano",
        description: "Injira neza ukoresheje konti yawe ya Google ya earthenable.org",
      },
      multilingual: {
        title: "Indimi Nyinshi",
        description: "Hindura hagati y'Icyongereza n'Ikinyarwanda",
      },
      offlineTask: {
        title: "Gucunga Imirimo Nta Murandasi",
        description: "Reba kandi uhindure imiterere y'imirimo nubwo nta murandasi",
      },
      location: {
        title: "Aho Imirimo iri & Kuyobora",
        description: "Reba aho imirimo iri kandi ukoreshe Google Maps kuyobora",
      },
      stats: {
        title: "Imibare y'Igihe Nyacyo",
        description: "Genzura iterambere hamwe n'imibare y'imirimo yarangiye",
      },
      sync: {
        title: "Guhuza Byikora",
        description: "Amakuru ahuza na Salesforce iyo ufite murandasi",
      },
    },
    keyFeatures: "Ibintu Byingenzi",
    detailedTask: {
      title: "Amakuru Arambuye ku Mirimo",
      description:
        "Kubona amakuru yose yerekeye abakiriya n'ibisabwa. Reba amakuru yuzuye yo guhamagara, aderesi, n'amabwiriza yihariye kuri buri murimo.",
    },
    flexibleCompletion: {
      title: "Gusoza Imirimo Ukoresheje Uburyo Butandukanye",
      description:
        "Soza imirimo ukoresheje guhamagara cyangwa FormYoula kugira ngo usuzume imikorere. Uburyo butandukanye bwo gusoza bugufasha mu murimo.",
    },
    offlineUpdates: {
      title: "Kuvugurura Imiterere Nta Murandasi",
      description:
        "Hindura imiterere y'umurimo ako kanya, nubwo nta murandasi. Impinduka zihuza na Salesforce iyo murandasi yagarutse, bityo nta makuru atakaza.",
    },
    feedbackSurveys: {
      title: "Ibibazo by'Igitekerezo",
      description:
        "Gukusanya ibitekerezo kugira ngo twisuzume gukoresha porogaramu. Dufashe kunoza porogaramu n'ibitekerezo byawe.",
    },
    additionalCapabilities: "Ubushobozi Bw'Inyongera",
    issueReporting: {
      title: "Kumenyesha Ibibazo",
      description:
        "Menyesha amakosa cyangwa ibibazo muri porogaramu hamwe n'amakuru y'ikigendanwa. Itsinda ryacu ry'ubufasha rizakemura ibibazo vuba.",
      tip: "💡 Inama: Ongeraho amafoto iyo umenyesha ibibazo kugira ngo bikemurwe vuba",
    },
    seamlessUpdates: {
      title: "Kuvugurura Byoroshye",
      description:
        "Kubona kuvugurura byikora binyuze kuri Google Play Store cyangwa OTA kugira ngo ukosore amakosa no kongeramo ibintu bishya nta kwishyiriraho porogaramu byose.",
      playStore: "PLAY STORE",
      playStoreDesc: "Kuvugurura gukomeye & ibintu bishya",
      otaUpdates: "KUVUGURURA KWA OTA",
      otaDesc: "Gukosora amakosa & kunoza",
    },
    documentation: "Inyandiko",
    sections: {
      installation: {
        title: "Amabwiriza yo Kwishyiriraho",
        description:
          "Amabwiriza atandukanye yo gukuramo no kwishyiriraho porogaramu ya EarthEnable muri Managed Google Play.",
        badge: "Tangira Hano",
      },
      userGuide: {
        title: "Ubuyobozi bw'Ukoresha",
        description:
          "Ubuyobozi burambuye bwo gukoresha porogaramu harimo kwinjira, kureba imirimo, gusoza ibibazo, no guhuza amakuru.",
        badge: "Vy'Ingenzi",
      },
      faq: {
        title: "Ibibazo Bikunze Kubazwa",
        description:
          "Ibibazo bikunze kubazwa n'ibisubizo by'ibibazo bikunze kuboneka. Bonaho ibisubizo byihuse hano.",
        badge: "Ubufasha",
      },
    },
    readDocs: "Soma inyandiko →",
    needHelp: "Urakeneye Ubufasha?",
    technicalSupport: {
      title: "Ubufasha bw'Ikoranabuhanga",
      description:
        "Ku bibazo by'ikoranabuhanga cyangwa ibibazo ku porogaramu, itsinda ryacu ry'ubufasha rirakubereye:",
      button: "Hamagara Ubufasha",
    },
    reportIssue: {
      title: "Menyesha Ikibazo",
      description:
        "Wabonye ikosa cyangwa ufite igitekerezo? Koresha porogaramu yo kumenyesha ibibazo cyangwa hamagara itsinda ryacu ry'ubufasha. Turakundira ibitekerezo byawe!",
      inApp: "Kumenyesha muri Porogaramu",
      inAppPath: "Igenamiterere → Ubufasha & Inkunga → Menyesha Ikibazo",
      email: "Ubufasha bwa Email",
    },
    copyright: `© ${new Date().getFullYear()} EarthEnable. Uburenganzira bwose burarinzwe.`,
  },
};

export default function AppDocsPage() {
  const { language } = useLanguage();
  const t = translations[language];

  const sections = [
    {
      title: t.sections.installation.title,
      description: t.sections.installation.description,
      icon: Download,
      href: "/app-docs/installation",
      badge: t.sections.installation.badge,
      badgeColor: "bg-primary text-white",
    },
    {
      title: t.sections.userGuide.title,
      description: t.sections.userGuide.description,
      icon: BookOpen,
      href: "/app-docs/user-guide",
      badge: t.sections.userGuide.badge,
      badgeColor: "bg-green text-white",
    },
    {
      title: t.sections.faq.title,
      description: t.sections.faq.description,
      icon: HelpCircle,
      href: "/app-docs/faq",
      badge: t.sections.faq.badge,
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
          {t.title}
        </h1>
        <p className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg text-text-secondary px-2 sm:px-4 break-words">
          {t.subtitle}
        </p>

        <div className="mt-8 sm:mt-12 rounded-lg border border-border-light bg-white p-3 sm:p-6 md:p-8 shadow-sm w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm font-semibold text-text-secondary">
                {t.currentVersion}
              </p>
              <p className="mt-1 text-lg sm:text-2xl font-bold text-text-primary">1.0.0</p>
              <p className="mt-1 text-xs sm:text-sm text-text-secondary">{t.releaseDate}</p>
            </div>
            <div className="rounded-lg bg-green/10 px-2 sm:px-4 py-1 sm:py-2">
              <p className="text-xs sm:text-sm font-semibold text-green whitespace-nowrap">
                {t.productionRelease}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About the App */}
      <div className="w-full overflow-hidden">
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-bold text-text-primary break-words px-1">
          {t.aboutApp}
        </h2>
        <div className="rounded-lg border border-border-light bg-white p-3 sm:p-6 md:p-8 shadow-sm w-full overflow-hidden">
          <p className="mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-text-secondary break-words">
            {t.aboutDescription}
          </p>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 w-full">
            <div className="rounded-lg bg-background-light p-3 sm:p-4 overflow-hidden">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <h3 className="font-semibold text-sm sm:text-base text-text-primary break-words">
                  {t.features.secureAuth.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary break-words">
                {t.features.secureAuth.description}
              </p>
            </div>

            <div className="rounded-lg bg-background-light p-3 sm:p-4 overflow-hidden">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <h3 className="font-semibold text-sm sm:text-base text-text-primary break-words">
                  {t.features.multilingual.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary break-words">
                {t.features.multilingual.description}
              </p>
            </div>

            <div className="rounded-lg bg-background-light p-3 sm:p-4 overflow-hidden">
              <div className="mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <h3 className="font-semibold text-sm sm:text-base text-text-primary break-words">
                  {t.features.offlineTask.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary break-words">
                {t.features.offlineTask.description}
              </p>
            </div>

            <div className="rounded-lg bg-background-light p-3 sm:p-4 overflow-hidden">
              <div className="mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <h3 className="font-semibold text-sm sm:text-base text-text-primary break-words">
                  {t.features.location.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary break-words">
                {t.features.location.description}
              </p>
            </div>

            <div className="rounded-lg bg-background-light p-3 sm:p-4 overflow-hidden">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <h3 className="font-semibold text-sm sm:text-base text-text-primary break-words">
                  {t.features.stats.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary break-words">
                {t.features.stats.description}
              </p>
            </div>

            <div className="rounded-lg bg-background-light p-3 sm:p-4 overflow-hidden">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <h3 className="font-semibold text-sm sm:text-base text-text-primary break-words">
                  {t.features.sync.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary break-words">
                {t.features.sync.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="w-full overflow-hidden">
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-bold text-text-primary break-words px-1">
          {t.keyFeatures}
        </h2>
        <div className="space-y-3 sm:space-y-4 w-full">
          <div className="rounded-lg border border-border-light bg-white p-3 sm:p-4 md:p-6 shadow-sm w-full overflow-hidden">
            <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-text-primary break-words">
              {t.detailedTask.title}
            </h3>
            <p className="text-sm sm:text-base text-text-secondary break-words">
              {t.detailedTask.description}
            </p>
          </div>

          <div className="rounded-lg border border-border-light bg-white p-3 sm:p-4 md:p-6 shadow-sm w-full overflow-hidden">
            <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-text-primary break-words">
              {t.flexibleCompletion.title}
            </h3>
            <p className="text-sm sm:text-base text-text-secondary break-words">
              {t.flexibleCompletion.description}
            </p>
          </div>

          <div className="rounded-lg border border-border-light bg-white p-3 sm:p-4 md:p-6 shadow-sm w-full overflow-hidden">
            <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-text-primary break-words">
              {t.offlineUpdates.title}
            </h3>
            <p className="text-sm sm:text-base text-text-secondary break-words">
              {t.offlineUpdates.description}
            </p>
          </div>

          <div className="rounded-lg border border-border-light bg-white p-3 sm:p-4 md:p-6 shadow-sm w-full overflow-hidden">
            <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-text-primary break-words">
              {t.feedbackSurveys.title}
            </h3>
            <p className="text-sm sm:text-base text-text-secondary break-words">
              {t.feedbackSurveys.description}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Capabilities */}
      <div className="w-full overflow-hidden">
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-bold text-text-primary break-words px-1">
          {t.additionalCapabilities}
        </h2>
        <div className="space-y-3 sm:space-y-4 w-full">
          <div className="rounded-lg border border-border-light bg-white p-3 sm:p-4 md:p-6 shadow-sm w-full overflow-hidden">
            <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-text-primary break-words">
              {t.issueReporting.title}
            </h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base text-text-secondary break-words">
              {t.issueReporting.description}
            </p>
            <div className="rounded-lg bg-blue/10 p-2 sm:p-3 md:p-4 overflow-hidden">
              <p className="text-xs sm:text-sm font-semibold text-blue break-words">
                {t.issueReporting.tip}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border-light bg-white p-3 sm:p-4 md:p-6 shadow-sm w-full overflow-hidden">
            <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-text-primary break-words">
              {t.seamlessUpdates.title}
            </h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base text-text-secondary break-words">
              {t.seamlessUpdates.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
              <div className="flex-1 rounded-lg bg-green/10 p-2 sm:p-3 overflow-hidden">
                <p className="text-xs font-semibold text-green">{t.seamlessUpdates.playStore}</p>
                <p className="mt-1 text-xs sm:text-sm text-text-secondary break-words">
                  {t.seamlessUpdates.playStoreDesc}
                </p>
              </div>
              <div className="flex-1 rounded-lg bg-primary/10 p-2 sm:p-3 overflow-hidden">
                <p className="text-xs font-semibold text-primary">{t.seamlessUpdates.otaUpdates}</p>
                <p className="mt-1 text-xs sm:text-sm text-text-secondary break-words">
                  {t.seamlessUpdates.otaDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Sections */}
      <div className="w-full overflow-hidden">
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-bold text-text-primary break-words px-1">
          {t.documentation}
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
                  {t.readDocs}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Help & Support */}
      <div className="w-full overflow-hidden">
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-bold text-text-primary break-words px-1">
          {t.needHelp}
        </h2>
        <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full">
          <div className="rounded-lg border border-border-light bg-white p-3 sm:p-4 md:p-6 lg:p-8 shadow-sm w-full overflow-hidden">
            <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-text-primary break-words">
              {t.technicalSupport.title}
            </h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base text-text-secondary break-words">
              {t.technicalSupport.description}
            </p>
            <a
              href="mailto:support@earthenable.org"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              {t.technicalSupport.button}
            </a>
          </div>

          <div className="rounded-lg border border-border-light bg-white p-3 sm:p-4 md:p-6 lg:p-8 shadow-sm w-full overflow-hidden">
            <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-text-primary break-words">
              {t.reportIssue.title}
            </h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base text-text-secondary break-words">
              {t.reportIssue.description}
            </p>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 w-full">
              <div className="rounded-lg bg-background-light p-3 sm:p-4 overflow-hidden">
                <p className="mb-1 text-xs sm:text-sm font-semibold text-text-primary break-words">
                  {t.reportIssue.inApp}
                </p>
                <p className="text-[10px] sm:text-xs text-text-secondary break-words">
                  {t.reportIssue.inAppPath}
                </p>
              </div>
              <div className="rounded-lg bg-background-light p-3 sm:p-4 overflow-hidden">
                <p className="mb-1 text-xs sm:text-sm font-semibold text-text-primary break-words">
                  {t.reportIssue.email}
                </p>
                <p className="text-[10px] sm:text-xs text-text-secondary break-words">
                  support@earthenable.org
                </p>
              </div>
            </div>
          </div>

          <div className="text-center w-full">
            <p className="text-xs sm:text-sm text-text-secondary break-words px-2">{t.copyright}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
