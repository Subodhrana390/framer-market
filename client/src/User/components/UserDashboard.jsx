import React from 'react'
const UserDashboard = () => {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Farmer Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500">Crops Pending Grading</h3>
            <p className="text-3xl font-bold">5</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500">Ready to Sell</h3>
            <p className="text-3xl font-bold">12</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500">Recent Earnings</h3>
            <p className="text-3xl font-bold">$1,245</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Recent Grading Results</h2>
            {/* Grading results list */}
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Market Price Trends</h2>
            {/* Price chart */}
          </div>
        </div>
      </div>
    );
  };

  export default UserDashboard