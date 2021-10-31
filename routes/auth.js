import  express  from "express";
import {
    register,
    login, 
    currentUser,
    forgotPassword,
    profileUpdate,
    findPeople,
    addFollower,
    userFollow,
    userFollowing,
    removeFollower,
    userUnfollow,
    searchUser ,
    getUser,
    verifyEmail,
    MiddleVerifyEmail,
    passwordRest

}  
from "../controllers/auth"

//middleware
import {requireSignin,isAdmin} from "../middleware/auth";

const router = express.Router();

router.post('/register',register);
router.get('/verify-email',verifyEmail);
router.post('/login',MiddleVerifyEmail,login);
router.get('/current-user',requireSignin, currentUser);
router.post('/password-rest',passwordRest);
router.post('/forgot-password/:resttoken/:userId',forgotPassword);

router.put('/update-profile',requireSignin,profileUpdate);
router.get('/find-users',requireSignin,findPeople);
router.put('/user-follow',requireSignin,addFollower,userFollow);
router.put('/user-unfollow',requireSignin,removeFollower,userUnfollow);
router.get('/user-following',requireSignin,userFollowing);
router.get('/search-user/:query', searchUser)
router.get('/user/:username',getUser)

router.get('/current-admin',requireSignin,isAdmin,currentUser);
module.exports= router;