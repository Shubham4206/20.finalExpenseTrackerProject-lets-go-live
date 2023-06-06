const Expense=require('../model/expense');
const User=require('../model/user'); 
const Download=require('../model/download'); 
//const { Op } = require('sequelize');
const sequelize = require('../util/database');
const AWS=require('aws-sdk');

exports.addExpense=async(req,res,next)=>{
    const{amount,description,category}=req.body;
    if(amount.length>0 && description.length>0 && category.length>0){
        try{
            const t=await sequelize.transaction();
        const totalexpense=Number(req.user.totalExpense)+Number(amount);
        await User.update({totalExpense:totalexpense},
            {where:{id:req.user.id}},
            {transaction:t});
      let data = await  req.user.createExpense({
                amount:amount,
                description:description,
                category:category
            },
            {transaction:t} );
           // console.log(data);
          await t.commit();
         res.status(200).json(data);
        
    } catch (error) {
        t.rollback();
        res.status(500).json({success: false, message: error});
    }
    }
}

exports.getExpense=async(req,res,next)=>{
   /* try{
        let data= await req.user.getExpenses();
        res.status(200).json(data);
    }catch(err){
        res.status(500).json({success:false,message:err});
    }*/


    const page = Number(req.query.page);
    console.log('>>>>>><<<<<<<',page)
    let totalItems;
    let lastPage;

    const ITEMS_PER_PAGE = +req.header('rows');
    console.log('items per page------> ', ITEMS_PER_PAGE)
    
    req.user.getExpenses({
        offset: (page - 1)*(ITEMS_PER_PAGE), 
        limit: ITEMS_PER_PAGE
      })
    // Expense.findAll()
        .then(async (limitedExpenses) => {
            // res.status(200).json(limitedExpenses);
            console.log('limited expenses----->', limitedExpenses);
            totalItems = await Expense.count({where: {userId: req.user.id}});

            lastPage = Math.ceil(totalItems / ITEMS_PER_PAGE);
            if(lastPage === 0) {
                lastPage = 1;
            }

            res.status(200).json({
                expenses: limitedExpenses,
                totalExpenses: totalItems,
                currentPage: page,
                hasNextPage: (page*ITEMS_PER_PAGE) < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: lastPage
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({success: false, message: err});
        });


}

exports.deleteExpense=async(req,res,next)=>{
    const t=await sequelize.transaction();
    const uid=req.params.id;
    const amount=req.params.amount;
    const totalexpense=Number(req.user.totalExpense)-Number(amount);
    await Expense.destroy({
        where:{
         id:uid
        }
        
    },{transaction:t});
    await User.update({totalExpense:totalexpense},
        {where:{id:req.user.id}},
        {transaction:t});
    res.sendStatus(200);

}

exports.getLeaderboard=async(req,res,next)=>{
    if(req.user.isPremiumUser === true) {
        try{
         let user=await User.findAll({
            attributes:['id','name','totalExpense']
         });
            user.sort((a,b)=>b.totalExpense-a.totalExpense);
                    res.status(200).json(user);
                } catch (error) {
                    throw new Error(error);
                }
    } else {
        res.status(403).json({success: false, message: 'user does not premium membership'});
    }

};


exports.downloadExpense = async (req, res) => {
    if(req.user.isPremiumUser) {
        try {
            const expenses = await req.user.getExpenses();
            console.log(expenses);
                                                //  file name  //                           //  data    //
            const fileUrl = await uploadToS3(`${req.user.id}_${new Date()}_expenses.csv`, JSON.stringify(expenses));

            // console.log('fileUrl>>>>>', fileUrl);
            await req.user.createDownload({fileUrl: fileUrl, date: new Date()});

            res.status(201).json({fileUrl: fileUrl, success: true});
            
        } catch (error) {
            console.log(error);
            res.status(500).json({error, status: false});
        }

    }else {
        res.status(401).json({success: false, message: 'user does not have Premium Membership'});
    }
}

function uploadToS3(fileName, data) {
    const s3 = new AWS.S3({
        accessKeyId: '',
        secretAccessKey: ''
    });

    const params = {
        Bucket: 'expensetrackin', // pass your bucket name
        Key: fileName, // file will be saved as expense-tracker-archie/<fileName>
        Body: data,
        ACL: 'public-read'
    };

    return new Promise((resolve, reject) => {

        s3.upload(params, (Err, response) => {
            if (Err){
                reject(Err);
            } else {
                // console.log(`File uploaded successfully at ${response.Location}`);
                resolve(response.Location);
            }
        });
    })
}