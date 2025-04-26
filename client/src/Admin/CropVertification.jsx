import React, { useEffect, useState } from "react";
import apiClient from "../apiClient/ApiClient.js";
import { 
  FaUser, 
  FaWeightHanging, 
  FaMoneyBillWave, 
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaClipboardCheck,
  FaSpinner,
  FaExclamationTriangle,
  FaCheck,
  FaTimes
} from "react-icons/fa";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CropVerification = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchAllListings();
  }, []);

  const fetchAllListings = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await apiClient.get("/listing", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setListings(res.data.data.commodities);
      setLoading(false);
    } catch (error) {
      setError(error.message || "Failed to fetch listings");
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    const token = localStorage.getItem("token");
    try {
      await apiClient.put(
        `/listing/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setListings(listings.map(listing => 
        listing._id === id ? { ...listing, status: newStatus } : listing
      ));
      
      toast.success(`Listing ${newStatus} successfully!`);
    } catch (error) {
      toast.error(`Failed to update status: ${error.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <FaSpinner className="animate-spin text-4xl text-blue-500" />
      <span className="ml-2 text-xl">Loading listings...</span>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <FaExclamationTriangle className="text-4xl text-red-500" />
      <span className="ml-2 text-xl text-red-600">{error}</span>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Crop Verification</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div key={listing._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800 capitalize">
                  {listing.crop.cropType}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  listing.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {listing.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <FaUser className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Seller</p>
                    <p className="font-medium">{listing.seller.fullName}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FaWeightHanging className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-medium">{listing.quantity} {listing.unit}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FaMoneyBillWave className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium">₹{listing.price.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Harvest Date</p>
                    <p className="font-medium">
                      {new Date(listing.crop.harvestDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaClock className="text-gray-500 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Sample Collection</p>
                    <p className="font-medium">
                      {new Date(listing.crop.sampleCollection.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {listing.crop.sampleCollection.timeSlot}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{listing.crop.sampleCollection.location}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FaClipboardCheck className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Crop Status</p>
                    <p className="font-medium capitalize">{listing.crop.status}</p>
                  </div>
                </div>

                {listing.status === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleStatusChange(listing._id, 'approved')}
                      disabled={updatingId === listing._id}
                      className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300 transition-colors"
                    >
                      {updatingId === listing._id ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaCheck className="mr-2" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(listing._id, 'rejected')}
                      disabled={updatingId === listing._id}
                      className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300 transition-colors"
                    >
                      {updatingId === listing._id ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaTimes className="mr-2" />
                      )}
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CropVerification;