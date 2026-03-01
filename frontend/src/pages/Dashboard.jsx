import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const username = location.state?.username;

    useEffect(() => {
        // Basic protection: if no username in state, redirect to signin
        if (!username) {
            navigate('/signin');
        }
    }, [username, navigate]);

    if (!username) return null;

    return (
        <div className="dashboard-container">
            <div className="glass-card dashboard-card">
                <h1>Welcome, {username}!</h1>
                <p>
                    You have successfully authenticated into the premium dashboard.
                    This is a protected area designed with glassmorphic principles.
                </p>
                <button
                    className="btn-primary"
                    onClick={() => navigate('/signin', { replace: true })}
                    style={{ width: 'auto', padding: '1rem 2rem', marginTop: '2rem' }}
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
