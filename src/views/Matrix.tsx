import { useState } from 'react';
import type { Actions } from '../App';
import {
  DISP_LABEL, FUNCS, FUNC_ORDER, SUPPORT, UNITS, UNIT_ORDER, XCLS, dispState, execById,
  getCell, personById, rolesOrdered, surname, sysByUnitSorted,
} from '../model';
import type { AppState, MatrixPreset, Problem, SupportId, System, UnitId } from '../types';

const PROBLEMS: [Problem, string][] = [
  ['', 'Всі стани'],
  ['vacant', 'Є вакансії'],
  ['unset', 'Є нерозібрані'],
  ['po', 'Без Product Owner'],
  ['nobackup', 'Без резерву'],
];

const Matrix = ({ state, preset, actions }: { state: AppState; preset?: MatrixPreset; actions: Actions }) => {
  const [fUnit, setFUnit] = useState<'' | UnitId>(preset?.unit ?? '');
  const [fSupport, setFSupport] = useState<'' | SupportId>('');
  const [fQuery, setFQuery] = useState(preset?.query ?? '');
  const [fProblem, setFProblem] = useState<Problem>(preset?.problem ?? '');

  const hasProblem = (s: System, p: Problem): boolean => {
    if (!p) return true;
    if (p === 'po') {
      const ds = dispState(getCell(state, s.id, 'po'));
      return ds === 'unset' || ds === 'vacant';
    }
    return state.roles.some((r) => {
      const c = getCell(state, s.id, r.id);
      const ds = dispState(c);
      if (p === 'vacant') return ds === 'vacant';
      if (p === 'unset') return ds === 'unset';
      return c.st === 'norm' && c.p.length > 0 && !c.b; // nobackup
    });
  };

  const matches = (s: System) => {
    if (fUnit && s.unit !== fUnit) return false;
    if (fSupport && s.support !== fSupport) return false;
    if (fQuery && !s.name.toLowerCase().includes(fQuery.toLowerCase())) return false;
    return hasProblem(s, fProblem);
  };

  const roles = rolesOrdered(state);
  const filteredIds = state.systems.filter(matches).map((s) => s.id);

  return (
    <>
      <div className="toolbar">
        <select value={fUnit} onChange={(e) => setFUnit(e.target.value as '' | UnitId)}>
          <option value="">Всі відділи</option>
          {UNIT_ORDER.map((u) => <option key={u} value={u}>{UNITS[u].name}</option>)}
        </select>
        <select value={fSupport} onChange={(e) => setFSupport(e.target.value as '' | SupportId)}>
          <option value="">Всі моделі підтримки</option>
          {(Object.keys(SUPPORT) as SupportId[]).map((k) => <option key={k} value={k}>{SUPPORT[k]}</option>)}
        </select>
        <select value={fProblem} onChange={(e) => setFProblem(e.target.value as Problem)}>
          {PROBLEMS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input type="text" className="grow" placeholder="Пошук системи" value={fQuery} onChange={(e) => setFQuery(e.target.value)} />
        <button className="ghost" type="button" onClick={() => actions.openSystem(null)}>+ Система</button>
      </div>
      <div className="mxwrap">
        <table className="mx">
          <thead>
            <tr>
              <th className="syscol" rowSpan={2}>Система</th>
              {FUNC_ORDER.map((f) => {
                const n = roles.filter((r) => (r.func || 'fsup') === f).length;
                return n ? <th key={f} className="fh" colSpan={n}>{FUNCS[f]}</th> : null;
              })}
            </tr>
            <tr>
              {roles.map((r) => (
                <th key={r.id} className="rolecol thclick" title="Клік — масове заповнення колонки"
                    onClick={() => actions.openColFill(r.id, filteredIds)}>
                  {r.short || r.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {UNIT_ORDER.map((u) => {
              const list = sysByUnitSorted(state, u).filter(matches);
              if (!list.length) return null;
              return [
                <tr key={`g-${u}`} className="grp" style={{ ['--uc' as string]: `var(--unit-${u})` }}>
                  <td colSpan={roles.length + 1}>{UNITS[u].name}</td>
                </tr>,
                ...list.map((s) => (
                  <tr key={s.id}>
                    <td className="syscol sysname" style={{ ['--uc' as string]: `var(--unit-${u})` }}>
                      <button type="button" onClick={() => actions.openPassport(s.id)}>{s.name}</button>
                      <span className="meta">
                        {s.sox && <span className="badge blue">SOX</span>}
                        {s.saas && <span className="badge blue">SaaS</span>}
                        {s.status === 'sunset' && <span className="badge amber">вивід</span>}
                        {s.support === 'it_partner' && s.partner && <span className="badge muted">{s.partner}</span>}
                        {s.support === 'business' && <span className="badge muted">бізнес</span>}
                      </span>
                    </td>
                    {roles.map((r) => {
                      const c = getCell(state, s.id, r.id);
                      const ds = dispState(c);
                      return (
                        <td key={r.id} className="rolecol">
                          <button type="button" className={`cell st-${ds}`}
                                  title={`${s.name}: ${r.name} (${DISP_LABEL[ds]})${c.n ? ` — ${c.n}` : ''}`}
                                  onClick={() => actions.openCell(s.id, r.id)}>
                            {ds === 'filled' && c.p.map((pid) => {
                              const p = personById(state, pid);
                              return <span key={pid} className="chip c-ok" title={p ? `${p.name} (${p.title})` : ''}>{p ? surname(p.name) : '?'}</span>;
                            })}
                            {ds === 'filled' && c.x.map((xid) => {
                              const x = execById(state, xid);
                              return x ? <span key={xid} className={`chip ${XCLS[x.type]}`}>{x.name}</span> : null;
                            })}
                            {ds === 'vacant' && <span className="chip c-gap">вакансія</span>}
                            {ds === 'na' && <span>—</span>}
                            {c.n && <span className="note-dot" title={c.n} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                )),
              ];
            })}
          </tbody>
        </table>
      </div>
      <div className="legend">
        <span className="li"><span className="chip c-ok">Прізвище</span> люди домену</span>
        <span className="li"><span className="chip c-itdom">ITSS</span> суміжний ІТ-домен</span>
        <span className="li"><span className="chip c-partner">ADAM</span> партнер</span>
        <span className="li"><span className="chip c-biz">Бізнес</span></span>
        <span className="li"><span className="chip c-gap">вакансія</span></span>
        <span className="li"><span className="mut">пунктир — не розібрано · «—» — не потрібно</span></span>
      </div>
    </>
  );
};
export default Matrix;
