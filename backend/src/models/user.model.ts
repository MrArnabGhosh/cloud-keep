import mongoose from "mongoose";
import { Schema, Types} from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt";



export interface UserDocument  extends Document{
    _id:Types.ObjectId
    name:string;
    email:string;
    password:string;
    profilePicture:string| null;
    createdAt:Date;
    updaredAt:Date;
    comparePassword(value:string):Promise<boolean>;
    omitPassword():Omit<UserDocument,"password">

}
const UserSchema = new Schema<UserDocument>(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            select: true,
        },
        profilePicture: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    },

);

 UserSchema.pre("save", async function (next){
    if(this.isModified("password")){
        if(this.password){
        this.password = await hashValue(this.password)
        }
    }
    next();
});

UserSchema.methods.comparePassword = async function(value:string){
    return compareValue(value,this.password);
}   

UserSchema.methods.omitPassword = function():Omit<UserDocument, "password" > {
    const userobj=this.toObject();
    delete userobj.password;
    return userobj;
}

const UserModel = mongoose.model<UserDocument>("User", UserSchema);

export default UserModel;