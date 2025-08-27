import React from "react";
import HeroSection from "../../components/HeroSection";
import PropertiesSection from "../../components/PropertiesSection";
import Feature from "../../components/Feature";
import FeaturedProperty from "../../components/FeaturedProperty";
// import OverView from "../../components/";
import CustomerReview from "../../components/CoustimerReview";
import Footer from "../../components/Footer";
 import Navbar from "../../components/Navbar";
const HomePage: React.FC = () => {
  return (
    <>
    <Navbar/>
      <HeroSection />
      <PropertiesSection />
      <Feature />
      <FeaturedProperty />
     
      <CustomerReview />
      <Footer />
    </>
  );
};

export default HomePage;
