import { useState } from 'react';
import API from '../api/axios';

export default function ApplyModal({ jobId, jobTitle, onClose, onSuccess }) {

    const [coverLetter, setCoverLetter] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResumeFile(file);
            setFileName(file.name);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!coverLetter.trim()) {
            setError('Please write a cover letter');
            return;
        }
        if (!resumeFile) {
            setError('Please upload your resume PDF');
            return;
        }

        setLoading(true);
        try {
            // FormData — not JSON — because we are uploading a file
            const formData = new FormData();
            formData.append('coverLetter', coverLetter);
            formData.append('resume', resumeFile);

            await API.post(`/applications/${jobId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccess(true);
            if (onSuccess) onSuccess();

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    return (
        // Overlay
        <div className="fixed inset-0 z-50 glass-effect flex items-center justify-center p-gutter">

            {/* Modal card */}
            <div className="bg-surface-container-lowest w-full max-w-xl rounded-xl shadow-2xl border border-outline-variant">

                {/* Header */}
                <div className="px-md py-sm border-b border-outline-variant flex justify-between items-center">
                    <h2 className="text-headline-md text-primary">
                        Apply for {jobTitle}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Success state */}
                {success ? (
                    <div className="p-lg text-center">
                        <div className="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center mx-auto mb-md">
                            <span className="material-symbols-outlined text-[32px] text-on-tertiary-fixed">
                                check_circle
                            </span>
                        </div>
                        <h3 className="text-headline-sm text-primary mb-xs">
                            Application Submitted!
                        </h3>
                        <p className="text-body-sm text-on-surface-variant mb-lg">
                            Your application for {jobTitle} has been sent successfully.
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-secondary text-on-secondary px-lg py-sm rounded-full text-label-md hover:opacity-90 transition-all"
                        >
                            Done
                        </button>
                    </div>
                ) : (

                    /* Form */
                    <form className="p-md space-y-md" onSubmit={handleSubmit}>

                        {/* Cover Letter */}
                        <div className="space-y-xs">
                            <label
                                className="text-label-md text-on-surface-variant"
                                htmlFor="cover-letter"
                            >
                                Cover Letter
                            </label>
                            <textarea
                                className="w-full px-sm py-sm rounded-lg border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all resize-none text-body-md placeholder:text-outline"
                                id="cover-letter"
                                placeholder="Why are you a great fit?"
                                rows={6}
                                required
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                            />
                        </div>

                        {/* Resume Upload */}
                        <div className="space-y-xs">
                            <label className="text-label-md text-on-surface-variant">
                                Resume
                            </label>
                            <div className={`relative border-2 border-dashed rounded-xl p-md flex flex-col items-center justify-center gap-sm cursor-pointer transition-colors
                ${fileName
                                    ? 'border-secondary bg-secondary-fixed/20'
                                    : 'border-outline-variant bg-surface-container-low hover:bg-surface-container'
                                }`}
                            >
                                <input
                                    accept=".pdf"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    id="resume"
                                    type="file"
                                    onChange={handleFileChange}
                                />
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${fileName ? 'bg-tertiary-fixed' : 'bg-secondary-fixed'
                                    }`}>
                                    <span className="material-symbols-outlined text-2xl">
                                        {fileName ? 'check_circle' : 'upload_file'}
                                    </span>
                                </div>
                                <div className="text-center">
                                    <p className={`text-headline-sm ${fileName ? 'text-secondary' : 'text-primary'}`}>
                                        {fileName || 'Click to upload or drag & drop'}
                                    </p>
                                    <p className="text-body-sm text-on-surface-variant">
                                        PDF format only (Max 5MB)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-red-500 text-sm text-center">{error}</p>
                        )}

                        {/* Actions */}
                        <div className="pt-sm flex flex-col md:flex-row-reverse gap-sm items-center">
                            <button
                                className="w-full md:w-auto px-lg h-12 rounded-full bg-secondary text-on-secondary text-headline-sm hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-xs"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined text-[18px] animate-spin">
                                            sync
                                        </span>
                                        Submitting...
                                    </>
                                ) : 'Submit Application'}
                            </button>
                            <button
                                className="w-full md:w-auto px-md h-12 text-label-md text-on-surface-variant hover:text-primary transition-colors"
                                onClick={onClose}
                                type="button"
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                )}

            </div>
        </div>
    );
}