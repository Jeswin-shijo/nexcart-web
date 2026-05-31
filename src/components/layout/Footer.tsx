import { Globe, Share2, Link2, Video } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const SHOPPING_LINKS = [
  { label: 'Men', to: '/products?gender=men' },
  { label: 'Women', to: '/products?gender=women' },
  { label: 'Kids', to: '/products?gender=kids' },
  { label: 'Home & Living', to: '/products?search=home' },
  { label: 'Beauty', to: '/products?search=beauty' },
  { label: 'Gift Cards', to: '/wallet' },
];

type PolicyLink = { label: string; to: string } | { label: string; message: string };

const POLICY_LINKS: PolicyLink[] = [
  { label: 'Contact Us', message: 'Support is available at support@nexcart.local' },
  { label: 'FAQ', message: 'FAQ page is being prepared. Contact support for help.' },
  { label: 'T&C', message: 'Terms and conditions document is being prepared.' },
  { label: 'Terms Of Use', message: 'Terms of use document is being prepared.' },
  { label: 'Track Orders', to: '/orders/my' },
  { label: 'Shipping', message: 'Shipping is free on orders above ₹499.' },
  { label: 'Cancellation', to: '/orders/my' },
  { label: 'Returns', message: 'Returns can be requested from your order details after delivery.' },
  { label: 'Privacy Policy', message: 'Privacy policy document is being prepared.' },
  { label: 'Grievance Officer', message: 'Grievance contact: grievance@nexcart.local' },
];

export default function Footer() {
  const [email, setEmail] = useState('');

  function handleSubscribe() {
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error('Enter a valid email address');
      return;
    }
    const existing = JSON.parse(localStorage.getItem('nexcart_newsletter') || '[]') as string[];
    if (!existing.includes(trimmed.toLowerCase())) {
      localStorage.setItem('nexcart_newsletter', JSON.stringify([...existing, trimmed.toLowerCase()]));
    }
    setEmail('');
    toast.success('Subscribed to newsletter');
  }

  return (
    <footer className="bg-gray-900 dark:bg-black text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Online Shopping */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest text-gray-400 mb-4">ONLINE SHOPPING</h4>
            <ul className="flex flex-col gap-2">
              {SHOPPING_LINKS.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-gray-300 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Policies */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest text-gray-400 mb-4">CUSTOMER POLICIES</h4>
            <ul className="flex flex-col gap-2">
              {POLICY_LINKS.map((item) => (
                <li key={item.label}>
                  {'to' in item ? (
                    <Link to={item.to} className="text-sm text-gray-300 hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toast(item.message)}
                      className="text-sm text-gray-300 hover:text-white transition-colors text-left"
                    >
                      {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Experience the App */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest text-gray-400 mb-4">EXPERIENCE NEXCART APP ON</h4>
            <div className="flex flex-col gap-3">
              <a href="https://play.google.com/store" target="_blank" rel="noreferrer" className="bg-white text-black rounded px-3 py-2 text-sm font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors">
                <span>📱</span> Google Play
              </a>
              <a href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer" className="bg-white text-black rounded px-3 py-2 text-sm font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors">
                <span>🍎</span> App Store
              </a>
            </div>
          </div>

          {/* Keep In Touch */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest text-gray-400 mb-4">KEEP IN TOUCH</h4>
            <div className="flex gap-3">
              <a href="https://nexcart.local" target="_blank" rel="noreferrer" className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary transition-colors" aria-label="Website">
                <Globe size={16} />
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary transition-colors" aria-label="Social">
                <Share2 size={16} />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary transition-colors" aria-label="LinkedIn">
                <Link2 size={16} />
              </a>
              <a href="https://www.youtube.com" target="_blank" rel="noreferrer" className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary transition-colors" aria-label="Videos">
                <Video size={16} />
              </a>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">SUBSCRIBE TO NEWSLETTER</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email address"
                  className="flex-1 bg-gray-700 text-white text-sm px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-gray-500"
                />
                <button onClick={handleSubscribe} className="bg-primary text-white text-sm px-3 py-2 rounded hover:bg-primary-600 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Nexcart Fashion Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>🔒</span>
            <span>100% SECURE PAYMENTS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
