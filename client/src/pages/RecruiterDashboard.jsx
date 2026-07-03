/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const statusBadgeClass = (status) => {
    switch (status) {
        case 'Applied': return 'bg-surface-container-high text-on-surface-variant';
        case 'Reviewed': return 'bg-tertiary-fixed text-on-tertiary-fixed-variant';
        case 'Interview': return 'bg-secondary-fixed text-on-secondary-fixed';
        case 'Offered': return 'bg-green-100 text-green-700';
        case 'Rejected': return 'bg-red-100 text-red-700';
        default: return 'bg-surface-container-high text-on-surface-variant';
    }
};

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
};

export default function RecruiterDashboard() {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await API.post('/auth/logout');
        logout();
        navigate('/login');
    };


    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const res = await API.get('/dashboard/recruiter');
            setStats(res.data.stats);
            setRecentApplications(res.data.recentApplicants || []);

            const formatted = (res.data.applicantsPerJob || []).map(item => ({
                name: item.jobTitle?.length > 12
                    ? item.jobTitle.substring(0, 12) + '...'
                    : item.jobTitle,
                count: item.count
            }));
            setChartData(formatted);
        } catch (err) {
            console.error('Dashboard fetch failed:', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col">

            {/* ── HEADER ── */}
            <nav className="w-full top-0 sticky z-50 bg-surface-container-lowest border-b border-outline-variant shadow-sm">
                <div className="flex justify-between items-center px-md py-sm max-w-[1280px] mx-auto h-16">
                    <div className="flex items-center gap-lg">
                        <Link to="/" className="text-headline-md font-bold text-primary">HireFlow</Link>
                        <div className="hidden md:flex items-center gap-md">
                            <Link to="/dashboard" className="text-secondary border-b-2 border-secondary pb-1 text-label-md">Dashboard</Link>
                            <Link to="/jobs" className="text-on-surface-variant hover:text-secondary transition-colors text-label-md">Find Jobs</Link>
                            <Link to="/post-job" className="text-on-surface-variant hover:text-secondary transition-colors text-label-md">Post a Job</Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-sm">
                        <Link
                            to="/post-job"
                            className="bg-primary hover:opacity-90 text-on-primary px-md py-xs rounded-lg text-label-md transition-all active:scale-95"
                        >
                            Post a Job
                        </Link>
                        <div className="flex items-center gap-sm">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-bold text-headline-sm">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-sm bg-red-500 text-white px-md py-xs rounded-lg hover:bg-red-600 transition-all"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── MAIN ── */}
            <main className="max-w-[1280px] mx-auto px-md py-lg min-h-screen w-full flex-grow">

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center items-center py-xl">
                        <span className="material-symbols-outlined animate-spin text-secondary text-[40px]">
                            progress_activity
                        </span>
                    </div>
                )}

                {!loading && stats && (
                    <>
                        {/* Welcome */}
                        <header className="mb-lg">
                            <h1 className="text-headline-xl text-primary tracking-tight">
                                Welcome back, {user?.name?.split(' ')[0]}!
                            </h1>
                            <p className="text-on-surface-variant text-body-md mt-xs">
                                Here's what's happening with your hiring pipeline today.
                            </p>
                        </header>

                        {/* Stat cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-lg">

                            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant hover:-translate-y-1 transition-transform duration-200">
                                <div className="flex justify-between items-start mb-sm">
                                    <div className="bg-secondary p-xs rounded-lg">
                                        <span className="material-symbols-outlined text-white">work</span>
                                    </div>
                                    <span className="text-label-sm text-on-surface-variant bg-surface-container-high px-xs py-1 rounded">
                                        Active
                                    </span>
                                </div>
                                <h3 className="text-on-surface-variant text-label-md uppercase tracking-wider">Active Jobs</h3>
                                <p className="text-headline-lg text-primary mt-xs">{stats.activeJobs}</p>
                            </div>

                            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant hover:-translate-y-1 transition-transform duration-200">
                                <div className="flex justify-between items-start mb-sm">
                                    <div className="bg-primary p-xs rounded-lg">
                                        <span className="material-symbols-outlined text-white">group</span>
                                    </div>
                                    <span className="text-label-sm text-on-surface-variant bg-surface-container-high px-xs py-1 rounded">
                                        Total
                                    </span>
                                </div>
                                <h3 className="text-on-surface-variant text-label-md uppercase tracking-wider">Total Applicants</h3>
                                <p className="text-headline-lg text-primary mt-xs">{stats.totalApplicants}</p>
                            </div>

                            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant hover:-translate-y-1 transition-transform duration-200">
                                <div className="flex justify-between items-start mb-sm">
                                    <div className="p-xs rounded-lg" style={{ backgroundColor: '#8b5cf6' }}>
                                        <span className="material-symbols-outlined text-white">calendar_today</span>
                                    </div>
                                    <span className="text-label-sm text-on-surface-variant bg-surface-container-high px-xs py-1 rounded">
                                        {stats.interviews > 0 ? 'Scheduled' : 'None yet'}
                                    </span>
                                </div>
                                <h3 className="text-on-surface-variant text-label-md uppercase tracking-wider">Interviews</h3>
                                <p className="text-headline-lg text-primary mt-xs">{stats.interviews}</p>
                            </div>

                            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant hover:-translate-y-1 transition-transform duration-200">
                                <div className="flex justify-between items-start mb-sm">
                                    <div className="p-xs rounded-lg" style={{ backgroundColor: '#005236' }}>
                                        <span className="material-symbols-outlined text-white">check_circle</span>
                                    </div>
                                    <span className="text-label-sm text-on-surface-variant bg-surface-container-high px-xs py-1 rounded">
                                        {stats.offers > 0 ? '🎉' : 'None yet'}
                                    </span>
                                </div>
                                <h3 className="text-on-surface-variant text-label-md uppercase tracking-wider">Offers Made</h3>
                                <p className="text-headline-lg text-primary mt-xs">{stats.offers}</p>
                            </div>

                        </div>

                        {/* Main content grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">

                            {/* Bar chart */}
                            <div className="lg:col-span-1 bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant flex flex-col">
                                <div className="flex justify-between items-center mb-md">
                                    <h2 className="text-headline-md text-primary">Applications per Job</h2>
                                </div>

                                {chartData.length === 0 ? (
                                    <div className="flex-grow flex items-center justify-center">
                                        <p className="text-body-sm text-on-surface-variant">No data yet</p>
                                    </div>
                                ) : (
                                    <div className="flex-grow" style={{ minHeight: '250px' }}>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart
                                                data={chartData}
                                                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e3e5" />
                                                <XAxis
                                                    dataKey="name"
                                                    tick={{ fontSize: 11, fill: '#45474c' }}
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 11, fill: '#45474c' }}
                                                    allowDecimals={false}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        background: '#ffffff',
                                                        border: '1px solid #c5c6cd',
                                                        borderRadius: '8px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                                <Bar
                                                    dataKey="count"
                                                    fill="#0058be"
                                                    radius={[4, 4, 0, 0]}
                                                    name="Applicants"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                <div className="mt-md pt-md border-t border-outline-variant flex justify-around">
                                    <div className="flex items-center gap-xs">
                                        <div className="w-2 h-2 rounded-full bg-secondary"></div>
                                        <span className="text-label-sm text-on-surface-variant">Applicants</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent applicants table */}
                            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden flex flex-col">
                                <div className="p-md border-b border-outline-variant flex justify-between items-center">
                                    <h2 className="text-headline-md text-primary">Recent Applicants</h2>
                                    <Link to="/jobs" className="text-secondary text-label-md hover:underline">
                                        See All Jobs
                                    </Link>
                                </div>

                                {recentApplications.length === 0 ? (
                                    <div className="flex-grow flex flex-col items-center justify-center py-xl">
                                        <span className="material-symbols-outlined text-[48px] text-outline-variant">
                                            person_search
                                        </span>
                                        <p className="text-headline-sm text-on-surface-variant mt-md">No applicants yet</p>
                                        <Link
                                            to="/post-job"
                                            className="mt-md bg-secondary text-on-secondary px-lg py-sm rounded-lg text-label-md hover:opacity-90"
                                        >
                                            Post a Job
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-surface-container-low">
                                                    <th className="px-md py-sm text-label-md text-on-surface-variant border-b border-outline-variant">Name</th>
                                                    <th className="px-md py-sm text-label-md text-on-surface-variant border-b border-outline-variant">Job Applied For</th>
                                                    <th className="px-md py-sm text-label-md text-on-surface-variant border-b border-outline-variant">Date</th>
                                                    <th className="px-md py-sm text-label-md text-on-surface-variant border-b border-outline-variant">Status</th>
                                                    <th className="px-md py-sm text-label-md text-on-surface-variant border-b border-outline-variant">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-outline-variant">
                                                {recentApplications.map((app) => (
                                                    <tr
                                                        key={app._id}
                                                        className="hover:bg-surface-container-low transition-colors"
                                                    >
                                                        <td className="px-md py-md">
                                                            <div className="flex items-center gap-sm">
                                                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-bold text-xs shrink-0">
                                                                    {app.seekerId?.name?.charAt(0).toUpperCase() || '?'}
                                                                </div>
                                                                <div>
                                                                    <div className="text-headline-sm text-primary">{app.seekerId?.name}</div>
                                                                    <div className="text-body-sm text-on-surface-variant">{app.seekerId?.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-md py-md text-body-sm font-medium text-primary">
                                                            {app.jobId?.title}
                                                        </td>
                                                        <td className="px-md py-md text-body-sm text-on-surface-variant">
                                                            {formatDate(app.createdAt)}
                                                        </td>
                                                        <td className="px-md py-md">
                                                            <span className={`px-sm py-xs rounded-full text-label-sm ${statusBadgeClass(app.status)}`}>
                                                                {app.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-md py-md">
                                                            <Link
                                                                to={`/recruiter/jobs/${app.jobId?._id}/applicants`}
                                                                className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors"
                                                            >
                                                                chevron_right
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Quick actions banner */}
                        <div className="mt-lg flex flex-col md:flex-row items-center justify-between gap-md p-lg bg-primary rounded-2xl shadow-xl overflow-hidden relative">
                            <div className="z-10 text-center md:text-left">
                                <h3 className="text-headline-lg text-white">Ready to expand your team?</h3>
                                <p className="text-primary-fixed-dim text-body-md mt-xs">
                                    Manage your listings and discover top talent effortlessly.
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-md z-10">
                                <Link
                                    to="/post-job"
                                    className="bg-secondary-container hover:bg-secondary text-white px-xl py-sm rounded-lg text-headline-sm transition-all shadow-lg active:scale-95 flex items-center gap-sm"
                                >
                                    <span className="material-symbols-outlined">add_circle</span>
                                    Post a Job
                                </Link>
                                <Link
                                    to="/jobs"
                                    className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-xl py-sm rounded-lg text-headline-sm transition-all backdrop-blur-md active:scale-95"
                                >
                                    View All Jobs
                                </Link>
                            </div>
                            <div className="absolute right-0 top-0 w-64 h-64 bg-secondary/20 blur-[100px] rounded-full -mr-20 -mt-20"></div>
                        </div>

                    </>
                )}
            </main>

            {/* ── FOOTER ── */}
            <footer className="w-full mt-lg bg-surface-container border-t border-outline-variant">
                <div className="flex flex-col md:flex-row justify-between items-center px-md py-lg max-w-[1280px] mx-auto gap-md">
                    <div className="flex flex-col items-center md:items-start gap-xs">
                        <span className="text-headline-sm text-primary font-bold">HireFlow</span>
                        <p className="text-body-sm text-on-surface-variant">© 2024 HireFlow. All rights reserved.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-md">
                        <a className="text-label-sm text-on-surface-variant hover:text-primary hover:underline transition-all" href="/">Privacy Policy</a>
                        <a className="text-label-sm text-on-surface-variant hover:text-primary hover:underline transition-all" href="/">Terms of Service</a>
                        <a className="text-label-sm text-on-surface-variant hover:text-primary hover:underline transition-all" href="/">Help Center</a>
                    </div>
                </div>
            </footer>

        </div>
    );
}