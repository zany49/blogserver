import mongoose from 'mongoose';

const {Schema} = mongoose;


//no sql to collect data from frontend
const userSchema = new Schema({
    name:
    { 
        type: String,
        trim: true,
         required: true,
    },
    email:
    { 
        type: String,
        trim: true,
         required: true,
         unique: true,
    },
    password:
    { 
        type: String,
         required: true,
         min:6,
         max:64,
    },emailToken:{
        type: String,

    },
    isVerified:{
        type:Boolean,
    }, 
    secret:
    { 
        type: String,
         required: true,
    },
    username:{
        type: String,
        unique: true,
        required: true,
    },
    about:{},
    image:{
        url: String,
        public_id: String,
    },
    role:{
        type: String,
        default:"Subscriber",
    },
    following:[{
        type: Schema.ObjectId,
        ref: "User"
    }],
    followers:[{
        type: Schema.ObjectId,
        ref: "User"
    }],
},
//passing as second argument
{ 
    collection:'UserdataBlog',
    timestamps:true,
}
);
export default mongoose.model('User', userSchema);