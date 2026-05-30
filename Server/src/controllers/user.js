import User from "../models/user.js"
import { ApiError } from "../services/apiError.js"
import { ApiResponse } from "../services/apiResponse.js"
import { asyncHandler } from "../services/asyncHandler.js"
import { uploadOnCloudinary } from "../services/cloudinary.js"
import { generateUsername } from "../services/generateUsername.js"
import JWT from "jsonwebtoken";
import { createAccessToken, createRefreshToken } from "../services/userTokens.js"

const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body

    if (!email && !password) {
        throw new ApiError(400, "email or password is required")
    }

    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(400, "user does not exist")
    }

    const { accessToken, refreshToken } = await User.matchPassAndGenTokens(email, password);

    const options = {
        httpOnly: true,
        secure: true, 
        sameSite: "None",
        path: "/"
    };

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: accessToken, refreshToken,
                    role: user.role,
                },
                "user logged in succussfully"
            )
        )

})

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;

    if ([fullName, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const isUserExists = await User.findOne({ email });
    if (isUserExists) {
        throw new ApiError(409, "User already exists with this email");
    }

    const generatedUsername = generateUsername(email);
    if (!generatedUsername) {
        throw new ApiError(409, "Error occurred while generating the username for the user");
    }

    let avatarUrl;
    if (req.file) {
        const avatar = await uploadOnCloudinary(req.file.buffer);  // avatar is stored in memory by multer middleware
        if (avatar) avatarUrl = avatar.secure_url;
    }


    const newUser = await User.create({
        username: generatedUsername,
        fullName,
        email,
        password,
        profileImageURL: avatarUrl,
    });

    const createdUser = await User.findById(newUser._id).select("-password");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating new user");
    }

    // Generating tokens immediately after sucussful registration to make user logged in as well
    const { accessToken, refreshToken } = await User.matchPassAndGenTokens(email, password);

    const options = {
        httpOnly: true,
        secure: true, 
        sameSite: "None",
        path: "/"
    };

    return res.status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                201,
                { user: createdUser, accessToken, refreshToken },
                "User registered successfully and logged in"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    console.log(req.user._id);

    const options = {
        httpOnly: true, 
        secure: true,    
        sameSite: "None", 
        path: "/",       
    };

    res.status(200)
        .cookie("accessToken", "", { ...options, expires: new Date(0) })
        .cookie("refreshToken", "", { ...options, expires: new Date(0) })
        .json(
            new ApiResponse(200, {}, "User is logged out now")
        );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword && !newPassword) {
        throw new ApiError(400, "give existing and new password correctly")
    }

    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "wrong password")
    }

    user.password = newPassword
    user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password changes succussfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    // console.log(req.user)
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "user fetched succussfully"
            ))
})

const checkAuth = asyncHandler(async (req, res) => {
    const user = req.user ; 
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {user},
                "user is authenticated"
            )
        )
})

const refreshAccessToken = asyncHandler(async (req, res, next) => {
    console.log("🔹 Incoming refresh token:", req.cookies.refreshToken || req.body.refreshToken);

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        console.log("❌ No refresh token provided");
        return next(new ApiError(401, "Unauthorized Request"));
    }

    let decodedToken;
    try {
        console.log("🔹 Verifying Refresh Token...");
        decodedToken = JWT.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        console.log("❌ JWT Verification Failed:", err.message);
        return res.status(401).json({ message: "Invalid refresh token" });
    }

    console.log("✅ Token Verified, Fetching User...");
    const user = await User.findById(decodedToken._id);

    if (!user) {
        console.log("❌ User Not Found");
        return next(new ApiError(401, "Invalid refresh token"));
    }

    if (incomingRefreshToken !== user.refreshToken) {
        console.log("❌ Refresh token mismatch");
        return next(new ApiError(401, "Refresh token is expired or used"));
    }

    console.log("🔹 Generating New Tokens...");
    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user._id);

    console.log("🔹 Updating refresh token in DB...");
    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken }, { new: true });

    console.log("✅ Refresh token updated in DB");

    const options = {
        httpOnly: true,
        secure: true, 
        sameSite: "None",
        path: "/"
    };

    console.log("✅ Sending Response...");
    return res
        .status(200)
        .cookie("accessToken", newAccessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                { newAccessToken, refreshToken: newRefreshToken },
                "Access token refreshed"
            )
        );
});

const editUserProfile = asyncHandler(async (req, res) => {
    const { aboutText } = req.body;
    const userId = req.user._id;

    const updateFields = {};
    if (aboutText) {
        updateFields.about = aboutText;
    }

    if (req.file) {
        const avatar = await uploadOnCloudinary(req.file.buffer, req.file.mimetype);
        if (avatar) {
            updateFields.profileImageURL = avatar.secure_url;
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateFields,
        { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
        throw new ApiError(500, "Error occurred while updating, please retry");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "User profile updated successfully")
    );
});

export {
    loginUser,
    logoutUser,
    registerUser,
    getCurrentUser,
    checkAuth,
    refreshAccessToken,
    editUserProfile
}