import mongoose, { Document, Schema, Types } from 'mongoose';

export enum InterviewType {
    ONLINE = 'online',
    OFFLINE = 'offline'
}

export enum InterviewStatus {
    SCHEDULED = 'scheduled',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    CANCELED = 'canceled',
    EXPIRED = 'expired',
    COMPLETED = 'completed'
}

export interface IInterview extends Document {
    job: Types.ObjectId | string;
    application: Types.ObjectId | string;
    applicantId: string;
    interviewerId: string;
    scheduledTime: Date;
    type: InterviewType;
    status: InterviewStatus;
    description?: string;
}

const InterviewSchema: Schema = new Schema<IInterview>(
    {
        job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
        application: { type: Schema.Types.ObjectId, ref: "JobApplication", required: true },
        applicantId: { type: String, required: true },
        interviewerId: { type: String, required: true },
        scheduledTime: { type: Date, required: true },
        type: {
            type: String,
            enum: Object.values(InterviewType),
            required: true
        },
        status: {
            type: String,
            enum: Object.values(InterviewStatus),
            default: InterviewStatus.SCHEDULED
        },
        description: { type: String, trim: true }
    }
);

InterviewSchema.virtual('id').get(function () {
    return this._id;
});

InterviewSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    },
});

const Interview = mongoose.model<IInterview>('Interview', InterviewSchema);

export default Interview;
