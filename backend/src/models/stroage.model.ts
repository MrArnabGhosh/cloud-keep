import { get } from "http";
import mongoose, { Model, Schema, Types } from "mongoose";
import FileModel from "./file.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { formatBytes } from "../utils/format-bytes";
import { ErrorCodeEnum } from "../enums/error-code.enum";


export const STORAGE_QUOTA=2*1024*1204*1024; //2GB

interface ISstogare{
    userId:Types.ObjectId;
    storageQuota:number;
    createdAt:Date;
    updatedAt:Date;
}

interface StorageMatrics{
    quota:number;
    usage:number;
    remaining:number;
}

interface UploadValidation{
    allowed:boolean;
    newUsage:number;
    remainingAfterUpload:number;
}

interface StorageStatics{
    getStorageMatrics(userId:Types.ObjectId):Promise<StorageMatrics>;
    validateUpload(userId:Types.ObjectId,fileSize:number):Promise<UploadValidation>;
}

interface StorageDocument extends ISstogare , Document{ }

interface StorageModelType extends Model<StorageDocument>, StorageStatics{}

const StorageSchema = new Schema<StorageDocument,StorageModelType>({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    storageQuota:{
        type:Number,
        default:STORAGE_QUOTA,
        min:[0,'Storage quota cannot be negative'],
    },

},{
    timestamps:true,
 },
); 

StorageSchema.statics={
    async getStorageMatrics(userId:Types.ObjectId){
        const storage = await this.findOne({userId}).lean();
       if(!storage) throw new NotFoundException("Storage record not found");
       const usage = await FileModel.calculateUsage(userId);
       return{
        quota:storage.storageQuota,
        usage:usage,
        remaining:storage.storageQuota-usage,
       };
    },
    async validateUpload(userId:Types.ObjectId,totalFileSize:number){
        if(totalFileSize<0) 
            throw new BadRequestException('File Size Must be positive');
        const matrics = await this.getStorageMatrics(userId);
        const hasSpace = matrics.remaining>=totalFileSize;
        if(!hasSpace){
            const shortFall = totalFileSize-matrics.remaining;
            throw new BadRequestException(
                `Insufficient storage. ${formatBytes(shortFall)} needed`,
            ErrorCodeEnum.INSUFFICIENT_STORAGE
            );
        }
        return {
            allowed: true,
            newUsage: matrics.usage + totalFileSize,
            remainingAfterUpload: matrics.remaining - totalFileSize,
       };
    }
};

const StorageModel = mongoose.model<StorageDocument, StorageModelType>(
  'Storage',
  StorageSchema,
);

export default StorageModel;