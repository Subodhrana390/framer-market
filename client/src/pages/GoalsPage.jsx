import React from "react";
import {
  FaRobot,
  FaComments,
  FaVideo,
  FaSearch,
  FaChartLine,
  FaLeaf,
  FaMobileAlt,
  FaShieldAlt,
} from "react-icons/fa";

const GoalsPage = () => {
  const futureFeatures = [
    {
      icon: <FaRobot className="text-4xl text-emerald-500" />,
      title: "AI-Powered Assistance",
      description:
        "Integrating advanced AI to provide personalized farming recommendations, pest identification, and yield predictions.",
      timeline: "Q3 2024",
    },
    {
      icon: <FaComments className="text-4xl text-emerald-500" />,
      title: "Real-Time Chat System",
      description:
        "Farm-to-farm communication platform allowing farmers to exchange knowledge, tips, and best practices.",
      timeline: "Q4 2024",
    },
    {
      icon: <FaVideo className="text-4xl text-emerald-500" />,
      title: "Video Consultation",
      description:
        "Direct video calls with agricultural experts for immediate advice on crop issues and farming techniques.",
      timeline: "Q1 2025",
    },
    {
      icon: <FaSearch className="text-4xl text-emerald-500" />,
      title: "Smart Search Engine",
      description:
        "AI-enhanced search that understands agricultural terminology and provides contextual results.",
      timeline: "Q2 2025",
    },
    {
      icon: <FaChartLine className="text-4xl text-emerald-500" />,
      title: "Predictive Analytics",
      description:
        "Machine learning models that forecast market trends and suggest optimal selling times.",
      timeline: "Q3 2025",
    },
    {
      icon: <FaMobileAlt className="text-4xl text-emerald-500" />,
      title: "SMS Integration",
      description:
        "Full-featured SMS with offline capabilities for rural areas with limited connectivity.",
      timeline: "Q4 2025",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-emerald-800 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center mb-4 bg-white/20 px-4 py-2 rounded-full">
            <FaLeaf className="mr-2" />
            <span>Future Roadmap</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Rooted in trust, growing connections. 
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
            Pioneering innovative solutions to connect farmers with cutting-edge
            technology and global markets.
          </p>
        </div>
      </section>

      {/* Upcoming Features */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Upcoming Features & Innovations
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We're building the future of agricultural technology with these
            planned integrations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {futureFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-emerald-100"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <div className="flex items-center text-emerald-600 font-medium">
                <span className="bg-emerald-100 px-3 py-1 rounded-full text-sm">
                  {feature.timeline}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Integration Details */}
      <section className="py-16 px-4 bg-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pr-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                AI Integration for Smarter Farming
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <FaSearch className="mt-1 mr-3 text-emerald-500" />
                  <span>
                    <strong>Intelligent Search:</strong> Natural language
                    processing to understand farming queries in local dialects
                  </span>
                </li>
                <li className="flex items-start">
                  <FaShieldAlt className="mt-1 mr-3 text-emerald-500" />
                  <span>
                    <strong>Disease Detection:</strong> Image recognition for
                    early identification of plant diseases
                  </span>
                </li>
                <li className="flex items-start">
                  <FaChartLine className="mt-1 mr-3 text-emerald-500" />
                  <span>
                    <strong>Yield Prediction:</strong> Machine learning models
                    analyzing weather, soil, and crop data
                  </span>
                </li>
              </ul>
            </div>
            <div className="lg:w-1/2 bg-white p-8 rounded-xl shadow-md">
              <img
                src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80"
                alt="AI in agriculture"
                className="w-full h-auto rounded-lg"
              />
              <div className="mt-4 text-center text-sm text-gray-500">
                AI-powered tools will revolutionize how farmers access
                information and make decisions
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Communication Features */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Enhanced Communication Platform
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Connecting farmers with experts and peers through advanced
            communication tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-emerald-500">
            <div className="text-emerald-500 mb-4 text-3xl">
              <FaComments />
            </div>
            <h3 className="text-xl font-bold mb-3">Real-Time Chat</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Farmer-to-farmer messaging</li>
              <li>• Group discussions by crop type</li>
              <li>• Quick access to agricultural experts</li>
              <li>• Language translation support</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-emerald-500">
            <div className="text-emerald-500 mb-4 text-3xl">
              <FaVideo />
            </div>
            <h3 className="text-xl font-bold mb-3">Video Consultation</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• HD video calls with agronomists</li>
              <li>• Screen sharing for problem diagnosis</li>
              <li>• Scheduled appointments</li>
              <li>• Recorded sessions for future reference</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-emerald-500">
            <div className="text-emerald-500 mb-4 text-3xl">
              <FaMobileAlt />
            </div>
            <h3 className="text-xl font-bold mb-3">Mobile Integration</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Low-bandwidth optimized</li>
              <li>• Offline message syncing</li>
              <li>• Push notifications</li>
              <li>• Camera integration for field photos</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-emerald-800 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            Be Part of Our Agricultural Revolution
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our beta program to test these features before public release
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-emerald-800 font-semibold rounded-lg hover:bg-gray-100 transition">
              Join Beta Program
            </button>
            <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition">
              Request Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GoalsPage;
