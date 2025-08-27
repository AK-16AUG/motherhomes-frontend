import React from "react";

interface SkeletonLoaderProps {
  variant?: "card" | "text" | "avatar" | "image" | "table";
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = "text",
  count = 1,
  className = "",
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return (
          <div
            className={`border border-gray-200 shadow rounded-lg p-4 animate-pulse ${className}`}
          >
            <div className="h-48 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          </div>
        );

      case "avatar":
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="rounded-full bg-gray-300 h-10 w-10"></div>
          </div>
        );

      case "image":
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="bg-gray-300 h-64 w-full rounded"></div>
          </div>
        );

      case "table":
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-4 bg-gray-300 rounded w-full mb-3"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6 mb-3"></div>
            <div className="h-4 bg-gray-300 rounded w-4/6 mb-3"></div>
            <div className="h-4 bg-gray-300 rounded w-3/6"></div>
          </div>
        );

      default: // text
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
          </div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="mb-4 last:mb-0">
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;
