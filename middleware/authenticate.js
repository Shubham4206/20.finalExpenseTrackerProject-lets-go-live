const User=require('../model/user');
const jwt=require('jsonwebtoken');


exports.authentication=async(req,res,next)=>{
     const token= req.header('Authorization');
     const users=jwt.verify(token,'999ensjsdnsjen483ndsm384eme');
     try{
        let user=await User.findByPk(users.userId);
        req.user=user;
        next();
     }catch(err){
        console.log('auth',err);
     }
}