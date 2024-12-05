require('dotenv').config();
const { Router } = require('express');
const JWT_USER_SECRET = process.env.JWT_USER_SECRET;
const userRouter = Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const z = require('zod');
const { userModel } = require('../db.js')
const { userMiddleware } = require('../middleware/user.js')
const { purchaseModel, courseModel } = require('../db.js');

userRouter.post('/signup',async function(req,res){
    const inputValidation = z.object({
        firstName : z.string().min(2).max(20),
        lastName : z.string().min(2).max(20),
        password : z.string().min(8).max(30)
                    .regex(/[A-Z]/).regex(/[a-z]/).regex(/\d/).regex(/[^A-Za-z0-9]/),

        email : z.string().email()
    })

    const isValid = inputValidation.safeParse(req.body);
    if(!isValid.success){
        res.send("Incorrect format");
        return;
    }


   const { firstName, lastName, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password,5);

    try{
        await userModel.create({
            firstName : firstName,
            lastName : lastName,
            email : email,
            password : hashedPassword
        })
    }catch{
        res.send("user already exists");
        return;
    }


    res.send("You are signed up");
})

userRouter.post('/signin',async function(req,res){
    try{
        const email  = req.body.email;
        const password = req.body.password;

        const user = await userModel.findOne({
            email : email,
        })

        const isPassword = await bcrypt.compare(password,user.password);

        if(!user || !isPassword){
            res.send("Credentials don't match");
            return;
        }

        const token = jwt.sign({
            id : user._id
        },JWT_USER_SECRET); 

        res.json({
            token : token
        })
   }catch(error){
        res.status(500).json({
            msg:"signed-in failed",error : error.message
        });
   }

})

userRouter.get('/purchases',userMiddleware,async function(req,res){
    const userId = req.userId;

    const purchases = await purchaseModel.find({
        userID : userId
    })

    const courseData = await courseModel.find({
        _id : { $in : purchases.map(x => x.courseID)}
    })

    res.json({
        msg : "here is your courses",
        purchases : purchases,
        courses : courseData
    })
})

module.exports = {
    userRouter : userRouter
}