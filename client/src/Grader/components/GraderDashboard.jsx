import React, { useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiClock, FiTrendingUp, FiCalendar, FiFileText } from 'react-icons/fi';

const GraderDashboard = () => {
  // Mock data - replace with API calls
  const [stats, setStats] = useState({
    pendingRequests: 5,
    completedThisWeek: 12,
    accuracyRating: 96.5,
    avgProcessingTime: '2.3 days'
  });

  const recentActivity = [
    {
      id: 1,
      cropId: 'CR-2023-045',
      farmerName: 'John Smith',
      cropType: 'Wheat',
      action: 'graded',
      grade: 'A',
      date: '2023-05-15 14:30'
    },
    {
      id: 2,
      cropId: 'CR-2023-046',
      farmerName: 'Jane Doe',
      cropType: 'Corn',
      action: 'started',
      date: '2023-05-15 11:15'
    },
    {
      id: 3,
      cropId: 'CR-2023-047',
      farmerName: 'Robert Johnson',
      cropType: 'Soybeans',
      action: 'submitted',
      date: '2023-05-14 16:45'
    }
  ];

  const priorityRequests = [
    {
      id: 'CR-2023-048',
      farmerName: 'Alice Brown',
      cropType: 'Wheat',
      daysPending: 1,
      dueDate: '2023-05-16'
    },
    {
      id: 'CR-2023-049',
      farmerName: 'Michael Wilson',
      cropType: 'Corn',
      daysPending: 2,
      dueDate: '2023-05-15'
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Grader Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center">
            <FiAlertCircle className="text-yellow-500 text-2xl mr-3" />
            <div>
              <p className="text-gray-500 text-sm">Pending Requests</p>
              <p className="text-2xl font-bold">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <FiCheckCircle className="text-green-500 text-2xl mr-3" />
            <div>
              <p className="text-gray-500 text-sm">Completed This Week</p>
              <p className="text-2xl font-bold">{stats.completedThisWeek}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <FiTrendingUp className="text-blue-500 text-2xl mr-3" />
            <div>
              <p className="text-gray-500 text-sm">Accuracy Rating</p>
              <p className="text-2xl font-bold">{stats.accuracyRating}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <FiClock className="text-purple-500 text-2xl mr-3" />
            <div>
              <p className="text-gray-500 text-sm">Avg. Processing Time</p>
              <p className="text-2xl font-bold">{stats.avgProcessingTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Requests */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiAlertCircle className="text-red-500 mr-2" />
            Priority Grading Requests
          </h2>
          
          {priorityRequests.length > 0 ? (
            <div className="space-y-4">
              {priorityRequests.map(request => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{request.cropId}</h3>
                      <p className="text-sm text-gray-600">{request.farmerName} • {request.cropType}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      request.daysPending > 1 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Due: {request.dueDate}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-sm">
                    <span className="text-gray-500">Pending for {request.daysPending} day{request.daysPending > 1 ? 's' : ''}</span>
                    <button className="text-blue-600 hover:text-blue-800">
                      Start Grading →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiCheckCircle className="mx-auto text-2xl mb-2 text-green-500" />
              <p>No priority requests at this time</p>
            </div>
          )}

          <div className="mt-6">
            <button className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              View All Requests
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiClock className="text-blue-500 mr-2" />
            Recent Activity
          </h2>
          
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <div key={activity.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{activity.cropId}</p>
                    <p className="text-sm text-gray-600">{activity.farmerName}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.date.split(' ')[1]}</span>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    activity.action === 'graded' ? 'bg-green-500' : 
                    activity.action === 'started' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></span>
                  <span className="capitalize">
                    {activity.action} {activity.grade ? `as Grade ${activity.grade}` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              View Full History
            </button>
          </div>
        </div>
      </div>

      {/* Performance Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiTrendingUp className="text-green-500 mr-2" />
          Your Performance
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Weekly Completion</h3>
            <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              Chart Placeholder
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Accuracy Trend</h3>
            <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              Chart Placeholder
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Crop Types Graded</h3>
            <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              Chart Placeholder
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiFileText className="text-purple-500 mr-2" />
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <FiFileText className="text-blue-500 text-xl mb-2" />
            <h3 className="font-medium">Submit New Report</h3>
            <p className="text-sm text-gray-600">Document a completed grading</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <FiCalendar className="text-green-500 text-xl mb-2" />
            <h3 className="font-medium">Schedule Collection</h3>
            <p className="text-sm text-gray-600">Arrange crop sampling</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <FiTrendingUp className="text-yellow-500 text-xl mb-2" />
            <h3 className="font-medium">View Metrics</h3>
            <p className="text-sm text-gray-600">Analyze your performance</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraderDashboard;