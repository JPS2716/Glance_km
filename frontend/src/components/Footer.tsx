export function Footer() {
  return (
    <footer className="w-full border-t border-[#484848]/10 bg-[#0e0e0e]">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between px-12 py-12 font-['Inter'] text-[12px] leading-relaxed md:flex-row">
        <div className="mb-6 text-[#acabaa] md:mb-0">© 2024 Midnight Atelier. All rights reserved.</div>
        <div className="flex items-center space-x-8">
          <a className="text-[#acabaa] transition-colors hover:text-primary" href="#">
            Privacy
          </a>
          <a className="text-[#acabaa] transition-colors hover:text-primary" href="#">
            Terms
          </a>
          <a className="text-[#acabaa] transition-colors hover:text-primary" href="#">
            Security
          </a>
          <a className="text-[#acabaa] transition-colors hover:text-primary" href="#">
            Status
          </a>
        </div>
      </div>
    </footer>
  );
}
