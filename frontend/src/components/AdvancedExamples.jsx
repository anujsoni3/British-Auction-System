/**
 * Advanced Landing Page Examples
 * These examples show how to extend and customize the landing page
 */

import React, { useState } from 'react';
import { Section, Container, GradientButton, GlassCard, FeatureGrid, StatsGrid, ScrollReveal, TabView, Tooltip } from './shared/UI';
import { Star, Users, TrendingUp, Shield, Zap, CheckCircle } from 'lucide-react';

/**
 * Example 1: Testimonials Section
 * Add customer testimonials with avatars and ratings
 */
export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Procurement Manager',
      company: 'GlobalTech Inc',
      text: 'Reduced our procurement costs by 32% in the first quarter. The platform is intuitive and the results speak for themselves.',
      rating: 5,
      avatar: '👨‍💼'
    },
    {
      name: 'Michael Chen',
      role: 'Supply Chain Director',
      company: 'FastShip Logistics',
      text: 'The dynamic auction extensions ensure we always get the best pricing. Highly recommended for any enterprise.',
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      name: 'Emma Wilson',
      role: 'CFO',
      company: 'Innovation Corp',
      text: 'Smart procurement made simple. Our team loves the transparency and real-time updates.',
      rating: 5,
      avatar: '👨‍💻'
    }
  ];

  return (
    <Section className="py-24 px-6 bg-gradient-to-b from-transparent via-slate-900/20 to-transparent">
      <Container>
        <h2 className="text-5xl font-bold text-white text-center mb-4">
          Trusted by Leading Enterprises
        </h2>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          See what procurement leaders are saying about AuctionFlow
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <ScrollReveal key={idx}>
              <GlassCard>
                <div className="flex gap-2 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4 pt-4 border-t border-emerald-500/20">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                    <p className="text-xs text-emerald-400">{testimonial.company}</p>
                  </div>
                </div>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
};

/**
 * Example 2: Pricing Section
 * Different pricing tiers with features
 */
export const PricingSection = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$299',
      period: '/month',
      description: 'Perfect for small teams',
      features: [
        'Up to 10 RFQs/month',
        'Real-time bidding',
        'Basic analytics',
        'Email support'
      ],
      cta: 'Get Started',
      featured: false
    },
    {
      name: 'Professional',
      price: '$799',
      period: '/month',
      description: 'For growing businesses',
      features: [
        'Unlimited RFQs',
        'Advanced analytics',
        'API access',
        'Priority support',
        'Custom workflows'
      ],
      cta: 'Start Free Trial',
      featured: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For large organizations',
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
        'On-premise option'
      ],
      cta: 'Contact Sales',
      featured: false
    }
  ];

  return (
    <Section className="py-24 px-6">
      <Container>
        <h2 className="text-5xl font-bold text-white text-center mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Choose the plan that fits your needs
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`
                ${plan.featured ? 'scale-105 md:scale-110' : ''}
                transition-transform duration-300
              `}
            >
              <GlassCard className={plan.featured ? 'border-emerald-400/60 bg-gradient-to-br from-emerald-500/10 to-slate-900/50' : ''}>
                {plan.featured && (
                  <div className="mb-4 inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-xs text-emerald-300 font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-emerald-400">{plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>
                <GradientButton
                  variant={plan.featured ? 'primary' : 'outline'}
                  href="#"
                  className="w-full justify-center mb-8"
                >
                  {plan.cta}
                </GradientButton>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

/**
 * Example 3: FAQ Section
 * Frequently asked questions with accordion
 */
export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: 'How long does a typical auction last?',
      answer: 'Most auctions run between 30-60 minutes depending on bid activity. Dynamic extensions trigger when bids arrive within the trigger window, ensuring competitive pricing.'
    },
    {
      question: 'Can suppliers modify their bids?',
      answer: 'Yes, suppliers can place new bids anytime during the auction. Only the latest bid from each supplier counts towards the ranking.'
    },
    {
      question: 'What is the forced close time?',
      answer: 'The forced close time is the absolute deadline set by the buyer. No matter how many bids arrive, the auction will close at this time with the lowest bid winning.'
    },
    {
      question: 'How transparent is the bidding process?',
      answer: 'Complete transparency. Suppliers can see real-time rankings and your organization maintains full visibility into all bids and the ranking history.'
    }
  ];

  return (
    <Section className="py-24 px-6 bg-gradient-to-b from-transparent via-slate-900/20 to-transparent">
      <Container>
        <h2 className="text-5xl font-bold text-white text-center mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Everything you need to know about our platform
        </p>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-emerald-500/30 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                className="w-full px-6 py-4 bg-slate-900/50 hover:bg-slate-900/80 transition-colors flex justify-between items-center text-left"
              >
                <span className="font-semibold text-white">{faq.question}</span>
                <span className={`text-emerald-400 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {openIndex === idx && (
                <div className="px-6 py-4 bg-slate-900/30 border-t border-emerald-500/20 text-gray-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

/**
 * Example 4: Integration Section
 * Show integrations with other platforms
 */
export const IntegrationsSection = () => {
  const integrations = [
    { name: 'SAP', icon: '💼' },
    { name: 'Salesforce', icon: '☁️' },
    { name: 'NetSuite', icon: '📊' },
    { name: 'Stripe', icon: '💳' },
    { name: 'Slack', icon: '💬' },
    { name: 'Zapier', icon: '⚙️' }
  ];

  return (
    <Section className="py-24 px-6">
      <Container>
        <h2 className="text-5xl font-bold text-white text-center mb-4">
          Integrations That Matter
        </h2>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Connect with your favorite tools and platforms
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {integrations.map((integration, idx) => (
            <Tooltip key={idx} text={integration.name}>
              <GlassCard className="text-center cursor-pointer h-24 flex items-center justify-center">
                <div>
                  <div className="text-4xl mb-2">{integration.icon}</div>
                  <p className="text-xs text-gray-300">{integration.name}</p>
                </div>
              </GlassCard>
            </Tooltip>
          ))}
        </div>
      </Container>
    </Section>
  );
};

/**
 * Example 5: Comparison Section
 * Compare your platform vs alternatives
 */
export const ComparisonSection = () => {
  const comparisonData = [
    { feature: 'Real-time Bidding', auctionflow: true, competitor1: true, competitor2: false },
    { feature: 'Dynamic Extensions', auctionflow: true, competitor1: false, competitor2: false },
    { feature: 'Forced Close Times', auctionflow: true, competitor1: false, competitor2: true },
    { feature: 'Live Rankings', auctionflow: true, competitor1: true, competitor2: false },
    { feature: 'API Access', auctionflow: true, competitor1: true, competitor2: true },
    { feature: 'Custom Workflows', auctionflow: true, competitor1: false, competitor2: false }
  ];

  return (
    <Section className="py-24 px-6 bg-gradient-to-b from-transparent via-slate-900/20 to-transparent">
      <Container>
        <h2 className="text-5xl font-bold text-white text-center mb-4">
          See the Difference
        </h2>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          How AuctionFlow compares to the competition
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-emerald-500/30">
                <th className="text-left py-4 px-4 text-white font-semibold">Feature</th>
                <th className="text-center py-4 px-4 text-emerald-400 font-semibold">AuctionFlow</th>
                <th className="text-center py-4 px-4 text-gray-400 font-semibold">Competitor 1</th>
                <th className="text-center py-4 px-4 text-gray-400 font-semibold">Competitor 2</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, idx) => (
                <tr key={idx} className="border-b border-emerald-500/10">
                  <td className="py-4 px-4 text-gray-300">{row.feature}</td>
                  <td className="text-center py-4 px-4">
                    {row.auctionflow ? <CheckCircle className="w-5 h-5 text-emerald-400 inline" /> : '✗'}
                  </td>
                  <td className="text-center py-4 px-4">
                    {row.competitor1 ? <CheckCircle className="w-5 h-5 text-gray-400 inline" /> : '✗'}
                  </td>
                  <td className="text-center py-4 px-4">
                    {row.competitor2 ? <CheckCircle className="w-5 h-5 text-gray-400 inline" /> : '✗'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </Section>
  );
};

/**
 * Example 6: Blog/Resource Section
 * Latest news and resources
 */
export const ResourcesSection = () => {
  const resources = [
    {
      title: 'The Ultimate Guide to Procurement Auctions',
      description: 'Learn best practices for running efficient auctions',
      date: 'Apr 20, 2026',
      category: 'Guide',
      readTime: '8 min read'
    },
    {
      title: 'How to Achieve 30% Cost Reduction',
      description: 'Real case studies from our top clients',
      date: 'Apr 18, 2026',
      category: 'Case Study',
      readTime: '5 min read'
    },
    {
      title: 'Maximizing Supplier Competition',
      description: 'Strategies for better bidding dynamics',
      date: 'Apr 15, 2026',
      category: 'Strategy',
      readTime: '6 min read'
    }
  ];

  return (
    <Section className="py-24 px-6">
      <Container>
        <h2 className="text-5xl font-bold text-white text-center mb-4">
          Latest Resources
        </h2>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Learn how to master procurement auctions
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {resources.map((resource, idx) => (
            <GlassCard key={idx} className="cursor-pointer hover:scale-105">
              <div className="flex gap-2 mb-3">
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                  {resource.category}
                </span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                  {resource.readTime}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{resource.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{resource.description}</p>
              <p className="text-xs text-gray-500">{resource.date}</p>
            </GlassCard>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default {
  TestimonialsSection,
  PricingSection,
  FAQSection,
  IntegrationsSection,
  ComparisonSection,
  ResourcesSection
};
