import React, { useState, useEffect, useCallback } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { getAllEvents } from '../services/EventService';
import { 
  getAllExpenses, 
  createExpense, 
  updateExpense, 
  deleteExpense 
} from '../services/ExpenseService';
import { TrashIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';

const ExpenseManagement = () => {
  const [events, setEvents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [userId, setUserId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    amount: ''
  });

  const [errors, setErrors] = useState({});

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

  // Fetch events and expenses
  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch user events
      const eventsResponse = await getAllEvents(userId);
      const eventsData = eventsResponse.data?.data || eventsResponse.data || [];
      setEvents(eventsData);

      // If there's a selected event, fetch its expenses
      if (selectedEvent) {
        const expensesResponse = await getAllExpenses(selectedEvent);
        const expensesData = expensesResponse.data || [];
        setExpenses(Array.isArray(expensesData) ? expensesData : []);
      } else if (eventsData.length > 0) {
        // If no event selected but events exist, select the first one
        const firstEventId = eventsData[0].id;
        setSelectedEvent(firstEventId);
        const expensesResponse = await getAllExpenses(firstEventId);
        const expensesData = expensesResponse.data || [];
        setExpenses(Array.isArray(expensesData) ? expensesData : []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedEvent]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getTotalUserExpenses = useCallback(async () => {
    if (!userId || !events.length) {
      console.log("getTotalUserExpenses: No userId or events", { userId, eventsLength: events.length });
      return 0;
    }

    try {
      let totalSpent = 0;
      console.log("Calculating total for events:", events);
      
      // Fetch expenses for each event and sum them up
      for (const event of events) {
        console.log("Fetching expenses for event:", event.id);
        const expensesResponse = await getAllExpenses(event.id);
        const expensesData = expensesResponse.data || [];
        console.log("Expenses data for event", event.id, ":", expensesData);
        
        if (Array.isArray(expensesData)) {
          const eventTotal = expensesData.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
          console.log("Event", event.id, "total:", eventTotal);
          totalSpent += eventTotal;
        }
      }
      
      console.log("Final total spent:", totalSpent);
      return totalSpent;
    } catch (error) {
      console.error("Error calculating total user expenses:", error);
      return 0;
    }
  }, [userId, events]);

  // Fetch expenses when event changes
  const fetchExpenses = useCallback(async () => {
    if (!selectedEvent) return;
    
    try {
      console.log("Fetching expenses for event ID:", selectedEvent);
      const expensesResponse = await getAllExpenses(selectedEvent);
      console.log("Full expenses response:", expensesResponse);
      
      // Try different possible response structures
      let expensesData = expensesResponse.data || [];
      
      // Check if data is nested differently
      if (expensesResponse.data && expensesResponse.data.data) {
        expensesData = expensesResponse.data.data;
      }
      
      // Check if it's in a different structure
      if (expensesResponse.data && expensesResponse.data.expenses) {
        expensesData = expensesResponse.data.expenses;
      }
      
      console.log("Extracted expenses data:", expensesData);
      console.log("Is expenses data an array?", Array.isArray(expensesData));
      
      // Ensure we always set an array
      const finalExpenses = Array.isArray(expensesData) ? expensesData : [];
      console.log("Final expenses to set:", finalExpenses);
      setExpenses(finalExpenses);
      
      // Recalculate total after fetching expenses
      if (events.length > 0) {
        const total = await getTotalUserExpenses();
        setTotalUserSpent(total);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      console.error("Error details:", error.response?.data);
      // Set empty array on error
      setExpenses([]);
    }
  }, [selectedEvent, getTotalUserExpenses, events.length]);

  useEffect(() => {
    if (selectedEvent) {
      fetchExpenses();
    }
  }, [selectedEvent, fetchExpenses]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!selectedEvent) {
      newErrors.event = 'Please select an event';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const expenseData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        event_id: selectedEvent // Use event_id to match your database column
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseData);
      } else {
        await createExpense(expenseData);
      }

      // Reset form and refresh data
      resetForm();
      fetchExpenses();
      
      // Recalculate total user expenses
      const total = await getTotalUserExpenses();
      setTotalUserSpent(total);
    } catch (error) {
      console.error("Error saving expense:", error);
      setErrors({ submit: 'Failed to save expense. Please try again.' });
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      name: expense.name,
      amount: expense.amount.toString()
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (expenseId) => {
    try {
      await deleteExpense(expenseId);
      fetchExpenses();
      setDeleteConfirm(null);
      
      // Recalculate total user expenses
      const total = await getTotalUserExpenses();
      setTotalUserSpent(total);
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: ''
    });
    setEditingExpense(null);
    setIsFormOpen(false);
    setErrors({});
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTotalExpenses = () => {
    if (!Array.isArray(expenses)) {
      return 0;
    }
    return expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
  };

  const [totalUserSpent, setTotalUserSpent] = useState(0);

  // Calculate total user expenses when events change
  useEffect(() => {
    const calculateTotal = async () => {
      console.log("Calculating total user expenses...");
      const total = await getTotalUserExpenses();
      console.log("Setting total user spent to:", total);
      setTotalUserSpent(total);
    };
    
    if (events.length > 0) {
      console.log("Events available, calculating total:", events);
      calculateTotal();
    } else {
      console.log("No events available");
    }
  }, [events, getTotalUserExpenses]);

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
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Expenses...</h2>
            <p className="text-gray-500">Fetching your expense data</p>
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
                Expense Management
              </h1>
              <p className="text-gray-600 text-lg">Track and manage your event expenses</p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Expense
            </button>
          </div>
        </div>

        {/* Event Selector and Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Event Selector */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Event</h3>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose an event...</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
            {/* {selectedEvent && (
              <button 
                onClick={() => {
                  console.log("Manual fetch for event:", selectedEvent);
                  fetchExpenses();
                }}
                className="w-full mt-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-2 rounded"
              >
                Debug: Refresh Expenses
              </button>
            )} */}
          </div>

          {/* Total User Expenses */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Spent (All Events)</h3>
                <p className="text-3xl font-bold text-purple-600">{formatCurrency(totalUserSpent)}</p>
                <button 
                  onClick={async () => {
                    const total = await getTotalUserExpenses();
                    setTotalUserSpent(total);
                  }}
                  className="text-xs text-purple-600 hover:text-purple-800 mt-1"
                >
                  Refresh Total
                </button>
              </div>
              <div className="p-4 bg-purple-100 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Current Event Total Expenses */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Current Event Total</h3>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(getTotalExpenses())}</p>
              </div>
              <div className="p-4 bg-green-100 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Expense Count */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Current Event Items</h3>
                <p className="text-3xl font-bold text-blue-600">{Array.isArray(expenses) ? expenses.length : 0}</p>
              </div>
              <div className="p-4 bg-blue-100 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white shadow-2xl rounded-3xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Expense List</h2>
              </div>
              <p className="text-sm text-gray-600">
                {selectedEvent ? events.find(e => e.id.toString() === selectedEvent.toString())?.name : 'No event selected'}
              </p>
            </div>
          </div>

          {expenses && Array.isArray(expenses) && expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <p className="text-sm text-gray-500 p-4">Debug: Found {expenses.length} expenses</p>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => {
                    console.log("Rendering expense:", expense);
                    return (
                      <tr key={expense.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{expense.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{formatCurrency(expense.amount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(expense)}
                              className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50 transition-colors duration-150"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(expense.id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors duration-150"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-8 py-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No expenses found</h3>
              <p className="text-gray-500 text-lg mb-6">
                {selectedEvent ? 'Start adding expenses for this event' : 'Select an event to view expenses'}
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Debug: expenses = {JSON.stringify(expenses)}, selectedEvent = {selectedEvent}
              </p>
              {selectedEvent && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add First Expense
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expense Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {errors.submit}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter expense name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.amount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>

                {errors.event && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {errors.event}
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-150"
                  >
                    {editingExpense ? 'Update' : 'Create'} Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <TrashIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Expense
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this expense? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-150"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ExpenseManagement;
