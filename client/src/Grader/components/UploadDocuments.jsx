import React, { useEffect, useState } from "react";
import {
  FiUpload,
  FiFile,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiAward,
  FiAlertCircle,
} from "react-icons/fi";
import apiClient from "../../apiClient/ApiClient";
import { toast } from "react-toastify";

const UploadDocuments = () => {
  const [graderProfile, setGraderProfile] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [idFile, setIdFile] = useState(null);
  const [certFile, setCertFile] = useState(null);
  const [idStatus, setIdStatus] = useState("pending");
  const [certStatus, setCertStatus] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState({ id: "", cert: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchGraderProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("User not authenticated. Please log in.");
        return;
      }

      try {
        const res = await apiClient.get("/grader/profile", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const profile = res.data?.data?.graderProfile;
        if (!profile) throw new Error("Grader profile not found");

        setGraderProfile(profile);
        setIsSubmitted(profile.isSubmitted || false);
        setIdStatus(profile.idStatus || "pending"); 
        setCertStatus(profile.certStatus || "pending");
        setRejectionReason({
          id: profile.idRejectionReason || "",
          cert: profile.certRejectionReason || "",
        });
      } catch (error) {
        if (error.name === "AbortError") return;
        toast.error(error?.response?.data?.message || "Failed to fetch grader profile.");
      }
    };

    fetchGraderProfile();
    return () => controller.abort();
  }, []);

  const handleFileUpload = (e, setFile, setStatus) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Please upload a PDF, JPG, or PNG file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large (max 5MB).");
      return;
    }

    setFile(file);
    setStatus("uploaded");
  };

  const handleRemoveFile = (setFile, setStatus, inputName) => {
    setFile(null);
    setStatus("pending");
    const input = document.querySelector(`input[name="${inputName}"]`);
    if (input) input.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idFile || !certFile) {
      toast.error("Please upload both ID and Certification documents.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("govtId", idFile);
      formData.append("gradingCertification", certFile);

      await apiClient.post("/grader/submit-documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setIdStatus("pending");
      setCertStatus("pending");
      setIsSubmitted(true); // Mark as submitted after successful upload
      setIdFile(null); // Clear uploaded files
      setCertFile(null); // Clear uploaded files
      toast.success("Documents submitted! Status: Pending Verification.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit documents.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const DocumentUploadCard = ({ title, description, icon, status, onUpload, onRemove, file, rejectionMessage }) => (
    <div
      className={`border rounded-lg p-6 mb-6 ${
        status === "approved"
          ? "border-green-200 bg-green-50"
          : status === "rejected"
          ? "border-red-200 bg-red-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-start">
        <div
          className={`p-3 rounded-full mr-4 ${
            status === "approved"
              ? "bg-green-100 text-green-600"
              : status === "rejected"
              ? "bg-red-100 text-red-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          {status === "rejected" && rejectionMessage && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4" aria-live="polite">
              <div className="flex items-start">
                <FiAlertCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800">Rejection Reason:</p>
                  <p className="text-red-600">{rejectionMessage}</p>
                </div>
              </div>
            </div>
          )}
          {(status === "pending" || status === "rejected") && (
            <label
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
              htmlFor={`upload-${title.toLowerCase().replace(/\s/g, "-")}`}
            >
              <FiUpload className="mr-2" />
              {status === "rejected" ? "Re-upload Document" : "Upload Document"}
              <input
                id={`upload-${title.toLowerCase().replace(/\s/g, "-")}`}
                name={title.toLowerCase().replace(/\s/g, "-")}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={onUpload}
                aria-label={`Upload ${title}`}
              />
            </label>
          )}
          {status === "uploaded" && (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div className="flex items-center">
                <FiFile className="text-gray-500 mr-2" />
                <span className="text-sm">{file.name}</span>
              </div>
              <button onClick={onRemove} className="text-red-500 hover:text-red-700">
                <FiXCircle />
              </button>
            </div>
          )}
          {status === "approved" && (
            <div className="flex items-center text-green-600">
              <FiCheckCircle className="mr-2" />
              <span>Verified and approved</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Case 1: Documents are approved
  if (idStatus === "approved" && certStatus === "approved") {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-6">
          <FiCheckCircle className="mx-auto text-green-500 text-5xl mb-4" />
          <h1 className="text-2xl font-bold text-green-800 mb-2">Documents Verified</h1>
          <p className="text-green-600">
            Your identification and certification documents have been successfully verified.
          </p>
        </div>
      </div>
    );
  }

  // Case 2: Documents are submitted and pending (not rejected)
  if (isSubmitted && idStatus !== "rejected" && certStatus !== "rejected") {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-6">
          <FiCheckCircle className="mx-auto text-blue-500 text-5xl mb-4" />
          <h1 className="text-2xl font-bold text-blue-800 mb-2">Documents Submitted</h1>
          <p className="text-blue-600">
            Your documents have been submitted and are pending verification. You will be notified once they are reviewed (typically within 1-3 business days).
          </p>
        </div>
      </div>
    );
  }

  // Case 3: Initial upload or re-upload after rejection
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {idStatus === "rejected" || certStatus === "rejected"
          ? "Documents Need Re-upload"
          : "Upload Verification Documents"}
      </h1>
      {(idStatus === "rejected" || certStatus === "rejected") && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6" aria-live="polite">
          <div className="flex items-start">
            <FiAlertCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">Your previous submission was rejected</p>
              <p className="text-red-600">
                Please review the rejection reasons below and upload corrected documents.
              </p>
            </div>
          </div>
        </div>
      )}
      <p className="text-gray-600 mb-8">
        To verify your identity and qualifications as a grader, please upload the following documents.
        These will be reviewed by our admin team before you can start grading crops.
      </p>
      <form onSubmit={handleSubmit}>
        <DocumentUploadCard
          title="Government Issued ID"
          description="Upload a clear photo or scan of your passport, driver's license, or national ID card"
          icon={<FiUser size={20} />}
          status={idStatus}
          onUpload={(e) => handleFileUpload(e, setIdFile, setIdStatus)}
          onRemove={() => handleRemoveFile(setIdFile, setIdStatus, "government-issued-id")}
          file={idFile}
          rejectionMessage={rejectionReason.id}
        />
        <DocumentUploadCard
          title="Grading Certification"
          description="Upload your official grading certification or qualification documents"
          icon={<FiAward size={20} />}
          status={certStatus}
          onUpload={(e) => handleFileUpload(e, setCertFile, setCertStatus)}
          onRemove={() => handleRemoveFile(setCertFile, setCertStatus, "grading-certification")}
          file={certFile}
          rejectionMessage={rejectionReason.cert}
        />
        <div className="mt-8 relative">
          <button
            type="submit"
            disabled={isSubmitting || idStatus !== "uploaded" || certStatus !== "uploaded"}
            className={`px-6 py-3 rounded-lg text-white font-medium ${
              isSubmitting || idStatus !== "uploaded" || certStatus !== "uploaded"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit for Verification"}
          </button>
          {(idStatus !== "uploaded" || certStatus !== "uploaded") && !isSubmitting && (
            <span className="absolute left-0 -top-6 text-sm text-red-600">
              Please upload both ID and Certification documents to proceed.
            </span>
          )}
        </div>
      </form>
      <div className="mt-12 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <h3 className="font-bold text-yellow-800 mb-2">Important Notes:</h3>
        <ul className="list-disc pl-5 text-yellow-700 space-y-1">
          <li>Documents must be clear and legible</li>
          <li>Accepted formats: PDF, JPG, PNG (max 5MB each)</li>
          <li>Verification may take 1-3 business days</li>
          <li>You will receive email notification once approved</li>
        </ul>
      </div>
    </div>
  );
};

export default UploadDocuments;