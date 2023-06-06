const User = require('../model/user');
const Premiumuser = require('../model/premiumuser');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const Razorpay=require('razorpay');

exports.adduser =  async(req, res, next) => {
    

      const { name, email, password } = req.body;
        if(name.length > 0 && email.length > 0 && password.length > 0) {
            const saltRounds=10;
            bcrypt.hash(password, saltRounds, async(error, hash)=> {
  try{

      await User.create({
          name: name,
          email: email,
          password: hash
        })
        
        res.status(200).json({ success: true, message: 'new user created' });
    }catch (err) {
        console.log(err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, message: 'user already exists' });
        };
        
            res.status(500).json({ success: false, message: 'something went wrong' });
        
    }; 
    });
}  else{
    res.status(500).json({success:false,message:'bad Parameters'})
}  
   
    }

exports.logUser = async (req, res, next) => {
    const { email, password } = req.body;

    if (email.length > 0 && password.length > 0) {
        try {

            let users = await User.findAll({ where: { email: email } })
            
            const user = users[0];
        
            if (!user) {
                return res.status(404).json({ success: false, message: 'user does not exist' });
            }

            bcrypt.compare(password, user.password,  (error, result)=> {
                if (error) {
                    console.log(error);
                    return res.status(501).json({ success: false, message: 'something went wrong' });
                }
                if (result == true) {
                    const token = jwt.sign({ userId: user.id, name: user.name }, '999ensjsdnsjen483ndsm384eme');
                    res.status(200).json({
                        success: true,
                        message: 'user found',
                        token: token
                    });
                } else {
                    res.status(401).json({ success: false, message: 'password is incorrect' });
                }
            });

        }
        catch (err) {
            console.log(err);
            res.status(500).json({ success: false, message: 'new err '});
        };
    } else {
        res.status(400).json({ success: false, message: 'bad parameters' });
    }
};

exports.premiumUser=async(req,res,next)=>{
    try{
    let instance=new Razorpay({
        key_id:'rzp_test_ijQHFtvgEemHw9',
        key_secret:'sS4cGcAVORlXrJgjvBMAhPVq'
    });


let order = await instance.orders.create({
    amount: 100,
    currency: "INR"
  });

  await req.user.createPremiumuser({orderId: order.id, status: 'PENDING'});
    
  res.status(201).json({
      success: true,
      order, 
      key_id : instance.key_id,
      orderStatus: 'pending',
      message: 'order is created'
  });  

} catch (error) {
  console.log('auth2',error);
  res.status(500).json({success: false, error: error});
}  
};

exports.updatepremiumUser=async(req,res,next)=>{
    const{order_id,payment_id}=req.body;
    try{
       let premiumuser= await Premiumuser.findOne({where:{orderId:order_id}});
      await premiumuser.update({paymentId:payment_id,status:"Successful"})
    await req.user.update({isPremiumUser:true});
    res.status(202).json({success: true, message: 'transaction successful'});
    }
    catch(err){
        console.log(err);
        res.status(403).json({success:false,message:err});
    }
}

exports.checkMembership = (req, res) => {
    if(req.user.isPremiumUser === true) {
        res.status(200).json({message: 'user has Premium Membership'});
    } else {
        res.status(202).json({message: 'user does not have Premium Membership'});
    }
}

