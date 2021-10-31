import express from "express";
import cors from 'cors';
import mongoose from "mongoose";

import dotenv from "dotenv";
import { readdirSync } from "fs";


const morgan = require("morgan");

const app = express();
dotenv.config();
//socket
const http = require("https").createServer(app);
const io = require("socket.io")(http,{
    path:'/socket.io',
    cors:{
        origin:"https://abdul-blogger-app.netlify.app",
        methods:["GET","POST"],
        allowedHeaders:["Content-type"],
    },
})


const PORT = process.env.PORT ;

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
})
.then(()=>console.log('Connected to db'))
.catch((err)=> console.log("DB connection error",err));

//middleware

app.use(express.json({limit:"5mb"})); //limiting the data size
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin: [process.env.CLIENT_URL],
}));

//autoload routes
readdirSync('./routes').map((r) => app.use('/api', require(`./routes/${r}`)));

//socket.io
// io.on("connect",(socket)=>{
// // console.log("socket.io=>",socket.id)
// socket.on("send-message",(message)=>{
//     // console.log("message  recived=>",message);
//     socket.broadcast.emit("receive-message",message)
// })

// })

io.on("connect",(socket)=>{

socket.on("new-post",(newPost)=>{
    // console.log("new post  recived=>",newPost);
    socket.broadcast.emit("new-post",newPost)
    
})

})

// app.listen(PORT,()=>console.log('connected to db',PORT))
//due to scoket we change to http
http.listen(PORT,()=>console.log('connected to db',PORT))
