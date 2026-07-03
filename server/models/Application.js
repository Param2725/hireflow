import { Schema, mongoose } from "mongoose";

const applicationSchema = new Schema({
    jobId: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    seekerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coverLetter: {
        type: String,
        required: [true, 'Cover Letter is required']
    },
    resumeUrl: {
        type: String,
        required: [true, 'Resume Url is required']
    },
    status: {
        type: String,
        enum: ['Applied', 'Reviewed', 'Interview', 'Offered', 'Rejected'],
        default: 'Applied'
    },
    emailSent: {
        type: Boolean,
        default: false,
    },
    matchScore: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

applicationSchema.index(
    {
        jobId: 1,
        seekerId: 1
    },
    {
        unique: true
    }
);

applicationSchema.index(
    {
        status: 1,
        createdAt: -1
    }
);

const Application = mongoose.model('Application', applicationSchema);

export default Application;