import mongoose, { Document, Schema } from 'mongoose';

export enum JobStatus {
  PENDING = 'pending',
  FAILED = 'failed',
  LIVE = 'live',
  CLOSED = 'closed',
}

export interface IJob extends Document {
  id: string;
  title: string;
  employmentTypes: string[];
  salaryRange: number[] | null;
  categories: string[];
  skills: string[];
  status: JobStatus; 
  description: string;
  responsibilities: string;
  whoYouAre: string;
  niceToHaves: string;
  companyProfileId: string;
  userId: string;
  failedReson: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    employmentTypes: {
      type: [String],
      required: true,
    },
    salaryRange: {
      type: [Number],
      default: null,
    },
    categories: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'JobCategory', 
      required: true,
    },
    skills: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Skill', 
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.PENDING,
    },
    description: {
      type: String,
      required: true,
    },
    responsibilities: {
      type: String,
    },
    whoYouAre: {
      type: String,
    },
    niceToHaves: {
      type: String,
    },
    companyProfileId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    isClosed: {
      type: Boolean,
      default: false
    },
    failedReson: {
      type: String,
      default: null
    },
  },
  {
    timestamps: true,
  }
);

JobSchema.virtual('id').get(function () {
  return this._id;
});

JobSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Job = mongoose.model<IJob>('Job', JobSchema);

export default Job;
