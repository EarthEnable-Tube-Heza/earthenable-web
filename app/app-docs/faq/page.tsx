"use client";

/**
 * FAQ Page - Redesigned with Categories and Accordions
 *
 * Organizes FAQs into categories using Cards and Accordions for better UX.
 * Supports both English and Kinyarwanda.
 */

import { useEffect, useState } from "react";
import { useLanguage } from "@/src/contexts/LanguageContext";
import { Spinner, Card, Accordion } from "@/src/components/ui";
import type { AccordionItemProps } from "@/src/components/ui";

interface FAQCategory {
  id: string;
  title: string;
  icon?: string;
  questions: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
}

export default function FAQPage() {
  const { language, isLoading: langLoading } = useLanguage();
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fileName = language === "rw" ? "faq.rw.md" : "faq.en.md";

    fetch(`/docs/${fileName}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load content");
        return res.text();
      })
      .then((text) => {
        const parsed = parseFAQMarkdown(text);
        setCategories(parsed);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading content:", err);
        setError("Failed to load FAQ. Please try again later.");
        setIsLoading(false);
      });
  }, [language]);

  if (langLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Spinner size="lg" variant="primary" />
        <p className="mt-4 text-text-secondary">
          {language === "rw" ? "Gupakurura Ibibazo Bikunze Kubazwa..." : "Loading FAQ..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-status-error bg-status-error/10 p-6">
        <p className="text-status-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-text-primary mb-3">
          {language === "rw" ? "Ibibazo Bikunze Kubazwa (FAQ)" : "Frequently Asked Questions (FAQ)"}
        </h1>
        <p className="text-sm sm:text-base text-text-secondary">
          {language === "rw"
            ? "Kubona ibisubizo ku bibazo bisanzwe bijyanye no gukoresha porogaramu ya EarthEnable"
            : "Find answers to common questions about using the EarthEnable mobile app"}
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {categories.map((category) => (
          <FAQCategoryCard key={category.id} category={category} />
        ))}
      </div>

      {/* Footer Help Section */}
      <Card variant="bordered" padding="lg" className="mt-12 bg-background-light">
        <div className="text-center">
          <h3 className="font-heading font-semibold text-lg text-text-primary mb-2">
            {language === "rw" ? "Ntugasubira Ibibazo Byawe?" : "Still have questions?"}
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            {language === "rw"
              ? "Hamagara itsinda ryacu ryo gufasha. Tuzagusubiza mu gihe cyo gukora."
              : "Contact our support team. We'll get back to you during business hours."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href="mailto:support@earthenable.org"
              className="text-primary hover:text-primary-dark underline font-medium"
            >
              support@earthenable.org
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * FAQ Category Card Component
 */
function FAQCategoryCard({ category }: { category: FAQCategory }) {
  // Convert questions to accordion items
  const accordionItems: AccordionItemProps[] = category.questions.map((q) => ({
    id: q.id,
    title: q.question,
    content: (
      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: q.answer }} />
    ),
  }));

  return (
    <Card variant="elevated" padding="none" className="overflow-hidden">
      {/* Category Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 bg-background-light border-b border-border-light">
        <div className="flex items-center gap-3">
          {category.icon && <span className="text-2xl">{category.icon}</span>}
          <h2 className="font-heading font-semibold text-lg sm:text-xl text-text-primary">
            {category.title}
          </h2>
        </div>
      </div>

      {/* Questions Accordion */}
      <div className="py-2">
        <Accordion items={accordionItems} allowMultiple variant="default" />
      </div>
    </Card>
  );
}

/**
 * Parse FAQ Markdown into structured categories
 */
function parseFAQMarkdown(markdown: string): FAQCategory[] {
  const categories: FAQCategory[] = [];
  const lines = markdown.split("\n");

  let currentCategory: FAQCategory | null = null;
  let currentQuestion = "";
  let currentAnswer: string[] = [];
  let inAnswer = false;

  // Icon mapping for categories (can be customized)
  const categoryIcons: Record<string, string> = {
    "Account & Sign-In": "👤",
    "Konti & Kwinjira": "👤",
    "Tasks & Task Management": "📋",
    "Imirimo & Gukurikirana Imirimo": "📋",
    "Offline Mode & Syncing": "🔄",
    "Offline & Kuvugurura": "🔄",
    "FormYoula Integration": "📝",
    "Guhuza na FormYoula": "📝",
    "Language & Localization": "🌐",
    "Ururimi & Localization": "🌐",
    "Performance & Technical Issues": "⚙️",
    "Imikorere & Ibibazo bya Tekiniki": "⚙️",
    "Data & Privacy": "🔒",
    "Amakuru & Ibanga": "🔒",
    "App Updates": "🔄",
    "Ivugurura rya Porogaramu": "🔄",
    "Device & Compatibility": "📱",
    "Telefone & Ihuye": "📱",
    "Getting Help": "💬",
    "Kubona Ubufasha": "💬",
  };

  const saveCurrentQuestion = () => {
    if (currentCategory && currentQuestion && currentAnswer.length > 0) {
      const answerHtml = processMarkdownToHTML(currentAnswer.join("\n"));
      currentCategory.questions.push({
        id: `q-${currentCategory.id}-${currentCategory.questions.length}`,
        question: currentQuestion.replace(/^###\s*Q:\s*/i, "").trim(),
        answer: answerHtml,
      });
    }
    currentQuestion = "";
    currentAnswer = [];
    inAnswer = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Category header (## Title)
    if (line.match(/^##\s+(?!#)/)) {
      saveCurrentQuestion();

      const title = line.replace(/^##\s+/, "").trim();

      // Skip certain headers
      if (
        title.includes("Table of Contents") ||
        title.includes("Frequently Asked Questions") ||
        title.includes("Common Questions") ||
        title.includes("Ibibazo Bikunze Kubazwa") ||
        title.includes("Ibibazo Bisanzwe")
      ) {
        continue;
      }

      currentCategory = {
        id: `cat-${categories.length}`,
        title,
        icon: categoryIcons[title] || "❓",
        questions: [],
      };
      categories.push(currentCategory);
    }
    // Question header (### Q:)
    else if (line.match(/^###\s*Q:/i) || line.match(/^###\s*Ikibazo:/i)) {
      saveCurrentQuestion();
      currentQuestion = line;
      inAnswer = false;
    }
    // Answer marker (**A:** or **Igisubizo:**)
    else if (line.match(/^\*\*A:\*\*/i) || line.match(/^\*\*Igisubizo:\*\*/i)) {
      inAnswer = true;
      currentAnswer.push(line);
    }
    // Content lines
    else if (inAnswer && line !== "---") {
      currentAnswer.push(line);
    }
    // Separator (---)
    else if (line === "---") {
      saveCurrentQuestion();
    }
  }

  // Save last question
  saveCurrentQuestion();

  return categories.filter((cat) => cat.questions.length > 0);
}

/**
 * Convert markdown to HTML with proper formatting
 */
function processMarkdownToHTML(markdown: string): string {
  let html = markdown;

  // Bold (**text**)
  html = html.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="font-semibold text-text-primary">$1</strong>'
  );

  // Italic (*text*)
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

  // Code (`code`)
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-background-light px-2 py-0.5 rounded text-sm font-mono text-primary">$1</code>'
  );

  // Links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-primary hover:text-primary-dark underline" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Numbered lists (1. item)
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 mb-2">$1</li>');

  // Unordered lists (- item or * item)
  html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li class="ml-4 mb-2">$1</li>');

  // Wrap consecutive list items
  html = html.replace(
    /(<li.*?<\/li>(?:\n<li.*?<\/li>)*)/gm,
    '<ul class="list-disc my-3 space-y-1">$1</ul>'
  );

  // Blockquotes (> text)
  html = html.replace(
    /^&gt;\s*(.*)$/gm,
    '<blockquote class="border-l-4 border-primary pl-4 italic text-text-secondary my-3">$1</blockquote>'
  );

  // Paragraphs (wrap lines that don't start with HTML tags)
  html = html.replace(
    /^(?!<[hulfb]|<li|<blockquote)(.+)$/gm,
    '<p class="mb-2 text-text-secondary leading-relaxed">$1</p>'
  );

  return html;
}
