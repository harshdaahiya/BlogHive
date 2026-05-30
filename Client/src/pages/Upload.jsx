import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiUploadCloud, FiImage, FiX, FiArrowLeft, FiSave } from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useUserProfileData } from "../context/userContext";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const Upload = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const editBlog = state?.editBlog;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const { setBlogs, userProfileData } = useUserProfileData();

  const isPublishDisabled = !(title && body);

  useEffect(() => {
    if (editBlog) {
      setTitle(editBlog.title);
      setBody(editBlog.body);
      if (editBlog.coverImage) {
        setImagePreview(editBlog.coverImage);
      }
    }
  }, [editBlog]);

  useEffect(() => {
    if (!coverImage) {
      if (editBlog && editBlog.coverImage) {
        setImagePreview(editBlog.coverImage);
      } else {
        setImagePreview("");
      }
      return;
    }
    const objectUrl = URL.createObjectURL(coverImage);
    setImagePreview(objectUrl);

    // Free memory when this component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [coverImage, editBlog]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    setImagePreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPublishing(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    try {
      let res;
      if (editBlog) {
        res = await axiosInstance.put(`/blog/${editBlog._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        const updatedBlog = res.data.data.newBlog;
        setBlogs((prevBlogs) => prevBlogs.map(blog => blog._id === editBlog._id ? updatedBlog : blog));
        navigate(`/blog/${editBlog._id}`);
      } else {
        res = await axiosInstance.post("/blog",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        navigate("/");
        const newToBeSavedBlog = res.data.data.newBlog;
        setBlogs((prevBlogs) => [...prevBlogs, newToBeSavedBlog]);
      }
      
      setTitle("");
      setBody("");
      setCoverImage(null);

    } catch (error) {
      console.error("Error saving blog:", error);
      alert("Failed to save blog. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center max-w-5xl mx-auto">
      {/* Premium Top Navigation Bar */}
      <header className="w-full border-b border-gray-100 py-3 px-6 sm:px-10 flex justify-between items-center bg-white sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)} 
            className="cursor-pointer text-gray-500 hover:text-black transition text-2xl flex items-center bg-transparent border-none outline-none"
          >
            <FiArrowLeft className="mr-1" />
          </button>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl text-black">BlogHive</span>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-500 font-medium">
              {editBlog ? `Editing Story` : `Draft in ${userProfileData?.fullName || "Your Profile"}`}
            </span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPublishing || isPublishDisabled}
          className={`cursor-pointer px-5 py-2 text-sm text-white font-semibold rounded-full bg-green-600 hover:bg-green-700 transition duration-300 flex items-center gap-2 shadow-sm ${
            isPublishing || isPublishDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isPublishing ? (
            <ImSpinner8 className="animate-spin text-lg" />
          ) : editBlog ? (
            <FiSave className="text-base" />
          ) : (
            <FiUploadCloud className="text-base" />
          )}
          {editBlog ? "Save Changes" : "Publish"}
        </button>
      </header>

      {/* Main Canvas Area */}
      <main className="w-full max-w-3xl px-6 sm:px-10 py-12 flex-1 flex flex-col">
        {!isPublishing && (
          <form className="space-y-8 flex-1 flex flex-col" onSubmit={handleSubmit}>
            {/* Title Field */}
            <div>
              <input
                type="text"
                placeholder="Title"
                className="w-full text-4xl sm:text-5xl font-bold font-serif text-gray-900 border-none outline-none placeholder-gray-300 focus:ring-0 focus:outline-none py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Premium Cover Image Area */}
            <div className="group relative w-full rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 hover:border-green-500 transition duration-300 flex flex-col justify-center items-center min-h-[220px]">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Cover Preview"
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-4 right-4 bg-black bg-opacity-70 hover:bg-black text-white p-2 rounded-full transition shadow animate-fade-in"
                  >
                    <FiX className="text-lg" />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer w-full h-full py-10 flex flex-col items-center justify-center space-y-3">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  <div className="p-4 bg-white rounded-full shadow-sm text-gray-400 group-hover:text-green-600 transition">
                    <FiImage className="text-3xl" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-semibold text-green-600 hover:text-green-700">
                      Add a high-quality cover image
                    </span>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, or JPEG up to 10MB</p>
                  </div>
                </label>
              )}
            </div>

            {/* Rich Editor Canvas */}
            <div className="flex-1 flex flex-col min-h-[350px]">
              <ReactQuill
                theme="snow"
                value={body}
                onChange={setBody}
                placeholder="Tell your story..."
                className="w-full flex-1 flex flex-col font-serif text-lg outline-none border-none prose prose-lg"
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "blockquote"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link", "clean"],
                  ],
                }}
                required
              />
            </div>
          </form>
        )}
      </main>

      {/* Styled ReactQuill Customizations */}
      <style>{`
        .ql-container.ql-snow {
          border: none !important;
          font-family: Georgia, Cambria, "Times New Roman", Times, serif;
          font-size: 1.125rem;
          color: #1f2937;
        }
        .ql-editor {
          padding: 1.5rem 0 !important;
          min-height: 250px;
        }
        .ql-editor.ql-blank::before {
          left: 0 !important;
          font-style: italic;
          color: #9ca3af;
          font-family: Georgia, Cambria, "Times New Roman", Times, serif;
        }
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #f3f4f6 !important;
          padding: 8px 0 !important;
          position: sticky;
          top: 60px;
          background: white;
          z-index: 20;
        }
      `}</style>

      {/* Modern Backdrop-blur Overlay on Publishing */}
      {isPublishing && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 backdrop-blur-md z-50">
          <div className="flex flex-col items-center p-8 bg-white rounded-3xl shadow-xl border border-gray-100 animate-scale-up">
            <ImSpinner8 className="animate-spin text-5xl text-green-600" />
            <p className="text-gray-900 font-bold mt-4 text-xl">
              {editBlog ? "Saving your changes..." : "Publishing your story..."}
            </p>
            <p className="text-gray-500 text-sm mt-1">Uploading content and images safely</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
