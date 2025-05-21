import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import watchImage from '../../../../assets/watch image.jpg';
import logo from '../../../../assets/Wotix removed-BG.png';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { sendOtp } from '@/api/users/signup/signupcall';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define Zod schema
const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'First name must contain only letters and spaces'),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Last name must contain only letters and spaces'),
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: z.string().min(8, 'Confirm password is required'),
    refferalId: z
      .string()
      .optional()
      .refine(
        (val) => !val || (val.length >= 6 && /^[a-zA-Z0-9]+$/.test(val)),
        {
          message: 'Referrer ID must be at least 6 characters and alphanumeric',
        }
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const Signup = () => {
  const navigate = useNavigate();
  const [showReferrerID, setShowReferrerID] = useState(false);
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      refferalId: '',
    },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: sendOtp,
    onSuccess: () => {
      toast.success('OTP sent successfully!');
      navigate('/otp', { state: { email, mode: 'signup' } });
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong');
    },
  });

  const handleCheckboxChange = () => {
    setShowReferrerID(!showReferrerID);
  };

  const onSubmit = (data) => {
    setEmail(data.email);
    const formData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      refferalId: showReferrerID ? data.refferalId : '',
    };
    localStorage.setItem('signupData', JSON.stringify(formData));
    mutate(data.email);
  };

  const handleGoogleSignup = (e) => {
    e.preventDefault();
    window.open('http://localhost:5000/userapi/user/google', '_self');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white shadow-lg rounded-lg flex flex-col sm:flex-row w-full max-w-4xl">
        <div className="w-full sm:w-1/2 p-6 sm:p-8">
          <div className="flex items-center justify-center sm:justify-start mb-6">
            <img
              src={logo}
              alt="Logo"
              className="h-24 w-24 sm:h-40 sm:w-40 object-contain"
            />
            <h1 className="text-xl sm:text-2xl font-bold ml-0 sm:ml-7">SignUp</h1>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center mb-4">
              {error.response?.data?.message || 'An error occurred'}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <Input
                type="text"
                placeholder="Enter your first name"
                className="mt-1 w-full rounded-md border-gray-300"
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="referrerIDCheckbox"
                checked={showReferrerID}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label
                htmlFor="referrerIDCheckbox"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Add Referrer ID (Optional)
              </label>
            </div>

            {showReferrerID && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Referrer ID</label>
                <Input
                  type="text"
                  placeholder="Enter your referrer ID"
                  className="mt-1 w-full rounded-md border-gray-300"
                  {...register('refferalId')}
                />
                {errors.refferalId && (
                  <p className="mt-1 text-sm text-red-600">{errors.refferalId.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <Input
                type="text"
                placeholder="Enter your last name"
                className="mt-1 w-full rounded-md border-gray-300"
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                className="mt-1 w-full rounded-md border-gray-300"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Input
                type="password"
                placeholder="Create your password"
                className="mt-1 w-full rounded-md border-gray-300"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm your password"
                className="mt-1 w-full rounded-md border-gray-300"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className={`w-full bg-black text-white hover:bg-gray-800 ${
                isPending ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isPending ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={handleGoogleSignup}
              className="flex items-center justify-center w-full text-sm text-blue-600 hover:text-blue-500 mb-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                ></path>
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                ></path>
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                ></path>
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                ></path>
              </svg>
              <span className="ml-2">Sign up with Google</span>
            </button>
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login">
                <a className="text-blue-500 hover:underline">Log in</a>
              </Link>
            </p>
          </div>
        </div>

        <div className="w-full sm:w-1/2 hidden sm:block">
          <img
            src={watchImage}
            alt="Watch"
            className="h-full w-full object-cover rounded-b-lg sm:rounded-b-none sm:rounded-r-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;