import React from 'react'
import { FaChartLine, FaMoneyBillWave, FaHeadset, FaExchangeAlt, FaEye, FaSeedling, FaUserTie, FaArrowRight } from 'react-icons/fa';

const Features = () => {
  const features = [
    {
      icon: <FaChartLine className="text-3xl" />,
      title: "Price Prediction",
      description: "Advanced AI models predict future crop prices with 90% accuracy, helping you make informed selling decisions."
    },
    {
      icon: <FaMoneyBillWave className="text-3xl" />,
      title: "Market Price Analysis",
      description: "Real-time market trends and historical data analysis to maximize your profits."
    },
    {
      icon: <FaHeadset className="text-3xl" />,
      title: "24/7 Customer Support",
      description: "Dedicated agricultural experts available round-the-clock to assist you."
    },
    {
      icon: <FaExchangeAlt className="text-3xl" />,
      title: "Buying & Selling Platform",
      description: "Seamless marketplace connecting farmers directly with buyers and exporters."
    },
    {
      icon: <FaEye className="text-3xl" />,
      title: "Market Transparency",
      description: "Blockchain-powered transaction records ensuring complete market visibility."
    },
    {
      icon: <FaSeedling className="text-3xl" />,
      title: "Crop Quality Check",
      description: "Certified quality assessment with our mobile testing labs across regions."
    },
    {
      icon: <FaUserTie className="text-3xl" />,
      title: "Farmer Export Appointments",
      description: "Direct connections with international buyers through our global network."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Our <span className="text-green-600">Features</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering farmers with cutting-edge agricultural technology and market insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glassmorphism-card p-8 rounded-2xl backdrop-blur-lg border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="text-green-500 mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-6">{feature.description}</p>
              <button className="flex items-center text-green-600 font-medium group">
                Learn more 
                <FaArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="glassmorphism-card mt-16 p-8 rounded-2xl backdrop-blur-lg border border-white/20 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600">10K+</div>
              <div className="text-gray-600">Farmers Connected</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">95%</div>
              <div className="text-gray-600">Prediction Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">50+</div>
              <div className="text-gray-600">Countries Reached</div>
            </div>
          </div>
        </div>
      </div>

      {/* Glassmorphism styles */}
      <style jsx>{`
        .glassmorphism-card {
          background: rgba(255, 255, 255, 0.25);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .glassmorphism-card:hover {
          background: rgba(255, 255, 255, 0.35);
        }
      `}</style>
    </div>
  );
};

export default Features;