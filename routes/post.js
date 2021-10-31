import  express  from "express";

import  formidable from "express-formidable";
//middleware
import {requireSignin,canEditDeletePost, isAdmin} from "../middleware/auth";
import {createpost,
    uploadimage,
    postByUser,
    userPost,
    updatePost,
    deletePost,
    newsFeed,
    likePost,
    unlikePost,
    addComment,
    removeComment,
    totalPost,
    posts,
    getPost,
} from "../controllers/post"

const router = express.Router();

router.post('/create-post',requireSignin,createpost);
router.post('/upload-image',requireSignin,
formidable({maxFileSize: 5*1024*1024}),
uploadimage);
//post
router.get('/user-posts',requireSignin,postByUser)
router.get('/user-posts/:_id',requireSignin,userPost)
router.put('/update-posts/:_id',requireSignin,canEditDeletePost,updatePost)
router.delete('/delete-posts/:_id',requireSignin,canEditDeletePost,deletePost)
router.put('/post-like',requireSignin,likePost);
router.put('/post-unlike',requireSignin,unlikePost)
router.get('/news-feed/:page',requireSignin,newsFeed);
router.put('/add-comment',requireSignin,addComment);
router.put('/remove-comment',requireSignin,removeComment);
router.get('/total-post',totalPost)
router.get('/posts',posts)
router.get('/posts/:_id',getPost)
//admin acess
router.delete('/admin/delete-posts/:_id',requireSignin,isAdmin,deletePost)
module.exports= router;