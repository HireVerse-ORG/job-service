import mongoose, { Document, Schema } from 'mongoose';

export interface IJobCategory extends Document {
  id: string;  
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobCategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, 
  }
);

JobCategorySchema.virtual('id').get(function () {
  return this._id;
});

JobCategorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,  
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const JobCategory = mongoose.model<IJobCategory>('JobCategory', JobCategorySchema);

export default JobCategory;
