import mongoose, { Schema } from 'mongoose';
import User from './User.js';

const jobSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    company: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['full-time', 'part-time', 'remote', 'hybrid', 'internship'],
        required: [true, 'Job type is required']
    },
    salaryMin: {
        type: Number,
        required: [true, 'Minimum salary is required']
    },
    salaryMax: {
        type: Number,
        required: [true, 'Maximum salary is required']
    },
    skills: {
        type: [String],
        required: [true, 'Atleast one skill is required']
    },
    description: {
        type: String,
        required: [true, 'Job description is required']
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: User,
        required: true
    }
}, { timestamps: true });

jobSchema.index({
    title: 'text',
    description: 'text',
    skills: 'text'
});

jobSchema.index({
    postedBy: 1,
    createdAt: -1
});

const Job = mongoose.model('Job', jobSchema);

export default Job;