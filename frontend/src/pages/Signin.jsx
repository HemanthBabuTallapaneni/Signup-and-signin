import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Signin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const successMessage = location.state?.message || '';

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username: formData.username,
                password: formData.password
            }, {
                withCredentials: true // To ensure cookies are handled if backend sends them
            });

            if (response.status === 200) {
                // Navigate to dashboard and pass the username
                navigate('/dashboard', { state: { username: response.data.user.username } });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card">
            <div>
                <h2>Welcome Back</h2>
                <p className="subtitle">Sign in to access your dashboard.</p>
            </div>

            {successMessage && <div className="success-message">{successMessage}</div>}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="johndoe"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>

            <div className="form-footer">
                Don't have an account? <Link to="/signup">Sign Up</Link>
            </div>
        </div>
    );
};

export default Signin;
