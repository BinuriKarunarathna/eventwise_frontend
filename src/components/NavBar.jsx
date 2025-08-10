import { Link, useLocation } from 'react-router-dom';
import React from 'react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path, exact = false) => {
    return exact ? location.pathname === path : location.pathname.startsWith(path);
  };

  return (

    <div className="flex justify-between items-center px-6 py-0 bg-white shadow-sm gap-x-1 -my-4"> {/* Changed to flex justify-end */}
    <div className="hidden md:flex md:w-auto items-center  bg-white mr-2">
          <div className="flex flex-col items-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="150" fill="none" viewBox="0 0 24 24" stroke="purple" strokeWidth={1.5}>
              <rect x="3" y="5" width="18" height="16" rx="2" ry="2" stroke="purple" strokeWidth="1.5" fill="white"/>
              <line x1="3" y1="9" x2="21" y2="9" stroke="purple" strokeWidth="1.5"/>
              <line x1="7" y1="3" x2="7" y2="7" stroke="#f59e0b" strokeWidth="2" />
              <line x1="12" y1="3" x2="12" y2="7" stroke="#f59e0b" strokeWidth="2" />
              <line x1="17" y1="3" x2="17" y2="7" stroke="#f59e0b" strokeWidth="2" />
              <polyline points="9 13 11.5 15.5 15 12" stroke="#f59e0b" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>
      <div className="bg-white rounded-full shadow-md inline-flex " > {/* Changed to rounded-full and inline-flex */}
        <nav className="flex items-center h-12 px-4"> {/* Adjusted height and padding */}
          <div className="flex space-x-6"> {/* Adjusted spacing */}
            <Link
              to="/home"
              className={`text-2xl font-medium px-2 py-1 rounded-full ${
                isActive('/home', true)
                  ? 'text-indigo-600 bg-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Home
            </Link>

            <Link
              to="/dashboard"
              className={`text-2xl font-medium px-2 py-1 rounded-full ${
                isActive('/dashboard')
                  ? 'text-indigo-600 bg-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/create-event"
              className={`text-2xl font-medium px-2 py-1 rounded-full ${
                isActive('/create-event')
                  ? 'text-indigo-600 bg-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Create Event
            </Link>

            <Link
              to="/expenses"
              className={`text-2xl font-medium px-2 py-1 rounded-full ${
                isActive('/expenses')
                  ? 'text-indigo-600 bg-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Expenses
            </Link>

            {/* <Link
              to="/reports"
              className={`text-2xl font-medium px-2 py-1 rounded-full ${
                isActive('/reports')
                  ? 'text-indigo-600 bg-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Reports
            </Link> */}

            <Link
              to="/profile"
              className={`text-2xl font-medium px-2 py-1 rounded-full ${
                isActive('/profile')
                  ? 'text-indigo-600 bg-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Profile
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;