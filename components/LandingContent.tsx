'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import OperatorProof from '@/components/OperatorProof';
import { 
  ArrowRight,
  BrainCircuit, 
  CheckCircle2, 
  Code2, 
  Database, 
  FileText,
  Gauge,
  MessagesSquare,
  Search, 
  Sparkles, 
  Zap 
} from 'lucide-react';
import { getAllBlogPosts } from '@/lib/blog';
import { getLandingPages } from '@/lib/landing-pages';

// --- ANIMATION CONFIGURATIONS ---

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const graphLine: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1, 
    transition: { duration: 2, ease: "easeInOut" } 
  }
};

export default function LandingContent() {
  const researchPosts = getAllBlogPosts().slice(0, 3);
  const servicePages = getLandingPages('service').slice(0, 4);
  const industryPages = getLandingPages('industry').slice(0, 4);

  return (
    <div className="w-full bg-[#050505] text-gray-300 overflow-hidden relative">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-[20%] left-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* --- SECTION 1: THE WAKE UP CALL --- */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-mono text-red-400 uppercase tracking-widest">Visibility Gap</span>
            </motion.div>
            
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight font-space">
              Most businesses are <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">less visible than they think.</span>
            </motion.h2>
            
            <motion.p variants={fadeInUp} className="text-lg text-gray-400 leading-relaxed mb-8">
              Search behavior changed faster than most business websites did. People still discover companies through Google, but now they also ask ChatGPT, Gemini, Perplexity, and AI Overviews to narrow the field before they ever click.
              <br /><br />
              The hard truth: if your site is <strong className="text-white">weak, vague, or poorly structured</strong>, you do not get chosen. The opportunity is that fixing this is usually far more practical than people assume.
            </motion.p>
          </motion.div>

          {/* Graph Animation */}
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="text-sm font-mono text-gray-500 uppercase">Discovery Shift</div>
              <div className="flex gap-4 text-[10px]">
                <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-green-500" /> Answer-driven search</div>
                <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-gray-500" /> Unoptimized sites</div>
              </div>
            </div>

            <div className="h-64 relative w-full">
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 border-l border-b border-white/5" />
              
              <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                <motion.path 
                  d="M0,200 C50,180 150,150 300,50 400,20 500,0" 
                  fill="none" 
                  stroke="#22c55e" 
                  strokeWidth="3" 
                  variants={graphLine}
                />
                <motion.path 
                  d="M0,180 C50,170 150,200 300,220 400,240 500,250" 
                  fill="none" 
                  stroke="#6b7280" 
                  strokeWidth="2" 
                  strokeDasharray="5 5"
                  variants={graphLine}
                />
              </svg>

              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
                className="absolute top-[20%] right-[10%] bg-red-500/20 border border-red-500 text-red-400 text-xs px-3 py-1 rounded-full backdrop-blur-md"
              >
                Where leads leak
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 border-y border-white/5 bg-gradient-to-b from-green-500/[0.04] to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6 font-space">
              The path is simple
            </motion.h2>
            <motion.p variants={fadeInUp} className="max-w-3xl mx-auto text-gray-400">
              We want this to feel obvious. First you see the visibility gap. Then you request the deeper report. Then, if the upside is real, you move into a strategy call and a 90-day execution plan.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <FunnelStepCard
              icon={<Search className="w-8 h-8 text-blue-400" />}
              eyebrow="Step 1"
              title="Get your free visibility audit"
              desc="Drop in your domain and we show where your website is underperforming across Google and answer engines."
            />
            <FunnelStepCard
              icon={<FileText className="w-8 h-8 text-purple-400" />}
              eyebrow="Step 2"
              title="Unlock the custom report"
              desc="If the site has real upside, you leave your details and we prepare a deeper consultant-style report for your inbox."
            />
            <FunnelStepCard
              icon={<MessagesSquare className="w-8 h-8 text-green-400" />}
              eyebrow="Step 3"
              title="Book the strategy call"
              desc="Once the gaps are clear, we use the strategy call to show what the first 90 days would look like if we fix it with you."
            />
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 2: THE MECHANISM --- */}
      <section className="py-32 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6 font-space">
              We do not sell vanity. <br /><span className="text-green-500">We fix the visibility stack.</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="max-w-2xl mx-auto text-gray-400">
              This is not just &quot;AI optimization.&quot; It is SEO, authority, technical cleanup, and AI citability working together. If you already have a website, we can usually identify the bottlenecks quickly and start correcting them in a focused 90-day sprint.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <ProcessCard 
              icon={<Search className="w-8 h-8 text-blue-400" />}
              title="Get You Found"
              desc="We tighten the pages, categories, and search intent alignment so Google can understand what you do and where you should rank."
              step="01" 
              color="blue"
            />
            <ProcessCard 
              icon={<Database className="w-8 h-8 text-purple-400" />}
              title="Make You Credible"
              desc="We strengthen the trust layer: schema, entity signals, authority cues, and the supporting proof that AI systems and users both look for."
              step="02" 
              color="purple"
            />
            <ProcessCard 
              icon={<BrainCircuit className="w-8 h-8 text-green-400" />}
              title="Turn You Into The Better Answer"
              desc="We reshape the messaging and content so your business can be cited, compared, and chosen in both classic search and answer engines."
              step="03" 
              color="green"
            />
          </motion.div>
        </div>
      </section>

      <OperatorProof />

      {/* --- SECTION 3: EVOLUTION (SEO + AEO) --- */}
      <section className="py-32 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-4 font-space">SEO gets you indexed. AEO gets you cited.</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              They are not competing strategies. They are the same visibility system viewed from two different angles. If your SEO is weak, your AEO will be weak too. If your site is technically sound, clearly positioned, and trustworthy, both improve together.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 relative">
            {/* "PLUS" Badge (Instead of VS) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-[#050505] border border-white/10 p-3 rounded-full hidden md:block shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <span className="text-sm font-bold text-white px-1">+</span>
            </div>

            {/* Old World (Framed as Essential Foundation) */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-8">
                <Search className="text-gray-500 w-6 h-6" />
                <div className="text-xl font-bold text-gray-300">SEO Foundation</div>
              </div>
              <p className="text-sm text-gray-500 mb-6 font-mono uppercase tracking-widest">What gets you in the consideration set</p>
              <ul className="space-y-6">
                <ComparisonItem neutral text="Clear service and category targeting" />
                <ComparisonItem neutral text="Technical cleanup, schema, and crawlability" />
                <ComparisonItem neutral text="Pages built around real search intent" />
                <ComparisonItem neutral text="Authority and trust that compound over time" />
              </ul>
            </motion.div>

            {/* New World (Framed as The Upgrade) */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-green-900/10 border border-green-500/20 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_20px_#22c55e]" />
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="text-green-400 w-6 h-6" />
                <div className="text-xl font-bold text-white">AEO Layer</div>
              </div>
              <p className="text-sm text-green-500/70 mb-6 font-mono uppercase tracking-widest">What gets you chosen inside answer engines</p>
              <ul className="space-y-6">
                <ComparisonItem text="Entity clarity across your brand and offer" />
                <ComparisonItem text="Citable proof blocks and stronger answers" />
                <ComparisonItem text="Better comparison, category, and FAQ coverage" />
                <ComparisonItem text="Visibility in ChatGPT, Gemini, Perplexity, and Google AI Overviews" />
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6 font-space">
              Why the 90-day retainer works
            </motion.h2>
            <motion.p variants={fadeInUp} className="max-w-3xl mx-auto text-gray-400">
              We are not promising magic in a weekend. We are promising concentrated execution. Three months is enough time to diagnose the gaps, fix the pages that matter, rebuild authority signals, and start creating measurable movement for almost any business that already has a website.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <ProcessCard
              icon={<Gauge className="w-8 h-8 text-blue-400" />}
              title="Month 1: Diagnose"
              desc="We audit the site, clarify the offer, identify the trust leaks, and map the highest-leverage pages and queries."
              step="01"
              color="blue"
            />
            <ProcessCard
              icon={<Code2 className="w-8 h-8 text-purple-400" />}
              title="Month 2: Rebuild"
              desc="We tighten the pages, schema, structure, and messaging so your site is easier to rank, easier to cite, and easier to trust."
              step="02"
              color="purple"
            />
            <ProcessCard
              icon={<Zap className="w-8 h-8 text-green-400" />}
              title="Month 3: Push"
              desc="We expand the content and authority layer so the improvements start compounding instead of stalling after the audit."
              step="03"
              color="green"
            />
          </motion.div>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-10 text-center text-lg font-semibold text-gray-200"
          >
            90-day retainers start at <span className="text-[#ff7a59]">$7,500/month</span>. No
            long-term contract — leave anytime. We quote precisely after the audit.
          </motion.p>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6 font-space">
              What people usually need to know first
            </motion.h2>
            <motion.p variants={fadeInUp} className="max-w-3xl mx-auto text-gray-400">
              The short version: if you run a business with a website, you are probably leaving discoverability on the table. The audit shows the gap. The retainer fixes it.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <FaqCard
              question="What do you actually fix?"
              answer="We fix the visibility system behind the website: search intent alignment, page structure, messaging clarity, schema, authority signals, and the proof blocks that help both Google and answer engines trust what you do."
            />
            <FaqCard
              question="Is this SEO or AEO?"
              answer="Both. SEO gets your business into the ranking conversation. AEO helps your business get cited and chosen inside ChatGPT, Gemini, Perplexity, and Google AI Overviews. The work overlaps heavily, so we treat them as one stack."
            />
            <FaqCard
              question="Who is this for?"
              answer="Any real business with a website that wants more qualified discovery. You do not need to be a software company. If customers can search for what you do, we can usually improve how visible and credible you look."
            />
            <FaqCard
              question="What happens after the audit?"
              answer="You get a clear diagnosis, a surface-level action plan, and a recommendation on whether a 90-day retainer is the right move. If it is, we use that window to fix the highest-leverage issues first and start compounding results."
            />
          </motion.div>
        </div>
      </section>

      <section className="py-32 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          >
            <div className="max-w-3xl">
              <motion.h2 variants={fadeInUp} className="mb-6 text-3xl md:text-5xl font-bold text-white font-space">
                Read the research, then look at your own gap.
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-gray-400">
                We published a first set of research notes so the site has real indexable content and
                a clearer point of view on where search is going. This is the thinking behind the
                audits and the retainer.
              </motion.p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-green-300"
            >
              See all research
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid gap-8 md:grid-cols-3"
          >
            {researchPosts.map((post) => (
              <motion.article
                key={post.slug}
                variants={fadeInUp}
                className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-8"
              >
                <p className="mb-4 text-xs font-mono uppercase tracking-[0.22em] text-zinc-500">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <div className="mb-4 text-2xl font-bold text-white">{post.title}</div>
                <p className="mb-6 text-sm leading-relaxed text-gray-400">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-green-300"
                >
                  Read article
                  <span className="sr-only"> about {post.keywords[0]}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16 max-w-3xl"
          >
            <motion.h2 variants={fadeInUp} className="mb-6 text-3xl md:text-5xl font-bold text-white font-space">
              Built to rank beyond the homepage
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-400">
              We added service and industry pages so the site can compete on more specific buying
              intent, not just the brand name. That is how this starts turning into a real search
              surface instead of a single landing page.
            </motion.p>
          </motion.div>

          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-green-400">
                    Service pages
                  </p>
                  <div className="text-2xl font-bold text-white">What we do</div>
                </div>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-green-300"
                >
                  See all
                  <span className="sr-only"> services</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-4">
                {servicePages.map((page) => (
                  <article
                    key={page.slug}
                    className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    <Link href={`/services/${page.slug}`} className="absolute inset-0 rounded-2xl">
                      <span className="sr-only">{page.keywords[0]}</span>
                    </Link>
                    <div className="mb-2 text-lg font-bold text-white">{page.title}</div>
                    <p className="text-sm leading-relaxed text-gray-400">{page.excerpt}</p>
                  </article>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-green-400">
                    Industry pages
                  </p>
                  <div className="text-2xl font-bold text-white">Who we help</div>
                </div>
                <Link
                  href="/industries"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-green-300"
                >
                  See all
                  <span className="sr-only"> industries</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-4">
                {industryPages.map((page) => (
                  <article
                    key={page.slug}
                    className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    <Link href={`/industries/${page.slug}`} className="absolute inset-0 rounded-2xl">
                      <span className="sr-only">{page.keywords[0]}</span>
                    </Link>
                    <div className="mb-2 text-lg font-bold text-white">{page.title}</div>
                    <p className="text-sm leading-relaxed text-gray-400">{page.excerpt}</p>
                  </article>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- SECTION 4: CTA --- */}
      <section className="py-32 px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-b from-white/5 to-transparent p-12 rounded-3xl border border-white/10"
        >
          <h2 className="text-4xl font-bold text-white mb-6 font-space">Stop spectating. Fix the thing.</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            If you have a real business and a website, there is a very good chance your visibility can be materially improved. Start with the audit. If the opportunity is real, we&apos;ll show you why giving us 90 days can materially change how often your business gets found, trusted, and chosen.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link 
               href="/audit-flow"
               className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-2"
            >
              <Zap className="w-5 h-5 fill-black" />
              Get your free visibility audit
            </Link>
          </div>
          <p className="mt-5 text-sm text-gray-500">
            Audit first. Report second. Strategy call when the upside is clear.
          </p>
          <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 text-left">
            <p className="text-xs font-mono uppercase tracking-[0.24em] text-zinc-500">
              Wider Growth Ecosystem
            </p>
            <p className="mt-3 text-sm leading-7 text-gray-400">
              RankUp AEO is part of a wider PanTech Software growth ecosystem built in Kolkata for
              businesses that need stronger search visibility, sharper positioning, and cleaner
              customer acquisition systems.
            </p>
            <Link
              href="https://www.pantechsoft.com/ai-marketing-agency-kolkata"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-green-300"
            >
              Explore PanTech Software
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function ProcessCard({ icon, title, desc, step, color }: any) {
  const colors: any = {
    blue: "bg-blue-500/10 text-blue-500/20 group-hover:bg-blue-500/20",
    purple: "bg-purple-500/10 text-purple-500/20 group-hover:bg-purple-500/20",
    green: "bg-green-500/10 text-green-500/20 group-hover:bg-green-500/20"
  };

  return (
    <motion.div 
      variants={fadeInUp}
      className="p-8 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-white/20 transition-all duration-300 group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 p-4 font-mono text-4xl font-bold opacity-30 ${colors[color].split(" ")[1]}`}>
        {step}
      </div>
      <div className={`mb-6 p-4 rounded-xl w-fit transition-transform duration-300 group-hover:scale-110 ${colors[color].split(" ")[0]}`}>
        {icon}
      </div>
      <div className="text-xl font-bold text-white mb-4">{title}</div>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function ComparisonItem({ text, neutral = false }: { text: string, neutral?: boolean }) {
  return (
    <li className="flex items-center gap-3 text-sm md:text-base">
      {neutral ? (
        <CheckCircle2 className="w-5 h-5 text-gray-600 shrink-0" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
      )}
      <span className={neutral ? "text-gray-400" : "text-white"}>{text}</span>
    </li>
  );
}

function FaqCard({ question, answer }: { question: string; answer: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-8"
    >
      <div className="mb-4 text-xl font-bold text-white">{question}</div>
      <p className="text-sm leading-relaxed text-gray-400">{answer}</p>
    </motion.div>
  );
}

function FunnelStepCard({
  eyebrow,
  title,
  desc,
  icon,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="rounded-xl bg-white/5 p-4">{icon}</div>
        <span className="text-xs font-mono uppercase tracking-[0.22em] text-zinc-500">{eyebrow}</span>
      </div>
      <div className="mb-4 text-xl font-bold text-white">{title}</div>
      <p className="text-sm leading-relaxed text-gray-400">{desc}</p>
    </motion.div>
  );
}
