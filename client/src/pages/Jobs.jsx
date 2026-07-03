/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Helper — badge color based on job type
const typeBadgeClass = (type) => {
    switch (type) {
        case 'full-time': return 'bg-secondary-fixed text-on-secondary-fixed';
        case 'part-time': return 'bg-surface-variant text-on-surface-variant';
        case 'remote': return 'bg-tertiary-fixed text-on-tertiary-fixed';
        case 'hybrid': return 'bg-primary-fixed text-primary';
        case 'internship': return 'bg-surface-variant text-on-surface-variant';
        default: return 'bg-surface-variant text-on-surface-variant';
    }
};

// Helper — format salary
const formatSalary = (min, max) => {
    const fmt = (n) => n >= 100000
        ? `₹${(n / 100000).toFixed(0)}L`
        : `₹${n.toLocaleString()}`;
    return `${fmt(min)} - ${fmt(max)}`;
};

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(true);
    const [nextCursor, setNextCursor] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();

    // Fetch jobs when filters change
    useEffect(() => {
        fetchJobs();
    }, []); // ← only runs once on page load now

    // Replace your current fetchJobs + handlers with this

    const fetchJobs = async (options = {}) => {
        const {
            searchQuery = search,
            typeFilter = type,
            locationFilter = location,
            cursor = null
        } = options;

        cursor ? setLoadingMore(true) : setLoading(true);

        try {
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (typeFilter) params.type = typeFilter;
            if (locationFilter) params.location = locationFilter;
            if (cursor) params.cursor = cursor;

            console.log('Fetching with params:', params); // debug

            const res = await API.get('/jobs', { params });

            if (cursor) {
                setJobs(prev => [...prev, ...res.data.jobs]);
            } else {
                setJobs(res.data.jobs);
            }
            setNextCursor(res.data.nextCursor);

        } catch (err) {
            console.error('Failed to fetch jobs:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // When type dropdown changes — pass value directly
    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setType(newType);
        fetchJobs({ typeFilter: newType });
    };

    // When search or location button clicked — pass all current values
    const handleSearch = () => {
        fetchJobs({
            searchQuery: search,
            typeFilter: type,
            locationFilter: location
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col">

            {/* ── HEADER ── */}
            <header className="bg-surface-container-lowest sticky top-0 z-50 border-b border-outline-variant shadow-sm w-full">
                <div className="flex justify-between items-center w-full px-md lg:px-lg max-w-[1280px] mx-auto h-16">

                    <div className="flex items-center gap-xl">
                        <Link to="/" className="text-headline-md font-bold text-primary">HireFlow</Link>
                        <nav className="hidden md:flex gap-md items-center h-full">
                            <Link to="/jobs" className="text-secondary font-semibold border-b-2 border-secondary pb-1 text-body-md">
                                Find Jobs
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-md">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-on-surface-variant hover:text-secondary text-body-md">Dashboard</Link>
                                {user.role === 'recruiter' && (
                                    <Link
                                        to="/post-job"
                                        className="bg-secondary text-on-secondary px-md py-xs rounded-lg text-label-md hover:opacity-90 transition-all"
                                    >
                                        Post a Job
                                    </Link>
                                )}
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-on-surface-variant hover:text-secondary text-body-md">Sign In</Link>
                                <Link
                                    to="/register"
                                    className="bg-secondary text-on-secondary px-md py-xs rounded-lg text-label-md hover:opacity-90 transition-all"
                                >
                                    Post a Job
                                </Link>
                            </>
                        )}
                    </div>

                </div>
            </header>

            <main className="flex-grow">

                {/* ── HERO SEARCH ── */}
                <section className="relative bg-primary py-xl overflow-hidden">
                    <div className="relative z-10 max-w-[1280px] mx-auto px-md lg:px-lg text-center">
                        <h1 className="text-headline-xl text-on-primary mb-md">
                            Find your next breakthrough.
                        </h1>
                        <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-xs bg-surface-container-lowest p-xs rounded-xl shadow-lg border border-outline-variant">
                            <div className="flex-grow flex items-center px-sm gap-sm">
                                <span className="material-symbols-outlined text-outline">search</span>
                                <input
                                    className="w-full bg-transparent border-none focus:ring-0 text-body-md py-sm"
                                    placeholder="Job title, keywords, or company"
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                className="bg-secondary text-on-secondary px-xl py-sm rounded-lg text-headline-sm transition-all hover:opacity-90 active:scale-95"
                            >
                                Find Jobs
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── FILTER ROW ── */}
                <div className="sticky top-16 z-40 bg-surface backdrop-blur-md border-b border-outline-variant">
                    <div className="max-w-[1280px] mx-auto px-md lg:px-lg py-md flex flex-wrap items-center gap-md">

                        {/* Job Type */}
                        <div className="flex flex-col gap-xs min-w-[200px]">
                            <label className="text-label-sm text-on-surface-variant">Job Type</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-sm py-xs text-body-sm focus:border-secondary appearance-none"
                                    value={type}
                                    onChange={handleTypeChange}
                                >
                                    <option value="">All Types</option>
                                    <option value="full-time">Full-time</option>
                                    <option value="part-time">Part-time</option>
                                    <option value="remote">Remote</option>
                                    <option value="hybrid">Hybrid</option>
                                    <option value="internship">Internship</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                                    expand_more
                                </span>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex flex-col gap-xs min-w-[200px]">
                            <label className="text-label-sm text-on-surface-variant">Location</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline text-sm">
                                    location_on
                                </span>
                                <input
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-8 pr-sm py-xs text-body-sm focus:border-secondary"
                                    placeholder="City or remote"
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleSearch}
                                className="h-[38px] px-md flex items-center gap-xs text-secondary text-label-md hover:bg-secondary/10 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">filter_list</span>
                                Apply Filters
                            </button>
                        </div>

                    </div>
                </div>

                {/* ── JOB GRID ── */}
                <section className="max-w-[1280px] mx-auto px-md lg:px-lg py-lg">

                    <div className="flex justify-between items-center mb-md">
                        <h2 className="text-headline-md text-primary">Latest Opportunities</h2>
                        <span className="text-body-sm text-on-surface-variant">
                            {loading ? 'Loading...' : `Showing ${jobs.length} jobs`}
                        </span>
                    </div>

                    {/* Loading state */}
                    {loading && (
                        <div className="flex justify-center items-center py-xl">
                            <span className="material-symbols-outlined animate-spin text-secondary text-[40px]">
                                progress_activity
                            </span>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && jobs.length === 0 && (
                        <div className="text-center py-xl">
                            <span className="material-symbols-outlined text-[64px] text-outline-variant">
                                work_off
                            </span>
                            <p className="text-headline-sm text-on-surface-variant mt-md">
                                No jobs found
                            </p>
                            <p className="text-body-sm text-on-surface-variant mt-xs">
                                Try different search terms or filters
                            </p>
                        </div>
                    )}

                    {/* Job cards grid */}
                    {!loading && jobs.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                            {jobs.map((job) => (
                                <div
                                    key={job._id}
                                    className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm job-card-hover group"
                                >
                                    {/* Card header */}
                                    <div className="flex justify-between items-start mb-sm">
                                        <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center text-primary font-bold text-headline-sm">
                                            {job.company.charAt(0).toUpperCase()}
                                        </div>
                                        <span className={`px-xs py-[2px] rounded text-label-sm capitalize ${typeBadgeClass(job.type)}`}>
                                            {job.type}
                                        </span>
                                    </div>

                                    {/* Job info */}
                                    <h3 className="text-headline-sm text-primary group-hover:text-secondary transition-colors">
                                        {job.title}
                                    </h3>
                                    <p className="text-body-sm font-medium text-on-surface-variant mt-xs">
                                        {job.company}
                                    </p>
                                    <div className="flex items-center gap-xs mt-xs text-on-surface-variant text-body-sm">
                                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                                        {job.location}
                                    </div>

                                    {/* Salary */}
                                    <div className="mt-md flex items-center text-primary text-label-md">
                                        <span className="material-symbols-outlined text-[18px] mr-1">payments</span>
                                        {formatSalary(job.salaryMin, job.salaryMax)}
                                    </div>

                                    {/* Skills */}
                                    <div className="mt-sm flex flex-wrap gap-xs">
                                        {job.skills.slice(0, 3).map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-xs py-1 bg-surface-container-low text-on-surface-variant rounded text-[11px] font-label-sm uppercase tracking-wider"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    {/* View Details button */}
                                    <button
                                        onClick={() => navigate(`/jobs/${job._id}`)}
                                        className="w-full mt-md border border-outline-variant text-primary py-xs rounded-lg text-label-md hover:bg-primary hover:text-on-primary transition-all"
                                    >
                                        View Details
                                    </button>

                                </div>
                            ))}
                        </div>
                    )}

                    {/* Load More */}
                    {nextCursor && !loading && (
                        <div className="mt-xl flex justify-center">
                            <button
                                onClick={() => fetchJobs(nextCursor)}
                                disabled={loadingMore}
                                className="flex items-center gap-sm px-xl py-sm border border-outline-variant rounded-lg text-label-md text-primary hover:bg-surface-container transition-colors disabled:opacity-60"
                            >
                                {loadingMore ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[18px]">
                                            progress_activity
                                        </span>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                        Load More Jobs
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                </section>
            </main>

            {/* ── FOOTER ── */}
            <footer className="bg-primary mt-lg">
                <div className="flex flex-col md:flex-row justify-between items-center w-full px-md lg:px-lg py-lg max-w-[1280px] mx-auto">
                    <div className="flex flex-col items-center md:items-start mb-md md:mb-0">
                        <span className="text-headline-sm font-bold text-on-primary mb-xs">HireFlow</span>
                        <p className="text-on-primary text-body-sm opacity-80">
                            Empowering careers through precision networking.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-md">
                        <a className="text-on-primary text-body-sm opacity-80 hover:opacity-100 transition-opacity" href="/">About Us</a>
                        <a className="text-on-primary text-body-sm opacity-80 hover:opacity-100 transition-opacity" href="/">Terms of Service</a>
                        <a className="text-on-primary text-body-sm opacity-80 hover:opacity-100 transition-opacity" href="/">Privacy Policy</a>
                        <a className="text-on-primary text-body-sm opacity-80 hover:opacity-100 transition-opacity" href="/">Help Center</a>
                        <a className="text-on-primary text-body-sm opacity-80 hover:opacity-100 transition-opacity" href="/">Contact</a>
                    </div>
                    <div className="mt-md md:mt-0 text-on-primary text-body-sm opacity-60">
                        © 2024 HireFlow. All rights reserved.
                    </div>
                </div>
            </footer>

        </div>
    );
}