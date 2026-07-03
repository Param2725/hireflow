import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await API.post('/auth/logout');
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center">
            <div className="card rounded-xl p-10 text-center">
                <h2 className="text-2xl font-bold text-primary mb-2">
                    Welcome, {user?.name} 👋
                </h2>
                <p className="text-on-surface-variant text-sm mb-1">
                    {user?.email}
                </p>
                <p className="text-on-surface-variant text-sm mb-6 capitalize">
                    Role: {user?.role}
                </p>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg text-sm hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}