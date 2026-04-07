import { Globe } from "@/components/ui/cobe-globe";
import { GLOBE_ARCS, GLOBE_MARKERS } from "@/lib/globe-data";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/** Shared COBE globe block — matches legacy `glance-globe-section` styling. */
export function GlobeSection({ className = "" }: { className?: string }) {
  return (
    <section
      id="globe-section"
      className={`glance-globe-section relative w-full overflow-hidden border-t border-outline-variant/10 scroll-mt-28 ${className}`}
      aria-label="Global coverage"
    >
      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col items-center px-8 py-16 text-center md:px-12 md:py-24">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">Worldwide</p>
        <h2 className="mb-3 max-w-xl text-3xl font-black tracking-tight text-on-surface md:text-4xl">
          Maritime intelligence, everywhere.
        </h2>
        <p className="mb-10 max-w-md text-sm leading-relaxed text-on-surface-variant">
          Same ocean-grade pipeline—visualized as a living map. Drag to explore.
        </p>
        <div className="mx-auto aspect-square w-full max-w-md min-h-[min(90vw,22rem)] touch-none">
          <ErrorBoundary>
            <Globe
              markers={GLOBE_MARKERS}
              arcs={GLOBE_ARCS}
              markerColor={[0.635, 0.788, 1]}
              baseColor={[0.1, 0.15, 0.2]}
              arcColor={[0.635, 0.788, 1]}
              glowColor={[0.3, 0.5, 0.8]}
              dark={1}
              mapBrightness={10}
              markerSize={0.025}
              markerElevation={0.01}
            />
          </ErrorBoundary>
        </div>
      </div>
    </section>
  );
}
