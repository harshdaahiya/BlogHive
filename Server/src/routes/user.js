import { Router } from "express"
import {
    loginUser, 
    logoutUser, 
    registerUser, 
    getCurrentUser,
    checkAuth,
    refreshAccessToken,
    editUserProfile
} from "../controllers/user.js"
import { verifyUserJwtToken } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"


const userRoute = Router();

userRoute.post("/signin", loginUser)
userRoute.get('/logout', verifyUserJwtToken, logoutUser)
userRoute.post("/signup", upload.single("avatar"), registerUser)
userRoute.get("/profile", verifyUserJwtToken,  getCurrentUser)
userRoute.get("/checkAuth", verifyUserJwtToken, checkAuth )
userRoute.post("/refresh-token", refreshAccessToken)
userRoute.post("/edit-user-profile", verifyUserJwtToken, upload.single("avatar"), editUserProfile)


export default userRoute