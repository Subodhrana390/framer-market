import React, { useState, useEffect } from "react";
import {
  FiFilter,
  FiSearch,
  FiClock,
  FiCheck,
  FiX,
  FiFileText,
  FiCalendar,
} from "react-icons/fi";
import apiClient from "../../apiClient/ApiClient";
import { toast } from "react-toastify";

const GradingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const res = await apiClient.get("/crop", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const crops = res.data?.data?.crops || [];
        const mappedRequests = crops.map((crop) => ({
          id: crop._id,
          cropId: crop._id,
          farmerName: crop.submittedBy?.fullName || "Unknown Farmer",
          cropType: crop.cropType || "Unknown",
          quantity: crop.quantity ? `${crop.quantity} kg` : "N/A",
          submittedDate: crop.submittedDate
            ? new Date(crop.submittedDate).toLocaleDateString()
            : "N/A",
          dueDate: crop.dueDate
            ? new Date(crop.dueDate).toLocaleDateString()
            : "N/A",
          status: crop.status || "pending",
          location: crop.sampleCollection?.location || "N/A",
          harvestDate: crop.harvestDate
            ? new Date(crop.harvestDate).toLocaleDateString()
            : "N/A",
          sampleCollectionDate: crop.sampleCollection?.date
            ? new Date(crop.sampleCollection.date).toLocaleDateString()
            : "N/A",
          sampleCollectionTime: crop.sampleCollection?.timeSlot || "N/A",
          notes: crop.notes || "No notes",
          assignedGrader: crop.assignedGrader || null,
        }));
        setRequests(mappedRequests);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to fetch grading requests."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.cropId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.cropType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStartGrading = async (cropId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }

    try {
      const res = await apiClient.post(
        `/grader/${cropId}/start-grading`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedCrop = res.data?.data;
      setRequests(
        requests.map((req) =>
          req.id === cropId ? { ...req, status: updatedCrop.status } : req
        )
      );
      toast.success("Grading started successfully.");
      setSelectedRequest(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to start grading.");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    // Placeholder for marking as graded (needs API)
    setRequests(
      requests.map((request) =>
        request.id === id ? { ...request, status: newStatus } : request
      )
    );
    setSelectedRequest(null);
  };

  const [selectedRequest, setSelectedRequest] = useState(null);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Loading grading requests...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Grading Requests</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search requests..."
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search grading requests"
            />
          </div>
          <div className="flex items-center">
            <FiFilter className="text-gray-400 mr-2" />
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="graded">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crop ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farmer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crop Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.cropId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.farmerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.cropType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiCalendar className="mr-1" /> {request.submittedDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status === "graded"
                            ? "bg-green-100 text-green-800"
                            : request.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {request.status === "processing"
                          ? "Processing"
                          : request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {request.status === "pending" && (
                          <button
                            onClick={() => handleStartGrading(request.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Start Grading
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No grading requests found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Grading Request: {selectedRequest.cropId}
              </h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close details"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium text-gray-500 mb-1">Farmer Name</h3>
                <p>{selectedRequest.farmerName}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500 mb-1">Crop Type</h3>
                <p>{selectedRequest.cropType}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500 mb-1">Quantity</h3>
                <p>{selectedRequest.quantity}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500 mb-1">Location</h3>
                <p>{selectedRequest.location}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500 mb-1">
                  Submitted Date
                </h3>
                <p>{selectedRequest.submittedDate}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500 mb-1">Due Date</h3>
                <p>{selectedRequest.dueDate}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500 mb-1">Harvest Date</h3>
                <p>{selectedRequest.harvestDate}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500 mb-1">
                  Sample Collection Date
                </h3>
                <p>{selectedRequest.sampleCollectionDate}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500 mb-1">
                  Sample Collection Time
                </h3>
                <p>{selectedRequest.sampleCollectionTime}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500 mb-1">Notes</h3>
                <p>{selectedRequest.notes}</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-500 mb-2">Actions</h3>
              <div className="flex space-x-3">
                {selectedRequest.status === "pending" && (
                  <button
                    onClick={() => handleStartGrading(selectedRequest.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Start Grading
                  </button>
                )}
                {/* {selectedRequest.status === "processing" && (
                  <button
                    onClick={() =>
                      handleStatusChange(selectedRequest.id, "graded")
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Mark as Completed
                  </button>
                )} */}
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
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

export default GradingRequests;
