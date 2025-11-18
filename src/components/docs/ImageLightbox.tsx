/**
 * Image Lightbox Component
 * Click-to-zoom modal for screenshots
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  caption?: string;
}

export function ImageLightbox({ src, alt, caption }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Thumbnail Image */}
      <figure className="my-6">
        <button
          onClick={() => setIsOpen(true)}
          className="block w-full cursor-zoom-in transition-opacity hover:opacity-90"
        >
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            className="rounded-lg border border-border-light shadow-md"
          />
        </button>
        {caption && (
          <figcaption className="mt-2 text-center text-sm text-text-secondary">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Lightbox Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Close image viewer"
          >
            <X size={24} />
          </button>

          {/* Enlarged Image */}
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={src}
              alt={alt}
              width={1600}
              height={1200}
              className="max-h-[90vh] w-auto rounded-lg"
              style={{ objectFit: "contain" }}
            />
            {caption && <p className="mt-4 text-center text-sm text-white">{caption}</p>}
          </div>
        </div>
      )}
    </>
  );
}
