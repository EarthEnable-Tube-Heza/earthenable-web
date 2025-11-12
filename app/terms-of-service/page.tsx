"use client";

/**
 * Terms of Service Page
 *
 * Displays EarthEnable Hub's terms of service for employees and contractors
 * Deployed at hub.earthenable.org/terms-of-service (internal use)
 * Note: earthenable.org/terms-of-service is separate (public website visitors)
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Spinner } from "@/src/components/ui";

export default function TermsOfServicePage() {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the terms of service markdown file
    fetch("/TERMS_OF_SERVICE.md")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load terms of service");
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading terms of service:", err);
        setError("Failed to load terms of service. Please try again later.");
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border-light">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="/logo.svg" alt="EarthEnable Logo" width={120} height={69} priority />
          </Link>
          <div className="flex gap-4">
            <Link
              href="/privacy-policy"
              className="text-text-secondary hover:text-primary transition-colors text-sm font-medium"
            >
              Privacy Policy
            </Link>
            <Link
              href="/auth/signin"
              className="text-text-secondary hover:text-primary transition-colors text-sm font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-medium p-8 md:p-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Spinner size="lg" variant="primary" />
              <p className="text-text-secondary mt-4">Loading terms of service...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-status-error mb-4">{error}</p>
              <Link
                href="/"
                className="text-primary hover:text-primary-dark transition-colors underline"
              >
                Return to Home
              </Link>
            </div>
          ) : (
            <div className="prose prose-lg max-w-none">
              {/* Render markdown content as HTML */}
              <div
                className="markdown-content"
                dangerouslySetInnerHTML={{ __html: formatMarkdownToHTML(content) }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-text-secondary text-sm mb-2">
            For inquiries about these terms, contact us at{" "}
            <a
              href="mailto:info@earthenable.org"
              className="text-primary hover:text-primary-dark underline"
            >
              info@earthenable.org
            </a>
          </p>
          <p className="text-text-disabled text-xs">
            © {new Date().getFullYear()} EarthEnable. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}

/**
 * Simple markdown to HTML converter
 * Handles basic markdown formatting for display
 */
function formatMarkdownToHTML(markdown: string): string {
  let html = markdown;

  // Headers (process from most specific to least specific)
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

  // Tables (process before other replacements)
  // Matches tables with optional blank lines between rows
  html = html.replace(
    /^\|(.+)\|\s*\n\s*\|[\s\-:]+\|\s*\n((?:\s*\|.+\|\s*\n?)+)/gim,
    (match, headerRow, bodyRows) => {
      // Parse header cells
      const headers = headerRow
        .split("|")
        .map((h: string) => h.trim())
        .filter((h: string) => h);

      // Parse body rows (filter out empty lines)
      const rows = bodyRows
        .trim()
        .split("\n")
        .filter((row: string) => row.trim() && row.includes("|"))
        .map((row: string) => {
          return row
            .split("|")
            .map((cell: string) => cell.trim())
            .filter((cell: string) => cell);
        });

      // Build HTML table
      let tableHtml = '<table class="min-w-full my-6 border-collapse">';

      // Table header
      tableHtml += '<thead class="bg-background-light border-b-2 border-border-light">';
      tableHtml += "<tr>";
      headers.forEach((header: string) => {
        tableHtml += `<th class="px-4 py-3 text-left text-sm font-semibold text-text-primary">${header}</th>`;
      });
      tableHtml += "</tr></thead>";

      // Table body
      tableHtml += '<tbody class="divide-y divide-border-light">';
      rows.forEach((cells: string[]) => {
        tableHtml += '<tr class="hover:bg-background-light transition-colors">';
        cells.forEach((cell: string) => {
          tableHtml += `<td class="px-4 py-3 text-sm text-text-secondary">${cell}</td>`;
        });
        tableHtml += "</tr>";
      });
      tableHtml += "</tbody></table>";

      return tableHtml;
    }
  );

  // Bold
  html = html.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="font-semibold text-text-primary">$1</strong>'
  );

  // Italic (asterisks)
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

  // Italic (underscores)
  html = html.replace(/_([^_]+)_/g, '<em class="italic">$1</em>');

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-primary hover:text-primary-dark underline" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr class="my-8 border-border-light" />');

  // Unordered lists
  html = html.replace(/^\- (.*$)/gim, '<li class="ml-6 mb-2 text-text-secondary">$1</li>');
  html = html.replace(/(<li.*<\/li>)/s, '<ul class="list-disc my-4">$1</ul>');

  // Paragraphs (exclude tables, headers, lists, hr)
  html = html.replace(
    /^(?!<[uht]|<li|<hr)(.*$)/gim,
    '<p class="mb-4 text-text-secondary leading-relaxed">$1</p>'
  );

  // Code blocks
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-background-light px-2 py-1 rounded text-sm font-mono text-text-primary">$1</code>'
  );

  return html;
}
