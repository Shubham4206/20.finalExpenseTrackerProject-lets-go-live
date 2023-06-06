const express=require('express');
const router=express.Router();

const passwordcontroller=require('../controller/password');


router.post('/forgotpassword',passwordcontroller.forgotPassword);

router.get('/resetpassword/:id', passwordcontroller.resetPassword);

router.get('/updatepassword/:id', passwordcontroller.updatePassword);






module.exports=router;