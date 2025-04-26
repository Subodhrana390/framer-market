import React, { useEffect, useState } from "react";
import { FiCalendar, FiPackage, FiDollarSign } from "react-icons/fi";
import { toast } from "react-toastify";
import apiClient from "../../apiClient/ApiClient.js";
import { FaRupeeSign } from "react-icons/fa";

const MarkedListed = () => {
  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const getAllListings = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.get("/listing/get-by-user", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page },
      });

      setListings(response.data.data.commodities);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to fetch your listings"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const removeListing = async (listingId) => {
    if (!window.confirm("Are you sure you want to remove this listing?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }

    try {
      await apiClient.delete(`/listing/listings/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Listing removed successfully");
      setListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to remove listing");
    }
  };

  useEffect(() => {
    getAllListings();
  }, [page]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Your Listed Crops for Sale
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6">
        {listings.length === 0 ? (
          <p className="text-gray-500 italic">
            {isLoading
              ? "Loading your listings..."
              : "You haven't listed any crops for sale yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <FiPackage className="inline mr-1" />
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <FaRupeeSign className="inline mr-1" />
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <FiCalendar className="inline mr-1" />
                    Listed Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {listings.map((listing) => (
                  <tr key={listing._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {listing.crop?.cropType?.charAt(0).toUpperCase() +
                        listing.crop?.cropType?.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {listing.quantity} {listing.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹ {listing.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(listing.listedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          listing.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : listing.status === "approved"
                            ? "bg-blue-100 text-blue-800"
                            : listing.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {listing.status.charAt(0).toUpperCase() +
                          listing.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {listing.status === "pending" && (
                        <button
                          onClick={() => removeListing(listing._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
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
          </div>
        )}
        {isLoading && listings.length > 0 && (
          <div className="text-center mt-4">
            <span className="animate-spin">⏳</span> Loading...
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkedListed;
