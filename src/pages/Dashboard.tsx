import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles, tokens, Avatar, CounterBadge, Text } from '@fluentui/react-components';
import {
  Search, ListChecks, Video, ClipboardList, Newspaper,
  Bell, ChevronDown, ChevronUp, Heart, Users, RefreshCw,
  Briefcase, Instagram, Facebook, Twitter,
} from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { navTiles, calDays, companyEvents, vacancies, footerColumns, currentUser } from '../data/dashboard';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  navSection: {
    borderBottom: '1px solid #edebe9',
    padding: '16px 24px',
    backgroundColor: '#fff',
  },
  navGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    border: '1px solid #edebe9',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  navTile: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 20px',
    cursor: 'pointer',
    borderBottom: '1px solid #edebe9',
    borderRight: '1px solid #edebe9',
    transition: 'background 0.15s',
    ':hover': { backgroundColor: '#f3f2f1' },
  },
  tileIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '1.5px solid #0078d4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: '#0078d4',
  },
  tileIconDev: { border: '1.5px solid #a19f9d', color: '#a19f9d' },
  tileLabel: { fontSize: '13.5px', color: '#323130', lineHeight: '1.3' },
  tileLabelDev: { color: '#a19f9d' },
  tileSub: { fontSize: '11px', color: '#a19f9d' },

  peopleSearch: {
    margin: '0 24px 16px',
    backgroundColor: '#fff',
    border: '1.5px solid #f0c419',
    borderRadius: '4px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    gap: '8px',
    cursor: 'text',
  },

  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.8fr 310px',
    gap: '12px',
    padding: '0 24px 24px',
    alignItems: 'start',
  },

  widget: {
    backgroundColor: '#fff',
    border: '1px solid #edebe9',
    borderRadius: '4px',
    padding: '14px 16px',
    marginBottom: '12px',
  },
  widgetClickable: {
    cursor: 'pointer',
    borderColor: '#0078d4',
    ':hover': { backgroundColor: '#f9f8f7' },
  },
  widgetHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
    paddingBottom: '8px',
    borderBottom: '2px solid #0078d4',
  },
  widgetTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
  },
  allLink: {
    fontSize: '12px',
    color: '#0078d4',
    cursor: 'pointer',
    ':hover': { textDecoration: 'underline' },
  },
  empty: { color: '#a19f9d', fontSize: '13px', padding: '6px 0' },
  badge: {
    backgroundColor: '#edebe9',
    color: '#323130',
    fontSize: '11px',
    fontWeight: '600',
    borderRadius: '10px',
    padding: '1px 7px',
  },
  badgeBlue: { backgroundColor: '#0078d4', color: '#fff' },

  meetingItem: {
    paddingBottom: '8px',
    marginBottom: '8px',
    borderBottom: '1px solid #f3f2f1',
  },
  meetingTime: { fontSize: '12px', color: '#605e5c' },
  meetingName: {
    fontSize: '13px',
    color: '#0078d4',
    cursor: 'pointer',
    textDecoration: 'underline',
    lineHeight: '1.4',
  },

  eventItem: { padding: '8px 0', borderBottom: '1px solid #f3f2f1' },
  eventDate: { fontSize: '12px', color: '#605e5c', marginBottom: '3px' },
  eventRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' },
  eventName: { fontSize: '13.5px', color: '#323130' },
  eventTag: {
    fontSize: '11px',
    color: '#0078d4',
    backgroundColor: '#eff6fc',
    border: '1px solid #c7e0f4',
    borderRadius: '2px',
    padding: '2px 8px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },

  corpBanner: {
    backgroundColor: '#0078d4',
    borderRadius: '4px',
    padding: '20px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    minHeight: '90px',
    marginBottom: '12px',
  },
  sun: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    backgroundColor: '#f0c419',
    flexShrink: 0,
  },
  corpText: { color: '#fff', fontSize: '16px', fontWeight: '600', lineHeight: '1.3' },

  calendar: {
    backgroundColor: '#fff',
    border: '1px solid #edebe9',
    borderRadius: '4px',
    padding: '14px',
    marginBottom: '12px',
  },
  calHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' },
  calMonth: { fontSize: '14px', fontWeight: '600' },
  calNav: { display: 'flex', gap: '4px' },
  calNavBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 6px',
    color: '#323130',
    borderRadius: '2px',
    ':hover': { backgroundColor: '#f3f2f1' },
  },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' },
  calDayHeader: { fontSize: '11px', color: '#605e5c', padding: '3px 0', fontWeight: '600' },
  calDay: {
    fontSize: '12px',
    padding: '4px 2px',
    borderRadius: '2px',
    cursor: 'pointer',
    ':hover': { backgroundColor: '#f3f2f1' },
  },
  allEvents: {
    fontSize: '12px',
    color: '#0078d4',
    cursor: 'pointer',
    marginTop: '8px',
    display: 'block',
    ':hover': { textDecoration: 'underline' },
  },

  collapseWidget: {
    backgroundColor: '#fff',
    border: '1px solid #edebe9',
    borderRadius: '4px',
    marginBottom: '12px',
  },
  collapseHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '2px solid #0078d4',
    ':hover': { backgroundColor: '#f9f8f7' },
  },
  collapseTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#0078d4',
  },
  collapseBody: { padding: '10px 16px' },
  vacancyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px solid #f3f2f1',
    fontSize: '13px',
    ':last-child': { borderBottom: 'none' },
  },
  vacancyLoc: { color: '#605e5c', fontSize: '12px' },

  footer: {
    backgroundColor: '#fff',
    borderTop: '1px solid #edebe9',
    padding: '20px 24px',
    marginTop: 'auto',
  },
  footerInner: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr 1fr 1fr 1fr auto',
    gap: '24px',
    alignItems: 'start',
  },
  footerStar: { fontSize: '28px', color: '#0078d4', fontWeight: '100', letterSpacing: '-2px' },
  footerLink: {
    display: 'block',
    fontSize: '13px',
    color: '#605e5c',
    textDecoration: 'none',
    padding: '2px 0',
    cursor: 'pointer',
    ':hover': { color: '#0078d4' },
  },
  feedbackBtn: {
    backgroundColor: '#0078d4',
    color: '#fff',
    border: 'none',
    borderRadius: '2px',
    padding: '8px 16px',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  socialRow: { display: 'flex', gap: '6px', marginTop: '8px' },
  socialIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '1px solid #edebe9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#605e5c',
  },
});

export const Dashboard = () => {
  const styles = useStyles();
  const navigate = useNavigate();

  const [jobOpen, setJobOpen] = useState(true);
  const [favOpen, setFavOpen] = useState(false);
  const [absOpen, setAbsOpen] = useState(false);
  const [chgOpen, setChgOpen] = useState(false);

  return (
    <div className={styles.page}>

      <TopBar />

      {/* NAV TILES */}
      <div className={styles.navSection}>
        <div className={styles.navGrid}>
          {navTiles.map((tile, i) => {
            const is4n   = (i + 1) % 4 === 0;
            const isLast = i >= navTiles.length - 4;
            return (
              <div
                key={tile.label}
                className={styles.navTile}
                style={{
                  borderRight:  is4n   ? 'none' : undefined,
                  borderBottom: isLast ? 'none' : undefined,
                }}
                onClick={() => tile.route && !tile.dev && navigate(tile.route)}
              >
                <div className={`${styles.tileIcon}${tile.dev ? ` ${styles.tileIconDev}` : ''}`}>
                  <tile.Icon size={16} />
                </div>
                <div>
                  <div className={`${styles.tileLabel}${tile.dev ? ` ${styles.tileLabelDev}` : ''}`}>
                    {tile.label}
                  </div>
                  {tile.sub && <div className={styles.tileSub}>{tile.sub}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PEOPLE SEARCH */}
      <div className={styles.peopleSearch}>
        <Search size={16} color="#605e5c" />
        <Text style={{ color: '#a19f9d', fontSize: '13px' }}>Search people</Text>
      </div>

      {/* 3-COLUMN CONTENT */}
      <div className={styles.content}>

        {/* LEFT */}
        <div>
          <div className={styles.widget}>
            <div className={styles.widgetHeader}>
              <div className={styles.widgetTitle}>
                <ListChecks size={16} color="#0078d4" />Tasks
                <span className={styles.badge}>0</span>
              </div>
            </div>
            <div className={styles.empty}>There are no tasks today...</div>
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetHeader}>
              <div className={styles.widgetTitle}>
                <Video size={16} color="#0078d4" />Meetings
                <span className={styles.badge}>0</span>
              </div>
              <a className={styles.allLink}>All</a>
            </div>
            <div className={styles.meetingItem}>
              <div className={styles.meetingTime}>9:00 – 9:05.</div>
              <div className={styles.meetingName}>
                Хвилина пам'яті. Пам'ятаємо колег, які поклали за нашу свободу
              </div>
            </div>
            <div className={styles.empty} style={{ marginTop: '6px' }}>There are no events today...</div>
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetHeader}>
              <div className={styles.widgetTitle}>
                <ClipboardList size={16} color="#0078d4" />Surveys
                <span className={styles.badge}>0</span>
              </div>
            </div>
            <div className={styles.empty}>There are no surveys today...</div>
          </div>

          {/* Approvals shortcut */}
          <div
            className={`${styles.widget} ${styles.widgetClickable}`}
            onClick={() => navigate('/approvals')}
          >
            <div className={styles.widgetHeader}>
              <div className={styles.widgetTitle}>
                <ListChecks size={16} color="#0078d4" />Погодження
                <CounterBadge count={currentUser.pendingApprovals} appearance="filled" color="informative" size="small" />
              </div>
              <a className={styles.allLink}>Відкрити →</a>
            </div>
            <div style={{ fontSize: '13px', color: '#605e5c' }}>
              {currentUser.pendingApprovals} документів очікують вашого рішення
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div>
          <div className={styles.widget}>
            <div className={styles.widgetHeader}>
              <div className={styles.widgetTitle}>
                <Newspaper size={16} color="#0078d4" />News
                <span className={styles.badge}>0</span>
              </div>
              <a className={styles.allLink}>All</a>
            </div>
            <div className={styles.empty}>Немає новин сьогодні...</div>
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetHeader}>
              <div className={styles.widgetTitle}>
                <Bell size={16} color="#0078d4" />Events in the company
                <span className={`${styles.badge} ${styles.badgeBlue}`}>{companyEvents.length + 4}</span>
              </div>
              <a className={styles.allLink}>All</a>
            </div>
            {companyEvents.map(ev => (
              <div key={ev.name} className={styles.eventItem}>
                <div className={styles.eventDate}>{ev.date}</div>
                <div className={styles.eventRow}>
                  <span className={styles.eventName}>{ev.name}</span>
                  <span className={styles.eventTag}>{ev.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div className={styles.corpBanner}>
            <div className={styles.sun} />
            <div className={styles.corpText}>Корпоративна<br />культура</div>
          </div>

          {/* Calendar */}
          <div className={styles.calendar}>
            <div className={styles.calHeader}>
              <span className={styles.calMonth}>April 2026</span>
              <div className={styles.calNav}>
                <button className={styles.calNavBtn}><ChevronUp size={14} /></button>
                <button className={styles.calNavBtn}><ChevronDown size={14} /></button>
              </div>
            </div>
            <div className={styles.calGrid}>
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <div key={i} className={styles.calDayHeader}>{d}</div>
              ))}
              {calDays.map((day, i) => (
                <div
                  key={i}
                  className={styles.calDay}
                  style={{
                    color: day.today ? '#fff'
                      : day.other && day.holiday ? '#f1929a'
                      : day.holiday ? '#d13438'
                      : day.other ? '#c8c6c4'
                      : '#323130',
                    backgroundColor: day.today ? '#0078d4' : undefined,
                    borderRadius: day.today ? '50%' : undefined,
                    fontWeight: day.today ? '600' : undefined,
                  }}
                >
                  {day.d}
                </div>
              ))}
            </div>
            <a className={styles.allEvents}>All events</a>
          </div>

          {/* Birthdays */}
          <div className={styles.widget}>
            <div className={styles.widgetHeader}>
              <div className={styles.widgetTitle}>
                <Heart size={16} color="#0078d4" />Birthdays
                <span className={`${styles.badge} ${styles.badgeBlue}`}>37</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#605e5c' }}>
              <Avatar name="Іменинник" size={20} />
              <span>37 іменинників цього місяця</span>
            </div>
          </div>

          {/* Collapse: Favorites */}
          <div className={styles.collapseWidget}>
            <div className={styles.collapseHeader} onClick={() => setFavOpen(v => !v)}>
              <div className={styles.collapseTitle}>
                <Heart size={16} />Favorites
                <span className={styles.badge}>0</span>
              </div>
              {favOpen ? <ChevronUp size={16} color="#605e5c" /> : <ChevronDown size={16} color="#605e5c" />}
            </div>
            {favOpen && <div className={styles.collapseBody}><span style={{ fontSize: '13px', color: '#a19f9d' }}>Немає обраних</span></div>}
          </div>

          {/* Collapse: Absentees */}
          <div className={styles.collapseWidget}>
            <div className={styles.collapseHeader} onClick={() => setAbsOpen(v => !v)}>
              <div className={styles.collapseTitle}>
                <Users size={16} />Absentees
                <span className={`${styles.badge} ${styles.badgeBlue}`}>11</span>
              </div>
              {absOpen ? <ChevronUp size={16} color="#605e5c" /> : <ChevronDown size={16} color="#605e5c" />}
            </div>
            {absOpen && <div className={styles.collapseBody}><span style={{ fontSize: '13px', color: '#a19f9d' }}>Список відсутніх</span></div>}
          </div>

          {/* Collapse: Changes */}
          <div className={styles.collapseWidget}>
            <div className={styles.collapseHeader} onClick={() => setChgOpen(v => !v)}>
              <div className={styles.collapseTitle}>
                <RefreshCw size={16} />Changes
                <span className={`${styles.badge} ${styles.badgeBlue}`}>5</span>
              </div>
              {chgOpen ? <ChevronUp size={16} color="#605e5c" /> : <ChevronDown size={16} color="#605e5c" />}
            </div>
            {chgOpen && <div className={styles.collapseBody}><span style={{ fontSize: '13px', color: '#a19f9d' }}>Зміни в системі</span></div>}
          </div>

          {/* Collapse: Job Vacancies */}
          <div className={styles.collapseWidget}>
            <div className={styles.collapseHeader} onClick={() => setJobOpen(v => !v)}>
              <div className={styles.collapseTitle}>
                <Briefcase size={16} />Job Vacancies
                <span className={`${styles.badge} ${styles.badgeBlue}`}>{vacancies.length}</span>
              </div>
              {jobOpen ? <ChevronUp size={16} color="#605e5c" /> : <ChevronDown size={16} color="#605e5c" />}
            </div>
            {jobOpen && (
              <div className={styles.collapseBody}>
                {vacancies.map(v => (
                  <div key={v.title} className={styles.vacancyItem}>
                    <span>{v.title}{v.hot ? ' 🔥' : ''}</span>
                    <span className={styles.vacancyLoc}>{v.loc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className={styles.footer}>
        <div className={styles.footerInner}>
          <div><span className={styles.footerStar}>✳</span></div>
          {footerColumns.map((col, i) => (
            <div key={i}>
              {col.map(link => <a key={link} className={styles.footerLink}>{link}</a>)}
            </div>
          ))}
          <div />
          <div>
            <button className={styles.feedbackBtn}>Leave feedback</button>
            <div className={styles.socialRow}>
              <div className={styles.socialIcon}><Instagram size={14} /></div>
              <div className={styles.socialIcon}><Instagram size={14} /></div>
              <div className={styles.socialIcon}><Facebook size={14} /></div>
              <div className={styles.socialIcon}><Twitter size={14} /></div>
              <div className={styles.socialIcon} style={{ fontSize: '11px', fontWeight: '700' }}>Tk</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
