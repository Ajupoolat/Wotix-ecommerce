import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import basketballHoop from "../../../../assets/baskectBall.jpg";
import logo from "../../../../assets/Wotix removed-BG.png";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { sendotpchangepassword } from "@/api/users/profile/profilemgt";
import toast from "react-hot-toast";

const ChangePasswordEmail = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, setpending] = useState(false);
  const { id } = useParams();

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Mutation for sending OTP
  const { mutate } = useMutation({
    mutationFn: ({ emailId, userId }) => sendotpchangepassword({emailId, userId}),

    onSuccess: () => {
      toast.success("OTP sent successfully!");
      navigate("/otpverification", { state: { emailid: email, userId: id } });
    },
    onError: (err) => {
      toast.error(err.message || "Error sending OTP. Try again.");
    },
  });


  // Form Submission Handler
  const onSubmit = (e) => {
    setpending(!pending);

    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      setpending(false);

      return;
    }

    if (!validateEmail(email)) {
      setError("Invalid email format");
      setpending(false);

      return;
    }

    mutate({ emailId: email, userId: id });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white shadow-lg rounded-lg flex flex-col sm:flex-row w-full max-w-4xl">
        {/* Left Section: Image */}
        <div className="w-full sm:w-1/2 hidden sm:block">
          <img
            src={basketballHoop}
            alt="Basketball Hoop"
            className="h-full w-full object-cover rounded-l-lg"
          />
        </div>

        {/* Right Section: Form */}
        <div className="w-full sm:w-1/2 flex flex-col justify-center items-center p-6 sm:p-8 bg-[#F5F0E1]">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <img
              src={logo}
              alt="Logo"
              className="h-24 w-24 sm:h-40 sm:w-40 object-contain"
            />
          </div>

          {/* Form */}
          <div className="text-center w-full max-w-md">
            <p className="text-sm text-gray-600 mb-2">Forgot password?</p>
            <h1 className="text-xl sm:text-2xl font-bold mb-4">
              Enter your valid email ID
            </h1>

            <form className="space-y-4" onSubmit={onSubmit} noValidate>
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border-gray-300 bg-gray-200 placeholder-gray-500"
                />
                {error && (
                  <p className="mt-1 text-sm text-red-600 text-left">{error}</p>
                )}
              </div>

              <Button
                className="w-full bg-black text-white hover:bg-gray-600"
                type="submit"
              >
                {/* {pending ? "Sending..." : "Send confirmation code"} */}
                Send confirmation code
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-500 hover:underline cursor-pointer"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordEmail;
