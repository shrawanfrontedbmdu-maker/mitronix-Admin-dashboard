import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    MdLock,
    MdPerson,
    MdBusiness,
    MdPhone,
    MdVisibility,
    MdVisibilityOff,
    MdPersonAdd,
    MdCheck
} from 'react-icons/md';

function Signup() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',

        phone: '',

        password: '',
        confirmPassword: '',

    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        if (!formData.firstName || !formData.lastName || !formData.password) {
            setError('Please fill in all required fields');
            return false;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }



        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user', JSON.stringify({
                name: `${formData.firstName} ${formData.lastName}`,
                role: 'administrator'
            }));
            
            navigate('/dashboard');
        } catch (error) {
            setError('Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="auth-overlay"></div>
            </div>
            
            <div className="auth-content-centered">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-logo">
                            <MdBusiness className="logo-icon" />
                            <span className="logo-text">Mittronix</span>
                        </div>
                        <h1>Create Account</h1>
                        <p>Join our admin dashboard platform</p>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name *</label>
                                <div className="input-group">
                                    <MdPerson className="input-icon" />
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="Enter first name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName">Last Name *</label>
                                <div className="input-group">
                                    <MdPerson className="input-icon" />
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Enter last name"
                                        required
                                    />
                                </div>
                            </div>
                        </div>



                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <div className="input-group">
                                <MdPhone className="input-icon" />
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password *</label>
                            <div className="input-group">
                                <MdLock className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Create a password"
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
                            <div className="password-requirements">
                                <small>Password must be at least 8 characters long</small>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password *</label>
                            <div className="input-group">
                                <MdLock className="input-icon" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm your password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
                                </button>
                            </div>
                        </div>



                        <button
                            type="submit"
                            className="auth-btn primary"
                            disabled={loading}
                        >
                            <MdPersonAdd size={20} />
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/login">Sign in here</Link></p>
                    </div>
                </div>


            </div>

            <style>{`
                .auth-container {
                    min-height: 100vh;
                    width: 100%;
                    height: 100vh;
                    display: flex;
                    position: relative;
                    background: white;
                }

                .auth-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1;
                }

                .auth-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    // background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(2px);
                }

                .auth-content-centered {
                    display: flex;
                    flex: 1;
                    z-index: 2;
                    position: relative;
                    justify-content: center;
                    align-items: center;
                    padding: 40px 20px;
                }

                .auth-card {
                    background: white;
                    width: 100%;
                    max-width: 550px;
                    position: relative;
                    padding: 32px 28px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.1);
                    border-radius: 12px;
                    max-height: 90vh;
                    overflow-y: auto;
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
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
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
                    left: 14px;
                    color: #666;
                    font-size: 18px;
                    z-index: 1;
                }

                .input-group input {
                    width: 100%;
                    padding: 14px 14px 14px 42px;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    font-size: 14px;
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
                    right: 14px;
                    background: none;
                    border: none;
                    color: #666;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    font-size: 18px;
                    transition: color 0.2s;
                }

                .password-toggle:hover {
                    color: #333;
                }

                .password-requirements {
                    margin-top: 4px;
                }

                .password-requirements small {
                    color: #666;
                    font-size: 12px;
                }

                .form-options {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .checkbox-label {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #666;
                    line-height: 1.4;
                }

                .checkbox-label input[type="checkbox"] {
                    margin: 0;
                    margin-top: 2px;
                    width: auto;
                    flex-shrink: 0;
                }

                .checkbox-text a {
                    color: #ffc007;
                    text-decoration: none;
                    font-weight: 500;
                }

                .checkbox-text a:hover {
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
                    margin-top: 8px;
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
                    gap: 20px;
                    max-width: 500px;
                    margin: 0 auto;
                }

                .feature-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .feature-icon {
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .check-icon {
                    font-size: 20px;
                    color: #ffc007;
                }

                .feature-content h3 {
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0 0 6px 0;
                }

                .feature-content p {
                    margin: 0;
                    opacity: 0.9;
                    line-height: 1.5;
                    font-size: 14px;
                }

                @media (max-width: 768px) {
                    .auth-content {
                        flex-direction: column;
                    }

                    .auth-card {
                        width: 100%;
                        padding: 32px 24px;
                        max-height: none;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                        gap: 20px;
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
                }

                @media (max-width: 480px) {
                    .auth-card {
                        padding: 24px 16px;
                    }

                    .input-group input {
                        padding: 12px 12px 12px 38px;
                        font-size: 14px;
                    }

                    .input-icon {
                        left: 12px;
                        font-size: 16px;
                    }

                    .password-toggle {
                        right: 12px;
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

export default Signup;
