import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await client.post('/auth/signin', { email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      navigate('/stores');
    } catch (err) {
      setError(err.response?.data?.message ?? '로그인에 실패했습니다.');
    }
  };

  return (
    <div className="page">
      <h1>SmartSub 사장님 로그인</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">로그인</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}