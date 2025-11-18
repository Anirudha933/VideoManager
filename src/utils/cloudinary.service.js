import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const uploadOnCLoudinary=async (localfilePath)=>{
    try {
        if(!localfilePath) return NULL;

        const res=await cloudinary.uploader.upload(localfilePath,
            {resource_type:"auto"});
        if(res.secure_url)
        {
            console.log("File uploaded successfully on cloudinary",res.secure_url);            
           fs.unlink(localfilePath, (err) => {
                if (err) console.error("Failed to delete file locally",err);
                else console.log("File deleted succesfully locally");
            });
        }
        return response;
    } catch (error) {
        //remove the locally saved temp file as the upload failed
        fs.unlinkSync(localfilePath);
        return NULL;
    }
}


export {uploadOnCLoudinary};