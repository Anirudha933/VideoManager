import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema=new Schema(
{
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        //to optimise search use indexing
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullname:{
        type:String,
        required:true,
        trim:true
    },
    avatar:{
        type:String,// url from cloudinary
        required:true
    },
    coverimage:{
        type:String,//utl from cloudinary
    },
    watchhistory:[
        {
        type:Schema.Types.ObjectId,
        ref:'Video'
        }
    ],
    password:{
        type:String,
        required:[true,'Password is required'],
        trim:true
    },
    refreshToken:{
        type:String
    },
}
,{timestamps:true}
);


//arrow function doesn't keep context that is it doesn't keep this keyword pointing to current object .Thus while using pre middlewawre we have to use normal function
userSchema.pre('save',async function(next){
    try {
        if(!this.isModified('password')) return next();
        this.password=await bcrypt.hash(this.password,10);
        next();
    } catch (error) {
        console.log("Error while hashing password: ",error);
    }
})

userSchema.methods.isPasswordCorrect=async function (password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            email:this.email,
            fullname:this.fullname
        },process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY});
}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id
        },process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_SECRET});
}

export const User=mongoose.model('User',userSchema);