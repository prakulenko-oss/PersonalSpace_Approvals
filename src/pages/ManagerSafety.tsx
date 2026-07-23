import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Input, Dropdown, Option, Badge, Button, Tooltip, tokens } from '@fluentui/react-components';
import {
  Users, Zap, Search, ExternalLink, X, HardHat, Stethoscope, Contact, Link2,
  ArrowUp, ArrowDown, ArrowUpDown, Info, CalendarClock, AlertTriangle, CheckCircle2, FileText,
  LayoutGrid, List, GraduationCap, UserCheck, Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { S, Drawer, RightBlockHeader } from './managerUi';
import { daysUntil, expiryStatus } from '../data/safety';
import type { ExpiryStatus } from '../data/safety';
import { teamMembers, electricalRecords } from '../data/teamSafety';
import type { TeamMember } from '../data/teamSafety';

/* ════════════════════════ ХЕЛПЕРИ ════════════════════════ */

const daysWord = (d: number) => (d === 1 ? 'день' : d < 5 ? 'дні' : 'днів');

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
      {days != null && (
        <span style={{
          display: 'inline-block', padding: '2px 8px', borderRadius: 8,
          backgroundColor: isCritical ? '#fff1f2' : '#fff7ed',
          color: isCritical ? '#e11d48' : '#f59e0b',
          fontSize: 12, fontWeight: 600,
        }}>
          {days} {daysWord(days)}
        </span>
      )}
    </span>
  );
};

/* Дата, залита кольором статусу (без бейджів поряд) */
const DateCell = ({ status, date }: { status: ExpiryStatus; date?: string }) => {
  if (!date || status === 'none') return <span style={{ color: '#9ca3af' }}>—</span>;
  if (status === 'ok') return <span style={{ fontSize: 13, color: '#6b7280' }}>{date}</span>;
  const critical = status === 'critical' || status === 'expired';
  const days = daysUntil(date);
  const hint = status === 'expired'
    ? `Прострочено (${date})`
    : days != null ? `Завершується через ${days} ${daysWord(days)}` : date;
  return (
    <Tooltip content={hint} relationship="label">
      <span style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: 8,
        backgroundColor: critical ? '#fff1f2' : '#fff7ed',
        color: critical ? '#e11d48' : '#f59e0b',
        fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'default',
      }}>
        {date}
      </span>
    </Tooltip>
  );
};

const dateKey = (d?: string) => {
  const m = d?.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m ? `${m[3]}${m[2]}${m[1]}` : '99999999';
};

const statusRank: Record<ExpiryStatus, number> = { expired: 0, critical: 1, soon: 2, ok: 3, none: 4 };

/* ════════════════════════ ЗВЕДЕННЯ ПО СПІВРОБІТНИКУ ════════════════════════ */
/* Сутності — як у працівника: Інструктажі, Медогляди, Атестація, Стажування
   + Ел. Безпека (5-та, зʼявиться найближчим часом) */

type EntityKey = 'briefings' | 'medical' | 'attestation' | 'internship' | 'electrical';

type Problem = {
  entity: EntityKey;
  label: string;          // «Медогляд — через 6 днів (10.07.2026)»
  status: ExpiryStatus;
};

type MemberSummary = {
  member: TeamMember;
  briefings: { status: ExpiryStatus; date?: string };
  medical: { status: ExpiryStatus; date?: string };
  attestation: { acquaintedAt: string };
  internship: { label: string; warn: boolean };
  electrical?: { status: ExpiryStatus; date?: string };
  problems: Problem[];
  worst: ExpiryStatus;
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
  const medical = { status: expiryStatus(m.medical.nextAt), date: m.medical.nextAt };

  const el = electricalRecords.find(r => r.memberId === m.id);
  const electrical = el ? { status: expiryStatus(el.nextCheck), date: el.nextCheck } : undefined;

  const internship = m.internship.ongoing
    ? { label: `${m.internship.ongoing.kind} до ${m.internship.ongoing.to}`, warn: true }
    : m.internship.admissionAt
      ? { label: `з ${m.internship.admissionAt}`, warn: false }
      : { label: '—', warn: false };

  const problems: Problem[] = [];
  const isProblem = (s: ExpiryStatus) => s === 'soon' || s === 'critical' || s === 'expired';
  if (isProblem(briefings.status)) problems.push({ entity: 'briefings', status: briefings.status, label: problemPhrase('Повторний інструктаж', briefings.status, briefings.date) });
  if (isProblem(medical.status)) problems.push({ entity: 'medical', status: medical.status, label: problemPhrase('Медогляд', medical.status, medical.date) });
  if (electrical && isProblem(electrical.status)) problems.push({ entity: 'electrical', status: electrical.status, label: problemPhrase('Ел. безпека — перевірка знань', electrical.status, electrical.date) });

  const statuses = [briefings.status, medical.status, ...(electrical ? [electrical.status] : [])];
  const worst = statuses.sort((a, b) => statusRank[a] - statusRank[b])[0];

  return {
    member: m,
    briefings, medical,
    attestation: { acquaintedAt: m.attestation.acquaintedAt },
    internship, electrical,
    problems, worst,
  };
});

const summaries = buildSummaries();

/* ════════════════════════ ІКОНКИ «ВІДКРИТИХ ПИТАНЬ» ════════════════════════ */

const entityIcon: Record<EntityKey, (color: string) => ReactNode> = {
  briefings:   c => <HardHat size={17} color={c} />,
  medical:     c => <Stethoscope size={17} color={c} />,
  attestation: c => <FileText size={17} color={c} />,
  internship:  c => <Users size={17} color={c} />,
  electrical:  c => <Zap size={17} color={c} />,
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
        <Tooltip key={p.entity} content={p.label} relationship="label">
          <span style={{ display: 'inline-flex', cursor: 'default' }}>
            {entityIcon[p.entity](p.status === 'soon' ? '#f59e0b' : '#ef4444')}
          </span>
        </Tooltip>
      ))}
    </span>
  );
};

/* ════════════════════════ DRAWER: ДОСЬЄ СПІВРОБІТНИКА ════════════════════════ */

const rowStyle: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  padding: '11px 14px', border: '1px solid #eef2f7', borderRadius: 10, backgroundColor: '#fafcff',
};

const SectionTitle = ({ icon, children }: { icon?: ReactNode; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.4, margin: '20px 0 9px' }}>
    {icon}
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
        <SectionTitle icon={<HardHat size={15} color="#64748b" />}>Інструктажі</SectionTitle>
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
        <SectionTitle icon={<Stethoscope size={15} color="#64748b" />}>Медичні огляди</SectionTitle>
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
        <SectionTitle icon={<FileText size={15} color="#64748b" />}>Атестація робочого місця</SectionTitle>
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
        <SectionTitle icon={<UserCheck size={15} color="#64748b" />}>Стажування / дублювання, допуск до роботи</SectionTitle>
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

        {/* Електробезпека */}
        {el && (
          <>
            <SectionTitle icon={<Zap size={15} color="#64748b" />}>Електробезпека</SectionTitle>
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

        {/* Навчання */}
        <SectionTitle icon={<GraduationCap size={15} color="#64748b" />}>Навчання</SectionTitle>
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


/* ════════════════════════ ВИВАНТАЖЕННЯ В EXCEL ════════════════════════ */

const statusLabel: Record<ExpiryStatus, string> = {
  ok: 'Чинний', soon: 'Завершується', critical: 'Критично', expired: 'Прострочено', none: '—',
};

const exportTeamToExcel = () => {
  const header = [
    'ПІБ', 'Посада',
    'Вступний інструктаж', 'Первинний інструктаж',
    'Повторний: пройдено', 'Повторний: діє до', 'Повторний: періодичність', 'Повторний: статус',
    'Подієві інструктажі (останні)',
    'Медогляд: пройдено', 'Медогляд: наступний', 'Медогляд: статус',
    'Атестація: карта умов праці', 'Атестація: дата ознайомлення', 'Атестація: чинна до',
    'Стажування / допуск до роботи',
    'Ел. безпека: правила', 'Ел. безпека: категорія персоналу',
    'Ел. безпека: попередня група', 'Ел. безпека: необхідна група',
    'Ел. безпека: попередня перевірка', 'Ел. безпека: наступна перевірка',
    'Ел. безпека: періодичність', 'Ел. безпека: статус',
    'Навчання (протоколи та терміни)',
    'Відкриті питання',
  ];

  const rows = summaries.map(x => {
    const m = x.member;
    const el = electricalRecords.find(r => r.memberId === m.id);
    return [
      m.name, m.role,
      m.introBriefingAt, m.primaryBriefingAt,
      m.repeatBriefing.passedAt, m.repeatBriefing.validUntil, m.repeatBriefing.periodicity,
      statusLabel[x.briefings.status],
      (m.extraBriefings ?? []).map(b => `${b.kind} — ${b.passedAt}${b.reason ? ` (${b.reason})` : ''}`).join('; ') || '—',
      m.medical.passedAt, m.medical.nextAt, statusLabel[x.medical.status],
      m.attestation.cardNo, m.attestation.acquaintedAt, m.attestation.validTo,
      m.internship.ongoing
        ? `${m.internship.ongoing.kind} триває до ${m.internship.ongoing.to}`
        : m.internship.admissionAt ? `Допущено з ${m.internship.admissionAt}` : '—',
      el?.ruleName ?? '—', el?.personnelCategory ?? '—',
      el?.prevGroup ?? '—', el?.requiredGroup ?? '—',
      el?.lastCheck ?? '—', el?.nextCheck ?? '—',
      el?.periodicity ?? '—', el ? statusLabel[x.electrical!.status] : '—',
      m.trainings.map(t => `${t.title} (${t.protocol}, чинне до ${t.validUntil})`).join('; '),
      x.problems.map(p => p.label).join('; ') || 'Все чинне',
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws['!cols'] = header.map((h, i) => ({ wch: Math.max(h.length + 2, ...rows.map(r => String(r[i] ?? '').length + 2), 12) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Охорона праці — команда');
  XLSX.writeFile(wb, 'Охорона_праці_команда.xlsx');
};

/* ════════════════════════ СЕКЦІЯ ════════════════════════ */

type TeamView = 'overview' | 'detailed';
type SortState = { col: 'name' | 'date'; dir: 1 | -1 };

const statusFilterOptions = [
  { value: '', label: 'Всі стани' },
  { value: 'ok', label: 'Все чинне' },
  { value: 'soon', label: 'Завершується' },
  { value: 'critical', label: 'Критично' },
  { value: 'expired', label: 'Прострочено' },
];

const entityFilterOptions: { value: '' | EntityKey; label: string }[] = [
  { value: '', label: 'Всі сутності' },
  { value: 'briefings', label: 'Інструктажі' },
  { value: 'medical', label: 'Медичні огляди' },
  { value: 'attestation', label: 'Атестація' },
  { value: 'internship', label: 'Стажування / допуск' },
  { value: 'electrical', label: 'Ел. безпека' },
];

export const SafetySection = ({ showToast }: { showToast: (msg: string) => void }) => {
  const [view, setView] = useState<TeamView>('overview');
  const [statusFilter, setStatusFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState<'' | EntityKey>('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState>({ col: 'date', dir: 1 });
  const [openSummary, setOpenSummary] = useState<MemberSummary | null>(null);

  /* Права колонка: стани згортання блоків */
  const [contactsOpen, setContactsOpen] = useState(true);
  const [linksOpen, setLinksOpen] = useState(true);

  /* KPI */
  const kpi = useMemo(() => ({
    total: summaries.length,
    soon: summaries.filter(x => x.worst === 'soon').length,
    expired: summaries.filter(x => x.worst === 'critical' || x.worst === 'expired').length,
  }), []);

  const kpiCards = [
    { title: 'Співробітників у команді', value: kpi.total, accent: '#2563eb', iconBg: '#e3edfb', icon: <Users size={20} color="#2563eb" /> },
    { title: 'Завершується (≤ 30 днів)', value: kpi.soon, accent: '#f59e0b', iconBg: '#fef3c7', icon: <CalendarClock size={20} color="#d97706" /> },
    { title: 'Критично / Прострочено', value: kpi.expired, accent: '#ef4444', iconBg: '#fee2e2', icon: <AlertTriangle size={20} color="#dc2626" /> },
  ];

  /* Фільтрація + сортування */
  const filteredTeam = useMemo(() => {
    const result = summaries.filter(x => {
      const q = search.toLowerCase();
      const matchesSearch = x.member.name.toLowerCase().includes(q) || x.member.role.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || x.worst === statusFilter;
      const matchesEntity = !entityFilter || x.problems.some(p => p.entity === entityFilter);
      return matchesSearch && matchesStatus && matchesEntity;
    });
    result.sort((a, b) => {
      if (sort.col === 'name') return a.member.name.localeCompare(b.member.name, 'uk') * sort.dir;
      const bySeverity = statusRank[a.worst] - statusRank[b.worst];
      if (bySeverity !== 0) return bySeverity * sort.dir;
      return dateKey(a.briefings.date).localeCompare(dateKey(b.briefings.date)) * sort.dir;
    });
    return result;
  }, [search, statusFilter, entityFilter, sort]);

  const toggleSort = (col: SortState['col']) =>
    setSort(prev => (prev.col === col ? { col, dir: prev.dir === 1 ? -1 : 1 } : { col, dir: 1 }));

  const SortIcon = ({ col }: { col: SortState['col'] }) =>
    sort.col !== col
      ? <ArrowUpDown size={13} color="#9ca3af" />
      : sort.dir === 1 ? <ArrowUp size={13} color="#2563eb" /> : <ArrowDown size={13} color="#2563eb" />;

  const th: CSSProperties = {
    fontSize: 12.5, fontWeight: 600, color: '#475569', padding: '11px 14px',
    display: 'flex', alignItems: 'center', gap: 5, userSelect: 'none',
  };
  const td: CSSProperties = { fontSize: 13.5, color: '#111827', padding: '13px 14px', display: 'flex', alignItems: 'center', minWidth: 0 };

  const overviewCols = '1.9fr 1.1fr 1.6fr';
  const detailedCols = '1.7fr 1fr 1fr 1fr 1.15fr 1fr';
  const gridCols = view === 'overview' ? overviewCols : detailedCols;

  const contacts = [
    { role: 'Інженер з охорони праці', email: 'OP_SUPPORT@kyivstar.net' },
    { role: 'Відповідальна особа за електрогосподарство', email: 'ENERGO.SAFETY@kyivstar.net' },
  ];

  const quickLinks = [
    { label: 'Інструкції з охорони праці', hint: 'SharePoint' },
    { label: 'Технологічні карти', hint: 'SharePoint' },
  ];

  return (
    <>
      {/* ═══ MAIN ═══ */}
      <main style={S.main}>
        {/* KPI Cards */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginBottom: 24, flexWrap: 'wrap' }}>
          {kpiCards.map(k => (
            <div key={k.title} style={{ ...S.card, borderColor: '#e3e3e3', padding: '16px 18px', position: 'relative', overflow: 'hidden', width: 270, boxSizing: 'border-box' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, backgroundColor: k.accent }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
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

        {/* Table block — форма як у Довіреностях */}
        <div style={{ ...S.card, marginBottom: 24 }}>
          {/* Search + filters + перемикач режимів відображення */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, padding: '16px 18px 12px' }}>
            <Input
              value={search}
              onChange={(_, d) => setSearch(d.value)}
              placeholder="Пошук за ПІБ / посадою"
              aria-label="Пошук"
              contentBefore={<Search size={15} color={tokens.colorNeutralForeground3} />}
              style={{ flex: '0 0 280px' }}
            />
            <Dropdown
              value={statusFilterOptions.find(o => o.value === statusFilter)?.label ?? 'Всі стани'}
              selectedOptions={[statusFilter]}
              onOptionSelect={(_, d) => setStatusFilter(d.optionValue ?? '')}
              aria-label="Фільтр за станом"
              style={{ flex: '0 0 170px', minWidth: 0 }}
            >
              {statusFilterOptions.map(o => <Option key={o.label} value={o.value} text={o.label}>{o.label}</Option>)}
            </Dropdown>
            <Dropdown
              value={entityFilterOptions.find(o => o.value === entityFilter)?.label ?? 'Всі сутності'}
              selectedOptions={[entityFilter]}
              onOptionSelect={(_, d) => setEntityFilter((d.optionValue ?? '') as '' | EntityKey)}
              aria-label="Фільтр за сутністю"
              style={{ flex: '0 0 200px', minWidth: 0 }}
            >
              {entityFilterOptions.map(o => <Option key={o.label} value={o.value} text={o.label}>{o.label}</Option>)}
            </Dropdown>

            {/* Перемикач режимів — як у Центрі затверджень */}
            <div style={{
              display: 'flex', alignItems: 'center', marginLeft: 'auto',
              backgroundColor: tokens.colorNeutralBackground2, borderRadius: 8, padding: 2,
            }}>
              <Tooltip content="Огляд" relationship="label">
                <Button
                  appearance="subtle"
                  icon={<LayoutGrid size={18} />}
                  onClick={() => setView('overview')}
                  style={{
                    backgroundColor: view === 'overview' ? 'white' : 'transparent',
                    color: view === 'overview' ? '#229FFF' : tokens.colorNeutralForeground3,
                    borderRadius: 6, minWidth: 36, padding: 6,
                    boxShadow: view === 'overview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                />
              </Tooltip>
              <Tooltip content="Детально" relationship="label">
                <Button
                  appearance="subtle"
                  icon={<List size={18} />}
                  onClick={() => setView('detailed')}
                  style={{
                    backgroundColor: view === 'detailed' ? 'white' : 'transparent',
                    color: view === 'detailed' ? '#229FFF' : tokens.colorNeutralForeground3,
                    borderRadius: 6, minWidth: 36, padding: 6,
                    boxShadow: view === 'detailed' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                />
              </Tooltip>
            </div>

            <Tooltip content="Детальні дані по всіх співробітниках" relationship="label">
              <Button
                appearance="secondary"
                icon={<Download size={15} />}
                onClick={() => exportTeamToExcel()}
              >
                Вивантажити в Excel
              </Button>
            </Tooltip>
          </div>

          {/* Легенда статусів — патерн Управління Командою */}
          {(
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 18px',
              padding: '9px 18px 12px', fontSize: 12.5, color: '#475569',
            }}>
              <span>Легенда статусів:</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <HardHat size={15} color="#64748b" /> Інструктаж
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Stethoscope size={15} color="#64748b" /> Медогляд
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Zap size={15} color="#64748b" /> Ел. безпека
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ padding: '1px 8px', borderRadius: 8, backgroundColor: '#fff7ed', color: '#f59e0b', fontWeight: 600 }}>≤ 30 днів</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ padding: '1px 8px', borderRadius: 8, backgroundColor: '#fff1f2', color: '#e11d48', fontWeight: 600 }}>≤ 14 днів / прострочено</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={15} color="#22c55e" /> Все гаразд
              </span>
            </div>
          )}

          {/* Шапка таблиці */}
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, backgroundColor: '#f8fafc', borderTop: '1px solid #eef2f7', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ ...th, cursor: 'pointer' }} onClick={() => toggleSort('name')}>
              Співробітник <SortIcon col="name" />
            </div>
            {view === 'overview' ? (
              <>
                <div style={{ ...th, cursor: 'pointer' }} onClick={() => toggleSort('date')}>
                  Повторний до <SortIcon col="date" />
                </div>
                <div style={th}>Відкриті питання</div>
              </>
            ) : (
              <>
                <div style={{ ...th, cursor: 'pointer' }} onClick={() => toggleSort('date')}>
                  <HardHat size={14} color="#64748b" /> Інструктажі <SortIcon col="date" />
                </div>
                <div style={th}><Stethoscope size={14} color="#64748b" /> Медогляди</div>
                <div style={th}><FileText size={14} color="#64748b" /> Атестація</div>
                <div style={th}><UserCheck size={14} color="#64748b" /> Стажування / допуск</div>
                <div style={th}><Zap size={14} color="#64748b" /> Ел. Безпека</div>
              </>
            )}
          </div>

          {/* Рядки */}
          {filteredTeam.map((x, i) => (
            <div
              key={x.member.id}
              onClick={() => setOpenSummary(x)}
              style={{
                display: 'grid', gridTemplateColumns: gridCols, cursor: 'pointer',
                borderBottom: i === filteredTeam.length - 1 ? 'none' : '1px solid #f1f5f9',
                backgroundColor: '#fff',
              }}
            >
              <div style={{ ...td, flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                <span style={{ fontWeight: 600 }}>{x.member.name}</span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{x.member.role}</span>
              </div>

              {view === 'overview' ? (
                <>
                  <div style={td}><DateCell status={x.briefings.status} date={x.briefings.date} /></div>
                  <div style={td}><ProblemIcons problems={x.problems} /></div>
                </>
              ) : (
                <>
                  <div style={td}><DateCell status={x.briefings.status} date={x.briefings.date} /></div>
                  <div style={td}><DateCell status={x.medical.status} date={x.medical.date} /></div>
                  <div style={td}><span style={{ fontSize: 13, color: '#6b7280' }}>{x.attestation.acquaintedAt}</span></div>
                  <div style={td}>
                    <span style={{ fontSize: 13, color: x.internship.warn ? '#b45309' : '#6b7280', fontWeight: x.internship.warn ? 600 : 400 }}>
                      {x.internship.label}
                    </span>
                  </div>
                  <div style={td}>
                    {x.electrical
                      ? <DateCell status={x.electrical.status} date={x.electrical.date} />
                      : <span style={{ color: '#9ca3af' }}>—</span>}
                  </div>
                </>
              )}
            </div>
          ))}

          {filteredTeam.length === 0 && (
            <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 13.5, color: '#6b7280' }}>
              Нічого не знайдено за поточним фільтром
            </div>
          )}
        </div>

        {/* Пояснення */}
        <div style={{
          display: 'flex', gap: 12, alignItems: 'flex-start', backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe', borderRadius: 12, padding: '13px 16px',
          fontSize: 13.5, color: '#1e3a8a', lineHeight: 1.5,
        }}>
          <Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            Відображаються працівники вашої гілки підпорядкування. Наведіть на іконку у «Відкритих питаннях», щоб побачити деталь,
            або клікніть на рядок для повної картини по співробітнику. Заявки та реєстрація інструктажів виконуються
            в системі Документообігу (docNet); заявки з електробезпеки додатково погоджує відповідальна особа за електрогосподарство.
          </div>
        </div>
      </main>

      {/* ═══ RIGHT COLUMN ═══ */}
      <aside style={S.rightBar}>
        {/* Контакти */}
        <div style={S.card}>
          <RightBlockHeader
            icon={<Contact size={18} color="#2f6fde" />}
            title="Контакти"
            open={contactsOpen}
            onToggle={() => setContactsOpen(o => !o)}
          />
          {contactsOpen && (
            <div style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {contacts.map(c => (
                <div key={c.email}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{c.role}</div>
                  <a
                    href={`mailto:${c.email}`}
                    style={{ display: 'inline-block', marginTop: 6, fontSize: 13.5, color: '#2563eb', textDecoration: 'underline' }}
                  >
                    {c.email}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Корисні посилання */}
        <div style={S.card}>
          <RightBlockHeader
            icon={<Link2 size={18} color="#2f6fde" />}
            title="Корисні посилання"
            open={linksOpen}
            onToggle={() => setLinksOpen(o => !o)}
          />
          {linksOpen && (
            <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column' }}>
              {quickLinks.map((l, i) => (
                <button
                  key={l.label}
                  onClick={() => showToast(`«${l.label}» відкриється у відповідному розділі (${l.hint})`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '11px 2px',
                    backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                    borderBottom: i === quickLinks.length - 1 ? 'none' : '1px solid #f1f5f9',
                    fontFamily: 'inherit', fontSize: 13.5, color: '#111827', textAlign: 'left',
                  }}
                >
                  <span>{l.label}</span>
                  <ExternalLink size={13} color="#374151" />
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {openSummary && (
        <MemberDrawer summary={openSummary} onClose={() => setOpenSummary(null)} showToast={showToast} />
      )}
    </>
  );
};
