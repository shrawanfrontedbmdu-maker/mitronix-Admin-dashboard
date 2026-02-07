import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    MdEmail, 
    MdLock, 
    MdVisibility, 
    MdVisibilityOff,
    MdLogin,
    MdBusiness
} from 'react-icons/md';

function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.email || !formData.password) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user', JSON.stringify({
                email: formData.email,
                name: 'Admin User',
                role: 'administrator'
            }));
            
            navigate('/dashboard');
        } catch (error) {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-background">
            </div>
            
            <div className="auth-content-centered">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-logo">
                            <MdBusiness className="logo-icon" />
                            <span className="logo-text">Mittronix</span>
                        </div>
                        <h1>Welcome Back</h1>
                        <p>Sign in to your admin dashboard</p>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-group">
                                <MdEmail className="input-icon" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-group">
                                <MdLock className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleInputChange}
                                />
                                <span className="checkbox-text">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="forgot-link">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="auth-btn primary"
                            disabled={loading}
                        >
                            <MdLogin size={20} />
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                .auth-container {
                    min-height: 100vh;
                    display: flex;
                    width: 100%;
                    height: 100vh;
                    position: relative;
                    background: #fff;
                    overflow: hidden;
                }

                .auth-overlay {
                    position: absolute;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    backdrop-filter: blur(2px);
                }

                .auth-content-centered {
                    display: flex;
                    flex: 1;
                    z-index: 2;
                    width: 100%;
                    height: 100%;
                    position: relative;
                    justify-content: center;
                    align-items: center;
                    padding: 40px 20px;
                }

                .auth-card {
                    background: white;
                    width: 100%;
                    max-width: 450px;
                    padding: 32px 28px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.1);
                    border-radius: 12px;
                }

                .auth-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .auth-logo {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .logo-icon {
                    font-size: 32px;
                    color: #ffc007;
                }

                .logo-text {
                    font-size: 24px;
                    font-weight: 700;
                    color: #333;
                }

                .auth-header h1 {
                    font-size: 28px;
                    font-weight: 700;
                    color: #333;
                    margin: 0 0 8px 0;
                }

                .auth-header p {
                    color: #666;
                    margin: 0;
                    font-size: 16px;
                }

                .error-message {
                    background: #f8d7da;
                    color: #721c24;
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 24px;
                    border: 1px solid #f5c6cb;
                    font-size: 14px;
                }

                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    position: relative;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .form-group label {
                    font-weight: 600;
                    color: #333;
                    font-size: 14px;
                }

                .input-group {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 16px;
                    color: #666;
                    font-size: 20px;
                    z-index: 1;
                }

                .input-group input {
                    width: 100%;
                    padding: 16px 16px 16px 48px;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    font-size: 16px;
                    transition: all 0.2s;
                    background: #f8f9fa;
                }

                .input-group input:focus {
                    outline: none;
                    border-color: #ffc007;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(255, 192, 7, 0.1);
                }

                .password-toggle {
                    position: absolute;
                    right: 16px;
                    background: none;
                    border: none;
                    color: #666;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    font-size: 20px;
                    transition: color 0.2s;
                }

                .password-toggle:hover {
                    color: #333;
                }

                .form-options {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #666;
                }

                .checkbox-label input[type="checkbox"] {
                    margin: 0;
                    width: auto;
                }

                .forgot-link {
                    color: #ffc007;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                }

                .forgot-link:hover {
                    text-decoration: underline;
                }

                .auth-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 16px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-decoration: none;
                }

                .auth-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                }

                .auth-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .auth-btn.primary {
                    background: #ffc007;
                    color: #333;
                }

                .auth-btn.primary:hover:not(:disabled) {
                    background: #e6ac06;
                }

                .auth-footer {
                    text-align: center;
                    margin-top: 32px;
                    padding-top: 24px;
                    border-top: 1px solid #e9ecef;
                }

                .auth-footer p {
                    color: #666;
                    margin: 0;
                    font-size: 14px;
                }

                .auth-footer a {
                    color: #ffc007;
                    text-decoration: none;
                    font-weight: 600;
                }

                .auth-footer a:hover {
                    text-decoration: underline;
                }

                .auth-features {
                    flex: 1;
                    padding: 48px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    color: white;
                }

                .auth-features h2 {
                    font-size: 36px;
                    font-weight: 700;
                    margin-bottom: 32px;
                    text-align: center;
                }

                .feature-list {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    max-width: 500px;
                    margin: 0 auto;
                }

                .feature-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 24px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .feature-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }

                .feature-content h3 {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0 0 8px 0;
                }

                .feature-content p {
                    margin: 0;
                    opacity: 0.9;
                    line-height: 1.5;
                }

                @media (max-width: 768px) {
                    .auth-content {
                        flex-direction: column;
                    }

                    .auth-card {
                        width: 100%;
                        padding: 32px 24px;
                    }

                    .auth-features {
                        padding: 32px 24px;
                        order: -1;
                    }

                    .auth-features h2 {
                        font-size: 28px;
                        margin-bottom: 24px;
                    }

                    .feature-item {
                        padding: 16px;
                    }

                    .form-options {
                        flex-direction: column;
                        gap: 16px;
                        align-items: flex-start;
                    }
                }

                @media (max-width: 480px) {
                    .auth-card {
                        padding: 24px 16px;
                    }

                    .input-group input {
                        padding: 14px 14px 14px 44px;
                        font-size: 16px;
                    }

                    .auth-btn {
                        padding: 14px 20px;
                    }
                }
            `}</style>
        </div>
    );
}

export default Login;
