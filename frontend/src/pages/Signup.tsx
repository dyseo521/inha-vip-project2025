import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'buyer' as 'buyer' | 'seller',
    companyName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다');
      return;
    }

    setIsLoading(true);

    try {
      await signup(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
        formData.companyName || undefined
      );
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <div className="logo">EECAR</div>
          <h1>회원가입</h1>
          <p className="subtitle">EECAR에 오신 것을 환영합니다</p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="role">계정 유형 *</label>
              <div className="role-selector">
                <button
                  type="button"
                  className={`role-button ${formData.role === 'buyer' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, role: 'buyer' })}
                >
                  🛒 구매자
                </button>
                <button
                  type="button"
                  className={`role-button ${formData.role === 'seller' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, role: 'seller' })}
                >
                  💼 판매자
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name">이름 *</label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="홍길동"
              />
            </div>

            <div className="form-group">
              <label htmlFor="companyName">회사명 (선택사항)</label>
              <input
                id="companyName"
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="회사명을 입력하세요"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">이메일 *</label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">비밀번호 *</label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="최소 6자 이상"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">비밀번호 확인 *</label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <div className="link-section">
            <p>
              이미 계정이 있으신가요? <Link to="/login">로그인</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .signup-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0055f4 0%, #0080ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .signup-container {
          max-width: 500px;
          width: 100%;
        }

        .signup-card {
          background: white;
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-height: 90vh;
          overflow-y: auto;
        }

        .logo {
          font-size: 3rem;
          font-weight: 900;
          background: linear-gradient(135deg, #0055f4 0%, #0080ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-align: center;
          margin-bottom: 1rem;
          letter-spacing: -0.05em;
        }

        .signup-card h1 {
          margin: 0 0 0.5rem 0;
          text-align: center;
          color: #1f2937;
          font-size: 1.75rem;
        }

        .subtitle {
          text-align: center;
          color: #6b7280;
          margin: 0 0 2rem 0;
          font-size: 0.9375rem;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          padding: 0.875rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          border-left: 4px solid #dc2626;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #374151;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.9375rem;
          font-family: inherit;
          transition: all 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #0055f4;
          box-shadow: 0 0 0 3px rgba(0, 85, 244, 0.1);
        }

        .role-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .role-button {
          padding: 1rem;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .role-button:hover {
          border-color: #0055f4;
          background: rgba(0, 85, 244, 0.05);
        }

        .role-button.active {
          border-color: #0055f4;
          background: linear-gradient(135deg, rgba(0, 85, 244, 0.1) 0%, rgba(0, 128, 255, 0.1) 100%);
          color: #0055f4;
        }

        .submit-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #0055f4 0%, #0080ff 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1.0625rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 0.5rem;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 85, 244, 0.4);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .link-section {
          margin-top: 1.5rem;
          text-align: center;
        }

        .link-section p {
          margin: 0;
          color: #6b7280;
          font-size: 0.9375rem;
        }

        .link-section a {
          color: #0055f4;
          text-decoration: none;
          font-weight: 600;
        }

        .link-section a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .signup-card {
            padding: 2rem 1.5rem;
          }

          .logo {
            font-size: 2.5rem;
          }

          .signup-card h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
