/**
 * User Guide Page
 * Comprehensive guide on using the EarthEnable mobile app
 */

"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/src/hooks/useLanguage";
import { Spinner } from "@/src/components/ui";

export default function UserGuidePage() {
  const { language, isLoading: langLoading } = useLanguage();
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fileName = language === "rw" ? "user-guide.rw.md" : "user-guide.en.md";

    fetch(`/docs/${fileName}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load content");
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading content:", err);
        setError("Failed to load user guide. Please try again later.");
        setIsLoading(false);
      });
  }, [language]);

  if (langLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Spinner size="lg" variant="primary" />
        <p className="mt-4 text-text-secondary">Loading user guide...</p>
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
    <div className="prose prose-lg max-w-none">
      <div
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: formatMarkdownToHTML(content) }}
      />
    </div>
  );
}

// Same markdown formatter
function formatMarkdownToHTML(markdown: string): string {
  let html = markdown;
  html = html.replace(
    /^##### (.*$)/gim,
    '<h5 class="text-base font-bold mt-4 mb-2 text-text-primary">$1</h5>'
  );
  html = html.replace(
    /^#### (.*$)/gim,
    '<h4 class="text-lg font-bold mt-5 mb-2 text-text-primary">$1</h4>'
  );
  html = html.replace(
    /^### (.*$)/gim,
    '<h3 class="text-xl font-bold mt-6 mb-3 text-text-primary">$1</h3>'
  );
  html = html.replace(
    /^## (.*$)/gim,
    '<h2 class="text-2xl font-bold mt-8 mb-4 text-text-primary">$1</h2>'
  );
  html = html.replace(
    /^# (.*$)/gim,
    '<h1 class="text-3xl font-bold mt-4 mb-6 text-text-primary">$1</h1>'
  );
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<figure class="my-6"><img src="$2" alt="$1" class="rounded-lg border border-border-light shadow-md cursor-zoom-in hover:opacity-90 transition-opacity max-w-full h-auto" /><figcaption class="mt-2 text-center text-sm text-text-secondary">$1</figcaption></figure>'
  );
  html = html.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="font-semibold text-text-primary">$1</strong>'
  );
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-primary hover:text-primary-dark underline">$1</a>'
  );
  html = html.replace(/^---$/gim, '<hr class="my-8 border-border-light" />');
  html = html.replace(/^\d+\.\s+(.*$)/gim, '<li class="ml-6 mb-2 text-text-secondary">$1</li>');
  html = html.replace(/^[\-\*]\s+(.*$)/gim, '<li class="ml-6 mb-2 text-text-secondary">$1</li>');
  html = html.replace(
    /(<li.*<\/li>(\n<li.*<\/li>)+)/gm,
    '<ul class="list-disc my-4 space-y-2">$1</ul>'
  );
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-background-light px-2 py-1 rounded text-sm font-mono text-text-primary">$1</code>'
  );
  html = html.replace(
    /^(?!<[hul]|<li|<hr|<figure)(.*$)/gim,
    '<p class="mb-4 text-text-secondary leading-relaxed">$1</p>'
  );
  return html;
}
