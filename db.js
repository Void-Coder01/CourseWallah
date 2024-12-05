    const mongoose =  require('mongoose');
    const  Schema  = mongoose.Schema;
    const ObjectID = mongoose.Types.ObjectId; 
    require('dotenv').config({path :'./security.env' });

    const userSchema = new Schema({
        firstName : String,
        lastName : String,
        email  : {type : String , unique : true},
        password : String
    })

    const AdminSchema = new Schema({
        firstName : String,
        lastName : String,
        email  : {type : String , unique : true},
        password : String
    })

    const CourseSchema = new Schema({
        title : String,
        description : String,
        price : Number,
        imageURL : String,
        creatorID : ObjectID//kis admin ne yeh course bnaya h 
    })

    const PurchaseSchema = new Schema({
        courseID : ObjectID,//konsa course kharida h
        userID : ObjectID//kis user ne khrida h
    })


    const userModel = mongoose.model("users",userSchema);
    const adminModel = mongoose.model("admins",AdminSchema);
    const courseModel = mongoose.model("courses",CourseSchema);
    const purchaseModel = mongoose.model("purchases",PurchaseSchema);

    module.exports = {
        userModel,
        adminModel,
        courseModel,
        purchaseModel
    }