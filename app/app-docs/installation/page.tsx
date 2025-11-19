/**
 * Installation Guide Page
 * Renders markdown content for app installation instructions in slide format
 */

"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/src/contexts/LanguageContext";
import { Spinner } from "@/src/components/ui";
import { SlideCarousel, Slide } from "@/src/components/docs/SlideCarousel";

export default function InstallationPage() {
  const { language, isLoading: langLoading } = useLanguage();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fileName = language === "rw" ? "installation.rw.md" : "installation.en.md";

    fetch(`/docs/${fileName}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load content");
        return res.text();
      })
      .then((text) => {
        const parsedSlides = parseMarkdownToSlides(text);
        setSlides(parsedSlides);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading content:", err);
        setError("Failed to load installation guide. Please try again later.");
        setIsLoading(false);
      });
  }, [language]);

  if (langLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Spinner size="lg" variant="primary" />
        <p className="mt-4 text-text-secondary">Loading installation guide...</p>
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

  return <SlideCarousel slides={slides} />;
}

/**
 * Parse markdown content into slides
 * Groups sections logically for better presentation
 */
function parseMarkdownToSlides(markdown: string): Slide[] {
  // Split by ## headers to get all sections
  const sections = markdown.split(/(?=^## )/gm).filter((s) => s.trim());

  const slides: Slide[] = [];
  let slideId = 0;

  sections.forEach((section) => {
    const trimmed = section.trim();
    if (!trimmed) return;

    // Process each section as a slide
    const html = formatMarkdownToHTML(trimmed);
    const id = `slide-${slideId++}`;

    slides.push({
      id,
      content: (
        <div className="prose prose-sm sm:prose-lg max-w-full overflow-hidden">
          <div
            className="markdown-content break-words"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      ),
    });
  });

  return slides;
}

/**
 * Enhanced markdown to HTML converter with 2-column layout for steps with screenshots
 */
function formatMarkdownToHTML(markdown: string): string {
  // First, split content into sections by ## headers
  const sections = markdown.split(/(?=^## )/gm);

  let html = "";

  sections.forEach((section) => {
    if (!section.trim()) return;

    // Check if section has an image (screenshot)
    const hasImage = /!\[([^\]]*)\]\(([^)]+)\)/.test(section);

    if (hasImage && section.startsWith("## Step")) {
      // Extract header, content before image, and image
      const lines = section.split("\n");
      let header = "";
      const contentLines: string[] = [];
      let imageMatch: RegExpMatchArray | null = null;
      let captionText = "";
      let foundImage = false;

      for (const line of lines) {
        if (line.startsWith("## ")) {
          header = line;
        } else if (!foundImage) {
          const imgMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
          if (imgMatch) {
            imageMatch = imgMatch;
            captionText = imgMatch[1];
            foundImage = true;
          } else if (line.trim()) {
            contentLines.push(line);
          }
        } else {
          // Content after image - add to contentLines to process normally
          contentLines.push(line);
        }
      }

      // Process header
      const headerHtml = header.replace(
        /^## (.*)$/,
        '<h2 class="text-2xl font-bold mt-8 mb-4 text-text-primary">$1</h2>'
      );

      // Process content with markdown
      const contentHtml = processMarkdownContent(contentLines.join("\n"));

      // Build 2-column layout
      html += headerHtml;
      html +=
        '<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 my-4 sm:my-6 items-start max-w-full overflow-hidden">';
      html += `<div class="prose prose-sm max-w-full break-words overflow-hidden">${contentHtml}</div>`;

      if (imageMatch) {
        html += `<figure class="mx-auto max-w-full sm:max-w-[375px] lg:sticky lg:top-24"><img src="${imageMatch[2]}" alt="${captionText}" class="w-full rounded-lg border border-border-light shadow-md cursor-zoom-in hover:opacity-90 transition-opacity" /><figcaption class="mt-2 text-center text-xs sm:text-sm text-text-secondary break-words">${captionText}</figcaption></figure>`;
      }

      html += "</div>";
    } else {
      // Regular section without special layout
      html += processMarkdownContent(section);
    }
  });

  return html;
}

/**
 * Process markdown content with standard formatting
 */
function processMarkdownContent(markdown: string): string {
  let html = markdown;

  // Headers (from smallest to largest to avoid conflicts)
  html = html.replace(
    /^##### (.*$)/gim,
    '<h5 class="text-sm sm:text-base font-bold mt-3 sm:mt-4 mb-2 text-text-primary break-words">$1</h5>'
  );
  html = html.replace(
    /^#### (.*$)/gim,
    '<h4 class="text-base sm:text-lg font-bold mt-4 sm:mt-5 mb-2 text-text-primary break-words">$1</h4>'
  );
  html = html.replace(
    /^### (.*$)/gim,
    '<h3 class="text-lg sm:text-xl font-bold mt-4 sm:mt-6 mb-3 text-text-primary break-words">$1</h3>'
  );
  html = html.replace(
    /^## (.*$)/gim,
    '<h2 class="text-xl sm:text-2xl font-bold mt-6 sm:mt-8 mb-3 sm:mb-4 text-text-primary break-words">$1</h2>'
  );
  html = html.replace(
    /^# (.*$)/gim,
    '<h1 class="text-2xl sm:text-3xl font-bold mt-4 mb-4 sm:mb-6 text-text-primary break-words">$1</h1>'
  );

  // Images - mobile device size
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<figure class="my-4 sm:my-6 mx-auto max-w-full sm:max-w-[375px]"><img src="$2" alt="$1" class="w-full rounded-lg border border-border-light shadow-md cursor-zoom-in hover:opacity-90 transition-opacity" /><figcaption class="mt-2 text-center text-xs sm:text-sm text-text-secondary break-words">$1</figcaption></figure>'
  );

  // Bold
  html = html.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="font-semibold text-text-primary">$1</strong>'
  );

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-primary hover:text-primary-dark underline" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr class="my-8 border-border-light" />');

  // Numbered lists
  html = html.replace(/^\d+\.\s+(.*$)/gim, '<li class="ml-6 mb-2 text-text-secondary">$1</li>');

  // Unordered lists
  html = html.replace(/^[\-\*]\s+(.*$)/gim, '<li class="ml-6 mb-2 text-text-secondary">$1</li>');

  // Wrap consecutive list items in ul
  html = html.replace(
    /(<li.*?<\/li>(?:\n<li.*?<\/li>)*)/gm,
    '<ul class="list-disc my-4 space-y-2">$1</ul>'
  );

  // Blockquotes
  html = html.replace(
    /^&gt; (.*)$/gim,
    '<blockquote class="border-l-4 border-primary pl-4 italic text-text-secondary my-4">$1</blockquote>'
  );

  // Code blocks
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-background-light px-2 py-1 rounded text-sm font-mono text-text-primary">$1</code>'
  );

  // Paragraphs (avoid wrapping existing HTML elements)
  html = html.replace(
    /^(?!<[hulfb]|<li|<hr|<figure|<div|<blockquote)(.+)$/gim,
    '<p class="mb-3 sm:mb-4 text-sm sm:text-base text-text-secondary leading-relaxed break-words">$1</p>'
  );

  return html;
}
