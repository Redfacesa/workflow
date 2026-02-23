import React, { useState } from 'react';
import { Check, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (plan: string) => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      icon: Zap,
      price: annual ? 29 : 39,
      color: '#3b82f6',
      description: 'Perfect for solo creators and small businesses',
      features: [
        '100 AI generations / month',
        '5 workflow templates',
        'Graphic Design mode',
        'Competitor analysis (5/month)',
        'Google Drive export',
        'Email support'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Pro',
      icon: Sparkles,
      price: annual ? 79 : 99,
      color: '#a855f7',
      description: 'For growing teams and marketing agencies',
      features: [
        '1,000 AI generations / month',
        'Unlimited workflow templates',
        'All creation modes',
        'Unlimited competitor analysis',
        'Video & voice generation',
        'Custom brand kits',
        'Priority support',
        'Team collaboration (3 seats)'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      icon: Crown,
      price: annual ? 199 : 249,
      color: '#f59e0b',
      description: 'For agencies and large teams with custom needs',
      features: [
        'Unlimited AI generations',
        'Custom workflow builder',
        'All AI models access',
        'White-label option',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Unlimited team seats',
        'SLA guarantee'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="bg-[#0a0a1a] py-24" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
            Simple, Transparent{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-8">
            Start free. Scale as you grow. No hidden fees.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-gray-800/50 border border-gray-700/50">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !annual ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                annual ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Annual
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">Save 25%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-purple-900/20 to-[#1a1a2e] border-purple-500/30 shadow-xl shadow-purple-500/10'
                    : 'bg-[#1a1a2e]/60 border-gray-800/50 hover:border-gray-700/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-bold text-white">
                    Most Popular
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: plan.color + '15' }}>
                      <Icon className="w-5 h-5" style={{ color: plan.color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-black text-white">${plan.price}</span>
                    <span className="text-gray-500 text-sm">/month</span>
                  </div>

                  <button
                    onClick={() => onSelectPlan(plan.name)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/20'
                        : 'bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:text-white hover:border-gray-600'
                    }`}
                  >
                    {plan.cta}
                  </button>

                  <div className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
