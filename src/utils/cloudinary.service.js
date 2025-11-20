import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
cloudinary.config({
    cloud_name: "dycxwfwrk",
    api_key: "822196812215133",
    api_secret: "JmDJA7M51R49qsfbLxhIe8xSjlg",
  secure: true
});

const uploadOnCLoudinary=async (localfilePath)=>{
    try {
        if(!localfilePath) return null;
        const res=await cloudinary.uploader.upload(localfilePath,
            {resource_type:"auto"});
            if(res.secure_url)
             fs.unlinkSync(localfilePath)
            // console.log("File upload on cloudinary",res);            
        return res;
    } catch (error) {
        console.log("File upload on cloudinary failed",error);
        //remove the locally saved temp file as the upload failed
        fs.unlinkSync(localfilePath);
        return null;
    }
}


export {uploadOnCLoudinary};