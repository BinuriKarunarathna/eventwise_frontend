// import React, { useState,useEffect } from 'react';
// import NavBar from '../components/NavBar';
// import Footer from '../components/Footer';
// import axios from 'axios';

// const ReportDashboard = () => {
//   const [dateRange, setDateRange] = useState('DD/MM/YYYY');
//   const [eventType, setEventType] = useState('All Events');
//   const [status, setStatus] = useState('All Status');
//   const [activeTab, setActiveTab] = useState('Budget Summary');
//   const [budgetData, setBudgetData] = useState([]);
//   const [expenseData, setExpenseData] = useState([]);
//   const [eventComparisonData, setEventComparisonData] = useState([]);
//   const [forecastData, setForecastData] = useState([]);


  


//   const renderChart = () => {
//     switch (activeTab) {
//       case 'Budget Summary':
//         const maxBudget = Math.max(...budgetData.map(d => Math.max(d.allocated, d.used)));
//         return (
//           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 md:col-span-2">
//             <h3 className="text-lg font-medium mb-4">Budget Summary</h3>
//             <div className="h-64 bg-gray-50 rounded p-4 flex items-end justify-between">
//               {budgetData.map((item, i) => (
//                 <div key={i} className="flex flex-col items-center w-10 h-full">
//                   <div 
//                     className="w-full bg-blue-200 mb-1"
//                     style={{ height: `${(item.allocated / maxBudget) * 100}%` }}
//                     title={`Allocated: $${item.allocated.toLocaleString()}`}
//                   />
//                   <div 
//                     className="w-full bg-blue-500"
//                     style={{ height: `${(item.used / maxBudget) * 100}%` }}
//                     title={`Used: $${item.used.toLocaleString()}`}
//                   />
//                   <span className="text-xs mt-1">{item.month}</span>
//                 </div>
//               ))}
//             </div>
//             <div className="flex justify-center space-x-4 mt-2">
//               <div className="flex items-center">
//                 <div className="w-3 h-3 bg-blue-200 mr-1"></div>
//                 <span className="text-xs">Allocated</span>
//               </div>
//               <div className="flex items-center">
//                 <div className="w-3 h-3 bg-blue-500 mr-1"></div>
//                 <span className="text-xs">Used</span>
//               </div>
//             </div>
//           </div>
//         );

//       case 'Expense Analysis':
//         const maxExpense = Math.max(...expenseData.map(d => d.amount));
//         return (
//           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 md:col-span-2">
//             <h3 className="text-lg font-medium mb-4">Expense Analysis</h3>
//             <div className="h-64 bg-gray-50 rounded p-4 flex items-end justify-between">
//               {expenseData.map((item, i) => (
//                 <div key={i} className="flex flex-col items-center w-10 h-full">
//                   <div 
//                     className="w-full bg-green-500"
//                     style={{ height: `${(item.amount / maxExpense) * 100}%` }}
//                     title={`${item.category}: $${item.amount.toLocaleString()}`}
//                   />
//                   <span className="text-xs mt-1 text-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
//                     {item.category}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         );

//       case 'Event Comparison':
//         const maxComparison = Math.max(...eventComparisonData.map(d => Math.max(d.budget, d.actual)));
//         return (
//           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 md:col-span-2">
//             <h3 className="text-lg font-medium mb-4">Event Comparison</h3>
//             <div className="h-64 bg-gray-50 rounded p-4 flex relative border-l border-b border-gray-300 pt-4">
//               {eventComparisonData.map((item, i) => {
//                 const spacing = 100 / (eventComparisonData.length + 1);
//                 const left = `${(i + 1) * spacing}%`;
//                 return (
//                   <div key={i} className="absolute bottom-0" style={{ left, transform: 'translateX(-50%)' }}>
//                     <div 
//                       className="w-6 bg-blue-200 mx-auto mb-1"
//                       style={{ height: `${(item.budget / maxComparison) * 100}%` }}
//                       title={`Budget: $${item.budget.toLocaleString()}`}
//                     />
//                     <div 
//                       className="w-6 bg-blue-500 mx-auto"
//                       style={{ height: `${(item.actual / maxComparison) * 100}%` }}
//                       title={`Actual: $${item.actual.toLocaleString()}`}
//                     />
//                     <span className="text-xs whitespace-nowrap">{item.event}</span>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         );

//       case 'Forecast':
//         const maxForecast = Math.max(...forecastData.map(d => Math.max(d.forecast, d.actual || 0)));
//         return (
//           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 md:col-span-2">
//             <h3 className="text-lg font-medium mb-4">Forecast</h3>
//             <div className="h-64 bg-gray-50 rounded p-4 flex relative border-l border-b border-gray-300 pt-4">
//               {forecastData.map((item, i) => {
//                 const spacing = 100 / (forecastData.length + 1);
//                 const left = `${(i + 1) * spacing}%`;
//                 return (
//                   <div key={i} className="absolute bottom-0" style={{ left, transform: 'translateX(-50%)' }}>
//                     <div 
//                       className="w-6 bg-purple-200 mx-auto mb-1"
//                       style={{ height: `${(item.forecast / maxForecast) * 100}%` }}
//                       title={`Forecast: $${item.forecast.toLocaleString()}`}
//                     />
//                     {item.actual !== null && (
//                       <div 
//                         className="w-6 bg-purple-500 mx-auto"
//                         style={{ height: `${(item.actual / maxForecast) * 100}%` }}
//                         title={`Actual: $${item.actual.toLocaleString()}`}
//                       />
//                     )}
//                     <span className="text-xs whitespace-nowrap">{item.quarter}</span>
//                   </div>
//                 );
//               })}
//             </div>
//             <div className="flex justify-center space-x-4 mt-2">
//               <div className="flex items-center">
//                 <div className="w-3 h-3 bg-purple-200 mr-1"></div>
//                 <span className="text-xs">Forecast</span>
//               </div>
//               <div className="flex items-center">
//                 <div className="w-3 h-3 bg-purple-500 mr-1"></div>
//                 <span className="text-xs">Actual</span>
//               </div>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };
//   const [spendingData, setSpendingData] = useState([]);
//   useEffect(() => {
//   const userId = localStorage.getItem("userId") || 1; // default 1 for testing

//   axios.get(`http://localhost:8080/api/reports/budget-summary/${userId}`)
//     .then(res => setBudgetData(res.data))
//     .catch(err => console.error("Budget summary error", err));

//   axios.get(`http://localhost:8080/api/reports/expense-analysis/${userId}`)
//     .then(res => setExpenseData(res.data))
//     .catch(err => console.error("Expense analysis error", err));

//   axios.get(`http://localhost:8080/api/reports/event-comparison/${userId}`)
//     .then(res => setEventComparisonData(res.data))
//     .catch(err => console.error("Event comparison error", err));

//   axios.get(`http://localhost:8080/api/reports/forecast/${userId}`)
//     .then(res => setForecastData(res.data))
//     .catch(err => console.error("Forecast error", err));
// }, []);
  
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <NavBar />

//       <div className="container mx-auto p-6">
//         {/* Filters Section */}
//         <div className="flex flex-wrap gap-20 mb-8">
//           <div className="flex flex-col">
//             <label className="text-sm font-medium mb-1">Date Range</label>
//             <input
//               type="text"
//               value={dateRange}
//               onChange={(e) => setDateRange(e.target.value)}
//               className="p-2 border border-gray-300 rounded-md w-48"
//             />
//           </div>

//           <div className="flex flex-col">
//             <label className="text-sm font-medium mb-1">Event Type</label>
//             <select
//               value={eventType}
//               onChange={(e) => setEventType(e.target.value)}
//               className="p-2 border border-gray-300 rounded-md w-48"
//             >
//               <option>All Events</option>
//               <option>Wedding</option>
//               <option>Conference</option>
//               <option>Party</option>
//             </select>
//           </div>

//           <div className="flex flex-col">
//             <label className="text-sm font-medium mb-1">Budget Range</label>
//             <input
//               type="text"
//               placeholder="Min - Max"
//               className="p-2 border border-gray-300 rounded-md w-48"
//             />
//           </div>

//           <div className="flex flex-col">
//             <label className="text-sm font-medium mb-1">Status</label>
//             <select
//               value={status}
//               onChange={(e) => setStatus(e.target.value)}
//               className="p-2 border border-gray-300 rounded-md w-48"
//             >
//               <option>All Status</option>
//               <option>Completed</option>
//               <option>Pending</option>
//               <option>Cancelled</option>
//             </select>
//           </div>
//         </div>

//         {/* Report Tabs */}
//         <div className="flex space-x-4 mb-8">
//           {['Budget Summary', 'Expense Analysis', 'Event Comparison', 'Forecast'].map(tab => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 py-2 rounded-md ${
//                 activeTab === tab
//                   ? 'bg-blue-500 text-white'
//                   : 'bg-gray-100 hover:bg-gray-200'
//               }`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         {/* Charts Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {renderChart()}
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// };

// export default ReportDashboard;


import React, { useState, useEffect, useCallback } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { getAllEvents } from '../services/EventService';
import { getAllExpenses } from '../services/ExpenseService';
import {
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316", "#84CC16"];

const ReportDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [reportData, setReportData] = useState({
    totalEvents: 0,
    totalBudget: 0,
    totalSpent: 0,
    avgBudgetPerEvent: 0,
    budgetUtilization: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    monthlyTrends: [],
    categoryBreakdown: [],
    eventComparison: [],
    budgetVsActual: []
  });

  // Initialize user data
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        const extractedUserId = parsedUser?.id || parsedUser?.userId || parsedUser?.user_id;
        setUserId(extractedUserId);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      setLoading(false);
    }
  }, []);

  const fetchReportData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch events
      const eventsResponse = await getAllEvents(userId);
      const eventsData = eventsResponse.data?.data || eventsResponse.data || [];
      
      // Fetch expenses for all events
      const allExpensesData = [];
      for (const event of eventsData) {
        try {
          const expensesResponse = await getAllExpenses(event.id);
          const eventExpenses = expensesResponse.data || [];
          allExpensesData.push(...eventExpenses.map(expense => ({
            ...expense,
            eventId: event.id,
            eventName: event.name
          })));
        } catch (expenseError) {
          console.log(`No expenses found for event ${event.id}`);
        }
      }
      
      // Process data for reports
      processReportData(eventsData, allExpensesData);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const processReportData = (eventsData, expensesData) => {
    const totalBudget = eventsData.reduce((sum, event) => sum + parseFloat(event.total_budget || 0), 0);
    const totalSpent = expensesData.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    const currentDate = new Date();
    
    const upcomingEvents = eventsData.filter(event => new Date(event.start_date) > currentDate).length;
    const completedEvents = eventsData.filter(event => new Date(event.end_date) < currentDate).length;
    
    // Monthly trends for the last 6 months
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      const monthEvents = eventsData.filter(event => {
        const eventDate = new Date(event.start_date);
        return eventDate.getMonth() === date.getMonth() && eventDate.getFullYear() === date.getFullYear();
      });
      
      const monthExpenses = expensesData.filter(expense => {
        const expenseDate = new Date(expense.created_at || expense.date);
        return expenseDate.getMonth() === date.getMonth() && expenseDate.getFullYear() === date.getFullYear();
      });
      
      monthlyTrends.push({
        month: monthName,
        events: monthEvents.length,
        budget: monthEvents.reduce((sum, event) => sum + parseFloat(event.total_budget || 0), 0),
        spent: monthExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0)
      });
    }
    
    // Category breakdown
    const categoryBreakdown = {};
    expensesData.forEach(expense => {
      const category = expense.category || 'Other';
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = 0;
      }
      categoryBreakdown[category] += parseFloat(expense.amount || 0);
    });
    
    const categoryData = Object.entries(categoryBreakdown).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / totalSpent) * 100).toFixed(1)
    }));
    
    // Event comparison
    const eventComparison = eventsData.map(event => {
      const eventExpenses = expensesData
        .filter(expense => expense.eventId === event.id)
        .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
      
      return {
        name: event.name,
        budget: parseFloat(event.total_budget || 0),
        spent: eventExpenses,
        remaining: parseFloat(event.total_budget || 0) - eventExpenses
      };
    });

    setReportData({
      totalEvents: eventsData.length,
      totalBudget,
      totalSpent,
      avgBudgetPerEvent: eventsData.length > 0 ? totalBudget / eventsData.length : 0,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget * 100) : 0,
      upcomingEvents,
      completedEvents,
      monthlyTrends,
      categoryBreakdown: categoryData,
      eventComparison,
      budgetVsActual: monthlyTrends
    });
  };

  useEffect(() => {
    fetchReportData();
  }, [userId, fetchReportData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <svg className={`w-4 h-4 mr-1 ${trend > 0 ? 'rotate-0' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {Math.abs(trend)}% vs last month
            </div>
          )}
        </div>
        <div className={`p-4 rounded-full ${color.replace('text-', 'bg-').replace('600', '100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Budget vs Spending Overview */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Budget vs Spending Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.eventComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="budget" fill="#3B82F6" name="Budget" />
                  <Bar dataKey="spent" fill="#10B981" name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Expense Categories */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Expense Categories</h3>
              {reportData.categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.categoryBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({name, percentage}) => `${name}: ${percentage}%`}
                    >
                      {reportData.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>No expense data available</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'trends':
        return (
          <div className="grid grid-cols-1 gap-8">
            {/* Monthly Trends */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Trends</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={reportData.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="budget" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Budget" />
                  <Area type="monotone" dataKey="spent" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Spent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Events Trend */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Event Activity Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="events" stroke="#8B5CF6" strokeWidth={2} name="Events Created" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'breakdown':
        return (
          <div className="grid grid-cols-1 gap-8">
            {/* Detailed Event Breakdown */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Event Budget Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.eventComparison.map((event, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(event.budget)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(event.spent)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(event.remaining)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  (event.spent / event.budget * 100) > 90 ? 'bg-red-500' :
                                  (event.spent / event.budget * 100) > 75 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min((event.spent / event.budget * 100), 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{((event.spent / event.budget) * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'comparison':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Budget Performance */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Budget Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.eventComparison} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="budget" fill="#3B82F6" name="Budget" />
                  <Bar dataKey="spent" fill="#10B981" name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800 font-medium">Budget Efficiency</span>
                    <span className="text-blue-600 font-bold">{reportData.budgetUtilization.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(reportData.budgetUtilization, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800 font-medium">Event Success Rate</span>
                    <span className="text-green-600 font-bold">
                      {reportData.totalEvents > 0 ? ((reportData.completedEvents / reportData.totalEvents) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${reportData.totalEvents > 0 ? (reportData.completedEvents / reportData.totalEvents) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-800 font-medium">Average Event Size</span>
                    <span className="text-purple-600 font-bold">{formatCurrency(reportData.avgBudgetPerEvent)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Reports...</h2>
            <p className="text-gray-500">Analyzing your event data</p>
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Analytics & Reports
              </h1>
              <p className="text-gray-600 text-lg">Comprehensive insights into your event management</p>
            </div>
            <button
              onClick={fetchReportData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Events"
            value={reportData.totalEvents}
            subtitle={`${reportData.upcomingEvents} upcoming, ${reportData.completedEvents} completed`}
            color="text-blue-600"
            icon={<svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m0 0v4m0-4H8m0 4v10a2 2 0 002 2h4a2 2 0 002-2V11" /></svg>}
          />
          <StatCard
            title="Total Budget"
            value={formatCurrency(reportData.totalBudget)}
            subtitle={`Avg: ${formatCurrency(reportData.avgBudgetPerEvent)} per event`}
            color="text-green-600"
            icon={<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>}
          />
          <StatCard
            title="Total Spent"
            value={formatCurrency(reportData.totalSpent)}
            subtitle={`${reportData.budgetUtilization.toFixed(1)}% of budget used`}
            color="text-purple-600"
            icon={<svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V9a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2h8a2 2 0 002-2z" /></svg>}
          />
          <StatCard
            title="Remaining Budget"
            value={formatCurrency(reportData.totalBudget - reportData.totalSpent)}
            subtitle={`${(100 - reportData.budgetUtilization).toFixed(1)}% remaining`}
            color="text-orange-600"
            icon={<svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 overflow-x-auto">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'trends', name: 'Trends', icon: '📈' },
            { id: 'breakdown', name: 'Breakdown', icon: '🔍' },
            { id: 'comparison', name: 'Comparison', icon: '⚖️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* No Data State */}
        {reportData.totalEvents === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Event Data Found</h3>
            <p className="text-gray-500 text-lg mb-6">Create some events to see comprehensive analytics and reports</p>
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
      
      <Footer />
    </div>
  );
};

export default ReportDashboard;
