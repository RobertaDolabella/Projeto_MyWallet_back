import express from "express";
import cors from 'cors';
import dotenv from 'dotenv'
import PostsRouter from './Routes/PostsRouter.js'
import UserRouter from './Routes/UserRouter.js'
import validateUser from "./middlewares.js"

const server = express()

server.use(express.json())
server.use(cors())

dotenv.config()

server.use(UserRouter);

server.use(validateUser)

server.use(PostsRouter);

server.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});
