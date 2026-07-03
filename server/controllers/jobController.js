import Job from "../models/Job.js";
import redis from '../config/redis.js';

const createJob = async (req, res) => {
    try {
        const { title, company, location, type, salaryMin, salaryMax, skills, description } = req.body;

        const job = await Job.create({
            title,
            company,
            location,
            type,
            salaryMin,
            salaryMax,
            skills,
            description,
            postedBy: req.user._id
        });

        const keys = await redis.keys('jobs:*');
        if (keys.length > 0) {
            await redis.del(...keys);
        }

        res.status(201).json({
            message: 'Job Created Successfully',
            job
        });

    } catch (error) {
        res.status(500)
            .json({
                message: error.message
            })
    }
};

const getAllJobs = async (req, res) => {
    try {
        const { search, type, location, cursor, limit = 10 } = req.query;

        // Building cacheKey from query params
        const cacheKey = `jobs:${JSON.stringify(req.query)}`;

        // check redis cache first
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log('Cache Hit: ', cacheKey);
            return res.status(200).json(
                JSON.parse(cached)
            );
        };

        console.log('Cache Miss: ', cacheKey);

        const query = {};
        if (search) {
            query.$text = { $search: search }
        }
        if (type) {
            query.type = type
        }
        if (location) {
            query.location = location
        }
        if (cursor) {
            query._id = { $lt: cursor }
        }

        const jobs = await Job.find(query)
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        const nextCursor = jobs.length === Number(limit) ? jobs[jobs.length - 1]._id : null;
        const result = { jobs, nextCursor };

        await redis.set(cacheKey, JSON.stringify(result), 'EX', 120);
        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('postedBy', 'name email');

        if (!job) {
            res.status(404).json({
                message: 'Job not found'
            })
        }

        res.status(200).json({
            job
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

const updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({
                message: 'Job not found'
            })
        }

        // Only who posted the job can update
        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Not Authorized to update this'
            })
        }

        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: 'Job Updated Successfully',
            updatedJob
        });

    } catch (error) {
        res.status(500)
            .json({
                message: error.message
            })
    }
};

const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({
                message: 'Job not found'
            })
        }

        // only who posted can delete this
        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You are not authorized to delete this'
            })
        }

        await Job.findByIdAndDelete(req.params.id);

        const keys = await redis.keys('jobs:*');
        if (keys.length > 0) {
            await redis.del(...keys);
        }

        res.status(200).json({
            message: 'Job deleted successfully'
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};


export {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob
};