import React, { useState } from "react";
import { FiCalendar, FiMapPin } from "react-icons/fi";
import apiClient from "../../apiClient/ApiClient";
import { toast } from "react-toastify";

const SubmitCrops = () => {
  const [formData, setFormData] = useState({
    cropType: "",
    quantity: "",
    harvestDate: "",
    notes: "",
    sampleCollection: {
      required: false,
      date: "",
      timeSlot: "",
      location: "",
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const timeSlots = [
    "9:00 AM - 11:00 AM",
    "11:00 AM - 1:00 PM",
    "2:00 PM - 4:00 PM",
    "4:00 PM - 6:00 PM",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("sampleCollection.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        sampleCollection: {
          ...prev.sampleCollection,
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Step 1 → Move to Step 2
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
  
      const res = await apiClient.post("/crop/submit-crop", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      toast.success("Crop submitted successfully!");
      setSubmissionSuccess(true);
      console.log("Submission data:", formData);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to submit crop. Please try again."
      );
    }
  };
  
  if (submissionSuccess) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 inline-block">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Submission Successful!
          </h2>
          <p className="text-green-600 mb-6">
            Your crop has been submitted for grading.
            {formData.sampleCollection.required && (
              <>
                <br />A grader will visit on {formData.sampleCollection.date}{" "}
                between {formData.sampleCollection.timeSlot}.
              </>
            )}
          </p>
          <button
            onClick={() => {
              setFormData({
                cropType: "",
                quantity: "",
                harvestDate: "",
                notes: "",
                sampleCollection: {
                  required: false,
                  date: "",
                  timeSlot: "",
                  location: "",
                },
              });
              setCurrentStep(1);
              setSubmissionSuccess(false);
            }}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Submit Another Crop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Submit Crops for Grading</h1>

      {/* Progress steps */}
      <div className="flex mb-8">
        <div
          className={`flex-1 border-b-2 ${
            currentStep >= 1 ? "border-green-600" : "border-gray-300"
          }`}
        >
          <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-full bg-green-600 text-white">
            1
          </div>
          <p className="text-center mt-2 text-sm">Crop Details</p>
        </div>
        <div
          className={`flex-1 border-b-2 ${
            currentStep >= 2 ? "border-green-600" : "border-gray-300"
          }`}
        >
          <div
            className={`flex items-center justify-center w-10 h-10 mx-auto rounded-full ${
              currentStep >= 2 ? "bg-green-600 text-white" : "bg-gray-100"
            }`}
          >
            2
          </div>
          <p className="text-center mt-2 text-sm">Sample Collection</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {currentStep === 1 ? (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crop Type
                </label>
                <select
                  name="cropType"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.cropType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select crop</option>
                  <option value="wheat">Wheat</option>
                  <option value="corn">Corn</option>
                  <option value="rice">Rice</option>
                  <option value="soybeans">Soybeans</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (kg)
                </label>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harvest Date
                </label>
                <input
                  name="harvestDate"
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.harvestDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions or details about the crop"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    name="sampleCollection.required"
                    type="checkbox"
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    checked={formData.sampleCollection.required}
                    onChange={handleChange}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Request on-site sample collection by grading team
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                disabled={
                  !formData.cropType ||
                  !formData.quantity ||
                  !formData.harvestDate
                }
              >
                Continue to Scheduling
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiCalendar className="mr-2 text-green-600" />
              Schedule Sample Collection
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collection Date
                </label>
                <input
                  name="sampleCollection.date"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.sampleCollection.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Slot
                </label>
                <select
                  name="sampleCollection.timeSlot"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.sampleCollection.timeSlot}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select time slot</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiMapPin className="mr-2 text-green-600" />
                  Collection Location
                </label>
                <input
                  name="sampleCollection.location"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.sampleCollection.location}
                  onChange={handleChange}
                  placeholder="Farm address or GPS coordinates"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                disabled={
                  !formData.sampleCollection.date ||
                  !formData.sampleCollection.timeSlot ||
                  !formData.sampleCollection.location
                }
              >
                Submit for Grading
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SubmitCrops;
