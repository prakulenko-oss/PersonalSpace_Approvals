import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CounterBadge } from '@fluentui/react-components';
import {
  ListChecks, Video, ClipboardList, Newspaper,
  Bell, ChevronDown, ChevronUp, Heart, Users, RefreshCw,
  Briefcase, Instagram, Facebook, Twitter, Search, Landmark
} from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { navTiles, calDays, companyEvents, vacancies, footerColumns, currentUser } from '../data/dashboard';

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    alignItems: 'center',
    width: '100%',
  },
  navSection: {
    padding: '24px 16px 0',
    backgroundColor: '#ffffff',
    maxWidth: '1500px',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  navGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    rowGap: '32px',
    columnGap: '24px',
    width: '100%',
  },
  navTile: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '0',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  tileIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    border: '2px solid #0078d4',
    background: 'linear-gradient(135deg, #ffffff 0%, #dcf1ff 100%)',
    boxShadow: '2px 4px 10px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'transform 0.2s',
  },
  tileIconHovered: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    border: '2px solid #0078d4',
    background: '#FFC400',
    boxShadow: '2px 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tileIconDev: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    border: '2px solid #9ca3af',
    background: 'linear-gradient(135deg, #f9fafb 0%, #d1d5db 100%)',
    boxShadow: '2px 4px 10px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    cursor: 'default',
  },
  tileLabel: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#1a1a1a',
    lineHeight: '1.3',
  },
  tileSub: {
    fontSize: '13px',
    color: '#9ca3af',
    marginTop: '2px',
  },
  peopleSearchWrap: {
    width: '100%',
    maxWidth: '1500px',
    padding: '0 16px',
    marginTop: '32px',
    marginBottom: '32px',
    boxSizing: 'border-box' as const,
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    border: '1px solid #ffcd00',
    borderRadius: '6px',
    padding: '10px 16px',
    backgroundColor: '#fff',
  },
  searchInput: {
    width: '100%',
    fontSize: '15px',
    color: '#374151',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'inherit',
    marginLeft: '12px',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '3fr 6fr 3fr',
    gap: '24px',
    padding: '0 16px 48px',
    width: '100%',
    maxWidth: '1500px',
    boxSizing: 'border-box' as const,
    alignItems: 'start',
  },
  widget: {
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    marginBottom: '24px',
  },
  widgetClickable: {
    cursor: 'pointer',
  },
  widgetHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  widgetTitleWrap: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '2px solid #0078d4',
    paddingBottom: '16px',
    marginBottom: '-17px',
  },
  widgetTitle: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  allLink: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  widgetBody: {
    padding: '24px 20px',
  },
  widgetBodyZeroPadding: { padding: '0' },
  empty: { color: '#6b7280', fontSize: '14px' },
  badge: {
    backgroundColor: '#e6f2ff',
    color: '#0078d4',
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: '12px',
    padding: '2px 8px',
  },
  meetingItem: { paddingBottom: '16px' },
  meetingTime: { fontSize: '14px', color: '#b30000', fontWeight: 500, cursor: 'pointer' },
  meetingDesc: { fontSize: '14px', color: '#6b7280', marginTop: '16px' },
  eventItem: {
    padding: '16px 20px',
    borderBottom: '1px solid #f3f2f1',
    display: 'flex',
    flexDirection: 'column' as const,
    cursor: 'pointer',
  },
  eventDate: { fontSize: '13px', color: '#6b7280', marginBottom: '4px' },
  eventRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  eventName: { fontSize: '15px', fontWeight: 500, color: '#1a1a1a' },
  eventTag: {
    fontSize: '11px',
    color: '#00897b',
    backgroundColor: '#e0f2f1',
    borderRadius: '12px',
    padding: '2px 10px',
    whiteSpace: 'nowrap' as const,
  },
  corpBanner: {
    backgroundColor: '#1b8cff',
    borderRadius: '12px',
    position: 'relative' as const,
    overflow: 'hidden',
    marginBottom: '24px',
    cursor: 'pointer',
    height: '120px',
  },
  sun: {
    position: 'absolute' as const,
    left: '-24px',
    bottom: '-24px',
    width: '96px',
    height: '96px',
    backgroundColor: '#ffcd00',
    borderRadius: '50%',
  },
  corpText: {
    position: 'absolute' as const,
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    color: '#fff',
    fontSize: '17px',
    fontWeight: 600,
    lineHeight: '1.2',
    zIndex: 10,
  },
  calendar: {
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  calHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  calMonth: { fontSize: '16px', fontWeight: 600, color: '#1a1a1a' },
  calNav: { display: 'flex', gap: '12px', color: '#9ca3af' },
  calNavBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px 4px', textAlign: 'center' as const, fontSize: '13px' },
  calDayHeader: { fontSize: '13px', color: '#6b7280', paddingBottom: '8px' },
  calDayWrap: {
    position: 'relative' as const,
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '28px',
    height: '28px',
    margin: '0 auto',
    color: '#374151',
  },
  calDayActive: {
    border: '2px solid #fbbf24',
    borderRadius: '50%',
    fontWeight: 600,
  },
  calDayDot: {
    position: 'absolute' as const,
    bottom: '0',
    width: '4px',
    height: '4px',
    backgroundColor: '#ef4444',
    borderRadius: '50%',
  },
  allEvents: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    cursor: 'pointer',
    marginTop: '16px',
    display: 'inline-block',
  },
  collapseHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    cursor: 'pointer',
    backgroundColor: '#fff',
  },
  collapseTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  vacancyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    borderBottom: '1px solid #f3f2f1',
    fontSize: '14px',
    cursor: 'pointer',
  },
  vacancyTitle: { color: '#374151' },
  vacancyLoc: { color: '#6b7280', fontSize: '13px' },
  footer: {
    backgroundColor: '#fff',
    borderTop: '1px solid #e5e7eb',
    padding: '24px 16px',
    marginTop: 'auto',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  footerInner: {
    maxWidth: '1500px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr 1.5fr',
    gap: '32px',
    alignItems: 'start',
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  footerLink: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1a1a1a',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  footerActions: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '20px',
  },
  feedbackBtn: {
    backgroundColor: '#0078d4',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 32px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  socialRow: { display: 'flex', gap: '16px', alignItems: 'center' },
  socialIcon: { color: '#4b5563', cursor: 'pointer' },
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const [hoveredTile, setHoveredTile] = useState<number | null>(null);
  const [jobOpen, setJobOpen] = useState(true);
  const [favOpen, setFavOpen] = useState(false);
  const [absOpen, setAbsOpen] = useState(false);
  const [chgOpen, setChgOpen] = useState(false);

  return (
    <div style={styles.page}>
      <TopBar />

      {/* NAV TILES */}
      <div style={styles.navSection}>
        <div style={styles.navGrid}>
          {navTiles.map((tile, i) => (
            <div
              key={tile.label}
              style={styles.navTile}
              onClick={() => tile.route && !tile.dev && navigate(tile.route)}
              onMouseEnter={() => !tile.dev && setHoveredTile(i)}
              onMouseLeave={() => setHoveredTile(null)}
            >
              <div style={tile.dev ? styles.tileIconDev : hoveredTile === i ? styles.tileIconHovered : styles.tileIcon}>
                <svg
                  width="22" height="22" viewBox="0 0 24 24"
                  fill="none"
                  stroke={tile.dev ? '#6b7280' : '#0078d4'}
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dangerouslySetInnerHTML={{ __html: tile.svg }}
                />
              </div>
              <div>
                <div style={styles.tileLabel}>{tile.label}</div>
                {tile.sub && <div style={styles.tileSub}>{tile.sub}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PEOPLE SEARCH */}
      <div style={styles.peopleSearchWrap}>
        <div style={styles.searchBox}>
          <Search size={20} color="#0078d4" strokeWidth={2} />
          <input type="text" placeholder="Search people" style={styles.searchInput} />
        </div>
      </div>

      {/* 3-COLUMN CONTENT */}
      <div style={styles.content}>

        {/* LEFT */}
        <div>
          <div style={styles.widget}>
            <div style={styles.widgetHeader}>
              <div style={styles.widgetTitleWrap}>
                <ListChecks size={18} color="#0078d4" />
                <span style={styles.widgetTitle}>Tasks</span>
                <span style={styles.badge}>0</span>
              </div>
            </div>
            <div style={styles.widgetBody}>
              <div style={styles.empty}>There are no tasks today...</div>
            </div>
          </div>

          <div style={styles.widget}>
            <div style={styles.widgetHeader}>
              <div style={styles.widgetTitleWrap}>
                <Video size={18} color="#0078d4" />
                <span style={styles.widgetTitle}>Meetings</span>
                <span style={styles.badge}>0</span>
              </div>
              <a style={styles.allLink}>All</a>
            </div>
            <div style={styles.widgetBody}>
              <div style={styles.meetingItem}>
                <div style={styles.meetingTime}>9:00 - 9:05. Хвилина пам'яті. Пам'ятаємо колег, які полягли за нашу свободу</div>
                <div style={styles.meetingDesc}>There are no events today...</div>
              </div>
            </div>
          </div>

          <div style={styles.widget}>
            <div style={styles.widgetHeader}>
              <div style={styles.widgetTitleWrap}>
                <ClipboardList size={18} color="#0078d4" />
                <span style={styles.widgetTitle}>Surveys</span>
                <span style={styles.badge}>0</span>
              </div>
            </div>
            <div style={styles.widgetBody}>
              <div style={styles.empty}>There are no surveys today...</div>
            </div>
          </div>

          {/* Approvals shortcut */}
          <div style={{ ...styles.widget, ...styles.widgetClickable }} onClick={() => navigate('/approvals')}>
            <div style={styles.widgetHeader}>
              <div style={styles.widgetTitleWrap}>
                <ListChecks size={18} color="#0078d4" />
                <span style={styles.widgetTitle}>Погодження</span>
                <CounterBadge count={currentUser.pendingApprovals} appearance="filled" color="informative" size="small" />
              </div>
              <a style={styles.allLink}>Відкрити →</a>
            </div>
            <div style={styles.widgetBody}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {currentUser.pendingApprovals} документів очікують вашого рішення
              </div>
            </div>
          </div>

          {/* Bank memo shortcut */}
          <div style={{ ...styles.widget, ...styles.widgetClickable }} onClick={() => navigate('/bank-memo')}>
            <div style={styles.widgetHeader}>
              <div style={styles.widgetTitleWrap}>
                <Landmark size={18} color="#0078d4" />
                <span style={styles.widgetTitle}>Зарплатний банк</span>
              </div>
              <a style={styles.allLink}>Відкрити →</a>
            </div>
            <div style={styles.widgetBody}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Пам'ятка: як обрати банк для зарплатної картки та що зробити для переходу
              </div>
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div>
          <div style={styles.widget}>
            <div style={styles.widgetHeader}>
              <div style={styles.widgetTitleWrap}>
                <Newspaper size={18} color="#0078d4" />
                <span style={styles.widgetTitle}>News</span>
                <span style={styles.badge}>0</span>
              </div>
              <a style={styles.allLink}>All</a>
            </div>
            <div style={styles.widgetBody}>
              <div style={{ height: '60px' }} />
            </div>
          </div>

          <div style={styles.widget}>
            <div style={styles.widgetHeader}>
              <div style={styles.widgetTitleWrap}>
                <Bell size={18} color="#0078d4" />
                <span style={styles.widgetTitle}>Events in the company</span>
                <span style={styles.badge}>{companyEvents.length + 4}</span>
              </div>
              <a style={styles.allLink}>All</a>
            </div>
            <div style={styles.widgetBodyZeroPadding}>
              {companyEvents.map(ev => (
                <div key={ev.name} style={styles.eventItem}>
                  <span style={styles.eventDate}>{ev.date}</span>
                  <div style={styles.eventRow}>
                    <span style={styles.eventName}>{ev.name}</span>
                    <span style={styles.eventTag}>{ev.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div style={styles.corpBanner}>
            <div style={styles.sun} />
            <div style={styles.corpText}>Корпоративна<br />культура</div>
          </div>

          <div style={styles.calendar}>
            <div style={styles.calHeader}>
              <span style={styles.calMonth}>April 2026</span>
              <div style={styles.calNav}>
                <button style={styles.calNavBtn}><ChevronUp size={18} /></button>
                <button style={styles.calNavBtn}><ChevronDown size={18} /></button>
              </div>
            </div>
            <div style={styles.calGrid}>
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <div key={i} style={styles.calDayHeader}>{d}</div>
              ))}
              {calDays.map((day, i) => (
                <div key={i} style={{ color: day.other ? '#9ca3af' : '#374151' }}>
                  <div style={{ ...styles.calDayWrap, ...(day.today ? styles.calDayActive : {}) }}>
                    {day.d}
                    {day.holiday && <div style={styles.calDayDot} />}
                  </div>
                </div>
              ))}
            </div>
            <a style={styles.allEvents}>All events</a>
          </div>

          <div style={{ ...styles.widget, marginBottom: '12px' }}>
            <div style={{ ...styles.collapseHeader, borderBottom: 'none' }}>
              <div style={styles.collapseTitleWrap}>
                <Heart size={18} color="#0078d4" />
                <span style={styles.widgetTitle}>Birthdays</span>
                <span style={styles.badge}>37</span>
              </div>
              <ChevronDown size={18} color="#0078d4" />
            </div>
          </div>

          {[
            { label: 'Favorites', icon: <Heart size={18} color="#0078d4" />, count: '0', open: favOpen, setOpen: setFavOpen },
            { label: 'Absentees', icon: <Users size={18} color="#0078d4" />, count: '11', open: absOpen, setOpen: setAbsOpen },
            { label: 'Changes', icon: <RefreshCw size={18} color="#0078d4" />, count: '5', open: chgOpen, setOpen: setChgOpen },
          ].map(({ label, icon, count, open, setOpen }) => (
            <div key={label} style={{ ...styles.widget, marginBottom: '12px' }}>
              <div
                style={{ ...styles.collapseHeader, borderBottom: open ? '2px solid #0078d4' : 'none' }}
                onClick={() => setOpen((v: boolean) => !v)}
              >
                <div style={styles.collapseTitleWrap}>
                  {icon}
                  <span style={styles.widgetTitle}>{label}</span>
                  <span style={styles.badge}>{count}</span>
                </div>
                {open ? <ChevronUp size={18} color="#0078d4" /> : <ChevronDown size={18} color="#0078d4" />}
              </div>
              {open && <div style={styles.widgetBody}><span style={{ fontSize: '13px', color: '#a19f9d' }}>—</span></div>}
            </div>
          ))}

          <div style={styles.widget}>
            <div
              style={{ ...styles.collapseHeader, borderBottom: jobOpen ? '1px solid #e5e7eb' : 'none' }}
              onClick={() => setJobOpen(v => !v)}
            >
              <div style={styles.collapseTitleWrap}>
                <Briefcase size={18} color="#0078d4" />
                <span style={styles.widgetTitle}>Job Vacancies</span>
                <span style={styles.badge}>{vacancies.length}</span>
              </div>
              {jobOpen ? <ChevronUp size={18} color="#0078d4" /> : <ChevronDown size={18} color="#0078d4" />}
            </div>
            {jobOpen && (
              <div style={styles.widgetBodyZeroPadding}>
                {vacancies.map(v => (
                  <div key={v.title} style={styles.vacancyItem}>
                    <span style={styles.vacancyTitle}>{v.title}{v.hot ? ' 🔥' : ''}</span>
                    <span style={styles.vacancyLoc}>{v.loc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <div style={styles.footerInner}>
          <div>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0078d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18M4.22 7.22l15.56 9.56M4.22 16.78l15.56-9.56"/>
            </svg>
          </div>
          {footerColumns.map((col, i) => (
            <div key={i} style={styles.footerCol}>
              {col.map(link => <a key={link} style={styles.footerLink}>{link}</a>)}
            </div>
          ))}
          <div style={styles.footerActions}>
            <button style={styles.feedbackBtn}>Leave feedback</button>
            <div style={styles.socialRow}>
              <Instagram size={24} style={styles.socialIcon} />
              <Instagram size={24} style={styles.socialIcon} />
              <Facebook size={24} style={styles.socialIcon} />
              <Twitter size={24} style={styles.socialIcon} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
