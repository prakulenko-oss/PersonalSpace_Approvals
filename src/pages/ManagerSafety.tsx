import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { TabList, Tab, Input, Badge, Button } from '@fluentui/react-components';
import {
  GraduationCap, ShieldCheck, Search, ExternalLink, X,
  ArrowUp, ArrowDown, ArrowUpDown, Info, CalendarClock, AlertTriangle, Users, Zap,
} from 'lucide-react';
import { S, Drawer } from './managerUi';
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
      {days != null && <span style={{ fontSize: 12, color: isCritical ? '#b91c1c' : '#b45309', fontWeight: 600 }}>через {days} {daysWord(days)}</span>}
    </span>
  );
};

const dateKey = (d: string) => {
  const m = d.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m ? `${m[3]}${m[2]}${m[1]}` : '99999999';
};

/* ════════════════════════ ПЛОСКІ РЯДКИ ТАБЛИЦЬ ════════════════════════ */

type TrainingRow = {
  memberId: string;
  name: string;
  role: string;
  title: string;
  protocol: string;
  passedAt: string;
  validUntil: string;
  status: ExpiryStatus;
};

type BriefingRow = {
  memberId: string;
  name: string;
  role: string;
  passedAt: string;
  periodicity: string;
  validUntil: string;
  status: ExpiryStatus;
};

const trainingRows: TrainingRow[] = teamMembers.flatMap(m =>
  m.trainings.map(t => ({
    memberId: m.id, name: m.name, role: m.role,
    title: t.title, protocol: t.protocol,
    passedAt: t.passedAt, validUntil: t.validUntil,
    status: expiryStatus(t.validUntil),
  }))
);

const briefingRows: BriefingRow[] = teamMembers.map(m => ({
  memberId: m.id, name: m.name, role: m.role,
  passedAt: m.repeatBriefing.passedAt,
  periodicity: m.repeatBriefing.periodicity,
  validUntil: m.repeatBriefing.validUntil,
  status: expiryStatus(m.repeatBriefing.validUntil),
}));

/* Рядки табу Ел. Безпека: запис × співробітник */
const electricalRows = electricalRecords.map(r => {
  const m = teamMembers.find(x => x.id === r.memberId)!;
  return {
    ...r,
    name: m.name,
    role: m.role,
    status: expiryStatus(r.nextCheck),
  };
});

/* ════════════════════════ DRAWER СПІВРОБІТНИКА ════════════════════════ */

const rowStyle: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  padding: '11px 14px', border: '1px solid #eef2f7', borderRadius: 10, backgroundColor: '#fafcff',
};

const MemberDrawer = ({ member, onClose, showToast }: { member: TeamMember; onClose: () => void; showToast: (m: string) => void }) => (
  <Drawer width={520} onClose={onClose}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px 0' }}>
      <div>
        <div style={{ fontSize: 19, fontWeight: 700, color: '#111827' }}>{member.name}</div>
        <div style={{ fontSize: 13.5, color: '#6b7280', marginTop: 3 }}>{member.role}</div>
      </div>
      <button onClick={onClose} aria-label="Закрити" style={{ padding: 4, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
        <X size={20} />
      </button>
    </div>

    <div style={{ padding: '18px 24px 24px', overflowY: 'auto' }}>
      {/* Інструктажі */}
      <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 9 }}>
        Інструктажі
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={rowStyle}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>Повторний <span style={{ fontWeight: 400, color: '#6b7280' }}>· останній пройдений</span></div>
            <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>
              Пройдено {member.repeatBriefing.passedAt} · діє до {member.repeatBriefing.validUntil}
            </div>
            <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>
              Періодичність: {member.repeatBriefing.periodicity}
            </div>
          </div>
          <ExpiryBadge validUntil={member.repeatBriefing.validUntil} />
        </div>
        <div style={rowStyle}>
          <div style={{ fontSize: 13.5, color: '#111827' }}>
            <span style={{ fontWeight: 600 }}>Вступний</span> — {member.introBriefingAt}
            <span style={{ color: '#9ca3af', margin: '0 8px' }}>·</span>
            <span style={{ fontWeight: 600 }}>Первинний</span> — {member.primaryBriefingAt}
          </div>
          <Badge appearance="tint" color="informative">Безстроково</Badge>
        </div>
      </div>

      {/* Навчання */}
      <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.4, margin: '20px 0 9px' }}>
        Навчання
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {member.trainings.map(t => (
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

      {/* Електробезпека — якщо у співробітника є група допуску */}
      {electricalRecords.some(r => r.memberId === member.id) && (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.4, margin: '20px 0 9px' }}>
            Електробезпека
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {electricalRecords.filter(r => r.memberId === member.id).map(r => (
              <div key={r.ruleName} style={{ ...rowStyle, alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{r.ruleFull} ({r.ruleName})</div>
                  <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 3 }}>
                    Персонал: {r.personnelCategory}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>
                    Група: {r.prevGroup} → <b style={{ color: '#111827' }}>{r.requiredGroup}</b>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>
                    Перевірка знань: {r.lastCheck} · наступна {r.nextCheck} · {r.periodicity}
                  </div>
                </div>
                <ExpiryBadge validUntil={r.nextCheck} />
              </div>
            ))}
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

/* ════════════════════════ СЕКЦІЯ ════════════════════════ */

type SafetyTab = 'trainings' | 'briefings' | 'electrical';
type StatusFilter = 'all' | 'soon' | 'expired';
type SortState = { col: 'name' | 'endDate'; dir: 1 | -1 };

export const SafetySection = ({ showToast }: { showToast: (msg: string) => void }) => {
  const [tab, setTab] = useState<SafetyTab>('trainings');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState>({ col: 'endDate', dir: 1 });
  const [openMember, setOpenMember] = useState<TeamMember | null>(null);

  /* KPI по активному табу */
  const kpi = useMemo(() => {
    const rows = tab === 'trainings' ? trainingRows : tab === 'briefings' ? briefingRows : electricalRows;
    return {
      total: rows.length,
      soon: rows.filter(r => r.status === 'soon').length,
      expired: rows.filter(r => r.status === 'critical' || r.status === 'expired').length,
    };
  }, [tab]);

  const kpiCards: { key: StatusFilter; title: string; value: number; accent: string; iconBg: string; icon: React.ReactNode }[] = [
    {
      key: 'all',
      title: tab === 'trainings' ? 'Навчань по команді' : tab === 'briefings' ? 'Повторних інструктажів' : 'Записів з ел. безпеки',
      value: kpi.total, accent: '#2563eb', iconBg: '#e3edfb', icon: <Users size={20} color="#2563eb" />,
    },
    { key: 'soon',    title: tab === 'electrical' ? 'Наближається перевірка (≤ 30 днів)' : 'Завершуються (≤ 30 днів)', value: kpi.soon,    accent: '#f59e0b', iconBg: '#fef3c7', icon: <CalendarClock size={20} color="#d97706" /> },
    { key: 'expired', title: 'Критично / Прострочено',              value: kpi.expired, accent: '#ef4444', iconBg: '#fee2e2', icon: <AlertTriangle size={20} color="#dc2626" /> },
  ];

  /* Фільтрація + сортування */
  const filteredTrainings = useMemo(() => {
    const result = trainingRows.filter(r => {
      const q = search.toLowerCase();
      const matchesSearch = r.name.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.protocol.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'expired' ? (r.status === 'critical' || r.status === 'expired') : r.status === statusFilter);
      return matchesSearch && matchesStatus;
    });
    result.sort((a, b) => (sort.col === 'name'
      ? a.name.localeCompare(b.name, 'uk')
      : dateKey(a.validUntil).localeCompare(dateKey(b.validUntil))) * sort.dir);
    return result;
  }, [search, statusFilter, sort]);

  const filteredBriefings = useMemo(() => {
    const result = briefingRows.filter(r => {
      const q = search.toLowerCase();
      const matchesSearch = r.name.toLowerCase().includes(q) || r.periodicity.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'expired' ? (r.status === 'critical' || r.status === 'expired') : r.status === statusFilter);
      return matchesSearch && matchesStatus;
    });
    result.sort((a, b) => (sort.col === 'name'
      ? a.name.localeCompare(b.name, 'uk')
      : dateKey(a.validUntil).localeCompare(dateKey(b.validUntil))) * sort.dir);
    return result;
  }, [search, statusFilter, sort]);

  const filteredElectrical = useMemo(() => {
    const result = electricalRows.filter(r => {
      const q = search.toLowerCase();
      const matchesSearch = r.name.toLowerCase().includes(q) || r.ruleName.toLowerCase().includes(q)
        || r.requiredGroup.toLowerCase().includes(q) || r.prevGroup.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'expired' ? (r.status === 'critical' || r.status === 'expired') : r.status === statusFilter);
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
    const m = teamMembers.find(x => x.id === id);
    if (m) setOpenMember(m);
  };

  const th: CSSProperties = {
    fontSize: 12.5, fontWeight: 600, color: '#475569', padding: '11px 14px',
    display: 'flex', alignItems: 'center', gap: 5, userSelect: 'none',
  };
  const td: CSSProperties = { fontSize: 13.5, color: '#111827', padding: '13px 14px', display: 'flex', alignItems: 'center', minWidth: 0 };

  const gridCols = tab === 'trainings'
    ? '1.6fr 1.7fr 0.8fr 0.9fr 0.9fr 1.2fr'
    : tab === 'briefings'
      ? '1.7fr 0.9fr 1.9fr 0.9fr 1.2fr'
      : '1.5fr 0.8fr 1.05fr 1.05fr 0.95fr 0.95fr 0.95fr 1.15fr';

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

      {/* Заголовок + пошук + місток у docNet */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
        <TabList
          selectedValue={tab}
          onTabSelect={(_, d) => { setTab(d.value as SafetyTab); setStatusFilter('all'); setSearch(''); }}
        >
          <Tab value="trainings" icon={<GraduationCap size={16} />}>Навчання</Tab>
          <Tab value="briefings" icon={<ShieldCheck size={16} />}>Інструктажі</Tab>
          <Tab value="electrical" icon={<Zap size={16} />}>Ел. Безпека</Tab>
        </TabList>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Input
            contentBefore={<Search size={15} />}
            placeholder={tab === 'briefings' ? 'Пошук: співробітник…' : tab === 'electrical' ? 'Пошук: співробітник, група…' : 'Пошук: співробітник, навчання…'}
            value={search}
            onChange={(_, d) => setSearch(d.value)}
            style={{ minWidth: 250 }}
          />
          <Button
            appearance="primary"
            icon={<ExternalLink size={15} />}
            onClick={() => showToast(tab === 'briefings'
              ? 'Реєстрація інструктажу виконується в системі Документообігу (docNet)'
              : 'Заявка на навчання формується в системі Документообігу (docNet)')}
          >
            {tab === 'briefings' ? 'Зареєструвати інструктаж у docNet' : 'Сформувати заявку в docNet'}
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
          {tab === 'trainings' && <div style={th}>Навчання</div>}
          {tab === 'trainings' && <div style={th}>Протокол</div>}
          {tab === 'electrical' && <div style={th}>Назва Правил</div>}
          {tab === 'electrical' && <div style={th}>Попередня група</div>}
          {tab === 'electrical' && <div style={th}>Необхідна група</div>}
          {tab !== 'electrical' && <div style={th}>Пройдено</div>}
          {tab === 'electrical' && <div style={th}>Попередня перевірка</div>}
          {tab === 'briefings' && <div style={th}>Періодичність</div>}
          <div style={{ ...th, cursor: 'pointer' }} onClick={() => toggleSort('endDate')}>
            {tab === 'trainings' ? 'Чинне до' : tab === 'briefings' ? 'Діє до' : 'Наступна перевірка'} <SortIcon col="endDate" />
          </div>
          {tab === 'electrical' && <div style={th}>Періодичність</div>}
          <div style={th}>Статус</div>
        </div>

        {/* Рядки */}
        {(tab === 'trainings' ? filteredTrainings : []).map((r, i) => (
          <div
            key={`${r.memberId}-${r.protocol}`}
            onClick={() => openMemberById(r.memberId)}
            style={{
              display: 'grid', gridTemplateColumns: gridCols, cursor: 'pointer',
              borderBottom: i === filteredTrainings.length - 1 ? 'none' : '1px solid #f1f5f9',
              backgroundColor: (r.status === 'expired' || r.status === 'critical') ? '#fef2f2' : r.status === 'soon' ? '#fffbeb' : '#fff',
            }}
          >
            <div style={{ ...td, flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
              <span style={{ fontWeight: 600 }}>{r.name}</span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{r.role}</span>
            </div>
            <div style={td}>{r.title}</div>
            <div style={td}>{r.protocol}</div>
            <div style={td}>{r.passedAt}</div>
            <div style={{ ...td, fontWeight: 600 }}>{r.validUntil}</div>
            <div style={td}><ExpiryBadge validUntil={r.validUntil} /></div>
          </div>
        ))}

        {(tab === 'briefings' ? filteredBriefings : []).map((r, i) => (
          <div
            key={r.memberId}
            onClick={() => openMemberById(r.memberId)}
            style={{
              display: 'grid', gridTemplateColumns: gridCols, cursor: 'pointer',
              borderBottom: i === filteredBriefings.length - 1 ? 'none' : '1px solid #f1f5f9',
              backgroundColor: (r.status === 'expired' || r.status === 'critical') ? '#fef2f2' : r.status === 'soon' ? '#fffbeb' : '#fff',
            }}
          >
            <div style={{ ...td, flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
              <span style={{ fontWeight: 600 }}>{r.name}</span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{r.role}</span>
            </div>
            <div style={td}>{r.passedAt}</div>
            <div style={{ ...td, fontSize: 12.5, color: '#374151' }}>{r.periodicity}</div>
            <div style={{ ...td, fontWeight: 600 }}>{r.validUntil}</div>
            <div style={td}><ExpiryBadge validUntil={r.validUntil} /></div>
          </div>
        ))}

        {(tab === 'electrical' ? filteredElectrical : []).map((r, i) => (
          <div
            key={`${r.memberId}-${r.ruleName}`}
            onClick={() => openMemberById(r.memberId)}
            style={{
              display: 'grid', gridTemplateColumns: gridCols, cursor: 'pointer',
              borderBottom: i === filteredElectrical.length - 1 ? 'none' : '1px solid #f1f5f9',
              backgroundColor: (r.status === 'expired' || r.status === 'critical') ? '#fef2f2' : r.status === 'soon' ? '#fffbeb' : '#fff',
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
            <div style={{ ...td, fontWeight: 600 }}>{r.nextCheck}</div>
            <div style={{ ...td, fontSize: 12.5, color: '#374151' }}>{r.periodicity}</div>
            <div style={td}><ExpiryBadge validUntil={r.nextCheck} /></div>
          </div>
        ))}

        {((tab === 'trainings' && filteredTrainings.length === 0)
          || (tab === 'briefings' && filteredBriefings.length === 0)
          || (tab === 'electrical' && filteredElectrical.length === 0)) && (
          <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 13.5, color: '#6b7280' }}>
            Нічого не знайдено за поточним фільтром
          </div>
        )}
      </div>

      {/* Пояснення про нагадування */}
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
            Приблизно за <b>1,5 місяця</b> до завершення навчання ви та інженер з охорони праці отримаєте автоматичне нагадування.
            Заявки на навчання формуються та погоджуються в системі Документообігу (docNet); для навчань з електробезпеки заявку додатково
            погоджує відповідальна особа за електрогосподарство.
          </div>
        )}
      </div>

      {openMember && (
        <MemberDrawer member={openMember} onClose={() => setOpenMember(null)} showToast={showToast} />
      )}
    </main>
  );
};
