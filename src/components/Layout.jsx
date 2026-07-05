import { Outlet, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await client.post('/auth/signout');
    } catch (err) {
      // 무시
    } finally {
      localStorage.removeItem('accessToken');
      navigate('/login');
    }
  };

  return (
    <div>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ddd', display: 'flex', gap: '1rem' }}>
        <Link to="/stores">매장 관리</Link>
        <Link to="/guide">가이드 문서</Link>
        <button onClick={handleLogout} style={{ marginLeft: 'auto' }}>
          로그아웃
        </button>
      </nav>
      <Outlet />
    </div>
  );
}