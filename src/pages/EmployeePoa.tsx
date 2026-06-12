import { useState } from 'react';
import { TopBar } from '../components/TopBar';
import { S, Toast } from './managerUi';
import { PoaSection } from './ManagerPoa';

/* Довіреності / КЕП для співробітника (не менеджера):
   довіреності своєї функції, замовлення довіреності (зокрема на керівника) та КЕП */

export const EmployeePoa = () => {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  return (
    <div style={S.page}>
      <TopBar />

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '12px 20px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
        <div style={{ fontSize: '13.5px', color: '#374151' }}>
          <span style={{ fontWeight: 600 }}>Головна</span>
          <span style={{ color: '#9ca3af', margin: '0 7px' }}>›</span>
          <span>Довіреності / КЕП</span>
        </div>
      </div>

      <div style={S.body}>
        <PoaSection showToast={showToast} mode="employee" />
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
};

export default EmployeePoa;
