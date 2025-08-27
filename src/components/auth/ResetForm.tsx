import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import axios from "../../utils/Axios/Axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ResetPasswordForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Handlers
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  // Step 1: Send reset email
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required");
    setLoading(true);
    try {
      await axios.post("/resetsendemail", { email });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error("OTP is required");
    setLoading(true);
    try {
      await axios.post("/auth/verifyResetUser", { email, otp });
      toast.success("OTP verified!");
      setStep(3);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return toast.error("Password is required");
    if (!isChecked) return toast.error("You must agree to the terms and conditions.");

    setLoading(true);
    try {
      await axios.post("/auth/updateUserPass", { email, password });
      toast.success("Password updated! Redirecting...");
      setTimeout(() => navigate("/signin"), 1500);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar bg-white">
      <ToastContainer position="top-center" />
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-yellow-500 text-title-sm sm:text-title-md">
              Reset Password
            </h1>
            <p className="text-sm text-gray-500">
              {step === 1 && "Enter your email to receive a password reset OTP"}
              {step === 2 && "Enter the OTP sent to your email"}
              {step === 3 && "Enter your new password below"}
            </p>
          </div>

          <form
            onSubmit={
              step === 1
                ? handleSendResetEmail
                : step === 2
                ? handleVerifyOtp
                : handleResetPassword
            }
          >
            <div className="space-y-5">
              {/* Email */}
              <div>
                <Label>
                  Email<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  disabled={step > 1}
                />
              </div>

              {/* OTP */}
              {step === 2 && (
                <div>
                  <Label>
                    OTP<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="otp"
                    name="otp"
                    placeholder="Enter OTP from your email"
                    value={otp}
                    onChange={handleOtpChange}
                    required
                  />
                </div>
              )}

              {/* Password */}
              {step === 3 && (
                <div>
                  <Label>
                    New Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Set your new password"
                      value={password}
                      onChange={handlePasswordChange}
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-yellow-400 size-5 hover:fill-yellow-500 transition-colors" />
                      ) : (
                        <EyeCloseIcon className="fill-yellow-400 size-5 hover:fill-yellow-500 transition-colors" />
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Checkbox at last step */}
              {step === 3 && (
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block font-normal text-gray-500">
                    By resetting your password, you agree to the{" "}
                    <span className="text-gray-800">Terms and Conditions</span> and our{" "}
                    <span className="text-gray-800">Privacy Policy</span>
                  </p>
                </div>
              )}

              {/* Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-black transition rounded-lg bg-yellow-400 shadow-theme-xs hover:bg-yellow-500 disabled:opacity-60"
                >
                  {loading
                    ? "Processing..."
                    : step === 1
                    ? "Send Reset OTP"
                    : step === 2
                    ? "Verify OTP"
                    : "Reset Password"}
                </button>
              </div>
            </div>
          </form>
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 sm:text-start">
              Remember your password?{" "}
              <Link
                to="/signin"
                className="text-yellow-400 hover:text-yellow-500"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
