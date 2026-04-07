import { GlobeSection } from "@/components/GlobeSection";
import { type FormEvent, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export function HomePage() {
  const location = useLocation();
  useEffect(() => {
    const id = location.hash.replace(/^#/, "");
    if (!id) return;
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.hash, location.pathname]);

  const onContact = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim();
    if (!name || !email || !message) return;
    const subject = encodeURIComponent(`Glance Inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    );
    window.location.href = `mailto:premsahith.j24@iiits.in?subject=${subject}&body=${body}`;
  };

  return (
    <main className="mx-auto max-w-[1440px] space-y-32 px-8 pb-24 pt-32 md:px-12">
      <section className="grid grid-cols-1 items-end gap-12 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">
            Ocean Intelligence
          </span>
          <h1 className="text-6xl font-black leading-[0.9] tracking-tighter text-on-surface md:text-8xl">
            Turning Radar Echoes into <span className="text-primary/80">Ship Detection.</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-on-surface-variant">
            An AI-powered system that detects ships in SAR imagery, transforming radar data into precise
            insights for marine monitoring surveillance, and real-time decision-making.
          </p>
        </div>
        <div className="flex justify-end lg:col-span-4">
          <div className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-surface-container">
            <img
              className="h-full w-full object-cover grayscale opacity-60 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100"
              alt=""
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9lYAg9aOMe0wYcVuspfehY2uaXnE6XvGaVJE54Oih-tx-tTdV36E20a2Fpm4QSlkZ7S3YgFS0JdVsCjwbGclF6twvsgldoFH6nFKSwKuV3iL1GV4itblelxvvKEBjjrSX_U3l72KN1wzQdE-aJj-J3IfITTR6KSI29uYEZrimrb8UpPlqRCYf9JfC0ITvE6ZPurFmgdOG2HfShif0HqkN2WU-o9KfZGn4ZDHvIGJmTx40u-NrOx1c3LTpdV_Azu9xmDrRxnHl48JQ"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-4 rounded-2xl bg-surface-container-low p-12 md:col-span-2">
          <span className="material-symbols-outlined text-4xl text-primary">neurology</span>
          <h3 className="text-3xl font-bold tracking-tight">YOLO lightweight models</h3>
          <p className="leading-relaxed text-on-surface-variant">
            We use YOLO lightweight models, such as YOLOv8n to detect ships in SAR imagery, transforming
            radar data into precise insights for marine monitoring surveillance, and real-time decision-making.
          </p>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-outline-variant/10 bg-surface-container p-12">
          <span className="material-symbols-outlined text-4xl text-primary-dim">security</span>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Vault Integrity</h3>
            <p className="text-sm text-on-surface-variant">
              Encrypted at the atomic level, ensuring your intellectual assets remain yours alone.
            </p>
          </div>
        </div>
      </div>

      <section id="upload-section" className="mx-auto w-full max-w-4xl">
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-4xl font-black tracking-tight">Upload Your Files.</h2>
          <p className="text-on-surface-variant">
            Drag and drop your archives to begin the synthesis process.
          </p>
        </div>
        <Link
          to="/upload"
          className="group flex cursor-pointer flex-col items-center justify-center space-y-6 rounded-3xl border-2 border-dashed border-outline-variant/30 bg-surface-container-lowest p-16 transition-colors hover:border-primary/40"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-container-high transition-transform duration-500 group-hover:scale-110">
            <span className="material-symbols-outlined text-3xl text-primary">cloud_upload</span>
          </div>
          <div className="text-center">
            <p className="font-medium text-on-surface">
              Go to upload — <span className="cursor-pointer text-primary hover:underline">open analyzer</span>
            </p>
            <p className="mt-2 text-xs text-on-surface-variant">Support for PNG, JPEG, MP4 (Max 128MB)</p>
          </div>
        </Link>
      </section>

      <section
        id="contact-section"
        className="grid grid-cols-1 items-start gap-24 border-t border-outline-variant/10 pt-32 lg:grid-cols-2 scroll-mt-28"
      >
        <div className="space-y-8">
          <h2 className="text-5xl font-black tracking-tighter">Contact Us:.</h2>
          <p className="text-lg leading-relaxed text-on-surface-variant">
            We&apos;d love to hear from you. Get in touch anytime.
          </p>
          <p className="text-xs text-on-surface-variant/90">
            Below this section:{" "}
            <a className="font-semibold text-primary hover:underline" href="#globe-section">
              interactive globe map
            </a>{" "}
            (global coverage visualization).
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-on-surface">
              <span className="material-symbols-outlined text-primary">mail</span>
              <span className="font-medium">premsahith.j24@iiits.in</span>
            </div>
            <div className="flex items-center gap-4 text-on-surface">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <span className="font-medium">Based in IIIT SriCity</span>
            </div>
          </div>
        </div>
        <form
          onSubmit={onContact}
          className="space-y-6 rounded-2xl bg-surface-container p-10"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Full Name
              </label>
              <input
                name="name"
                required
                className="w-full rounded-lg border-none bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-1 focus:ring-primary/40"
                placeholder="Identity"
                type="text"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Email
              </label>
              <input
                name="email"
                required
                className="w-full rounded-lg border-none bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-1 focus:ring-primary/40"
                placeholder="Communication Path"
                type="email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Message
            </label>
            <textarea
              name="message"
              required
              rows={4}
              className="w-full rounded-lg border-none bg-surface-container-lowest text-on-surface placeholder:text-outline-variant focus:ring-1 focus:ring-primary/40"
              placeholder="Describe your objective..."
            />
          </div>
          <button
            type="submit"
            className="editorial-gradient w-full rounded-lg py-4 font-bold text-on-primary transition-opacity hover:opacity-90"
          >
            Transmit Request
          </button>
        </form>
      </section>

      <GlobeSection />
    </main>
  );
}
