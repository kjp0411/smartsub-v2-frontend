import { useEffect, useState } from 'react';
import client from '../api/client';

const CATEGORY_LABELS = {
  MENU: '메뉴',
  PARKING: '주차',
  FACILITY: '시설',
  HOURS: '영업시간',
  EVENT: '이벤트',
  LOCATION: '위치',
  ETC: '기타',
};

function formatDate(isoString) {
  return isoString.slice(0, 10);
}

export default function ReportPage() {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      const res = await client.get('/reports');
      setReports(res.data);
    } catch (err) {
      setError('리포트를 불러오지 못했습니다.');
    }
  };

  const fetchDetail = async (reportId) => {
    try {
      const res = await client.get(`/reports/${reportId}`);
      setSelected(res.data);
    } catch (err) {
      setError('리포트 상세를 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="page">
      <h1>주간 인사이트 리포트</h1>

      {error && <p className="error">{error}</p>}

      {reports.length === 0 && !error && (
        <p className="hint">
          아직 생성된 리포트가 없습니다. 매주 월요일에 지난 주 리포트가 자동으로 생성됩니다.
        </p>
      )}

      <ul className="report-list">
        {reports.map((report) => (
          <li key={report.reportId}>
            <button type="button" onClick={() => fetchDetail(report.reportId)}>
              {formatDate(report.weekStart)} ~ {formatDate(report.weekEnd)}
              {' — '}총 {report.totalCount}건, 최다 문의: {CATEGORY_LABELS[report.topCategory] ?? report.topCategory}
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <div className="report-detail">
          <h2>
            {formatDate(selected.weekStart)} ~ {formatDate(selected.weekEnd)} 상세
          </h2>
          <p>총 문의: {selected.totalCount}건</p>
          <p>가장 많이 나온 주제: {CATEGORY_LABELS[selected.topCategory] ?? selected.topCategory}</p>

          <h3>카테고리별 분포</h3>
          <ul>
            {Object.entries(selected.categoryDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => (
                <li key={category}>
                  {CATEGORY_LABELS[category] ?? category}: {count}건
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}