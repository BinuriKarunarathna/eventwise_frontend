import React, { useState, useEffect, useCallback } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { getAllEvents } from "../services/EventService";
import { getAllExpenses } from "../services/ExpenseService";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316", "#84CC16"];

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlySpendingData, setMonthlySpendingData] = useState([]);
  const [budgetAllocationData, setBudgetAllocationData] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalBudget: 0,
    totalSpent: 0,
    remaining: 0
  });

  // Initialize user data from localStorage on mount
  useEffect(() => {
    console.log("Initializing dashboard...");
    
    try {
  const userData = localStorage.getItem('user');
      
  console.log("Raw user data from localStorage:", userData);
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log("Parsed user:", parsedUser);
        
        // More flexible user ID extraction
        const extractedUserId = parsedUser?.id || parsedUser?.userId || parsedUser?.user_id;
        console.log("Extracted user ID:", extractedUserId);
        
        setUser(parsedUser);
        
        if (extractedUserId) {
          setUserId(extractedUserId);
        } else {
          console.warn("No user ID found in user data, but setting loading to false");
          setLoading(false);
        }
      } else {
        console.log("No user data found in localStorage");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      setLoading(false);
    }
  }, []);

  const processChartData = useCallback((eventsData, expensesData = []) => {
    console.log("Processing chart data...");
    console.log("Events data for processing:", eventsData);
    console.log("Expenses data for processing:", expensesData);
    
    // Calculate total budget from events
    const totalBudget = eventsData.reduce((sum, event) => {
      const budget = parseFloat(event.total_budget || 0);
      console.log(`Event: ${event.name}, Budget: ${budget}`);
      return sum + budget;
    }, 0);
    
    // Calculate total spent from actual expenses
    const totalSpent = expensesData.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    
    // Calculate remaining budget
    const remaining = totalBudget - totalSpent;

    console.log("Calculated stats:", { totalBudget, totalSpent, remaining });

    setDashboardStats({
      totalBudget,
      totalSpent,
      remaining
    });

    // Process Monthly Spending Data (last 6 months) using actual expenses
    const monthlyData = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      // Filter expenses by month
      const monthExpenses = expensesData.filter(expense => {
        const expenseDate = new Date(expense.created_at || expense.date);
        return expenseDate.getMonth() === date.getMonth() && expenseDate.getFullYear() === date.getFullYear();
      });
      
      const monthSpending = monthExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
      
      if (monthSpending > 0) {
        monthlyData.push({
          name: monthName,
          value: monthSpending
        });
      }
    }
    console.log("Monthly spending data:", monthlyData);
    setMonthlySpendingData(monthlyData);

    // Process Budget Allocation by Event
    const eventAllocation = eventsData.map((event, index) => ({
      name: event.name || `Event ${index + 1}`,
      value: parseFloat(event.total_budget || 0)
    })).filter(item => item.value > 0);

    console.log("Budget allocation data:", eventAllocation);
    setBudgetAllocationData(eventAllocation);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!userId) {
      console.log("No user ID found in fetchDashboardData, using default data");
      // Set default empty data instead of returning early
      setEvents([]);
      setAllExpenses([]);
      processChartData([], []);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching events for user:", userId);
      
      // Fetch events
      const eventsResponse = await getAllEvents(userId);
      console.log("Events response:", eventsResponse);
      console.log("Events response data:", eventsResponse.data);
      
      // The API returns {data: [...events]}, and axios extracts response.data
      // So we need response.data.data to get the actual events array
      const eventsData = eventsResponse.data?.data || eventsResponse.data || [];
      console.log("Processed events data:", eventsData);
      console.log("Number of events:", eventsData.length);
      setEvents(eventsData);
      
      // Fetch expenses for all events
      const allExpensesData = [];
      for (const event of eventsData) {
        try {
          console.log(`Fetching expenses for event ${event.id}:`, event.name);
          const expensesResponse = await getAllExpenses(event.id);
          const eventExpenses = expensesResponse.data || [];
          allExpensesData.push(...eventExpenses.map(expense => ({
            ...expense,
            eventId: event.id,
            eventName: event.name
          })));
        } catch (expenseError) {
          console.log(`No expenses found for event ${event.id}:`, expenseError.message);
        }
      }
      
      console.log("All expenses data:", allExpensesData);
      setAllExpenses(allExpensesData);
      processChartData(eventsData, allExpensesData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setEvents([]);
      setAllExpenses([]);
      processChartData([], []);
    } finally {
      setLoading(false);
    }
  }, [userId, processChartData]);

  // Fetch data when userId is available
  useEffect(() => {
    console.log("Data fetching useEffect triggered, userId:", userId);
    
    // Always call fetchDashboardData, let it handle the userId check
    fetchDashboardData();
  }, [userId, fetchDashboardData]);

  // Function to refresh dashboard data
  const refreshDashboard = () => {
    fetchDashboardData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const recentEvents = events.slice(0, 4).map(event => ({
    name: event.name || 'Unnamed Event',
    date: new Date(event.start_date).toLocaleDateString(),
    status: new Date(event.end_date) < new Date() ? 'Completed' : 
            new Date(event.start_date) > new Date() ? 'Upcoming' : 'In Progress'
  }));

  console.log("Dashboard component render - Current state:");
  console.log("User:", user);
  console.log("UserId:", userId);
  console.log("Loading:", loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 animate-ping opacity-75 mx-auto"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Dashboard...</h2>
            <p className="text-gray-500">Fetching your events and data</p>
          </div>
        </div>
      </div>
    );
  }

  // Check authentication after loading is complete
  if (!loading && (!user && !localStorage.getItem('user'))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Required</h2>
            <p className="text-gray-600 text-lg mb-6">Please log in to view your dashboard and manage events</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Event Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Manage your events and track your budget with style</p>
            </div>
            <button
              onClick={refreshDashboard}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
              disabled={loading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-white shadow-xl p-8 rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-2">Total Budget</h2>
                <p className="text-4xl font-bold text-blue-600">{formatCurrency(dashboardStats.totalBudget)}</p>
              </div>
              <div className="p-4 bg-blue-100 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-xl p-8 rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-2">Total Spent</h2>
                <p className="text-4xl font-bold text-green-600">{formatCurrency(dashboardStats.totalSpent)}</p>
              </div>
              <div className="p-4 bg-green-100 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-xl p-8 rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-2">Remaining</h2>
                <p className="text-4xl font-bold text-purple-600">{formatCurrency(dashboardStats.remaining)}</p>
              </div>
              <div className="p-4 bg-purple-100 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V9a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2h8a2 2 0 002-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Pie Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          {/* Monthly Spending Pie Chart */}
          <div className="bg-white shadow-2xl p-8 rounded-3xl border border-gray-100 hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Monthly Spending</h2>
            </div>
            {monthlySpendingData.length > 0 ? (
              <ResponsiveContainer width="100%" height={380}>
                <PieChart>
                  <Pie
                    data={monthlySpendingData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={130}
                    paddingAngle={3}
                    label={({name, value}) => `${name}: ${formatCurrency(value)}`}
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {monthlySpendingData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        style={{
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = '';
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)} 
                    contentStyle={{
                      backgroundColor: '#16a34a',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                    labelStyle={{
                      color: '#f3f4f6'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      paddingTop: '20px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-xl font-semibold text-gray-600 mb-2">No monthly data available</p>
                  <p className="text-gray-500">Create events to see spending distribution</p>
                </div>
              </div>
            )}
          </div>

          {/* Budget Allocation by Event Pie Chart */}
          <div className="bg-white shadow-2xl p-8 rounded-3xl border border-gray-100 hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Budget Allocation</h2>
            </div>
            {budgetAllocationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={380}>
                <PieChart>
                  <Pie
                    data={budgetAllocationData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={130}
                    paddingAngle={3}
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    animationBegin={200}
                    animationDuration={800}
                  >
                    {budgetAllocationData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        style={{
                          cursor: 'pointer'

                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = '';
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)} 
                    contentStyle={{
                      backgroundColor: '#16a34a',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                    labelStyle={{
                      color: '#f3f4f6'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      paddingTop: '20px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <p className="text-xl font-semibold text-gray-600 mb-2">No events found</p>
                  <p className="text-gray-500">Create your first event to see budget allocation</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Events Table */}
        <div className="bg-white shadow-2xl rounded-3xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m0 0v4m0-4H8m0 4v10a2 2 0 002 2h4a2 2 0 002-2V11" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Recent Events</h2>
            </div>
          </div>
          {recentEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Event</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentEvents.map((event, index) => (
                    <tr key={index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-semibold text-gray-900">{event.name}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-700 font-medium">{event.date}</td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${
                          event.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          event.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                          event.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            event.status === 'Completed' ? 'bg-green-400' :
                            event.status === 'Upcoming' ? 'bg-blue-400' :
                            event.status === 'In Progress' ? 'bg-yellow-400' :
                            'bg-gray-400'
                          }`}></div>
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-8 py-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m0 0v4m0-4H8m0 4v10a2 2 0 002 2h4a2 2 0 002-2V11" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No events yet</h3>
              <p className="text-gray-500 text-lg mb-6">Start planning your amazing events today</p>
              <button
                onClick={() => window.location.href = '/create-event'}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Event
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
