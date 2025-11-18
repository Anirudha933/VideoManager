import momngoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema=new Schema(
    {
        videofile:{
            type:String,// url from cloudinary
            required:true
        },
        thumbnail:{
            type:String,// url from cloudinary
            required:true
        },
        title:{
            type:String,
            required:true,
            trim:true
        },
        description:{
            type:String,
            required:true,
            trim:true
        },
        duration:{
            type:Number,
            required:true
        },
        views:{
            type:Number,
            default:0
        },
        ispublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    }
,{timestamps:true}
);

videoSchema.plugin(mongooseAggregatePaginate);
export const Video=momngoose.model("Video",videoSchema);