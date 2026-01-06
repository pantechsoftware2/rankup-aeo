'use client';

import { motion } from 'framer-motion';
import { 
  BarChart3, 
  BrainCircuit, 
  CheckCircle2, 
  Code2, 
  Database, 
  Search, 
  Share2, 
  XCircle 
} from 'lucide-react';

// --- ANIMATION CONFIGURATIONS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const graphLine = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { duration: 2, ease: "easeInOut" } }
};

export default function LandingContent() {
  return (
    <div className="w-full bg-[#050505] text-gray-300 overflow-hidden relative">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-[20%] left-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* --- SECTION 1: THE WAKE UP CALL (The Zero-Click Graph) --- */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Text */}
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-mono text-red-400 uppercase tracking-widest">Market Alert</span>
            </motion.div>
            
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight font-space">
              You are losing traffic to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">"Zero-Click" Answers.</span>
            </motion.h2>
            
            <motion.p variants={fadeInUp} className="text-lg text-gray-400 leading-relaxed mb-8">
              Your customers are no longer scrolling through 10 blue links. They are asking AI a direct question and getting a direct answer.
              <br /><br />
              The hard truth: <strong className="text-white">If ChatGPT gives the answer, the user never visits your site.</strong> Unless you are the source of that answer.
            </motion.p>
          </motion.div>

          {/* Right Graph Animation */}
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-mono text-gray-500 uppercase">Traffic Trends (2022-2026)</h3>
              <div className="flex gap-4 text-[10px]">
                <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-green-500" /> AI Usage</div>
                <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-gray-500" /> Web Clicks</div>
              </div>
            </div>

            <div className="h-64 relative w-full">
              {/* Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 border-l border-b border-white/5" />
              
              <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                {/* Green Line (AI Usage Going Up) */}
                <motion.path 
                  d="M0,200 C50,180 150,150 300,50 400,20 500,0" 
                  fill="none" 
                  stroke="#22c55e" 
                  strokeWidth="3" 
                  variants={graphLine}
                />
                {/* Gray Line (Web Clicks Going Down) */}
                <motion.path 
                  d="M0,180 C50,170 150,200 300,220 400,240 500,250" 
                  fill="none" 
                  stroke="#6b7280" 
                  strokeWidth="2" 
                  strokeDasharray="5 5"
                  variants={graphLine}
                />
              </svg>

              {/* Zero-Click Annotation Label */}
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
                className="absolute top-[20%] right-[10%] bg-red-500/20 border border-red-500 text-red-400 text-xs px-3 py-1 rounded-full backdrop-blur-md"
              >
                The Zero-Click Gap
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 2: THE MECHANISM (Engineering, not Rigging) --- */}
      <section className="py-32 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-6 font-space">
              Don't "Rig" the System. <br /><span className="text-green-500">Engineer It.</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="max-w-2xl mx-auto text-gray-400">
              AI models don't read like humans. They read data. We translate your brand into the native language of Artificial Intelligence: <strong>Vectors, Entities, and Knowledge Graphs.</strong>
            </motion.p>
          </motion.div>

          {/* 3 Step Process Cards */}
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <ProcessCard 
              icon={<Code2 className="w-8 h-8 text-blue-400" />}
              title="Structural Clarity"
              desc="We inject JSON-LD Schema that explicitly tells the AI: 'This is a Product. It costs $50. It is 5-star rated.' We turn your site into a database."
              step="01" 
              color="blue"
            />
            <ProcessCard 
              icon={<Database className="w-8 h-8 text-purple-400" />}
              title="Semantic Authority"
              desc="We build a Knowledge Graph that links your brand to trusted industry entities, making your authority mathematically undeniable."
              step="02" 
              color="purple"
            />
            <ProcessCard 
              icon={<BrainCircuit className="w-8 h-8 text-green-400" />}
              title="Information Gain"
              desc="AI ignores generic content. We help you publish unique data insights (Information Gain) that AI *needs* to cite as a source."
              step="03" 
              color="green"
            />
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 3: SEO vs AEO COMPARISON --- */}
      <section className="py-32 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-4 font-space">The New Rules of Ranking</h2>
            <p className="text-gray-400">The game has changed. Here is the difference.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 relative">
            {/* VS Badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-[#050505] border border-white/10 p-2 rounded-full hidden md:block">
              <span className="text-xs font-bold text-white px-2">VS</span>
            </div>

            {/* Old World Card */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-800" />
              <div className="flex items-center gap-3 mb-8">
                <Search className="text-gray-500 w-6 h-6" />
                <h3 className="text-xl font-bold text-gray-400">Traditional SEO</h3>
              </div>
              <ul className="space-y-6">
                <ComparisonItem bad text="Target: Google's Algorithm" />
                <ComparisonItem bad text="Goal: Rank #1 in a list of 10" />
                <ComparisonItem bad text="Content: 2,000 word blog posts" />
                <ComparisonItem bad text="Outcome: User might click" />
              </ul>
            </motion.div>

            {/* New World Card */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-green-900/10 border border-green-500/20 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_20px_#22c55e]" />
              <div className="flex items-center gap-3 mb-8">
                <Share2 className="text-green-400 w-6 h-6" />
                <h3 className="text-xl font-bold text-white">RankUp AEO</h3>
              </div>
              <ul className="space-y-6">
                <ComparisonItem text="Target: LLM Neural Networks" />
                <ComparisonItem text="Goal: Be the ONLY answer cited" />
                <ComparisonItem text="Content: Precise, Data-Rich Snippets" />
                <ComparisonItem text="Outcome: Direct AI Recommendation" />
              </ul>
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
          <h2 className="text-4xl font-bold text-white mb-6 font-space">Stop being invisible.</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Your competitors are still buying backlinks. You can win the new game before they even realize it started.
          </p>
          <button 
             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
             className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            Start Your Free Audit
          </button>
        </motion.div>
      </section>
    </div>
  );
}

// --- SUBCOMPONENTS (Internal) ---

function ProcessCard({ icon, title, desc, step, color }: any) {
  // Color mapping to handle dynamic Tailwind classes safely
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
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function ComparisonItem({ text, bad = false }: { text: string, bad?: boolean }) {
  return (
    <li className="flex items-center gap-3 text-sm md:text-base">
      {bad ? (
        <XCircle className="w-5 h-5 text-gray-600 shrink-0" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
      )}
      <span className={bad ? "text-gray-500 line-through" : "text-gray-200"}>{text}</span>
    </li>
  );
}