import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    // We'll try to get the user name from localStorage if available, or just a generic welcome
    // Assuming the login process saves 'user' object or we can decode it. 
    // It seems SignInForm saves 'userid', 'role', 'token'. It doesn't seem to save the name directly in localStorage items we saw.
    // However, looking at SignInForm, it saves: token, role, userid.
    // Let's check if we can get the name. If not, we'll just say "Welcome back!".
    // But wait, the requirement asks "Who will be identified". 
    // If we want to show the name, we might need to fetch it or save it on login.
    // Let's assume for now we just show a welcome message, and if we can find a name, good.
    // Actually, let's simply check if we have a token and show a toast.

    // To identify "Who", we probably should have saved the name in localStorage on login.
    // I'll check SignInForm again. It saves: token, role, userid.
    // I should probably update SignInForm to save the name too if I want to display it here without an API call.
    // For now, I'll add the logic to Home.tsx and maybe I'll update SignInForm to save the name.

    if (token) {
      // Use a flag to ensure we only show this once per session or reload? 
      // The user requirement implies "when the page loads".
      // Using a simple check for now.
      const userName = localStorage.getItem("userName"); // I will ensure this is saved in SignInForm/SignUpForm
      // We'll use a custom event or just run this on mount.
      // To avoid spamming on every navigation if Home is re-mounted, maybe checks trigger.
      // But Home is likely the landing page.
      toast.info(`Welcome back${userName ? `, ${userName}` : ""}!`);
    }
  }, []);

  return (
    <>
      <ToastContainer position="top-right" />
      <Navbar />
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
