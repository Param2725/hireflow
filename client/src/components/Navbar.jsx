import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await API.post('/auth/logout');
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
            <Link to="/" className="text-xl font-bold text-primary">
                HireFlow
            </Link>

            <div className="flex items-center gap-6">
                <Link to="/jobs" className="text-sm text-on-surface-variant hover:text-secondary">
                    Browse Jobs
                </Link>

                {user ? (
                    <>
                        <Link to="/dashboard" className="text-sm text-on-surface-variant hover:text-secondary">
                            Dashboard
                        </Link>

                        {/* Seeker — My Applications link */}
                        {user.role === 'seeker' && (
                            <Link to="/my-applications" className="text-sm text-on-surface-variant hover:text-secondary">
                                My Applications
                            </Link>
                        )}

                        {/* Recruiter — Post a Job link */}
                        {user.role === 'recruiter' && (
                            <Link to="/post-job" className="text-sm text-on-surface-variant hover:text-secondary">
                                Post a Job
                            </Link>
                        )}

                        <button
                            onClick={handleLogout}
                            className="text-sm bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-sm text-on-surface-variant hover:text-secondary">
                            Login
                        </Link>
                        <Link to="/register" className="text-sm bg-secondary text-white px-4 py-1.5 rounded-lg hover:opacity-90">
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
