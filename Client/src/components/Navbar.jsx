import React, { useRef, useState } from "react";
import { FiBell, FiChevronDown, FiChevronUp, FiUser, FiBook, FiLogOut } from "react-icons/fi";
import { TiDocumentText } from "react-icons/ti";
import { IoStatsChartOutline } from "react-icons/io5";
import { MdAdminPanelSettings } from "react-icons/md";
import { HiPencilAlt } from "react-icons/hi";
import { IoMdNotificationsOutline } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserProfileData } from "../context/userContext";
import Spinner from "./Spinner";
import axiosInstance from "../utils/axiosInstance";
import useOutsideClick from "../hooks/useOutSideClick";

const Navbar = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { logout, role } = useAuth();
  const { setBlogs, setUserProfileData, userProfileData } = useUserProfileData();
  const blogHiveUser = localStorage.getItem("BlogHiveUser");

  const navbarMoreBtnRef = useRef(null);
  const toggleButtonRef = useRef(null)
  
  useOutsideClick(navbarMoreBtnRef, () => setIsDropdownOpen(false), toggleButtonRef);

  const IsUserHasProfileImage = userProfileData.profileImageURL === "/public/Images/defaultImage.png";

  const logoutUser = async () => {
    setLoading(true);
    try {
      await axiosInstance.get("/user/logout");
      logout();
      setBlogs([]);
      setUserProfileData([]);
      localStorage.removeItem("BlogHiveUser");
      setTimeout(() => {
        setLoading(false);
        navigate("/");
      }, 5000);
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
      setLoading(false);
    }
  };

  const NevigateToAdminPage = () => {
    navigate("/Admin")
  }

  const dropdownItems = [
    { name: "Profile", icon: <FiUser />, path: `/${blogHiveUser}` },
    { name: "Library", icon: <FiBook />, path: "/library" },
    { name: "Notificatins", icon: <IoMdNotificationsOutline/>, path: "/notifications" },
    { name: "Stories", icon: <TiDocumentText />, path: "/stories" },
    { name: "Stats", icon: <IoStatsChartOutline />, path: "/stats" },
    { name: "Logout", icon: <FiLogOut />, action: logoutUser },
  ];

  if (role === "ADMIN") {
    dropdownItems.push({ name: "Admin", icon: <MdAdminPanelSettings />, action: NevigateToAdminPage });
  };

  return (
    <nav className="bg-white text-black border-b border-gray-300 p-3">
      <div className="container mx-auto flex items-center justify-between">

        {/* Left Section */}
        <div className="flex items-center space-x-3 sm:space-x-5 cursor-pointer">
          <Link to="/">
            <img src="/assets/bloghive-text-logo.png" alt="Logo" className="w-28 sm:w-36 h-auto" />
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3 sm:space-x-6 cursor-pointer">
          <Link to="/blog/upload">
            <button className="flex items-center text-gray-800 text-sm sm:text-xl px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 hover:text-black">
              <HiPencilAlt className="mr-1 sm:mr-2" /> Write
            </button>
          </Link>

          <Link to="/notifications">
            <FiBell className="text-xl sm:text-2xl cursor-pointer" />
          </Link>

          {/* User Dropdown */}
          <div className="relative"
            ref={toggleButtonRef}>
            <div
              className="flex items-center cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <img
                src={IsUserHasProfileImage ? "/images/default_Image.jpeg" : userProfileData.profileImageURL}
                alt="User Profile"
                className="w-8 sm:w-10 h-8 sm:h-10 rounded-full object-cover border border-gray-300"
              />
              {isDropdownOpen ?
                <FiChevronDown className="ml-1 sm:ml-2" />
                : <FiChevronUp className="ml-1 sm:ml-2" />}
            </div>

            {isDropdownOpen && (
              <div
                ref={navbarMoreBtnRef}
                className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-44 sm:w-48 z-10"
                onClick={() => setIsDropdownOpen(true)}
              >
                <ul className="py-2 text-gray-700">
                  {dropdownItems.map((item, index) => (
                    <li
                      key={index}
                      className="px-3 sm:px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        setIsDropdownOpen(false); 

                        setTimeout(() => {  
                          if (item.action) {
                            item.action();
                          } else {
                            navigate(item.path);
                          }
                        }, 100);
                      }}
                    >
                      {item.icon} <span>{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && <Spinner />}
    </nav >
  );
};

export default Navbar;

