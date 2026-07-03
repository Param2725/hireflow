/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await API.post('/auth/register', { name, email, password, role });
            login(res.data.user, res.data.accessToken);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col">

            {/* ── HEADER ── */}
            <header className="bg-surface-container-lowest border-b border-outline-variant shadow-sm sticky top-0 z-50 h-16 w-full">
                <nav className="flex justify-between items-center w-full px-md lg:px-lg max-w-[1280px] mx-auto h-full">

                    <div className="text-headline-md font-bold text-primary">HireFlow</div>

                    <nav className="hidden md:flex gap-md items-center h-full">
                        <Link to="/jobs" className="text-secondary font-semibold border-b-2 border-secondary pb-1 text-body-md">
                            Find Jobs
                        </Link>
                    </nav>

                    <div className="flex gap-sm">
                        <Link
                            to="/login"
                            className="px-md py-xs text-label-md text-secondary hover:opacity-80 transition-all"
                        >
                            Sign In
                        </Link>
                        <button className="bg-primary text-on-primary px-md py-xs rounded-lg text-label-md hover:opacity-90 transition-all shadow-sm">
                            Post a Job
                        </button>
                    </div>

                </nav>
            </header>

            {/* ── MAIN ── */}
            <main className="flex-1 flex items-center justify-center px-gutter py-xl relative overflow-hidden">

                {/* Background blobs */}
                <div className="absolute inset-0 pointer-events-none opacity-40">
                    <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full blur-[120px] bg-secondary-fixed opacity-30"></div>
                    <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 rounded-full blur-[120px] bg-secondary-fixed opacity-20"></div>
                </div>

                {/* Card */}
                <div className="w-full max-w-[480px] tonal-layer-1 rounded-xl p-md lg:p-lg relative z-10 animate-fade-in-up">

                    {/* Title */}
                    <div className="text-center mb-lg">
                        <h1 className="text-headline-xl text-primary mb-xs">Join HireFlow</h1>
                        <p className="text-body-md text-on-surface-variant">Your career journey starts here.</p>
                    </div>

                    {/* Form */}
                    <form className="space-y-md" onSubmit={handleSubmit}>

                        {/* Full Name */}
                        <div className="space-y-xs">
                            <label className="text-label-md text-on-surface" htmlFor="full_name">
                                Full Name
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[18px]">
                                    person
                                </span>
                                <input
                                    className="w-full h-12 pl-lg pr-md rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md form-input-focus transition-all duration-200"
                                    id="full_name"
                                    placeholder="John Doe"
                                    required
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-xs">
                            <label className="text-label-md text-on-surface" htmlFor="email">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[18px]">
                                    mail
                                </span>
                                <input
                                    className="w-full h-12 pl-lg pr-md rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md form-input-focus transition-all duration-200"
                                    id="email"
                                    placeholder="john@example.com"
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div className="space-y-xs">
                            <label className="text-label-md text-on-surface" htmlFor="role">
                                I am a...
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[18px]">
                                    work
                                </span>
                                <select
                                    className="w-full h-12 pl-lg pr-md rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md form-input-focus transition-all appearance-none cursor-pointer"
                                    id="role"
                                    required
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="">Select your role</option>
                                    <option value="seeker">Job Seeker</option>
                                    <option value="recruiter">Recruiter</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                                    expand_more
                                </span>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-xs">
                            <label className="text-label-md text-on-surface" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[18px]">
                                    lock
                                </span>
                                <input
                                    className="w-full h-12 pl-lg pr-md rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md form-input-focus transition-all duration-200"
                                    id="password"
                                    placeholder="••••••••"
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <p className="text-label-sm text-on-surface-variant opacity-70">
                                At least 6 characters
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-red-500 text-sm text-center">{error}</p>
                        )}

                        {/* Submit */}
                        <div className="pt-base">
                            <button
                                className="w-full h-12 bg-secondary text-on-secondary rounded-lg text-headline-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-xs disabled:opacity-60"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Creating Account...' : (
                                    <>
                                        Create Account
                                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Login link */}
                        <div className="text-center pt-md">
                            <p className="text-body-sm text-on-surface-variant">
                                Already have an account?{' '}
                                <Link className="text-secondary font-semibold hover:underline" to="/login">
                                    Login
                                </Link>
                            </p>
                        </div>

                    </form>
                </div>
            </main>

            {/* ── FOOTER ── */}
            <footer className="bg-primary text-on-primary w-full">
                <div className="flex flex-col md:flex-row justify-between items-center w-full px-md lg:px-lg py-lg max-w-[1280px] mx-auto text-body-sm">
                    <div className="text-headline-sm font-bold text-on-primary mb-md md:mb-0">HireFlow</div>
                    <div className="flex flex-wrap justify-center gap-md mb-md md:mb-0">
                        <a className="text-on-primary opacity-80 hover:opacity-100 transition-all" href="/">About Us</a>
                        <a className="text-on-primary opacity-80 hover:opacity-100 transition-all" href="/">Terms of Service</a>
                        <a className="text-on-primary opacity-80 hover:opacity-100 transition-all" href="/">Privacy Policy</a>
                        <a className="text-on-primary opacity-80 hover:opacity-100 transition-all" href="/">Help Center</a>
                        <a className="text-on-primary opacity-80 hover:opacity-100 transition-all" href="/">Contact</a>
                    </div>
                    <div className="text-on-primary opacity-60">© 2024 HireFlow. All rights reserved.</div>
                </div>
            </footer>

        </div>
    );
}