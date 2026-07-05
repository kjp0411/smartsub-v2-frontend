import { useEffect, useState } from 'react';
import client from '../api/client';

export default function GuidePage() {
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState('');
  const [texts, setTexts] = useState(['']);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const fetchStores = async () => {
    const res = await client.get('/stores');
    setStores(res.data);
    if (res.data.length > 0) {
      setStoreId(res.data[0].storeId);
    }
  };

  const fetchDocuments = async (targetStoreId) => {
    if (!targetStoreId) return;
    try {
      const res = await client.get('/guide/documents', {
        params: { storeId: targetStoreId },
      });
      const contents = res.data.map((doc) => doc.content);
      setTexts(contents.length > 0 ? contents : ['']);
    } catch (err) {
      setError('가이드 문서를 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    fetchDocuments(storeId);
  }, [storeId]);

  const handleTextChange = (index, value) => {
    const next = [...texts];
    next[index] = value;
    setTexts(next);
  };

  const handleAddText = () => {
    setTexts([...texts, '']);
  };

  const handleRemoveText = (index) => {
    setTexts(texts.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setError('');
    setSaved(false);
    const filtered = texts.map((t) => t.trim()).filter((t) => t.length > 0);

    if (filtered.length === 0) {
      setError('최소 1개 이상의 안내 문구가 필요합니다.');
      return;
    }

    try {
      await client.post('/guide/embed', { storeId, texts: filtered });
      setSaved(true);
      fetchDocuments(storeId);
    } catch (err) {
      setError(err.response?.data?.message ?? '저장에 실패했습니다.');
    }
  };

  return (
    <div className="page">
      <h1>가이드 문서 관리</h1>

      <select value={storeId} onChange={(e) => setStoreId(e.target.value)}>
        {stores.map((store) => (
          <option key={store.storeId} value={store.storeId}>
            {store.name}
          </option>
        ))}
      </select>

      <p className="hint">
        손님 챗봇이 답변에 참고하는 안내 문구예요. 저장하면 아래 목록 전체로 교체됩니다.
      </p>

      {texts.map((text, index) => (
        <div key={index} className="guide-row">
          <textarea
            value={text}
            onChange={(e) => handleTextChange(index, e.target.value)}
            placeholder="예: 화장실은 1층 엘리베이터 옆에 있습니다."
          />
          <button type="button" onClick={() => handleRemoveText(index)}>
            삭제
          </button>
        </div>
      ))}

      <button type="button" onClick={handleAddText}>
        + 문구 추가
      </button>

      <div>
        <button type="button" onClick={handleSave}>
          저장 (전체 교체)
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {saved && <p className="success">저장되었습니다.</p>}
    </div>
  );
}