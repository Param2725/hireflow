/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const statusConfig = {
    Applied: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
    Reviewed: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    Interview: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
    Offered: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    Rejected: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
};

export default function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'seeker') {
            navigate('/jobs');
            return;
        }
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await API.get('/applications/mine');
            setApplications(res.data.applications || []);
        } catch (err) {
            setError('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col">

            {/* ── HEADER ── */}
            <header className="fixed top-0 w-full z-50 bg-surface shadow-sm">
                <div className="flex justify-between items-center px-gutter h-16 max-w-[1280px] mx-auto">

                    <div className="flex items-center gap-lg">
                        <Link to="/" className="text-headline-md font-bold text-primary">HireFlow</Link>
                        <nav className="hidden md:flex gap-md items-center h-full">
                            <Link to="/jobs" className="text-secondary font-semibold border-b-2 border-secondary pb-1 text-body-md">
                                Find Jobs
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-sm">
                        <Link
                            to="/dashboard"
                            className="text-body-md text-on-surface-variant hover:text-secondary transition-colors px-md py-xs"
                        >
                            Dashboard
                        </Link>
                        {user?.role === 'recruiter' && (
                            <Link
                                to="/post-job"
                                className="bg-secondary text-on-secondary px-md py-xs rounded-lg text-label-md active:scale-95 transition-transform"
                            >
                                Post a Job
                            </Link>
                        )}
                    </div>

                </div>
            </header>

            {/* ── MAIN ── */}
            <main className="flex-grow pt-32 pb-xl px-gutter max-w-[1280px] mx-auto w-full">

                {/* Page header */}
                <div className="flex items-end justify-between mb-lg border-b border-outline-variant pb-md">
                    <div className="flex items-center gap-sm">
                        <h1 className="text-headline-lg text-primary">My Applications</h1>
                        <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-label-sm">
                            {applications.length}
                        </span>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center items-center py-xl">
                        <span className="material-symbols-outlined animate-spin text-secondary text-[40px]">
                            progress_activity
                        </span>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="text-center py-xl">
                        <span className="material-symbols-outlined text-[64px] text-outline-variant">error</span>
                        <p className="text-headline-sm text-on-surface-variant mt-md">{error}</p>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && applications.length === 0 && (
                    <div className="text-center py-xl">
                        <span className="material-symbols-outlined text-[64px] text-outline-variant">
                            assignment
                        </span>
                        <p className="text-headline-sm text-on-surface-variant mt-md">
                            No applications yet
                        </p>
                        <p className="text-body-sm text-on-surface-variant mt-xs mb-lg">
                            Start applying to jobs to track your progress here
                        </p>
                        <Link
                            to="/jobs"
                            className="bg-secondary text-on-secondary px-lg py-sm rounded-lg text-label-md hover:opacity-90 transition-all"
                        >
                            Browse Jobs
                        </Link>
                    </div>
                )}

                {/* Applications list */}
                {!loading && applications.length > 0 && (
                    <div className="flex flex-col gap-md">
                        {applications.map((app) => {
                            const status = statusConfig[app.status] || statusConfig['Applied'];
                            const job = app.jobId;

                            return (
                                <div
                                    key={app._id}
                                    className={`application-card bg-surface-container-lowest rounded-xl p-md border border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-md ${app.status === 'Rejected' ? 'opacity-80' : ''
                                        }`}
                                >
                                    {/* Left — job info */}
                                    <div className="flex items-start gap-md">

                                        {/* Company initial avatar */}
                                        <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-headline-md shrink-0">
                                            {job?.company?.charAt(0).toUpperCase() || '?'}
                                        </div>

                                        <div>
                                            <h3 className="text-headline-sm text-primary">{job?.title}</h3>
                                            <div className="flex flex-wrap items-center gap-x-md gap-y-1 mt-1 text-on-surface-variant text-body-sm">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[18px]">business</span>
                                                    {job?.company}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                                    {job?.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                                    Applied {formatDate(app.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Right — status + action */}
                                    <div className="flex items-center justify-between md:justify-end gap-md md:w-1/3">

                                        {/* Status badge */}
                                        <span className={`${status.bg} ${status.text} px-3 py-1 rounded-full text-label-sm flex items-center gap-1`}>
                                            <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
                                            {app.status}
                                        </span>

                                        {/* View job button */}
                                        <Link
                                            to={`/jobs/${job?._id}`}
                                            className="text-secondary text-label-md hover:underline flex items-center gap-xs"
                                        >
                                            View Job
                                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </Link>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </main>

            {/* ── FOOTER ── */}
            <footer className="bg-primary w-full mt-xl border-t border-outline-variant">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md py-lg px-gutter max-w-[1280px] mx-auto">
                    <div className="flex flex-col gap-sm">
                        <span className="text-headline-sm font-bold text-on-primary">HireFlow</span>
                        <p className="text-body-sm text-on-primary opacity-80 max-w-sm">
                            Connecting world-class talent with high-growth companies.
                        </p>
                        <p className="text-body-sm text-on-primary opacity-60 mt-md">
                            © 2024 HireFlow. All rights reserved.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-md">
                        <div className="flex flex-col gap-xs">
                            <h4 className="text-on-primary text-xs uppercase tracking-wider mb-2 font-semibold">Platform</h4>
                            <a className="text-body-sm text-on-primary opacity-80 hover:opacity-100 transition-colors" href="/">Help Center</a>
                            <a className="text-body-sm text-on-primary opacity-80 hover:opacity-100 transition-colors" href="/">Terms of Service</a>
                        </div>
                        <div className="flex flex-col gap-xs">
                            <h4 className="text-on-primary text-xs uppercase tracking-wider mb-2 font-semibold">Privacy</h4>
                            <a className="text-body-sm text-on-primary opacity-80 hover:opacity-100 transition-colors" href="/">Privacy Policy</a>
                            <a className="text-body-sm text-on-primary opacity-80 hover:opacity-100 transition-colors" href="/">Cookie Policy</a>
                        </div>
                        <div className="flex flex-col gap-xs">
                            <h4 className="text-on-primary text-xs uppercase tracking-wider mb-2 font-semibold">Company</h4>
                            <a className="text-body-sm text-on-primary opacity-80 hover:opacity-100 transition-colors" href="/">Accessibility</a>
                            <a className="text-body-sm text-on-primary opacity-80 hover:opacity-100 transition-colors" href="/">Contact Us</a>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
}