import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from '../../apiClient/ApiClient';

const GraderAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('pending'); // 'pending', 'confirmed', 'all'

  useEffect(() => {
    fetchGraderAppointments();
  }, [filter]);

  const fetchGraderAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      let endpoint = '/appointment/getAllAppointments';

      const response = await apiClient.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setAppointments(response.data.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch appointments'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      await apiClient.patch(
        `/appointment/${appointmentId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success(`Appointment ${newStatus} successfully!`);
      fetchGraderAppointments();
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update appointment'
      );
    } finally {
      setActionLoading(false);
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

  const openDetailsModal = (appointment) => {
    setSelectedAppointment(appointment);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Appointments Management</h2>
                <p className="mt-2 text-gray-600">Review and confirm pending appointments</p>
              </div>
              <div className="flex space-x-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="all">All Appointments</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No {filter === 'all' ? '' : filter} appointments found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purpose
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.user?.fullName || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {appointment.user?.email || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(appointment.date)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.timeSlot}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {appointment.purpose}
                          </div>
                          {appointment.notes && (
                            <button 
                              onClick={() => openDetailsModal(appointment)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              View notes
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(appointment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {appointment.status === 'pending' && (
                            <div className="space-x-2">
                              <button
                                onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                                disabled={actionLoading}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                                disabled={actionLoading}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {appointment.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusChange(appointment._id, 'completed')}
                              disabled={actionLoading}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            >
                              Mark Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">Appointment Details</h3>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">User:</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedAppointment.user?.fullName || 'N/A'} ({selectedAppointment.user?.email || 'N/A'})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date & Time:</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(selectedAppointment.date)} at {selectedAppointment.timeSlot}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Purpose:</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedAppointment.purpose}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status:</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedAppointment.status)}
                  </div>
                </div>
                {selectedAppointment.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes:</p>
                    <p className="text-sm font-medium text-gray-900 mt-1 p-2 bg-gray-50 rounded">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraderAppointments;