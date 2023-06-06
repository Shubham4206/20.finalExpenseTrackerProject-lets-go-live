const express=require('express');
const app=express();
const bodyparser=require('body-parser');
const cors=require('cors');
const helmet=require('helmet');
const compression=require('compression');
const fs=require('fs');
const morgan=require('morgan');

const dotenv = require('dotenv');
dotenv.config();

const sequelize=require('./util/database.js');



const User=require('./model/user');
const Expense=require('./model/expense');
const Premiumuser = require('./model/premiumuser');
const Forgotpassword = require('./model/forgot-password');
const Download = require('./model/download');




User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Premiumuser);
Premiumuser.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

User.hasMany(Download);
Download.belongsTo(User);



const userroute=require('./routes/user');
const expenseroute=require('./routes/expense');
const passwordroute=require('./routes/password');

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    {flags: 'a'}
);

app.use(helmet());
app.use(compression());
app.use(morgam('combined',{stream: accessLogStream}));
app.use(bodyparser.urlencoded());
app.use(bodyparser.json());
app.use(cors());


app.use('/user',userroute);
app.use('/expense',expenseroute);
app.use('/password',passwordroute);













sequelize.sync();
app.listen(4000);











