/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await API.post('/auth/login', { email, password });
            login(res.data.user, res.data.accessToken);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-surface text-on-surface">

            {/* ── HEADER ── */}
            <header className="bg-surface-container-lowest sticky top-0 border-b border-outline-variant shadow-sm z-50">
                <nav className="flex justify-between items-center w-full px-md lg:px-lg max-w-[1280px] mx-auto h-16">

                    <div className="flex items-center gap-xl">
                        <span className="text-headline-md font-bold text-primary">HireFlow</span>
                        <nav className="hidden md:flex gap-md items-center h-full">
                            <Link to="/jobs" className="text-secondary font-semibold border-b-2 border-secondary pb-1 text-body-md">
                                Find Jobs
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-md">
                        <Link
                            to="/login"
                            className="hidden md:block text-body-md text-secondary hover:opacity-80 transition-opacity"
                        >
                            Sign In
                        </Link>
                        <button className="bg-secondary text-on-primary px-md py-sm rounded-lg text-label-md hover:opacity-90 active:scale-95 transition-all">
                            Post a Job
                        </button>
                    </div>

                </nav>
            </header>

            {/* ── MAIN ── */}
            <main className="flex-grow flex items-center justify-center py-xl px-md">

                <div className="w-full max-w-[440px] bg-white p-md md:p-lg rounded-xl level-1-shadow border border-outline-variant">

                    {/* Title */}
                    <div className="text-center mb-lg">
                        <h1 className="text-headline-lg text-primary mb-xs">Welcome back</h1>
                        <p className="text-body-md text-on-surface-variant">Please enter your details to sign in.</p>
                    </div>

                    {/* Form */}
                    <form className="space-y-md" onSubmit={handleSubmit}>

                        {/* Email */}
                        <div className="space-y-xs">
                            <label className="text-label-sm text-on-surface-variant ml-1" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="w-full h-12 px-md rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface input-focus-ring transition-all duration-200"
                                id="email"
                                placeholder="Enter your email"
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-xs">
                            <div className="flex justify-between items-center">
                                <label className="text-label-sm text-on-surface-variant ml-1" htmlFor="password">
                                    Password
                                </label>
                                <Link to="/forgot-password" className="text-label-sm text-secondary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                className="w-full h-12 px-md rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface input-focus-ring transition-all duration-200"
                                id="password"
                                placeholder="••••••••"
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center gap-base py-xs">
                            <input
                                className="w-4 h-4 rounded border-outline-variant text-secondary focus:ring-secondary"
                                id="remember"
                                type="checkbox"
                            />
                            <label className="text-body-sm text-on-surface-variant cursor-pointer" htmlFor="remember">
                                Remember me for 30 days
                            </label>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-red-500 text-sm text-center">{error}</p>
                        )}

                        {/* Login Button */}
                        <button
                            className="w-full h-12 bg-secondary text-on-primary rounded-lg text-headline-sm hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-sm mt-md disabled:opacity-60"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">progress_activity</span>
                                    Logging in...
                                </>
                            ) : 'Login'}
                        </button>

                    </form>

                    {/* Register Link */}
                    <p className="text-center mt-lg text-body-sm text-on-surface-variant">
                        Don't have an account?{' '}
                        <Link className="text-secondary font-semibold hover:underline" to="/register">
                            Register
                        </Link>
                    </p>

                </div>
            </main>

            {/* ── FOOTER ── */}
            <footer className="bg-primary mt-lg">
                <div className="flex flex-col md:flex-row justify-between items-center w-full px-md lg:px-lg py-lg max-w-[1280px] mx-auto">
                    <div className="mb-md md:mb-0">
                        <span className="text-headline-sm font-bold text-on-primary">HireFlow</span>
                        <p className="text-body-sm text-on-primary opacity-80 mt-base">© 2024 HireFlow. All rights reserved.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-md">
                        <a className="text-body-sm text-on-primary opacity-80 hover:opacity-100 transition-all" href="/">About Us</a>
                        <a className="text-body-sm text-on-primary opacity-80 hover:opacity-100 transition-all" href="/">Terms of Service</a>
                        <a className="text-body-sm text-on-primary opacity-80 hover:opacity-100 transition-all" href="/">Privacy Policy</a>
                        <a className="text-body-sm text-on-primary opacity-80 hover:opacity-100 transition-all" href="/">Help Center</a>
                        <a className="text-body-sm text-on-primary opacity-80 hover:opacity-100 transition-all" href="/">Contact</a>
                    </div>
                </div>
            </footer>

        </div>
    );
}