require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');

const { userRouter } = require('./routes/user.js');
const { courseRouter } = require('./routes/courses.js');
const { adminRouter } = require('./routes/admin.js');

app.use(express.json());
//user's routes

app.use("/api/v1/user",userRouter);//abhi har ek user file m jo route h uske aage /api/v1/user apne app lag jyega
app.use("/api/v1/course",courseRouter);
app.use("/api/v1/admin",adminRouter);




mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(3000,() => {
        console.log("server is running on 3000");
    })
}).catch((e) => {
    console.log("Error occured while connecting to DB \n",e);
    process.exit(1);
}
)