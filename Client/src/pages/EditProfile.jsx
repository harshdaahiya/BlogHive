import React, { useRef, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { RxCross1 } from "react-icons/rx";
import { useUserProfileData } from "../context/userContext";

const EditProfilePage = ({ onCancle, about }) => {
    const { userProfileData, refreshUserData } = useUserProfileData();
    const [aboutText, setAboutText] = useState(about || "");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const fileInputRef = useRef(null);

    const isUserHasProfileImage = userProfileData.profileImageURL === "/public/Images/defaultImage.png";
    const initialAvatar = isUserHasProfileImage ? "/images/default_Image.jpeg" : userProfileData.profileImageURL;

    useEffect(() => {
        setAvatarPreview(initialAvatar);
    }, [userProfileData]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleRemoveImage = () => {
        setAvatarFile(null);
        setAvatarPreview("/images/default_Image.jpeg");
    };

    const editUserProfile = async () => {
        const formData = new FormData();
        formData.append("aboutText", aboutText);
        if (avatarFile) {
            formData.append("avatar", avatarFile);
        }

        try {
            const res = await axiosInstance.post(
                "/user/edit-user-profile",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            // Sync globally
            if (res.data && res.data.data) {
                userProfileData.about = res.data.data.about;
                userProfileData.profileImageURL = res.data.data.profileImageURL;
            }
            
            await refreshUserData();
            onCancle();
        } catch (error) {
            console.error("Error occurred while updating the profile", error);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-xs z-50 transition-opacity duration-300 ease-in-out opacity-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg relative opacity-100 scale-95 transition-transform duration-300 ease-in-out
                max-h-[90vh] overflow-y-auto">
                <button className="absolute top-4 right-4" onClick={onCancle}>
                    <RxCross1 className="text-gray-700 hover:text-gray-900 cursor-pointer " />
                </button>
                <div className="flex justify-center items-center flex-col">
                    <h2 className="text-xl font-semibold mb-5">Profile Information</h2>

                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />

                    {/* Profile Image Section */}
                    <div className="flex items-center gap-4 w-full">
                        <img
                            src={avatarPreview || "/images/default_Image.jpeg"}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover cursor-pointer border border-gray-200"
                            onClick={triggerFileInput}
                        />
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center">
                                <button 
                                    onClick={triggerFileInput}
                                    className="text-green-600 hover:text-green-700 text-sm font-semibold cursor-pointer transition"
                                >
                                    Update
                                </button>
                                <button 
                                    onClick={handleRemoveImage}
                                    className="text-red-600 hover:text-red-700 text-sm font-semibold ml-4 cursor-pointer transition"
                                >
                                    Remove
                                </button>
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                                Recommended: Square JPG, PNG, or GIF, at least 1,000 pixels per side.
                            </div>
                        </div>
                    </div>

                    {/* Name Input (Read-only as configured) */}
                    <div className="w-full">
                        <label className="block mt-4 text-base font-semibold text-gray-700">Name*</label>
                        <input
                            type="text"
                            value={userProfileData?.fullName || ""}
                            disabled
                            className="w-full p-2.5 mt-1 border border-gray-200 rounded bg-gray-50 text-gray-600 cursor-not-allowed font-medium"
                        />
                    </div>

                    {/* Username / Handle (Dynamic reference) */}
                    <div className="w-full">
                        <label className="block mt-4 text-base font-semibold text-gray-700">Username</label>
                        <input
                            type="text"
                            value={userProfileData?.username ? `@${userProfileData.username}` : ""}
                            disabled
                            className="w-full p-2.5 mt-1 border border-gray-200 rounded bg-gray-50 text-gray-600 cursor-not-allowed font-medium"
                        />
                    </div>

                    {/* Short Bio */}
                    <div className="w-full">
                        <label className="block mt-4 text-base font-semibold text-gray-700">Short bio</label>
                        <textarea
                            className="w-full p-3 border border-gray-200 rounded bg-white hover:border-gray-300 focus:border-green-600 h-[80px] text-base resize-none focus:outline-none transition"
                            placeholder="Add a short bio about yourself..."
                            value={aboutText}
                            onChange={(e) => setAboutText(e.target.value)}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="sticky bottom-0 bg-white py-4 w-full flex justify-end gap-4 border-t border-gray-100 mt-7">
                        <button
                          className="px-5 py-2 border border-green-600 hover:bg-green-50 rounded-full text-green-600 font-semibold cursor-pointer transition text-sm"
                          onClick={onCancle}
                        >
                            Cancel
                        </button>
                        <button
                          className="px-5 py-2 rounded-full font-bold text-white bg-green-600 hover:bg-green-700 cursor-pointer transition text-sm shadow-sm"
                          onClick={editUserProfile}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfilePage;
