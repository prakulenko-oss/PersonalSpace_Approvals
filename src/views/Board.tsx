import { useState } from 'react';
import type { Actions } from '../App';
import {
  FUNCS, FUNC_ORDER, UNITS, UNIT_ORDER, XCLS, XTYPES, cellKey, coverage, dispState,
  execById, getCell, personById, personLoad, surname, sysByUnitSorted,
} from '../model';
import type { AppState, Sel, System } from '../types';
import { Bar, SysBadges } from '../ui';

const Card = ({ state, s, sel, actions }: { state: AppState; s: System; sel: Sel | null; actions: Actions }) => {
  const cov = coverage(state, s.id);
  const pct = cov.total ? Math.round((100 * cov.covered) / cov.total) : 0;
  return (
    <div className="sys-card" data-sys={s.id} style={{ ['--uc' as string]: `var(--unit-${s.unit})` }}
         onClick={() => { if (sel) actions.clickTarget(s.id, null); }}>
      <div className="chead">
        <span className="grip" data-drag="sys" data-sys={s.id} title="Перетягнути">⠿</span>
        <button type="button" className="cname"
                onClick={(e) => { if (!sel) { e.stopPropagation(); actions.openPassport(s.id); } }}>
          {s.name}
        </button>
      </div>
      <div className="cbadges"><SysBadges s={s} /></div>
      <div className="roles">
        {FUNC_ORDER.map((f) => {
          const roles = state.roles.filter((r) => (r.func || 'fsup') === f);
          if (!roles.length) return null;
          return (
            <div key={f}>
              <div className="fhdr">{FUNCS[f]}</div>
              {roles.map((r) => {
                const c = getCell(state, s.id, r.id);
                const ds = dispState(c);
                const key = cellKey(s.id, r.id);
                return (
                  <div key={r.id} className="rrow" data-role={r.id}
                       onClick={(e) => { if (sel && ds !== 'na') { e.stopPropagation(); actions.clickTarget(s.id, r.id); } }}>
                    <span className="rl" title={r.name}>{r.short || r.name}</span>
                    {ds === 'filled' && c.p.map((pid) => {
                      const p = personById(state, pid);
                      const isSel = sel?.kind === 'person' && sel.id === pid && sel.from === key;
                      return (
                        <span key={pid} className={`achip${isSel ? ' sel' : ''}`}
                              data-drag="person" data-pid={pid} data-from={key} title={p?.name}
                              onClick={(e) => { e.stopPropagation(); actions.toggleSel('person', pid, key); }}>
                          {p ? surname(p.name) : '?'}
                          <span className="x" data-x="1" title="Зняти призначення"
                                onClick={(e) => { e.stopPropagation(); actions.removePerson(key, pid); }}>×</span>
                        </span>
                      );
                    })}
                    {ds === 'filled' && c.x.map((xid) => {
                      const x = execById(state, xid);
                      if (!x) return null;
                      const isSel = sel?.kind === 'exec' && sel.id === xid && sel.from === key;
                      return (
                        <span key={xid} className={`chip xchip ${XCLS[x.type]}${isSel ? ' sel' : ''}`}
                              data-drag="exec" data-pid={xid} data-from={key} title={XTYPES[x.type]}
                              onClick={(e) => { e.stopPropagation(); actions.toggleSel('exec', xid, key); }}>
                          {x.name}
                          <span className="xdel" data-x="1" title="Прибрати виконавця"
                                onClick={(e) => { e.stopPropagation(); actions.removeExec(key, xid); }}> ×</span>
                        </span>
                      );
                    })}
                    {ds === 'vacant' && (
                      <button type="button" className="chip c-gap"
                              onClick={(e) => { if (!sel) { e.stopPropagation(); actions.openCell(s.id, r.id); } }}>вакансія</button>
                    )}
                    {ds === 'na' && (
                      <button type="button" className="naslot" title="Не потрібно"
                              onClick={(e) => { e.stopPropagation(); actions.openCell(s.id, r.id); }}>—</button>
                    )}
                    {ds === 'unset' && (
                      <button type="button" className="slot" title="Не розібрано — клікніть або перетягніть людину чи виконавця"
                              onClick={(e) => { if (!sel) { e.stopPropagation(); actions.openCell(s.id, r.id); } }}>+</button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="covrow"><Bar pct={pct} /><span className="sm mut">{cov.covered}/{cov.total}</span></div>
    </div>
  );
};

const Board = ({ state, sel, actions }: { state: AppState; sel: Sel | null; actions: Actions }) => {
  const [q, setQ] = useState('');
  const load = personLoad(state);
  const ql = q.toLowerCase();
  return (
    <>
      <div className="board">
        <div className="btray">
          <h4>Люди</h4>
          <input type="text" placeholder="Пошук" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="tlist">
            {!state.people.length && (
              <p className="mut sm" style={{ padding: '4px 2px' }}>
                Людей ще немає. Підключіть файл даних у Налаштуваннях або додайте їх у довіднику «Люди».
              </p>
            )}
            {UNIT_ORDER.map((u) => {
              const list = state.people.filter((p) => p.unit === u && (!ql || p.name.toLowerCase().includes(ql)));
              if (!list.length) return null;
              return (
                <div key={u}>
                  <div className="tgrp">{UNITS[u].name}</div>
                  {list.map((p) => {
                    const isSel = sel?.kind === 'person' && sel.id === p.id && !sel.from;
                    return (
                      <button key={p.id} type="button"
                              className={`pchip${p.flag ? ' away' : ''}${isSel ? ' sel' : ''}`}
                              data-drag="person" data-pid={p.id}
                              title={`${p.title}${p.flag ? ` — ${p.flag}` : ''}`}
                              onClick={() => actions.toggleSel('person', p.id, null)}>
                        {p.name}<span className="ld">{(load[p.id] || []).length}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
            <div className="tgrp">Виконавці (домени, партнери, бізнес)</div>
            {state.execs.map((x) => {
              const n = Object.values(state.cells).filter((c) => c.x.includes(x.id)).length;
              const isSel = sel?.kind === 'exec' && sel.id === x.id && !sel.from;
              return (
                <button key={x.id} type="button" className={`pchip${isSel ? ' sel' : ''}`}
                        data-drag="exec" data-pid={x.id} data-name={x.name.toLowerCase()}
                        title={`${XTYPES[x.type]}${x.note ? ` — ${x.note}` : ''}`}
                        onClick={() => actions.toggleSel('exec', x.id, null)}>
                  <span className={`chip ${XCLS[x.type]}`} style={{ pointerEvents: 'none' }}>{x.name}</span>
                  <span className="ld">{n}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div id="bmain">
          {UNIT_ORDER.map((u) => {
            const list = sysByUnitSorted(state, u);
            return (
              <div key={u} className="usec" data-unit={u}>
                <h4><span>{UNITS[u].name}</span><span className="mut">{list.length}</span></h4>
                <div className="cards">
                  {list.map((s) => <Card key={s.id} state={state} s={s} sel={sel} actions={actions} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mut sm" style={{ marginTop: 10 }}>
        Тягніть людину чи виконавця на рядок ролі — призначення без діалогу; на картку загалом — з вибором ролі.
        Кліками так само. Назва картки відкриває паспорт системи. Картки перетягуються між відділами за ⠿.
      </p>
    </>
  );
};
export default Board;
