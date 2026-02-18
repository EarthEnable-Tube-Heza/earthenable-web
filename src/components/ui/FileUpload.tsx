"use client";

/**
 * FileUpload Component
 *
 * Reusable drag-and-drop file upload component following the EarthEnable design system.
 */

import { useCallback, useRef, useState } from "react";
import { Upload, X, FileText, AlertCircle } from "@/src/lib/icons";

export interface FileUploadProps {
  /** Currently selected files */
  files: File[];
  /** Callback when files change */
  onFilesChange: (files: File[]) => void;
  /** Accepted MIME types (e.g., "image/jpeg,image/png,application/pdf") */
  accept?: string;
  /** Maximum file size in bytes (default: 10MB) */
  maxSize?: number;
  /** Maximum number of files (default: 5) */
  maxFiles?: number;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Label text */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** External error message (e.g., from form-level validation) */
  error?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  files,
  onFilesChange,
  accept,
  maxSize = 10 * 1024 * 1024,
  maxFiles = 5,
  disabled = false,
  label,
  required = false,
  error: externalError,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const error = internalError || externalError || null;

  const validateFile = useCallback(
    (file: File): string | null => {
      const acceptedTypes = accept ? accept.split(",").map((t) => t.trim()) : [];
      if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
        return `"${file.name}" has an unsupported file type.`;
      }
      if (file.size > maxSize) {
        return `"${file.name}" exceeds the maximum size of ${formatFileSize(maxSize)}.`;
      }
      return null;
    },
    [accept, maxSize]
  );

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setInternalError(null);
      const fileArray = Array.from(newFiles);
      const remaining = maxFiles - files.length;

      if (remaining <= 0) {
        setInternalError(`Maximum of ${maxFiles} file(s) allowed.`);
        return;
      }

      const filesToAdd = fileArray.slice(0, remaining);
      const errors: string[] = [];

      const validFiles = filesToAdd.filter((file) => {
        const err = validateFile(file);
        if (err) {
          errors.push(err);
          return false;
        }
        return true;
      });

      if (errors.length > 0) {
        setInternalError(errors[0]);
      }

      if (validFiles.length > 0) {
        onFilesChange([...files, ...validFiles]);
      }
    },
    [files, maxFiles, onFilesChange, validateFile]
  );

  const removeFile = useCallback(
    (index: number) => {
      setInternalError(null);
      const updated = files.filter((_, i) => i !== index);
      onFilesChange(updated);
    },
    [files, onFilesChange]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [disabled, addFiles]
  );

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [addFiles]
  );

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging ? "border-primary bg-primary/5" : error ? "border-status-error bg-status-error/5" : "border-border-primary bg-background-secondary/30"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/60 hover:bg-primary/5"}
        `}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-text-tertiary" />
        <p className="text-sm text-text-secondary">
          <span className="font-medium text-primary">Click to browse</span> or drag and drop
        </p>
        <p className="text-xs text-text-tertiary mt-1">
          Max {formatFileSize(maxSize)} per file, up to {maxFiles} file(s)
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-sm text-error">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between bg-background-secondary rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-text-tertiary shrink-0" />
                <span className="text-sm text-text-primary truncate">{file.name}</span>
                <span className="text-xs text-text-tertiary shrink-0">
                  {formatFileSize(file.size)}
                </span>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="ml-2 p-1 rounded hover:bg-error/10 text-text-tertiary hover:text-error transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
