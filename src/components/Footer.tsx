import React from "react";
import { MapPin, Mail, Phone, Home } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 py-12 font-[montserrat]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <div className="p-2 bg-yellow-400 rounded-lg">
                  <Home className="w-6 h-6 text-gray-900" />
                </div>
              </div>
              <h2 className="text-white text-2xl lg:text-3xl font-bold mb-3 tracking-tight">
                MotherHomes
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Your trusted partner for comfortable and affordable
                accommodation solutions.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 group">
                <div className="p-1.5 bg-gray-800 rounded-lg group-hover:bg-yellow-400 transition-colors duration-300">
                  <MapPin className="w-4 h-4 text-yellow-400 group-hover:text-gray-900" />
                </div>
                <div>
                  <span className="text-gray-400 text-xs">
                    Crossing Republik, Ghaziabad
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 group">
                <div className="p-1.5 bg-gray-800 rounded-lg group-hover:bg-yellow-400 transition-colors duration-300">
                  <Mail className="w-4 h-4 text-yellow-400 group-hover:text-gray-900" />
                </div>
                <div>
                  <a
                    href="mailto:info@motherhomes.in"
                    className="text-gray-400 hover:text-yellow-400 transition-colors text-xs"
                  >
                    info@motherhomes.in
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 group">
                <div className="p-1.5 bg-gray-800 rounded-lg group-hover:bg-yellow-400 transition-colors duration-300">
                  <Phone className="w-4 h-4 text-yellow-400 group-hover:text-gray-900" />
                </div>
                <div>
                  <a
                    href="tel:+916202653172"
                    className="text-gray-400 hover:text-yellow-400 transition-colors text-xs"
                  >
                    +91 6202653172
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-1">
            <h4 className="text-white text-lg font-bold mb-6 relative">
              Company
              <div className="absolute -bottom-1 left-0 w-10 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></div>
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/about"
                  className="text-gray-400 hover:text-yellow-400 hover:translate-x-1 transition-all duration-300 text-sm flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-2 group-hover:bg-yellow-400 transition-colors"></span>
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/services"
                  className="text-gray-400 hover:text-yellow-400 hover:translate-x-1 transition-all duration-300 text-sm flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-2 group-hover:bg-yellow-400 transition-colors"></span>
                  Our Services
                </a>
              </li>
              <li>
                <a
                  href="/viewlisting"
                  className="text-gray-400 hover:text-yellow-400 hover:translate-x-1 transition-all duration-300 text-sm flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-2 group-hover:bg-yellow-400 transition-colors"></span>
                  Properties
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-400 hover:text-yellow-400 hover:translate-x-1 transition-all duration-300 text-sm flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-2 group-hover:bg-yellow-400 transition-colors"></span>
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Our Services */}
          <div className="lg:col-span-1">
            <h4 className="text-white text-lg font-bold mb-6 relative">
              Our Services
              <div className="absolute -bottom-1 left-0 w-10 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></div>
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-yellow-400 hover:translate-x-1 transition-all duration-300 text-sm flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-2 group-hover:bg-yellow-400 transition-colors"></span>
                  Single Rooms
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-yellow-400 hover:translate-x-1 transition-all duration-300 text-sm flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-2 group-hover:bg-yellow-400 transition-colors"></span>
                  Double Sharing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-yellow-400 hover:translate-x-1 transition-all duration-300 text-sm flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-2 group-hover:bg-yellow-400 transition-colors"></span>
                  Triple Sharing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-yellow-400 hover:translate-x-1 transition-all duration-300 text-sm flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-2 group-hover:bg-yellow-400 transition-colors"></span>
                  Food Services
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-yellow-400 hover:translate-x-1 transition-all duration-300 text-sm flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-2 group-hover:bg-yellow-400 transition-colors"></span>
                  Laundry Services
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-yellow-400 hover:translate-x-1 transition-all duration-300 text-sm flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-2 group-hover:bg-yellow-400 transition-colors"></span>
                  Housekeeping
                </a>
              </li>
            </ul>
          </div>

          {/* Featured Property Image */}
          <div className="lg:col-span-1 sm:col-span-2 lg:col-span-1">
            <h4 className="text-white text-lg font-bold mb-6 relative">
              Featured Space
              <div className="absolute -bottom-1 left-0 w-10 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></div>
            </h4>

            <div className="relative group cursor-pointer">
              <div className="overflow-hidden rounded-xl border-2 border-gray-700 group-hover:border-yellow-400 transition-colors duration-300">
                <img
                  src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Beautiful rental space"
                  className="w-full h-48 sm:h-40 lg:h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h5 className="text-white font-semibold text-sm mb-1">
                    Premium Single Room
                  </h5>
                  <p className="text-gray-200 text-xs">
                    Modern amenities • AC • WiFi
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-gray-400 text-xs mb-3">
                Experience comfort at its finest
              </p>
              <a
                href="/viewlisting"
                className="inline-flex items-center justify-center px-4 py-2 bg-yellow-400 text-gray-900 text-xs font-semibold rounded-lg hover:bg-yellow-500 transition-colors duration-300 w-full"
              >
                View All Properties
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-10 pt-6 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-xs">
              © 2025 MotherHomes Pvt. Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="/privacy"
                className="text-gray-400 hover:text-yellow-400 transition-colors text-xs hover:underline underline-offset-4"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-gray-400 hover:text-yellow-400 transition-colors text-xs hover:underline underline-offset-4"
              >
                Terms of Service
              </a>
              <a
                href="/sitemap"
                className="text-gray-400 hover:text-yellow-400 transition-colors text-xs hover:underline underline-offset-4"
              >
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
