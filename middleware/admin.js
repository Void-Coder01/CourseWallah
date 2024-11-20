require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET;

function adminMiddleware(req,res,next){
    const token = req.headers.token;

    const decodedInfo = jwt.verify(token,JWT_ADMIN_SECRET);

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
    adminMiddleware : adminMiddleware
}