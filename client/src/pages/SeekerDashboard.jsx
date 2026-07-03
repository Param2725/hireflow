/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const statusBadgeClass = (status) => {
    switch (status) {
        case 'Applied': return 'bg-surface-container text-on-surface-variant';
        case 'Reviewed': return 'bg-orange-100 text-orange-700';
        case 'Interview': return 'bg-purple-100 text-purple-700';
        case 'Offered': return 'bg-green-100 text-green-700';
        case 'Rejected': return 'bg-red-100 text-red-700';
        default: return 'bg-surface-container text-on-surface-variant';
    }
};

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function SeekerDashboard() {
    const [stats, setStats] = useState(null);
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
            const res = await API.get('/dashboard/seeker');
            setStats(res.data.stats);
            setRecentApplications(res.data.recentApplications || []);
        } catch (err) {
            console.error('Dashboard fetch failed:', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col">

            {/* ── HEADER ── */}
            <header className="w-full top-0 sticky bg-surface-container-lowest border-b border-outline-variant shadow-sm z-50">
                <nav className="flex justify-between items-center px-md py-sm max-w-[1280px] mx-auto">
                    <div className="flex items-center gap-md">
                        <Link to="/" className="text-headline-md font-bold text-primary">HireFlow</Link>
                        <div className="hidden md:flex items-center space-x-md ml-lg">
                            <Link to="/dashboard" className="text-label-md text-secondary border-b-2 border-secondary pb-1">Dashboard</Link>
                            <Link to="/jobs" className="text-label-md text-on-surface-variant hover:text-secondary transition-colors">Find Jobs</Link>
                            <Link to="/my-applications" className="text-label-md text-on-surface-variant hover:text-secondary transition-colors">My Applications</Link>
                        </div>
                    </div>
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
                </nav>
            </header>

            {/* ── MAIN ── */}
            <main className="max-w-[1280px] mx-auto px-md py-lg w-full flex-grow">

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
                        <section className="mb-lg">
                            <h1 className="text-headline-xl text-primary">
                                Welcome back, {user?.name?.split(' ')[0]}!
                            </h1>
                            <p className="text-body-md text-on-surface-variant mt-xs">
                                {stats.Interview > 0
                                    ? `You have ${stats.Interview} upcoming interview${stats.Interview > 1 ? 's' : ''}. Good luck!`
                                    : 'Keep applying your next opportunity is out there!'}
                            </p>
                        </section>

                        {/* Stat cards */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">

                            <div className="bg-surface-container-lowest p-md rounded-xl custom-shadow card-hover">
                                <div className="flex items-center justify-between mb-sm">
                                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-secondary">description</span>
                                    </div>
                                    <span className="text-label-sm text-on-surface-variant">Total</span>
                                </div>
                                <div className="text-headline-lg text-primary">{stats.total}</div>
                                <div className="text-label-md text-on-surface-variant mt-xs">Total Applied</div>
                            </div>

                            <div className="bg-surface-container-lowest p-md rounded-xl custom-shadow card-hover">
                                <div className="flex items-center justify-between mb-sm">
                                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-orange-600">visibility</span>
                                    </div>
                                    <span className="text-label-sm text-on-surface-variant">Active</span>
                                </div>
                                <div className="text-headline-lg text-primary">{stats.Reviewed}</div>
                                <div className="text-label-md text-on-surface-variant mt-xs">Under Review</div>
                            </div>

                            <div className="bg-surface-container-lowest p-md rounded-xl custom-shadow card-hover">
                                <div className="flex items-center justify-between mb-sm">
                                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-purple-600">event</span>
                                    </div>
                                    <span className="text-label-sm text-on-surface-variant">
                                        {stats.Interview > 0 ? 'Scheduled' : 'None yet'}
                                    </span>
                                </div>
                                <div className="text-headline-lg text-primary">{stats.Interview}</div>
                                <div className="text-label-md text-on-surface-variant mt-xs">Interviews</div>
                            </div>

                            <div className="bg-surface-container-lowest p-md rounded-xl custom-shadow card-hover">
                                <div className="flex items-center justify-between mb-sm">
                                    <div className="w-12 h-12 rounded-lg bg-tertiary-fixed flex items-center justify-center">
                                        <span className="material-symbols-outlined text-on-tertiary-fixed-variant">workspace_premium</span>
                                    </div>
                                    <span className="text-label-sm text-on-surface-variant">
                                        {stats.Offered > 0 ? '🎉 New!' : 'None yet'}
                                    </span>
                                </div>
                                <div className="text-headline-lg text-primary">{stats.Offered}</div>
                                <div className="text-label-md text-on-surface-variant mt-xs">Offers</div>
                            </div>

                        </section>

                        {/* Main content */}
                        <div className="flex flex-col lg:flex-row gap-lg">

                            {/* Recent Applications */}
                            <section className="flex-1">
                                <div className="flex items-center justify-between mb-md">
                                    <h2 className="text-headline-md text-primary">Recent Applications</h2>
                                    <Link to="/my-applications" className="text-secondary text-label-md hover:underline">
                                        View All
                                    </Link>
                                </div>

                                {recentApplications.length === 0 ? (
                                    <div className="text-center py-xl bg-surface-container-lowest rounded-xl border border-outline-variant">
                                        <span className="material-symbols-outlined text-[48px] text-outline-variant">
                                            assignment
                                        </span>
                                        <p className="text-headline-sm text-on-surface-variant mt-md">No applications yet</p>
                                        <Link
                                            to="/jobs"
                                            className="mt-md inline-block bg-secondary text-on-secondary px-lg py-sm rounded-lg text-label-md hover:opacity-90"
                                        >
                                            Browse Jobs
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-sm">
                                        {recentApplications.map((app) => (
                                            <div
                                                key={app._id}
                                                className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-md card-hover"
                                            >
                                                <div className="flex items-center gap-md">
                                                    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-headline-sm shrink-0">
                                                        {app.jobId?.company?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-headline-sm text-primary">{app.jobId?.title}</h3>
                                                        <p className="text-body-sm text-on-surface-variant">
                                                            {app.jobId?.company} • {app.jobId?.location}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-xs">
                                                    <span className={`px-3 py-1 rounded-full text-label-sm ${statusBadgeClass(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                    <span className="text-label-sm text-on-surface-variant">
                                                        {formatDate(app.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Sidebar */}
                            <aside className="lg:w-80">

                                {/* Profile strength card */}
                                <div className="bg-primary p-md rounded-xl text-on-primary mb-md relative overflow-hidden">
                                    <div className="relative z-10">
                                        <h3 className="text-headline-sm mb-xs">Your Profile</h3>
                                        <p className="text-body-sm opacity-90 mb-md capitalize">
                                            Logged in as: {user?.role}
                                        </p>
                                        <div className="text-headline-lg font-bold mb-xs">
                                            {user?.name}
                                        </div>
                                        <p className="text-body-sm opacity-80">{user?.email}</p>
                                    </div>
                                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-secondary opacity-20 blur-3xl rounded-full"></div>
                                </div>

                                {/* Quick actions */}
                                <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant">
                                    <h3 className="text-headline-sm text-primary mb-md">Quick Actions</h3>
                                    <div className="space-y-sm">
                                        <Link
                                            to="/jobs"
                                            className="w-full flex items-center gap-sm p-sm rounded-lg hover:bg-surface-container-low transition-colors group"
                                        >
                                            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary">
                                                search
                                            </span>
                                            <span className="text-label-md text-on-surface">Browse Jobs</span>
                                        </Link>
                                        <Link
                                            to="/my-applications"
                                            className="w-full flex items-center gap-sm p-sm rounded-lg hover:bg-surface-container-low transition-colors group"
                                        >
                                            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary">
                                                description
                                            </span>
                                            <span className="text-label-md text-on-surface">My Applications</span>
                                        </Link>
                                    </div>
                                </div>

                            </aside>
                        </div>

                        {/* Bottom quick actions — desktop */}
                        <div className="hidden md:flex justify-end gap-md mt-xl">
                            <Link
                                to="/my-applications"
                                className="px-xl py-sm bg-surface-container-lowest text-primary border border-outline-variant rounded-xl text-label-md hover:bg-surface-container-low transition-all"
                            >
                                My Applications
                            </Link>
                            <Link
                                to="/jobs"
                                className="px-xl py-sm bg-secondary text-on-secondary rounded-xl text-label-md hover:opacity-90 transition-all"
                            >
                                Browse Jobs
                            </Link>
                        </div>

                        {/* Bottom quick actions — mobile */}
                        <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md md:hidden border-t border-outline-variant px-md py-sm flex gap-sm z-40">
                            <Link
                                to="/jobs"
                                className="flex-1 bg-secondary text-on-secondary py-sm rounded-xl text-label-md text-center"
                            >
                                Browse Jobs
                            </Link>
                            <Link
                                to="/my-applications"
                                className="flex-1 bg-surface-container-lowest text-primary border border-outline-variant py-sm rounded-xl text-label-md text-center"
                            >
                                My Applications
                            </Link>
                        </div>

                    </>
                )}
            </main>

            {/* ── FOOTER ── */}
            <footer className="w-full mt-lg bg-surface-container border-t border-outline-variant">
                <div className="flex flex-col md:flex-row justify-between items-center px-md py-lg max-w-[1280px] mx-auto">
                    <div className="mb-md md:mb-0">
                        <span className="text-headline-sm text-primary font-bold">HireFlow</span>
                        <p className="text-body-sm text-on-surface-variant mt-xs">Empowering careers through precision matching.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-md mb-md md:mb-0">
                        <a className="text-label-sm text-on-surface-variant hover:text-primary hover:underline transition-all" href="/">Privacy Policy</a>
                        <a className="text-label-sm text-on-surface-variant hover:text-primary hover:underline transition-all" href="/">Terms of Service</a>
                        <a className="text-label-sm text-on-surface-variant hover:text-primary hover:underline transition-all" href="/">Help Center</a>
                    </div>
                    <div className="text-label-sm text-on-surface-variant">© 2024 HireFlow. All rights reserved.</div>
                </div>
            </footer>

        </div>
    );
}