import { useNavigate } from 'react-router-dom';
import { Search, Monitor, Bell } from 'lucide-react';
import { currentUser } from '../data/dashboard';

export const TopBar = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: '#0078d4',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexShrink: 0,
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1500px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        gap: '12px',
      }}>
        {/* Brand */}
        <span
          onClick={() => navigate('/')}
          style={{
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          Microsoft 365 Copilot
        </span>

        {/* Search */}
        <div style={{
          flex: 1,
          maxWidth: '480px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '4px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          gap: '8px',
          cursor: 'text',
          margin: '0 auto',
        }}>
          <Search size={14} color="rgba(255,255,255,0.75)" />
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px' }}>
            Search this site
          </span>
        </div>

        {/* Icons */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <Monitor size={18} />
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <Bell size={18} />
          </div>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#fff',
            color: '#0078d4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '12px',
            cursor: 'pointer',
          }}>
            {currentUser.initials}
          </div>
        </div>
      </div>
    </div>
  );
};
