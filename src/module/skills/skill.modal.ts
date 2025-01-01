import mongoose, { Document, Schema } from 'mongoose';

export interface ISkill extends Document {
  id: string;  
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema: Schema = new Schema(
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

SkillSchema.virtual('id').get(function () {
  return this._id;
});

SkillSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,  
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Skill = mongoose.model<ISkill>('Skill', SkillSchema);

export default Skill;
