import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import client from '../api/client';
import { decodeToken } from '../utils/jwt';

export default function StorePage() {
  const [stores, setStores] = useState([]);
  const [form, setForm] = useState({
    name: '',
    commonInfo: '',
    promptTemplate: '당신은 매장의 AI 점장입니다. 손님 질문에 친절하게 답변하세요.',
    status: 'ACTIVE',
  });
  const [error, setError] = useState('');

  const [qrTargetStoreId, setQrTargetStoreId] = useState(null);
  const [tableNumber, setTableNumber] = useState('1');

  const baseUrl = window.location.origin;

  const fetchStores = async () => {
    try {
      const res = await client.get('/stores');
      setStores(res.data);
    } catch (err) {
      setError('매장 목록을 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const { sub: userId } = decodeToken(token);

      await client.post('/stores', { ...form, userId });
      setForm({ ...form, name: '', commonInfo: '' });
      fetchStores();
    } catch (err) {
      setError(err.response?.data?.message ?? '매장 등록에 실패했습니다.');
    }
  };

  const handleDelete = async (storeId) => {
    if (!confirm('이 매장을 삭제하시겠습니까?')) return;
    try {
      await client.delete(`/stores/${storeId}`);
      fetchStores();
    } catch (err) {
      setError('매장 삭제에 실패했습니다.');
    }
  };

  const buildChatUrl = (storeId, table) => {
    return `${baseUrl}/chat?storeId=${storeId}&tableNumber=${table}`;
  };

  const handleDownloadQr = (storeName, table) => {
    const canvas = document.getElementById(`qr-canvas-${qrTargetStoreId}`);
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${storeName}_테이블${table}_QR.png`;
    link.click();
  };

  return (
    <div className="page">
      <h1>매장 관리</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="매장 이름"
          value={form.name}
          onChange={handleChange}
          required
        />
        <textarea
          name="commonInfo"
          placeholder="매장 공통 안내사항 (예: 화장실 위치, 주차 안내 등)"
          value={form.commonInfo}
          onChange={handleChange}
        />
        <textarea
          name="promptTemplate"
          placeholder="AI 프롬프트 템플릿"
          value={form.promptTemplate}
          onChange={handleChange}
          required
        />
        <button type="submit">매장 등록</button>
      </form>

      {error && <p className="error">{error}</p>}

      <h2>내 매장 목록</h2>
      <ul>
        {stores.map((store) => (
          <li key={store.storeId}>
            <strong>{store.name}</strong> ({store.status})
            <button onClick={() => handleDelete(store.storeId)}>삭제</button>
            <button
              onClick={() =>
                setQrTargetStoreId(qrTargetStoreId === store.storeId ? null : store.storeId)
              }
            >
              QR 생성
            </button>

            {qrTargetStoreId === store.storeId && (
              <div className="qr-panel">
                <label>
                  테이블 번호:{' '}
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                  />
                </label>

                <p className="qr-url">{buildChatUrl(store.storeId, tableNumber)}</p>

                <QRCodeCanvas
                  id={`qr-canvas-${store.storeId}`}
                  value={buildChatUrl(store.storeId, tableNumber)}
                  size={200}
                />

                <div>
                  <button onClick={() => handleDownloadQr(store.name, tableNumber)}>
                    PNG 다운로드
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}