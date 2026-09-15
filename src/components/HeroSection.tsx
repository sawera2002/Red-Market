import React, { useState, useEffect } from 'react';
import { ArrowRight, Clock, Zap, ShieldCheck, Truck, Check } from 'lucide-react';

interface HeroSectionProps {
  onShopDeals: () => void;
  onExploreOrganic: () => void;
  onApplyPromo: (code: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onShopDeals,
  onExploreOrganic,
  onApplyPromo
}) => {
  // Live ticking countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 21,
    seconds: 32
  });

  const [copiedPromo, setCopiedPromo] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 4, minutes: 21, seconds: 32 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleApplyPromo = () => {
    onApplyPromo('REDDEAL');
    setCopiedPromo(true);
    setTimeout(() => setCopiedPromo(false), 2500);
  };

  const format2Digits = (num: number) => String(num).padStart(2, '0');

  return (
    <section id="hero-section" className="relative pt-6 pb-10 overflow-hidden">
      {/* Subtle ambient red background radial glow */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-white tracking-tight leading-[1.12]">
              Crisp, Farm-Fresh Groceries{' '}
              <span className="text-[#e50914] inline-block">
                Delivered in 30 Mins.
              </span>
            </h1>

            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              Hand-selected morning harvest, wild seafood, artisan bakery goods, and organic pantry staples packed in temperature-controlled chill boxes right to your doorstep.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                id="shop-deals-btn"
                onClick={onShopDeals}
                className="px-6 py-3.5 rounded-xl bg-[#e50914] hover:bg-red-500 text-white font-bold text-sm flex items-center gap-2.5 shadow-xl shadow-red-600/30 active:scale-95 transition-all"
              >
                <span>Shop Today&apos;s Deals</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="explore-organic-btn"
                onClick={onExploreOrganic}
                className="px-6 py-3.5 rounded-xl bg-[#151720] hover:bg-[#1b1e2a] border border-white/10 text-white font-semibold text-sm transition-all active:scale-95"
              >
                Explore 100% Organic
              </button>
            </div>
          </div>

          {/* Right Column: Flash Offer & Countdown Card - Exactly as in screenshot */}
          <div className="lg:col-span-5">
            <div
              id="special-offer-card"
              className="p-6 rounded-2xl bg-[#12141c] border border-white/8 shadow-2xl backdrop-blur-sm relative overflow-hidden"
            >
              {/* Header with Live indicator */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  <span>SPECIAL OFFER ENDS IN:</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                  <span>LIVE</span>
                </div>
              </div>

              {/* Countdown Digits Grid */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-[#181a24] border border-white/6 rounded-xl p-3 text-center">
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                    {format2Digits(timeLeft.hours)}
                  </div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1">
                    HOURS
                  </div>
                </div>

                <div className="bg-[#181a24] border border-white/6 rounded-xl p-3 text-center">
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                    {format2Digits(timeLeft.minutes)}
                  </div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1">
                    MINS
                  </div>
                </div>

                <div className="bg-[#181a24] border border-white/6 rounded-xl p-3 text-center">
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono text-red-400">
                    {format2Digits(timeLeft.seconds)}
                  </div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1">
                    SECS
                  </div>
                </div>
              </div>

              {/* Flash Promo Code Card */}
              <div className="p-3.5 rounded-xl bg-[#181a24] border border-white/6 flex items-center justify-between gap-3 mb-4">
                <div>
                  <div className="text-[11px] text-zinc-400 font-medium">Flash Promo Code</div>
                  <div className="text-base font-extrabold text-white tracking-wider font-mono">
                    REDDEAL
                  </div>
                </div>
                <button
                  id="hero-apply-promo-btn"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 rounded-lg bg-[#e50914] hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 active:scale-95 transition-all"
                >
                  {copiedPromo ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Applied!</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Apply 20%</span>
                    </>
                  )}
                </button>
              </div>

              {/* Guarantees Footer from screenshot */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/6 text-xs text-zinc-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-red-400" />
                  <span>30-min express</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                  <span>100% Fresh guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
