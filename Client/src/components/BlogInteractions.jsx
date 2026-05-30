import React, { useRef, useState } from "react";
import { FaRegComment, FaRegBookmark, FaRegShareSquare, FaBookmark } from "react-icons/fa";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import ConfirmDelete from "./ConfirmDelete";
import BlogMoreActions from "./BlogMoreActions";
import { IoShareOutline } from "react-icons/io5";
import LikeButton from "./LikeButton";
import useOutSideClick from "../hooks/useOutSideClick";

const BlogInteractions = ({
    blogId,
    totalComments,
    userId,
    isSaved,
    setIsShareOpen,
    isUserIsAuthor,
    handleSaveBlog,
    handleDeleteBlog,
    handleRemoveSavedBlog,
    scrollToComments,
    liked,
    setLiked,
    likeCount,
    setLikeCount
}) => {

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const blogMoreBTNRef = useRef();
    const toggleButtonRef = useRef(null);

    useOutSideClick(blogMoreBTNRef, () => setIsDropdownOpen(false), toggleButtonRef); // custom hook for the blogmore actions dropdown to get closed for the outside clicks

    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

    const handleDeleteConfirmation = () => {
        handleDeleteBlog(blogId);
        setIsDeleteConfirmationOpen(false);
    };

    return (
        <div className="flex items-center justify-between py-4 px-3">
            {/* Left: Like & Comment */}
            <div className="flex items-center gap-10">

                <div className=" cursor-pointer flex items-center gap-1 text-gray-500 hover:text-gray-800 transition">
                    <LikeButton 
                        blogId={blogId} 
                        liked={liked}
                        setLiked={setLiked}
                        likeCount={likeCount}
                        setLikeCount={setLikeCount}
                    />
                </div>


                <div 
                    className="flex items-center gap-3"
                    onClick={scrollToComments}
                    >
                    <button className="cursor-pointer  flex items-center gap-1 text-gray-500 hover:text-gray-800 transition">
                        <FaRegComment className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium">{totalComments}</span>
                </div>


            </div>

            {/* Right: Save, Share, More Options */}
            <div className=" relative flex items-center gap-6">
                <button className=" cursor-pointer  text-gray-500 hover:text-gray-800 transition" onClick={() => isSaved ?
                     handleRemoveSavedBlog(blogId, userId)
                    : handleSaveBlog(blogId, userId)}>
                    {isSaved ?
                        <FaBookmark className="w-5 h-5 text-gray-900" />
                        : <FaRegBookmark className="w-5 
                    
                    h-5" />
                    }
                </button>

                <button 
                    className="cursor-pointer  text-gray-500 hover:text-gray-800 transition" 
                    onClick={() => setIsShareOpen(true)}>
                    <IoShareOutline className="w-6 h-6" />
                </button>

                <button
                    className="cursor-pointer  text-gray-500 hover:text-gray-800 transition"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    ref={toggleButtonRef}
                >
                    <HiOutlineDotsHorizontal className="w-6 h-6" />
                </button>

                {isDropdownOpen && (
                    <div
                        className="absolute right-8 mt-2 w-48 bg-white shadow-sm rounded-lg p-2 transition-opacity duration-200"
                        ref={blogMoreBTNRef}
                    >
                        <BlogMoreActions
                            isUserIsAuthor={isUserIsAuthor}
                            setIsDeleteConfirmationOpen={setIsDeleteConfirmationOpen}
                            setIsDropdownOpen={setIsDropdownOpen}
                        />
                    </div>
                )}

            </div>

            {/* Conditional Rendering of the ConfirmDelete Component */}
            {isDeleteConfirmationOpen && (
                <ConfirmDelete
                    message="Are you sure you want to delete this blog?"
                    onCancel={() => setIsDeleteConfirmationOpen(false)}
                    onConfirm={handleDeleteConfirmation}
                />
            )}
        </div>
    );
};

export default BlogInteractions;
