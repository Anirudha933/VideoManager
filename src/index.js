// we can use require syntax(commonjs) but it disturbs the code consistency as inn this project modulejs is used 
// require('dotenv').config({path:"./.env"});

import dotenv from "dotenv";
import connectDB  from "./db/index.js";
import {app} from "./app.js";
dotenv.config({path:"./.env"});
const PORT=process.env.PORT||8000;


connectDB()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is Listening at port ${PORT}`)
    })
}).catch((e)=>{
    console.log("MongoDB connection error: ",e)
})





/*
import mongoose from "mongoose";
require('dotenv').config()
import { DB_NAME } from "./constants.js";

import express from "express";

const app=express();
const PORT=process.env.PORT||8000;

// iify
;(async()=>{
    try{
        const res=await mongoose.connect(`${process.env.MONGOB_URL}/${DB_NAME}`)
        if(res)console.log("Connected to DB")
            app.on('error',(e)=>{
        console.log("App error: ",e);
        throw e;
    })
    app.listen(PORT,()=>{
        console.log(`Listening on port ${PORT}`)
    })
    }
    catch(e){
        console.log("DB connection error: ",e)
    }
})()
*/