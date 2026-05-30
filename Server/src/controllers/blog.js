import Blog from "../models/blog.js";
import SavedBlogs from "../models/savedBlogs.js";
import Comments from "../models/comments.js";
import { ApiResponse } from "../services/apiResponse.js";
import { ApiError } from "../services/apiError.js";
import { asyncHandler } from "../services/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../services/cloudinary.js"
import mongoose from "mongoose";

const getBlogById = asyncHandler(async (req, res) => {
    // fetching related blog here
    const blog = await Blog.findById(req.params.id).populate("createdBy", "profileImageURL fullName email username");

    if (!blog) {
        return res.status(404).json({
            message: "Blog not found"
        });
    }

    // Fetch comments related to the blog
    const comments = await Comments.find({ blogId: req.params.id }).populate("createdBy", "fullName username profileImageURL");

    const isAuthor = blog.createdBy._id.toString() === req.user._id.toString();

    return res.status(200).json({
        user: req.user,
        blog: blog,
        comments: comments,
        isAuthor: isAuthor,
        message: "Blog fetched successfully by given Id"
    });
});

const handleAddNewBlog = asyncHandler(async (req, res) => {
    const { title, body } = req.body;

    if (!(title && body)) {
        throw new ApiError(400, "title and body are required fields");
    }

    let coverImageURL;
    let coverImagePublic_id;

    if (req.file) {
        // Upload directly from buffer
        const coverImage = await uploadOnCloudinary(req.file.buffer, req.file.mimetype);

        if (coverImage) {
            coverImageURL = coverImage.secure_url;
            coverImagePublic_id = coverImage.public_id;
        }
    }

    let newblog = await Blog.create({
        body: body,
        title: title,
        createdBy: req.user._id,
        coverImage: coverImageURL,
        coverImagePublicId: coverImagePublic_id,
    });

    newblog = await newblog.populate("createdBy", "profileImageURL fullName email username");

    return res.status(200).json(
        new ApiResponse(200, { newBlog: newblog }, "New blog posted successfully")
    );
});


const getAllBlogsByUserId = asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();

    // Finding all blogs created by the current user
    const blogs = await Blog.find({ createdBy: userId }).populate("createdBy", "fullName profileImageURL username")

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                blogs: blogs,
            },
            "Fetched all blogs of current user successfully"
        )
    );
});

const handleDeleteBlogById = asyncHandler(async (req, res) => {
    const { blogId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
        throw new ApiError(400, "Invalid blog ID");
    }

    const tobeDeletedBlog = await Blog.findById(blogId);
    if (!tobeDeletedBlog) {
        throw new ApiError(404, "Blog not found");
    }

    if (tobeDeletedBlog.createdBy._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete this blog");
    }

    // Deleting associated image from Cloudinary
    if (tobeDeletedBlog.coverImagePublicId) {
        await deleteFromCloudinary(tobeDeletedBlog.coverImagePublicId);
    }

    // Removing blog from saved references
    const savedReferences = await SavedBlogs.find({ savedBlogId: blogId });

    if (savedReferences.length > 0) {
        console.log(`Blog ${blogId} is saved by ${savedReferences.length} user(s). Removing references.`);
        await SavedBlogs.deleteMany({ savedBlogId: blogId });
    }

    // Deleting the blog from the database
    await tobeDeletedBlog.deleteOne();

    return res.status(200).json(new ApiResponse(200, {}, "Blog deleted successfully"));
});

const saveBlogInTheUserProfile = asyncHandler(async (req, res) => {
    const { blogId } = req.params
    const { userId } = req.body

    if (!blogId || !userId) {
        throw new ApiError(400, "blog and user Id are required")
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
        throw new ApiError(400, "no blog found with give blog id")
    }

    // Checking if the blog has already been saved by the user
    const existingSavedBlog = await SavedBlogs.findOne({
        savedBy: userId,
        savedBlogId: blogId,
    });

    if (existingSavedBlog) {
        return res.status(400).json(
            new ApiResponse(400, null, "Blog is already saved by this user")
        );
    }

    let newSavedBlog = await SavedBlogs.create({
        savedBy: userId,
        savedBlogId: blogId
    })

    newSavedBlog = await newSavedBlog.populate({
        path: "savedBlogId",
        select: "title body coverImage createdBy createdAt",
        populate: { path: "createdBy", select: "name email profileImageURL fullName username" },
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                newSavedBlog,
                "blog saved succussfully now"

            )
        )

})

const removeSavedBlogByTheUser = asyncHandler(async (req, res) => {
    const { blogId } = req.params;
    const { userId } = req.body;

    if (!blogId || !userId) {
        throw new ApiError(400, "Blog ID and User ID are required");
    }

    // Check if the saved blog entry exists
    const savedBlog = await SavedBlogs.findOne({ savedBlogId: blogId, savedBy: userId });

    if (!savedBlog) {
        throw new ApiError(404, "Saved blog entry not found");
    }

    // Delete the saved blog entry
    await savedBlog.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, {}, "Blog removed successfully from saved list")
    );
});

const getAllSavedBlogsByUserId = asyncHandler(async (req, res) => {

    const { userId } = req.params
    userId.toString();

    if (!userId) {
        throw new ApiError(400, "userId is required")
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId format");
    }

    const allSavedBlogs = await SavedBlogs.find({ savedBy: userId })
        .populate({
            path: "savedBlogId",
            select: "title body coverImage createdBy createdAt",
            populate: { path: "createdBy", select: "name email profileImageURL fullName username" },
        });

    if (!allSavedBlogs || allSavedBlogs.length === 0) {
        throw new ApiError(404, "No saved blogs found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                allSavedBlogs,
                "all Saved blogs fetched succussfully"
            )
        )
})

const getAllBlogs = asyncHandler(async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query; // Default page 1, limit 5 blogs per request
        page = parseInt(page);
        limit = parseInt(limit);

        const blogs = await Blog.find()
            .sort({ createdAt: -1 }) // Sorting by latest
            .skip((page - 1) * limit) // Skipping previous pages
            .limit(limit)
            .populate("createdBy", "username fullName email profileImageURL")

        const totalBlogs = await Blog.countDocuments(); // Get total blogs count

        res.json({
            blogs,
            hasMore: page * limit < totalBlogs,
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
})


const handleUpdateBlogById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, body } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid blog ID");
    }

    const blog = await Blog.findById(id);
    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    if (blog.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to edit this blog");
    }

    if (title) blog.title = title;
    if (body) blog.body = body;

    if (req.file) {
        const coverImage = await uploadOnCloudinary(req.file.buffer, req.file.mimetype);
        if (coverImage) {
            if (blog.coverImagePublicId) {
                await deleteFromCloudinary(blog.coverImagePublicId);
            }
            blog.coverImage = coverImage.secure_url;
            blog.coverImagePublicId = coverImage.public_id;
        }
    }

    await blog.save();

    const updatedBlog = await Blog.findById(id).populate("createdBy", "profileImageURL fullName email username");

    return res.status(200).json(
        new ApiResponse(200, { newBlog: updatedBlog }, "Blog updated successfully")
    );
});


export {
    getBlogById,
    handleAddNewBlog,
    getAllBlogsByUserId,
    handleDeleteBlogById,
    saveBlogInTheUserProfile,
    getAllSavedBlogsByUserId,
    getAllBlogs,
    removeSavedBlogByTheUser,
    handleUpdateBlogById
}