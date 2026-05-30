import React from "react";
import { useNavigate } from "react-router-dom";

const BlogMoreActions = ({ isUserIsAuthor, setIsDeleteConfirmationOpen, setIsDropdownOpen, currentBlog }) => {
    const navigate = useNavigate();

    const authorActions = [
        { 
            name: "Edit Story", 
            style: "text-gray-700 hover:bg-gray-100",
            onClick: () => {
                navigate("/blog/upload", { state: { editBlog: currentBlog } });
                setIsDropdownOpen(false);
            }
        },
        { name: "Story Settings", style: "text-gray-700 hover:bg-gray-100" },
        { name: "Story Stats", style: "text-gray-700 hover:bg-gray-100" },
        { name: "Hide Responses", style: "text-gray-700 hover:bg-gray-100" },
        {
            name: "Delete Story",
            style: "text-red-600 hover:bg-red-100",
            onClick: () => {
                setIsDeleteConfirmationOpen(true);
                setIsDropdownOpen(false);
            }
        },
    ];


    const readerActions = [
        { name: "Follow Author", style: "text-gray-700 hover:bg-gray-100" },
        { name: "Follow Publication", style: "text-gray-700 hover:bg-gray-100" },
    ];

    return (
        <>
            {(isUserIsAuthor ? authorActions : readerActions).map((action, index) => (
                <button
                    key={index}
                    className={`cursor-pointer block w-full text-left px-4 py-2 ${action.style}`}
                    onClick={() => {
                        if (action.onClick) action.onClick();
                        setIsDropdownOpen(false);
                    }}
                >
                    {action.name}
                </button>
            ))}
        </>

    );
};

export default BlogMoreActions;
