import React, { useEffect, useState } from 'react';

export const Section = ({ id, className = '', children }) => (
  <section id={id} className={`relative z-10 py-24 px-6 ${className}`}>
    {children}
  </section>
);

export const Container = ({ className = '', children }) => (
  <div className={`max-w-6xl mx-auto ${className}`}>
    {children}
  </div>
);

export const GradientButton = ({ href, children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 inline-flex';
  
  const variants = {
    primary: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/50',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-white border border-emerald-500/30 hover:border-emerald-500/60',
    outline: 'border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10',
  };

  const buttonClass = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={buttonClass} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
};

export const GlassCard = ({ children, className = '', hoverEffect = true }) => (
  <div className={`
    backdrop-blur-xl bg-gradient-to-br from-slate-900/50 to-slate-900/30 
    border border-emerald-500/30 rounded-2xl p-8
    ${hoverEffect ? 'hover:border-emerald-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20' : ''}
    ${className}
  `}>
    {children}
  </div>
);

export const BadgeIcon = ({ icon: Icon, label, color = 'emerald' }) => (
  <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-${color}-500/10 border border-${color}-500/50 w-fit`}>
    <Icon className={`w-4 h-4 text-${color}-400`} />
    <span className={`text-sm text-${color}-300`}>{label}</span>
  </div>
);

export const FeatureGrid = ({ items }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {items.map((item, idx) => (
      <GlassCard key={idx} hoverEffect={true}>
        <div className="text-emerald-400 mb-4 p-3 w-fit bg-emerald-500/10 rounded-lg">
          {item.icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
        <p className="text-gray-300 leading-relaxed">{item.description}</p>
      </GlassCard>
    ))}
  </div>
);

export const StatsGrid = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {stats.map((stat, idx) => (
      <GlassCard key={idx} className="text-center">
        <div className="text-4xl mb-2">{stat.icon}</div>
        <div className="text-4xl font-bold text-emerald-400 mb-2">{stat.value}</div>
        <p className="text-gray-300 text-sm">{stat.label}</p>
      </GlassCard>
    ))}
  </div>
);

export const AnimatedCounter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;
      
      if (progress < 1) {
        setCount(Math.floor(end * progress));
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count}</span>;
};

export const ScrollReveal = ({ children, className = '' }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const Tooltip = ({ text, children, position = 'top' }) => {
  const positionClass = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  }[position];

  return (
    <div className="group relative inline-block">
      {children}
      <div className={`
        absolute hidden group-hover:block
        ${positionClass}
        left-1/2 transform -translate-x-1/2
        bg-slate-900 text-white text-xs px-3 py-1 rounded
        border border-emerald-500/30 whitespace-nowrap
      `}>
        {text}
      </div>
    </div>
  );
};

export const TabView = ({ tabs, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div>
      <div className="flex gap-2 border-b border-emerald-500/30 mb-6">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`
              px-4 py-2 font-semibold transition-all duration-300
              ${activeTab === idx
                ? 'text-emerald-400 border-b-2 border-emerald-500'
                : 'text-gray-400 hover:text-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="animate-fade-in">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};
