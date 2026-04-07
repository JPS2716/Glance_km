import { Footer } from "@/components/Footer";
import { GlobeSection } from "@/components/GlobeSection";
import { useAuth } from "@/contexts/AuthContext";
import {
  DETECT_IMAGE_URL,
  DETECT_VIDEO_URL,
  type DetectionSessionPayload,
  RESULTS_SESSION_KEY,
} from "@/lib/api";
import { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const DEMO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80",
    label: "SAR_Offshore_1.jpg",
  },
  {
    src: "https://images.unsplash.com/photo-1468581265549-98fd2a731277?w=600&q=80",
    label: "SAR_Offshore_2.jpg",
  },
  {
    src: "https://images.unsplash.com/photo-1439405326854-014607f0d800?w=600&q=80",
    label: "SAR_Offshore_3.jpg",
  },
  {
    src: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=600&q=80",
    label: "SAR_Offshore_4.jpg",
  },
];

const GALLERY = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBvPKNZe2E8BInxhZhPinx339NUTaB2NaD1_07MwNxg_MyZAIkWMxhqYNb1xkbVwyZnVM1gJ3H0QZOE081TH_jBKjkJ6zfbw9aCpb-ykBmubDwCQk5RWjTFiFrwtZcfH4SzD7e-VfRpTBCz2pxv8wO39EmukvsWyRCSGXO7vdFyfA3trG27C2wuUcSLB164QW3BOVqDpeZOPRbnTkAbc__UDn7ipMvRp07gC42Uqp-VPnX-rYg-hd-JsRdGgJ5MXImqz0uX_Bk5g4Ls",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuARhprBE_bfIfYeu6KcEIrtFwPfgnuMeBgv5XU5lEJqeMoYl9DdGtdL8JEFKcdW158yjkX0b5gtZIH8uAflx7LErAC5bf_jxgnZHAd8KyY7sF8xOZ9HF0pTASjX6P31DQqZzd8YXEE6W9i690994eadbIipeY_kSNckpE-37IcQatxuWigd000LGYxubnFMMK0ObbpM2jE4M6Gry-Xlvpsn1hH7FquJmJkjUQHFz8pOc02Ern4CZHPapbKR_PdYDMhPxQUguGAeY3D0",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAvLt1yu95-duC0hrtnVj6CSTG49mv_TmblcQXpskdHHBcCw5GYfpH37zIUdcJ7ViBOjHaNEgBFyqjmNZISSmBxPRGXAqcZCfrB2zLr5mR6iEZyUHL4-GlECIombcQDahRkVzzGnbdnyIp4oxXNtHUa4VQ-aDDpV3FG2X7OIv1nXreL4qKPxRotl4frb7vmOTUgxNTQKK4SObLmqfJYbNSH8udff6Xl68uqhtiUeDlxUnwQAAamxrWRAqEH5emdODKu885BNrVFzkt8",
];

export function UploadPage() {
  const navigate = useNavigate();
  const { user, saveActivity } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [conf, setConf] = useState(50);
  const [status, setStatus] = useState("Drop your assets here");
  const [subtitle, setSubtitle] = useState(
    "Drag and drop high-resolution video or image sequences. Supports .MP4, .MOV, and .TIFF formats.",
  );
  const [busy, setBusy] = useState(false);

  const onFiles = (list: FileList | null) => {
    setFiles(list);
    if (list?.length) {
      setStatus(`${list.length} file(s) selected`);
      setSubtitle(Array.from(list)
        .map((f) => f.name)
        .join(", "));
    } else {
      setStatus("Drop your assets here");
      setSubtitle(
        "Drag and drop high-resolution video or image sequences. Supports .MP4, .MOV, and .TIFF formats.",
      );
    }
  };

  const loadDemo = async (url: string, displayName: string) => {
    setStatus("Loading sample...");
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("fetch");
      const blob = await res.blob();
      const file = new File([blob], displayName, { type: blob.type || "image/jpeg" });
      const dt = new DataTransfer();
      dt.items.add(file);
      if (inputRef.current) inputRef.current.files = dt.files;
      onFiles(dt.files);
    } catch {
      setStatus("Failed to load sample.");
    }
  };

  const startDetection = useCallback(async () => {
    if (!files?.length) {
      alert("Please select a file to detect first.");
      return;
    }
    const file = files[0];
    const isVideo = file.type.startsWith("video/");
    const endpoint = isVideo ? DETECT_VIDEO_URL : DETECT_IMAGE_URL;
    const url = new URL(endpoint);
    url.searchParams.set("conf", String(conf / 100));

    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(url.toString(), { method: "POST", body: formData });
      if (!response.ok) throw new Error(response.statusText);
      const data = (await response.json()) as {
        output_url: string;
        inference_time_s: number;
        total_detections?: number;
        num_detections?: number;
        total_frames?: number;
      };

      const payload: DetectionSessionPayload = {
        url: data.output_url,
        time: data.inference_time_s,
        detections:
          data.total_detections !== undefined ? data.total_detections : data.num_detections ?? 0,
        frames: data.total_frames ?? 1,
        type: isVideo ? "video" : "image",
        originalName: file.name,
      };
      sessionStorage.setItem(RESULTS_SESSION_KEY, JSON.stringify(payload));

      if (user) {
        await saveActivity(
          file.name,
          data.inference_time_s,
          payload.detections,
          data.output_url,
        );
      }
      navigate("/results");
    } catch (e) {
      console.error(e);
      alert("Failed to process the file. Ensure the detection API is reachable.");
    } finally {
      setBusy(false);
    }
  }, [files, conf, navigate, saveActivity, user]);

  return (
    <>
      <main className="mx-auto w-full max-w-[1440px] flex-grow px-8 pb-20 pt-32 md:px-12">
        <div className="mb-16 max-w-2xl">
          <h1 className="mb-6 font-headline text-5xl font-black leading-tight tracking-tighter md:text-6xl">
            Upload.Detect.{" "}
            <span className="bg-gradient-to-r from-primary to-primary-dim bg-clip-text text-transparent">
              Analyze.
            </span>
          </h1>
          <p className="font-light text-lg leading-relaxed text-on-surface-variant">
            Upload your SAR images and let our AI detect ships in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="group lg:col-span-8">
            <div
              className="relative flex h-[500px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container p-12 text-center transition-all duration-500 hover:border-primary/20 hover:bg-surface-container-high"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onFiles(e.dataTransfer.files);
              }}
            >
              <div className="pointer-events-none absolute inset-0 bg-primary/5 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-outline-variant/10 bg-surface-container-lowest shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                  <span className="material-symbols-outlined text-4xl text-primary">cloud_upload</span>
                </div>
                <h3 className="mb-3 text-2xl font-bold tracking-tight">{status}</h3>
                <p className="mx-auto mb-10 max-w-sm text-on-surface-variant">{subtitle}</p>
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={(e) => onFiles(e.target.files)}
                />
                <button
                  type="button"
                  className="rounded-lg border border-primary/10 bg-surface-container-highest px-8 py-3 font-medium text-primary transition-all duration-300 hover:bg-primary hover:text-on-primary"
                  onClick={() => inputRef.current?.click()}
                >
                  Browse Files
                </button>
              </div>
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: "radial-gradient(#a2c9ff 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
            </div>
          </div>

          <aside className="space-y-8 lg:col-span-4">
            <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-8 backdrop-blur-md">
              <div className="mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-dim">tune</span>
                <h2 className="text-lg font-bold tracking-tight">Configuration</h2>
              </div>
              <div className="mb-10">
                <div className="mb-4 flex items-end justify-between">
                  <label className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
                    Confidence Threshold
                  </label>
                  <span className="font-mono text-lg text-primary">{(conf / 100).toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={conf}
                  onChange={(e) => setConf(Number(e.target.value))}
                  className="accent-primary h-1 w-full cursor-pointer rounded-full bg-surface-container-lowest"
                />
                <p className="mt-4 text-xs italic leading-relaxed text-on-surface-variant/70">
                  Higher values reduce false positives but may exclude distant objects.
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void startDetection()}
                className="w-full rounded-xl bg-gradient-to-br from-primary to-primary-container py-4 font-bold text-on-primary shadow-lg shadow-primary/10 transition-all hover:shadow-primary/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Processing…" : "Start Detection"}
              </button>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-outline-variant/5 bg-surface-container-lowest p-6">
              <div className="rounded-lg bg-primary/10 p-2">
                <span className="material-symbols-outlined text-xl text-primary">info</span>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-bold">Processing Power</h4>
                <p className="text-xs leading-relaxed text-on-surface-variant">
                  Analyses are queued on our high-performance cluster for low-latency feedback.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="mb-1 font-headline text-2xl font-black tracking-tight">
                Try Sample Images
              </h2>
              <p className="text-sm text-on-surface-variant">
                Click any tile to load a demo image as input.
              </p>
            </div>
            <span className="rounded-full border border-outline-variant/10 bg-surface-container px-3 py-1.5 text-xs font-medium text-on-surface-variant">
              Demo assets
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {DEMO_IMAGES.map((d) => (
              <button
                key={d.label}
                type="button"
                onClick={() => void loadDemo(d.src, d.label)}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border-2 border-transparent bg-surface-container transition-all duration-300 hover:border-primary/40"
              >
                <img
                  src={d.src}
                  alt=""
                  className="h-full w-full object-cover opacity-70 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Demo
                  </p>
                  <p className="truncate text-xs font-semibold text-white">{d.label}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-8">
            <h2 className="mb-2 font-headline text-3xl font-black tracking-tight">Model Performance</h2>
            <p className="text-lg text-on-surface-variant">
              Our model achieves excellent detection accuracy:
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-outline-variant/10 bg-surface-container">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant/10 bg-surface-container-high text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                <tr>
                  <th className="px-8 py-5">Split</th>
                  <th className="px-8 py-5">mAP@50</th>
                  <th className="px-8 py-5">Precision</th>
                  <th className="px-8 py-5">Recall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5 text-on-surface">
                {[
                  ["test", "0.9698", "0.9573", "0.9139"],
                  ["test_inshore", "0.9134", "0.9270", "0.8126"],
                  ["test_offshore", "0.9889", "0.9631", "0.9771"],
                ].map(([split, m, p, r]) => (
                  <tr key={split} className="transition-colors hover:bg-surface-container-highest/30">
                    <td className="px-8 py-5 font-medium">{split}</td>
                    <td className="px-8 py-5 font-mono text-primary">{m}</td>
                    <td className="px-8 py-5 font-mono text-primary">{p}</td>
                    <td className="px-8 py-5 font-mono text-primary">{r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-32">
          <div className="mb-12 flex items-end justify-between">
            <h2 className="font-headline text-3xl font-black tracking-tight">Recent Exports</h2>
            <Link to="/history" className="text-sm font-medium text-primary underline-offset-8 transition-all hover:underline">
              View history
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {GALLERY.map((src, i) => (
              <div
                key={src}
                className="group relative aspect-video overflow-hidden rounded-2xl bg-surface-container"
              >
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover opacity-60 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Sample {i + 1}
                  </p>
                  <h4 className="text-lg font-bold">Export preview</h4>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <GlobeSection />
      <Footer />
    </>
  );
}
