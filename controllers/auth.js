
import User from '../models/user'
import { hashPassword,comparePassword } from '../helpers/auth'
import jwt from 'jsonwebtoken';
import {nanoid} from 'nanoid';
import Crypto from 'crypto';
import nodemailer from 'nodemailer';
import Token from '../models/token';

const { ObjectID } = require('mongodb');


//mailsenderdetails
let transporter = nodemailer.createTransport({
  service:'gmail',
  auth: {
      user:process.env.MAILID,
      pass:process.env.PASSWORD,
  },
  tls:{
      rejectUnauthorized:false,
  }
})

export const register =async(req, res)=>{
    // console.log("your registered",req.body);
    const {name,email,password,secret} = req.body;
    //validation
    if(!name){ 
    return res.json({
        error:"Name Is Required"

    })
  }

    if(!password || password.length< 6) 
    {
      return res.json({error:"Pasword length must be above 6 characters"})
    }
     

    if(!secret) 
    {
      return res.json({error:"answer is required"})
    }
     
    
    const existing = await User.findOne({email});
     if (existing) 
     {
        return res.json({error:"email is already in use"})
     }
     
   //hash pwd
    const hashPwd = await hashPassword(password);

    const user = new User({
      name, 
      email, 
      password: hashPwd ,
       secret, 
       username:nanoid(6),
       emailToken:Crypto.randomBytes(64).toString('hex'),
        isVerified:false
       
    });
    try{
      await user.save();
      // console.log("sucessful", user);
      let mailOptions={
        from:' "The BlogBuckets" <process.env.MAILID>',
        to: user.email,
        subject:'The BlogBuckets - Verify your mail',
        html:`<h2>${user.name}! Thank you for registering on our site</h2>
            <h4>please verify your mail to continue..</h4>
            <a href="https://blog-server12.herokuapp.com/api/verify-email?token=${user.emailToken}">Verify your mail</a>`
    }
    //sendingmail
    transporter.sendMail(mailOptions,function(error,info){
        if(error){
            console.log("error at sendmail",error)
        }else{
        console.log("verification mail as been sent to your email")
        }
    })
      return res.json({
          ok: true,
      })
    }catch(err){
       console.log("register failed",err);
       {
         return res.json({error:"error,try again"})
       }
       
    }
};

//verifyingemail
export const verifyEmail= async (req, res)=>{
  //
  try{
    const token = req.query.token;
    const user = await User.findOne({ emailToken:token });
    if(user){
        user.emailToken= null,
        user.isVerified= true,
        await user.save()
        // res.json({error:"email is verified"})
        res.redirect('https://abdul-blogger-app.netlify.app/login')
       

    }else{
        res.json({error:"email is not verified"})
        // res.redirect('http://localhost:3000/register')
        
    }
   
}
  catch(err){
    
      console.log(err);

  }
}

//middleware verifyEmail
export const MiddleVerifyEmail= async (req, res,next)=>{
//
    try{
      const user = await User.findOne({ email:req.body.email})
      if(user.isVerified){
          next();
      }else{
          res.json({
              error:"Please cheack your mail to activate your account"
          });
      }
    }catch(err){
      console.log(err)
    }
}

//giving jwt token to the user to access the page.
export const login = async (req, res)=>{
try{
    // console.log(req.body);
    //check if the user with that email 
    const {email , password}= req.body;
    const user = await User.findOne({ email })
    if(!user)  
    {
      return res.json({error:"No user Found"})
    }
    //check password
    const match = await comparePassword(password, user.password)
    if(!match) 
    {
      return res.json({error:"Wrong password"})
    }
    //using jwt singin token
    const token = jwt.sign({_id: user.id},process.env.JWT_SECRET,{
      expiresIn: "7d", //20sec for test
    });
    //to not send the password and secret to the front end after login
    user.password = undefined;
    user.secret = undefined;

    res.json({
      token,
      user,
    })

}catch(err){
    console.error(err);
    {
      return res.json({error:"error,try again"})
    }
}
};


//to secure the dashboard using post man - jwt stored locally - to refusethe access in another tab 
export const currentUser =async(req,res) =>{
try{
    const user = await User.findOne(req.user_id);
    // res.json(user);
    res.json({ok: true})
}catch(err){
  console.log(err);
  res.sendStatus(400);
}
};

//password rest verificataion
export const passwordRest =async (req, res)=>{

  try{
  //
  const{email} = req.body;

  const user = await User.findOne({email})
  if(!user){
    return res.json({
      error: 'user not found with this mail',
    })
  }

  let token = await Token.findOne({userId: user._id})
  
        if (!token) {
          token = await new Token({
              userId: user._id,
              resttoken: Crypto.randomBytes(32).toString("hex"),
          })
          
        }else{
            await token.deleteOne();
            token = await new Token({
              userId: user._id,
              resttoken: Crypto.randomBytes(32).toString("hex"),
          })
        }
   await token.save();
    let mailOptions={
      from:'"The BlogBuckets-ForgotPassword Link"',
      to: user.email,
      subject:'The BlogBuckets - Password rest link',
      html:`<h2>${user.name}! This your one time password-rest link</h2>
          <h4>please click on the link to rest your password..</h4>
          <a href="https://abdul-blogger-app.netlify.app/forgot-password/${token.resttoken}/${user._id}">Password rest link</a>`
  }
  //sendingmail
  transporter.sendMail(mailOptions,function(error,info){
      if(error){
          console.log("error at sendmail",error)
      }else{
      console.log("password rest link as been sent to your email")
      res.json({
        sucess:"password rest link as been sent to your email"
      })
      }
  })
  res.json({
    success:"password rest link as been sent to your email",
    ok: true
  })
  }catch(err){
    console.log("mail error",error)
    res.json({
      error:"Try again!"
    })
  }
}

//forgotpassword

export const forgotPassword = async(req, res)=>{ 
    // console.log(req.body);
    const verifyuser = await User.findById(req.params.userId);
       if (!verifyuser) return res.json({
         error:"invalid link "
        });

        const token = await Token.findOne({
          userId: verifyuser._id,
          token: req.params.token,
      });
      if (!token) return  res.json({
        error:"invalid link or expired"
       });


  const {email, newpassword} = req.body;
  // validation
  if(!newpassword || newpassword <= 6){
    return res.json({
      error: 'Invalid new password enter more than 6 characters'
    })
  }
  
  const user = await User.findOne({email});
  if(!user){
   return res.json({
      error: 'user not found',
    })
  }
  try{
    const hashed = await hashPassword(newpassword);
    await User.findByIdAndUpdate(user._id, {password: hashed});
    await token.delete();
    res.json({
      success: "Password has been Updated.",
    })
  }catch(err){
    console.log(err);
    return res.json({
        error: 'Something went wrong,Try Again!'
      })
    
  }
}


export const profileUpdate = async (req,res) => {
  // console.log("profile update",req.body);
  try{
    // console.log("profile update",req.body);
    const data = {};
    if(req.body.username){
      data.username = req.body.username;
    }
    if(req.body.about){
      data.about = req.body.about;
    }
    if(req.body.name){
      data.name = req.body.name;
    }
    if(req.body.password){
      // data.password = req.body.password;
      if(req.body.password.length < 6){
        return res.json({
          error:"password is required and should be 6 characters long "
        })
      }else{
        data.password = await hashPassword(req.body.password) ;
      }
    }
    if(req.body.secret){
      data.secret = req.body.secret;
    }

    if(req.body.image){
      data.image = req.body.image; 
    }
    let user = await User.findByIdAndUpdate(req.user._id, data, {new:true});
    //weshould send pass and secert to client
    user.password = undefined;
    user.secret= undefined;
    res.json(user);
  }catch(err){
    if(err.code == 11000){
      return res.json({error:"Username Already taken!"});
    }
    console.log(err);
  }
}

//to make suggestuion list
export const findPeople = async (req, res)=>{
  try{
    const user = await User.findById(req.user._id);
    //user following
    let following = user.following;
    following.push(user._id);
    //nin = not included
    const people = await User.find({_id: {$nin: following}}).select('-password -secret').limit(10); 
    res.json(people);
  }catch(err){
    console.log(err);
  }
}


//middleware
// addFollower,userFollow
export const addFollower = async (req, res,next)=>{
  try{
    //req.body_id is geting the id from user displayed in front by clicking follow
    //we get the body  link  instead of user
    const user = await User.findByIdAndUpdate(req.body._id,{
      $addToSet : {followers: req.user._id}
    });
    next();
  }catch(err){ //
    console.log(err);
  }
}

export const userFollow = async (req, res)=>{
  try{
    const user = await User.findByIdAndUpdate(req.user._id,{
      $addToSet : {following: req.body._id},
     
    }, 
    {new:true}).select('-password -secret');
    res.json(user)
  }catch(err){ 
    console.log(err);
  }
}

export const userFollowing = async (req, res)=>{
  try{

    const user = await User.findById(req.user._id);
    const following = await User.find({_id: user.following}).limit(100);
    res.json(following);

  }catch(err){ 

      console.log(err);
  }
}

//removeFollower,userUnfollow

export const removeFollower = async (req, res,next)=>{
  try{
const user = await User.findByIdAndUpdate(req.body._id,{
  $pull:{followers:req.user._id},
});
next();
  }catch(err){ 
    console.log(err);
  }
}

export const userUnfollow = async (req, res)=>{
  try{
    const user = await User.findByIdAndUpdate(req.user._id,{
      $pull:{following:req.body._id},
    },
    {new:true}
    );
    res.json(user);
  }catch(err){ 
    console.log(err);
  }
}

export const searchUser = async (req, res)=>{
  const {query} = req.params;
  if(!query) return;
  try{
    //regex is special method in mongodb and i is for case sesitive

    const user = await User.find({
      $or:[
        {name:{$regex:query, $options:'i'}},
        {username:{$regex:query, $options:'i'}}
      ]
    }).select('-password -secret');

 res.json(user);
  }catch(err){ 
    console.log(err);
  }
}
export const getUser= async (req, res)=>{
  try{
    const user = await User.findOne({username: req.params.username}).select('-password -secret -email');
    res.json(user);
  }catch(err){
    console.log(err);
  }
}

