import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../Models/user.models.js";
import {uploadOnCLoudinary} from "../utils/cloudinary.service.js";
import {ApiResponse} from "../utils/apiResponse.js";
import fs from "fs";

const registerUser=asyncHandler(async(req,res)=>{
    //user details form forntend
    //data from json or form is found in req.body
    const {username,email,fullname,password}=await req.body;
    //validations on the user details
    if(
        [fullname,email,password,username].some((value)=>value?.trim()==='')
    ){
        throw new ApiError(400,`${value} is required`);
    }

    //check if user already exists
     const checkuserPresentOrNot=await User.findOne(
        {
            $or:
            [
                {email},
                {username}
            ]
        });
     if(checkuserPresentOrNot){
        throw new ApiError(409,"User with username or email already exists");
     }

    //check for images ,avatars etc

     const avatarLocalPath=await req.files?.avatar[0]?.path;
     const coverimageLocalPath=await req.files?.coverimage[0]?.path;

     if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required");
     }

    //upload to cloudinary

    const avatarUrl=await uploadOnCLoudinary(avatarLocalPath);
    if(!avatarUrl.secure_url){
        throw new ApiError(400,"Avatar upload failed");
    }
    // TODO: remove the locally saved temp file as the upload failed
    // if(avatarUrl.secure_url){
    //     fs.unlink(localfilePath, (err) => {
    //             if (err) console.error("Failed to delete file locally",err);
    //             else console.log("File deleted succesfully locally");
    //         });
    // }
    const coverimageUrl=await uploadOnCLoudinary(coverimageLocalPath);
     // TODO: remove the locally saved temp file as the upload failed
    // if(coverimageUrl.secure_url){
    //     fs.unlink(localfilePath, (err) => {
    //             if (err) console.error("Failed to delete file locally",err);
    //             else console.log("File deleted succesfully locally");
    //         });
    // }

    //create user in db
   const user=await User.create(
        {
            username:username.toLowerCase(),
            email,
            fullname,
            password,
            avatar:avatarUrl.secure_url,
            coverimage:coverimageUrl?.secure_url || ""
        }
    )
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if(!createdUser){
        throw new ApiError(500,"User creation failed");
    }
    //remove password and refresh token from res
    return res.status(201).json(
        new ApiResponse(
            200,
            createdUser,
            "User created successfully"
        )
    )
    //check for user creation

    //return res

});

export {registerUser};