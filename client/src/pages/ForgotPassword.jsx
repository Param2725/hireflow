import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1=email, 2=otp+password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await API.post('/auth/send-otp', { email });
            setSuccess('OTP sent to your email');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await API.post('/auth/reset-password', { email, otp, newPassword });
            setSuccess('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center px-gutter">
            <div className="w-full max-w-[440px] bg-white rounded-xl shadow-sm p-md md:p-lg border border-outline-variant">

                <div className="text-center mb-lg">
                    <Link to="/" className="text-headline-md font-bold text-primary">HireFlow</Link>
                    <h1 className="text-headline-lg text-primary mt-md mb-xs">
                        {step === 1 ? 'Forgot Password' : 'Reset Password'}
                    </h1>
                    <p className="text-body-md text-on-surface-variant">
                        {step === 1
                            ? 'Enter your email to receive an OTP'
                            : `OTP sent to ${email}`}
                    </p>
                </div>

                {/* Step 1 — Email */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-md">
                        <div className="space-y-xs">
                            <label className="text-label-sm text-on-surface-variant ml-1" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="w-full h-12 px-md rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface input-focus-ring transition-all"
                                id="email"
                                placeholder="Enter your email"
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        {success && <p className="text-green-600 text-sm text-center">{success}</p>}

                        <button
                            className="w-full h-12 bg-secondary text-on-secondary rounded-lg text-headline-sm hover:opacity-90 transition-all disabled:opacity-60"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2 — OTP + New Password */}
                {step === 2 && (
                    <form onSubmit={handleResetPassword} className="space-y-md">
                        <div className="space-y-xs">
                            <label className="text-label-sm text-on-surface-variant ml-1">
                                Enter OTP
                            </label>
                            <input
                                className="w-full h-12 px-md rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface input-focus-ring transition-all text-center tracking-[8px] text-headline-md"
                                placeholder="000000"
                                required
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>

                        <div className="space-y-xs">
                            <label className="text-label-sm text-on-surface-variant ml-1">
                                New Password
                            </label>
                            <input
                                className="w-full h-12 px-md rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface input-focus-ring transition-all"
                                placeholder="Min 6 characters"
                                required
                                type="password"
                                minLength={6}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        {success && <p className="text-green-600 text-sm text-center">{success}</p>}

                        <button
                            className="w-full h-12 bg-secondary text-on-secondary rounded-lg text-headline-sm hover:opacity-90 transition-all disabled:opacity-60"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setStep(1); setError(''); setSuccess(''); }}
                            className="w-full text-secondary text-label-md hover:underline"
                        >
                            Resend OTP
                        </button>
                    </form>
                )}

                <p className="text-center text-sm text-on-surface-variant mt-lg">
                    Remember your password?{' '}
                    <Link to="/login" className="text-secondary font-semibold hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}