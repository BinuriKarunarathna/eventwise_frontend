import React, { useState,useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import axios from 'axios';

const Profile = () => {
  const [formData, setFormData] = useState({
    // From User table
    email: '',
    password: '',
    fullName: '',
    // From Profile table
    phone: '',
    address: '',
    city: '',
    country: '',
    bio: '',
    dateOfBirth: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get actual logged-in user ID from localStorage
    let userId = null;
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        userId = parsedUser?.id || parsedUser?.userId || parsedUser?.user_id;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }

    if (!userId) {
      setError("No user logged in. Please log in first.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    // First fetch user data (this should always exist)
    axios.get(`http://localhost:3001/api/users/${userId}`)
      .then(userResponse => {
        const userData = userResponse.data;
        
        // Set user data first
        setFormData(prev => ({
          ...prev,
          // From User table
          email: userData.email || '',
          password: '', // Never populate password field for security
          fullName: userData.fullName || userData.full_name || ''
        }));

        // Now try to fetch profile data
        return axios.get(`http://localhost:3001/api/profiles/${userId}`);
      })
      .then(profileResponse => {
        // Profile exists - populate the profile fields
        const profileData = profileResponse.data;
        
        setFormData(prev => ({
          ...prev,
          // From Profile table
          phone: profileData.phone || '',
          address: profileData.address || '',
          city: profileData.city || '',
          country: profileData.country || '',
          bio: profileData.bio || '',
          dateOfBirth: profileData.dateOfBirth || profileData.date_of_birth || ''
        }));
        setLoading(false);
      })
      .catch(error => {
        if (error.response?.status === 404) {
          // Profile doesn't exist yet - leave profile fields blank
          console.log("No profile found for user, leaving profile fields blank");
          setFormData(prev => ({
            ...prev,
            // Keep profile fields blank for user to fill
            phone: '',
            address: '',
            city: '',
            country: '',
            bio: '',
            dateOfBirth: ''
          }));
        } else {
          console.error("Failed to load profile data:", error);
          setError("Failed to load profile data. Please try again.");
        }
        setLoading(false);
      })
      .catch(userError => {
        console.error("Failed to load user data:", userError);
        if (userError.response?.status === 404) {
          setError("User not found");
        } else {
          setError("Failed to load user data. Please try again.");
        }
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get actual logged-in user ID from localStorage
    let userId = null;
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        userId = parsedUser?.id || parsedUser?.userId || parsedUser?.user_id;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }

    if (!userId) {
      setError("No user logged in. Please log in first.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare user data for update (email, password, and fullName)
      const userData = {
        email: formData.email,
        fullName: formData.fullName
      };
      
      // Only include password if user entered a new one
      if (formData.password.trim() !== '') {
        userData.password = formData.password;
      }

      // Prepare profile data for update
      const profileData = {
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        bio: formData.bio,
        dateOfBirth: formData.dateOfBirth
      };

      // Update user table
      const userUpdatePromise = axios.put(`http://localhost:3001/api/users/${userId}`, userData);
      
      // Update/Create profile table (this will create if doesn't exist)
      const profileUpdatePromise = axios.put(`http://localhost:3001/api/profiles/${userId}`, profileData);

      await Promise.all([userUpdatePromise, profileUpdatePromise]);
      
      console.log("Profile updated successfully");
      
      // Show success message
      setError('');
      alert("Profile updated successfully!");
      
      // Clear password field after successful update
      setFormData(prev => ({
        ...prev,
        password: ''
      }));
      
    } catch (error) {
      console.error("Error updating profile:", error);
      
      if (error.response?.status === 400) {
        setError("Invalid data provided. Please check your inputs.");
      } else if (error.response?.status === 404) {
        setError("User not found.");
      } else {
        setError("Failed to update profile. Please try again.");
      }
      
      alert("Failed to update profile. Check the error message above.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <NavBar />
      {/* Main Content */}
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-8">User Profile</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Loading profile...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* User Information Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">
                Account Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new password (leave blank to keep current)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank to keep your current password</p>
                </div>
              </div>
            </div>

            {/* Profile Information Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">
                Profile Information
                <span className="text-sm font-normal text-gray-500 ml-2">(Optional - Fill to complete your profile)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Street address"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City"
                  />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Country"
                  />
                </div>
              </div>

              {/* Bio Section - Full Width */}
              <div className="mt-6">
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
                    window.location.reload();
                  }
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default Profile;