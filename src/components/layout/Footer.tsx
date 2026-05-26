import { Globe, Share2, Link2, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Online Shopping */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest text-gray-400 mb-4">ONLINE SHOPPING</h4>
            <ul className="flex flex-col gap-2">
              {['Men', 'Women', 'Kids', 'Home & Living', 'Beauty', 'Gift Cards'].map((item) => (
                <li key={item}>
                  <Link to="/products" className="text-sm text-gray-300 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Policies */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest text-gray-400 mb-4">CUSTOMER POLICIES</h4>
            <ul className="flex flex-col gap-2">
              {['Contact Us', 'FAQ', 'T&C', 'Terms Of Use', 'Track Orders', 'Shipping', 'Cancellation', 'Returns', 'Privacy Policy', 'Grievance Officer'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Experience the App */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest text-gray-400 mb-4">EXPERIENCE NEXCART APP ON</h4>
            <div className="flex flex-col gap-3">
              <a href="#" className="bg-white text-black rounded px-3 py-2 text-sm font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors">
                <span>📱</span> Google Play
              </a>
              <a href="#" className="bg-white text-black rounded px-3 py-2 text-sm font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors">
                <span>🍎</span> App Store
              </a>
            </div>
          </div>

          {/* Keep In Touch */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest text-gray-400 mb-4">KEEP IN TOUCH</h4>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Globe size={16} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Share2 size={16} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Link2 size={16} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Video size={16} />
              </a>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">SUBSCRIBE TO NEWSLETTER</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email address"
                  className="flex-1 bg-gray-700 text-white text-sm px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-gray-500"
                />
                <button className="bg-primary text-white text-sm px-3 py-2 rounded hover:bg-primary-600 transition-colors">
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
