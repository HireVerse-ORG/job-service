import mongoose, { Document, Schema } from 'mongoose';

export enum JobApplicationStatus {
  PENDING = 'pending',
  APPLIED = 'applied',
  FAILED = 'failed',
  IN_REVIEW = 'in-review',
  SHORTLISTED = 'shortlisted',
  INTERVIEW = 'interview',
  OFFERED = 'offered',
  HIRED = 'hired',
  DECLINED = 'declined',
  WITHDRAWN = 'withdrawn',
}

export interface IJobApplication extends Document {
  id: string;
  userId: string;
  companyProfileId: string;
  jobId: string;
  jobRole: string;
  fullName: string;
  email: string;
  phone?: string;
  coverLetter?: string;
  resume: string;
  offerLetter?: string; 
  status: JobApplicationStatus;
  failedReason: string | null; 
  declinedReason: string | null;
  comment: {
    text: string,
    date: Date,
  }, 
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema: Schema = new Schema(
  {
    userId: { type: String, required: true }, 
    companyProfileId: { type: String, required: true }, 
    jobId: { type: String, required: true }, 
    jobRole: { type: String, required: true }, 
    fullName: { type: String, required: true }, 
    email: { type: String, required: true }, 
    phone: { type: String }, 
    coverLetter: { type: String },
    resume: { type: String, required: true }, 
    offerLetter: { type: String }, 
    status: {
      type: String,
      enum: Object.values(JobApplicationStatus),
      default: JobApplicationStatus.PENDING,
    }, 
    failedReason: { type: String, default: null }, 
    declinedReason: { type: String, default: null }, 
    comment: {
      type: {
        text: { type: String },
        date: { type: Date, default: Date.now },
      },
      default: null,
    }    
  },
  {
    timestamps: true, 
  }
);

JobApplicationSchema.virtual('id').get(function () {
  return this._id;
});

JobApplicationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const JobApplication = mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);

export default JobApplication;
