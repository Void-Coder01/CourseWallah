require('dotenv').config();
const { Router } = require('express');
const { adminModel } = require('../db.js')
const { z } = require('zod');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { adminMiddleware } = require('../middleware/admin.js')
const { courseModel } = require('../db.js');


const adminRouter = Router();

adminRouter.post('/signup',async function(req,res){
    const inputValidation = z.object({
        firstName : z.string().min(5).max(20),
        lastName : z.string().min(5).max(20),
        password : z.string().min(8).max(30)
                    .regex(/[A-Z]/).regex(/[a-z]/).regex(/\d/).regex(/[^A-Za-z0-9]/),

        email : z.string().email()
    })

    const isValid = inputValidation.safeParse(req.body);
    if(!isValid.success){
        res.send("Incorrect format");
        return;
    }


   const { firstName, lastName, email, password} = req.body;

    const hashedPassword = await bcrypt.hash(password,5);

    try{
        await adminModel.create({
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

adminRouter.post('/signin',async function(req,res){
   try{
        const email  = req.body.email;
        const password = req.body.password;

        const user = await adminModel.findOne({
            email : email,
        })

        const isPassword = await bcrypt.compare(password,user.password);

        if(!user || !isPassword){
            res.send("Credentials don't match");
            return;
        }

        const token = jwt.sign({
            id : user._id
        },process.env.JWT_ADMIN_SECRET); 

        res.json({
            token : token
        })
   }catch(error){
        res.status(500).json({
            msg:"signed-in failed",error : error.message
        });
   }

})

adminRouter.post('/course', adminMiddleware,async function(req,res){
    const userId = req.userId;//userId token k through mil rhi h 

    const { title, description, price, imageURL } = req.body;

    const course = await courseModel.create({
        title ,
        description ,
        price,
        imageURL,
        creatorID : userId
    })
    
    res.json({
        msg : "Course Created successfully",
        //idr course id return kr rhe so that infuture creator apna content changes kr pye through this
        courseId : course._id//yeh autogenerated h
    })
    
})

adminRouter.put('/courses',adminMiddleware, async function(req,res){
        const adminId = req.userId;
        const courseId = req.body.courseId;

        const { title, description, price, imageURL} = req.body;

        const isValid = await courseModel.findOne({
            _id : courseId,
            creatorID :adminId
        })

        if(!isValid){
            return res.status(403).json({
                msg : "Course not found"
            })
        }


        try{
            const course = await courseModel.updateOne({
                //yeh parameters se find krenge
                _id : courseId,
                //this is imp cuz agr same creator & admin id nai hoga toh koi bhi kiska bhi content chnge krpyega
                creatorID:adminId 
            },{
                //if found toh yeh sab changes krnege
                title : title,
                description : description,
                price : price,
                imageURL : imageURL
            })

            if(course.matchedCount === 0){
                return res.status(403).json({
                    msg : "course not found"
                })
            }

            res.json({
                msg : "course updated successfully",
                courseId : course._id
            })
            return 
        }catch(e){
            res.status(404).json({
                msg : "course not found"
            })
            return
        }

})

adminRouter.get('/course/bulk',adminMiddleware, async function(req,res){
    const adminId = req.userId;

    const courses = await courseModel.find({
        creatorID : adminId,
    })  

    res.json({
        courses : courses
    })
})


module.exports = {
    adminRouter : adminRouter
}