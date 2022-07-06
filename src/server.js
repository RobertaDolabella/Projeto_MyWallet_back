import express from "express";
import cors from 'cors';
import dotenv from 'dotenv'
import PostsRouter from './Routes/PostsRouter.js'
import UserRouter from './Routes/UserRouter.js'
import validateUser from "./middlewares.js"

const server = express()
server.use(cors())
server.use(express.json())


dotenv.config()

server.use(UserRouter);

server.use(validateUser)

server.use(PostsRouter);

const PORT = process.env.PORT || 5008;
server.listen(PORT, () => console.log('Servidor rodou deboas'));
