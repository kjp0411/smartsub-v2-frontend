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
      <nav className="app-nav">
        <Link to="/stores">매장 관리</Link>
        <Link to="/guide">가이드 문서</Link>
        <Link to="/reports">인사이트 리포트</Link>
        <button className="logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </nav>
      <Outlet />
    </div>
  );
}