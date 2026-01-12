import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-2xl text-center sm:text-left">
        <div className="relative mb-4">
           <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 opacity-25 blur-xl dark:opacity-50 transition-opacity"></div>
           <h1 className="relative text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Milestone.
           </h1>
        </div>
        
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-light">
          A minimal starting point for your next big idea. Built with <span className="font-medium text-slate-900 dark:text-white">Next.js</span> and wired for performance.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-4">
          <a
            className="rounded-full border border-solid border-transparent transition-all flex items-center justify-center bg-slate-900 text-white gap-2 hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 h-10 sm:h-12 px-8 text-sm sm:text-base font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5"
            href="#"
          >
            Get Started
          </a>
          <a
            className="rounded-full border border-solid border-slate-200 dark:border-white/10 transition-all flex items-center justify-center bg-transparent hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white h-10 sm:h-12 px-8 text-sm sm:text-base font-medium"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read Documentation
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-light">
        <a
          className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors hover:underline underline-offset-4"
          href="https://nextjs.org/learn"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors hover:underline underline-offset-4"
          href="https://vercel.com/templates?framework=next.js"
          target="_blank"
          rel="noopener noreferrer"
        >
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors hover:underline underline-offset-4"
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
