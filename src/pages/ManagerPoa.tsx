import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  AlarmClock, UserPlus, PenLine,
  BarChart3, BookOpen, Search, AlertTriangle, Zap,
  ExternalLink, X, FileText,
} from 'lucide-react';
import { S, RightBlockHeader } from './managerUi';

/* ════════════════════════ DATA ════════════════════════ */

type DocStatus = 'active' | 'expiring' | 'expired';

const statusMeta: Record<DocStatus, { label: string; bg: string; color: string }> = {
  active:   { label: 'Активна',     bg: '#d8f5e3', color: '#166534' },
  expiring: { label: '< 30д',       bg: '#fdf3e3', color: '#b45309' },
  expired:  { label: 'Прострочена', bg: '#fde7e7', color: '#b91c1c' },
};

const kepStatusMeta: Record<DocStatus, { label: string; bg: string; color: string }> = {
  active:   { label: 'Активний',     bg: '#d8f5e3', color: '#166534' },
  expiring: { label: '< 30д',        bg: '#fdf3e3', color: '#b45309' },
  expired:  { label: 'Прострочений', bg: '#fde7e7', color: '#b91c1c' },
};

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

type DocRow = { name: string; role: string; endDate: string; status: DocStatus; file: string; detail?: PoaDetail };

const poaRows: DocRow[] = [
  {
    name: 'Жуковський А.Л.', role: 'Т.в.о. директора', endDate: '11.09.2026', status: 'active', file: 'dov_004.pdf',
    detail: {
      regNumber: '92-2026', regDateTime: '11.03.2026, 16:18', state: 'Чинна',
      poaKind: 'Т.В.О.',
      summary: 'Довіреність на право діяти в межах повноважень в.о. директора з розробки діджитал продуктів дирекції',
      termYears: '', termFrom: '11.03.2026', termTo: '11.09.2026',
      issuedTo: 'Жуковський А.Л.',
      issuedToCompany: [
        'Жуковський А.Л. (3000276198252 - 15 - Бізнес-підрозділ інформаційних технологій Директор з інформаційних технологій)',
        'Федоренко А.В. (3002288828496 - 07 - Департамент управління процесами Старший фахівець з управління процесами розробки цифрових продуктів)',
      ],
      signer: 'Комаров О.В. (ПрАТ «Київстар» Президент)',
      author: 'Горова А.М. (02 - Відділ підтримки операційної діяльності Радник з юридичних питань)',
    },
  },
  {
    name: 'Іван Петренко', role: 'Генеральна довіреність', endDate: '15.12.2026', status: 'active', file: 'dov_001.pdf',
    detail: {
      regNumber: '87-2025', regDateTime: '15.12.2025, 10:42', state: 'Чинна',
      poaKind: 'Загальна',
      summary: 'Генеральна довіреність на представництво інтересів компанії в межах посадових повноважень',
      termYears: '1', termFrom: '15.12.2025', termTo: '15.12.2026',
      issuedTo: 'Петренко І.В.',
      issuedToCompany: [
        'Петренко І.В. (3000254118733 - 15 - Бізнес-підрозділ інформаційних технологій Керівник напряму розробки)',
      ],
      signer: 'Комаров О.В. (ПрАТ «Київстар» Президент)',
      author: 'Горова А.М. (02 - Відділ підтримки операційної діяльності Радник з юридичних питань)',
      comment: 'Продовження довіреності № 54-2024.',
    },
  },
  {
    name: 'Марія Коваленко', role: 'Фінансові операції', endDate: '02.07.2026', status: 'expiring', file: 'dov_002.pdf',
    detail: {
      regNumber: '14-2026', regDateTime: '02.07.2025, 09:15', state: 'Чинна',
      poaKind: 'Спеціальна',
      summary: 'Довіреність на підписання фінансових документів та здійснення банківських операцій у межах ліміту',
      termYears: '1', termFrom: '02.07.2025', termTo: '02.07.2026',
      daysLeft: 21,
      issuedTo: 'Коваленко М.С.',
      issuedToCompany: [
        'Коваленко М.С. (3001144257811 - 09 - Фінансова дирекція Старший фахівець з фінансових операцій)',
      ],
      signer: 'Комаров О.В. (ПрАТ «Київстар» Президент)',
      author: 'Горова А.М. (02 - Відділ підтримки операційної діяльності Радник з юридичних питань)',
    },
  },
  {
    name: 'Олена Сидорович', role: 'Представництво в суді', endDate: '05.08.2025', status: 'expired', file: 'dov_003.pdf',
    detail: {
      regNumber: '31-2024', regDateTime: '05.08.2024, 14:03', state: 'Нечинна',
      poaKind: 'Спеціальна',
      summary: 'Довіреність на представництво інтересів компанії в судах усіх інстанцій',
      termYears: '1', termFrom: '05.08.2024', termTo: '05.08.2025',
      issuedTo: 'Сидорович О.П.',
      issuedToCompany: [
        'Сидорович О.П. (3000987456123 - 04 - Юридичний департамент Провідний юрисконсульт)',
      ],
      signer: 'Комаров О.В. (ПрАТ «Київстар» Президент)',
      author: 'Горова А.М. (02 - Відділ підтримки операційної діяльності Радник з юридичних питань)',
      comment: 'Термін дії завершено. Нову довіреність не оформлено.',
    },
  },
];

const kepRows: DocRow[] = [
  { name: 'Іван Петренко',   role: 'КЕП особистий',          endDate: '15.03.2026', status: 'active',   file: 'kep_001.zs2' },
  { name: 'Марія Коваленко', role: 'КЕП печатка організації', endDate: '02.07.2026', status: 'expiring', file: 'kep_002.zs2' },
  { name: 'Олена Сидорович', role: 'КЕП особистий',          endDate: '11.01.2026', status: 'active',   file: 'kep_003.zs2' },
];

const kpiCards = [
  { title: 'Довіреності активні', emoji: '📜', value: '12', accent: '#2f6fde', iconBg: '#fdf0d5' },
  { title: 'Довіреності < 30д',   emoji: '⏳', value: '3',  accent: '#f97316', iconBg: '#fdf3e3' },
  { title: 'КЕП активні',         emoji: '🪪', value: '8',  accent: '#92C11D', iconBg: '#dcfce7' },
  { title: 'КЕП < 30д',           emoji: '⏰', value: '2',  accent: '#5b2d86', iconBg: '#fce7f3' },
];

const statusFilterOptions: { value: '' | DocStatus; label: string }[] = [
  { value: '',         label: 'Всі' },
  { value: 'active',   label: 'Активні' },
  { value: 'expiring', label: '< 30д' },
  { value: 'expired',  label: 'Прострочені' },
];

const instructionBlocks = [
  {
    title: 'Довіреності', emoji: '📜', bg: '#eaf3fd', border: '#cfe2f8',
    items: ['Моніторити терміни дії довіреностей', 'Завчасно оновлювати документи (>30 днів)', 'Зберігати копії у захищеному сховищі'],
  },
  {
    title: 'КЕП', emoji: '🪪', bg: '#eaf8ee', border: '#cdeBd8',
    items: ['Перевіряти статус сертифікатів щомісяця', 'Замовляти нові КЕП за 45 днів до закінчення', 'Архівувати прострочені сертифікати'],
  },
];

/* ════════════════════════ SECTION ════════════════════════ */

export const PoaSection = ({ showToast }: { showToast: (msg: string) => void }) => {
  const [tab, setTab] = useState<'poa' | 'kep'>('poa');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | DocStatus>('');
  const [selectedDoc, setSelectedDoc] = useState<DocRow | null>(null);

  const [quickOpen, setQuickOpen] = useState(true);
  const [statsOpen, setStatsOpen] = useState(true);
  const [instrOpen, setInstrOpen] = useState(true);

  const rows = tab === 'poa' ? poaRows : kepRows;
  const meta = tab === 'poa' ? statusMeta : kepStatusMeta;

  const filteredRows = useMemo(() =>
    rows.filter(r =>
      (r.name.toLowerCase().includes(search.toLowerCase()) || r.role.toLowerCase().includes(search.toLowerCase())) &&
      (!statusFilter || r.status === statusFilter)
    ), [rows, search, statusFilter]);

  return (
    <>
      {/* ═══ MAIN ═══ */}
      <main style={S.main}>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '24px' }}>
          {kpiCards.map(kpi => (
            <div key={kpi.title} style={{ ...S.card, borderColor: '#e3e3e3', padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', backgroundColor: kpi.accent }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '26px', fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{kpi.value}</div>
                  <div style={{ fontSize: '13px', color: '#374151', marginTop: '7px' }}>{kpi.title}</div>
                </div>
                <div style={{ width: 42, height: 42, backgroundColor: kpi.iconBg, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  {kpi.emoji}
                </div>
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
                onClick={() => { setTab(t.id); setSearch(''); setStatusFilter(''); setSelectedDoc(null); }}
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
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as '' | DocStatus)} style={{ ...S.input, width: '160px' }}>
              {statusFilterOptions.map(o => <option key={o.label} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Table */}
          <div style={{ padding: '14px 18px 18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.7fr 1.2fr 1fr 1fr 0.9fr', gap: '12px', padding: '10px 14px', backgroundColor: '#f7f8fa', borderRadius: '8px', fontSize: '11px', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <div>ПІБ</div>
              <div>{tab === 'poa' ? 'Роль / Сфера' : 'Тип / Сфера'}</div>
              <div>Дата закінчення</div>
              <div>Статус</div>
              <div>Файл</div>
              <div />
            </div>
            {filteredRows.map(r => (
              <div
                key={r.file}
                onClick={() => r.detail && setSelectedDoc(r)}
                style={{
                  display: 'grid', gridTemplateColumns: '1.4fr 1.7fr 1.2fr 1fr 1fr 0.9fr', gap: '12px',
                  padding: '14px', alignItems: 'center', fontSize: '13.5px', borderBottom: '1px solid #eef2f7',
                  cursor: r.detail ? 'pointer' : 'default',
                  backgroundColor: selectedDoc?.file === r.file ? '#eaf3fd' : 'transparent',
                }}
                onMouseEnter={e => { if (selectedDoc?.file !== r.file) e.currentTarget.style.backgroundColor = '#fafbfd'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = selectedDoc?.file === r.file ? '#eaf3fd' : 'transparent'; }}
              >
                <div style={{ fontWeight: 600, color: '#111827' }}>{r.name}</div>
                <div style={{ color: '#374151' }}>{r.role}</div>
                <div style={{ color: '#374151' }}>{r.endDate}</div>
                <div>
                  <span style={{ padding: '4px 12px', fontSize: '12px', fontWeight: 600, borderRadius: '6px', backgroundColor: meta[r.status].bg, color: meta[r.status].color }}>
                    {meta[r.status].label}
                  </span>
                </div>
                <div style={{ color: '#374151' }}>{r.file}</div>
                <div>
                  <button
                    onClick={e => { e.stopPropagation(); showToast(`Відкривається файл ${r.file}...`); }}
                    style={{ ...S.btnLink, fontSize: '13.5px' }}
                  >
                    Переглянути
                  </button>
                </div>
              </div>
            ))}
            {filteredRows.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280', fontSize: '14px' }}>
                Нічого не знайдено за вашим запитом
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
              <button onClick={() => showToast('Відкривається форма створення довіреності...')} style={{ width: '100%', padding: '14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '11px' }}>
                  <UserPlus size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Створити довіреність</div>
                    <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.88)', marginTop: '2px' }}>Нова довіреність для співробітника</div>
                  </div>
                </div>
              </button>
              <button onClick={() => showToast('Відкривається заявка на оформлення КЕП...')} style={{ width: '100%', padding: '14px', backgroundColor: '#1aa251', color: '#fff', border: 'none', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '11px' }}>
                  <PenLine size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Оформити КЕП</div>
                    <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.88)', marginTop: '2px' }}>Заявка на цифровий підпис</div>
                  </div>
                </div>
              </button>
              <button onClick={() => showToast('Нагадування про закінчення термінів налаштовано')} style={{ width: '100%', padding: '14px', backgroundColor: '#fff', color: '#1f2937', border: '1px solid #e5e7eb', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '11px' }}>
                  <AlarmClock size={18} color="#f97316" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Перевірити терміни</div>
                    <div style={{ fontSize: '12.5px', color: '#6b7280', marginTop: '2px' }}>Нагадування про закінчення</div>
                  </div>
                </div>
              </button>
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
            <div style={{ padding: '2px 16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                <span style={{ color: '#4b5563' }}>Всього довіреностей</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>15</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                <span style={{ color: '#4b5563' }}>Всього КЕП</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>10</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px' }}>
                <span style={{ color: '#4b5563' }}>Закінчуються цього місяця</span>
                <span style={{ fontWeight: 700, color: '#f97316' }}>5</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                <span>Активність</span>
                <span style={{ fontWeight: 600 }}>80%</span>
              </div>
              <div style={{ width: '100%', height: '7px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}>
                <div style={{ width: '80%', height: '7px', backgroundColor: '#2f6fde', borderRadius: '4px' }} />
              </div>
            </div>
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
            <div style={{ padding: '2px 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {instructionBlocks.map(b => (
                <div key={b.title} style={{ backgroundColor: b.bg, border: `1px solid ${b.border}`, borderRadius: '10px', padding: '13px 15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', color: '#1f2937', marginBottom: '9px' }}>
                    <span style={{ fontSize: '15px' }}>{b.emoji}</span>
                    <span>{b.title}</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {b.items.map(it => (
                      <li key={it} style={{ fontSize: '12.5px', color: '#2563eb' }}>
                        <span style={{ color: '#1f2937' }}>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div style={{ backgroundColor: '#fdf0f6', border: '1px solid #f3d3e4', borderRadius: '10px', padding: '13px 15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', color: '#9d174d', marginBottom: '9px' }}>
                  <AlertTriangle size={15} color="#d97706" />
                  <span>Критично важливо</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li style={{ fontSize: '12.5px', color: '#9d174d' }}>Не допускати прострочення діючих довіреностей</li>
                  <li style={{ fontSize: '12.5px', color: '#9d174d' }}>КЕП керівника має бути дійсним постійно</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </aside>
      {/* ═══ DETAIL DRAWER ═══ */}
      {selectedDoc && selectedDoc.detail && (
        <PoaDetailDrawer
          row={selectedDoc}
          detail={selectedDoc.detail}
          onClose={() => setSelectedDoc(null)}
          showToast={showToast}
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
      backgroundColor: '#fff', zIndex: 45, display: 'flex', flexDirection: 'column',
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
            <span style={{ fontSize: '19px', fontWeight: 700, color: '#111827' }}>Довіреність № {detail.regNumber}</span>
            <span style={{ padding: '3px 12px', fontSize: '12px', fontWeight: 600, borderRadius: '99px', backgroundColor: stateBadge.bg, color: stateBadge.color }}>
              {detail.state}
            </span>
          </div>
          <div style={{ fontSize: '12.5px', color: '#6b7280' }}>Зареєстровано {detail.regDateTime}</div>
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
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '6px 13px', backgroundColor: '#fdf3e3', color: '#b45309', borderRadius: '7px', fontSize: '12.5px', fontWeight: 600 }}>
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
          onClick={() => showToast(`Відкривається файл ${row.file}...`)}
          style={{ ...S.btnPrimary, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <FileText size={16} /> Переглянути файл ({row.file})
        </button>
      </div>
    </aside>
  );
};
