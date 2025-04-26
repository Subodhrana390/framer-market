import React from 'react';
import { 
  FaHome, 
  FaChartPie, 
  FaChartLine, 
  FaBullseye, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin 
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-emerald-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="border-b-2 border-emerald-500 pb-1">Quick Links</span>
            </h3>
            <ul className="space-y-3">
              <FooterLink href="/" icon={<FaHome />} text="Home" />
              <FooterLink href="/dashboard" icon={<FaChartPie />} text="Dashboard" />
              <FooterLink href="/features" icon={<FaChartLine />} text="Features" />
              <FooterLink href="/goals" icon={<FaBullseye />} text="Goals" />
              <FooterLink href="/about" text="About Us" />
              <FooterLink href="/blog" text="Blog" />
            </ul>
          </div>
          
          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="border-b-2 border-emerald-500 pb-1">Contact Us</span>
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaPhone className="mt-1 mr-3 flex-shrink-0" />
                <span>+1 (123) 456-7890</span>
              </li>
              <li className="flex items-start">
                <FaEnvelope className="mt-1 mr-3 flex-shrink-0" />
                <span>info@agroapp.com</span>
              </li>
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 flex-shrink-0" />
                <span>123 Farm Street, Agricultural City, AG 12345</span>
              </li>
            </ul>
          </div>
          
          {/* Newsletter Subscription */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="border-b-2 border-emerald-500 pb-1">Newsletter</span>
            </h3>
            <p className="mb-4">Subscribe to our newsletter for the latest updates and farming tips.</p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-4 py-2 w-full rounded-l-lg focus:outline-none text-gray-800"
                required
              />
              <button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-r-lg transition"
              >
                Subscribe
              </button>
            </form>
          </div>
          
          {/* Social Media */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="border-b-2 border-emerald-500 pb-1">Follow Us</span>
            </h3>
            <div className="flex space-x-4 mb-6">
              <SocialIcon href="#" icon={<FaFacebook />} />
              <SocialIcon href="#" icon={<FaTwitter />} />
              <SocialIcon href="#" icon={<FaInstagram />} />
              <SocialIcon href="#" icon={<FaLinkedin />} />
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Farmers Helpline</h4>
              <p className="text-sm">Need immediate assistance? Call our 24/7 helpline at <strong>1800-AGRO-HELP</strong></p>
            </div>
          </div>
        </div>
        
        {/* Copyright and Legal Links */}
        <div className="border-t border-emerald-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>&copy; {new Date().getFullYear()} AgroApp. All rights reserved.</p>
          </div>
          <div className="flex space-x-4">
            <a href="/privacy" className="hover:text-emerald-300 transition">Privacy Policy</a>
            <a href="/terms" className="hover:text-emerald-300 transition">Terms of Service</a>
            <a href="/cookies" className="hover:text-emerald-300 transition">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Reusable Footer Link Component
const FooterLink = ({ href, icon, text }) => (
  <li>
    <a 
      href={href} 
      className="flex items-center hover:text-emerald-300 transition"
    >
      {icon && <span className="mr-3">{icon}</span>}
      {text}
    </a>
  </li>
);

// Reusable Social Icon Component
const SocialIcon = ({ href, icon }) => (
  <a 
    href={href} 
    className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition"
  >
    {icon}
  </a>
);

export default Footer;