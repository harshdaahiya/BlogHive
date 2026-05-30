import React, { useState } from "react";
import { TiDocumentText } from "react-icons/ti";

const Stories = () => {
  const [activeTab, setActiveTab] = useState("drafts");

  const storyData = {
    drafts: [
      {
        id: 1,
        title: "The Future of Web Development in 2026",
        snippet: "As technologies advance rapidly, let's explore how web APIs, modern frameworks, and runtime environments are changing standard developer workflows...",
        updatedAt: "May 28, 2026",
        readTime: "5 min read",
      },
      {
        id: 2,
        title: "Creating My First MERN Stack Application",
        snippet: "A sentimental journey of building my very first full-stack application, working with Express servers, routing, MongoDB, and learning about clean code structures...",
        updatedAt: "May 15, 2026",
        readTime: "8 min read",
      }
    ],
    published: [
      {
        id: 3,
        title: "Mastering Clean Code in JavaScript",
        snippet: "Writing code is easy, but writing clean, maintainable, and readable code is an art form. Let's break down the solid design patterns for modern JavaScript applications...",
        updatedAt: "May 10, 2026",
        readTime: "6 min read",
      }
    ],
    responses: []
  };

  const currentStories = storyData[activeTab] || [];

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 via-white to-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <TiDocumentText className="text-4xl text-green-600" />
            <h1 className="text-3xl font-semibold text-gray-900">Your Stories</h1>
          </div>
          <button className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300">
            Write a Story
          </button>
        </div>

        {/* Navigation Bar */}
        <div className="flex justify-start space-x-8 mb-6 border-b border-gray-300 pb-4">
          {["drafts", "published", "responses"].map(
            (tab) => (
              <button
                key={tab}
                className={`text-lg font-medium capitalize ${
                  activeTab === tab
                    ? "text-green-600 border-b-4 border-green-600"
                    : "text-gray-700 hover:text-green-600"
                } transition duration-300`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {/* List Rendering */}
        <div className="space-y-6">
          {currentStories.length > 0 ? (
            currentStories.map((story) => (
              <div
                key={story.id}
                className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-lg transition duration-300 border border-gray-100"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-900 hover:text-green-600 cursor-pointer">
                    {story.title}
                  </h2>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {story.snippet}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Last updated on {story.updatedAt}</span>
                  <span className="bg-gray-200 px-3 py-1 rounded-full text-xs font-semibold">{story.readTime}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No stories in this section yet.</p>
              <p className="text-sm mt-1">Start writing or engaging with other authors to build your stories list!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stories;
