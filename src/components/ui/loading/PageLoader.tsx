import React from "react";
import LoadingSpinner from "./LoadingSpinner";

interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({
  message = "Loading...",
  fullScreen = true,
  className = "",
}) => {
  return (
    <div
      className={`
      ${fullScreen ? "fixed inset-0 z-50" : "relative w-full h-64"}
      flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm
      ${className}
    `}
    >
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="xl" color="primary" />
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700">{message}</p>
          <div className="flex space-x-1 mt-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
