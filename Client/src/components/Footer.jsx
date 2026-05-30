import React from "react";
import { FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className=" text-gray-800 py-6 px-8 flex flex-col md:flex-row justify-between items-center border-y border-gray-300 ">
      {/* Left Section */}
      <div className="text-sm opacity-80 ">
        © 2025 <span className="font-semibold">BlogHive</span>. All rights reserved.
      </div>

      {/* Center Section - Links */}
      <div className="flex gap-4 text-sm mt-4 md:mt-0">
        <a href="https://github.com/harshdaahiya/bloghive" target="_blank" rel="noopener noreferrer" className="hover:underline">
          BlogHive GitHub
        </a>
        <a href="https://github.com/harshdaahiya" target="_blank" rel="noopener noreferrer" className="hover:underline">
          My GitHub
        </a>
      </div>

      {/* Right Section - Social Icons */}
      <div className="flex gap-4 mt-4 md:mt-0">
        <a href="https://www.linkedin.com/in/harshdaahiya" target="_blank" rel="noopener noreferrer">
          <FaLinkedin className="text-xl hover:text-gray-400 transition" />
        </a>
        <a href="https://x.com/harshdaahiya" target="_blank" rel="noopener noreferrer">
          <FaTwitter className="text-xl hover:text-gray-400 transition" />
        </a>
        <a href="https://www.instagram.com/harshdaahiya" target="_blank" rel="noopener noreferrer">
          <FaInstagram className="text-xl hover:text-gray-400 transition" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
