import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const SignUpPage = () => {
    const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert('Passwords do not match!');
    return;
  }
  console.log('Form data:', formData);
  console.log('Submitting:', formData);

  try {
    const response = await fetch('http://localhost:3001/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      }),
    });

    console.log('Response status:', response.status);

    if (response.ok) {
      alert('Account created successfully!');
      navigate('/login');
    } else {
      const errorText = await response.text();
      console.error('Signup failed:', errorText);
      alert('Signup failed!');
    }
  } catch (err) {
    console.error('Network or server error:', err);
    alert('Error connecting to server.');
  }
};



  return (
    <div className="min-h-screen flex items-center justify-center bg-white ">
      <div className="flex flex-col md:flex-row shadow-lg rounded-lg w-full max-w-5xl">
        
        {/* Left Side - Form */}
        <div className="md:w-1/2 p-10">
          <h2 className="text-3xl font-bold mb-2">Sign up</h2>
          <p className="text-gray-600 mb-6">Let’s get you all set up so you can access your personal account.</p>

          <form className="space-y-4 "onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 text-left">Full Name</label>
                <input
                  type="text"
                  placeholder="John"
                  name='fullName'
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
             
              <div>
                <label className="block text-sm text-gray-700 text-left">Email</label>
                <input
                  type="email"
                  placeholder="john.doe@gmail.com"
                  name='email'
                   value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
            </div>

            <div>
              <label className="block text-sm text-gray-700 text-left">Password</label>
              <input
                type="password"
                name='password'
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 text-left">Confirm Password</label>
              <input
                type="password"
                name='confirmPassword'
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-start">
              <input type="checkbox" className="mt-1 mr-2" />
              <p className="text-sm text-left">
                I agree to all the <span className="text-red-500">Terms</span> and <span className="text-red-500">Privacy Policies</span>
              </p>
            </div>

            <button type="submit"  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Create account
            </button>

            <p className="text-sm text-center">
              Already have an account? <a href="#" className="text-red-500 hover:underline">Login</a>
            </p>

            <div className="flex items-center justify-center space-x-4 mt-4">
              <button className="border p-2 rounded hover:bg-gray-100"><img src="https://img.icons8.com/color/48/facebook-new.png" alt="fb" className="h-5" /></button>
              <button className="border p-2 rounded hover:bg-gray-100"><img src="https://img.icons8.com/color/48/google-logo.png" alt="google" className="h-5" /></button>
              <button className="border p-2 rounded hover:bg-gray-100"><img src="https://img.icons8.com/ios-filled/50/mac-os.png" alt="apple" className="h-5" /></button>
            </div>
          </form>
        </div>

        {/* Right Side - Branding */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center bg-white">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl font-bold mb-6">EventWise</h1>
            <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" fill="none" viewBox="0 0 24 24" stroke="purple" strokeWidth={1.5}>
              <rect x="3" y="5" width="18" height="16" rx="2" ry="2" stroke="purple" strokeWidth="1.5" fill="white"/>
              <line x1="3" y1="9" x2="21" y2="9" stroke="purple" strokeWidth="1.5"/>
              <line x1="7" y1="3" x2="7" y2="7" stroke="#f59e0b" strokeWidth="2" />
              <line x1="12" y1="3" x2="12" y2="7" stroke="#f59e0b" strokeWidth="2" />
              <line x1="17" y1="3" x2="17" y2="7" stroke="#f59e0b" strokeWidth="2" />
              <polyline points="9 13 11.5 15.5 15 12" stroke="#f59e0b" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
