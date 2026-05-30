import dotenv from "dotenv"
import express from "express"
import cors from "cors"

import userRoute from "./routes/user.js"
import blogRoute from "./routes/blog.js"
import commentsRoute from "./routes/comments.js"
import path from "path"
import cookieParser from "cookie-parser"
import adminRoute from "./routes/admin.js"
import followRoute from "./routes/follow.js"
import likeRoute from "./routes/likes.js"
import { keepAlive } from "./services/KeepAlive.js"

dotenv.config()

const app = express()

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}))


app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));


app.use(cookieParser())
app.use(express.static(path.resolve("./public")))

app.get("/", (req, res) => {
    res.json("Hello, from server")
});

if (process.env.NODE_ENV === 'production') {
    const url = 'https://bloghive-server-rkvw.onrender.com';
    keepAlive(url);
}


app.use("/user", userRoute)
app.use("/blog", blogRoute)
app.use("/comment", commentsRoute)
app.use("/admin", adminRoute)
app.use("/follow", followRoute)
app.use("/like", likeRoute )


export { app }




