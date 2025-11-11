import React from "react";
import video from "../../assets/Animation_Video_MotherHome_Discovery.mp4"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:flex">
          <div className="relative w-full h-full">
            {/* Video Background */}
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              controls={false}
              style={{ pointerEvents: "none" }}
            >
              <source
                src={video}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

      </div>
    </div>
  );
}
