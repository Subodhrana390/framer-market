import React, { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiCalendar, FiPackage } from "react-icons/fi";
import { FaAddressCard, FaPlus, FaWeightHanging } from "react-icons/fa";
import { toast } from "react-toastify";
import apiClient from "../../apiClient/ApiClient.js";

const CropInventory = () => {
  const [crops, setCrops] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const getAllCrops = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.get("/crop/getListedCommodities", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page },
      });

      setCrops(response.data.data.crops);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to fetch crop inventory"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllCrops();
  }, [page]);

  const addToSell = async (cropId) => {
    if (!window.confirm("Are you sure you want to list this crop for sale?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }

    try {
      await apiClient.post(`/crop/addToSell/${cropId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Crop listed for sale successfully");
      setCrops((prev) => prev.filter((crop) => crop._id !== cropId));
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to list crop for sale"
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Crop Inventory Management
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Current Inventory
        </h3>
        {crops.length === 0 ? (
          <p className="text-gray-500 italic">
            No crops in inventory. Add some crops to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <caption className="sr-only">Crop inventory list</caption>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crop Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harvest Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {crops.map((crop) => (
                  <tr key={crop._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {crop.cropType.charAt(0).toUpperCase() +
                        crop.cropType.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {crop.quantity} {crop.quantity >= 100 ? "Quintal" : "Kg"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(crop.harvestDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => addToSell(crop._id)}
                        className="text-green-600 hover:text-green-900 flex items-center"
                      >
                        <FiPlus className="mr-1" /> Add to Sell
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1 || isLoading}
                className={`px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 ${
                  (page === 1 || isLoading) && "opacity-50 cursor-not-allowed"
                }`}
              >
                Previous
              </button>

              <span className="text-gray-700 font-medium">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page === totalPages || isLoading}
                className={`px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 ${
                  (page === totalPages || isLoading) &&
                  "opacity-50 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
            {isLoading && (
              <div className="text-center mt-4">
                <span className="animate-spin">⏳</span> Loading...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CropInventory;
