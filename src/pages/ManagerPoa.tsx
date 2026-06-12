import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  AlarmClock, UserPlus, PenLine,
  BarChart3, BookOpen, Search, Zap,
  ExternalLink, X, Download, Share2, Paperclip,
  ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, Check,
} from 'lucide-react';
import { S, RightBlockHeader, ModalShell } from './managerUi';
import { poaIcon, poaIconOrange, kepIcon, kepIconRed } from '../assets/poaIcons';

/* ════════════════════════ DATA ════════════════════════ */

type DocStatus = 'active' | 'expiring' | 'expired';

/** Детальна інформація довіреності (read-only подання даних з Докнет) */
type PoaDetail = {
  regNumber: string;
  regDateTime: string;            // дата реєстрації з хвилинами
  state: 'Чинна' | 'Нечинна';
  poaKind: string;                // Загальна / Спеціальна / Т.В.О.
  summary: string;                // короткий зміст
  termYears: string;              // строк дії (рік), може бути порожнім
  termFrom: string;
  termTo: string;
  daysLeft?: number;              // якщо закінчується скоро — показуємо індикатор
  issuedTo: string;               // на кого видана
  issuedToCompany: string[];      // на кого видана (від компанії) — чіпи
  signer: string;                 // ПІБ підписанта
  author: string;                 // автор документа
  comment?: string;
};

type ProgressStep = { label: string; date?: string; status: 'done' | 'current' | 'pending' };

type DocRow = {
  name: string; role: string; endDate: string; status: DocStatus; file: string;
  detail?: PoaDetail;
  kind?: string;                 // вид довіреності для заявок «в роботі»
  progress?: ProgressStep[];     // якщо є — заявка в роботі, шторка показує флоу
  kepState?: 'Чинний' | 'Нечинний';
  daysLeft?: number;             // для КЕП — підсвітка термінів
  basis?: string;                // підстава (стовпчик на табі КЕП)
};

const poaRows: DocRow[] = [
  {
    name: 'Місяченко А.Л.', role: 'Т.в.о. директора', endDate: '11.09.2026', status: 'active', file: 'dov_004.pdf',
    detail: {
      regNumber: '92-2026', regDateTime: '11.03.2026, 16:18', state: 'Чинна',
      poaKind: 'т.в.о.',
      summary: 'Довіреність на право діяти в межах повноважень в.о. директора з розробки діджитал продуктів дирекції',
      termYears: '', termFrom: '11.03.2026', termTo: '11.09.2026',
      issuedTo: 'Місяченко А.Л.',
      issuedToCompany: [
        'Місяченко А.Л. (1234567890123 - 15 - Бізнес-підрозділ інформаційних технологій Директор з інформаційних технологій)',
        'Калиновський А.В. (9876543210987 - 07 - Департамент управління процесами Старший фахівець з управління процесами розробки цифрових продуктів)',
      ],
      signer: 'Соколенко О.В. (ТОВ «Тестова Компанія» Президент)',
      author: 'Зореславська А.М. (02 - Відділ підтримки операційної діяльності Радник з юридичних питань)',
    },
  },
  {
    name: 'Орест Вигадко', role: 'Генеральна довіреність', endDate: '15.12.2026', status: 'active', file: 'dov_001.pdf',
    detail: {
      regNumber: '87-2025', regDateTime: '15.12.2025, 10:42', state: 'Чинна',
      poaKind: 'загальна',
      summary: 'Генеральна довіреність на представництво інтересів компанії в межах посадових повноважень',
      termYears: '1', termFrom: '15.12.2025', termTo: '15.12.2026',
      issuedTo: 'Вигадко О.Т.',
      issuedToCompany: [
        'Вигадко О.Т. (1111111111111 - 15 - Бізнес-підрозділ інформаційних технологій Керівник напряму розробки)',
      ],
      signer: 'Соколенко О.В. (ТОВ «Тестова Компанія» Президент)',
      author: 'Зореславська А.М. (02 - Відділ підтримки операційної діяльності Радник з юридичних питань)',
      comment: 'Продовження довіреності № 54-2024.',
    },
  },
  {
    name: 'Мирослава Квіткова', role: 'Фінансові операції', endDate: '02.07.2026', status: 'expiring', file: 'dov_002.pdf',
    detail: {
      regNumber: '14-2026', regDateTime: '02.07.2025, 09:15', state: 'Чинна',
      poaKind: 'спеціальна',
      summary: 'Довіреність на підписання фінансових документів та здійснення банківських операцій у межах ліміту',
      termYears: '1', termFrom: '02.07.2025', termTo: '02.07.2026',
      daysLeft: 21,
      issuedTo: 'Квіткова М.С.',
      issuedToCompany: [
        'Квіткова М.С. (2222222222222 - 09 - Фінансова дирекція Старший фахівець з фінансових операцій)',
      ],
      signer: 'Соколенко О.В. (ТОВ «Тестова Компанія» Президент)',
      author: 'Зореславська А.М. (02 - Відділ підтримки операційної діяльності Радник з юридичних питань)',
    },
  },
  {
    name: 'Соломія Хмаркова', role: 'Представництво в суді', endDate: '05.08.2025', status: 'expired', file: 'dov_003.pdf',
    detail: {
      regNumber: '31-2024', regDateTime: '05.08.2024, 14:03', state: 'Нечинна',
      poaKind: 'спеціальна',
      summary: 'Довіреність на представництво інтересів компанії в судах усіх інстанцій',
      termYears: '1', termFrom: '05.08.2024', termTo: '05.08.2025',
      issuedTo: 'Хмаркова С.П.',
      issuedToCompany: [
        'Хмаркова С.П. (3333333333333 - 04 - Юридичний департамент Провідний юрисконсульт)',
      ],
      signer: 'Соколенко О.В. (ТОВ «Тестова Компанія» Президент)',
      author: 'Зореславська А.М. (02 - Відділ підтримки операційної діяльності Радник з юридичних питань)',
      comment: 'Термін дії завершено. Нову довіреність не оформлено.',
    },
  },
  {
    name: 'Джерелько Дмитро', role: 'Закупівлі', endDate: '20.06.2026', status: 'expiring', file: 'dov_005.pdf',
    detail: {
      regNumber: '41-2026', regDateTime: '20.06.2025, 11:30', state: 'Чинна',
      poaKind: 'спеціальна',
      summary: 'Довіреність на укладання договорів закупівлі товарів та послуг у межах ліміту',
      termYears: '1', termFrom: '20.06.2025', termTo: '20.06.2026',
      daysLeft: 8,
      issuedTo: 'Джерелько Д.О.',
      issuedToCompany: [
        'Джерелько Д.О. (4444444444444 - 11 - Департамент закупівель Провідний фахівець із закупівель)',
      ],
      signer: 'Соколенко О.В. (ТОВ «Тестова Компанія» Президент)',
      author: 'Зореславська А.М. (02 - Відділ підтримки операційної діяльності Радник з юридичних питань)',
    },
  },
];

const kepRows: DocRow[] = [
  { name: 'Орест Вигадко',      role: 'КЕП особистий',           endDate: '15.03.2026', status: 'active',   file: 'kep_001.zs2', kepState: 'Чинний',   basis: 'Наказ про призначення на посаду' },
  { name: 'Мирослава Квіткова', role: 'КЕП печатка організації', endDate: '02.07.2026', status: 'expiring', file: 'kep_002.zs2', kepState: 'Чинний',   daysLeft: 21, basis: 'Управлінське рішення' },
  { name: 'Соломія Хмаркова',   role: 'КЕП особистий',           endDate: '19.06.2026', status: 'expiring', file: 'kep_003.zs2', kepState: 'Чинний',   daysLeft: 7,  basis: 'Наказ про т.в.о.' },
  { name: 'Зорепадов Гнат Юхимович', role: 'КЕП особистий',      endDate: '11.01.2026', status: 'expired',  file: 'kep_004.zs2', kepState: 'Нечинний', basis: 'Наказ про призначення на посаду' },
];

/* Заявка на КЕП «в роботі» — приклад для трекінгу */
const inProgressKepRow: DocRow = {
  name: 'Тарас Мрійник', role: 'Підписант документів', endDate: '31.12.2026', status: 'active', file: 'kep_request_001',
  basis: 'Управлінське рішення',
  progress: [
    { label: 'Заявку створено',                            date: '10.06.2026, 14:32', status: 'done' },
    { label: 'Передано в систему контролю прав доступу',   date: '10.06.2026, 14:33', status: 'done' },
    { label: 'Погодження ролі',                            date: '11.06.2026, 09:15', status: 'current' },
    { label: 'Генерація сертифіката',                      status: 'pending' },
    { label: 'КЕП готовий',                                status: 'pending' },
  ],
};

type KpiCard = { title: string; emoji: string; value: string; accent: string; iconBg: string; image?: string; tab: 'poa' | 'kep' };

const kpiCards = [
  { title: 'Довіреності активні', emoji: '📜', value: '12', accent: '#2f6fde', iconBg: '#fdf0d5', image: poaIcon, tab: 'poa' },
  { title: 'Довіреності < 30д',   emoji: '⏳', value: '3',  accent: '#f97316', iconBg: '#fdf3e3', image: poaIconOrange, tab: 'poa' },
  { title: 'КЕП активні',         emoji: '🪪', value: '8',  accent: '#92C11D', iconBg: '#dcfce7', image: kepIcon, tab: 'kep' },
  { title: 'КЕП < 30д',           emoji: '⏰', value: '2',  accent: '#e02f2f', iconBg: '#fce7f3', image: kepIconRed, tab: 'kep' },
] as KpiCard[];

const poaFilterOptions = [
  { value: '',         label: 'Всі' },
  { value: 'чинна',    label: 'Чинні' },
  { value: 'нечинна',  label: 'Нечинні' },
];

const kepFilterOptions = [
  { value: '',          label: 'Всі' },
  { value: 'чинний',    label: 'Чинні' },
  { value: 'нечинний',  label: 'Нечинні' },
  { value: 'в роботі',  label: 'У роботі' },
];

/* ════════════════════════ SECTION ════════════════════════ */

const SortHeader = <C extends string>({ label, col, sort, onSort }: {
  label: string; col: C;
  sort: { col: C; dir: 1 | -1 } | null;
  onSort: (col: C) => void;
}) => (
  <div
    onClick={() => onSort(col)}
    style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', userSelect: 'none' }}
    title="Сортувати"
  >
    <span>{label}</span>
    {sort?.col === col
      ? (sort.dir === 1 ? <ArrowUp size={12} color="#2563eb" /> : <ArrowDown size={12} color="#2563eb" />)
      : <ArrowUpDown size={12} color="#c2c9d4" />}
  </div>
);

export const PoaSection = ({ showToast }: { showToast: (msg: string) => void }) => {
  const [tab, setTab] = useState<'poa' | 'kep'>('poa');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kindFilter, setKindFilter] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocRow | null>(null);
  const [shareDoc, setShareDoc] = useState<DocRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [kepOpen, setKepOpen] = useState(false);
  const [createdRows, setCreatedRows] = useState<DocRow[]>([]);

  const [quickOpen, setQuickOpen] = useState(true);
  const [statsOpen, setStatsOpen] = useState(true);
  const [instrOpen, setInstrOpen] = useState(true);

  const rows = tab === 'poa' ? poaRows : [inProgressKepRow, ...createdRows, ...kepRows];
  const filterOptions = tab === 'poa' ? poaFilterOptions : kepFilterOptions;

  // Сортування: колонка + напрямок
  type SortCol = 'name' | 'kind' | 'endDate' | 'state' | 'basis';
  const [sort, setSort] = useState<{ col: SortCol; dir: 1 | -1 } | null>(null);
  const toggleSort = (col: SortCol) =>
    setSort(prev => prev?.col === col ? (prev.dir === 1 ? { col, dir: -1 } : null) : { col, dir: 1 });

  // Пагінація
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  const dateKey = (d: string) => d.split('.').reverse().join('');   // dd.mm.yyyy → yyyymmdd

  const filteredRows = useMemo(() => {
    const result = rows.filter(r => {
      const matchesSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (tab === 'poa' ? (r.detail?.poaKind ?? '') : r.role).toLowerCase().includes(search.toLowerCase()) ||
        (r.detail?.summary ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (r.basis ?? '').toLowerCase().includes(search.toLowerCase());
      const kepState = r.progress ? 'в роботі' : (r.kepState ?? '').toLowerCase();
      const matchesStatus = !statusFilter || (
        tab === 'poa'
          ? (r.detail?.state ?? '').toLowerCase() === statusFilter
          : kepState === statusFilter
      );
      const matchesKind = !kindFilter || (r.detail?.poaKind ?? r.kind ?? '') === kindFilter;
      return matchesSearch && matchesStatus && matchesKind;
    });
    if (sort) {
      const val = (r: DocRow): string => {
        switch (sort.col) {
          case 'name':    return r.name;
          case 'kind':    return tab === 'poa' ? (r.detail?.poaKind ?? r.kind ?? '') : r.role;
          case 'endDate': return r.endDate === '—' ? '99999999' : dateKey(r.endDate);
          case 'state':   return tab === 'poa' ? (r.detail?.state ?? '') : (r.progress ? 'в роботі' : (r.kepState ?? ''));
          case 'basis':   return r.basis ?? '';
        }
      };
      result.sort((a, b) => val(a).localeCompare(val(b), 'uk') * sort.dir);
    }
    return result;
  }, [rows, tab, search, statusFilter, kindFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const gridCols = tab === 'poa' ? '1.5fr 1.5fr 1.1fr 1.2fr 0.7fr' : '1.5fr 1.4fr 1.1fr 1fr 1.7fr';

  return (
    <>
      {/* ═══ MAIN ═══ */}
      <main style={S.main}>

        {/* KPI Cards */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', marginBottom: '24px' }}>
          {kpiCards.filter(kpi => kpi.tab === tab).map(kpi => (
            <div key={kpi.title} style={{ ...S.card, borderColor: '#e3e3e3', padding: '16px 18px', position: 'relative', overflow: 'hidden', width: '270px', boxSizing: 'border-box' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', backgroundColor: kpi.accent }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '26px', fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{kpi.value}</div>
                  <div style={{ fontSize: '13px', color: '#374151', marginTop: '7px' }}>{kpi.title}</div>
                </div>
                {kpi.image ? (
                  <img src={kpi.image} alt={kpi.title} style={{ width: 42, height: 42, borderRadius: '9px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 42, height: 42, backgroundColor: kpi.iconBg, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    {kpi.emoji}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Table block */}
        <div style={{ ...S.card, marginBottom: '24px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 18px', borderBottom: '1px solid #eef2f7' }}>
            {([
              { id: 'poa' as const, label: 'Довіреності' },
              { id: 'kep' as const, label: 'КЕП' },
            ]).map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSearch(''); setStatusFilter(''); setKindFilter(''); setSelectedDoc(null); setSort(null); setPage(1); }}
                style={{
                  padding: '8px 18px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 600, fontFamily: 'inherit',
                  backgroundColor: tab === t.id ? '#eaf3fd' : 'transparent',
                  color: tab === t.id ? '#2563eb' : '#374151',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search + filter */}
          <div style={{ display: 'flex', gap: '14px', padding: '16px 18px 4px' }}>
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Пошук за ПІБ / Опис"
                style={{ ...S.input, paddingLeft: '36px' }}
              />
            </div>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ ...S.input, width: '150px' }}>
              {filterOptions.map(o => <option key={o.label} value={o.value}>{o.label}</option>)}
            </select>
            {tab === 'poa' && (
              <select value={kindFilter} onChange={e => { setKindFilter(e.target.value); setPage(1); }} style={{ ...S.input, width: '170px' }}>
                <option value="">Всі види</option>
                <option value="загальна">загальна</option>
                <option value="спеціальна">спеціальна</option>
                <option value="т.в.о.">т.в.о.</option>
              </select>
            )}
          </div>

          {/* Table */}
          <div style={{ padding: '14px 18px 18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '12px', padding: '10px 14px', backgroundColor: '#f7f8fa', borderRadius: '8px', fontSize: '11px', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <SortHeader label="ПІБ" col="name" sort={sort} onSort={toggleSort} />
              <SortHeader label={tab === 'poa' ? 'Вид довіреності' : 'Тип / Сфера'} col="kind" sort={sort} onSort={toggleSort} />
              <SortHeader label="Дата закінчення" col="endDate" sort={sort} onSort={toggleSort} />
              <SortHeader label={tab === 'poa' ? 'Стан довіреності' : 'Стан КЕП'} col="state" sort={sort} onSort={toggleSort} />
              {tab === 'poa'
                ? <div style={{ textAlign: 'right' }}>Дії</div>
                : <SortHeader label="Підстава" col="basis" sort={sort} onSort={toggleSort} />}
            </div>
            {pagedRows.map(r => (
              <div
                key={r.file}
                onClick={() => { if (tab === 'poa' ? r.detail : r.progress) setSelectedDoc(r); }}
                style={{
                  display: 'grid', gridTemplateColumns: gridCols, gap: '12px',
                  padding: '14px', alignItems: 'center', fontSize: '13.5px', borderBottom: '1px solid #eef2f7',
                  cursor: (tab === 'poa' ? r.detail : r.progress) ? 'pointer' : 'default',
                  backgroundColor: selectedDoc?.file === r.file ? '#eaf3fd' : 'transparent',
                }}
                onMouseEnter={e => { if (selectedDoc?.file !== r.file) e.currentTarget.style.backgroundColor = '#fafbfd'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = selectedDoc?.file === r.file ? '#eaf3fd' : 'transparent'; }}
              >
                <div style={{ fontWeight: 600, color: '#111827' }}>{r.name}</div>
                <div style={{ color: '#374151' }}>{tab === 'poa' ? (r.detail?.poaKind ?? r.kind ?? '—') : r.role}</div>
                <div>
                  {(() => {
                    const dl = tab === 'poa' ? r.detail?.daysLeft : r.daysLeft;
                    return dl != null ? (
                      <span style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600,
                        backgroundColor: dl < 10 ? '#fde7e7' : '#fdf3e3',
                        color: dl < 10 ? '#b91c1c' : '#b45309',
                      }}>
                        {r.endDate}
                      </span>
                    ) : (
                      <span style={{ color: '#374151' }}>{r.endDate}</span>
                    );
                  })()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {tab === 'poa' ? (
                    <>
                      <span style={{
                        padding: '4px 12px', fontSize: '12px', fontWeight: 600, borderRadius: '6px',
                        backgroundColor: r.detail?.state === 'Чинна' ? '#d8f5e3' : '#eceef2',
                        color: r.detail?.state === 'Чинна' ? '#166534' : '#6b7280',
                      }}>
                        {r.detail?.state ?? '—'}
                      </span>
                      {r.detail?.daysLeft != null && (
                        <AlarmClock size={15} color={r.detail.daysLeft < 10 ? '#dc2626' : '#b45309'}>
                          <title>{`Закінчується через ${r.detail.daysLeft} дн.`}</title>
                        </AlarmClock>
                      )}
                    </>
                  ) : r.progress ? (
                    <span style={{ padding: '4px 12px', fontSize: '12px', fontWeight: 600, borderRadius: '6px', backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                      В роботі
                    </span>
                  ) : (
                    <>
                      <span style={{
                        padding: '4px 12px', fontSize: '12px', fontWeight: 600, borderRadius: '6px',
                        backgroundColor: r.kepState === 'Чинний' ? '#d8f5e3' : '#eceef2',
                        color: r.kepState === 'Чинний' ? '#166534' : '#6b7280',
                      }}>
                        {r.kepState ?? '—'}
                      </span>
                      {r.daysLeft != null && (
                        <AlarmClock size={15} color={r.daysLeft < 10 ? '#dc2626' : '#b45309'}>
                          <title>{`Закінчується через ${r.daysLeft} дн.`}</title>
                        </AlarmClock>
                      )}
                    </>
                  )}
                </div>
                {tab === 'poa' ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    {!r.progress && (
                      <>
                        <button
                          onClick={e => { e.stopPropagation(); showToast(`Завантажується файл ${r.file}...`); }}
                          title="Завантажити довіреність"
                          style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#e8f1fd', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onMouseEnter={ev => (ev.currentTarget.style.backgroundColor = '#d4e6fb')}
                          onMouseLeave={ev => (ev.currentTarget.style.backgroundColor = '#e8f1fd')}
                        >
                          <Download size={16} color="#2f6fde" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setShareDoc(r); }}
                          title="Поділитися довіреністю"
                          style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#e8f1fd', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onMouseEnter={ev => (ev.currentTarget.style.backgroundColor = '#d4e6fb')}
                          onMouseLeave={ev => (ev.currentTarget.style.backgroundColor = '#e8f1fd')}
                        >
                          <Share2 size={16} color="#2f6fde" />
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div style={{ color: '#374151', fontSize: '13px' }}>{r.basis ?? '—'}</div>
                )}
              </div>
            ))}
            {filteredRows.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280', fontSize: '14px' }}>
                Нічого не знайдено за вашим запитом
              </div>
            )}

            {/* Пагінація */}
            {filteredRows.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px' }}>
                <span style={{ fontSize: '12.5px', color: '#6b7280' }}>
                  Показано {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredRows.length)} з {filteredRows.length}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    style={{ width: 30, height: 30, border: '1px solid #e5e7eb', backgroundColor: '#fff', borderRadius: '7px', cursor: safePage === 1 ? 'default' : 'pointer', color: safePage === 1 ? '#d1d5db' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        minWidth: 30, height: 30, padding: '0 8px', borderRadius: '7px', cursor: 'pointer',
                        fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
                        border: p === safePage ? '1px solid #2563eb' : '1px solid #e5e7eb',
                        backgroundColor: p === safePage ? '#eaf3fd' : '#fff',
                        color: p === safePage ? '#2563eb' : '#374151',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    style={{ width: 30, height: 30, border: '1px solid #e5e7eb', backgroundColor: '#fff', borderRadius: '7px', cursor: safePage === totalPages ? 'default' : 'pointer', color: safePage === totalPages ? '#d1d5db' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ═══ RIGHT COLUMN ═══ */}
      <aside style={S.rightBar}>
        {/* Швидкі дії */}
        <div style={S.card}>
          <RightBlockHeader
            icon={<Zap size={18} color="#2f6fde" />}
            title="Швидкі дії"
            open={quickOpen}
            onToggle={() => setQuickOpen(o => !o)}
          />
          {quickOpen && (
            <div style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tab === 'poa' && (
              <button onClick={() => setCreateOpen(true)} style={{ width: '100%', padding: '14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '11px' }}>
                  <UserPlus size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Створити довіреність</div>
                    <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.88)', marginTop: '2px' }}>Нова довіреність для співробітника</div>
                  </div>
                </div>
              </button>
              )}
              {tab === 'kep' && (
              <button onClick={() => setKepOpen(true)} style={{ width: '100%', padding: '14px', backgroundColor: '#1aa251', color: '#fff', border: 'none', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '11px' }}>
                  <PenLine size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Оформити КЕП</div>
                    <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.88)', marginTop: '2px' }}>Заявка на цифровий підпис</div>
                  </div>
                </div>
              </button>
              )}
            </div>
          )}
        </div>

        {/* Статистика */}
        <div style={S.card}>
          <RightBlockHeader
            icon={<BarChart3 size={18} color="#2f6fde" />}
            title="Статистика"
            open={statsOpen}
            onToggle={() => setStatsOpen(o => !o)}
          />
          {statsOpen && (
            tab === 'poa' ? (
              <div style={{ padding: '2px 16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                  <span style={{ color: '#4b5563', fontWeight: 600 }}>Всього довіреностей</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>15</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '9px', fontSize: '13px', paddingLeft: '14px' }}>
                  <span style={{ color: '#6b7280' }}>загальна</span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>6</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '9px', fontSize: '13px', paddingLeft: '14px' }}>
                  <span style={{ color: '#6b7280' }}>спеціальна</span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>7</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '13px', paddingLeft: '14px' }}>
                  <span style={{ color: '#6b7280' }}>т.в.о.</span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>2</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #eef2f7', paddingTop: '12px' }}>
                  <span style={{ color: '#4b5563' }}>Закінчуються цього місяця</span>
                  <span style={{ fontWeight: 700, color: '#f97316' }}>5</span>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2px 16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                  <span style={{ color: '#4b5563', fontWeight: 600 }}>Всього КЕП</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>10</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '9px', fontSize: '13px', paddingLeft: '14px' }}>
                  <span style={{ color: '#6b7280' }}>особистий</span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>7</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '13px', paddingLeft: '14px' }}>
                  <span style={{ color: '#6b7280' }}>печатка організації</span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>3</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #eef2f7', paddingTop: '12px' }}>
                  <span style={{ color: '#4b5563' }}>Закінчуються цього місяця</span>
                  <span style={{ fontWeight: 700, color: '#f97316' }}>2</span>
                </div>
              </div>
            )
          )}
        </div>

        {/* Інструкції */}
        <div style={S.card}>
          <RightBlockHeader
            icon={<BookOpen size={18} color="#2f6fde" />}
            title="Інструкції"
            open={instrOpen}
            onToggle={() => setInstrOpen(o => !o)}
          />
          {instrOpen && (
            <div style={{ padding: '2px 16px 16px' }}>
              <div style={{ textAlign: 'center', padding: '14px 0', fontSize: '13px', color: '#9ca3af' }}>
                Наповнення розділу в роботі
              </div>
            </div>
          )}
        </div>
      </aside>
      {/* ═══ DETAIL DRAWER ═══ */}
      {selectedDoc && selectedDoc.progress && (
        <KepProgressDrawer
          row={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}
      {selectedDoc && !selectedDoc.progress && selectedDoc.detail && (
        <PoaDetailDrawer
          row={selectedDoc}
          detail={selectedDoc.detail}
          onClose={() => setSelectedDoc(null)}
          showToast={showToast}
        />
      )}

      {/* ═══ CREATE POA MODAL ═══ */}
      {createOpen && (
        <PoaCreateModal
          onClose={() => setCreateOpen(false)}
          onSent={() => { setCreateOpen(false); showToast('Запит на оформлення довіреності надіслано відповідальним!'); }}
        />
      )}

      {/* ═══ KEP REQUEST MODAL ═══ */}
      {kepOpen && (
        <KepRequestModal
          onClose={() => setKepOpen(false)}
          onSent={(info) => {
            setKepOpen(false);
            setCreatedRows(prev => [{
              name: 'Тарас Мрійник', role: info.role, endDate: info.validTo, status: 'active',
              file: `kep_request_${Date.now()}`,
              basis: info.basis,
              progress: [
                { label: 'Заявку створено', date: new Date().toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }), status: 'done' },
                { label: 'Передано в систему контролю прав доступу', status: 'current' },
                { label: 'Погодження ролі', status: 'pending' },
                { label: 'Генерація сертифіката', status: 'pending' },
                { label: 'КЕП готовий', status: 'pending' },
              ],
            }, ...prev]);
            showToast('Заявку створено! Вона з\u2019явилась у таблиці зі статусом «В роботі»');
          }}
        />
      )}

      {/* ═══ SHARE MODAL ═══ */}
      {shareDoc && (
        <PoaShareModal
          row={shareDoc}
          onClose={() => setShareDoc(null)}
          onSent={(email) => { setShareDoc(null); showToast(`Довіреність надіслано на ${email}`); }}
        />
      )}
    </>
  );
};

/* ════════════════════════ DETAIL DRAWER ════════════════════════ */

const drawerLabel: CSSProperties = { fontSize: '12px', color: '#6b7280', marginBottom: '4px' };
const drawerValue: CSSProperties = { fontSize: '14px', fontWeight: 600, color: '#111827', lineHeight: 1.45 };
const drawerSectionTitle: CSSProperties = { fontSize: '11.5px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' };

const PoaDetailDrawer = ({ row, detail, onClose, showToast }: {
  row: DocRow; detail: PoaDetail;
  onClose: () => void; showToast: (msg: string) => void;
}) => {
  const stateBadge = detail.state === 'Чинна'
    ? { bg: '#d8f5e3', color: '#166534' }
    : { bg: '#eceef2', color: '#6b7280' };

  return (
    <aside style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: '500px', maxWidth: '92vw',
      backgroundColor: '#fff', zIndex: 150, display: 'flex', flexDirection: 'column',
      boxShadow: '-8px 0 28px rgba(15,40,80,0.16)', borderLeft: '1px solid #e5e7eb',
    }}>
      {/* Drawer header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef2f7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button
          onClick={() => showToast('Відкривається документ у Докнет...')}
          style={{ ...S.btnLink, fontSize: '13.5px' }}
        >
          <ExternalLink size={15} /> Відкрити в Докнет
        </button>
        <button onClick={onClose} style={{ padding: '6px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', borderRadius: '8px' }}>
          <X size={20} />
        </button>
      </div>

      {/* Drawer body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>

        {/* Шапка: номер + стан + дата реєстрації */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <img src={poaIcon} alt="Довіреність" style={{ width: 40, height: 40, borderRadius: '9px', objectFit: 'cover', flexShrink: 0 }} />
            <span style={{ fontSize: '19px', fontWeight: 700, color: '#111827' }}>Довіреність № {detail.regNumber}</span>
            <span style={{ padding: '3px 12px', fontSize: '12px', fontWeight: 600, borderRadius: '99px', backgroundColor: stateBadge.bg, color: stateBadge.color }}>
              {detail.state}
            </span>
          </div>
          <div style={{ fontSize: '12.5px', color: '#6b7280', marginLeft: '52px' }}>Зареєстровано {detail.regDateTime}</div>
        </div>

        {/* Документ */}
        <div style={{ marginBottom: '22px' }}>
          <div style={drawerSectionTitle}>Документ</div>
          <div style={{ marginBottom: '14px' }}>
            <div style={drawerLabel}>Вид довіреності</div>
            <div style={drawerValue}>{detail.poaKind}</div>
          </div>
          <div>
            <div style={drawerLabel}>Короткий зміст</div>
            <div style={{ ...drawerValue, fontWeight: 500 }}>{detail.summary}</div>
          </div>
        </div>

        {/* Термін дії */}
        <div style={{ marginBottom: '22px' }}>
          <div style={drawerSectionTitle}>Термін дії</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: detail.daysLeft != null ? '12px' : 0 }}>
            <div>
              <div style={drawerLabel}>Строк дії (рік)</div>
              <div style={drawerValue}>{detail.termYears || '—'}</div>
            </div>
            <div>
              <div style={drawerLabel}>Термін дії з</div>
              <div style={drawerValue}>{detail.termFrom}</div>
            </div>
            <div>
              <div style={drawerLabel}>Термін дії по</div>
              <div style={drawerValue}>{detail.termTo}</div>
            </div>
          </div>
          {detail.daysLeft != null && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '6px 13px', backgroundColor: detail.daysLeft < 10 ? '#fde7e7' : '#fdf3e3', color: detail.daysLeft < 10 ? '#b91c1c' : '#b45309', borderRadius: '7px', fontSize: '12.5px', fontWeight: 600 }}>
              <AlarmClock size={14} />
              Закінчується через {detail.daysLeft} {detail.daysLeft === 1 ? 'день' : detail.daysLeft < 5 ? 'дні' : 'днів'}
            </div>
          )}
        </div>

        {/* Особи */}
        <div style={{ marginBottom: '22px' }}>
          <div style={drawerSectionTitle}>Особи</div>
          <div style={{ marginBottom: '14px' }}>
            <div style={drawerLabel}>На кого видана</div>
            <div style={drawerValue}>{detail.issuedTo}</div>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <div style={drawerLabel}>На кого видана (від компанії)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              {detail.issuedToCompany.map(chip => (
                <span key={chip} style={{ display: 'inline-block', padding: '7px 12px', backgroundColor: '#f1f3f6', border: '1px solid #e3e6ea', borderRadius: '8px', fontSize: '12px', color: '#374151', lineHeight: 1.4 }}>
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <div style={drawerLabel}>ПІБ підписанта</div>
            <div style={drawerValue}>{detail.signer}</div>
          </div>
          <div>
            <div style={drawerLabel}>Автор документа</div>
            <div style={drawerValue}>{detail.author}</div>
          </div>
        </div>

        {/* Коментар — лише якщо є */}
        {detail.comment && (
          <div style={{ marginBottom: '22px' }}>
            <div style={drawerSectionTitle}>Коментар</div>
            <div style={{ backgroundColor: '#f7f8fa', borderRadius: '10px', padding: '12px 15px', fontSize: '13.5px', color: '#374151', lineHeight: 1.5 }}>
              {detail.comment}
            </div>
          </div>
        )}
      </div>

      {/* Drawer footer */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid #eef2f7', flexShrink: 0 }}>
        <button
          onClick={() => showToast(`Завантажується файл ${row.file}...`)}
          style={{ ...S.btnPrimary, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Download size={16} /> Завантажити довіреність ({row.file})
        </button>
      </div>
    </aside>
  );
};

/* ════════════════════════ SHARE MODAL ════════════════════════ */

const PoaShareModal = ({ row, onClose, onSent }: {
  row: DocRow;
  onClose: () => void;
  onSent: (email: string) => void;
}) => {
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [letter, setLetter] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const requiredFilled = emailValid && description.trim().length > 0;

  const buildLetter = () => {
    const d = row.detail;
    return `Добрий день!

Надсилаю довіреність № ${d?.regNumber ?? '—'} (${d?.poaKind ?? row.role}).
Короткий зміст: ${d?.summary ?? '—'}
Термін дії: ${d?.termFrom ?? '—'} – ${d?.termTo ?? row.endDate}
На кого видана: ${d?.issuedTo ?? row.name}

Опис: ${description.trim()}

Файл довіреності (${row.file}) додано у вкладенні.`;
  };

  return (
    <ModalShell maxWidth={620} onClose={onClose}>
      <div style={S.modalTitleRow}>
        <div style={S.modalTitle}>Поділитися довіреністю</div>
        <button onClick={onClose} style={{ padding: '4px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
          <X size={22} />
        </button>
      </div>
      <div style={{ padding: '14px 26px 24px' }}>
        {/* Callout */}
        <div style={{ backgroundColor: '#fdf8ec', border: '1px solid #f0e3bd', borderRadius: '10px', padding: '12px 15px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={poaIcon} alt="Довіреність" style={{ width: 30, height: 30, borderRadius: '7px', objectFit: 'cover', flexShrink: 0 }} />
            <span style={{ fontWeight: 600, fontSize: '13.5px', color: '#1f2937' }}>
              Довіреність № {row.detail?.regNumber ?? '—'}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '6px', marginLeft: '40px' }}>{row.name}</div>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={S.label}>Email отримувача *</label>
            <input
              type="email" placeholder="name@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              style={S.input}
            />
          </div>
          <div>
            <label style={S.label}>Короткий опис *</label>
            <textarea
              rows={3} placeholder="Вкажіть, з якою метою надсилається довіреність"
              value={description} onChange={e => setDescription(e.target.value)}
              style={{ ...S.input, resize: 'vertical' }}
            />
          </div>
        </div>

        {letter !== null && (
          <>
            {/* Email meta */}
            <div style={{ backgroundColor: '#eaf3fd', borderRadius: '10px', padding: '13px 16px', marginBottom: '14px', fontSize: '12.5px', color: '#1f2937', lineHeight: 1.55 }}>
              <div>Кому: {email.trim()}</div>
              <div>Тема: Довіреність № {row.detail?.regNumber ?? '—'} — {row.name}</div>
              <div>Вкладення: {row.file}</div>
            </div>

            {/* Letter editor */}
            <div style={{ border: '1px solid #d1d5db', borderRadius: '10px', overflow: 'hidden', marginBottom: '22px' }}>
              <div style={{ padding: '9px 14px', borderBottom: '1px solid #e5e7eb', fontSize: '12.5px', color: '#4b5563', backgroundColor: '#fafafa' }}>
                Шаблон листа про надсилання довіреності
              </div>
              <textarea
                value={letter}
                onChange={e => setLetter(e.target.value)}
                rows={11}
                style={{ width: '100%', border: 'none', outline: 'none', padding: '16px', fontSize: '13.5px', fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box', color: '#111827' }}
              />
            </div>
          </>
        )}

        {/* Footer: усі дії в одному ряду справа */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #eef2f7', paddingTop: '16px' }}>
          <button onClick={onClose} style={{ ...S.btnLink, color: '#374151' }}>Скасувати</button>
          <button
            onClick={() => requiredFilled && setLetter(buildLetter())}
            disabled={!requiredFilled}
            style={letter !== null
              ? { ...S.btnGhost, opacity: requiredFilled ? 1 : 0.5, cursor: requiredFilled ? 'pointer' : 'default' }
              : { ...S.btnPrimary, backgroundColor: requiredFilled ? '#2563eb' : '#a8c7f5', cursor: requiredFilled ? 'pointer' : 'default' }}
          >
            Сформувати лист
          </button>
          {letter !== null && (
            <button onClick={() => onSent(email.trim())} style={S.btnPrimary}>Надіслати лист</button>
          )}
        </div>
      </div>
    </ModalShell>
  );
};

/* ════════════════════════ CREATE POA MODAL ════════════════════════ */

type TeamMember = { id: string; name: string; position: string; department: string };

const teamMembers: TeamMember[] = [
  { id: 'm1', name: 'Зорепадов Гнат Юхимович', position: 'Розробник архітектури ПЗ', department: 'Департамент систем управління підприємством' },
  { id: 'm2', name: 'Тестовий1 Користувач', position: 'QA', department: 'Департамент систем управління підприємством' },
  { id: 'm3', name: 'Тестовий2 Користувач', position: 'DevOps', department: 'Департамент систем управління підприємством' },
  { id: 'm4', name: 'Тестовий4 Користувач', position: 'Інженер', department: 'Відділ автоматизації операційних процесів' },
  { id: 'm5', name: 'Тестовий5 Користувач', position: 'Інженер', department: 'Відділ автоматизації операційних процесів' },
  { id: 'm6', name: 'Тестовий6 Користувач', position: 'Адміністратор', department: 'Відділ управління операційними системами' },
  { id: 'm7', name: 'Тестовий7 Користувач', position: 'Адміністратор', department: 'Відділ управління операційними системами' },
  { id: 'm8', name: 'Тестовий8 Користувач', position: 'Економіст', department: 'Відділ управління фінансовими системами' },
  { id: 'm9', name: 'Тестовий9 Користувач', position: 'Економіст', department: 'Відділ управління фінансовими системами' },
];

const poaKinds = ['загальна', 'спеціальна', 'т.в.о.'];

const basisOptions = ['Наказ про призначення на посаду', 'Наказ про т.в.о.', 'Управлінське рішення'];

const legalTo = 'Зореславська А.М. (юридична підтримка) <Anna.Zoreslavska@example.com>, Юридичний відділ <legal@example.com>';
const initiatorCc = 'Taras Mriynyk <Taras.Mriynyk@example.com>';

const PoaCreateModal = ({ onClose, onSent }: { onClose: () => void; onSent: () => void }) => {
  const [kind, setKind] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [summary, setSummary] = useState('');
  const [term, setTerm] = useState('');
  const [termCustom, setTermCustom] = useState('');
  const [basisList, setBasisList] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [letter, setLetter] = useState<string | null>(null);

  const selectedMembers = teamMembers.filter(m => selectedIds.includes(m.id));
  const filteredMembers = teamMembers.filter(m =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.position.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.department.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const toggleMember = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const termValid = !!term && (term !== 'інше' || termCustom.trim().length > 0);
  const requiredFilled = selectedIds.length > 0 && summary.trim().length > 0 && termValid;

  const onFilesPicked = (list: FileList | null) => {
    if (!list) return;
    setFiles(prev => [...prev, ...Array.from(list).map(f => f.name).filter(n => !prev.includes(n))]);
  };

  const buildLetter = () => {
    const people = selectedMembers
      .map(m => `${m.name} (${m.position}, ${m.department})`)
      .join('\n');
    const termText = term === 'інше' ? termCustom.trim() : term;
    return `Добрий день!

Прошу оформити довіреність${kind ? ` (${kind})` : ''}.

На кого видається:
${people}

Короткий зміст: ${summary.trim()}
Термін дії довіреності: ${termText}
Підстава: ${basisList.length ? basisList.join('; ') : '—'}

Коментар: ${comment.trim() || '—'}

Додатки: ${files.length ? files.join(', ') : '—'}`;
  };

  return (
    <ModalShell maxWidth={660} onClose={onClose}>
      <div style={S.modalTitleRow}>
        <div style={S.modalTitle}>Створити довіреність</div>
        <button onClick={onClose} style={{ padding: '4px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
          <X size={22} />
        </button>
      </div>
      <div style={{ padding: '14px 26px 24px' }}>
        {/* Callout */}
        <div style={{ backgroundColor: '#fdf8ec', border: '1px solid #f0e3bd', borderRadius: '10px', padding: '12px 15px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={poaIcon} alt="Довіреність" style={{ width: 30, height: 30, borderRadius: '7px', objectFit: 'cover', flexShrink: 0 }} />
            <span style={{ fontWeight: 600, fontSize: '13.5px', color: '#1f2937' }}>Запит на оформлення нової довіреності</span>
          </div>
          <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '6px', marginLeft: '40px' }}>
            Після надсилання листа процес оформлення запустить юридичний відділ
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          {/* Вид */}
          <div>
            <label style={S.label}>Вид довіреності</label>
            <select value={kind} onChange={e => setKind(e.target.value)} style={S.input}>
              <option value="">Не обрано</option>
              {poaKinds.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          {/* На кого видається */}
          <div>
            <label style={S.label}>На кого видається *</label>
            {selectedMembers.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {selectedMembers.map(m => (
                  <span key={m.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', backgroundColor: '#eaf3fd', border: '1px solid #cfe2f8', borderRadius: '99px', fontSize: '12.5px', color: '#1f2937' }}>
                    {m.name}
                    <X size={13} style={{ cursor: 'pointer', color: '#6b7280' }} onClick={() => toggleMember(m.id)} />
                  </span>
                ))}
              </div>
            )}
            <input
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              placeholder="Пошук за іменем, посадою або відділом..."
              style={{ ...S.input, marginBottom: '8px' }}
            />
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', maxHeight: '170px', overflowY: 'auto' }}>
              {filteredMembers.map(m => {
                const checked = selectedIds.includes(m.id);
                return (
                  <label
                    key={m.id}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f3f6', backgroundColor: checked ? '#f5f9ff' : 'transparent' }}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggleMember(m.id)} style={{ accentColor: '#2563eb' }} />
                    <span>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#111827' }}>{m.name}</span>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}> — {m.position}, {m.department}</span>
                    </span>
                  </label>
                );
              })}
              {filteredMembers.length === 0 && (
                <div style={{ padding: '12px', fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>Нікого не знайдено</div>
              )}
            </div>
          </div>

          {/* Короткий зміст */}
          <div>
            <label style={S.label}>Короткий зміст / мета *</label>
            <textarea
              rows={3}
              placeholder="Напр.: Довіреність на право діяти в межах повноважень в.о. директора з розробки діджитал продуктів дирекції"
              value={summary} onChange={e => setSummary(e.target.value)}
              style={{ ...S.input, resize: 'vertical' }}
            />
          </div>

          {/* Термін дії */}
          <div>
            <label style={S.label}>Термін дії довіреності *</label>
            <select value={term} onChange={e => setTerm(e.target.value)} style={S.input}>
              <option value="" disabled>Оберіть термін</option>
              <option value="1 рік">1 рік</option>
              <option value="3 роки">3 роки</option>
              <option value="інше">Інше</option>
            </select>
            {term === 'інше' && (
              <input
                type="text" placeholder="Вкажіть термін, напр.: 6 місяців, до 31.12.2026"
                value={termCustom} onChange={e => setTermCustom(e.target.value)}
                style={{ ...S.input, marginTop: '8px' }}
              />
            )}
          </div>

          {/* Підстава */}
          <div>
            <label style={S.label}>Підстава</label>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
              {basisOptions.map(b => {
                const checked = basisList.includes(b);
                return (
                  <label key={b} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f3f6', backgroundColor: checked ? '#f5f9ff' : 'transparent', fontSize: '13.5px', color: '#111827' }}>
                    <input
                      type="checkbox" checked={checked}
                      onChange={() => setBasisList(prev => checked ? prev.filter(x => x !== b) : [...prev, b])}
                      style={{ accentColor: '#2563eb' }}
                    />
                    {b}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Файли */}
          <div>
            <label style={S.label}>Додатки</label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px', border: '1px dashed #93c5fd', borderRadius: '8px', cursor: 'pointer', fontSize: '13.5px', color: '#2563eb', backgroundColor: '#f5f9ff' }}>
              <Paperclip size={15} />
              Додати файл(и)
              <input type="file" multiple style={{ display: 'none' }} onChange={e => { onFilesPicked(e.target.files); e.target.value = ''; }} />
            </label>
            {files.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                {files.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', backgroundColor: '#f7f8fa', borderRadius: '8px', fontSize: '13px', color: '#374151' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <Paperclip size={13} color="#6b7280" />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f}</span>
                    </span>
                    <X size={14} style={{ cursor: 'pointer', color: '#6b7280', flexShrink: 0 }} onClick={() => setFiles(prev => prev.filter(x => x !== f))} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Коментар */}
          <div>
            <label style={S.label}>Коментар</label>
            <textarea rows={2} placeholder="Додаткова інформація (за потреби)" value={comment} onChange={e => setComment(e.target.value)} style={{ ...S.input, resize: 'vertical' }} />
          </div>
        </div>



        {letter !== null && (
          <>
            <div style={{ backgroundColor: '#eaf3fd', borderRadius: '10px', padding: '13px 16px', marginBottom: '14px', fontSize: '12.5px', color: '#1f2937', lineHeight: 1.55 }}>
              <div>Кому: {legalTo}</div>
              <div>Копія: {initiatorCc} (ініціатор)</div>
              <div>Тема: Запит на оформлення довіреності — {selectedMembers.map(m => m.name).join(', ')}</div>
              {files.length > 0 && <div>Вкладення: {files.join(', ')}</div>}
            </div>
            <div style={{ border: '1px solid #d1d5db', borderRadius: '10px', overflow: 'hidden', marginBottom: '22px' }}>
              <div style={{ padding: '9px 14px', borderBottom: '1px solid #e5e7eb', fontSize: '12.5px', color: '#4b5563', backgroundColor: '#fafafa' }}>
                Шаблон листа — запит на оформлення довіреності
              </div>
              <textarea
                value={letter}
                onChange={e => setLetter(e.target.value)}
                rows={14}
                style={{ width: '100%', border: 'none', outline: 'none', padding: '16px', fontSize: '13.5px', fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box', color: '#111827' }}
              />
            </div>
          </>
        )}

        {/* Footer: усі дії в одному ряду справа */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #eef2f7', paddingTop: '16px' }}>
          <button onClick={onClose} style={{ ...S.btnLink, color: '#374151' }}>Скасувати</button>
          <button
            onClick={() => requiredFilled && setLetter(buildLetter())}
            disabled={!requiredFilled}
            style={letter !== null
              ? { ...S.btnGhost, opacity: requiredFilled ? 1 : 0.5, cursor: requiredFilled ? 'pointer' : 'default' }
              : { ...S.btnPrimary, backgroundColor: requiredFilled ? '#2563eb' : '#a8c7f5', cursor: requiredFilled ? 'pointer' : 'default' }}
          >
            Сформувати лист
          </button>
          {letter !== null && (
            <button onClick={onSent} style={S.btnPrimary}>Надіслати лист</button>
          )}
        </div>
      </div>
    </ModalShell>
  );
};

/* ════════════════════════ PROGRESS DRAWER (заявка в роботі) ════════════════════════ */

const KepProgressDrawer = ({ row, onClose }: { row: DocRow; onClose: () => void }) => (
  <aside style={{
    position: 'fixed', top: 0, right: 0, bottom: 0, width: '460px', maxWidth: '92vw',
    backgroundColor: '#fff', zIndex: 150, display: 'flex', flexDirection: 'column',
    boxShadow: '-8px 0 28px rgba(15,40,80,0.16)', borderLeft: '1px solid #e5e7eb',
  }}>
    <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef2f7', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0 }}>
      <button onClick={onClose} style={{ padding: '6px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', borderRadius: '8px' }}>
        <X size={20} />
      </button>
    </div>

    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
      {/* Шапка */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <img src={kepIcon} alt="КЕП" style={{ width: 40, height: 40, borderRadius: '9px', objectFit: 'cover', flexShrink: 0 }} />
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>Заявка на КЕП</span>
          <span style={{ padding: '3px 12px', fontSize: '12px', fontWeight: 600, borderRadius: '99px', backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
            В роботі
          </span>
        </div>
        <div style={{ fontSize: '13px', color: '#6b7280', marginLeft: '52px' }}>
          {row.name}{row.role ? ` · ${row.role}` : ''}
        </div>
      </div>

      {/* Таймлайн */}
      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
        Статус заявки
      </div>
      <div>
        {(row.progress ?? []).map((step, i, arr) => {
          const isLast = i === arr.length - 1;
          const dotColor = step.status === 'done' ? '#16a34a' : step.status === 'current' ? '#2563eb' : '#d1d5db';
          return (
            <div key={step.label} style={{ display: 'flex', gap: '14px' }}>
              {/* Точка + лінія */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px', flexShrink: 0 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: step.status === 'done' ? '#d8f5e3' : step.status === 'current' ? '#dbeafe' : '#f1f3f6',
                  border: `2px solid ${dotColor}`, flexShrink: 0,
                }}>
                  {step.status === 'done' && <Check size={13} color="#16a34a" />}
                  {step.status === 'current' && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2563eb' }} />}
                </div>
                {!isLast && (
                  <div style={{ width: '2px', flex: 1, minHeight: '26px', backgroundColor: step.status === 'done' ? '#86d9a8' : '#e5e7eb' }} />
                )}
              </div>
              {/* Текст */}
              <div style={{ paddingBottom: isLast ? 0 : '22px' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: step.status === 'current' ? 700 : 600,
                  color: step.status === 'pending' ? '#9ca3af' : '#111827',
                }}>
                  {step.label}
                  {step.status === 'current' && (
                    <span style={{ marginLeft: '8px', fontSize: '11.5px', fontWeight: 600, color: '#2563eb' }}>зараз тут</span>
                  )}
                </div>
                {step.date && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{step.date}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Підказка */}
      <div style={{ marginTop: '24px', backgroundColor: '#f7f8fa', borderRadius: '10px', padding: '13px 15px', fontSize: '12.5px', color: '#4b5563', lineHeight: 1.5 }}>
        Коли КЕП буде готовий, заявка в таблиці зміниться на запис зі станом «Чинний». Сповіщення прийде на вашу пошту.
      </div>
    </div>
  </aside>
);

/* ════════════════════════ KEP REQUEST MODAL ════════════════════════ */

const KepRequestModal = ({ onClose, onSent }: { onClose: () => void; onSent: (info: { role: string; validTo: string; basis: string }) => void }) => {
  const [role, setRole] = useState('');
  const [validTo, setValidTo] = useState('');
  const [basis, setBasis] = useState('');

  const todayISO = new Date().toISOString().split('T')[0];
  const requiredFilled = role.trim().length > 0 && !!validTo && !!basis;

  return (
    <ModalShell maxWidth={520} onClose={onClose}>
      <div style={S.modalTitleRow}>
        <div style={S.modalTitle}>Оформити КЕП</div>
        <button onClick={onClose} style={{ padding: '4px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
          <X size={22} />
        </button>
      </div>
      <div style={{ padding: '14px 26px 24px' }}>
        {/* Callout */}
        <div style={{ backgroundColor: '#fdf8ec', border: '1px solid #f0e3bd', borderRadius: '10px', padding: '12px 15px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={kepIcon} alt="КЕП" style={{ width: 30, height: 30, borderRadius: '7px', objectFit: 'cover', flexShrink: 0 }} />
            <span style={{ fontWeight: 600, fontSize: '13.5px', color: '#1f2937' }}>Заявка на оформлення КЕП</span>
          </div>
          <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '6px', marginLeft: '40px' }}>
            Запит буде автоматично передано в систему контролю прав доступу
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={S.label}>Роль *</label>
            <input
              type="text" placeholder="Вкажіть роль у системі"
              value={role} onChange={e => setRole(e.target.value)}
              style={S.input}
            />
          </div>
          <div>
            <label style={S.label}>Дійсна до *</label>
            <input type="date" min={todayISO} value={validTo} onChange={e => setValidTo(e.target.value)} style={S.input} />
          </div>
          <div>
            <label style={S.label}>Підстава *</label>
            <select value={basis} onChange={e => setBasis(e.target.value)} style={S.input}>
              <option value="" disabled>Оберіть підставу</option>
              {basisOptions.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #eef2f7', paddingTop: '16px' }}>
          <button onClick={onClose} style={{ ...S.btnLink, color: '#374151' }}>Скасувати</button>
          <button
            onClick={() => requiredFilled && onSent({ role: role.trim(), validTo: validTo.split('-').reverse().join('.'), basis })}
            disabled={!requiredFilled}
            style={{ ...S.btnPrimary, backgroundColor: requiredFilled ? '#2563eb' : '#a8c7f5', cursor: requiredFilled ? 'pointer' : 'default' }}
          >
            Створити заявку
          </button>
        </div>
      </div>
    </ModalShell>
  );
};
