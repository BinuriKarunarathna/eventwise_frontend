import React ,{useState}from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/UserService';

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login with:', { email, password: '***' });
      
      const response = await loginUser({ email, password });
      console.log('Login response:', response);
      
      const userData = response.data;
      console.log('Full user data received:', userData);

      // Save user data to localStorage (no token)
      if (userData.user) {
        // If response has nested user object
        localStorage.setItem('user', JSON.stringify(userData.user));
        console.log('Stored user:', userData.user);
      } else {
        // If response is the user object directly
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Stored user directly:', userData);
      }

      alert("Login successful");
      navigate('/home'); 
    } catch (error) {
      console.error("Login failed:", error);
      console.error("Error response:", error.response);
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data || 'Unknown error';
        
        if (status === 401) {
          setError('Invalid email or password');
        } else if (status === 404) {
          setError('User not found');
        } else if (status === 400) {
          setError('Invalid request. Please check your input.');
        } else {
          setError(`Server error: ${message}`);
        }
      } else if (error.request) {
        // Network error
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col md:flex-row shadow-lg rounded-lg w-full max-w-5xl">
        
        {/* Left Side */}
        <div className="md:w-1/2 p-10">
          <h2 className="text-3xl font-bold mb-4">Login</h2>
          <p className="text-gray-600 mb-6">Login to access your EventWise account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLoginClick}>
            <div>
              <label className="block text-sm text-gray-700 text-left">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 text-left">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <button 
                type="button"
                className="text-red-500 text-sm hover:underline bg-transparent border-none cursor-pointer"
                onClick={() => alert('Forgot password functionality not implemented yet')}
              >
                Forgot Password
              </button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="text-sm text-center">
              Don't have an account? <a href="/signup" className="text-red-500 hover:underline">Sign up</a>
            </p>

            <div className="flex items-center justify-center space-x-4 mt-4">
              <button className="border p-2 rounded hover:bg-gray-100"><img src="https://img.icons8.com/color/48/facebook-new.png" alt="fb" className="h-5" /></button>
              <button className="border p-2 rounded hover:bg-gray-100"><img src="https://img.icons8.com/color/48/google-logo.png" alt="google" className="h-5" /></button>
              <button className="border p-2 rounded hover:bg-gray-100"><img src="https://img.icons8.com/ios-filled/50/mac-os.png" alt="apple" className="h-5" /></button>
            </div>
          </form>
        </div>

        {/* Right Side */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center bg-white">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-6xl font-bold mb-6">EventWise</h1>
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

export default LoginPage;
