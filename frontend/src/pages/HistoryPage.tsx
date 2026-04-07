import { GlobeSection } from "@/components/GlobeSection";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Row = {
  id?: string;
  filename: string;
  upload_time: string;
  inference_time: number;
  total_detections: number;
  output_url: string;
};

export function HistoryPage() {
  const { user, loading } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setRows([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      if (!supabase) {
        setError("Supabase not configured");
        return;
      }
      const { data, error: e } = await supabase
        .from("activity_history")
        .select("*")
        .order("upload_time", { ascending: false });
      if (cancelled) return;
      if (e) {
        setError(e.message);
        return;
      }
      setRows((data as Row[]) ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  const body = () => {
    if (loading || rows === null) {
      return (
        <div className="col-span-full py-10 text-center text-on-surface-variant">
          Loading your history…
        </div>
      );
    }
    if (!user) {
      return (
        <div className="col-span-full flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-outline-variant/20 py-24 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant">lock</span>
          <p className="text-lg font-medium text-on-surface-variant">
            Please{" "}
            <Link to="/login" className="font-bold text-primary hover:underline">
              log in
            </Link>{" "}
            to view your activity history.
          </p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="col-span-full py-10 text-center text-red-400">
          Error loading history: {error}
        </div>
      );
    }
    if (rows.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-outline-variant/20 py-24 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant">search_off</span>
          <p className="text-lg font-medium text-on-surface-variant">No activity yet.</p>
          <Link
            to="/upload"
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
          >
            Go to Upload
          </Link>
        </div>
      );
    }

    return rows.map((item) => {
      const isVideo = /\.(mp4|mov|avi)$/i.test(item.filename);
      const outputUrl = item.output_url.startsWith("http")
        ? item.output_url
        : `https://glance-km-2.onrender.com${item.output_url}`;
      const dateStr = new Date(item.upload_time).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      return (
        <button
          key={item.id ?? `${item.upload_time}-${item.filename}`}
          type="button"
          className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container transition-all hover:border-primary/30"
          onClick={() => window.open(outputUrl, "_blank")}
        >
          <div className="relative h-48 w-full flex-shrink-0 overflow-hidden bg-black">
            {isVideo ? (
              <video
                src={outputUrl}
                className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                loop
                muted
                playsInline
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
              />
            ) : (
              <img
                src={outputUrl}
                alt=""
                className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100"
              />
            )}
          </div>
          <div className="flex flex-grow flex-col p-6 text-left">
            <h3 className="mb-1 truncate text-base font-bold tracking-tight text-on-surface">
              {item.filename}
            </h3>
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-primary">{dateStr}</p>
            <div className="mt-auto flex items-center gap-6 text-sm text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">schedule</span>
                {item.inference_time}s
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">center_focus_strong</span>
                {item.total_detections} ship{item.total_detections !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </button>
      );
    });
  };

  return (
    <>
      <main className="mx-auto w-full max-w-[1440px] flex-grow px-8 pb-24 pt-32 md:px-12">
        <div className="mb-12">
          <h1 className="mb-2 text-5xl font-black tracking-tight text-on-surface">Your Activity</h1>
          <p className="text-lg text-on-surface-variant">Past detections saved to your cloud vault.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{body()}</div>
      </main>
      <GlobeSection />
    </>
  );
}
