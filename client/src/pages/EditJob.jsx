/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function EditJob() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('');
    const [salaryMin, setSalaryMin] = useState('');
    const [salaryMax, setSalaryMax] = useState('');
    const [description, setDescription] = useState('');
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    if (!user || user.role !== 'recruiter') {
        navigate('/jobs');
    }

    useEffect(() => {
        fetchJob();
    }, [id]);

    const fetchJob = async () => {
        setFetching(true);
        try {
            const res = await API.get(`/jobs/${id}`);
            const job = res.data.job;
            setTitle(job.title);
            setCompany(job.company);
            setLocation(job.location);
            setType(job.type);
            setSalaryMin(job.salaryMin);
            setSalaryMax(job.salaryMax);
            setDescription(job.description);
            setSkills(job.skills);
        } catch (err) {
            setError('Failed to load job');
        } finally {
            setFetching(false);
        }
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = skillInput.trim();
            if (val && !skills.includes(val)) {
                setSkills([...skills, val]);
                setSkillInput('');
            }
        }
        if (e.key === 'Backspace' && skillInput === '' && skills.length > 0) {
            setSkills(skills.slice(0, -1));
        }
    };

    const removeSkill = (skillToRemove) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (skills.length === 0) {
            setError('Please add at least one skill');
            return;
        }
        setLoading(true);
        try {
            await API.patch(`/jobs/${id}`, {
                title,
                company,
                location,
                type,
                salaryMin: Number(salaryMin),
                salaryMax: Number(salaryMax),
                skills,
                description
            });
            navigate(`/jobs/${id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update job');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-secondary text-[40px]">
                    progress_activity
                </span>
            </div>
        );
    }

    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col">

            {/* ── HEADER ── */}
            <header className="bg-surface-container-lowest border-b border-outline-variant shadow-sm sticky top-0 z-50 h-16 w-full">
                <div className="flex justify-between items-center w-full px-md lg:px-lg max-w-[1280px] mx-auto h-full">
                    <div className="flex items-center gap-xl">
                        <Link to="/" className="text-headline-md font-bold text-primary">HireFlow</Link>
                        <nav className="hidden md:flex items-center gap-md">
                            <Link to="/jobs" className="text-body-md text-on-surface-variant hover:text-secondary">Find Jobs</Link>
                            <Link to="/dashboard" className="text-body-md text-on-surface-variant hover:text-secondary">Dashboard</Link>
                        </nav>
                    </div>
                    <Link
                        to="/dashboard"
                        className="bg-primary text-on-primary px-md py-xs rounded-lg text-label-md hover:opacity-90"
                    >
                        Dashboard
                    </Link>
                </div>
            </header>

            {/* ── MAIN ── */}
            <main className="flex-grow py-xl px-md">
                <div className="max-w-4xl mx-auto">

                    <div className="mb-lg">
                        <h1 className="text-headline-xl text-primary mb-xs">Edit Job</h1>
                        <p className="text-body-lg text-on-surface-variant">Update your job listing details.</p>
                    </div>

                    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-md lg:p-lg">
                        <form className="space-y-lg" onSubmit={handleSubmit}>

                            {/* Title + Company */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                                <div className="flex flex-col gap-xs">
                                    <label className="text-label-md text-on-surface" htmlFor="job_title">Job Title</label>
                                    <input
                                        className="w-full px-md py-3 rounded-lg border border-outline-variant bg-surface text-on-surface text-body-md form-input-focus transition-all"
                                        id="job_title"
                                        placeholder="e.g. Senior Software Engineer"
                                        required
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-xs">
                                    <label className="text-label-md text-on-surface" htmlFor="company_name">Company Name</label>
                                    <input
                                        className="w-full px-md py-3 rounded-lg border border-outline-variant bg-surface text-on-surface text-body-md form-input-focus transition-all"
                                        id="company_name"
                                        placeholder="Your Company Ltd."
                                        required
                                        type="text"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Location + Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                                <div className="flex flex-col gap-xs">
                                    <label className="text-label-md text-on-surface" htmlFor="location">Location</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">location_on</span>
                                        <input
                                            className="pl-10 w-full px-md py-3 rounded-lg border border-outline-variant bg-surface text-on-surface text-body-md form-input-focus transition-all"
                                            id="location"
                                            placeholder="City, State or Remote"
                                            required
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-xs">
                                    <label className="text-label-md text-on-surface" htmlFor="job_type">Job Type</label>
                                    <select
                                        className="w-full px-md py-3 rounded-lg border border-outline-variant bg-surface text-on-surface text-body-md form-input-focus transition-all appearance-none"
                                        id="job_type"
                                        required
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                    >
                                        <option value="">Select arrangement</option>
                                        <option value="full-time">Full-time</option>
                                        <option value="part-time">Part-time</option>
                                        <option value="remote">Remote</option>
                                        <option value="hybrid">Hybrid</option>
                                        <option value="internship">Internship</option>
                                    </select>
                                </div>
                            </div>

                            {/* Salary */}
                            <div className="flex flex-col gap-xs">
                                <label className="text-label-md text-on-surface">Salary Range (Annual)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">₹</span>
                                        <input
                                            className="pl-8 w-full px-md py-3 rounded-lg border border-outline-variant bg-surface text-on-surface text-body-md form-input-focus transition-all"
                                            placeholder="Min (e.g. 500000)"
                                            required
                                            type="number"
                                            value={salaryMin}
                                            onChange={(e) => setSalaryMin(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">₹</span>
                                        <input
                                            className="pl-8 w-full px-md py-3 rounded-lg border border-outline-variant bg-surface text-on-surface text-body-md form-input-focus transition-all"
                                            placeholder="Max (e.g. 1200000)"
                                            required
                                            type="number"
                                            value={salaryMax}
                                            onChange={(e) => setSalaryMax(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="flex flex-col gap-xs">
                                <label className="text-label-md text-on-surface">Skills Required</label>
                                <div className="flex flex-wrap gap-xs p-2 min-h-[50px] rounded-lg border border-outline-variant bg-surface focus-within:border-secondary transition-all">
                                    {skills.map((skill, index) => (
                                        <div
                                            key={index}
                                            className="bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full flex items-center gap-xs text-label-md"
                                        >
                                            <span>{skill}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(skill)}
                                                className="material-symbols-outlined text-[16px] hover:text-error"
                                            >
                                                close
                                            </button>
                                        </div>
                                    ))}
                                    <input
                                        className="flex-grow bg-transparent border-none focus:ring-0 text-on-surface text-body-md px-2 py-1"
                                        placeholder="Type skill and press Enter..."
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={handleSkillKeyDown}
                                    />
                                </div>
                                <p className="text-xs text-on-surface-variant">Press Enter to add each skill.</p>
                            </div>

                            {/* Description */}
                            <div className="flex flex-col gap-xs">
                                <label className="text-label-md text-on-surface">Job Description</label>
                                <div className="bg-surface-container-low rounded-lg p-sm mb-xs text-label-sm text-on-surface-variant">
                                    <span className="font-semibold text-primary">Formatting tips:</span>
                                    {' '}Use <code className="bg-surface-container px-xs rounded">-</code> for bullets,{' '}
                                    <code className="bg-surface-container px-xs rounded">1.</code> for numbered lists,{' '}
                                    <code className="bg-surface-container px-xs rounded">**text**</code> for bold.
                                </div>
                                <textarea
                                    className="w-full px-md py-3 rounded-lg border border-outline-variant bg-surface text-on-surface text-body-md form-input-focus transition-all custom-scrollbar resize-none"
                                    placeholder="Describe the role..."
                                    required
                                    rows={10}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm text-center">{error}</p>
                            )}

                            {/* Actions */}
                            <div className="pt-md border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-md">
                                <Link
                                    to={`/jobs/${id}`}
                                    className="text-secondary font-semibold hover:underline order-2 md:order-1"
                                >
                                    Cancel
                                </Link>
                                <button
                                    className="w-full md:w-auto px-xl py-3 bg-secondary text-on-secondary rounded-lg text-headline-sm shadow-sm hover:opacity-95 active:scale-95 transition-all order-1 md:order-2 disabled:opacity-60 flex items-center justify-center gap-xs"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                            Updating...
                                        </>
                                    ) : 'Update Job'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </main>

            {/* ── FOOTER ── */}
            <footer className="bg-primary mt-lg">
                <div className="flex flex-col md:flex-row justify-between items-center w-full px-md lg:px-lg py-lg max-w-[1280px] mx-auto">
                    <span className="text-headline-sm font-bold text-on-primary">HireFlow</span>
                    <p className="text-body-sm opacity-60 text-on-primary">© 2024 HireFlow. All rights reserved.</p>
                </div>
            </footer>

        </div>
    );
}