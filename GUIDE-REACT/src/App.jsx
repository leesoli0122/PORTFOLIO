import { Routes, Route, Link } from 'react-router-dom';
import MainPage from '@/pages/MainPage';
import ComponentPage from '@/pages/ComponentPage';

function App() {
  return (
    <>
      {/* {임시 네비게이션 - 나중에 header 컴포넌트로 분리} */}
      <nav style={{ position: 'fixed', display: 'flex', gap: '16px', width: '100%', padding: '12px  24px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff', zIndex: 100 }}>
        <Link to="/">홈</Link>
        <Link to="/components">컴포넌트</Link>
      </nav>

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/components" element={<ComponentPage />} />
      </Routes>
    </>
  )
}

export default App;