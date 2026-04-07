import { Footer } from "@/components/Footer";
import { GlobeSection } from "@/components/GlobeSection";
import {
  type DetectionSessionPayload,
  RESULTS_SESSION_KEY,
} from "@/lib/api";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function ResultsPage() {
  const [data, setData] = useState<DetectionSessionPayload | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(RESULTS_SESSION_KEY);
    if (!raw) {
      setData(null);
      return;
    }
    try {
      setData(JSON.parse(raw) as DetectionSessionPayload);
    } catch {
      setData(null);
    }
  }, []);

  const outputUrl = data?.url
    ? data.url.startsWith("http")
      ? data.url
      : `https://glance-km-2.onrender.com${data.url}`
    : "";

  const download = async () => {
    if (!data?.url || !outputUrl) return;
    try {
      const response = await fetch(outputUrl);
      if (!response.ok) throw new Error("network");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `Glance_Output_${data.originalName || "file"}`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(outputUrl, "_blank");
    }
  };

  const share = async () => {
    if (!outputUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Glance Detection Result",
          text: "Check out this detection result from Glance:",
          url: outputUrl,
        });
      } else {
        await navigator.clipboard.writeText(outputUrl);
        alert("Result URL copied to clipboard!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!data) {
    return (
      <>
        <main className="mx-auto max-w-[1440px] flex-grow px-8 pt-32 md:px-12">
          <p className="text-on-surface-variant">
            No results in session.{" "}
            <Link className="text-primary hover:underline" to="/upload">
              Run detection
            </Link>
            .
          </p>
        </main>
        <GlobeSection />
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-[1440px] px-8 pb-24 pt-32 md:px-12">
        <header className="mb-16 max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Processing Complete
          </div>
          <h1 className="mb-6 font-headline text-5xl font-bold leading-[1.1] tracking-tight text-on-surface md:text-6xl">
            Visual output <br />
            <span className="text-on-surface-variant">refined for precision.</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-on-surface-variant">
            Review your output and performance telemetry.
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="group relative overflow-hidden rounded-xl border border-primary/10 bg-surface-container shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="absolute left-6 top-6 z-10">
                <span className="rounded-md border border-primary/20 bg-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary backdrop-blur">
                  Enhanced Output
                </span>
              </div>
              <div className="absolute bottom-6 right-6 z-10 flex gap-2">
                <button
                  type="button"
                  title="Download"
                  className="rounded-lg bg-surface-container-highest/90 p-2 text-on-surface backdrop-blur transition-all hover:bg-primary hover:text-on-primary"
                  onClick={() => void download()}
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                </button>
                <button
                  type="button"
                  title="Share"
                  className="rounded-lg bg-surface-container-highest/90 p-2 text-on-surface backdrop-blur transition-all hover:bg-primary hover:text-on-primary"
                  onClick={() => void share()}
                >
                  <span className="material-symbols-outlined text-sm">share</span>
                </button>
              </div>
              <div className="overflow-hidden rounded-xl">
                {data.type === "video" ? (
                  <video
                    src={outputUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full rounded-xl object-cover"
                  />
                ) : (
                  <img src={outputUrl} alt="Detection output" className="w-full object-cover" />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-xl border border-outline-variant/5 bg-surface-container-low p-8">
              <h3 className="mb-8 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                System Metrics
              </h3>
              <div className="space-y-10">
                <div>
                  <div className="mb-3 flex items-end justify-between">
                    <span className="text-sm font-medium text-on-surface-variant">Processing Speed</span>
                    <span className="font-mono text-2xl font-bold text-primary">
                      {data.time}
                      <span className="ml-1 text-xs font-normal text-on-surface-variant">s</span>
                    </span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-highest">
                    <div className="h-full w-[84%] rounded-full bg-primary" />
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-end justify-between">
                    <span className="text-sm font-medium text-on-surface-variant">Total Detections</span>
                    <span className="text-2xl font-bold text-primary">{data.detections}</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-highest">
                    <div className="h-full w-full rounded-full bg-primary" />
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-end justify-between">
                    <span className="text-sm font-medium text-on-surface-variant">Frames / media</span>
                    <span className="text-2xl font-bold text-primary">{data.frames}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-24 grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            ["settings_input_hdmi", "Codec Compatibility", "H.265 / HEVC and common raster formats."],
            ["security", "Encrypted Vault", "Results tied to your session workflow."],
            ["api", "JSON Export", "Telemetry available from the detection API response."],
          ].map(([icon, title, desc]) => (
            <div
              key={title}
              className="flex flex-col justify-between rounded-xl bg-surface-container-low p-10"
            >
              <div>
                <span className="material-symbols-outlined mb-6 text-on-surface-variant">{icon}</span>
                <h5 className="mb-2 font-bold text-on-surface">{title}</h5>
                <p className="text-sm text-on-surface-variant">{desc}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
      <GlobeSection />
      <Footer />
    </>
  );
}
