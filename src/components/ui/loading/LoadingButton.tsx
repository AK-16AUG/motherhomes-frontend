import React from "react";
import LoadingSpinner from "./LoadingSpinner";

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  variant = "primary",
  size = "md",
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500 disabled:bg-gray-300 disabled:text-gray-500",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400",
    outline:
      "border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-50 focus:ring-yellow-500 disabled:border-gray-300 disabled:text-gray-400",
    ghost:
      "text-yellow-500 hover:bg-yellow-50 focus:ring-yellow-500 disabled:text-gray-400",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${
        sizeClasses[size]
      } ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <LoadingSpinner
          size="sm"
          color={variant === "primary" ? "white" : "primary"}
          className="mr-2"
        />
      )}
      {loading ? loadingText || "Loading..." : children}
    </button>
  );
};

export default LoadingButton;
