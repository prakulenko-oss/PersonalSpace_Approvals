import { useState } from 'react';
import type { Actions } from '../App';
import { SUPPORT, UNITS, UNIT_ORDER, XCLS, coverage, daysTo, dispState, execById, fmtDate, getCell, monogram, personById, rolesOrdered, surname, sysByUnitSorted } from '../model';
import type { AppState, System } from '../types';
import { IcArrowUR, IcJson, IcPencil } from '../icons';

const RegCard = ({ state, s, actions }: { state: AppState; s: System; actions: Actions }) => {
  const cov = coverage(state, s.id);
  return (
    <article className="reg-card">
      <div className="reg-card-head">
        <span className="mono">{monogram(s.name)}</span>
        <button type="button" className="icon-button" aria-label={`Атрибути ${s.name}`}
                onClick={() => actions.openSystem(s.id)}>
          <IcPencil />
        </button>
      </div>
      <button type="button" className="card-title" onClick={() => actions.openPassport(s.id)}>
        {s.name} <IcArrowUR />
      </button>
      <div className="card-tags">
        {s.sox && <span className="badge blue">SOX</span>}
        {s.saas && <span className="badge blue">SaaS</span>}
        {s.status === 'sunset' && <span className="badge amber">На виведенні</span>}
      </div>
      <p className="card-support">{UNITS[s.unit].name} · {SUPPORT[s.support]}{s.partner ? ` · ${s.partner}` : ''}</p>
      <div className="card-roles">
        {rolesOrdered(state).map((r) => {
          const c = getCell(state, s.id, r.id);
          const ds = dispState(c);
          if (ds === 'na') return null;
          return (
            <div key={r.id}>
              <span>{(r.short || r.name).toUpperCase()}</span>
              <button type="button" onClick={() => actions.openCell(s.id, r.id)}>
                {ds === 'filled' && c.p.map((pid) => {
                  const p = personById(state, pid);
                  return <span key={pid} className="chip c-ok">{p ? surname(p.name) : '?'}</span>;
                })}
                {ds === 'filled' && c.x.map((xid) => {
                  const x = execById(state, xid);
                  return x ? <span key={xid} className={`chip ${XCLS[x.type]}`}>{x.name}</span> : null;
                })}
                {ds === 'vacant' && <span className="badge red">Вакансія</span>}
                {ds === 'unset' && <span className="empty-slot">не розібрано</span>}
              </button>
            </div>
          );
        })}
      </div>
      <div className="card-case">
        <IcJson sz={14} />
        <span>{s.caseText ? 'Кейс зафіксовано' : 'Кейс не зафіксовано'} · покриття {cov.covered}/{cov.total}</span>
      </div>
    </article>
  );
};

const SystemsView = ({ state, actions }: { state: AppState; actions: Actions }) => {
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [q, setQ] = useState('');
  const ql = q.toLowerCase();
  const match = (s: System) => !ql || s.name.toLowerCase().includes(ql);

  return (
    <>
      <div className="toolbar">
        <input type="text" placeholder="Пошук системи" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="grow" />
        <div className="seg">
          {(([['cards', 'Картки'], ['table', 'Таблиця']]) as ['cards' | 'table', string][]).map(([v, l]) => (
            <button key={v} type="button" className={view === v ? 'on' : ''} onClick={() => setView(v)}>{l}</button>
          ))}
        </div>
      </div>
      {view === 'cards' ? (
        UNIT_ORDER.map((u) => {
          const list = sysByUnitSorted(state, u).filter(match);
          if (!list.length) return null;
          return (
            <div key={u} style={{ marginBottom: 22 }}>
              <div className="overview-section-title" style={{ marginTop: 6 }}>
                <h2>{UNITS[u].name}</h2><span>{list.length} систем</span>
              </div>
              <div className="card-grid">
                {list.map((s) => <RegCard key={s.id} state={state} s={s} actions={actions} />)}
              </div>
            </div>
          );
        })
      ) : (
        <div className="panel" style={{ overflow: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr><th>Система</th><th>Відділ</th><th>Модель підтримки</th><th>Договір</th><th>Кейс</th><th style={{ width: 40 }} /></tr>
            </thead>
            <tbody>
              {state.systems.filter(match).map((s) => {
                const d = daysTo(s.contractEnd);
                return (
                  <tr key={s.id} onClick={() => actions.openPassport(s.id)}>
                    <td>
                      <b style={{ fontWeight: 700 }}>{s.name}</b>
                      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        {s.sox && <span className="badge blue">SOX</span>}
                        {s.saas && <span className="badge blue">SaaS</span>}
                        {s.status === 'sunset' && <span className="badge amber">вивід</span>}
                      </div>
                    </td>
                    <td className="sm mut">{UNITS[s.unit].name}</td>
                    <td className="sm mut">{SUPPORT[s.support]}{s.partner ? ` · ${s.partner}` : ''}</td>
                    <td className="sm">
                      {s.contractEnd ? (
                        <>
                          до {fmtDate(s.contractEnd)}{' '}
                          {d !== null && d < 0 ? <span className="badge red">прострочено</span>
                            : d !== null && d <= 120 ? <span className="badge amber">за {d} дн.</span> : null}
                          {s.contractCap && <small style={{ display: 'block', color: 'var(--mut2)' }}>{s.contractCap}</small>}
                        </>
                      ) : <span className="mut">—</span>}
                    </td>
                    <td className="sm">{s.caseText ? <span className="badge green">є</span> : <span className="mut">—</span>}</td>
                    <td>
                      <button type="button" className="icon-button" aria-label={`Атрибути ${s.name}`}
                              onClick={(e) => { e.stopPropagation(); actions.openSystem(s.id); }}>
                        <IcPencil />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};
export default SystemsView;
