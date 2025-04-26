import React, { useState } from "react";
import { FaCheck, FaTimes, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../apiClient/ApiClient";

const SubscriptionPage = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: "7_days",
      name: "7 Days Trial",
      price: 0,
      duration: "7 days",
      features: ["Full access for 7 days", "Cancel anytime"],
    },
    {
      id: "1_month",
      name: "1 Month",
      price: 300,
      duration: "30 days",
      features: ["Full access for 1 month", "Cancel anytime"],
    },
    {
      id: "3_months",
      name: "3 Months",
      price: 800,
      duration: "90 days",
      features: ["Full access for 3 months", "Save ₹100", "Cancel anytime"],
    },
  ];

  const handleSubscribe = async (planId) => {
    setLoading(true);
    setSelectedPlan(planId);

    try {
      // Get order details from your backend
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await apiClient.post(
        "/subscriptions/create-subscription",
        { plan: planId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { orderId, subscription } = response.data.data;

      // Razorpay options
      const options = {
        key: import.meta.env.VITE_APP_RAZORPAY_KEY_ID,
        amount: subscription.amount,
        currency: "INR",
        name: "Your App Name",
        description: `Subscription for ${
          plans.find((p) => p.id === planId).name
        }`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment on your backend
            const verifyResponse = await apiClient.post(
              "/subscriptions/confirm-subscription",
              {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySubscriptionId: subscription.razorpaySubscriptionId,
                userId: user._id,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            toast.success("Subscription activated successfully!");
            // Redirect or update user state as needed
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: "User Name", // You can get this from user profile
          email: "user@example.com", // You can get this from user profile
          contact: "9999999999", // You can get this from user profile
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.log(error)
      toast.error(
        error.response?.data?.message || "Failed to initiate payment"
      );
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Select the subscription that fits your needs
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                plan.id === "7_days"
                  ? "ring-2 ring-blue-500 transform scale-105"
                  : ""
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </h2>
                  {plan.id === "3_months" && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      POPULAR
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-3xl font-bold text-gray-900">
                    {plan.price === 0 ? "Free" : `₹${plan.price}`}
                  </p>
                  <p className="text-gray-500">{plan.duration}</p>
                </div>

                <ul className="mt-6 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <FaCheck className="text-green-500 mr-2" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading && selectedPlan === plan.id}
                  className={`mt-8 w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    plan.id === "3_months"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {loading && selectedPlan === plan.id ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>{plan.price === 0 ? "Start Trial" : "Subscribe Now"}</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Subscription Details
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <span>Cancel anytime - no commitments</span>
            </li>
            <li className="flex items-start">
              <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <span>7-day free trial with full access</span>
            </li>
            <li className="flex items-start">
              <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <span>Auto-renews unless canceled</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
