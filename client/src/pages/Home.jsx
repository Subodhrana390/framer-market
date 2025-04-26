import React from "react";
import PriceTrendDashboard from "./PriceTrendDashboard";
import StatePredictionDashboard from "./StatePredictionDashboard";
import HeroSection from "./components/HeroSection";
import Features from "./components/features";

const Home = () => {
  return (
    <div>
      <HeroSection />
      <Features />
      <StatePredictionDashboard />
      <PriceTrendDashboard />
    </div>
  );
};

export default Home;
