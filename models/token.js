import  mongoose  from "mongoose";

const { ObjectId } = mongoose.Schema;
const {Schema} = mongoose;



const tokenSchema = new Schema({

    userId:{
        type:ObjectId,
        ref:"User",
        required:true,
    },
    resttoken: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600,
    },
},
{
    collection:'UserTokenBlog',
    timestamps:true,
})

export default mongoose.model('Token',tokenSchema);