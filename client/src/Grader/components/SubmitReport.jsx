import React, { useState, useEffect } from "react";
import {
  FiUpload,
  FiCheck,
  FiX,
  FiFileText,
  FiCrop,
  FiStar,
  FiCalendar,
  FiSearch,
} from "react-icons/fi";
import apiClient from "../../apiClient/ApiClient";
import { toast } from "react-toastify";

const SubmitReport = () => {
  const [formData, setFormData] = useState({
    cropId: "",
    qualityGrade: "",
    moistureContent: "",
    foreignMaterial: "",
    colorScore: 5,
    defects: "",
    additionalNotes: "",
    supportingDocs: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [cropSearch, setCropSearch] = useState("");
  const [showCropSuggestions, setShowCropSuggestions] = useState(false);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [gradingRequests, setGradingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const qualityGrades = [
    "Grade A - Premium",
    "Grade B - Standard",
    "Grade C - Commercial",
    "Grade D - Below Standard",
  ];

  // Fetch in-progress grading requests
  useEffect(() => {
    const fetchGradingRequests = async () => {
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
        const mappedRequests = crops
          .filter((crop) => crop.status === "processing")
          .map((crop) => ({
            id: crop._id,
            farmerName: crop.submittedBy?.fullName || "Unknown Farmer",
            cropType: crop.cropType || "Unknown",
            status: crop.status,
          }));
        setGradingRequests(mappedRequests);
      } catch (error) {
        console.log(error)
        toast.error(
          error?.response?.data?.message || "Failed to fetch grading requests."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGradingRequests();
  }, []);

  // Filter crops based on search input
  useEffect(() => {
    if (cropSearch.length > 0) {
      const filtered = gradingRequests.filter(
        (request) =>
          request.id.toLowerCase().includes(cropSearch.toLowerCase()) ||
          request.farmerName.toLowerCase().includes(cropSearch.toLowerCase()) ||
          request.cropType.toLowerCase().includes(cropSearch.toLowerCase())
      );
      setFilteredCrops(filtered);
      setShowCropSuggestions(true);
    } else {
      setFilteredCrops([]);
      setShowCropSuggestions(false);
    }
  }, [cropSearch, gradingRequests]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCropSelect = (request) => {
    setFormData((prev) => ({
      ...prev,
      cropId: request.id,
    }));
    setSelectedRequest(request);
    setCropSearch(request.id);
    setShowCropSuggestions(false);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...formData.supportingDocs, ...files].slice(0, 2)
    setFormData((prev) => ({
      ...prev,
      supportingDocs: newFiles,
    }));
  };

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      supportingDocs: prev.supportingDocs.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }

    if (formData.supportingDocs.length !== 2) {
      toast.error("Exactly two supporting documents are required.");
      return;
    }

    setIsSubmitting(true);

    const submissionData = new FormData();
    submissionData.append("cropId", formData.cropId);
    submissionData.append("qualityGrade", formData.qualityGrade);
    submissionData.append("moistureContent", formData.moistureContent);
    submissionData.append("foreignMaterial", formData.foreignMaterial);
    submissionData.append("colorScore", formData.colorScore);
    submissionData.append("defects", formData.defects || "");
    submissionData.append("additionalNotes", formData.additionalNotes || "");
    formData.supportingDocs.forEach((file) => {
      submissionData.append("supportingDocs", file);
    });

    try {
      const res = await apiClient.post("/grader/submit-report", submissionData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSubmissionSuccess(true);
      toast.success("Grading report submitted successfully.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to submit grading report."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Loading grading requests...</p>
      </div>
    );
  }

  if (submissionSuccess) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 inline-block">
          <FiCheck className="mx-auto text-green-500 text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Report Submitted Successfully!
          </h2>
          <p className="text-green-600 mb-4">
            Your grading report for <strong>{formData.cropId}</strong> has been
            submitted.
          </p>
          {selectedRequest && (
            <div className="bg-white p-4 rounded border border-gray-200 mb-4 text-left">
              <p>
                <strong>Farmer:</strong> {selectedRequest.farmerName}
              </p>
              <p>
                <strong>Crop Type:</strong> {selectedRequest.cropType}
              </p>
            </div>
          )}
          <button
            onClick={() => {
              setFormData({
                cropId: "",
                qualityGrade: "",
                moistureContent: "",
                foreignMaterial: "",
                colorScore: 5,
                defects: "",
                additionalNotes: "",
                supportingDocs: [],
              });
              setSelectedRequest(null);
              setSubmissionSuccess(false);
              setCropSearch("");
            }}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <FiFileText className="mr-2" /> Submit Grading Report
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Crop Information with Auto-complete */}
          <div className="md:col-span-2 border-b pb-4 mb-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FiCrop className="mr-2 text-green-600" /> Crop Information
            </h2>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crop ID *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 p-2 border border-gray-300 rounded"
                  value={cropSearch}
                  onChange={(e) => setCropSearch(e.target.value)}
                  placeholder="Search your assigned crops..."
                  required
                />
                <input type="hidden" name="cropId" value={formData.cropId} />
              </div>
              {showCropSuggestions && filteredCrops.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredCrops.map((request) => (
                    <div
                      key={request.id}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                      onClick={() => handleCropSelect(request)}
                    >
                      <div className="font-medium">{request.id}</div>
                      <div className="text-sm text-gray-600">
                        {request.cropType} • {request.farmerName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedRequest && (
              <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-1">
                  Selected Crop Details
                </h3>
                <p className="text-sm">
                  <span className="font-medium">Farmer:</span>{" "}
                  {selectedRequest.farmerName}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Crop Type:</span>{" "}
                  {selectedRequest.cropType}
                </p>
              </div>
            )}
          </div>

          {/* Quality Assessment */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FiStar className="mr-2 text-yellow-600" /> Quality Assessment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quality Grade *
                </label>
                <select
                  name="qualityGrade"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.qualityGrade}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select grade</option>
                  {qualityGrades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moisture Content (%) *
                </label>
                <input
                  type="number"
                  name="moistureContent"
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.moistureContent}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foreign Material (%) *
                </label>
                <input
                  type="number"
                  name="foreignMaterial"
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.foreignMaterial}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color Score (1-10) *
                </label>
                <input
                  type="range"
                  name="colorScore"
                  min="1"
                  max="10"
                  className="w-full"
                  value={formData.colorScore}
                  onChange={handleChange}
                  required
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 (Poor)</span>
                  <span>Current: {formData.colorScore}</span>
                  <span>10 (Excellent)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Defects Observed
                </label>
                <textarea
                  name="defects"
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.defects}
                  onChange={handleChange}
                  placeholder="Describe any defects found in the crop..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="additionalNotes"
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  placeholder="Any additional observations or comments..."
                />
              </div>
            </div>
          </div>

          {/* Supporting Documents */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FiUpload className="mr-2 text-blue-600" /> Supporting Documents
            </h2>
            <div className="border border-dashed border-gray-300 rounded-lg p-4">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <FiUpload className="text-3xl text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload or drag and drop (Exactly 2 required)
                </p>
                <p className="text-xs text-gray-500">PDF, JPG, or PNG (Max 5MB each)</p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  disabled={formData.supportingDocs.length >= 2}
                />
              </label>
              {formData.supportingDocs.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.supportingDocs.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="text-sm truncate max-w-xs">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !formData.cropId ||
              !formData.qualityGrade ||
              !formData.moistureContent ||
              !formData.foreignMaterial ||
              formData.supportingDocs.length !== 2
            }
            className={`px-6 py-3 rounded-lg text-white font-medium ${
              isSubmitting ||
              !formData.cropId ||
              !formData.qualityGrade ||
              !formData.moistureContent ||
              !formData.foreignMaterial ||
              formData.supportingDocs.length !== 2
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitReport;