import { useMemo, useState } from 'react';
import {
  AlarmClock, UserPlus, PenLine,
  BarChart3, BookOpen, Search, AlertTriangle, Zap,
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

type DocRow = { name: string; role: string; endDate: string; status: DocStatus; file: string };

const poaRows: DocRow[] = [
  { name: 'Іван Петренко',   role: 'Генеральна довіреність', endDate: '15.12.2025', status: 'active',   file: 'dov_001.pdf' },
  { name: 'Марія Коваленко', role: 'Фінансові операції',     endDate: '22.10.2025', status: 'expiring', file: 'dov_002.pdf' },
  { name: 'Олена Сидорович', role: 'Представництво в суді',  endDate: '05.08.2025', status: 'expired',  file: 'dov_003.pdf' },
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
                onClick={() => { setTab(t.id); setSearch(''); setStatusFilter(''); }}
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
                style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.7fr 1.2fr 1fr 1fr 0.9fr', gap: '12px', padding: '14px', alignItems: 'center', fontSize: '13.5px', borderBottom: '1px solid #eef2f7' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafbfd')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
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
                    onClick={() => showToast(`Відкривається файл ${r.file}...`)}
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
    </>
  );
};
