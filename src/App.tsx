import { useCallback, useEffect, useRef, useState } from 'react';
import { cellKey, gapsData, normalize, sysByUnitSorted, uid } from './model';
import { SEED } from './seed';
import {
  createDataFile, ensurePermission, exportJSON, forgetHandle, fsSupported,
  loadLocal, openDataFile, readDataFile, restoreHandle, saveLocal, writeDataFile,
} from './storage';
import type {
  AppState, Cell, DataSource, Exec, MapView, MatrixPreset, ModalState, NavId, Person, Sel, System, UnitId,
} from './types';
import { consumeDragClick, initDnd } from './dnd';
import { applyContractsFeed, applyPeopleFeed } from './feeds';
import {
  IcArrowUR, IcChart, IcCollapse, IcDoc, IcGear, IcHome, IcLayers, IcList, IcMap, IcOrg, IcPeople,
} from './icons';
import Overview from './views/Overview';
import Board from './views/Board';
import Matrix from './views/Matrix';
import Passport from './views/Passport';
import SystemsView from './views/SystemsView';
import PeopleView from './views/PeopleView';
import ExecsView from './views/ExecsView';
import RolesView from './views/RolesView';
import SettingsView from './views/SettingsView';
import StubView from './views/StubView';
import CellEditor from './modals/CellEditor';
import SystemEditor from './modals/SystemEditor';
import PersonEditor from './modals/PersonEditor';
import ExecEditor from './modals/ExecEditor';
import RoleEditor from './modals/RoleEditor';
import RolePicker from './modals/RolePicker';
import ColFillModal from './modals/ColFillModal';
import ImportModal from './modals/ImportModal';

export interface Actions {
  goMap: (view: MapView, preset?: MatrixPreset) => void;
  openPassport: (sysId: string) => void;
  openCell: (sysId: string, roleId: string) => void;
  openSystem: (sysId: string | null) => void;
  openPerson: (perId: string | null) => void;
  openExec: (xid: string | null) => void;
  openRoleEditor: (roleId: string | null) => void;
  openColFill: (roleId: string, sysIds: string[]) => void;
  saveCell: (sysId: string, roleId: string, cell: Cell) => void;
  saveCase: (sysId: string, caseText: string, caseUrl: string) => void;
  saveSystem: (sysId: string | null, data: Omit<System, 'id' | 'ord'>) => void;
  deleteSystem: (sysId: string) => void;
  savePerson: (perId: string | null, data: Omit<Person, 'id' | 'lead'>) => void;
  deletePerson: (perId: string) => void;
  saveExec: (xid: string | null, data: Omit<Exec, 'id'>) => void;
  deleteExec: (xid: string) => void;
  createExecInline: (name: string, type: Exec['type']) => string;
  saveRole: (roleId: string | null, data: { name: string; short: string; func: AppState['roles'][number]['func'] }) => void;
  deleteRole: (roleId: string) => void;
  moveRole: (roleId: string, dir: -1 | 1) => void;
  assignPerson: (pid: string, sysId: string, roleId: string, fromKey: string | null) => void;
  assignExec: (xid: string, sysId: string, roleId: string, fromKey: string | null) => void;
  removePerson: (key: string, pid: string) => void;
  removeExec: (key: string, xid: string) => void;
  colFill: (roleId: string, sysIds: string[], xid: string, onlyUnset: boolean) => void;
  toggleSel: (kind: Sel['kind'], id: string, from: string | null) => void;
  clickTarget: (sysId: string, roleId: string | null) => void;
  importState: (raw: unknown) => void;
  applyFeed: (kind: 'people' | 'contracts', raw: unknown) => void;
}

type Theme = 'auto' | 'light' | 'dark';
function themePref(): Theme {
  try { return (localStorage.getItem('erm-theme') as Theme) || 'auto'; } catch { return 'auto'; }
}
function applyTheme(v: Theme) {
  if (v === 'light' || v === 'dark') document.documentElement.dataset.theme = v;
  else delete document.documentElement.dataset.theme;
  try { localStorage.setItem('erm-theme', v); } catch { /* ок */ }
}

const PAGE_META: Record<NavId, { crumb: string; eyebrow: string; h1: string; sub?: string }> = {
  overview: { crumb: 'Огляд департаменту', eyebrow: 'ERM-кокпіт · Модуль 1', h1: 'Огляд департаменту', sub: 'Хто за що відповідає, де прогалини і що обговорити наступним.' },
  map: { crumb: 'Карта систем', eyebrow: 'Модуль 1 · Карта відповідальності', h1: 'Карта систем і відповідальностей', sub: 'Матриця і дошка працюють з одними даними: матриця — для розчистки, дошка — для перетягування.' },
  m2: { crumb: 'Завантаженість', eyebrow: 'Модуль 2', h1: 'Завантаженість' },
  m3: { crumb: 'Договори та оплати', eyebrow: 'Модуль 3', h1: 'Договори та оплати' },
  systems: { crumb: 'Системи', eyebrow: 'Довідник', h1: 'Системи', sub: 'Реєстр систем домену з атрибутами, договорами і станом ролей.' },
  people: { crumb: 'Люди', eyebrow: 'Довідник', h1: 'Люди', sub: 'Команда домену. Персональні дані живуть у вашому файлі, не в коді.' },
  execs: { crumb: 'Виконавці', eyebrow: 'Довідник', h1: 'Виконавці', sub: 'Суміжні ІТ-домени, партнери та бізнес-підрозділи.' },
  roles: { crumb: 'Ролі', eyebrow: 'Довідник', h1: 'Ролі', sub: 'Словник ролей за функціями; порядок визначає колонки матриці.' },
  settings: { crumb: 'Налаштування', eyebrow: 'Кокпіт', h1: 'Налаштування' },
};

export default function App() {
  const [state, setState] = useState<AppState>(() => loadLocal() ?? normalize(SEED, SEED));
  const [nav, setNav] = useState<NavId>('overview');
  const [mapView, setMapView] = useState<MapView>('matrix');
  const [preset, setPreset] = useState<MatrixPreset>({});
  const [presetKey, setPresetKey] = useState(0);
  const [passportId, setPassportId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [sel, setSel] = useState<Sel | null>(null);
  const [status, setStatus] = useState<'saved' | 'pending' | 'error'>('saved');
  const [theme, setTheme] = useState<Theme>(themePref);
  const [source, setSource] = useState<DataSource>({ mode: 'local' });
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('erm-side') === '1'; } catch { return false; }
  });
  const [sideOpen, setSideOpen] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;
  const handleRef = useRef<FileSystemFileHandle | null>(null);
  const sourceRef = useRef(source);
  sourceRef.current = source;

  useEffect(() => { applyTheme(theme); }, [theme]);

  useEffect(() => {
    if (!fsSupported) return;
    restoreHandle().then((h) => {
      if (h) { handleRef.current = h; setSource({ mode: 'file', name: h.name, pending: true }); }
    });
  }, []);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setStatus('pending');
    const t = setTimeout(async () => {
      const src = sourceRef.current;
      if (src.mode === 'file' && !src.pending && handleRef.current) {
        try { await writeDataFile(handleRef.current, stateRef.current); setStatus('saved'); }
        catch { setStatus('error'); }
      } else {
        setStatus(saveLocal(stateRef.current) ? 'saved' : 'error');
      }
    }, 600);
    return () => clearTimeout(t);
  }, [state]);

  const update = useCallback((fn: (d: AppState) => void) => {
    setState((prev) => {
      const d = structuredClone(prev);
      fn(d);
      d.rev = (d.rev || 0) + 1;
      return d;
    });
  }, []);

  /* ---------- файл даних ---------- */
  const connectFile = async () => {
    const h = handleRef.current;
    if (!h) return;
    if (!(await ensurePermission(h))) return;
    try {
      const st = await readDataFile(h);
      setState(st);
      setSource({ mode: 'file', name: h.name, pending: false });
      setStatus('saved');
    } catch { setStatus('error'); }
  };
  const openFile = async () => {
    try {
      const res = await openDataFile();
      if (!res) return;
      handleRef.current = res.handle;
      setState(res.state);
      setSource({ mode: 'file', name: res.handle.name, pending: false });
      setStatus('saved');
    } catch { /* скасовано */ }
  };
  const createFile = async () => {
    try {
      const h = await createDataFile(stateRef.current);
      if (!h) return;
      handleRef.current = h;
      setSource({ mode: 'file', name: h.name, pending: false });
      setStatus('saved');
    } catch { /* скасовано */ }
  };
  const detachFile = async () => {
    handleRef.current = null;
    await forgetHandle();
    setSource({ mode: 'local' });
    saveLocal(stateRef.current);
  };

  /* ---------- допоміжні ---------- */
  const cellEmpty = (c: Cell) => c.st === 'norm' && !c.p.length && !c.x.length && !c.n && !c.b;
  const removePidIn = (d: AppState, key: string, pid: string) => {
    const c = d.cells[key];
    if (!c || c.st !== 'norm') return;
    c.p = c.p.filter((v) => v !== pid);
    if (cellEmpty(c)) delete d.cells[key];
  };
  const removeXidIn = (d: AppState, key: string, xid: string) => {
    const c = d.cells[key];
    if (!c || c.st !== 'norm') return;
    c.x = c.x.filter((v) => v !== xid);
    if (cellEmpty(c)) delete d.cells[key];
  };

  const assignPerson = useCallback((pid: string, sysId: string, roleId: string, fromKey: string | null) => {
    update((d) => {
      const key = cellKey(sysId, roleId);
      const cur = d.cells[key] ?? { st: 'norm' as const, p: [], x: [], n: '' };
      if (!cur.p.includes(pid)) cur.p = [...cur.p, pid];
      cur.st = 'norm';
      d.cells[key] = cur;
      if (fromKey && fromKey !== key) removePidIn(d, fromKey, pid);
    });
  }, [update]);

  const assignExec = useCallback((xid: string, sysId: string, roleId: string, fromKey: string | null) => {
    update((d) => {
      const key = cellKey(sysId, roleId);
      const cur = d.cells[key] ?? { st: 'norm' as const, p: [], x: [], n: '' };
      if (!cur.x.includes(xid)) cur.x = [...cur.x, xid];
      cur.st = 'norm';
      d.cells[key] = cur;
      if (fromKey && fromKey !== key) removeXidIn(d, fromKey, xid);
    });
  }, [update]);

  const actions: Actions = {
    goMap: (view, p) => {
      setPassportId(null);
      setNav('map');
      setMapView(view);
      if (p) { setPreset(p); setPresetKey((k) => k + 1); }
      window.scrollTo(0, 0);
    },
    openPassport: (sysId) => { setPassportId(sysId); window.scrollTo(0, 0); },
    openCell: (sysId, roleId) => setModal({ kind: 'cell', sysId, roleId }),
    openSystem: (sysId) => setModal({ kind: 'system', sysId }),
    openPerson: (perId) => setModal({ kind: 'person', perId }),
    openExec: (xid) => setModal({ kind: 'exec', xid }),
    openRoleEditor: (roleId) => setModal({ kind: 'role', roleId }),
    openColFill: (roleId, sysIds) => setModal({ kind: 'colFill', roleId, sysIds }),

    saveCell: (sysId, roleId, cell) => {
      update((d) => {
        const key = cellKey(sysId, roleId);
        if (cellEmpty(cell)) delete d.cells[key];
        else d.cells[key] = cell;
      });
      setModal(null);
    },

    saveCase: (sysId, caseText, caseUrl) => {
      update((d) => {
        const s = d.systems.find((x) => x.id === sysId);
        if (s) { s.caseText = caseText.trim(); s.caseUrl = caseUrl.trim(); }
      });
    },

    saveSystem: (sysId, data) => {
      update((d) => {
        if (sysId) {
          const s = d.systems.find((x) => x.id === sysId);
          if (s) Object.assign(s, data);
        } else {
          const ord = d.systems.filter((x) => x.unit === data.unit).length;
          d.systems.push({ id: uid('sys'), ord, ...data });
        }
      });
      setModal(null);
    },
    deleteSystem: (sysId) => {
      update((d) => {
        d.systems = d.systems.filter((x) => x.id !== sysId);
        Object.keys(d.cells).forEach((k) => { if (k.split('|')[0] === sysId) delete d.cells[k]; });
      });
      setModal(null);
      setPassportId((cur) => (cur === sysId ? null : cur));
    },

    savePerson: (perId, data) => {
      update((d) => {
        if (perId) {
          const p = d.people.find((x) => x.id === perId);
          if (p) Object.assign(p, data);
        } else {
          d.people.push({ id: uid('p'), ...data });
        }
      });
      setModal(null);
    },
    deletePerson: (perId) => {
      update((d) => {
        d.people = d.people.filter((x) => x.id !== perId);
        Object.entries(d.cells).forEach(([k, c]) => {
          if (c.b === perId) delete c.b;
          if (c.st === 'norm' && c.p.includes(perId)) {
            c.p = c.p.filter((v) => v !== perId);
            if (!c.p.length && !c.x.length) c.st = 'vacant';
          }
          if (cellEmpty(c)) delete d.cells[k];
        });
      });
      setModal(null);
    },

    saveExec: (xid, data) => {
      update((d) => {
        if (xid) {
          const x = d.execs.find((e) => e.id === xid);
          if (x) Object.assign(x, data);
        } else {
          d.execs.push({ id: uid('x'), ...data });
        }
      });
      setModal(null);
    },
    deleteExec: (xid) => {
      update((d) => {
        d.execs = d.execs.filter((e) => e.id !== xid);
        Object.keys(d.cells).forEach((k) => removeXidIn(d, k, xid));
      });
      setModal(null);
    },
    createExecInline: (name, type) => {
      const existing = stateRef.current.execs.find(
        (e) => e.name.toLowerCase() === name.toLowerCase() && e.type === type,
      );
      if (existing) return existing.id;
      const id = uid('x');
      update((d) => { d.execs.push({ id, name, type, note: '' }); });
      return id;
    },

    saveRole: (roleId, data) => {
      update((d) => {
        if (roleId) {
          const r = d.roles.find((x) => x.id === roleId);
          if (r) Object.assign(r, data);
        } else {
          d.roles.push({ id: uid('r'), ...data });
        }
      });
      setModal(null);
    },
    deleteRole: (roleId) => {
      update((d) => {
        d.roles = d.roles.filter((r) => r.id !== roleId);
        Object.keys(d.cells).forEach((k) => { if (k.split('|')[1] === roleId) delete d.cells[k]; });
      });
      setModal(null);
    },
    moveRole: (roleId, dir) => {
      update((d) => {
        const i = d.roles.findIndex((r) => r.id === roleId);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= d.roles.length) return;
        [d.roles[i], d.roles[j]] = [d.roles[j], d.roles[i]];
      });
    },

    assignPerson,
    assignExec,
    removePerson: (key, pid) => update((d) => removePidIn(d, key, pid)),
    removeExec: (key, xid) => update((d) => removeXidIn(d, key, xid)),

    colFill: (roleId, sysIds, xid, onlyUnset) => {
      update((d) => {
        sysIds.forEach((sid) => {
          const key = cellKey(sid, roleId);
          const c = d.cells[key] ?? { st: 'norm' as const, p: [], x: [], n: '' };
          if (c.st !== 'norm') return;
          if (onlyUnset && (c.p.length || c.x.length)) return;
          if (!c.x.includes(xid)) { c.x = [...c.x, xid]; d.cells[key] = c; }
        });
      });
      setModal(null);
    },

    toggleSel: (kind, id, from) => {
      setSel((cur) =>
        cur && cur.kind === kind && cur.id === id && cur.from === from ? null : { kind, id, from });
    },

    clickTarget: (sysId, roleId) => {
      if (!sel) return;
      const { kind, id, from } = sel;
      setSel(null);
      if (roleId) {
        (kind === 'exec' ? assignExec : assignPerson)(id, sysId, roleId, from);
      } else {
        setModal({ kind: 'rolePick', subjKind: kind, id, sysId, fromKey: from });
      }
    },

    importState: (raw) => {
      const cur = stateRef.current.rev || 0;
      const norm = normalize(raw, SEED);
      norm.rev = Math.max(cur, norm.rev || 0) + 1;
      setSel(null);
      setState(norm);
      setModal(null);
    },

    applyFeed: (kind, raw) => {
      const fn = kind === 'people' ? applyPeopleFeed : applyContractsFeed;
      const { next, report } = fn(stateRef.current, raw);
      if (next !== stateRef.current) {
        next.rev = (next.rev || 0) + 1;
        setState(next);
      }
      setModal({ kind: 'feedReport', title: report.title, lines: report.lines });
    },
  };

  /* drag&drop */
  useEffect(() => initDnd({
    getState: () => stateRef.current,
    onAssignPerson: (pid, sysId, roleId, from) => { setSel(null); assignPerson(pid, sysId, roleId, from); },
    onAssignExec: (xid, sysId, roleId, from) => { setSel(null); assignExec(xid, sysId, roleId, from); },
    onPickRole: (kind, id, sysId, from) => {
      setSel(null);
      setModal({ kind: 'rolePick', subjKind: kind, id, sysId, fromKey: from });
    },
    onMoveSystem: (sysId, unit, px, py, secEl) => {
      update((d) => {
        const s = d.systems.find((x) => x.id === sysId);
        if (!s) return;
        s.unit = unit as UnitId;
        const cards = Array.from(secEl.querySelectorAll<HTMLElement>('.sys-card'))
          .filter((c) => c.dataset.sys !== sysId);
        let idx = 0;
        cards.forEach((c) => {
          const r = c.getBoundingClientRect();
          if (r.bottom < py || (py >= r.top && py <= r.bottom && r.left + r.width / 2 < px)) idx++;
        });
        const list = sysByUnitSorted(d, s.unit).filter((x) => x.id !== sysId);
        list.splice(Math.min(idx, list.length), 0, s);
        list.forEach((x, i) => { x.ord = i; });
      });
    },
  }), [assignPerson, assignExec, update]);

  useEffect(() => {
    const click = (e: MouseEvent) => { if (consumeDragClick()) { e.stopPropagation(); e.preventDefault(); } };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { setModal(null); setSel(null); } };
    document.addEventListener('click', click, true);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('click', click, true); document.removeEventListener('keydown', key); };
  }, []);

  const goNav = (n: NavId) => { setNav(n); setPassportId(null); setSideOpen(false); setSel(null); window.scrollTo(0, 0); };
  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try { localStorage.setItem('erm-side', c ? '0' : '1'); } catch { /* ок */ }
      return !c;
    });
  };
  useEffect(() => {
    document.body.classList.toggle('side-collapsed', collapsed);
    document.body.classList.toggle('side-open', sideOpen);
  }, [collapsed, sideOpen]);

  const g = gapsData(state);
  const statusText =
    status === 'pending' ? 'Є незбережені зміни…' :
    status === 'error' ? 'Помилка збереження' :
    source.mode === 'file' ? (source.pending ? `Файл: ${source.name} — підключити` : `Файл: ${source.name}`) :
    'Збережено в браузері';

  const NavBtn = ({ id, icon, label, soon, count }: {
    id: NavId; icon: () => ReturnType<typeof IcMap>; label: string; soon?: boolean; count?: number;
  }) => (
    <button type="button" className={`nav${nav === id && !passportId ? ' on' : ''}`} onClick={() => goNav(id)}>
      {icon()}<span className="lbl">{label}</span>
      {soon && <span className="soon">скоро</span>}
      {!soon && !!count && <span className="soon">{count}</span>}
    </button>
  );

  const meta = PAGE_META[nav];
  const passportSys = passportId ? state.systems.find((s) => s.id === passportId) : undefined;

  return (
    <div className="app">
      <aside className="side" id="side">
        <div className="brand">
          <span className="bmark">E</span>
          <span className="btxt">ERM-кокпіт<span>Карта відповідальності</span></span>
        </div>
        <div className="ngrp">Модулі</div>
        <NavBtn id="overview" icon={IcHome} label="Огляд департаменту" />
        <NavBtn id="map" icon={IcMap} label="Карта систем" count={g.vacancies.length} />
        <NavBtn id="m2" icon={IcChart} label="Завантаженість" soon />
        <NavBtn id="m3" icon={IcDoc} label="Договори та оплати" soon />
        <div className="ngrp">Довідники</div>
        <NavBtn id="systems" icon={IcLayers} label="Системи" />
        <NavBtn id="people" icon={IcPeople} label="Люди" />
        <NavBtn id="execs" icon={IcOrg} label="Виконавці" />
        <NavBtn id="roles" icon={IcList} label="Ролі" />
        <div className="spacer" />
        <div className="foot">
          <div className="source-mini">
            <span className={`dot${source.mode === 'file' && !source.pending ? '' : ' off'}`} />
            {source.mode === 'file' ? source.name : 'localStorage'}
            <small>{source.mode === 'file' ? 'локальний файл даних' : 'дані в цьому браузері'}</small>
          </div>
          <NavBtn id="settings" icon={IcGear} label="Налаштування" />
          <button type="button" className="nav" onClick={toggleCollapsed}>
            <IcCollapse /><span className="lbl">Згорнути меню</span>
          </button>
        </div>
      </aside>
      <div className="maincol">
        <header className="topbar">
          <button type="button" id="menuBtn" title="Меню" onClick={() => setSideOpen((v) => !v)}>☰</button>
          <span className="crumb">ERM-кокпіт <strong>/ {passportSys ? passportSys.name : meta.crumb}</strong></span>
          <div className="hright">
            <button type="button"
              className={`pill${status === 'error' ? ' err' : source.mode === 'file' && source.pending ? ' warn' : ''}`}
              style={{ cursor: source.mode === 'file' && source.pending ? 'pointer' : 'default' }}
              onClick={() => { if (source.mode === 'file' && source.pending) connectFile(); }}>
              <span className="dot" />{statusText}
            </button>
          </div>
        </header>
        <main className="content">
          {passportSys ? (
            <Passport state={state} sys={passportSys} actions={actions} onBack={() => setPassportId(null)} />
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">{meta.eyebrow}</div>
                  <h1>{meta.h1}</h1>
                  {meta.sub && <p>{meta.sub}</p>}
                </div>
                <div className="heading-actions">
                  {nav === 'overview' && (
                    <button type="button" className="btn" onClick={() => actions.goMap('matrix')}>
                      Відкрити карту <IcArrowUR />
                    </button>
                  )}
                  {nav === 'map' && (
                    <div className="seg">
                      {(([['matrix', 'Матриця'], ['board', 'Дошка']]) as [MapView, string][]).map(([v, l]) => (
                        <button key={v} type="button" className={mapView === v ? 'on' : ''} onClick={() => setMapView(v)}>{l}</button>
                      ))}
                    </div>
                  )}
                  {nav === 'systems' && (
                    <button type="button" className="ghost" onClick={() => actions.openSystem(null)}>+ Система</button>
                  )}
                  {nav === 'people' && (
                    <button type="button" className="ghost" onClick={() => actions.openPerson(null)}>+ Людина</button>
                  )}
                </div>
              </div>
              {nav === 'overview' && <Overview state={state} actions={actions} />}
              {nav === 'map' && mapView === 'matrix' && <Matrix key={presetKey} state={state} preset={preset} actions={actions} />}
              {nav === 'map' && mapView === 'board' && <Board state={state} sel={sel} actions={actions} />}
              {nav === 'systems' && <SystemsView state={state} actions={actions} />}
              {nav === 'people' && <PeopleView state={state} actions={actions} />}
              {nav === 'execs' && <ExecsView state={state} actions={actions} />}
              {nav === 'roles' && <RolesView state={state} actions={actions} />}
              {nav === 'settings' && (
                <SettingsView
                  theme={theme} setTheme={setTheme}
                  source={source} fsOk={fsSupported}
                  onOpenFile={openFile} onCreateFile={createFile} onDetach={detachFile} onReconnect={connectFile}
                  onExport={() => exportJSON(state)} onImport={() => setModal({ kind: 'import' })}
                  onFeed={(kind, raw) => actions.applyFeed(kind, raw)}
                />
              )}
              {(nav === 'm2' || nav === 'm3') && <StubView nav={nav} />}
            </>
          )}
        </main>
      </div>

      {sel && (
        <div id="selHint">
          Клікніть по рядку ролі або картці системи
          <button type="button" onClick={() => setSel(null)}>скасувати</button>
        </div>
      )}

      {modal?.kind === 'cell' && <CellEditor state={state} sysId={modal.sysId} roleId={modal.roleId} actions={actions} onClose={() => setModal(null)} />}
      {modal?.kind === 'system' && <SystemEditor state={state} sysId={modal.sysId} actions={actions} onClose={() => setModal(null)} />}
      {modal?.kind === 'person' && <PersonEditor state={state} perId={modal.perId} actions={actions} onClose={() => setModal(null)} />}
      {modal?.kind === 'exec' && <ExecEditor state={state} xid={modal.xid} actions={actions} onClose={() => setModal(null)} />}
      {modal?.kind === 'role' && <RoleEditor state={state} roleId={modal.roleId} actions={actions} onClose={() => setModal(null)} />}
      {modal?.kind === 'rolePick' && <RolePicker state={state} subjKind={modal.subjKind} id={modal.id} sysId={modal.sysId} fromKey={modal.fromKey} actions={actions} onClose={() => setModal(null)} />}
      {modal?.kind === 'colFill' && <ColFillModal state={state} roleId={modal.roleId} sysIds={modal.sysIds} actions={actions} onClose={() => setModal(null)} />}
      {modal?.kind === 'import' && <ImportModal actions={actions} onClose={() => setModal(null)} />}
      {modal?.kind === 'feedReport' && (
        <div id="overlay" className="open" onMouseDown={(e) => { if ((e.target as HTMLElement).id === 'overlay') setModal(null); }}>
          <div id="modal" className="modal" role="dialog" aria-modal="true">
            <h3>{modal.title}</h3>
            <div style={{ marginTop: 8 }}>
              {modal.lines.map((l, i) => <p key={i} className="sm" style={{ margin: '0 0 8px' }}>{l}</p>)}
            </div>
            <div className="mactions"><div className="right">
              <button className="btn" type="button" onClick={() => setModal(null)}>Готово</button>
            </div></div>
          </div>
        </div>
      )}
    </div>
  );
}
