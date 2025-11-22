import mongoose ,{Schema} from "mongoose";

const subscriptionSchema=new Schema(
{
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    subscriberedTo:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true});

export const subscription=mongoose.model('Subscription',subscriptionSchema);