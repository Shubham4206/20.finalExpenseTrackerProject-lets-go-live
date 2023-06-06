const Forgotpassword = require('../model/forgot-password');
const User = require('../model/user');
const Sib = require('sib-api-v3-sdk');
require('dotenv').config();
const uuid = require('uuid');
const bcrypt = require('bcrypt');

exports.forgotPassword = async (req, res) => {
    try {
        const email = req.body.email;

        const user = await User.findOne({where : { email: email }});

        if(user){
            const id = uuid.v4();
          await  user.createForgotpassword({ id :id, active: true })
        
            const client = Sib.ApiClient.instance;

            const apiKey = client.authentications['api-key'];
            apiKey.apiKey = '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';
          
            

            const receivers = [
                {
                    email: 'panthershubhamsingh@gmail.com'
                }
            ]
            const sender = {
                email: 'ishubham803213@gmail.com',
                name: 'Sharpener'
            }
       
        const tranEmailApi = new Sib.TransactionalEmailsApi();

            tranEmailApi
                .sendTransacEmail({
                    sender,
                    to: receivers,
                    subject: 'Please reset your password via this link',
                    
                    htmlContent: `<a href="http://localhost:4000/password/resetpassword/${id}">Reset password</a>`
                         })
                .then((result) => {
                    console.log(result);
                    return res.status(200).json({success: true, message: 'reset password link has been sent to your email'});
                })
                .catch((error) => {
                    console.log('err1',error);
                });
            
        }else {
            
            throw new Error('User doesnt exist');
        }        
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error, sucess: false});
    }
}


exports.resetPassword = async (req, res) => {
    try {
        const id =  req.params.id;
        Forgotpassword.findOne({ where : { id }}).then(forgotpasswordrequest => {
            if(forgotpasswordrequest){
                if(forgotpasswordrequest.active === true) {

                    forgotpasswordrequest.update({ active: false});
                    res.status(200).send(`<html>
                                            <script>
                                                function formsubmitted(e){
                                                    e.preventDefault();
                                                    console.log('called')
                                                }
                                            </script>
                                            <form action="http://localhost:4000/password/updatepassword/${id}" method="get">
                                                <label for="newpassword">Enter New password</label>
                                                <input name="newpassword" type="password" required></input>
                                                <button>reset password</button>
                                            </form>
                                        </html>`
                                        )
                    res.end();
                }
                else {
                    throw new Error('request has expired');
                }
            } else {
                throw new Error('request not found');
            }
        })
        
    } catch (error) {
        console.log(error);
    }
}

exports.updatePassword = (req, res) => {
    try {
        const { newpassword } = req.query;
        const  resetpasswordid  = req.params.id;
        
        Forgotpassword.findOne({ where : { id: resetpasswordid }}).then(resetpasswordrequest => {

            User.findOne({where: { id : resetpasswordrequest.userId}}).then(user => {
                
                if(user) {
                    //encrypt the password

                    const saltRounds = 10;
                    bcrypt.genSalt(saltRounds, function(err, salt) {
                        if(err){
                            console.log(err);
                            throw new Error(err);
                        }
                        bcrypt.hash(newpassword, salt, function(err, hash) {
                            // Store hash in your password DB.
                            if(err){
                                console.log(err);
                                throw new Error(err);
                            }
                            user.update({ password: hash }).then(() => {
                                res.status(201).json({message: 'Successfuly updated the new password'})
                            })
                        });
                    });
                } else{
                    return res.status(404).json({ error: 'No user Exists', success: false})
                }
            })
        })
    } catch(error){
        return res.status(403).json({ error, success: false } )
    }
}

