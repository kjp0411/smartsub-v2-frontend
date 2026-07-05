import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../api/client';

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get('storeId');
  const tableNumber = searchParams.get('tableNumber') ?? '0';

  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    if (!storeId) {
      setError('매장 정보를 찾을 수 없습니다. QR을 다시 스캔해주세요.');
      return;
    }

    const userQuestion = question;
    setMessages((prev) => [...prev, { role: 'user', text: userQuestion }]);
    setQuestion('');
    setLoading(true);
    setError('');

    try {
      const res = await client.post('/guide/chat', {
        storeId,
        tableNumber,
        question: userQuestion,
      });
      setMessages((prev) => [...prev, { role: 'bot', text: res.data.answer }]);
    } catch (err) {
      setError('답변을 받아오지 못했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (!storeId) {
    return (
      <div className="page">
        <h1>AI 점장 챗봇</h1>
        <p className="error">
          매장 정보가 없습니다. 테이블의 QR 코드를 다시 스캔해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="page chat-page">
      <h1>무엇이 궁금하신가요?</h1>

      <div className="chat-log">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="chat-bubble bot">답변을 생각하고 있어요...</div>}
      </div>

      <form onSubmit={handleSend} className="chat-input-row">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="예: 화장실이 어디예요?"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>전송</button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
}