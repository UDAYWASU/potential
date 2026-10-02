import { Link } from "react-router-dom";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#2b2318] font-serif">

      {/* Header */}
      <header className="w-full border-b border-[#d8cbb0] bg-[#f7f3ea]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-[#7a4a25] flex items-center justify-center text-[#f3e6c9] text-sm tracking-widest">
                P
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-base font-semibold tracking-wide text-[#2b2318]">Potential</span>
                <span className="text-[11px] text-[#8a7a5c] tracking-wide">PRPCEM Training &amp; Placement Cell</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-10 text-sm text-[#5c4d33]">
              <Link to="/#capabilities" className="hover:text-[#7a4a25] transition-colors">Capabilities</Link>
              <Link to="/#about" className="hover:text-[#7a4a25] transition-colors">About</Link>
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
        <div className="max-w-4xl mx-auto px-6 lg:px-10 py-20 text-center">
          <span className="text-xs tracking-[0.2em] uppercase text-[#8a7a5c]">Get in touch</span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-medium leading-[1.15] text-[#2b2318]">
            We'd be glad to hear from you.
          </h1>
          <p className="mt-6 text-lg text-[#5c4d33] leading-relaxed max-w-2xl mx-auto">
            Questions about the platform, a partnership enquiry, or simply a word of feedback —
            reach out and the right person will get back to you.
          </p>
        </div>
      </section>

      {/* Contact form + details */}
      <section className="py-24 border-b border-[#d8cbb0]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-14">

          {/* Form */}
          <div className="lg:col-span-7">
            <h2 className="text-2xl font-medium text-[#2b2318] mb-8">Send us a message</h2>

            <form className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs tracking-wide uppercase text-[#8a7a5c] mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-[#c9b98f] bg-white px-4 py-2.5 text-sm text-[#2b2318] focus:outline-none focus:border-[#7a4a25] focus:ring-1 focus:ring-[#7a4a25] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-wide uppercase text-[#8a7a5c] mb-2">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full border border-[#c9b98f] bg-white px-4 py-2.5 text-sm text-[#2b2318] focus:outline-none focus:border-[#7a4a25] focus:ring-1 focus:ring-[#7a4a25] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-wide uppercase text-[#8a7a5c] mb-2">Subject</label>
                <input
                  type="text"
                  required
                  className="w-full border border-[#c9b98f] bg-white px-4 py-2.5 text-sm text-[#2b2318] focus:outline-none focus:border-[#7a4a25] focus:ring-1 focus:ring-[#7a4a25] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs tracking-wide uppercase text-[#8a7a5c] mb-2">Message</label>
                <textarea
                  rows={6}
                  required
                  className="w-full border border-[#c9b98f] bg-white px-4 py-2.5 text-sm text-[#2b2318] focus:outline-none focus:border-[#7a4a25] focus:ring-1 focus:ring-[#7a4a25] transition-colors resize-y"
                />
              </div>

              <button
                type="submit"
                className="px-7 py-3 rounded-sm text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Details */}
          <div className="lg:col-span-5">
            <div className="border border-[#d8cbb0] bg-[#efe6d2] p-8 space-y-7">
              <div>
                <div className="text-xs tracking-[0.2em] uppercase text-[#8a7a5c] mb-2">Office</div>
                <p className="text-sm text-[#2b2318] leading-relaxed">
                  PRPCEM Training &amp; Placement Cell<br />
                  College Campus, Main Building<br />
                  Pune, Maharashtra
                </p>
              </div>

              <div className="border-t border-[#d8cbb0] pt-7">
                <div className="text-xs tracking-[0.2em] uppercase text-[#8a7a5c] mb-2">Email</div>
                <p className="text-sm text-[#2b2318]">placement@prpcem.edu.in</p>
              </div>

              <div className="border-t border-[#d8cbb0] pt-7">
                <div className="text-xs tracking-[0.2em] uppercase text-[#8a7a5c] mb-2">Phone</div>
                <p className="text-sm text-[#2b2318]">+91 00000 00000</p>
              </div>

              <div className="border-t border-[#d8cbb0] pt-7">
                <div className="text-xs tracking-[0.2em] uppercase text-[#8a7a5c] mb-2">Hours</div>
                <p className="text-sm text-[#2b2318]">Monday – Saturday, 9:00 AM – 5:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

{/* Mentor */}
<section className="py-24 border-b border-[#d8cbb0]">
  <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
    <span className="text-xs tracking-[0.2em] uppercase text-[#8a7a5c]">Guidance &amp; Vision</span>
    <h2 className="mt-3 text-3xl font-medium text-[#2b2318]">Mentored by</h2>

    <div className="mt-10 inline-flex flex-col items-center border border-[#d8cbb0] bg-[#efe6d2] px-12 py-10">
      <div className="h-20 w-20 rounded-full bg-[#7a4a25] flex items-center justify-center text-[#f3e6c9] text-2xl tracking-widest mb-5">
        {/* Professor's initial */}
        P
      </div>
      <h3 className="text-xl font-medium text-[#2b2318]">Professor's Full Name</h3>
      <p className="mt-1 text-sm text-[#8a7a5c] tracking-wide">Department Name, PRPCEM</p>
    </div>
  </div>
</section>

{/* Developed by */}
<section className="py-24 border-b border-[#d8cbb0]">
  <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
    <span className="text-xs tracking-[0.2em] uppercase text-[#8a7a5c]">Conceived &amp; Developed by</span>
    <h2 className="mt-3 text-3xl font-medium text-[#2b2318]">Developed by</h2>

    <div className="mt-10 inline-flex flex-col items-center border border-[#d8cbb0] bg-[#efe6d2] px-12 py-10">
      <div className="h-20 w-20 rounded-full bg-[#7a4a25] flex items-center justify-center text-[#f3e6c9] text-2xl tracking-widest mb-5">
        {/* Your initial */}
        Y
      </div>
      <h3 className="text-xl font-medium text-[#2b2318]">Your Full Name</h3>
      <p className="mt-1 text-sm text-[#8a7a5c] tracking-wide">Founder &amp; Developer</p>
    </div>
  </div>
</section>

{/* Supporting Team */}
<section className="py-24">
  <div className="max-w-6xl mx-auto px-6 lg:px-10">
    <div className="text-center mb-14">
      <span className="text-xs tracking-[0.2em] uppercase text-[#8a7a5c]">With Thanks To</span>
      <h2 className="mt-3 text-3xl font-medium text-[#2b2318]">Supporting Team</h2>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-12">
      {[
        { name: "Team Member Name" },
        { name: "Team Member Name" },
        { name: "Team Member Name" },
      ].map((member, i) => (
        <div key={i} className="text-center border-t border-[#c9b98f] pt-6">
          <div className="h-16 w-16 rounded-full bg-[#efe6d2] border border-[#d8cbb0] flex items-center justify-center text-[#7a4a25] text-lg mx-auto mb-4">
            {member.name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0])
              .join("")}
          </div>
          <h3 className="text-base font-medium text-[#2b2318]">{member.name}</h3>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* Footer */}
      <footer className="border-t border-[#d8cbb0] py-8">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8a7a5c] tracking-wide">
          <div>&copy; {new Date().getFullYear()} PRPCEM Training &amp; Placement Cell</div>
          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:text-[#7a4a25] transition-colors">Home</Link>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}