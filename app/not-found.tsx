/**
 * Custom 404 Not Found Page
 *
 * Construction-themed page paying tribute to EarthEnable's mission of
 * dignified, affordable housing through eco-friendly sustainable construction
 * in rural Africa.
 */

import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background-primary via-background-light to-white flex items-center justify-center px-4 py-16">
      <div className="max-w-4xl w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.svg"
            alt="EarthEnable Logo"
            width={180}
            height={103}
            priority
            className="h-auto"
          />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-large p-8 md:p-12">
          {/* Construction Icons Header */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0ms' }}>
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '100ms' }}>
              <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '200ms' }}>
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          {/* 404 Message */}
          <div className="text-center mb-8">
            <h1 className="text-6xl md:text-8xl font-heading font-bold text-primary mb-4">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-text-primary mb-4">
              Under Construction
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Oops! This page is still being built. Just like our earthen homes, great things take time
              and careful craftsmanship.
            </p>
          </div>

          {/* Construction Progress Bar */}
          <div className="mb-8">
            <div className="w-full h-4 bg-background-light rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full animate-pulse"
                style={{ width: '75%' }}
              />
            </div>
            <p className="text-sm text-text-secondary text-center mt-2">
              Building progress: 75% complete
            </p>
          </div>

          {/* Mission Statement */}
          <div className="bg-gradient-to-r from-green/5 via-primary/5 to-accent/5 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-text-primary mb-2">
                  Building Dignity, One Home at a Time
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  EarthEnable is transforming lives across Rwanda, Kenya, Zambia, and India through
                  eco-friendly, sustainable construction. We provide dignified, affordable earthen floors
                  to rural families who need them most, replacing dirt floors with smooth, durable surfaces
                  that improve health, reduce maintenance, and create pride in homeownership.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary font-medium rounded-lg hover:bg-background-light transition-colors border-2 border-primary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>

          {/* Footer Quote */}
          <div className="mt-8 pt-6 border-t border-border-light text-center">
            <p className="text-sm text-text-secondary italic">
              "Just as we transform dirt floors into dignified homes, we're building this dashboard
              to transform field operations. Every line of code, like every earthen floor, is laid
              with care and purpose."
            </p>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center shadow-medium">
            <div className="text-2xl font-heading font-bold text-primary">4</div>
            <div className="text-xs text-text-secondary mt-1">Countries</div>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center shadow-medium">
            <div className="text-2xl font-heading font-bold text-secondary">180K+</div>
            <div className="text-xs text-text-secondary mt-1">Floors Installed</div>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center shadow-medium">
            <div className="text-2xl font-heading font-bold text-accent">100%</div>
            <div className="text-xs text-text-secondary mt-1">Eco-Friendly</div>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center shadow-medium">
            <div className="text-2xl font-heading font-bold text-green">∞</div>
            <div className="text-xs text-text-secondary mt-1">Impact</div>
          </div>
        </div>
      </div>
    </div>
  );
}
