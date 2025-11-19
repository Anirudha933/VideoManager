import {v2 as cloudinary} from "cloudinary";
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
            console.log("File upload on cloudinary",res.secure_url);            
        return res;
    } catch (error) {
        //remove the locally saved temp file as the upload failed
        fs.unlinkSync(localfilePath);
        return NULL;
    }
}


export {uploadOnCLoudinary};