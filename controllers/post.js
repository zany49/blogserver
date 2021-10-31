import Post from "../models/post";
import User from "../models/user"
import cloudinary from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})


export const createpost = async (req,res)=>{
    // console.log("post",req.body);

    const {content,image} = req.body;
    if(!content.length){
        return res.json(
            {
                error: 'Content is required',
            }
        );

    }
    try{
            const post = new Post({content,image, postedBy: req.user._id});
            await post.save();

            const postwithUser = await Post.findById(post._id)
            .populate("postedBy","-password -secret");
            res.json(postwithUser)
            // res.json(post);
       
    }catch(err){
        console.log(err);
        res.sendStatus(404);
    }



}

export const uploadimage = async (req, res) => {
    // console.log('upload', req.files)
    try{
        const result = await  cloudinary.uploader.upload(req.files.image.path);
        console.log('upload', result);
        res.json({
            url: result.secure_url,
            public_id: result.public_id,
        });
    }catch(err){
        console.log(err);
    }
}



export const postByUser=async (req, res)=>{
    try {
        // const post = await Post.find({postedBy: req.user._id})
        const post = await Post.find({})
        .populate('postedBy','_id name image')
        .sort({ createdAt: -1}) //-1 for latestpost
        .limit(10);
        // console.log("post=>",post)
        res.json(post)
    }catch(err){
        console.log(err);
    }

}

export const userPost = async (req, res)=>{
    try{
        const post = await Post.findById(req.params._id)
        .populate('postedBy','_id name image')
        .populate("comments.postedBy",'_id name image');
        res.json(post);
    }catch(err){
        console.log(err);
    }
}
export const updatePost= async (req, res) => {
    // console.log("post update =>",req.body)
    try{
        const post = await Post.findByIdAndUpdate(req.params._id,req.body,{
            new: true,
        });//new is to update in  the database
        res.json(post);
    }catch(err){
        console.log(err)
    }
}
export const deletePost= async (req, res) => {
    // console.log("post update =>",req.body)
    try{
        const post = await Post.findByIdAndDelete(req.params._id);
        //remove the image from the cloudinary database
       if(post.image&&post.image.public_id){
           const image = await cloudinary.uploader.destroy(post.image.public_id);
       }
       //ok true is after deletePost we cant able to send the post so we use ok true
        res.json({ok: true});
    }catch(err){
        console.log(err)
    }
}

export const newsFeed = async(req,res)=>{
    try{
        const user = await User.findById(req.user._id);
        let following = user.following;
        //to show my own id post  and following
        following.push(req.user._id);
        //pagination
        const currentPage= req.params.page || 1;
        const perPage = 3;
        
        const post = await Post.find({postedBy:{$in : following}})
        .skip((currentPage-1)*perPage)
        .populate('postedBy', '_id name image')
        .populate("comments.postedBy",'_id name image')
        .sort({createdAt:-1})
        .limit(perPage);
        res.json(post);
    }catch(err){
        console.log(err)
    }
}

export const likePost = async (req, res)=>{

    try{
        const post = await Post.findByIdAndUpdate(req.body._id,{
            $addToSet:{likes: req.user._id},
        },
        {new:true});
        res.json(post)
    }catch(err){
        console.log(err)
    }

}


export const unlikePost = async (req, res)=>{

    try{
        const post = await Post.findByIdAndUpdate(req.body._id,{
            $pull:{likes: req.user._id},
        },
            {new:true});
            res.json(post)
    }catch(err){
        console.log(err)
    }


}
//addComment,removeComment


export const addComment =async(req, res)=>{
    try{
        const {postId,comment} = req.body;
        const result = await Post.findByIdAndUpdate(postId,{
            $push:{comments:{text:comment,postedBy: req.user._id}},

        },{new:true})
        .populate('postedBy','_id name image')
        .populate("comments.postedBy",'_id name image');
        res.json(result)

    }catch(err){
        console.log(err);
    }
}


export const removeComment =async(req, res)=>{
    try{
        const {postId,comment} = req.body;
        const result = await Post.findByIdAndUpdate(postId,{
            $pull:{comments:{_id:comment._id}},

        },{new:true})
        res.json(result)

    }catch(err){
        console.log(err);
    }
}

//totall post
export const totalPost = async (req, res)=>{
    try{
        const post = await Post.find().estimatedDocumentCount();
        res.json(post);
    }catch(err){
        console.log(err);
    }
}

export const posts =async (req, res)=>{
    try {
        // const post = await Post.find({postedBy: req.user._id})
        const post = await Post.find({})
        .populate('postedBy','_id name image')
        .populate("comments.postedBy",'_id name image')
        .sort({ createdAt: -1}) //-1 for latestpost
        .limit(100);
        // console.log("post=>",post)
        res.json(post)
    }catch(err){
        console.log(err);
    }

}

export const getPost=async (req, res)=>{
    try {
        // const post = await Post.find({postedBy: req.user._id})
        const post = await Post.findById(req.params._id)
        .populate('postedBy','_id name image')
        .populate("comments.postedBy",'_id name image')
        
        // console.log("post=>",post)
        res.json(post)
    }catch(err){
        console.log(err);
    }

}