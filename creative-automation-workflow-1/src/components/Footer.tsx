import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Github, Twitter, Linkedin, Youtube, Mail } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const footerLinks = {
    Product: [
      { label: 'Workflow Builder', action: () => onNavigate('workflow') },
      { label: 'Competitor Analysis', action: () => onNavigate('analysis') },
      { label: 'Creation Studio', action: () => onNavigate('studio') },
      { label: 'Templates', action: () => onNavigate('templates') },
      { label: 'Idea Board', action: () => onNavigate('ideas') },
      { label: 'Pricing', action: () => onNavigate('pricing') }
    ],
    'AI Models': [
      { label: 'GPT-5', action: () => {} },
      { label: 'Gemini Pro', action: () => {} },
      { label: 'Claude', action: () => {} },
      { label: 'Kling AI', action: () => {} },
      { label: 'Sora', action: () => {} },
      { label: 'Grok', action: () => {} }
    ],
    Resources: [
      { label: 'Documentation', action: () => {} },
      { label: 'API Reference', action: () => {} },
      { label: 'Blog', action: () => {} },
      { label: 'Tutorials', action: () => {} },
      { label: 'Community', action: () => {} },
      { label: 'Changelog', action: () => {} }
    ],
    Company: [
      { label: 'About', action: () => {} },
      { label: 'Careers', action: () => {} },
      { label: 'Press', action: () => {} },
      { label: 'Contact', action: () => {} },
      { label: 'Privacy Policy', action: () => {} },
      { label: 'Terms of Service', action: () => {} }
    ]
  };

  return (
    <footer className="bg-[#080816] border-t border-gray-800/50">
      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-cyan-900/40" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
          <div className="relative p-8 sm:p-12 text-center">
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
              Ready to Build Your AI Creative Factory?
            </h3>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Join thousands of creators and businesses using RedFace to produce content 10x faster.
            </p>
            <button 
              onClick={() => onNavigate('workflow')}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold hover:from-purple-500 hover:to-pink-500 transition-all shadow-2xl shadow-purple-500/20"
            >
              Start Creating Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black text-white">RedFace</span>
            </div>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Your AI Creative Team in one workspace. Design, video, ads — without designers or agencies.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm font-medium hover:bg-purple-500 transition-colors"
              >
                {subscribed ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
              </button>
            </form>
            {subscribed && <p className="text-xs text-green-400 mt-2">Subscribed successfully!</p>}

            {/* Social links */}
            <div className="flex gap-3 mt-6">
              {[Twitter, Github, Linkedin, Youtube].map((Icon, i) => (
                <button key={i} className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-700/50 transition-colors">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-bold text-white mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={link.action}
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; 2026 RedFace Creative. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Privacy</button>
            <button className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Terms</button>
            <button className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Cookies</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
