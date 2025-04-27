import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from '../../apiClient/ApiClient';

const CreateAppointment = () => {
  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '',
    purpose: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [appointmentsData, setAppointmentsData] = useState({
    total: 0,
    page: 1,
    limit: 10,
    appointments: []
  });
  const [fetchingAppointments, setFetchingAppointments] = useState(false);

  const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 01:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM'
  ];

  useEffect(() => {
    fetchUserAppointments();
  }, []);

  const fetchUserAppointments = async () => {
    setFetchingAppointments(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      const response = await apiClient.get('/appointment/getAllAppointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setAppointmentsData(response.data.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch appointments'
      );
    } finally {
      setFetchingAppointments(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      await apiClient.post(
        '/appointment/create',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Appointment created successfully!');
      // Refresh the appointments list
      await fetchUserAppointments();
      // Reset form
      setFormData({
        date: '',
        timeSlot: '',
        purpose: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create appointment'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const cancelAppointment = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      await apiClient.delete(`/appointment/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      toast.success('Appointment cancelled successfully!');
      // Refresh the appointments list
      await fetchUserAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        'Failed to cancel appointment'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Schedule New Appointment</h2>
              <p className="mt-2 text-gray-600">Fill in the details to book your appointment</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700">
                  Time Slot
                </label>
                <select
                  id="timeSlot"
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a time slot</option>
                  {timeSlots.map((slot, index) => (
                    <option key={index} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                  Purpose
                </label>
                <input
                  type="text"
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Consultation, Check-up"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special requirements or notes"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Creating Appointment...' : 'Schedule Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* User's Appointments Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Appointments</h2>
              <p className="mt-2 text-gray-600">
                {appointmentsData === 0 ? 'No appointments found' : 
                 `Showing ${appointmentsData.appointments.length} of ${appointmentsData.total} appointments`}
              </p>
            </div>

            {fetchingAppointments ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : appointmentsData.appointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                You don't have any appointments scheduled yet.
              </div>
            ) : (
              <div className="space-y-4">
                {appointmentsData.appointments.map((appointment) => (
                  <div key={appointment._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{appointment.purpose}</h3>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(appointment.date)} • {appointment.timeSlot}
                        </p>
                        {appointment.notes && (
                          <p className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {appointment.notes}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-gray-400">
                          Created: {new Date(appointment.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {appointment.status === 'pending' && (
                        <button
                          onClick={() => cancelAppointment(appointment._id)}
                          className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAppointment;