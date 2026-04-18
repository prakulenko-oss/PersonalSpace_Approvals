import { makeStyles } from '@fluentui/react-components';
import { Search, Bell, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { currentUser } from '../data/dashboard';

const useStyles = makeStyles({
  topbar: {
    backgroundColor: '#0078d4',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: '12px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    flexShrink: 0,
  },
  brand: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    ':hover': { opacity: '0.85' },
  },
  search: {
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
  },
  searchText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '13px',
  },
  icons: {
    marginLeft: 'auto',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  iconBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
    ':hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
  },
  avatar: {
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
  },
});

export const TopBar = () => {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <div className={styles.topbar}>
      <span className={styles.brand} onClick={() => navigate('/')}>
        Microsoft 365 Copilot
      </span>
      <div className={styles.search}>
        <Search size={14} color="rgba(255,255,255,0.75)" />
        <span className={styles.searchText}>Search this site</span>
      </div>
      <div className={styles.icons}>
        <div className={styles.iconBtn}><Monitor size={18} /></div>
        <div className={styles.iconBtn}><Bell size={18} /></div>
        <div className={styles.avatar}>{currentUser.initials}</div>
      </div>
    </div>
  );
};
