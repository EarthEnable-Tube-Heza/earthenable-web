"use client";

/**
 * DocumentPreview Component
 *
 * Inline image/PDF viewer for expense attachments.
 * Uses presigned S3 URLs for secure access.
 */

import { useState, useEffect } from "react";
import { Spinner } from "./Spinner";
import { FileText, Download, Eye, AlertCircle } from "@/src/lib/icons";
import { getAttachmentDownloadUrl, ExpenseAttachment } from "@/src/lib/api/expenseClient";
import { cn } from "@/src/lib/theme";

export interface DocumentPreviewProps {
  attachments: ExpenseAttachment[];
  activeAttachmentId?: string;
  onSelect?: (attachmentId: string) => void;
  /** Show a loading skeleton while attachments are being fetched */
  isLoading?: boolean;
}

function isImageType(contentType: string): boolean {
  return contentType.startsWith("image/");
}

function isPdfType(contentType: string): boolean {
  return contentType === "application/pdf";
}

function AttachmentThumbnail({
  attachment,
  isActive,
  onClick,
}: {
  attachment: ExpenseAttachment;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors w-full",
        "hover:bg-primary/5",
        isActive ? "bg-primary/10 border border-primary/30" : "bg-white border border-gray-200"
      )}
    >
      <FileText className="w-4 h-4 text-text-tertiary shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary truncate">{attachment.fileName}</p>
        <p className="text-xs text-text-tertiary">{(attachment.fileSize / 1024).toFixed(0)} KB</p>
      </div>
    </button>
  );
}

export function DocumentPreview({
  attachments,
  activeAttachmentId,
  onSelect,
  isLoading: isLoadingAttachments = false,
}: DocumentPreviewProps) {
  const [selectedId, setSelectedId] = useState<string>(
    activeAttachmentId || attachments[0]?.id || ""
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAttachment = attachments.find((a) => a.id === selectedId);

  // Update selected when activeAttachmentId changes externally
  useEffect(() => {
    if (activeAttachmentId) {
      setSelectedId(activeAttachmentId);
    }
  }, [activeAttachmentId]);

  // Fetch presigned URL when selection changes
  // Uses inline=true so the browser renders the file instead of downloading it
  useEffect(() => {
    if (!selectedId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setPreviewUrl(null);
    setDownloadUrl(null);

    // Fetch both inline (for preview) and attachment (for download) URLs
    const fetchUrls = async () => {
      try {
        const [previewResp, downloadResp] = await Promise.all([
          getAttachmentDownloadUrl(selectedId, true),
          getAttachmentDownloadUrl(selectedId, false),
        ]);
        if (!cancelled) {
          setPreviewUrl(previewResp.url);
          setDownloadUrl(downloadResp.url);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to get preview URL:", err);
          setError("Failed to load preview");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUrls();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelect?.(id);
  };

  if (isLoadingAttachments) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Spinner size="lg" variant="primary" />
        <p className="text-sm text-text-secondary mt-3">Loading attachments...</p>
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <FileText className="w-12 h-12 text-text-tertiary mb-3" />
        <p className="text-sm text-text-secondary">No documents attached</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Preview area */}
      <div className="flex-1 overflow-hidden flex items-center justify-center p-4 bg-gray-100">
        {loading && (
          <div className="flex flex-col items-center gap-3">
            <Spinner size="lg" variant="primary" />
            <p className="text-sm text-text-secondary">Loading document...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-2 text-text-secondary">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && previewUrl && selectedAttachment && (
          <>
            {isImageType(selectedAttachment.contentType) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={selectedAttachment.fileName}
                className="max-w-full max-h-full object-contain rounded"
              />
            )}
            {isPdfType(selectedAttachment.contentType) && (
              <iframe
                src={previewUrl}
                title={selectedAttachment.fileName}
                className="w-full h-full border-0 rounded"
              />
            )}
            {!isImageType(selectedAttachment.contentType) &&
              !isPdfType(selectedAttachment.contentType) && (
                <div className="flex flex-col items-center gap-3">
                  <FileText className="w-12 h-12 text-text-tertiary" />
                  <p className="text-sm text-text-secondary">
                    Preview not available for this file type
                  </p>
                  <a
                    href={downloadUrl || previewUrl}
                    download={selectedAttachment.fileName}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </a>
                </div>
              )}
          </>
        )}
      </div>

      {/* Action bar for current file */}
      {previewUrl && selectedAttachment && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-b bg-white">
          <span className="text-xs text-text-tertiary truncate mr-2">
            {selectedAttachment.fileName}
          </span>
          <div className="flex gap-1 shrink-0">
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Open in new tab"
            >
              <Eye className="w-4 h-4 text-text-secondary" />
            </a>
            <a
              href={downloadUrl || previewUrl}
              download={selectedAttachment.fileName}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4 text-text-secondary" />
            </a>
          </div>
        </div>
      )}

      {/* Thumbnail strip */}
      {attachments.length > 1 && (
        <div className="p-3 space-y-2 overflow-y-auto max-h-[200px]">
          {attachments.map((attachment) => (
            <AttachmentThumbnail
              key={attachment.id}
              attachment={attachment}
              isActive={attachment.id === selectedId}
              onClick={() => handleSelect(attachment.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

DocumentPreview.displayName = "DocumentPreview";
