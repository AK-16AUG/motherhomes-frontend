import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";

import axios from "../../utils/Axios/Axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoadingButton, LoadingSpinner } from "../ui/loading";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/auth/loginUser", form);
      toast.success("Sign in successful!");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("userid", res.data.user._id);
      localStorage.setItem("userName", res.data.user.User_Name); // Saving name for Welcome page

      setTimeout(() => navigate("/"), 1200);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Sign in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <ToastContainer position="top-center" />
      <div className="w-full max-w-md pt-10 mx-auto">
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
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
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
                <div className="flex items-center justify-end">
                  <Link
                    to="/resetpass"
                    className="text-sm text-yellow-400 hover:text-yellow-500 dark:text-yellow-400 dark:hover:text-yellow-500"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <LoadingButton
                    className="w-full bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-400 dark:hover:bg-yellow-500 text-black border-yellow-400 hover:border-yellow-500 dark:border-yellow-400 dark:hover:border-yellow-500"
                    size="sm"
                    type="submit"
                    loading={loading}
                    loadingText="Signing in..."
                    variant="primary"
                  >
                    Sign in
                  </LoadingButton>
                </div>
              </div>
            </form>
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="text-yellow-400 hover:text-yellow-500 dark:text-yellow-400 dark:hover:text-yellow-500"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
          <LoadingSpinner size="xl" color="primary" />
        </div>
      )}
    </div>
  );
}
