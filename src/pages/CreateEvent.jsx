import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { TrashIcon } from '@heroicons/react/24/outline'; // Import the trash icon
import { getAllEvents, createEvent, deleteEvent } from '../services/EventService';



const CreateEvent = () => {
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  
  // Initialize user data from localStorage
  useEffect(() => {
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
        setUserId(extractedUserId);
      } else {
        console.log("No user data found in localStorage");
        alert("Please log in to create events");
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      alert("Authentication error. Please log in again.");
    }
  }, []);

  // Fetch existing events to display as categories
  useEffect(() => {
    const fetchExistingEvents = async () => {
      if (!userId) {
        console.log("No user ID available, skipping event fetch. User state:", user, "userId:", userId);
        setCategories([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Attempting to fetch events for user:", userId);
        console.log("User object:", user);
        console.log("API endpoint will be: http://localhost:3001/api/events/user/" + userId);
        
        // Get events for the current user
        const response = await getAllEvents(userId);
        console.log("API Response:", response);
        console.log("Response type:", typeof response);
        console.log("Response data:", response?.data);
        
        // The API returns {data: [...events]}, and axios extracts response.data
        // So we need response.data.data to get the actual events array
        const events = response?.data?.data || response?.data || [];
        
        console.log("Processed events:", events);
        console.log("Number of events found:", events ? events.length : 0);
        console.log("Is events an array?", Array.isArray(events));
        
        if (!events || !Array.isArray(events) || events.length === 0) {
          console.log("No events found or invalid format - setting empty categories");
          setCategories([]);
          return;
        }
        
        // Group events by name and calculate total budget for each category
        const eventGroups = {};
        
        events.forEach(event => {
          const categoryName = event.name || event.event_name || 'Unnamed Event';
          
          if (eventGroups[categoryName]) {
            // If category exists, add to the budget and combine descriptions
            eventGroups[categoryName].totalBudget += parseFloat(event.total_budget || event.budget || 0);
            eventGroups[categoryName].descriptions.push(event.description || 'No description');
            eventGroups[categoryName].eventIds.push(event.id);
            eventGroups[categoryName].count += 1;
          } else {
            // Create new category group
            eventGroups[categoryName] = {
              categoryName: categoryName,
              totalBudget: parseFloat(event.total_budget || event.budget || 0),
              descriptions: [event.description || 'No description'],
              eventIds: [event.id],
              count: 1
            };
          }
        });
        
        // Transform grouped events into category format
        const eventCategories = Object.values(eventGroups).map(group => ({
          category: group.categoryName,
          amount: group.totalBudget,
          notes: group.count > 1 
            ? `${group.count} events: ${group.descriptions.join('; ')}`
            : group.descriptions[0],
          eventIds: group.eventIds, // Keep all event IDs in this category
          count: group.count
        }));
        
        setCategories(eventCategories);
        console.log("Loaded and grouped events as categories:", eventCategories);
      } catch (error) {
        console.error("Error fetching existing events:", error);
        console.log("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url
        });
        
        if (error.response?.status === 404) {
          console.log("❌ The endpoint GET /api/events/user/" + userId + " does not exist on your backend");
          console.log("You need to implement this endpoint in your backend to fetch user's events");
        }
        
        // Set empty categories if there's an error (like 404 if no events exist)
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingEvents();
  }, [userId]); // Only depend on userId to avoid endless loops
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!eventName || !startDate || !endDate || !budget || !userId) {
      alert("Please fill in all required fields (Event Name, Start Date, End Date, Budget)");
      return;
    }

    if (parseFloat(budget) <= 0) {
      alert("Budget must be greater than 0");
      return;
    }

    // Create the event with the correct structure for your database
    // Try multiple field naming conventions
    const eventData = {
      name: eventName,
      description: description || "", // Ensure description is not undefined
      location: location || "", // Ensure location is not undefined
      startDate,
      endDate,
      totalBudget: parseFloat(budget),
      userId: userId, // This should match your database field user_id
      user_id: userId, // Alternative naming convention
      budget: parseFloat(budget) // Alternative field name
    };

    console.log("Sending event data:", eventData);
    console.log("User from localStorage:", user);
    console.log("Start Date:", startDate, "End Date:", endDate);

    try {
      setLoading(true);
      // Create the event
      const eventResponse = await createEvent(eventData);
      console.log("Event created:", eventResponse.data);

      alert("Event created successfully!");
      
      // Reset form after successful creation
      setEventName("");
      setDescription("");
      setLocation("");
      setStartDate("");
      setEndDate("");
      setBudget("");
      
      // Refresh the categories list to include the new event
      try {
        const response = await getAllEvents(userId); // Get user's events
        console.log("Refresh API Response:", response);
        
        // The API returns {data: [...events]}, and axios extracts response.data
        const events = response?.data?.data || response?.data || [];
        console.log("Refresh events:", events);
        
        if (!events || !Array.isArray(events) || events.length === 0) {
          console.log("No events found during refresh");
          setCategories([]);
          return;
        }
        
        // Group events by name and calculate total budget for each category
        const eventGroups = {};
        
        events.forEach(event => {
          const categoryName = event.name || event.event_name || 'Unnamed Event';
          
          if (eventGroups[categoryName]) {
            eventGroups[categoryName].totalBudget += parseFloat(event.total_budget || event.budget || 0);
            eventGroups[categoryName].descriptions.push(event.description || 'No description');
            eventGroups[categoryName].eventIds.push(event.id);
            eventGroups[categoryName].count += 1;
          } else {
            eventGroups[categoryName] = {
              categoryName: categoryName,
              totalBudget: parseFloat(event.total_budget || event.budget || 0),
              descriptions: [event.description || 'No description'],
              eventIds: [event.id],
              count: 1
            };
          }
        });
        
        const eventCategories = Object.values(eventGroups).map(group => ({
          category: group.categoryName,
          amount: group.totalBudget,
          notes: group.count > 1 
            ? `${group.count} events: ${group.descriptions.join('; ')}`
            : group.descriptions[0],
          eventIds: group.eventIds,
          count: group.count
        }));
        
        setCategories(eventCategories);
        console.log("Refreshed categories after event creation:", eventCategories);
      } catch (refreshError) {
        console.error("Error refreshing categories:", refreshError);
        // Don't show error to user, just log it
      }
      
    } catch (error) {
      console.error("Error creating event:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: error.config
      });
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data || 'Unknown server error';
        
        console.log("Full error response:", JSON.stringify(error.response.data, null, 2));
        
        if (status === 400) {
          alert(`Bad Request: ${JSON.stringify(message)}. Please check your input data.`);
        } else if (status === 401) {
          alert(`Unauthorized: ${message}. Please log in again.`);
        } else if (status === 404) {
          alert(`Not Found: The API endpoint was not found. Please check if the backend is running.`);
        } else if (status === 500) {
          alert(`Server Error: ${message}. Please try again later.`);
        } else {
          alert(`Failed to create event (${status}): ${message}`);
        }
      } else if (error.request) {
        // Network error - no response received
        alert("Network Error: Cannot connect to the server. Please check if the backend is running on port 3001.");
      } else {
        // Request setup error
        alert(`Request Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  

  // Delete an event category (might involve multiple events with the same name)
  const handleDeleteCategory = async (indexToDelete) => {
    const categoryToDelete = categories[indexToDelete];
    
    console.log("Attempting to delete category:", categoryToDelete);
    console.log("Event IDs to delete:", categoryToDelete.eventIds);
    
    const confirmMessage = categoryToDelete.count > 1 
      ? `Are you sure you want to delete all ${categoryToDelete.count} "${categoryToDelete.category}" events?`
      : `Are you sure you want to delete "${categoryToDelete.category}" event?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        setLoading(true);
        
        // Delete all events in this category
        console.log("Starting delete operations...");
        const deletePromises = categoryToDelete.eventIds.map((eventId, index) => {
          console.log(`Deleting event ${index + 1}/${categoryToDelete.eventIds.length} with ID: ${eventId}`);
          return deleteEvent(eventId);
        });
        
        const results = await Promise.all(deletePromises);
        console.log("Delete results:", results);
        
        // Remove from local state
        setCategories(categories.filter((_, index) => index !== indexToDelete));
        
        const deletedCount = categoryToDelete.eventIds.length;
        alert(`${deletedCount} event(s) deleted successfully!`);
        
      } catch (error) {
        console.error("Error deleting events:", error);
        console.error("Delete error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url
        });
        
        if (error.response?.status === 404) {
          alert("Delete failed: The DELETE endpoint was not found. Please check if the backend has the DELETE /api/events/:id endpoint implemented.");
        } else {
          alert("Failed to delete event(s). Please check the console for details.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  
  // Remove handleAddCategory since categories are now auto-populated from existing events
  // Categories show existing events with their names, budgets, and descriptions
  

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Event Information */}
          <div className="lg:w-2/3">
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
              <p className="text-lg text-gray-600 mb-8">Set up your event budget and details</p>
        
              <h2 className="text-xl font-semibold mb-6">Event Information</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter event name"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate} // End date can't be before start date
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter location name"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter total budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter event description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>                  
              </div>
            </div>
          </div>

          {/* Right Column - All Events by Category */}
          <div className="lg:w-1/3">
            <div className="bg-white shadow rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-6">All Events by Category</h2>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading events...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No events found.</p>
                  <p className="text-sm">Create your first event above!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Budget</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categories.map((item, index) => (
                        <tr key={index} className={item.count > 1 ? 'bg-blue-50' : ''}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.category}
                            {item.count > 1 && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {item.count} events
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            ${item.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                            {item.notes}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <button
                              className="text-red-600 hover:text-red-900"
                              title={item.count > 1 ? `Delete all ${item.count} events` : "Delete Event"}
                              onClick={() => handleDeleteCategory(index)}
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* <div className="mt-6 grid grid-cols-1 gap-4">
                <input
                  type="text"
                  value={newCategory.category}
                  onChange={(e) => setNewCategory({...newCategory, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Category"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newCategory.amount}
                  onChange={(e) => setNewCategory({...newCategory, amount: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Amount"
                />
                <input
                  type="text"
                  value={newCategory.notes}
                  onChange={(e) => setNewCategory({...newCategory, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Notes"
                />
              </div> */}
              
              {/* <button
                onClick={handleAddCategory}
                className="mt-4 w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Category
              </button> */}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" onClick={() => {
                  if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
                    window.location.reload();
                  }
                }}
                disabled={loading}>
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;