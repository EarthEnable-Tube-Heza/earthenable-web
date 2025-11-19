/**
 * Slide Carousel Component
 * Provides slide-based navigation for documentation with smooth transitions
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Slide {
  id: string;
  content: React.ReactNode;
  title?: string; // Optional title for navigation
}

interface SlideCarouselProps {
  slides: Slide[];
  initialSlide?: number;
  onSlideChange?: (slideIndex: number) => void;
}

export function SlideCarousel({ slides, initialSlide = 0, onSlideChange }: SlideCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const goToSlide = useCallback(
    (index: number) => {
      if (index === currentSlide) return;
      setCurrentSlide(index);
      onSlideChange?.(index);
    },
    [currentSlide, onSlideChange]
  );

  // Handle clicks on internal slide links
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a[data-slide-ref]");

      if (link instanceof HTMLAnchorElement) {
        e.preventDefault();
        const slideRef = link.getAttribute("data-slide-ref");

        // Find slide index by title or id
        const slideIndex = slides.findIndex(
          (slide) =>
            slide.title === slideRef ||
            slide.id === slideRef ||
            slide.title?.toLowerCase().replace(/\s+/g, "-") === slideRef
        );

        if (slideIndex !== -1) {
          goToSlide(slideIndex);
        }
      }
    };

    document.addEventListener("click", handleLinkClick);
    return () => document.removeEventListener("click", handleLinkClick);
  }, [slides, goToSlide]);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide, slides.length]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, nextSlide, prevSlide]);

  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div className="relative pb-0 sm:pb-0 md:pb-0">
      {/* Slide Container - Full height to eliminate scrolling */}
      <div
        className="relative overflow-hidden px-2 sm:px-4 pt-0 pb-2"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="w-full flex-shrink-0 px-1 sm:px-2">
              <div
                className="overflow-hidden rounded-lg border-2 border-primary p-2 sm:p-4 md:p-6"
                style={{
                  height: "calc(100vh - 180px)", // Mobile: ~56px header + 16px padding + 76px bottom nav + 2px borders
                }}
              >
                <div className="h-full overflow-y-auto overflow-x-hidden">
                  <div className="max-w-full break-words">{slide.content}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Navigation Section - Compact Single Row */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border-light bg-white shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-3 sm:py-3">
          <div className="flex items-center justify-between gap-3 sm:gap-4 md:gap-6">
            {/* Previous Button */}
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-border-light bg-white px-3 sm:px-4 md:px-5 py-2 sm:py-2 text-sm sm:text-sm font-medium text-text-primary shadow-sm transition-all hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border-light disabled:hover:text-text-primary"
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>

            {/* Center Section: Progress Bar + Indicators */}
            <div className="flex flex-1 flex-col items-center gap-1.5 sm:gap-2">
              {/* Progress Info */}
              <div className="flex items-center justify-between w-full max-w-md text-xs sm:text-xs">
                <span className="font-medium text-text-primary">
                  Slide {currentSlide + 1} of {slides.length}
                </span>
                <span className="text-text-secondary">{Math.round(progress)}%</span>
              </div>

              {/* Progress Bar */}
              <div className="h-1 sm:h-1 w-full max-w-md overflow-hidden rounded-full bg-background-light">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={currentSlide + 1}
                  aria-valuemin={1}
                  aria-valuemax={slides.length}
                />
              </div>

              {/* Slide Indicators - Hidden on mobile to prevent overflow with many slides */}
              <div className="hidden sm:flex items-center gap-1.5">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => goToSlide(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentSlide
                        ? "w-6 bg-primary"
                        : "w-1.5 bg-border-light hover:bg-primary/50"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={index === currentSlide ? "true" : "false"}
                  />
                ))}
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-border-light bg-white px-3 sm:px-4 md:px-5 py-2 sm:py-2 text-sm sm:text-sm font-medium text-text-primary shadow-sm transition-all hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border-light disabled:hover:text-text-primary"
              aria-label="Next slide"
            >
              <span className="sm:hidden">Next</span>
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={18} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
