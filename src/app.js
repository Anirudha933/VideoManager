import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app=express();
//while using middleware we use app.use
//setting up of middleware
app.use(cors(
    {   
        //frontend origin
        origin:process.env.CORS_ORIGIN,
        credentials:true
    } ));

app.use(express.json({limit:"16kb"}));
//extended:true means extending objects
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
//to prform crud operations on cookies being controlled from server
app.use(cookieParser());



export {app};