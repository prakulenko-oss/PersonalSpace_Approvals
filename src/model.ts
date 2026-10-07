import type {
  AppState, Assignment, Cell, DispState, Exec, ExecType, FuncId, Person, Role,
  StreamId, SupportId, System, UnitId,
} from './types';

export const UNITS: Record<UnitId, { name: string; full: string }> = {
  fin:  { name: 'Фінансові системи', full: 'Відділ управління фінансовими системами' },
  auto: { name: 'Автоматизація операційних процесів', full: 'Відділ автоматизації операційних процесів' },
  ops:  { name: 'Операційні системи', full: 'Відділ управління операційними системами' },
  td:   { name: 'Технічна дирекція', full: 'Системи Технічної дирекції' },
};
export const UNIT_ORDER: UnitId[] = ['fin', 'auto', 'ops', 'td'];

export const STREAMS: Record<StreamId, string> = {
  s1: 'Стрім 1: ESS Evolution',
  s2: 'Стрім 2: Digital Core',
  s3: 'Стрім 3: Process Excellence',
  s4: 'Стрім 4: Employee & Manager Experience',
  s5: 'Стрім 5: Agentic Operations',
  s6: 'Стрім 6: Domain Capability',
  s7: 'Стрім 7: Системи Технічної дирекції',
};

export const SUPPORT: Record<SupportId, string> = {
  it_full: 'ІТ повністю',
  it_partner: 'ІТ + партнер',
  business: 'Бізнес сам',
  vendor: 'Вендор',
  sunset: 'На виведенні',
};

export const FUNCS: Record<FuncId, string> = {
  fadm: 'Адміністрування',
  fsup: 'Бізнес-підтримка',
  fdev: 'Розвиток',
};
export const FUNC_ORDER: FuncId[] = ['fadm', 'fsup', 'fdev'];

export const XTYPES: Record<ExecType, string> = {
  itdom: 'Суміжний ІТ-домен',
  partner: 'Партнер',
  business: 'Бізнес',
};
export const XCLS: Record<ExecType, string> = {
  itdom: 'c-itdom',
  partner: 'c-partner',
  business: 'c-biz',
};

export const DISP_LABEL: Record<DispState, string> = {
  filled: 'Виконується', vacant: 'Вакансія', na: 'Не потрібно', unset: 'Не розібрано',
};

export const EMPTY_CELL: Cell = { st: 'norm', p: [], x: [], n: '' };

export const cellKey = (sysId: string, roleId: string) => `${sysId}|${roleId}`;

export const getCell = (s: AppState, sysId: string, roleId: string): Cell =>
  s.cells[cellKey(sysId, roleId)] ?? EMPTY_CELL;

export function dispState(c: Cell): DispState {
  if (c.st === 'na') return 'na';
  if (c.st === 'vacant') return 'vacant';
  return (c.p.length || c.x.length) ? 'filled' : 'unset';
}

export const personById = (s: AppState, id: string): Person | undefined =>
  s.people.find((p) => p.id === id);
export const execById = (s: AppState, id: string): Exec | undefined =>
  s.execs.find((x) => x.id === id);

export const surname = (name: string) => (name || '').trim().split(/\s+/)[0] || '?';

export const initials = (name: string) =>
  (name || '').trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || '?';

export const monogram = (name: string) =>
  (name || '').replace(/[^A-Za-zА-ЯІЇЄҐа-яіїєґ0-9]/g, '').slice(0, 2).toUpperCase() || '?';

export const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

export const sysByUnitSorted = (s: AppState, u: UnitId): System[] =>
  s.systems.filter((x) => x.unit === u).sort((a, b) => (a.ord || 0) - (b.ord || 0));

/** Ролі в порядку відображення: згруповані за функціями. */
export const rolesOrdered = (s: AppState): Role[] =>
  FUNC_ORDER.flatMap((f) => s.roles.filter((r) => (r.func || 'fsup') === f));

export function applicableRoles(s: AppState, sysId: string): Role[] {
  return s.roles.filter((r) => dispState(getCell(s, sysId, r.id)) !== 'na');
}

export function coverage(s: AppState, sysId: string): { covered: number; total: number } {
  const roles = applicableRoles(s, sysId);
  const covered = roles.filter((r) => dispState(getCell(s, sysId, r.id)) === 'filled').length;
  return { covered, total: roles.length };
}

export function personLoad(s: AppState): Record<string, Assignment[]> {
  const map: Record<string, Assignment[]> = {};
  s.people.forEach((p) => { map[p.id] = []; });
  Object.entries(s.cells).forEach(([k, c]) => {
    if (c.st === 'norm' && c.p.length) {
      const [sysId, roleId] = k.split('|');
      c.p.forEach((pid) => { if (map[pid]) map[pid].push({ sysId, roleId }); });
    }
  });
  return map;
}

export function execUsage(s: AppState, xid: string): { cells: number; systems: number } {
  let cells = 0;
  const sys = new Set<string>();
  Object.entries(s.cells).forEach(([k, c]) => {
    if (c.x.includes(xid)) { cells++; sys.add(k.split('|')[0]); }
  });
  return { cells, systems: sys.size };
}

/** Клітинки з людьми без резерву. */
export function noBackupCells(s: AppState): { sys: System; role: Role }[] {
  const out: { sys: System; role: Role }[] = [];
  s.systems.forEach((sys) => {
    s.roles.forEach((r) => {
      const c = getCell(s, sys.id, r.id);
      if (c.st === 'norm' && c.p.length > 0 && !c.b) out.push({ sys, role: r });
    });
  });
  return out;
}

export function gapsData(s: AppState) {
  const noPO = s.systems.filter((x) => {
    const ds = dispState(getCell(s, x.id, 'po'));
    return ds === 'unset' || ds === 'vacant';
  });
  const vacancies: { sys: System; role: Role; note: string }[] = [];
  let unsetCount = 0;
  let applTotal = 0;
  s.systems.forEach((sys) => {
    s.roles.forEach((r) => {
      const c = getCell(s, sys.id, r.id);
      const ds = dispState(c);
      if (ds === 'na') return;
      applTotal++;
      if (ds === 'vacant') vacancies.push({ sys, role: r, note: c.n });
      if (ds === 'unset') unsetCount++;
    });
  });
  const noBackup = noBackupCells(s);
  const noBackupSystems = new Set(noBackup.map((x) => x.sys.id)).size;
  const unsetSystems = s.systems.filter((sys) =>
    s.roles.some((r) => dispState(getCell(s, sys.id, r.id)) === 'unset')).length;
  let filledCount = 0;
  Object.values(s.cells).forEach((c) => { if (dispState(c) === 'filled') filledCount++; });
  return { noPO, vacancies, unsetCount, applTotal, noBackup, noBackupSystems, unsetSystems, filledCount };
}

export function fmtDate(iso: string): string {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

export function daysTo(iso: string): number | null {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return Math.round((new Date(+m[1], +m[2] - 1, +m[3]).getTime() - Date.now()) / 86400000);
}

/* ---------- normalize + міграція старих форматів ---------- */

interface LegacyCell { st?: string; p?: string[]; x?: string[]; t?: string; n?: string; b?: string }
type LegacySt = 'norm' | 'vacant' | 'na' | 'filled' | 'partner' | 'business' | 'unset' | undefined;

const FUNC_MAP: Record<string, FuncId> = {
  adm: 'fadm', to: 'fadm', po: 'fsup', bf: 'fsup', ba: 'fsup', sup: 'fsup', dev: 'fdev',
};

/** Приводить довільний JSON (включно зі старими експортами) до валідного AppState. */
export function normalize(d: unknown, fallback: AppState): AppState {
  const raw = (d && typeof d === 'object' ? d : {}) as Partial<AppState> & { cells?: Record<string, LegacyCell> };
  const base = structuredClone(fallback);
  const out: AppState = {
    rev: typeof raw.rev === 'number' ? raw.rev : 0,
    roles: Array.isArray(raw.roles) && raw.roles.length ? (raw.roles as Role[]) : base.roles,
    execs: Array.isArray(raw.execs) ? (raw.execs as Exec[]) : [],
    people: Array.isArray(raw.people) ? (raw.people as Person[]) : base.people,
    systems: Array.isArray(raw.systems) ? (raw.systems as System[]) : base.systems,
    cells: {},
  };
  out.systems.forEach((sys, i) => {
    if (typeof sys.ord !== 'number') sys.ord = i;
    sys.saas = !!sys.saas;
    (['contractEnd', 'contractUrl', 'contractCap', 'caseText', 'caseUrl'] as const).forEach((k) => {
      if (typeof sys[k] !== 'string') sys[k] = '';
    });
  });
  if (!out.roles.some((r) => r.id === 'bf')) {
    const i = out.roles.findIndex((r) => r.id === 'po');
    out.roles.splice(i >= 0 ? i + 1 : 0, 0, { id: 'bf', name: 'Бізнес-функція', short: 'Бізнес', func: 'fsup' });
  }
  out.roles.forEach((r) => { if (!FUNCS[r.func]) r.func = FUNC_MAP[r.id] || 'fsup'; });

  const findOrCreateExec = (name: string, type: ExecType): string => {
    const nm = (name || '').trim() || (type === 'business' ? 'Бізнес' : 'Партнер');
    let x = out.execs.find((e) => e.name.toLowerCase() === nm.toLowerCase() && e.type === type);
    if (!x) { x = { id: uid('x'), name: nm, type, note: '' }; out.execs.push(x); }
    return x.id;
  };

  const cells = raw.cells && typeof raw.cells === 'object' ? raw.cells : {};
  Object.entries(cells).forEach(([k, c]) => {
    if (!c || typeof c !== 'object') return;
    const n = c.n || '';
    const p = Array.isArray(c.p) ? c.p : [];
    if (Array.isArray(c.x) && (c.st === 'norm' || c.st === 'vacant' || c.st === 'na')) {
      out.cells[k] = { st: c.st, p, x: c.x, n, ...(typeof c.b === 'string' && c.b ? { b: c.b } : {}) };
      return;
    }
    switch (c.st as LegacySt) {
      case 'vacant': out.cells[k] = { st: 'vacant', p: [], x: [], n }; break;
      case 'na': out.cells[k] = { st: 'na', p: [], x: [], n }; break;
      case 'partner': out.cells[k] = { st: 'norm', p: [], x: [findOrCreateExec(c.t || '', 'partner')], n }; break;
      case 'business': out.cells[k] = { st: 'norm', p: [], x: [findOrCreateExec(c.t || '', 'business')], n }; break;
      case 'filled': out.cells[k] = { st: 'norm', p, x: [], n }; break;
      default: if (n) out.cells[k] = { st: 'norm', p: [], x: [], n };
    }
  });
  return out;
}
