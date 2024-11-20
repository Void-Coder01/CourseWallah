require('dotenv').config();
const jwt = require('jsonwebtoken');
require('dotenv').config({path : '../security.env'})

function userMiddleware(req,res,next){
    const token = req.headers.token;

    const decodedInfo = jwt.verify(token,process.env.JWT_USER_SECRET);

    if(decodedInfo){
        req.userId = decodedInfo.id;
        next();
    }else{
        res.status(403).json({
            msg : "Not authorized"
        })
    }
}

module.exports = {
    userMiddleware : userMiddleware
}