import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-grow">
        <div className="flex flex-col md:flex-row shadow-lg rounded-lg w-full max-w-5xl mx-auto my-8">
          {/* Left Side - Content */}
          <div className="md:w-1/2 px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Plan Smart</span>
                <span className="block text-indigo-600">Spend Right</span>
              </h1>
              
              <div className="mt-8 max-w-2xl mx-auto md:mx-0 text-xl text-gray-500">
                <ul className="space-y-4 text-left">
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-2">Create Budgets for Events.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-2">Track transactions.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-2">Get spending insights.</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-10">
                <Link 
                  to="/dashboard" 
                  className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 inline-flex justify-center"
                  >
                  Get Started
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side - EventWise and Calendar Icon */}
          <div className="md:w-1/2 flex items-center justify-center bg-gray-50 p-8">
            <div className="flex flex-col items-center">
              <h1 className="text-6xl font-bold mb-6 text-black">EventWise</h1>
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

      <Footer />
    </div>
  );
};

export default HomePage;