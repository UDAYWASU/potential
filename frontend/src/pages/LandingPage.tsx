import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#2b2318] font-serif">

      {/* Header */}
      <header className="w-full border-b border-[#d8cbb0] bg-[#f7f3ea]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-[#7a4a25] flex items-center justify-center text-[#f3e6c9] text-sm tracking-widest">
                P
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-base font-semibold tracking-wide text-[#2b2318]">Potential</span>
                <span className="text-[11px] text-[#8a7a5c] tracking-wide">PRPCEM Training &amp; Placement Cell</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-10 text-sm text-[#5c4d33]">
              <a href="#capabilities" className="hover:text-[#7a4a25] transition-colors">Capabilities</a>
              <a href="#about" className="hover:text-[#7a4a25] transition-colors">About</a>
              <Link to="/login" className="hover:text-[#7a4a25] transition-colors">Sign in</Link>
            </nav>

            <Link
              to="/register"
              className="inline-flex items-center px-5 py-2 rounded-sm text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-[#d8cbb0]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <span className="text-xs tracking-[0.2em] uppercase text-[#8a7a5c]">Est. for institutional placements</span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[3.4rem] font-medium leading-[1.15] text-[#2b2318]">
              Guiding every student from readiness to placement.
            </h1>
            <p className="mt-6 text-lg text-[#5c4d33] leading-relaxed max-w-xl">
              A single, considered home for placement officers, department coordinators,
              and students to run assessments, follow progress, and manage recruitment
              with clarity.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                to="/login"
                className="inline-flex justify-center items-center px-6 py-3 rounded-sm text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors"
              >
                Sign In to Portal
              </Link>
              <Link
                to="/register"
                className="inline-flex justify-center items-center px-6 py-3 rounded-sm text-sm tracking-wide text-[#5c4d33] border border-[#c9b98f] hover:bg-[#efe6d2] transition-colors"
              >
                Create an Account
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="border border-[#d8cbb0] bg-[#efe6d2] p-8">
              <div className="text-xs tracking-[0.2em] uppercase text-[#8a7a5c] mb-6">At a glance</div>
              <div className="space-y-6">
                <div className="flex justify-between items-baseline border-b border-[#d8cbb0] pb-4">
                  <span className="text-sm text-[#5c4d33]">Assessments</span>
                  <span className="text-xl font-medium text-[#2b2318]">Automated</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-[#d8cbb0] pb-4">
                  <span className="text-sm text-[#5c4d33]">Access</span>
                  <span className="text-xl font-medium text-[#2b2318]">Role-based</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-[#5c4d33]">Records</span>
                  <span className="text-xl font-medium text-[#2b2318]">Centralized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="mb-16 max-w-xl">
            <span className="text-xs tracking-[0.2em] uppercase text-[#8a7a5c]">Capabilities</span>
            <h2 className="mt-3 text-3xl font-medium text-[#2b2318]">
              Everything the placement cell needs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-14">
            <div className="border-t border-[#c9b98f] pt-6">
              <h3 className="text-lg font-medium text-[#2b2318] mb-3">Automated Assessments</h3>
              <p className="text-sm text-[#5c4d33] leading-relaxed">
                Standardized technical and aptitude evaluations that scale cleanly
                across campus-wide recruitment drives.
              </p>
            </div>

            <div className="border-t border-[#c9b98f] pt-6">
              <h3 className="text-lg font-medium text-[#2b2318] mb-3">Readiness Analytics</h3>
              <p className="text-sm text-[#5c4d33] leading-relaxed">
                Clear, exportable reporting that helps TPOs and department heads
                track student performance over time.
              </p>
            </div>

            <div className="border-t border-[#c9b98f] pt-6">
              <h3 className="text-lg font-medium text-[#2b2318] mb-3">Role-Based Access</h3>
              <p className="text-sm text-[#5c4d33] leading-relaxed">
                Dedicated portals for TPO officers, department coordinators, and
                students — each seeing only what applies to them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#d8cbb0] py-8">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8a7a5c] tracking-wide">
          <div>&copy; {new Date().getFullYear()} PRPCEM Training &amp; Placement Cell</div>
          <div className="flex items-center space-x-6">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}