import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/40">
              AS
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">ApniSec</p>
              <p className="text-xs text-slate-400">
                Cloud &amp; Application Security
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 sm:flex">
            <a href="#services" className="hover:text-emerald-400">
              Services
            </a>
            <a href="#use-cases" className="hover:text-emerald-400">
              Use Cases
            </a>
            <a href="#contact" className="hover:text-emerald-400">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border border-slate-700 px-4 py-1.5 text-sm font-medium text-slate-200 hover:border-emerald-500 hover:text-emerald-300"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="hidden rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-slate-950 shadow-sm hover:bg-emerald-400 sm:inline-flex"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20">
        {/* Hero */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-300">
              Security-as-a-Service platform for teams
            </p>
            <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              One place to manage Cloud Security, Red Team and VAPT issues.
            </h1>
            <p className="mt-4 max-w-xl text-sm text-slate-300 sm:text-base">
              ApniSec helps security and engineering teams capture, triage and
              resolve security findings from cloud environments, red team
              engagements and VAPT assessments in a single, auditable dashboard.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-slate-950 shadow-sm hover:bg-emerald-400"
              >
                Start free assessment
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-2 text-sm font-medium text-slate-200 hover:border-emerald-500 hover:text-emerald-300"
              >
                Sign in to dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-emerald-500/10">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-300">
              Live security signal
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2">
                <span className="text-slate-300">Cloud Security</span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
                  3 open issues
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2">
                <span className="text-slate-300">Red Team</span>
                <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-300">
                  1 in progress
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2">
                <span className="text-slate-300">VAPT</span>
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-300">
                  2 high risk
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section
          id="services"
          className="mt-16 border-t border-slate-800 pt-10"
        >
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            Security services we cover
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Modelled after real engagements at security startups: raise Cloud
            Security misconfigurations, Red Team findings and VAPT
            vulnerabilities, then track remediation end-to-end.
          </p>
          <div className="mt-6 grid gap-5 text-sm md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-emerald-300">
                Cloud Security
              </p>
              <p className="mt-2 text-slate-300">
                Capture misconfigurations across IAM, storage and networking and
                assign owners with clear SLAs.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-emerald-300">Red Team</p>
              <p className="mt-2 text-slate-300">
                Log red team paths, persistence points and impact so blue teams
                can harden controls.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-emerald-300">VAPT</p>
              <p className="mt-2 text-slate-300">
                Manage vulnerability findings from scanners and manual testing
                with rich context.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          id="contact"
          className="mt-16 border-t border-slate-800 pt-6 text-xs text-slate-400"
        >
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} ApniSec. All rights reserved.</p>
            <p>Contact: support@apnisec.com</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
