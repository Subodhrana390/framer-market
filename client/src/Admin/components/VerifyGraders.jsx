import React, { useEffect, useState } from "react";
import {
  FiUser,
  FiCheck,
  FiX,
  FiDownload,
  FiSearch,
  FiClock,
} from "react-icons/fi";
import apiClient from "../../apiClient/ApiClient";
import { toast } from "react-toastify";

const VerifyGraders = () => {
  const [graders, setGraders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [rejectionReason, setRejectionReason] = useState({ id: "", cert: "" });
  const [currentGrader, setCurrentGrader] = useState(null);
  const [isViewingDocs, setIsViewingDocs] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGraders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Admin not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const res = await apiClient.get("/grader/all-grader-profiles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const graderData = res.data?.data || [];
        setGraders(graderData);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to fetch grader profiles."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGraders();
  }, []);

  console.log(graders);
  const filteredGraders = graders.filter((grader) => {
    const matchesSearch =
      grader?.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grader?.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" ||
      grader.idStatus === selectedStatus ||
      grader.certStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleVerify = async (
    graderId,
    idStatus,
    certStatus,
    rejectionReason
  ) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Admin not authenticated.");
      return;
    }

    try {
      const res = await apiClient.post(
        `/grader/${graderId}/verify`,
        { idStatus, certStatus, rejectionReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedProfile = res.data.data.graderProfile;
      setGraders(
        graders.map((grader) =>
          grader.id === graderId ? { ...grader, ...updatedProfile } : grader
        )
      );
      toast.success("Grader documents verification updated successfully.");
      setCurrentGrader(null);
      setRejectionReason({ id: "", cert: "" });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update grader verification."
      );
    }
  };

  const handleApprove = (graderId) => {
    handleVerify(graderId, "approved", "approved", { id: "", cert: "" });
  };

  const handleReject = (graderId) => {
    if (!rejectionReason.id && !rejectionReason.cert) {
      toast.error("Please provide at least one rejection reason.");
      return;
    }
    const idStatus = rejectionReason.id ? "rejected" : "approved";
    const certStatus = rejectionReason.cert ? "rejected" : "approved";
    handleVerify(graderId, idStatus, certStatus, rejectionReason);
  };

  const viewDocuments = (grader) => {
    setCurrentGrader(grader);
    setIsViewingDocs(true);
  };

  console.log(currentGrader);
  const downloadDocument = async (filename, graderId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Admin not authenticated.");
      return;
    }

    try {
      const res = await apiClient.get(
        `/grader/${graderId}/document/${filename}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Downloaded ${filename}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || `Failed to download ${filename}`
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Loading grader profiles...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className=" talontext-2xl font-bold mb-6">
        Verify Grader Applications
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
              placeholder="Search graders..."
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search graders by name or email"
            />
          </div>
          <select
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter graders by status"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Graders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grader
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cert Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGraders.length > 0 ? (
                filteredGraders.map((grader) => (
                  <tr key={grader.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <FiUser className="text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {grader?.user?.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {grader?.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          grader.idStatus === "approved"
                            ? "bg-green-100 text-green-800"
                            : grader.idStatus === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {grader.idStatus.charAt(0).toUpperCase() +
                          grader.idStatus.slice(1)}
                      </span>
                      {grader.rejectionReason?.id && (
                        <div className="text-xs text-gray-500 mt-1">
                          {grader.rejectionReason.id}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          grader.certStatus === "approved"
                            ? "bg-green-100 text-green-800"
                            : grader.certStatus === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {grader.certStatus.charAt(0).toUpperCase() +
                          grader.certStatus.slice(1)}
                      </span>
                      {grader.rejectionReason?.cert && (
                        <div className="text-xs text-gray-500 mt-1">
                          {grader.rejectionReason.cert}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiClock className="mr-1" /> {grader.submittedDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => viewDocuments(grader)}
                        className="text-blue-600 hover:text-blue-900"
                        aria-label={`View documents for ${grader.name}`}
                      >
                        View Documents
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {(grader.idStatus === "pending" ||
                        grader.certStatus === "pending") && (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleApprove(grader._id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                            title="Approve All"
                            aria-label={`Approve all documents for ${grader.name}`}
                          >
                            <FiCheck size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setCurrentGrader(grader);
                              setRejectionReason({
                                id: grader.rejectionReason?.id || "",
                                cert: grader.rejectionReason?.cert || "",
                              });
                            }}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                            title="Reject"
                            aria-label={`Reject documents for ${grader.name}`}
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No grader applications found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal */}
      {currentGrader &&
        (currentGrader.idStatus === "pending" ||
          currentGrader.certStatus === "pending") && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">
                Reject Grader Application
              </h2>
              <p className="mb-4">
                Specify rejection reasons for {currentGrader.name}'s documents:
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  ID Document Rejection Reason
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  rows="2"
                  placeholder="Reason for rejecting ID (optional)"
                  value={rejectionReason.id}
                  onChange={(e) =>
                    setRejectionReason({
                      ...rejectionReason,
                      id: e.target.value,
                    })
                  }
                  aria-label="ID rejection reason"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Certification Document Rejection Reason
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  rows="2"
                  placeholder="Reason for rejecting certification (optional)"
                  value={rejectionReason.cert}
                  onChange={(e) =>
                    setRejectionReason({
                      ...rejectionReason,
                      cert: e.target.value,
                    })
                  }
                  aria-label="Certification rejection reason"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setCurrentGrader(null);
                    setRejectionReason({ id: "", cert: "" });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(currentGrader._id)}
                  disabled={!rejectionReason.id && !rejectionReason.cert}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    !rejectionReason.id && !rejectionReason.cert
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Document Viewer Modal */}
      {isViewingDocs && currentGrader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Documents for {currentGrader.user.fullName}
              </h2>
              <button
                onClick={() => setIsViewingDocs(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close document viewer"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">ID Document</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {currentGrader.name}
                  </span>
                  <button
                    onClick={() =>
                      downloadDocument(currentGrader.govtId, currentGrader.id)
                    }
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                    aria-label={`Download ID document for ${currentGrader.name}`}
                  >
                    <FiDownload className="mr-1" /> Download
                  </button>
                </div>
                <div className="mt-4 bg-gray-100 h-64 flex items-center justify-center">
                  <embed
                    src={`http://localhost:3000/${currentGrader.govtId}`}
                    n
                    type="application/pdf"
                    className="w-full h-full"
                  />
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Certification Document</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {currentGrader.name}
                  </span>
                  <button
                    onClick={() =>
                      downloadDocument(
                        currentGrader.gradingCertification,
                        currentGrader.id
                      )
                    }
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                    aria-label={`Download certification document for ${currentGrader.name}`}
                  >
                    <FiDownload className="mr-1" /> Download
                  </button>
                </div>
                <div className="mt-4 bg-gray-100 h-64 flex items-center justify-center">
                  <embed
                    src={`http://localhost:3000/${currentGrader.gradingCertification}`}
                    type="application/pdf"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyGraders;
