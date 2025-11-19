/**
 * Phone Mockup Component
 * Displays screenshots within a realistic Android device frame
 */

"use client";

import Image from "next/image";

interface PhoneMockupProps {
  src: string;
  alt: string;
  caption?: string;
}

export function PhoneMockup({ src, alt, caption }: PhoneMockupProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Android Device Frame */}
      <div className="relative inline-block">
        {/* Phone body */}
        <div className="relative bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
          {/* Screen bezel */}
          <div className="relative bg-black rounded-[2rem] overflow-hidden">
            {/* Notch/Camera cutout */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-3xl z-10">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-gray-800 rounded-full" />
            </div>

            {/* Screen content */}
            <div className="relative w-[280px] h-[560px] bg-white">
              <Image src={src} alt={alt} fill className="object-cover object-top" sizes="280px" />
            </div>
          </div>

          {/* Power button */}
          <div className="absolute -right-[3px] top-24 w-1 h-12 bg-gray-800 rounded-l-sm" />
          {/* Volume buttons */}
          <div className="absolute -right-[3px] top-40 w-1 h-8 bg-gray-800 rounded-l-sm" />
          <div className="absolute -right-[3px] top-52 w-1 h-8 bg-gray-800 rounded-l-sm" />
        </div>
      </div>

      {/* Caption */}
      {caption && (
        <p className="mt-4 text-center text-xs sm:text-sm text-text-secondary max-w-[280px] break-words">
          {caption}
        </p>
      )}
    </div>
  );
}
