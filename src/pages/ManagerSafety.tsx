import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { TabList, Tab, Input, Badge, Button, Tooltip } from '@fluentui/react-components';
import {
  Users, Zap, Search, ExternalLink, X, HardHat, GraduationCap, Stethoscope,
  ArrowUp, ArrowDown, ArrowUpDown, Info, CalendarClock, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { S, Drawer } from './managerUi';
import { daysUntil, expiryStatus } from '../data/safety';
import type { ExpiryStatus } from '../data/safety';
import { teamMembers, electricalRecords } from '../data/teamSafety';
import type { TeamMember } from '../data/teamSafety';

/* ════════════════════════ ХЕЛПЕРИ ════════════════════════ */

const daysWord = (d: number) => (d === 1 ? 'день' : d < 5 ? 'дні' : 'днів');

const pillStyle = (critical: boolean): CSSProperties => ({
  display: 'inline-block', padding: '2px 8px', borderRadius: 8,
  backgroundColor: critical ? '#fff1f2' : '#fff7ed',
  color: critical ? '#e11d48' : '#f59e0b',
  fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
});

const ExpiryBadge = ({ validUntil }: { validUntil?: string }) => {
  const st = expiryStatus(validUntil);
  const days = validUntil ? daysUntil(validUntil) : null;
  if (st === 'none') return <Badge appearance="tint" color="informative">Безстроково</Badge>;
  if (st === 'ok') return <Badge appearance="tint" color="success">Чинний</Badge>;
  if (st === 'expired') return <Badge appearance="tint" color="danger">Прострочено</Badge>;
  const isCritical = st === 'critical';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>
      <Badge appearance="tint" color={isCritical ? 'danger' : 'warning'}>{isCritical ? 'Критично' : 'Завершується'}</Badge>
      {days != null && <span style={pillStyle(isCritical)}>{days} {daysWord(days)}</span>}
    </span>
  );
};

const dateKey = (d?: string) => {
  const m = d?.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m ? `${m[3]}${m[2]}${m[1]}` : '99999999';
};

const statusRank: Record<ExpiryStatus, number> = { expired: 0, critical: 1, soon: 2, ok: 3, none: 4 };

/* ════════════════════════ ЗВЕДЕННЯ ПО СПІВРОБІТНИКУ ════════════════════════ */

type DomainKey = 'briefings' | 'trainings' | 'medical' | 'electrical';

type Problem = {
  domain: DomainKey;
  label: string;          // «Медогляд — через 6 днів (10.07.2026)»
  status: ExpiryStatus;
};

type MemberSummary = {
  member: TeamMember;
  briefings: { status: ExpiryStatus; date?: string };
  trainings: { status: ExpiryStatus; date?: string };
  medical: { status: ExpiryStatus; date?: string };
  attestation: { acquaintedAt: string };
  internship: { label: string; warn: boolean };
  electrical?: { status: ExpiryStatus; date?: string };
  problems: Problem[];
  worst: ExpiryStatus;
  nearest?: string;
};

const problemPhrase = (title: string, status: ExpiryStatus, date?: string): string => {
  if (!date) return title;
  const days = daysUntil(date);
  if (status === 'expired') return `${title} — прострочено (${date})`;
  if (days != null) return `${title} — через ${days} ${daysWord(days)} (${date})`;
  return `${title} — до ${date}`;
};

const buildSummaries = (): MemberSummary[] => teamMembers.map(m => {
  const briefings = { status: expiryStatus(m.repeatBriefing.validUntil), date: m.repeatBriefing.validUntil };

  const nearestTraining = [...m.trainings].sort((a, b) => dateKey(a.validUntil).localeCompare(dateKey(b.validUntil)))[0];
  const trainings = {
    status: m.trainings.length
      ? m.trainings.map(t => expiryStatus(t.validUntil)).sort((a, b) => statusRank[a] - statusRank[b])[0]
      : ('none' as ExpiryStatus),
    date: nearestTraining?.validUntil,
  };

  const medical = { status: expiryStatus(m.medical.nextAt), date: m.medical.nextAt };

  const el = electricalRecords.find(r => r.memberId === m.id);
  const electrical = el ? { status: expiryStatus(el.nextCheck), date: el.nextCheck } : undefined;

  const internship = m.internship.ongoing
    ? { label: `${m.internship.ongoing.kind} до ${m.internship.ongoing.to}`, warn: true }
    : m.internship.admissionAt
      ? { label: `з ${m.internship.admissionAt}`, warn: false }
      : { label: '—', warn: false };

  /* Відкриті питання — лише проблемні домени */
  const problems: Problem[] = [];
  const isProblem = (s: ExpiryStatus) => s === 'soon' || s === 'critical' || s === 'expired';
  if (isProblem(briefings.status)) problems.push({ domain: 'briefings', status: briefings.status, label: problemPhrase('Повторний інструктаж', briefings.status, briefings.date) });
  if (isProblem(trainings.status)) {
    const worstTraining = m.trainings.filter(t => isProblem(expiryStatus(t.validUntil)))
      .sort((a, b) => dateKey(a.validUntil).localeCompare(dateKey(b.validUntil)))[0];
    problems.push({ domain: 'trainings', status: trainings.status, label: problemPhrase(worstTraining?.title ?? 'Навчання', trainings.status, worstTraining?.validUntil) });
  }
  if (isProblem(medical.status)) problems.push({ domain: 'medical', status: medical.status, label: problemPhrase('Медогляд', medical.status, medical.date) });
  if (electrical && isProblem(electrical.status)) problems.push({ domain: 'electrical', status: electrical.status, label: problemPhrase('Ел. безпека — перевірка знань', electrical.status, electrical.date) });

  const statuses = [briefings.status, trainings.status, medical.status, ...(electrical ? [electrical.status] : [])];
  const worst = statuses.sort((a, b) => statusRank[a] - statusRank[b])[0];

  const futureDates = [briefings.date, trainings.date, medical.date, electrical?.date]
    .filter((d): d is string => !!d && (daysUntil(d) ?? -1) >= 0)
    .sort((a, b) => dateKey(a).localeCompare(dateKey(b)));

  return {
    member: m,
    briefings, trainings, medical,
    attestation: { acquaintedAt: m.attestation.acquaintedAt },
    internship, electrical,
    problems, worst,
    nearest: futureDates[0],
  };
});

const summaries = buildSummaries();

/* ════════════════════════ КЛІТИНКИ ════════════════════════ */

/* Іконки доменів для «Відкритих питань» (патерн Кадрових операцій) */
const domainIcon: Record<DomainKey, (color: string) => ReactNode> = {
  briefings:  c => <HardHat size={17} color={c} />,
  trainings:  c => <GraduationCap size={17} color={c} />,
  medical:    c => <Stethoscope size={17} color={c} />,
  electrical: c => <Zap size={17} color={c} />,
};

const ProblemIcons = ({ problems }: { problems: Problem[] }) => {
  if (problems.length === 0) {
    return (
      <Tooltip content="Все чинне" relationship="label">
        <span style={{ display: 'inline-flex' }}><CheckCircle2 size={18} color="#22c55e" /></span>
      </Tooltip>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {problems.map(p => (
        <Tooltip key={p.domain} content={p.label} relationship="label">
          <span style={{ display: 'inline-flex', cursor: 'default' }}>
            {domainIcon[p.domain](p.status === 'soon' ? '#f59e0b' : '#ef4444')}
          </span>
        </Tooltip>
      ))}
    </span>
  );
};

/* Тиха клітинка детального зрізу: норма мовчить, проблема — пігулка */
const QuietCell = ({ status, date }: { status: ExpiryStatus; date?: string }) => {
  if (!date || status === 'none') return <span style={{ color: '#9ca3af' }}>—</span>;
  if (status === 'ok') return <span style={{ fontSize: 13, color: '#6b7280' }}>{date}</span>;
  if (status === 'expired') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 13, color: '#b91c1c', fontWeight: 600 }}>{date}</span>
        <span style={{ fontSize: 11.5, color: '#b91c1c', fontWeight: 700 }}>прострочено</span>
      </span>
    );
  }
  const days = daysUntil(date);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>
      <span style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{date}</span>
      {days != null && <span style={pillStyle(status === 'critical')}>{days} {daysWord(days)}</span>}
    </span>
  );
};

/* Клітинка «найближча дата» для Огляду */
const NearestCell = ({ summary }: { summary: MemberSummary }) => {
  if (summary.worst === 'expired') {
    return <span style={pillStyle(true)}>прострочено</span>;
  }
  if (!summary.nearest) return <span style={{ color: '#9ca3af' }}>—</span>;
  const days = daysUntil(summary.nearest);
  if (summary.worst === 'ok' || days == null) {
    return <span style={{ fontSize: 13, color: '#6b7280' }}>{summary.nearest}</span>;
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>
      <span style={{ fontSize: 13, color: '#111827' }}>{summary.nearest}</span>
      <span style={pillStyle(summary.worst === 'critical')}>{days} {daysWord(days)}</span>
    </span>
  );
};

/* ════════════════════════ DRAWER: ДОСЬЄ СПІВРОБІТНИКА ════════════════════════ */

const rowStyle: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  padding: '11px 14px', border: '1px solid #eef2f7', borderRadius: 10, backgroundColor: '#fafcff',
};

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.4, margin: '20px 0 9px' }}>
    {children}
  </div>
);

const MemberDrawer = ({ summary, onClose, showToast }: { summary: MemberSummary; onClose: () => void; showToast: (m: string) => void }) => {
  const m = summary.member;
  const el = electricalRecords.find(r => r.memberId === m.id);
  return (
    <Drawer width={540} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px 0' }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 700, color: '#111827' }}>{m.name}</div>
          <div style={{ fontSize: 13.5, color: '#6b7280', marginTop: 3 }}>{m.role}</div>
        </div>
        <button onClick={onClose} aria-label="Закрити" style={{ padding: 4, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ padding: '4px 24px 24px', overflowY: 'auto' }}>
        {/* Інструктажі */}
        <SectionTitle>Інструктажі</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={rowStyle}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>Повторний <span style={{ fontWeight: 400, color: '#6b7280' }}>· останній пройдений</span></div>
              <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>
                Пройдено {m.repeatBriefing.passedAt} · діє до {m.repeatBriefing.validUntil} · {m.repeatBriefing.periodicity}
              </div>
            </div>
            <ExpiryBadge validUntil={m.repeatBriefing.validUntil} />
          </div>
          {(m.extraBriefings ?? []).map(b => (
            <div key={b.kind} style={rowStyle}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{b.kind} <span style={{ fontWeight: 400, color: '#6b7280' }}>· останній пройдений</span></div>
                <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>
                  Пройдено {b.passedAt}{b.reason ? ` · ${b.reason}` : ''}
                </div>
              </div>
              <Badge appearance="tint" color="informative">Подієвий</Badge>
            </div>
          ))}
          <div style={rowStyle}>
            <div style={{ fontSize: 13.5, color: '#111827' }}>
              <span style={{ fontWeight: 600 }}>Вступний</span> — {m.introBriefingAt}
              <span style={{ color: '#9ca3af', margin: '0 8px' }}>·</span>
              <span style={{ fontWeight: 600 }}>Первинний</span> — {m.primaryBriefingAt}
            </div>
            <Badge appearance="tint" color="informative">Безстроково</Badge>
          </div>
        </div>

        {/* Медичні огляди */}
        <SectionTitle>Медичні огляди</SectionTitle>
        <div style={rowStyle}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{m.medical.kind}</div>
            <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>
              Пройдено {m.medical.passedAt} · наступний {m.medical.nextAt}
            </div>
          </div>
          <ExpiryBadge validUntil={m.medical.nextAt} />
        </div>

        {/* Атестація робочого місця */}
        <SectionTitle>Атестація робочого місця</SectionTitle>
        <div style={rowStyle}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{m.attestation.cardNo}</div>
            <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>
              Ознайомлення <b style={{ color: '#111827' }}>{m.attestation.acquaintedAt}</b> · чинна до {m.attestation.validTo}
            </div>
          </div>
          <Badge appearance="tint" color="success">Ознайомлено</Badge>
        </div>

        {/* Стажування / допуск */}
        <SectionTitle>Стажування / дублювання, допуск до роботи</SectionTitle>
        <div style={rowStyle}>
          {m.internship.ongoing ? (
            <>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>
                {m.internship.ongoing.kind} триває до {m.internship.ongoing.to}
              </div>
              <Badge appearance="tint" color="warning">Триває</Badge>
            </>
          ) : m.internship.admissionAt ? (
            <>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>
                Допущено до самостійної роботи з {m.internship.admissionAt}
              </div>
              <Badge appearance="tint" color="success">Допущено</Badge>
            </>
          ) : (
            <span style={{ fontSize: 13.5, color: '#6b7280' }}>Дані відсутні</span>
          )}
        </div>

        {/* Навчання */}
        <SectionTitle>Навчання</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {m.trainings.map(t => (
            <div key={t.protocol} style={rowStyle}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{t.title}</div>
                <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>
                  Протокол {t.protocol} · пройдено {t.passedAt} · чинне до {t.validUntil}
                </div>
              </div>
              <ExpiryBadge validUntil={t.validUntil} />
            </div>
          ))}
        </div>

        {/* Електробезпека */}
        {el && (
          <>
            <SectionTitle>Електробезпека</SectionTitle>
            <div style={{ ...rowStyle, alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{el.ruleFull} ({el.ruleName})</div>
                <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 3 }}>Персонал: {el.personnelCategory}</div>
                <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>
                  Група: {el.prevGroup} → <b style={{ color: '#111827' }}>{el.requiredGroup}</b>
                </div>
                <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>
                  Перевірка знань: {el.lastCheck} · наступна {el.nextCheck} · {el.periodicity}
                </div>
              </div>
              <ExpiryBadge validUntil={el.nextCheck} />
            </div>
          </>
        )}

        {/* Дії — через docNet */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 22 }}>
          <Button
            appearance="primary"
            icon={<ExternalLink size={15} />}
            onClick={() => showToast('Заявка на навчання формується в системі Документообігу (docNet)')}
          >
            Сформувати заявку на навчання в docNet
          </Button>
          <Button
            appearance="secondary"
            icon={<ExternalLink size={15} />}
            onClick={() => showToast('Реєстрація інструктажу виконується в системі Документообігу (docNet)')}
          >
            Зареєструвати інструктаж у docNet
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

/* ════════════════════════ СЕКЦІЯ ════════════════════════ */

type SafetyTab = 'team' | 'electrical';
type TeamView = 'overview' | 'detailed';
type StatusFilter = 'all' | 'soon' | 'expired';
type SortState = { col: 'name' | 'date'; dir: 1 | -1 };

const electricalRows = electricalRecords.map(r => {
  const m = teamMembers.find(x => x.id === r.memberId)!;
  return { ...r, name: m.name, role: m.role, status: expiryStatus(r.nextCheck) };
});

export const SafetySection = ({ showToast }: { showToast: (msg: string) => void }) => {
  const [tab, setTab] = useState<SafetyTab>('team');
  const [view, setView] = useState<TeamView>('overview');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState>({ col: 'date', dir: 1 });
  const [openSummary, setOpenSummary] = useState<MemberSummary | null>(null);

  /* KPI по активному табу */
  const kpi = useMemo(() => {
    if (tab === 'team') {
      return {
        total: summaries.length,
        soon: summaries.filter(x => x.worst === 'soon').length,
        expired: summaries.filter(x => x.worst === 'critical' || x.worst === 'expired').length,
      };
    }
    return {
      total: electricalRows.length,
      soon: electricalRows.filter(r => r.status === 'soon').length,
      expired: electricalRows.filter(r => r.status === 'critical' || r.status === 'expired').length,
    };
  }, [tab]);

  const kpiCards: { key: StatusFilter; title: string; value: number; accent: string; iconBg: string; icon: ReactNode }[] = [
    {
      key: 'all',
      title: tab === 'team' ? 'Співробітників у команді' : 'Записів з ел. безпеки',
      value: kpi.total, accent: '#2563eb', iconBg: '#e3edfb', icon: <Users size={20} color="#2563eb" />,
    },
    { key: 'soon', title: tab === 'team' ? 'Завершується (≤ 30 днів)' : 'Наближається перевірка (≤ 30 днів)', value: kpi.soon, accent: '#f59e0b', iconBg: '#fef3c7', icon: <CalendarClock size={20} color="#d97706" /> },
    { key: 'expired', title: 'Критично / Прострочено', value: kpi.expired, accent: '#ef4444', iconBg: '#fee2e2', icon: <AlertTriangle size={20} color="#dc2626" /> },
  ];

  /* Команда: фільтр + сортування */
  const filteredTeam = useMemo(() => {
    const result = summaries.filter(x => {
      const q = search.toLowerCase();
      const matchesSearch = x.member.name.toLowerCase().includes(q) || x.member.role.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'soon' ? x.worst === 'soon' : (x.worst === 'critical' || x.worst === 'expired'));
      return matchesSearch && matchesStatus;
    });
    result.sort((a, b) => {
      if (sort.col === 'name') return a.member.name.localeCompare(b.member.name, 'uk') * sort.dir;
      const bySeverity = statusRank[a.worst] - statusRank[b.worst];
      if (bySeverity !== 0) return bySeverity * sort.dir;
      return dateKey(a.nearest).localeCompare(dateKey(b.nearest)) * sort.dir;
    });
    return result;
  }, [search, statusFilter, sort]);

  const filteredElectrical = useMemo(() => {
    const result = electricalRows.filter(r => {
      const q = search.toLowerCase();
      const matchesSearch = r.name.toLowerCase().includes(q) || r.ruleName.toLowerCase().includes(q)
        || r.requiredGroup.toLowerCase().includes(q) || r.prevGroup.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'expired' ? (r.status === 'critical' || r.status === 'expired') : r.status === statusFilter);
      return matchesSearch && matchesStatus;
    });
    result.sort((a, b) => (sort.col === 'name'
      ? a.name.localeCompare(b.name, 'uk')
      : dateKey(a.nextCheck).localeCompare(dateKey(b.nextCheck))) * sort.dir);
    return result;
  }, [search, statusFilter, sort]);

  const toggleSort = (col: SortState['col']) =>
    setSort(prev => (prev.col === col ? { col, dir: prev.dir === 1 ? -1 : 1 } : { col, dir: 1 }));

  const SortIcon = ({ col }: { col: SortState['col'] }) =>
    sort.col !== col
      ? <ArrowUpDown size={13} color="#9ca3af" />
      : sort.dir === 1 ? <ArrowUp size={13} color="#2563eb" /> : <ArrowDown size={13} color="#2563eb" />;

  const openMemberById = (id: string) => {
    const x = summaries.find(y => y.member.id === id);
    if (x) setOpenSummary(x);
  };

  const th: CSSProperties = {
    fontSize: 12.5, fontWeight: 600, color: '#475569', padding: '11px 14px',
    display: 'flex', alignItems: 'center', gap: 5, userSelect: 'none',
  };
  const td: CSSProperties = { fontSize: 13.5, color: '#111827', padding: '13px 14px', display: 'flex', alignItems: 'center', minWidth: 0 };

  const overviewCols = '1.9fr 1.1fr 1.5fr 1.3fr';
  const detailedCols = '1.55fr 1.05fr 1.05fr 1.05fr 1fr 1.1fr 1.05fr';
  const elCols = '1.5fr 0.8fr 1.05fr 1.05fr 0.95fr 0.95fr 0.95fr 1.15fr';
  const gridCols = tab === 'electrical' ? elCols : view === 'overview' ? overviewCols : detailedCols;

  /* Сегмент-контрол зрізів */
  const segBtn = (active: boolean): CSSProperties => ({
    padding: '6px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit', border: 'none', borderRadius: 7,
    backgroundColor: active ? '#fff' : 'transparent',
    color: active ? '#0078d4' : '#6b7280',
    boxShadow: active ? '0 1px 3px rgba(15,60,120,0.15)' : 'none',
  });

  return (
    <main style={S.main}>
      {/* KPI-картки (клік — фільтр) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginBottom: 24, flexWrap: 'wrap' }}>
        {kpiCards.map(k => (
          <div
            key={k.key}
            onClick={() => setStatusFilter(prev => (prev === k.key ? 'all' : k.key))}
            style={{
              ...S.card,
              borderColor: statusFilter === k.key && k.key !== 'all' ? k.accent : '#e3e3e3',
              padding: '16px 18px', position: 'relative', overflow: 'hidden',
              width: 270, boxSizing: 'border-box', cursor: 'pointer',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, backgroundColor: k.accent }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{k.value}</div>
                <div style={{ fontSize: 13, color: '#374151', marginTop: 7 }}>{k.title}</div>
              </div>
              <div style={{ width: 42, height: 42, backgroundColor: k.iconBg, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {k.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Таби + зрізи + пошук + місток у docNet */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <TabList
            selectedValue={tab}
            onTabSelect={(_, d) => { setTab(d.value as SafetyTab); setStatusFilter('all'); setSearch(''); }}
          >
            <Tab value="team" icon={<Users size={16} />}>Команда</Tab>
            <Tab value="electrical" icon={<Zap size={16} />}>Ел. Безпека</Tab>
          </TabList>

          {tab === 'team' && (
            <div style={{ display: 'inline-flex', gap: 2, padding: 3, backgroundColor: '#f1f5f9', borderRadius: 9 }}>
              <button style={segBtn(view === 'overview')} onClick={() => setView('overview')}>Огляд</button>
              <button style={segBtn(view === 'detailed')} onClick={() => setView('detailed')}>Детально</button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Input
            contentBefore={<Search size={15} />}
            placeholder={tab === 'team' ? 'Пошук: співробітник, посада…' : 'Пошук: співробітник, група…'}
            value={search}
            onChange={(_, d) => setSearch(d.value)}
            style={{ minWidth: 250 }}
          />
          <Button
            appearance="primary"
            icon={<ExternalLink size={15} />}
            onClick={() => showToast('Заявка на навчання формується в системі Документообігу (docNet)')}
          >
            Сформувати заявку в docNet
          </Button>
        </div>
      </div>

      {/* Таблиця */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff' }}>
        {/* Шапка */}
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ ...th, cursor: 'pointer' }} onClick={() => toggleSort('name')}>
            {tab === 'electrical' ? 'Персонал' : 'Співробітник'} <SortIcon col="name" />
          </div>
          {tab === 'team' && view === 'overview' && (
            <>
              <div style={th}>Повторний до</div>
              <div style={th}>Відкриті питання</div>
              <div style={{ ...th, cursor: 'pointer' }} onClick={() => toggleSort('date')}>
                Найближча дата <SortIcon col="date" />
              </div>
            </>
          )}
          {tab === 'team' && view === 'detailed' && (
            <>
              <div style={{ ...th, cursor: 'pointer' }} onClick={() => toggleSort('date')}>
                Інструктажі <SortIcon col="date" />
              </div>
              <div style={th}>Навчання</div>
              <div style={th}>Медогляди</div>
              <div style={th}>Атестація</div>
              <div style={th}>Стажування / допуск</div>
              <div style={th}>Ел. Безпека</div>
            </>
          )}
          {tab === 'electrical' && (
            <>
              <div style={th}>Назва Правил</div>
              <div style={th}>Попередня група</div>
              <div style={th}>Необхідна група</div>
              <div style={th}>Попередня перевірка</div>
              <div style={{ ...th, cursor: 'pointer' }} onClick={() => toggleSort('date')}>
                Наступна перевірка <SortIcon col="date" />
              </div>
              <div style={th}>Періодичність</div>
              <div style={th}>Статус</div>
            </>
          )}
        </div>

        {/* Рядки: Команда */}
        {tab === 'team' && filteredTeam.map((x, i) => (
          <div
            key={x.member.id}
            onClick={() => setOpenSummary(x)}
            style={{
              display: 'grid', gridTemplateColumns: gridCols, cursor: 'pointer',
              borderBottom: i === filteredTeam.length - 1 ? 'none' : '1px solid #f1f5f9',
              backgroundColor: '#fff',
            }}
          >
            <div style={{ ...td, gap: 10 }}>
              {(x.worst === 'soon' || x.worst === 'critical' || x.worst === 'expired') && (
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  backgroundColor: x.worst === 'soon' ? '#f59e0b' : '#ef4444',
                }} />
              )}
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <span style={{ fontWeight: 600 }}>{x.member.name}</span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{x.member.role}</span>
              </span>
            </div>

            {view === 'overview' ? (
              <>
                <div style={td}><QuietCell status={x.briefings.status} date={x.briefings.date} /></div>
                <div style={td}><ProblemIcons problems={x.problems} /></div>
                <div style={td}><NearestCell summary={x} /></div>
              </>
            ) : (
              <>
                <div style={td}><QuietCell status={x.briefings.status} date={x.briefings.date} /></div>
                <div style={td}><QuietCell status={x.trainings.status} date={x.trainings.date} /></div>
                <div style={td}><QuietCell status={x.medical.status} date={x.medical.date} /></div>
                <div style={td}><span style={{ fontSize: 13, color: '#6b7280' }}>{x.attestation.acquaintedAt}</span></div>
                <div style={td}>
                  <span style={{ fontSize: 13, color: x.internship.warn ? '#b45309' : '#6b7280', fontWeight: x.internship.warn ? 600 : 400 }}>
                    {x.internship.label}
                  </span>
                </div>
                <div style={td}>
                  {x.electrical
                    ? <QuietCell status={x.electrical.status} date={x.electrical.date} />
                    : <span style={{ color: '#9ca3af' }}>—</span>}
                </div>
              </>
            )}
          </div>
        ))}

        {/* Рядки: Ел. Безпека */}
        {tab === 'electrical' && filteredElectrical.map((r, i) => (
          <div
            key={`${r.memberId}-${r.ruleName}`}
            onClick={() => openMemberById(r.memberId)}
            style={{
              display: 'grid', gridTemplateColumns: gridCols, cursor: 'pointer',
              borderBottom: i === filteredElectrical.length - 1 ? 'none' : '1px solid #f1f5f9',
              backgroundColor: '#fff',
            }}
          >
            <div style={{ ...td, flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
              <span style={{ fontWeight: 600 }}>{r.name}</span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{r.role}</span>
            </div>
            <div style={{ ...td }} title={r.ruleFull}>{r.ruleName}</div>
            <div style={{ ...td, fontSize: 13 }}>{r.prevGroup}</div>
            <div style={{ ...td, fontSize: 13, fontWeight: 600 }}>{r.requiredGroup}</div>
            <div style={td}>{r.lastCheck}</div>
            <div style={td}><QuietCell status={r.status} date={r.nextCheck} /></div>
            <div style={{ ...td, fontSize: 12.5, color: '#374151' }}>{r.periodicity}</div>
            <div style={td}><ExpiryBadge validUntil={r.nextCheck} /></div>
          </div>
        ))}

        {((tab === 'team' && filteredTeam.length === 0) || (tab === 'electrical' && filteredElectrical.length === 0)) && (
          <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 13.5, color: '#6b7280' }}>
            Нічого не знайдено за поточним фільтром
          </div>
        )}
      </div>

      {/* Пояснення */}
      <div style={{
        display: 'flex', gap: 12, alignItems: 'flex-start', backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe', borderRadius: 12, padding: '13px 16px', marginTop: 18,
        fontSize: 13.5, color: '#1e3a8a', lineHeight: 1.5,
      }}>
        <Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
        {tab === 'electrical' ? (
          <div>
            За <b>1 місяць</b> до дати наступної перевірки знань ви та працівник отримаєте автоматичне нагадування на електронну пошту.
            Заявка на навчання з електробезпеки формується в системі Документообігу (docNet) та додатково погоджується
            <b> відповідальною особою за електрогосподарство</b>.
          </div>
        ) : (
          <div>
            Відображаються працівники вашої гілки підпорядкування. Наведіть на іконку у «Відкритих питаннях», щоб побачити деталь,
            або клікніть на рядок для повної картини по співробітнику. Заявки та реєстрація інструктажів виконуються
            в системі Документообігу (docNet).
          </div>
        )}
      </div>

      {openSummary && (
        <MemberDrawer summary={openSummary} onClose={() => setOpenSummary(null)} showToast={showToast} />
      )}
    </main>
  );
};
