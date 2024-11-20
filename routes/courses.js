const { Router } = require('express');
const { userMiddleware } = require('../middleware/user');
const { courseModel } = require('../db');
const { purchaseModel } = require('../db');
const courseRouter = Router();

courseRouter.post('/purchase/',userMiddleware, async function(req,res){
    const userId = req.userId;
    const courseId = req.body.courseId;

    if (!userId || !courseId) {
        return res.status(400).json({ msg: "Invalid input" });
    }

    try{
        const alreadyExist = await purchaseModel.findOne({//findOne return either a single doc or null 
            userID : userId,
            courseID : courseId
        })
    
        if(alreadyExist){
            res.json({
                msg : "You have already bought this course"
            })
            return;
        }else{
            //should check that the user has actually paid the price    
            await purchaseModel.create({
                userID : userId,
                courseID : courseId
            })
    
            res.json({
                msg : "Course has been purchased successfully"
            })
            return;
        }
    }catch(e){
        res.status(500).json({
            msg : `some error occurred, ${e}`
        })
    }
})

//returns all the courses
courseRouter.get('/preview',async function(req,res){

    const course = await courseModel.find({});

    res.json({
        courses : course
    })
})

module.exports = {
    courseRouter : courseRouter
}
