import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { Dashboard } from './pages/Dashboard';
import { Approvals } from './pages/Approvals';

// ── Щоб додати нову сторінку:
// 1. Створіть файл src/pages/MyNewPage.tsx
// 2. Додайте import тут
// 3. Додайте <Route> нижче
// 4. Додайте посилання в navTiles (src/data/dashboard.ts)

function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      <BrowserRouter>
        <Routes>
          <Route path="/"           element={<Dashboard />} />
          <Route path="/approvals"  element={<Approvals />} />

          {/* Заглушки — замініть на реальні сторінки згодом */}
          <Route path="/vacations"  element={<Navigate to="/" replace />} />
          <Route path="/goals"      element={<Navigate to="/" replace />} />
          <Route path="/my-account" element={<Navigate to="/" replace />} />
          <Route path="/learning"   element={<Navigate to="/" replace />} />
          <Route path="/benefits"   element={<Navigate to="/" replace />} />
          <Route path="/policies"   element={<Navigate to="/" replace />} />
          <Route path="/structure"  element={<Navigate to="/" replace />} />
          <Route path="/insurance"  element={<Navigate to="/" replace />} />
          <Route path="/about"      element={<Navigate to="/" replace />} />
          <Route path="/links"      element={<Navigate to="/" replace />} />
          <Route path="/workspace"  element={<Navigate to="/" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </FluentProvider>
  );
}

export default App;
