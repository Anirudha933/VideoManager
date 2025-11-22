import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
cloudinary.config({
    cloud_name: "dycxwfwrk",
    api_key: "822196812215133",
    api_secret: "JmDJA7M51R49qsfbLxhIe8xSjlg",
  secure: true
});

const extractPublicId = (url) => {
  try {
    // Split by '/'
    const parts = url.split('/');

    // Find version segment like v1234567890
    const versionIndex = parts.findIndex(p => p.startsWith('v'));

    // Everything after version is public_id + extension
    const publicIdWithExt = parts.slice(versionIndex + 1).join('/');

    // Remove extension (.jpg, .png, .webp, etc.)
    const dotIndex = publicIdWithExt.lastIndexOf('.');
    return publicIdWithExt.substring(0, dotIndex);
  } catch (err) {
    console.error("Error extracting public_id:", err);
    return null;
  }
};


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

const deleteOnCloudinary=async(urlfromclodinary)=>{
    try{
        const public_id=extractPublicId(urlfromclodinary);
        const res=await cloudinary.uploader.destroy(public_id);
        return res;
    }
    catch(error){
        console.log("File delete on cloudinary failed",error);
        return null;
    }
}

export {uploadOnCLoudinary,deleteOnCloudinary};