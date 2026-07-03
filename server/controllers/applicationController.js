import Application from '../models/Application.js';
import Job from '../models/Job.js';
import emailQueue from '../queues/emailQueue.js';

// ── Keyword extractor ─────────────────────────
const extractKeywords = (text) => {
    const stopWords = new Set([
        'the', 'and', 'is', 'in', 'at', 'of', 'a', 'an', 'to', 'for',
        'with', 'on', 'are', 'was', 'be', 'this', 'that', 'have', 'it',
        'from', 'or', 'but', 'as', 'by', 'we', 'you', 'your', 'our', 'us'
    ]);

    const words = text.toLowerCase()
        .replace(/[^a-z\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w));

    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);

    return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30)
        .map(([word]) => word);
};

// ── Cosine similarity ─────────────────────────
const cosineSimilarity = (arr1, arr2) => {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const intersection = [...set1].filter(w => set2.has(w));
    if (set1.size === 0 || set2.size === 0) return 0;
    return Math.round(
        (intersection.length / Math.sqrt(set1.size * set2.size)) * 100
    );
};

// ── APPLY TO JOB ─────────────────────────────
const applyJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { coverLetter } = req.body;
        const seekerId = req.user._id;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Resume PDF is required' });
        }

        const existing = await Application.findOne({ jobId, seekerId });
        if (existing) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        // Calculate AI match score
        let matchScore = 0;
        try {
            const jobText = `${job.title} ${job.description} ${job.skills.join(' ')}`;
            const resumeKeywords = extractKeywords(coverLetter);
            const jobKeywords = extractKeywords(jobText);
            matchScore = cosineSimilarity(resumeKeywords, jobKeywords);
            console.log('Match score:', matchScore);
        } catch (scoreErr) {
            console.log('Score calculation failed:', scoreErr.message);
        }

        const application = await Application.create({
            jobId,
            seekerId,
            coverLetter,
            resumeUrl: req.file.path,
            matchScore
        });

        res.status(201).json({
            message: 'Application submitted successfully',
            application
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── GET MY APPLICATIONS (seeker) ─────────────
const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ seekerId: req.user._id })
            .populate('jobId', 'title company location type salaryMin salaryMax')
            .sort({ createdAt: -1 });

        res.status(200).json({ applications });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── GET APPLICANTS FOR A JOB (recruiter) ─────
const getJobApplicants = async (req, res) => {
    try {
        const { jobId } = req.params;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const applicants = await Application.find({ jobId })
            .populate('seekerId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ applicants, job });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── UPDATE APPLICATION STATUS (recruiter) ────
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Applied', 'Reviewed', 'Interview', 'Offered', 'Rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const application = await Application.findById(id)
            .populate('seekerId', 'name email')
            .populate('jobId', 'title company');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        await Application.findByIdAndUpdate(id, { status });

        if (status !== 'Applied') {
            await emailQueue.add({
                toEmail: application.seekerId.email,
                seekerName: application.seekerId.name,
                jobTitle: application.jobId.title,    // ← was application.seekerId.title (wrong)
                company: application.jobId.company,  // ← was application.seekerId.company (wrong)
                status
            });
            console.log('Email job added to queue');
        }

        res.status(200).json({
            message: 'Status updated successfully',
            application: { ...application.toObject(), status }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    applyJob,
    getJobApplicants,
    getMyApplications,
    updateStatus
};