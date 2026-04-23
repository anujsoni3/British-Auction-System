import React, { useEffect, useState } from 'react';
import { ChevronRight, Zap, TrendingUp, Lock, Clock, Sparkles } from 'lucide-react';

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 backdrop-blur-md bg-slate-950/50 border-b border-emerald-500/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">AuctionFlow</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-emerald-400 transition-colors text-sm">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-emerald-400 transition-colors text-sm">How It Works</a>
            <a href="/rfqs" className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 text-sm font-medium">
              View Auctions
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection scrollY={scrollY} />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Business Impact */}
      <BusinessImpactSection />

      {/* Final CTA */}
      <CtaSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

const HeroSection = ({ scrollY }) => (
  <section className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20">
    <div className="max-w-5xl mx-auto text-center">
      {/* Animated badge */}
      <div className="mb-8 inline-block">
        <div className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/50 backdrop-blur-sm">
          <p className="text-sm text-emerald-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            The future of competitive procurement
          </p>
        </div>
      </div>

      {/* Main title */}
      <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
        Smart RFQ{' '}
        <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400 bg-clip-text text-transparent">
          British Auction
        </span>{' '}
        System
      </h1>

      {/* Subtitle */}
      <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
        Drive competitive supplier pricing with dynamic auction extensions and real-time ranking. Optimize procurement costs with intelligent bidding.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <a
          href="/rfqs"
          className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 flex items-center gap-2"
        >
          View Live Auctions
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>
        <a
          href="/rfqs/new"
          className="group px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-emerald-500/30 hover:border-emerald-500/60 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
        >
          Create RFQ
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      {/* Dashboard preview mockup */}
      <div className="mt-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur-2xl"></div>
        <div className="relative backdrop-blur-xl bg-slate-900/50 border border-emerald-500/30 rounded-2xl p-8 md:p-12 shadow-2xl">
          <DashboardPreview />
        </div>
      </div>
    </div>
  </section>
);

const DashboardPreview = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-3 w-32 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"></div>
        <div className="h-2 w-24 bg-gray-600 rounded-full"></div>
      </div>
      <div className="text-emerald-400 text-sm font-semibold">↓ 28% costs</div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg border border-emerald-500/20 animate-pulse"></div>
      ))}
    </div>
  </div>
);

const FeaturesSection = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Smart Extension Engine',
      description: 'Dynamic time extensions trigger automatically when new bids arrive within the trigger window, ensuring competitive pricing.',
      gradient: 'from-emerald-500/20 to-emerald-600/20'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Real-Time Ranking',
      description: 'Suppliers see live rankings instantly. L1 (best), L2, L3 positions update as bids pour in.',
      gradient: 'from-cyan-500/20 to-blue-600/20'
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Transparent Bidding',
      description: 'Complete visibility into bidding history and decisions. No hidden costs, pure competitive market pricing.',
      gradient: 'from-purple-500/20 to-pink-600/20'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Forced Close Protection',
      description: 'Automated forced close time prevents indefinite auctions. Buyers maintain control while suppliers compete.',
      gradient: 'from-orange-500/20 to-red-600/20'
    }
  ];

  return (
    <section id="features" className="relative z-10 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Powerful Features for Smart Procurement
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to run efficient auctions and achieve competitive pricing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group"
            >
              <div className={`h-full backdrop-blur-xl bg-gradient-to-br ${feature.gradient} border border-emerald-500/30 rounded-2xl p-8 hover:border-emerald-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20`}>
                <div className="text-emerald-400 mb-4 p-3 w-fit bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      title: 'Create RFQ',
      description: 'Post your requirement with specifications, budget range, and auction parameters.'
    },
    {
      number: '02',
      title: 'Suppliers Bid',
      description: 'Suppliers place competitive bids in real-time. Rankings update instantly.'
    },
    {
      number: '03',
      title: 'Dynamic Extensions',
      description: 'Auction extends automatically when new bids arrive within trigger window.'
    },
    {
      number: '04',
      title: 'Forced Close',
      description: 'Final timer triggers. No new extensions. Best pricing wins.'
    }
  ];

  return (
    <section id="how-it-works" className="relative z-10 py-24 px-6 bg-gradient-to-b from-transparent via-slate-900/30 to-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A streamlined 4-step process to competitive procurement
          </p>
        </div>

        <div className="relative">
          {/* Connection line for desktop */}
          <div className="hidden md:block absolute top-32 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 rounded-full"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="backdrop-blur-xl bg-slate-900/50 border border-emerald-500/30 rounded-2xl p-8 text-center hover:border-emerald-500/60 transition-all duration-300 h-full">
                  <div className="text-5xl font-bold text-emerald-500/30 mb-4">{step.number}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-32 -right-4 w-8 h-1 bg-gradient-to-r from-emerald-500 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const BusinessImpactSection = () => {
  const metrics = [
    { value: '28%', label: 'Average Cost Reduction', icon: '📉' },
    { value: '3.2x', label: 'More Competitive Bids', icon: '📊' },
    { value: '45min', label: 'Average Auction Duration', icon: '⏱️' },
    { value: '99.9%', label: 'Uptime & Reliability', icon: '🛡️' }
  ];

  return (
    <section className="relative z-10 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Business Impact That Matters
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Achieve better pricing with competitive bidding and intelligent auction mechanics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center hover:border-emerald-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
            >
              <div className="text-4xl mb-2">{metric.icon}</div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">{metric.value}</div>
              <p className="text-gray-300 text-sm">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Large benefit card */}
        <div className="mt-16 backdrop-blur-xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-emerald-500/10 border border-emerald-500/30 rounded-3xl p-12 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Achieve Better Pricing With Competitive Bidding
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
            Our intelligent auction engine combines forced closure times with dynamic extensions to create the optimal competitive environment. Suppliers compete harder, and you win with lower costs.
          </p>
          <div className="w-full h-2 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

const CtaSection = () => (
  <section className="relative z-10 py-24 px-6">
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-blue-500/30 rounded-3xl blur-2xl"></div>
        <div className="relative backdrop-blur-xl bg-slate-900/80 border border-emerald-500/50 rounded-3xl p-12 md:p-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Your First Auction Today
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join hundreds of procurement teams achieving better pricing with intelligent auctions
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href="/rfqs/new"
              className="group px-10 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 flex items-center gap-2 text-lg"
            >
              Create Your First RFQ
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/rfqs"
              className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-emerald-500/30 hover:border-emerald-500/60 rounded-lg font-semibold transition-all duration-300 text-lg"
            >
              View Active Auctions
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="relative z-10 border-t border-emerald-500/20 backdrop-blur-sm bg-slate-950/50 py-12 px-6 mt-24">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-emerald-400" />
            <span className="font-bold text-white">AuctionFlow</span>
          </div>
          <p className="text-gray-400 text-sm">Smart procurement for modern enterprises</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></li>
            <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">Platform</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="/rfqs" className="hover:text-emerald-400 transition-colors">Auctions</a></li>
            <li><a href="/rfqs/new" className="hover:text-emerald-400 transition-colors">Create RFQ</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a></li>
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-emerald-500/20 pt-8 text-center text-gray-400 text-sm">
        <p>&copy; 2026 AuctionFlow. All rights reserved. Smart Procurement Technology.</p>
      </div>
    </div>
  </footer>
);

export default LandingPage;
