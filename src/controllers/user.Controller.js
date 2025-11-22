import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../Models/user.models.js";
import {uploadOnCLoudinary} from "../utils/cloudinary.service.js";
import {ApiResponse} from "../utils/apiResponse.js";
import fs from "fs";
import jwt from "jsonwebtoken";

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
    // console.log(avatarUrl);
    if(!avatarUrl){
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
    // console.log(coverimageUrl);
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
            avatar:avatarUrl.url,
            coverimage:coverimageUrl?.url || ""
        }
    )
    // console.log("user",user);
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    );
    // console.log("Created User",createdUser);
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

const generateAccessAndRefreshToken=async(userId)=>{
    try{
        const user=await User.findById(userId);
        const accessToken=await user.generateAccessToken();
        const refreshToken=await user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
    }
    catch(error){
        throw new ApiError(500,"Token generation failed");
    }
}

const loginUser=asyncHandler(async(req,res)=>{
    const {username,email,password}=await req.body;
    
    if(!(username || email)) throw new ApiError(400,"Username or email is required");

    const user=await User.findOne({
        $or:[{username},{email}]
    })
    console.log("user",user);
    if(!user){
        throw new ApiError(404,"User not registered");
    }
    
    const isPasswordValid=await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(403,"Invalid credentials");
    }
    
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
    const loggedInUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    //by default cokkie is modifiable by anyone to be able to modify by server use httpOnly:true and secure true
    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {   
                user:loggedInUser,accessToken,
                refreshToken
            },
            "User Loged in successfully"
        )
    )
});

const logoutUser=asyncHandler(async(req,res)=>{
    const user=await req.user;
    await User.findByIdAndUpdate(user?._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    );
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(
        new ApiResponse(
            200,
            {},
            "User logged out successfully"
        )
    )
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request");
    }
    try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user=await User.findById(decodedToken._id);
    
        if(!user){
            throw new ApiError(401,"Invalid refreshToken");
        }
    
        if(incomingRefreshToken != user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used");
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
        const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
        return res.status(200)
                .cookie("accessToken",accessToken,options)
                .cookie("refreshToken",refreshToken,options)
                .json(
                    new ApiResponse(
                        200,
                        {accessToken,refreshToken},
                        "Access token refreshed successfully"
                    )
                )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh Token");
    } 
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=await req.body;

    const user=await User.findById(req.user?._id);
    const isOldPasswordCorrect=await user.isPasswordCorrect(oldPassword);

    if(!isOldPasswordCorrect){
        throw new ApiError(403,"Old password is incorrect");
    }
    user.password=newPassword;
    await user.save({validateBeforeSave:false});

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
    )
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "User details fetched successfully"
        )
    )
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
        const {fullname,email} =await req.body;
        if(!(fullname || email)){
            throw new ApiError(400,"Fullname or email is required");
        }
       const user=await User.findByIdAndUpdate(req.user._id,{
        $set:{
            fullname,
            email
        }
       },
       {new:true}
    ).select("-password -refreshToken")
       ;
        return res.status(200).json(
            new ApiResponse(
                200,
                user,
                "User details updated successfully"
            )
        )
})

//write different controller to update files inside user model like images
const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=await req.file?.avatar[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required");
    }
    const uploadOnCloudinaryRes=await uploadOnCLoudinary(avatarLocalPath);
    if(!uploadOnCloudinaryRes.url){
        throw new ApiError(500,"Avatar upload on cloudinary failed");
    }
    const user=await User.findByIdAndUpdate(req?.user?._id,{
        $set:{
            avatar:uploadOnCloudinaryRes.url
        }
    },
    {new:true})
    .select("-password -refreshToken");
    if(!user){
        throw new ApiError(404,"Avatar update failed");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Avatar updated successfully"
        )
    )
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const CoverImageLocalPath=await req.file?.avatar[0]?.path;
    if(!CoverImageLocalPath){
        throw new ApiError(400,"Cover image is required");
    }
    const uploadOnCloudinaryRes=await uploadOnCLoudinary(CoverImageLocalPath);
    if(!uploadOnCloudinaryRes.url){
        throw new ApiError(500,"Avatar upload on cloudinary failed");
    }
    const user=await User.findByIdAndUpdate(req?.user?._id,{
        $set:{
            coverimage:uploadOnCloudinaryRes.url
        }
    },
    {new:true})
    .select("-password -refreshToken");
    if(!user){
        throw new ApiError(404,"Cover image update failed");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Cover image updated successfully"
        )
    )
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
    };