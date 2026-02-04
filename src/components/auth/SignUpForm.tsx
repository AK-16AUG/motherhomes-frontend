import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import axios from "../../utils/Axios/Axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoadingButton } from "../ui/loading";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [form, setForm] = useState({
    User_Name: "",
    phone_no: "",
    email: "",
    password: "",
    role: "user",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const [verificationStep, setVerificationStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };

  const sendVerificationEmail = async () => {
    if (!form.email) {
      toast.error("Email is required");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/sendemail", { email: form.email });
      toast.success("Verification OTP sent to your email");
      setVerificationStep(2);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to send verification email"
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      toast.error("OTP is required");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/auth/verifyuser", { email: form.email, otp });
      toast.success("Email verified successfully");
      setVerificationStep(3);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check terms and conditions in all steps
    if (!isChecked) {
      toast.error("You must agree to the terms and conditions.");
      return;
    }

    // Step 1: Send verification email - only check email
    if (verificationStep === 1) {
      if (!form.email) {
        toast.error("Email is required");
        return;
      }
      await sendVerificationEmail();
      return;
    }

    // Step 2: Verify OTP - only check OTP
    if (verificationStep === 2) {
      if (!otp) {
        toast.error("OTP is required");
        return;
      }
      await verifyOtp();
      return;
    }

    // Step 3: Create user - check all fields
    if (!form.User_Name || !form.phone_no || !form.email || !form.password) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (form.phone_no.length !== 10) {
      toast.error("The phone number must contain exactly 10 digits.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/auth/createUser", {
        ...form,
        phone_no: Number(form.phone_no),
      });
      toast.success("Sign up successful! Redirecting to sign in...");
      setTimeout(() => navigate("/signin"), 1500);
    } catch (err: any) {
      if (err?.response?.data?.message === "User already exists") {
        toast.error("An account already exists. Please log in using your email and password.");
      } else {
        toast.error(
          err?.response?.data?.message || "Sign up failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <ToastContainer position="top-center" />
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your details to sign up!
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* User Name */}
              <div>
                <Label>
                  Name<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="User_Name"
                  name="User_Name"
                  placeholder="Enter your name"
                  value={form.User_Name}
                  onChange={handleChange}
                  required
                  disabled={verificationStep > 1}
                />
              </div>
              {/* Phone Number */}
              <div>
                <Label>
                  Phone Number<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="tel"
                  id="phone_no"
                  name="phone_no"
                  placeholder="Enter your phone number"
                  value={form.phone_no}
                  onChange={handleChange}
                  required
                  disabled={verificationStep > 1}
                />
              </div>
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
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={verificationStep > 1}
                />
              </div>

              {/* OTP Verification (shown only after email is sent) */}
              {verificationStep === 2 && (
                <div>
                  <Label>
                    Verification OTP<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="otp"
                    name="otp"
                    placeholder="Enter the OTP sent to your email"
                    value={otp}
                    onChange={handleOtpChange}
                    required
                  />
                </div>
              )}

              {/* Password (shown only after OTP verification) */}
              {verificationStep === 3 && (
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-yellow-400 dark:fill-yellow-400 size-5 hover:fill-yellow-500 dark:hover:fill-yellow-500 transition-colors" />
                      ) : (
                        <EyeCloseIcon className="fill-yellow-400 dark:fill-yellow-400 size-5 hover:fill-yellow-500 dark:hover:fill-yellow-500 transition-colors" />
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Checkbox */}
              <div className="flex items-center gap-3">
                <Checkbox
                  className="w-5 h-5"
                  checked={isChecked}
                  onChange={setIsChecked}
                />
                <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                  By creating an account you agree to the{" "}
                  <span className="text-gray-800 dark:text-white/90">
                    Terms and Conditions,
                  </span>{" "}
                  and our{" "}
                  <span className="text-gray-800 dark:text-white">
                    Privacy Policy
                  </span>
                </p>
              </div>

              {/* Button */}
              <div>
                <LoadingButton
                  type="submit"
                  loading={loading}
                  loadingText="Processing..."
                  variant="primary"
                  size="md"
                  className="w-full bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-400 dark:hover:bg-yellow-500 text-black"
                >
                  {verificationStep === 1
                    ? "Send Verification Email"
                    : verificationStep === 2
                      ? "Verify OTP"
                      : "Sign Up"}
                </LoadingButton>
              </div>
            </div>
          </form>
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-yellow-400 hover:text-yellow-500 dark:text-yellow-400 dark:hover:text-yellow-500"
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
