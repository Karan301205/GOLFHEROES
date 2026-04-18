import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500 selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-6 bg-black/50 backdrop-blur-md border-b border-white/5">
        <span className="text-2xl font-black tracking-tighter text-green-400">GOLFHEROES</span>
        <div className="flex items-center gap-8">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="bg-white text-black text-sm font-bold px-6 py-2.5 rounded-full hover:bg-green-400 transition-all active:scale-95"
          >
            Join the Movement
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 flex flex-col items-center text-center overflow-hidden">
        {/* Abstract background glow to avoid golf cliches */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-green-500/10 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-4xl space-y-6">
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] animate-fade-in">
            YOUR GAME <br />
            <span className="text-green-400">CHANGES LIVES</span>
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto font-medium leading-relaxed">
            The modern performance platform where tracking your golf scores 
            directly supports global charities and enters you into massive monthly prize draws.
          </p>
          <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => navigate('/signup')}
              className="bg-green-500 text-black text-lg font-black px-12 py-5 rounded-full hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all hover:-translate-y-1"
            >
              Start Playing for Good
            </button>
            <p className="text-white/30 text-sm font-semibold uppercase tracking-widest">
              Join 5,000+ Heroes
            </p>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-4xl font-black text-green-400 mb-2">10% +</div>
            <p className="text-white/40 uppercase tracking-widest text-xs font-bold">Minimum Charity Split</p>
          </div>
          <div>
            <div className="text-4xl font-black text-white mb-2">£40,000</div>
            <p className="text-white/40 uppercase tracking-widest text-xs font-bold">Estimated Monthly Jackpot</p>
          </div>
          <div>
            <div className="text-4xl font-black text-green-400 mb-2">5 Score</div>
            <p className="text-white/40 uppercase tracking-widest text-xs font-bold">Rolling Performance Logic</p>
          </div>
        </div>
      </section>

      {/* Core Mechanics */}
      <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <h2 className="text-4xl font-black leading-tight">A platform built for impact, <br/><span className="text-green-400">not just handicaps.</span></h2>
            
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-green-400 font-bold border border-white/10">01</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Subscribe & Select</h3>
                  <p className="text-white/50 leading-relaxed">Choose a monthly or yearly plan. Select a charity you care about to receive 10% of your fee immediately.</p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-green-400 font-bold border border-white/10">02</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Log Your Performance</h3>
                  <p className="text-white/50 leading-relaxed">Enter your latest 5 Stableford scores. Our system maintains only your most recent data for the monthly draws.</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-green-400 font-bold border border-white/10">03</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Win & Verify</h3>
                  <p className="text-white/50 leading-relaxed">Match 3, 4, or 5 numbers to the monthly draw. Upload your proof and get paid directly to your account.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-neutral-900 border border-white/10 rounded-3xl p-8 aspect-square flex flex-col justify-center">
              <div className="space-y-4">
                <div className="h-2 w-24 bg-green-500 rounded-full" />
                <div className="h-12 w-full bg-white/5 rounded-xl border border-white/10" />
                <div className="h-12 w-3/4 bg-white/5 rounded-xl border border-white/10" />
                <div className="grid grid-cols-5 gap-2 pt-8">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="aspect-square bg-green-500/20 rounded-full border border-green-500/50 flex items-center justify-center text-green-400 font-black">?</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-white/5 text-center">
        <p className="text-white/20 text-sm font-medium tracking-widest">
          © 2026 GOLFHEROES. BUILT BY DIGITAL HEROES SELECTION TEAM.
        </p>
      </footer>
    </div>
  );
}