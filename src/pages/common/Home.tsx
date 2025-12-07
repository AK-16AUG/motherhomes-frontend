import React, { useState, useEffect } from "react";
import HeroSection from "../../components/HeroSection";
import PropertiesSection from "../../components/PropertiesSection";
import Feature from "../../components/Feature";
import FeaturedProperty from "../../components/FeaturedProperty";
// import OverView from "../../components/";
import CustomerReview from "../../components/CoustimerReview";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import InquiryModal from "../../components/InquiryModal";

const HomePage: React.FC = () => {
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  useEffect(() => {
    // Check if user has already submitted inquiry
    const hasSubmitted = localStorage.getItem("inquirySubmitted");
    if (!hasSubmitted) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setShowInquiryModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <Navbar/>
      <HeroSection />
      <PropertiesSection />
      <Feature />
      <FeaturedProperty />
     
      <CustomerReview />
      <Footer />
      
      <InquiryModal 
        isOpen={showInquiryModal} 
        onClose={() => setShowInquiryModal(false)} 
      />
    </>
  );
};

export default HomePage;
