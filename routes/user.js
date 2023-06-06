const express=require('express');
const router=express.Router();
const usercontroller=require('../controller/user.js');
const authenticate=require('../middleware/authenticate');
router.post('/signup',usercontroller.adduser)
router.post('/login',usercontroller.logUser)
router.post('/purchasepremium',authenticate.authentication,usercontroller.premiumUser)
router.post('/purchasepremium/update-transaction-status',authenticate.authentication,usercontroller.updatepremiumUser)
router.get('/checkmembership',authenticate.authentication,usercontroller.checkMembership)








module.exports=router;