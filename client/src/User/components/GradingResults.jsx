import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiFilter,
  FiFileText,
  FiDownload,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiEye,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import apiClient from "../../apiClient/ApiClient";
import { FaEye } from "react-icons/fa";

const GradingResult = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cropFilter, setCropFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [gradingHistory, setGradingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchGradingHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("User not authenticated.");
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get("/user/getGradingGistory", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: currentPage,
            status: statusFilter !== "all" ? statusFilter : undefined,
            cropType: cropFilter !== "all" ? cropFilter : undefined,
            search: searchTerm || undefined,
          },
        });

        setGradingHistory(response.data.data);
        // setTotalPages(response.data.totalPages);
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch grading history"
        );
        toast.error(
          err.response?.data?.message || "Failed to fetch grading history"
        );
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchGradingHistory();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter, cropFilter, currentPage]);

  const filteredReports = gradingHistory.filter((report) => {
    const matchesSearch =
      report.cropId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.farmerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    const matchesCrop = cropFilter === "all" || report.cropType === cropFilter;
    return matchesSearch && matchesStatus && matchesCrop;
  });

  const getStatusBadge = (status) => {
    const baseStyle =
      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    switch (status) {
      case "graded":
        return `${baseStyle} bg-green-100 text-green-800`;
      case "pending":
        return `${baseStyle} bg-yellow-100 text-yellow-800`;
      case "processing":
        return `${baseStyle} bg-red-100 text-red-800`;
      default:
        return `${baseStyle} bg-gray-100 text-gray-800`;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <FiAlertCircle className="text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <FiFileText className="mr-2" /> Grading History
      </h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search reports..."
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center">
            <FiFilter className="text-gray-400 mr-2" />
            <select
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="graded">Graded</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
            </select>
          </div>

          <select
            className="p-2 border border-gray-300 rounded-lg"
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
          >
            <option value="all">All Crops</option>
            <option value="wheat">Wheat</option>
            <option value="corn">Corn</option>
            <option value="soybeans">Soybeans</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <FiLoader className="animate-spin text-blue-500 text-2xl" />
          </div>
        ) : (
          <>
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
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
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
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {report.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.farmerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.cropType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.grade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FiClock className="mr-1" /> {report.date}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(report.status)}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FiEye className="inline-block mr-1" /> View
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
                        No grading reports found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * 10 + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * 10, filteredReports.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {filteredReports.length}
                      </span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">First</span>«
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>‹
                      </button>
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNum
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>›
                      </button>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Last</span>»
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Grading Report: {selectedReport.reportId}
              </h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiXCircle size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium text-gray-500 mb-1">Farmer Name</h3>
                <p>{selectedReport.farmerName}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500 mb-1">Crop Type</h3>
                <p>{selectedReport.cropType}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500 mb-1">Grade</h3>
                <p>{selectedReport.grade}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500 mb-1">Grading Date</h3>
                <p>{selectedReport.date}</p>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <h3 className="text-lg font-semibold mb-4">Quality Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Moisture Content</p>
                  <p className="text-xl font-semibold">
                    {selectedReport.qualityMetrics.moisture}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Foreign Material</p>
                  <p className="text-xl font-semibold">
                    {selectedReport.qualityMetrics.foreignMaterial}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Color Score</p>
                  <p className="text-xl font-semibold">
                    {selectedReport.qualityMetrics.colorScore}/10
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">
                Supporting Documents
              </h3>
              {selectedReport.files.length > 0 ? (
                <div className="space-y-2">
                  {selectedReport.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded"
                    >
                      <span className="text-sm truncate">
                        Report {index + 1}
                      </span>
                      <a
                        href={`http://localhost:3000/${file}`}
                        download
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <FaEye   className="mr-1" /> View
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  No supporting documents available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradingResult;
