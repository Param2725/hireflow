/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
};

const statusSelectClass = (status) => {
    switch (status) {
        case 'Applied': return 'bg-surface-container-high text-on-surface-variant';
        case 'Reviewed': return 'bg-secondary-fixed text-on-secondary-fixed-variant';
        case 'Interview': return 'bg-secondary text-white';
        case 'Offered': return 'bg-tertiary-fixed text-on-tertiary-fixed-variant';
        case 'Rejected': return 'bg-error-container text-on-error-container';
        default: return 'bg-surface-container-high text-on-surface-variant';
    }
};

const matchScoreClass = (score) => {
    if (score >= 30) return 'bg-green-100 text-green-700';   // was 70
    if (score >= 10) return 'bg-yellow-100 text-yellow-700'; // was 40
    return 'bg-red-100 text-red-700';
};

export default function ApplicantsList() {
    const [applications, setApplications] = useState([]);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedCL, setExpandedCL] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const { jobId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'recruiter') {
            navigate('/jobs');
            return;
        }
        fetchApplicants();
    }, [jobId]);

    const fetchApplicants = async () => {
        setLoading(true);
        try {
            const res = await API.get(`/applications/job/${jobId}`);
            setApplications(res.data.applicants || []);
            setJob(res.data.job);
        } catch (err) {
            setError('Failed to load applicants');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        setUpdatingId(applicationId);
        try {
            await API.patch(`/applications/${applicationId}/status`, { status: newStatus });
            setApplications(prev =>
                prev.map(app =>
                    app._id === applicationId ? { ...app, status: newStatus } : app
                )
            );
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const toggleCoverLetter = (id) => {
        setExpandedCL(expandedCL === id ? null : id);
    };

    // Sort applications by match score (highest first)
    const sortedApplications = useMemo(() => {
        return [...applications].sort(
            (a, b) => (b.matchScore || 0) - (a.matchScore || 0)
        );
    }, [applications]);

    const stats = {
        total: applications.length,
        reviewed: applications.filter(a => a.status === 'Reviewed').length,
        interview: applications.filter(a => a.status === 'Interview').length,
        offered: applications.filter(a => a.status === 'Offered').length,
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col">

            {/* ── HEADER ── */}
            <header className="fixed top-0 w-full bg-surface shadow-sm z-50">
                <div className="flex justify-between items-center px-gutter h-16 max-w-[1280px] mx-auto">
                    <div className="flex items-center gap-lg">
                        <Link to="/" className="text-headline-md font-bold text-primary">HireFlow</Link>
                        <nav className="hidden md:flex gap-md items-center">
                            <Link to="/jobs" className="text-body-md text-on-surface-variant hover:text-secondary transition-colors duration-200">Find Jobs</Link>
                            <Link to="/dashboard" className="text-body-md text-on-surface-variant hover:text-secondary transition-colors duration-200">Dashboard</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-sm">
                        <Link
                            to="/post-job"
                            className="bg-primary text-on-primary px-md py-xs rounded-lg text-body-md hover:opacity-90 transition-all"
                        >
                            Post a Job
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── MAIN ── */}
            <main className="pt-24 pb-xl px-gutter max-w-[1280px] mx-auto min-h-screen w-full">

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
                    </div>
                )}

                {!loading && !error && job && (
                    <>
                        {/* Page header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-lg gap-md">
                            <div>
                                <nav className="flex items-center gap-xs text-on-surface-variant mb-xs">
                                    <Link to="/dashboard" className="text-label-sm hover:text-secondary">Dashboard</Link>
                                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                    <Link to="/jobs" className="text-label-sm hover:text-secondary">Jobs</Link>
                                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                    <span className="text-label-sm text-secondary">Applicants</span>
                                </nav>
                                <h1 className="text-headline-xl text-primary">{job.title}</h1>
                                <div className="flex items-center gap-sm mt-xs">
                                    <span className="text-headline-sm text-secondary">{applications.length} Applicants</span>
                                    <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
                                    <span className="text-body-sm text-on-surface-variant">{job.company}</span>
                                </div>
                            </div>
                            <div className="flex gap-sm">
                                <Link
                                    to={`/jobs/${jobId}`}
                                    className="flex items-center gap-xs px-md py-base border border-outline-variant rounded-lg bg-white text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                    View Job
                                </Link>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-lg">
                            <div className="bg-white p-md rounded-xl shadow-sm border border-outline-variant flex flex-col justify-between">
                                <span className="text-label-md text-on-surface-variant">Total Applicants</span>
                                <div className="flex items-end justify-between mt-base">
                                    <span className="text-headline-lg text-primary">{stats.total}</span>
                                    <span className="material-symbols-outlined text-on-surface-variant">people</span>
                                </div>
                            </div>
                            <div className="bg-white p-md rounded-xl shadow-sm border border-outline-variant flex flex-col justify-between">
                                <span className="text-label-md text-on-surface-variant">Reviewed</span>
                                <div className="flex items-end justify-between mt-base">
                                    <span className="text-headline-lg text-primary">{stats.reviewed}</span>
                                    <span className="material-symbols-outlined text-secondary">rate_review</span>
                                </div>
                            </div>
                            <div className="bg-white p-md rounded-xl shadow-sm border border-outline-variant flex flex-col justify-between">
                                <span className="text-label-md text-on-surface-variant">Interviews</span>
                                <div className="flex items-end justify-between mt-base">
                                    <span className="text-headline-lg text-primary">{stats.interview}</span>
                                    <span className="material-symbols-outlined text-secondary">calendar_today</span>
                                </div>
                            </div>
                            <div className="bg-white p-md rounded-xl shadow-sm border border-outline-variant flex flex-col justify-between">
                                <span className="text-label-md text-on-surface-variant">Offered</span>
                                <div className="flex items-end justify-between mt-base">
                                    <span className="text-headline-lg text-primary">{stats.offered}</span>
                                    <span className="material-symbols-outlined text-on-tertiary-container">verified</span>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        {applications.length === 0 ? (
                            <div className="text-center py-xl bg-white rounded-xl border border-outline-variant">
                                <span className="material-symbols-outlined text-[64px] text-outline-variant">person_search</span>
                                <p className="text-headline-sm text-on-surface-variant mt-md">No applicants yet</p>
                                <p className="text-body-sm text-on-surface-variant mt-xs">Share the job listing to attract candidates</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-outline-variant overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-surface-container-low border-b border-outline-variant">
                                            <tr>
                                                <th className="px-md py-md text-label-md text-on-surface-variant uppercase tracking-wider">Applicant</th>
                                                <th className="px-md py-md text-label-md text-on-surface-variant uppercase tracking-wider">Match</th>
                                                <th className="px-md py-md text-label-md text-on-surface-variant uppercase tracking-wider">Date Applied</th>
                                                <th className="px-md py-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                                                <th className="px-md py-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-outline-variant">
                                            {sortedApplications.map((app) => (

                                                <React.Fragment key={app._id}>

                                                    {/* Applicant row */}
                                                    <tr className="applicant-row group hover:bg-surface-container-lowest transition-colors duration-150">

                                                        <td className="px-md py-md">
                                                            <div className="flex items-center gap-md">
                                                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-bold text-headline-sm shrink-0">
                                                                    {app.seekerId?.name?.charAt(0).toUpperCase() || '?'}
                                                                </div>
                                                                <div>
                                                                    <div className="text-headline-sm text-primary">{app.seekerId?.name}</div>
                                                                    <div className="text-body-sm text-on-surface-variant">{app.seekerId?.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* ── MATCH SCORE COLUMN ── */}
                                                        <td className="px-md py-md">
                                                            {app.matchScore > 0 ? (
                                                                <div className={`inline-flex items-center gap-xs px-sm py-xs rounded-full text-label-sm font-semibold ${matchScoreClass(app.matchScore)}`}>
                                                                    <span className="material-symbols-outlined text-[14px]">analytics</span>
                                                                    {app.matchScore}%
                                                                </div>
                                                            ) : (
                                                                <span className="text-on-surface-variant text-label-sm">—</span>
                                                            )}
                                                        </td>

                                                        <td className="px-md py-md text-body-md text-on-surface">
                                                            {formatDate(app.createdAt)}
                                                        </td>

                                                        <td className="px-md py-md">
                                                            <div className="relative inline-block w-36">
                                                                <select
                                                                    className={`w-full border-none rounded-lg text-label-md py-xs pl-sm pr-base cursor-pointer focus:ring-2 focus:ring-secondary/20 appearance-none transition-all ${statusSelectClass(app.status)} ${updatingId === app._id ? 'opacity-50' : ''}`}
                                                                    value={app.status}
                                                                    disabled={updatingId === app._id}
                                                                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                                                >
                                                                    <option value="Applied">Applied</option>
                                                                    <option value="Reviewed">Reviewed</option>
                                                                    <option value="Interview">Interview</option>
                                                                    <option value="Offered">Offered</option>
                                                                    <option value="Rejected">Rejected</option>
                                                                </select>
                                                                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[18px]">
                                                                    expand_more
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td className="px-md py-md text-right">
                                                            <div className="flex items-center justify-end gap-sm">
                                                                <button
                                                                    className="text-secondary text-label-md hover:underline flex items-center gap-xs"
                                                                    onClick={() => toggleCoverLetter(app._id)}
                                                                >
                                                                    Cover Letter
                                                                    <span
                                                                        className="material-symbols-outlined text-[18px] transition-transform duration-200"
                                                                        style={{ transform: expandedCL === app._id ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                                                    >
                                                                        keyboard_arrow_down
                                                                    </span>
                                                                </button>
                                                                <button
                                                                    className="resume-btn flex items-center gap-xs px-sm py-xs bg-surface-container-high rounded-lg text-primary text-label-sm hover:bg-outline-variant transition-all"
                                                                    onClick={() => {
                                                                        let downloadUrl = app.resumeUrl;

                                                                        if (downloadUrl.includes('/image/upload/')) {
                                                                            downloadUrl = downloadUrl
                                                                                .replace('/image/upload/', '/image/upload/fl_attachment/');
                                                                        } else {
                                                                            downloadUrl = downloadUrl
                                                                                .replace('/raw/upload/', '/raw/upload/fl_attachment/');
                                                                        }

                                                                        window.open(downloadUrl, '_blank');
                                                                    }}
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                                                    Resume
                                                                </button>
                                                            </div>
                                                        </td>

                                                    </tr>

                                                    {/* Cover letter row */}
                                                    {expandedCL === app._id && (
                                                        <tr className="bg-surface-container-lowest">
                                                            <td colSpan={5} className="px-xl py-lg">
                                                                <div className="max-w-2xl text-on-surface-variant border-l-2 border-secondary pl-md">
                                                                    <p className="text-body-md leading-relaxed italic">
                                                                        "{app.coverLetter}"
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}

                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="px-md py-sm bg-surface-container-low flex items-center justify-between border-t border-outline-variant">
                                    <span className="text-body-sm text-on-surface-variant">
                                        Showing {applications.length} applicant{applications.length !== 1 ? 's' : ''} • sorted by match score
                                    </span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* ── FOOTER ── */}
            <footer className="bg-primary w-full mt-xl border-t border-outline-variant">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md py-lg px-gutter max-w-[1280px] mx-auto text-on-primary">
                    <div>
                        <span className="text-headline-sm font-bold text-on-primary">HireFlow</span>
                        <p className="text-body-sm mt-xs text-on-primary opacity-80">Empowering growth through precise talent connections.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-md">
                        <div className="flex flex-col gap-xs">
                            <h4 className="text-label-md mb-xs text-on-primary font-semibold">Platform</h4>
                            <a className="text-body-sm text-on-primary opacity-80 hover:opacity-100 transition-colors" href="/">Help Center</a>
                            <a className="text-body-sm text-on-primary opacity-80 hover:opacity-100 transition-colors" href="/">Contact Us</a>
                        </div>
                        <div className="flex flex-col gap-xs">
                            <h4 className="text-label-md mb-xs text-on-primary font-semibold">Legal</h4>
                            <a className="text-body-sm text-on-primary opacity-80 hover:opacity-100 transition-colors" href="/">Terms of Service</a>
                            <a className="text-body-sm text-on-primary opacity-80 hover:opacity-100 transition-colors" href="/">Privacy Policy</a>
                        </div>
                    </div>
                    <div className="md:col-span-2 border-t border-white/10 pt-md mt-md">
                        <span className="text-body-sm text-on-primary opacity-60">© 2024 HireFlow. All rights reserved.</span>
                    </div>
                </div>
            </footer>

        </div>
    );
}