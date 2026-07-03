/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ApplyModal from '../components/ApplyModel';

const formatSalary = (min, max) => {
    const fmt = (n) => n >= 100000
        ? `₹${(n / 100000).toFixed(0)}L`
        : `₹${n.toLocaleString()}`;
    return `${fmt(min)} – ${fmt(max)} / year`;
};

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function JobDetail() {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchJob();
        checkIfApplied();
    }, [id]);

    const fetchJob = async () => {
        setLoading(true);
        try {
            const res = await API.get(`/jobs/${id}`);
            setJob(res.data.job);
        } catch (err) {
            setError('Job not found or has been removed.');
        } finally {
            setLoading(false);
        }
    };

    const checkIfApplied = async () => {
        if (!user || user.role !== 'seeker') return;
        try {
            const res = await API.get('/applications/mine');
            const applied = res.data.applications.some(
                (app) => String(app.jobId?._id) === String(id)
            );
            setHasApplied(applied);
        } catch (err) {
            console.log('check failed:', err.message);
        }
    };

    // Check if this recruiter posted this job
    const isJobPoster = user?.role === 'recruiter' &&
        job?.postedBy &&
        String(job.postedBy._id) === String(user.id);

    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col">

            {/* ── HEADER ── */}
            <header className="bg-surface-container-lowest sticky top-0 z-50 border-b border-outline-variant shadow-sm w-full">
                <nav className="flex justify-between items-center w-full px-md lg:px-lg max-w-[1280px] mx-auto h-16">
                    <div className="flex items-center gap-xl">
                        <Link to="/" className="text-headline-md font-bold text-primary">HireFlow</Link>
                        <nav className="hidden md:flex gap-md items-center h-full">
                            <Link to="/jobs" className="text-secondary font-semibold border-b-2 border-secondary pb-1 text-body-md">
                                Find Jobs
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-sm">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="hidden sm:inline-flex px-md py-xs text-on-surface-variant hover:text-secondary text-body-sm">
                                    Dashboard
                                </Link>
                                {user.role === 'recruiter' && (
                                    <Link to="/post-job" className="bg-primary text-on-primary px-md py-base rounded-lg text-body-sm hover:opacity-90 transition-all">
                                        Post a Job
                                    </Link>
                                )}
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="hidden sm:inline-flex px-md py-xs text-on-surface-variant hover:text-secondary text-body-sm">
                                    Sign In
                                </Link>
                                <Link to="/register" className="bg-primary text-on-primary px-md py-base rounded-lg text-body-sm hover:opacity-90 transition-all">
                                    Post a Job
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            {/* ── MAIN ── */}
            <main className="flex-grow w-full max-w-[1280px] mx-auto px-md lg:px-lg py-lg">

                {loading && (
                    <div className="flex justify-center items-center py-xl">
                        <span className="material-symbols-outlined animate-spin text-secondary text-[40px]">
                            progress_activity
                        </span>
                    </div>
                )}

                {!loading && error && (
                    <div className="text-center py-xl">
                        <span className="material-symbols-outlined text-[64px] text-outline-variant">error</span>
                        <p className="text-headline-sm text-on-surface-variant mt-md">{error}</p>
                        <button
                            onClick={() => navigate('/jobs')}
                            className="mt-md bg-secondary text-on-secondary px-lg py-sm rounded-lg text-label-md hover:opacity-90"
                        >
                            Back to Jobs
                        </button>
                    </div>
                )}

                {!loading && job && (
                    <>
                        <nav className="flex items-center gap-xs mb-md text-on-surface-variant">
                            <Link to="/jobs" className="hover:text-secondary transition-colors text-label-md">Jobs</Link>
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                            <span className="text-label-md text-primary">{job.title}</span>
                        </nav>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">

                            {/* Left column */}
                            <div className="lg:col-span-8">
                                <div className="bg-surface-container-lowest rounded-xl p-md lg:p-lg border border-outline-variant shadow-sm">
                                    <div className="mb-lg border-b border-surface-container pb-lg">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-md">
                                            <div>
                                                <h1 className="text-headline-xl text-primary mb-xs">{job.title}</h1>
                                                <div className="flex items-center gap-sm">
                                                    <span className="text-secondary font-semibold text-headline-sm">{job.company}</span>
                                                    <span className="text-on-surface-variant">•</span>
                                                    <span className="text-on-surface-variant text-body-sm">Posted {formatDate(job.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-sm">
                                                <button className="p-base rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors">
                                                    <span className="material-symbols-outlined text-on-surface-variant">share</span>
                                                </button>
                                                <button className="p-base rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors">
                                                    <span className="material-symbols-outlined text-on-surface-variant">bookmark</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <article className="job-content">
                                        <div style={{ whiteSpace: 'pre-line' }}>{job.description}</div>
                                        <div className="mt-lg">
                                            <h2 className="mb-md">Required Skills</h2>
                                            <div className="flex flex-wrap gap-xs">
                                                {job.skills.map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-surface-container-high text-on-surface px-md py-xs rounded-full text-label-md border border-outline-variant hover:bg-secondary-fixed transition-colors cursor-default"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </article>
                                </div>
                            </div>

                            {/* Right column */}
                            <aside className="lg:col-span-4 space-y-md">
                                <div className="bg-surface-container-lowest rounded-xl p-md lg:p-lg border border-outline-variant shadow-sm sticky top-24">

                                    <div className="mb-lg space-y-md">
                                        <div className="flex items-start gap-md">
                                            <div className="bg-primary-fixed p-sm rounded-lg">
                                                <span className="material-symbols-outlined text-primary">location_on</span>
                                            </div>
                                            <div>
                                                <p className="text-on-surface-variant text-label-md uppercase tracking-wider">Location</p>
                                                <p className="text-primary text-headline-sm">{job.location}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-md">
                                            <div className="bg-primary-fixed p-sm rounded-lg">
                                                <span className="material-symbols-outlined text-primary">work</span>
                                            </div>
                                            <div>
                                                <p className="text-on-surface-variant text-label-md uppercase tracking-wider">Job Type</p>
                                                <p className="text-primary text-headline-sm capitalize">{job.type}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-md">
                                            <div className="bg-primary-fixed p-sm rounded-lg">
                                                <span className="material-symbols-outlined text-primary">payments</span>
                                            </div>
                                            <div>
                                                <p className="text-on-surface-variant text-label-md uppercase tracking-wider">Salary Range</p>
                                                <p className="text-primary text-headline-sm">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── ACTION BUTTON ── */}
                                    {isJobPoster ? (
                                        // Only the recruiter who posted sees View Applicants
                                        <Link
                                            to={`/recruiter/jobs/${job._id}/applicants`}
                                            className="w-full bg-secondary text-on-secondary py-md rounded-lg font-bold text-body-md shadow-md hover:opacity-95 transition-all mb-md flex items-center justify-center gap-xs"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">people</span>
                                            View Applicants
                                        </Link>
                                    ) : hasApplied ? (
                                        // Seeker already applied
                                        <div className="w-full bg-tertiary-fixed text-on-tertiary-fixed py-md rounded-lg font-bold text-body-md flex items-center justify-center gap-xs mb-md cursor-default">
                                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                            Applied
                                        </div>
                                    ) : (
                                        // Seeker can apply
                                        <button
                                            className="w-full bg-secondary text-on-secondary py-md rounded-lg font-bold text-body-md shadow-md hover:shadow-lg hover:opacity-95 active:scale-[0.98] transition-all mb-md"
                                            onClick={() => {
                                                if (!user) navigate('/login');
                                                else setShowModal(true);
                                            }}
                                        >
                                            Apply Now
                                        </button>
                                    )}

                                    {/* Save for Later — not for job poster */}
                                    {!isJobPoster && (
                                        <button className="w-full bg-surface-container-lowest text-primary py-md rounded-lg font-bold text-body-md border border-outline-variant hover:bg-surface-container-low transition-colors">
                                            Save for Later
                                        </button>
                                    )}

                                    {job.postedBy && (
                                        <div className="mt-lg pt-lg border-t border-surface-container">
                                            <p className="text-on-surface-variant text-label-md uppercase tracking-wider mb-md">Posted By</p>
                                            <div className="flex items-center gap-md">
                                                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-bold text-headline-sm">
                                                    {job.postedBy.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-primary text-headline-sm">{job.postedBy.name}</p>
                                                    <p className="text-on-surface-variant text-body-sm">{job.postedBy.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </aside>
                        </div>
                    </>
                )}
            </main>

            {/* ── FOOTER ── */}
            <footer className="bg-primary mt-lg w-full">
                <div className="flex flex-col md:flex-row justify-between items-center w-full px-md lg:px-lg py-lg max-w-[1280px] mx-auto">
                    <div className="mb-md md:mb-0">
                        <span className="text-headline-sm font-bold text-on-primary">HireFlow</span>
                        <p className="text-on-primary opacity-80 text-body-sm mt-xs">© 2024 HireFlow. All rights reserved.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-md">
                        <a className="text-on-primary opacity-80 hover:opacity-100 transition-opacity text-body-sm" href="/">About Us</a>
                        <a className="text-on-primary opacity-80 hover:opacity-100 transition-opacity text-body-sm" href="/">Terms of Service</a>
                        <a className="text-on-primary opacity-80 hover:opacity-100 transition-opacity text-body-sm" href="/">Privacy Policy</a>
                        <a className="text-on-primary opacity-80 hover:opacity-100 transition-opacity text-body-sm" href="/">Help Center</a>
                        <a className="text-on-primary opacity-80 hover:opacity-100 transition-opacity text-body-sm" href="/">Contact</a>
                    </div>
                </div>
            </footer>

            {/* ── APPLY MODAL ── */}
            {showModal && (
                <ApplyModal
                    jobId={job._id}
                    jobTitle={job.title}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        setHasApplied(true);
                    }}
                />
            )}

        </div>
    );
}