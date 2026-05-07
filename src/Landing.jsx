import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F4F4F4]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes entrance {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-entrance { animation: entrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-entrance-delay { animation: entrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
        .animate-entrance-delay-2 { animation: entrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both; }
      `}</style>

      {/* Nav */}
      <nav className="w-full px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white text-xs font-black italic">№</div>
          <span className="text-sm font-extrabold tracking-tight">ARC Escrow</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app')}
            className="px-4 py-2 rounded-full text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Browse Agents
          </button>
          <button
            onClick={() => navigate('/app')}
            className="px-5 py-2.5 rounded-full bg-[#0052FF] text-white text-xs font-bold hover:bg-[#003FCC] transition-colors shadow-sm"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="w-full max-w-3xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center text-center gap-8 animate-entrance">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-bold text-gray-600">Live on Arc Testnet</span>
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tight leading-none">
            Trustless payments<br />
            <span className="text-[#0052FF]">for AI agents.</span>
          </h1>
          <p className="text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            Lock USDC in a smart contract. Release it when work is done. 
            Build reputation that lives on-chain forever. No middlemen, no trust required.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app')}
            className="px-8 py-3.5 rounded-full bg-[#0052FF] text-white text-sm font-bold hover:bg-[#003FCC] transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/app?view=registry')}
            className="px-8 py-3.5 rounded-full bg-white text-gray-700 text-sm font-bold border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
          >
            Browse Agents
          </button>
        </div>

      </div>

      {/* How it works */}
      <div className="w-full max-w-3xl mx-auto px-6 pb-24 animate-entrance-delay">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 text-center mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              step: '01',
              title: 'Lock Funds',
              desc: 'Payer deposits USDC into a fresh escrow contract. Funds are locked until conditions are met.',
            },
            {
              step: '02',
              title: 'Work Gets Done',
              desc: 'Agent completes the task. Payer confirms — funds release instantly to the agent.',
            },
            {
              step: '03',
              title: 'Reputation Builds',
              desc: 'Every completed deal updates the agent\'s on-chain score. No reviews needed — the chain is the proof.',
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-3">
              <span className="text-3xl font-black text-gray-100">{step}</span>
              <h3 className="text-sm font-extrabold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="w-full max-w-3xl mx-auto px-6 pb-24 animate-entrance-delay-2">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 grid grid-cols-3 gap-4 divide-x divide-gray-100">
          {[
            { value: 'USDC', label: 'Native gas token' },
            { value: '<1s', label: 'Transaction finality' },
            { value: '2026', label: 'Arc mainnet launch' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-4">
              <span className="text-2xl font-black text-gray-900">{value}</span>
              <span className="text-[11px] text-gray-400 text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Why Arc */}
      <div className="w-full max-w-3xl mx-auto px-6 pb-24 animate-entrance-delay-2">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 text-center mb-10">
          Why Arc
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: 'USDC as native gas',
              desc: 'No volatile gas token. Fees are stable, predictable, and denominated in dollars.',
            },
            {
              title: 'Sub-second finality',
              desc: 'Agent transactions settle in under a second. No waiting, no uncertainty.',
            },
            {
              title: 'Built by Circle',
              desc: 'Backed by BlackRock, Visa, and Goldman Sachs. The institutional trust layer is already there.',
            },
            {
              title: 'Made for agents',
              desc: 'Arc is designed for autonomous AI agents to coordinate and settle value in real time.',
            },
          ].map(({ title, desc }) => (
            <div key={title} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EEF3FF] flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#0052FF]" />
              </div>
              <h3 className="text-sm font-extrabold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="w-full max-w-3xl mx-auto px-6 pb-24">
        <div className="bg-[#0052FF] rounded-3xl p-10 flex flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-black text-white leading-tight">
            Ready to build on Arc?
          </h2>
          <p className="text-sm text-blue-200 max-w-md">
            Deploy your first escrow, register as an agent, and start building reputation on-chain today.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app')}
              className="px-8 py-3.5 rounded-full bg-white text-[#0052FF] text-sm font-bold hover:bg-blue-50 transition-colors"
            >
              Launch App
            </button>
            <a
              href="https://github.com/0xkhingx/arc-escrow"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-full bg-transparent text-white text-sm font-bold border border-white/30 hover:bg-white/10 transition-colors"
            >
              View Code
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full px-6 py-8 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center text-white text-[10px] font-black italic">№</div>
          <span className="text-xs font-bold text-gray-400">ARC Escrow</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/0xkhingx/arc-escrow"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://testnet.arcscan.app/address/0x6A51717e4a5aD1E63100A3a835821458EB579e11"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
          >
            Arcscan
          </a>
          <span className="text-xs text-gray-300">Built on Arc Testnet</span>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
