import React, { useState } from "react";
import {
  Camera,
  MapPin,
  TreeDeciduous,
  Bell,
  Menu,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export default function TreeMappingHome() {
  const [activeTab, setActiveTab] = useState("SmartUrban Tree Mapping");

  // Sample statistics for the dashboard
  const stats = {
    totalTrees: 1247,
    healthyTrees: 1089,
    atRiskTrees: 158,
    recentReports: 23,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TreeDeciduous className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">Urban Tree Mapping</h1>
                <p className="text-xs text-green-100">Badulla Municipal Area</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Bell className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform" />
              <Menu className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-green-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome Back!
          </h2>
          <p className="text-gray-600">
            Monitor and manage Badulla's urban forest ecosystem
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <TreeDeciduous className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold mb-1">{stats.totalTrees}</p>
            <p className="text-sm text-green-100">Total Trees</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xl">✓</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.healthyTrees}</p>
            <p className="text-sm text-emerald-100">Healthy Trees</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-md p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold mb-1">{stats.atRiskTrees}</p>
            <p className="text-sm text-orange-100">At Risk</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <Bell className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold mb-1">{stats.recentReports}</p>
            <p className="text-sm text-blue-100">New Reports</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-green-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-800">Add Tree</p>
                <p className="text-xs text-gray-500">Log new tree</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-800">Scan Tree</p>
                <p className="text-xs text-gray-500">Quick capture</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <TreeDeciduous className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-800">View Map</p>
                <p className="text-xs text-gray-500">Explore trees</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-all">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-800">Report Issue</p>
                <p className="text-xs text-gray-500">Flag problem</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-green-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {[
              {
                type: "New Tree",
                location: "Main Street",
                time: "2 hours ago",
                icon: TreeDeciduous,
                color: "green",
              },
              {
                type: "Health Alert",
                location: "Park Avenue",
                time: "5 hours ago",
                icon: AlertTriangle,
                color: "orange",
              },
              {
                type: "Maintenance",
                location: "City Center",
                time: "1 day ago",
                icon: Camera,
                color: "blue",
              },
            ].map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div
                  className={`w-10 h-10 bg-${activity.color}-100 rounded-full flex items-center justify-center`}
                >
                  <activity.icon
                    className={`w-5 h-5 text-${activity.color}-600`}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">
                    {activity.type}
                  </p>
                  <p className="text-xs text-gray-500">{activity.location}</p>
                </div>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            {[
              { id: "home", icon: TreeDeciduous, label: "Home" },
              { id: "map", icon: MapPin, label: "Map" },
              { id: "camera", icon: Camera, label: "Scan" },
              { id: "alerts", icon: Bell, label: "Alerts" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "text-green-600 bg-green-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
