import Application from "../models/Application.js";
import Job from "../models/Job.js";

// Seeker Dashboard
const getSeekerDashboard = async (req, res) => {
    try {
        const seekerId = req.user._id;

        // Count application Grouped by status
        const statusCounts = await Application.aggregate([
            { $match: { seekerId } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ])

        const stats = {
            Applied: 0,
            Reviewed: 0,
            Interview: 0,
            Offered: 0,
            Rejected: 0
        };

        statusCounts.forEach(s => {
            stats[s._id] = s.count;
        });

        stats.total = Object.values(stats).reduce((a, b) => a + b, 0);

        const recentApplications = await Application.find({ seekerId })
            .populate('jobId', 'title company location type')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            stats,
            recentApplications
        });
    } catch (error) {
        res.status(500).json(
            {
                message: error.message
            }
        )
    }
}

const getRecruiterDashboard = async (req, res) => {
    try {
        const recruiterId = req.user._id;

        // Get all jobs posted by this recruiter
        const jobs = await Job.find({ postedBy: recruiterId });
        const jobIds = jobs.map(j => j._id);

        // Total applicants accross the jobs
        const totalApplicants = await Application.countDocuments({
            jobId: {
                $in: jobIds
            }
        });

        // Count by status
        const statusCounts = await Application.aggregate([
            {
                $match: {
                    jobId: {
                        $in: jobIds
                    }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: {
                        $sum: 1
                    }
                }
            }
        ]);

        const stats = {
            activeJobs: jobs.length,
            totalApplicants,
            interviews: 0,
            offers: 0,
        };

        statusCounts.forEach(s => {
            if (s._id === 'Interview') stats.interviews = s.count;
            if (s._id === 'Offered') stats.offers = s.count;
        });

        // Applicants per job - bar chart
        const applicantsPerJob = await Application.aggregate([
            {
                $match: {
                    jobId: { $in: jobIds }
                }
            },
            {
                $group: {
                    _id: '$jobId',
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $lookup: {
                    from: 'jobs',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'job'
                }
            },
            { $unwind: '$job' },
            {
                $project: {
                    jobTitle: '$job.title',
                    company: '$job.company',
                    count: 1
                }
            },
            {
                $sort: {
                    count: -1
                }
            },
            { $limit: 5 }
        ]);

        const recentApplicants = await Application.find({ jobId: { $in: jobIds } })
            .populate('jobId', 'title company')
            .populate('seekerId', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json(
            {
                stats,
                applicantsPerJob,
                recentApplicants
            }
        );

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export {
    getSeekerDashboard,
    getRecruiterDashboard
}