import React from "react";
import { IoStatsChartOutline } from "react-icons/io5";
import { FiTrendingUp, FiEye, FiBookOpen, FiUsers } from "react-icons/fi";

const Stats = () => {
  const statsSummary = [
    { name: "Total Views", value: "1,248", change: "+12% this month", icon: <FiEye className="text-green-600" /> },
    { name: "Total Reads", value: "856", change: "+8% this month", icon: <FiBookOpen className="text-green-600" /> },
    { name: "Total Followers", value: "312", change: "+24 new this week", icon: <FiUsers className="text-green-600" /> },
  ];

  const topStories = [
    { id: 1, title: "The Future of Web Development in 2026", views: 432, reads: 320, ratio: "74%" },
    { id: 2, title: "Creating My First MERN Stack Application", views: 388, reads: 290, ratio: "75%" },
    { id: 3, title: "Mastering Clean Code in JavaScript", views: 428, reads: 246, ratio: "57%" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 via-white to-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
          <div className="flex items-center space-x-3">
            <IoStatsChartOutline className="text-4xl text-green-600" />
            <h1 className="text-3xl font-semibold text-gray-900">Your Stats</h1>
          </div>
          <div className="flex items-center text-sm font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
            <FiTrendingUp className="mr-1.5" /> Growing Steady
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {statsSummary.map((stat, i) => (
            <div key={i} className="p-6 bg-gray-50 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
              <div>
                <span className="text-sm font-medium text-gray-500 block mb-1">{stat.name}</span>
                <span className="text-3xl font-bold text-gray-950 block mb-2">{stat.value}</span>
                <span className="text-xs text-gray-500 font-medium">{stat.change}</span>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-2xl">
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Top Stories Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Story Stats</h2>
          <div className="overflow-x-auto border border-gray-100 rounded-xl bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Reads</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Read Ratio</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {topStories.map((story) => (
                  <tr key={story.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 truncate max-w-xs">{story.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center font-semibold">{story.views}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center font-semibold">{story.reads}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        {story.ratio}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
