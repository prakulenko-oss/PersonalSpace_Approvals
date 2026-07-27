import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { TabList, Tab, Input, Dropdown, Option, Badge, Button, Tooltip, tokens } from '@fluentui/react-components';
import {
  Users, Search, ExternalLink, X, HardHat, Stethoscope, Contact, Link2,
  ArrowUp, ArrowDown, ArrowUpDown, Info, CalendarClock, AlertTriangle, ChevronLeft, ChevronRight,
  GraduationCap, FileSpreadsheet, FileText, UserCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import { S, Drawer, RightBlockHeader } from './managerUi';
import { daysUntil, expiryStatus } from '../data/safety';
import type { ExpiryStatus } from '../data/safety';
import { teamMembers } from '../data/teamSafety';
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

type EntityKey = 'briefings' | 'medical';

type Problem = {
  entity: EntityKey;
  label: string;          // «Медогляд — через 6 днів (10.07.2026)»
  status: ExpiryStatus;
};

type MemberSummary = {
  member: TeamMember;
  briefings: { status: ExpiryStatus; date?: string };
  medical: { status: ExpiryStatus; date?: string };
  attestation?: { acquaintedAt: string };          // відсутня — нормальний стан
  internship: { label: string; warn: boolean };    // label '—', якщо не передбачене
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

  const problems: Problem[] = [];
  const isProblem = (s: ExpiryStatus) => s === 'soon' || s === 'critical' || s === 'expired';
  if (isProblem(briefings.status)) problems.push({ entity: 'briefings', status: briefings.status, label: problemPhrase('Повторний інструктаж', briefings.status, briefings.date) });
  if (isProblem(medical.status)) problems.push({ entity: 'medical', status: medical.status, label: problemPhrase('Медогляд', medical.status, medical.date) });

  const statuses = [briefings.status, medical.status];
  const worst = statuses.sort((a, b) => statusRank[a] - statusRank[b])[0];

  const internship = m.internship?.ongoing
    ? { label: `${m.internship.ongoing.kind} до ${m.internship.ongoing.to}`, warn: true }
    : m.internship?.admissionAt
      ? { label: `з ${m.internship.admissionAt}`, warn: false }
      : { label: '—', warn: false };

  return {
    member: m, briefings, medical,
    attestation: m.attestation ? { acquaintedAt: m.attestation.acquaintedAt } : undefined,
    internship,
    problems, worst,
  };
});

const summaries = buildSummaries();

/* Вкладка «Навчання»: рядок = навчання (демо-дані до підключення реєстру) */
const trainingRows = teamMembers.flatMap(m => m.trainings.map(t => ({
  memberId: m.id, name: m.name, role: m.role,
  title: t.title, protocol: t.protocol,
  passedAt: t.passedAt, validUntil: t.validUntil,
  status: expiryStatus(t.validUntil),
})));


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
        {/* Управлінський підсумок — спершу висновок, потім деталі */}
        {(() => {
          const trainingProblems = m.trainings
            .map(t => ({ st: expiryStatus(t.validUntil), t }))
            .filter(x => x.st === 'soon' || x.st === 'critical' || x.st === 'expired')
            .map(x => problemPhrase(x.t.title, x.st, x.t.validUntil));
          const allProblems = [...summary.problems.map(pr => pr.label), ...trainingProblems];
          const worstAll: ExpiryStatus = summary.worst === 'ok' && trainingProblems.length > 0
            ? 'soon'
            : summary.worst;
          const isRed = worstAll === 'critical' || worstAll === 'expired';
          const isYellow = worstAll === 'soon';
          return (
            <div style={{
              marginTop: 14, padding: '13px 16px', borderRadius: 12,
              border: `1px solid ${isRed ? '#fecaca' : isYellow ? '#fde68a' : '#bbf7d0'}`,
              backgroundColor: isRed ? '#fff7f7' : isYellow ? '#fffdf5' : '#f6fdf9',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <Badge appearance="tint" color={isRed ? 'danger' : isYellow ? 'warning' : 'success'}>
                  {isRed ? 'Критично' : isYellow ? 'Завершується' : 'Все чинне'}
                </Badge>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>
                  Відкритих питань: {allProblems.length}
                </span>
              </div>
              {allProblems.length > 0 ? (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {allProblems.map(t => (
                    <div key={t} style={{ fontSize: 12.5, color: '#374151' }}>· {t}</div>
                  ))}
                </div>
              ) : (
                <div style={{ marginTop: 6, fontSize: 12.5, color: '#4b5563' }}>
                  Жодних дій не потрібно — всі терміни чинні.
                </div>
              )}
            </div>
          );
        })()}

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
        {m.attestation ? (
          <div style={rowStyle}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{m.attestation.cardNo}</div>
              <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>
                Ознайомлення <b style={{ color: '#111827' }}>{m.attestation.acquaintedAt}</b>
              </div>
            </div>
            <Badge appearance="tint" color="success">Ознайомлено</Badge>
          </div>
        ) : (
          <div style={{ ...rowStyle, backgroundColor: '#fafafa', border: '1px dashed #d1d5db' }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Атестація для робочого місця відсутня — це нормальний стан для цієї посади</span>
            <Badge appearance="tint" color="informative">Не передбачено</Badge>
          </div>
        )}

        {/* Стажування / допуск */}
        <SectionTitle icon={<UserCheck size={15} color="#64748b" />}>Стажування / дублювання, допуск до роботи</SectionTitle>
        {m.internship ? (
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
        ) : (
          <div style={{ ...rowStyle, backgroundColor: '#fafafa', border: '1px dashed #d1d5db' }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Стажування / допуск для цієї посади не передбачені</span>
            <Badge appearance="tint" color="informative">Не передбачено</Badge>
          </div>
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
/* Аркуш «Команда»: рядок = співробітник, сутності — групами колонок «Пройдено/Діє до».
   Аркуш «Навчання»: довгий формат (рядок = навчання) для фільтрів. */

const statusLabel: Record<ExpiryStatus, string> = {
  ok: 'Чинний', soon: 'Завершується', critical: 'Критично', expired: 'Прострочено', none: '—',
};

/* Стилі клітинок */
const XS = {
  head: { font: { bold: true, sz: 11 }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          fill: { fgColor: { rgb: 'F1F5F9' } },
          border: { top: { style: 'thin', color: { rgb: 'CBD5E1' } }, bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
                    left: { style: 'thin', color: { rgb: 'CBD5E1' } }, right: { style: 'thin', color: { rgb: 'CBD5E1' } } } },
  cell: { alignment: { vertical: 'center' } },
  soon: { alignment: { vertical: 'center' }, fill: { fgColor: { rgb: 'FEF3C7' } }, font: { color: { rgb: '92400E' }, bold: true } },
  crit: { alignment: { vertical: 'center' }, fill: { fgColor: { rgb: 'FEE2E2' } }, font: { color: { rgb: 'B91C1C' }, bold: true } },
} as const;

const styledDate = (date: string | undefined, status: ExpiryStatus) => ({
  v: date ?? '—',
  t: 's' as const,
  s: status === 'soon' ? XS.soon : (status === 'critical' || status === 'expired') ? XS.crit : XS.cell,
});

const exportTeamToExcel = () => {
  const wb = XLSX.utils.book_new();

  /* ── Аркуш 1: Команда (матриця) ── */
  const topRow = [
    'ПІБ', 'Посада',
    'Інструктажі', '', 'Медичні огляди', '', 'Атестація',
    'Стажування / допуск',
  ];
  const subRow = [
    '', '',
    'Пройдено', 'Діє до', 'Пройдено', 'Наступний', 'Ознайомлення',
    'Допуск з',
  ];

  const dataRows = summaries.map(x => {
    const m = x.member;
    return [
      { v: m.name, t: 's', s: XS.cell },
      { v: m.role, t: 's', s: XS.cell },
      { v: m.repeatBriefing.passedAt, t: 's', s: XS.cell },
      styledDate(m.repeatBriefing.validUntil, x.briefings.status),
      { v: m.medical.passedAt, t: 's', s: XS.cell },
      styledDate(m.medical.nextAt, x.medical.status),
      { v: m.attestation?.acquaintedAt ?? '—', t: 's', s: XS.cell },
      { v: m.internship?.ongoing ? `${m.internship.ongoing.kind} до ${m.internship.ongoing.to}` : m.internship?.admissionAt ?? '—', t: 's', s: XS.cell },
    ];
  });

  const headTop = topRow.map(v => ({ v, t: 's' as const, s: XS.head }));
  const headSub = subRow.map(v => ({ v, t: 's' as const, s: XS.head }));
  const ws = XLSX.utils.aoa_to_sheet([headTop, headSub, ...dataRows]);

  /* Обʼєднання: ПІБ/Посада/Стажування/Відкриті питання — вертикально; сутності — горизонтально */
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },   // ПІБ
    { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },   // Посада
    { s: { r: 0, c: 2 }, e: { r: 0, c: 3 } },   // Інструктажі
    { s: { r: 0, c: 4 }, e: { r: 0, c: 5 } },   // Медогляди
    { s: { r: 0, c: 6 }, e: { r: 1, c: 6 } },   // Атестація (Ознайомлення)
    { s: { r: 0, c: 7 }, e: { r: 1, c: 7 } },   // Стажування / допуск
  ];
  ws['!cols'] = [
    { wch: 24 }, { wch: 34 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 14 }, { wch: 22 },
  ];
  ws['!freeze'] = { xSplit: 1, ySplit: 2 };
  ws['!autofilter'] = { ref: `A2:H${dataRows.length + 2}` };
  XLSX.utils.book_append_sheet(wb, ws, 'Команда');

  /* ── Аркуш 2: Навчання (довгий формат) ── */
  const tHead = ['ПІБ', 'Посада', 'Навчання', 'Протокол', 'Пройдено', 'Чинне до', 'Статус']
    .map(v => ({ v, t: 's' as const, s: XS.head }));
  const tRows = teamMembers.flatMap(m => m.trainings.map(t => {
    const st = expiryStatus(t.validUntil);
    return [
      { v: m.name, t: 's', s: XS.cell },
      { v: m.role, t: 's', s: XS.cell },
      { v: t.title, t: 's', s: XS.cell },
      { v: t.protocol, t: 's', s: XS.cell },
      { v: t.passedAt, t: 's', s: XS.cell },
      styledDate(t.validUntil, st),
      { v: statusLabel[st], t: 's', s: st === 'soon' ? XS.soon : (st === 'critical' || st === 'expired') ? XS.crit : XS.cell },
    ];
  }));
  const wsT = XLSX.utils.aoa_to_sheet([tHead, ...tRows]);
  wsT['!cols'] = [{ wch: 24 }, { wch: 34 }, { wch: 40 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }];
  wsT['!freeze'] = { xSplit: 0, ySplit: 1 };
  wsT['!autofilter'] = { ref: `A1:G${tRows.length + 1}` };
  XLSX.utils.book_append_sheet(wb, wsT, 'Навчання');

  XLSX.writeFile(wb, 'Охорона_праці_команда.xlsx');
};

/* ════════════════════════ СЕКЦІЯ ════════════════════════ */

type SortState = { col: 'name' | 'date'; dir: 1 | -1 };

const statusFilterOptions = [
  { value: '', label: 'Всі стани' },
  { value: 'ok', label: 'Все чинне' },
  { value: 'soon', label: 'Завершується' },
  { value: 'critical', label: 'Критично' },
  { value: 'expired', label: 'Прострочено' },
];

const entityFilterOptions: { value: '' | EntityKey; label: string }[] = [
  { value: '', label: 'Всі відкриті питання' },
  { value: 'briefings', label: 'Питання: інструктажі' },
  { value: 'medical', label: 'Питання: медогляди' },
];

export const SafetySection = ({ showToast }: { showToast: (msg: string) => void }) => {
  const [tab, setTab] = useState<'team' | 'trainings'>('team');
  const TRAINING_PAGE_SIZE = 6;
  const [trainingPage, setTrainingPage] = useState(1);
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

  /* Фільтрація вкладки «Навчання» */
  const filteredTrainings = useMemo(() => {
    const result = trainingRows.filter(r => {
      const q = search.toLowerCase();
      const matchesSearch = r.name.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.protocol.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    result.sort((a, b) => (sort.col === 'name'
      ? a.name.localeCompare(b.name, 'uk')
      : dateKey(a.validUntil).localeCompare(dateKey(b.validUntil))) * sort.dir);
    return result;
  }, [search, statusFilter, sort]);

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

  /* Пагінація вкладки «Навчання» — за патерном Довіреностей */
  const trainingTotalPages = Math.max(1, Math.ceil(filteredTrainings.length / TRAINING_PAGE_SIZE));
  const trainingSafePage = Math.min(trainingPage, trainingTotalPages);
  const pagedTrainings = filteredTrainings.slice((trainingSafePage - 1) * TRAINING_PAGE_SIZE, trainingSafePage * TRAINING_PAGE_SIZE);

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

  const teamCols = '1.7fr 1.15fr 1.05fr 1.05fr 1.15fr';
  const trainingCols = '1.6fr 1.9fr 0.85fr 0.9fr 1fr 1.15fr';
  const gridCols = tab === 'trainings' ? trainingCols : teamCols;

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
          {/* Tabs: Команда / Навчання */}
          <div style={{ padding: '6px 12px', borderBottom: '1px solid #eef2f7' }}>
            <TabList
              selectedValue={tab}
              onTabSelect={(_, d) => { setTab(d.value as 'team' | 'trainings'); setStatusFilter(''); setEntityFilter(''); setSearch(''); setTrainingPage(1); }}
            >
              <Tab value="team">Команда</Tab>
              <Tab value="trainings">Навчання</Tab>
            </TabList>
          </div>

          {/* Search + filters + перемикач режимів відображення */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, padding: '16px 18px 12px' }}>
            <Input
              value={search}
              onChange={(_, d) => { setSearch(d.value); setTrainingPage(1); }}
              placeholder={tab === 'team' ? 'Пошук за ПІБ / посадою' : 'Пошук: ПІБ, навчання, протокол'}
              aria-label="Пошук"
              contentBefore={<Search size={15} color={tokens.colorNeutralForeground3} />}
              style={{ flex: '0 0 280px' }}
            />
            <Dropdown
              value={statusFilterOptions.find(o => o.value === statusFilter)?.label ?? 'Всі стани'}
              selectedOptions={[statusFilter]}
              onOptionSelect={(_, d) => { setStatusFilter(d.optionValue ?? ''); setTrainingPage(1); }}
              aria-label="Фільтр за станом"
              style={{ flex: '0 0 170px', minWidth: 0 }}
            >
              {statusFilterOptions.map(o => <Option key={o.label} value={o.value} text={o.label}>{o.label}</Option>)}
            </Dropdown>
            {tab === 'team' && <Dropdown
              value={entityFilterOptions.find(o => o.value === entityFilter)?.label ?? 'Всі відкриті питання'}
              selectedOptions={[entityFilter]}
              onOptionSelect={(_, d) => setEntityFilter((d.optionValue ?? '') as '' | EntityKey)}
              aria-label="Фільтр за сутністю"
              style={{ flex: '0 0 200px', minWidth: 0 }}
            >
              {entityFilterOptions.map(o => <Option key={o.label} value={o.value} text={o.label}>{o.label}</Option>)}
            </Dropdown>}

            <Tooltip content="Детальні дані по всіх співробітниках" relationship="label">
              <button
                data-export
                onClick={() => exportTeamToExcel()}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0B5C30'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#107C41'; }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, marginLeft: 'auto',
                  padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  backgroundColor: '#107C41', color: '#fff',
                  fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600,
                  transition: 'background-color .15s ease',
                  boxShadow: '0 1px 3px rgba(16,124,65,0.35)',
                }}
              >
                <FileSpreadsheet size={16} />
                Експорт Excel
              </button>
            </Tooltip>
          </div>

          {/* Легенда статусів — патерн Управління Командою */}
          {tab === 'team' && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 18px',
              padding: '9px 18px 12px', fontSize: 12.5, color: '#475569',
            }}>
              <span>Легенда статусів:</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ padding: '1px 8px', borderRadius: 8, backgroundColor: '#fff7ed', color: '#f59e0b', fontWeight: 600 }}>дата</span>
                завершується ≤ 30 днів
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ padding: '1px 8px', borderRadius: 8, backgroundColor: '#fff1f2', color: '#e11d48', fontWeight: 600 }}>дата</span>
                критично ≤ 14 днів / прострочено
              </span>
              <span style={{ color: '#94a3b8' }}>сіра дата — чинне · «—» — не передбачено для посади</span>
            </div>
          )}

          {/* Шапка таблиці */}
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, backgroundColor: '#f8fafc', borderTop: '1px solid #eef2f7', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ ...th, cursor: 'pointer' }} onClick={() => toggleSort('name')}>
              Співробітник <SortIcon col="name" />
            </div>
            {tab === 'trainings' ? (
              <>
                <div style={th}><GraduationCap size={14} color="#64748b" /> Навчання</div>
                <div style={th}>Протокол</div>
                <div style={th}>Пройдено</div>
                <div style={{ ...th, cursor: 'pointer' }} onClick={() => toggleSort('date')}>
                  Чинне до <SortIcon col="date" />
                </div>
                <div style={th}>Статус</div>
              </>
            ) : (
              <>
                <div style={{ ...th, cursor: 'pointer' }} onClick={() => toggleSort('date')}>
                  <HardHat size={14} color="#64748b" /> Повторний до <SortIcon col="date" />
                </div>
                <div style={th}><Stethoscope size={14} color="#64748b" /> Медогляд</div>
                <div style={th}><FileText size={14} color="#64748b" /> Атестація</div>
                <div style={th}><UserCheck size={14} color="#64748b" /> Стажування / допуск</div>
              </>
            )}
          </div>

          {/* Рядки: Навчання */}
          {tab === 'trainings' && pagedTrainings.map((r, i) => (
            <div
              key={`${r.memberId}-${r.protocol}`}
              onClick={() => { const x = summaries.find(y => y.member.id === r.memberId); if (x) setOpenSummary(x); }}
              style={{
                display: 'grid', gridTemplateColumns: gridCols, cursor: 'pointer',
                borderBottom: i === pagedTrainings.length - 1 ? 'none' : '1px solid #f1f5f9',
                backgroundColor: '#fff',
              }}
            >
              <div style={{ ...td, flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                <span style={{ fontWeight: 600 }}>{r.name}</span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{r.role}</span>
              </div>
              <div style={td}>{r.title}</div>
              <div style={{ ...td, fontSize: 13 }}>{r.protocol}</div>
              <div style={{ ...td, fontSize: 13, color: '#6b7280' }}>{r.passedAt}</div>
              <div style={td}><DateCell status={r.status} date={r.validUntil} /></div>
              <div style={td}><ExpiryBadge validUntil={r.validUntil} /></div>
            </div>
          ))}
          {tab === 'trainings' && filteredTrainings.length === 0 && (
            <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 13.5, color: '#6b7280' }}>
              Нічого не знайдено за поточним фільтром
            </div>
          )}
          {tab === 'trainings' && filteredTrainings.length > TRAINING_PAGE_SIZE && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, padding: '14px 18px' }}>
              <span style={{ fontSize: 12.5, color: '#6b7280' }}>
                Показано {(trainingSafePage - 1) * TRAINING_PAGE_SIZE + 1}–{Math.min(trainingSafePage * TRAINING_PAGE_SIZE, filteredTrainings.length)} з {filteredTrainings.length}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  onClick={() => setTrainingPage(pg => Math.max(1, pg - 1))}
                  disabled={trainingSafePage === 1}
                  aria-label="Попередня сторінка"
                  style={{ width: 30, height: 30, border: '1px solid #e5e7eb', backgroundColor: '#fff', borderRadius: 7, cursor: trainingSafePage === 1 ? 'default' : 'pointer', color: trainingSafePage === 1 ? '#d1d5db' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: trainingTotalPages }, (_, n) => n + 1).map(pg => (
                  <button
                    key={pg}
                    onClick={() => setTrainingPage(pg)}
                    aria-label={`Сторінка ${pg}`}
                    aria-current={pg === trainingSafePage ? 'page' : undefined}
                    style={{ minWidth: 30, height: 30, padding: '0 8px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', border: pg === trainingSafePage ? '1px solid #2563eb' : '1px solid #e5e7eb', backgroundColor: pg === trainingSafePage ? '#eaf3fd' : '#fff', color: pg === trainingSafePage ? '#2563eb' : '#374151' }}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  onClick={() => setTrainingPage(pg => Math.min(trainingTotalPages, pg + 1))}
                  disabled={trainingSafePage === trainingTotalPages}
                  aria-label="Наступна сторінка"
                  style={{ width: 30, height: 30, border: '1px solid #e5e7eb', backgroundColor: '#fff', borderRadius: 7, cursor: trainingSafePage === trainingTotalPages ? 'default' : 'pointer', color: trainingSafePage === trainingTotalPages ? '#d1d5db' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

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
              <div style={{ ...td, flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                <span style={{ fontWeight: 600 }}>{x.member.name}</span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{x.member.role}</span>
              </div>

              <div style={td}><DateCell status={x.briefings.status} date={x.briefings.date} /></div>
              <div style={td}><DateCell status={x.medical.status} date={x.medical.date} /></div>
              <div style={td}>
                <span style={{ fontSize: 13, color: x.attestation ? '#6b7280' : '#9ca3af' }}>
                  {x.attestation?.acquaintedAt ?? '—'}
                </span>
              </div>
              <div style={td}>
                <span style={{ fontSize: 13, color: x.internship.warn ? '#b45309' : x.internship.label === '—' ? '#9ca3af' : '#6b7280', fontWeight: x.internship.warn ? 600 : 400 }}>
                  {x.internship.label}
                </span>
              </div>
            </div>
          ))}

          {tab === 'team' && filteredTeam.length === 0 && (
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
          {tab === 'trainings' ? (
          <div>
            Демо-дані. Джерело — майбутній єдиний реєстр навчань (автоматичне зчитування протоколів
            з електронного архіву); наразі облік ведеться вручну. Заявки на навчання формуються
            в системі Документообігу (docNet); за ~1,5 місяця до завершення терміну ви та інженер
            з охорони праці отримаєте автоматичне нагадування.
          </div>
          ) : (
          <div>
            Відображаються працівники вашої гілки підпорядкування. Наведіть на іконку у «Відкритих питаннях», щоб побачити деталь,
            або клікніть на рядок для повної картини по співробітнику. Заявки та реєстрація інструктажів виконуються
            в системі Документообігу (docNet).
          </div>
          )}
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
