import { useState } from 'react';
import type { Actions } from '../App';
import { FUNCS, UNITS, UNIT_ORDER, XTYPES, getCell } from '../model';
import type { AppState, CellSt, ExecType } from '../types';
import { Fld, Modal } from '../ui';

const CellEditor = ({ state, sysId, roleId, actions, onClose }: {
  state: AppState; sysId: string; roleId: string; actions: Actions; onClose: () => void;
}) => {
  const sys = state.systems.find((x) => x.id === sysId);
  const role = state.roles.find((x) => x.id === roleId);
  const init = getCell(state, sysId, roleId);
  const [st, setSt] = useState<CellSt>(init.st);
  const [b, setB] = useState(init.b ?? '');
  const [p, setP] = useState<string[]>(init.p);
  const [x, setX] = useState<string[]>(init.x);
  const [n, setN] = useState(init.n);
  const [q, setQ] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<ExecType>('itdom');
  const [err, setErr] = useState('');
  if (!sys || !role) return null;

  const toggle = (arr: string[], set: (v: string[]) => void, id: string) =>
    set(arr.includes(id) ? arr.filter((v) => v !== id) : [...arr, id]);

  const addInline = () => {
    const name = newName.trim();
    if (!name) { setErr('Вкажіть назву виконавця.'); return; }
    const id = actions.createExecInline(name, newType);
    if (!x.includes(id)) setX([...x, id]);
    setNewName('');
    setErr('');
  };

  const save = () => {
    actions.saveCell(sysId, roleId, {
      st,
      p: st === 'norm' ? p : [],
      x: st === 'norm' ? x : [],
      n: n.trim(),
      ...(st === 'norm' && b ? { b } : {}),
    });
  };

  const ql = q.toLowerCase();
  return (
    <Modal onClose={onClose}>
      <h3>{sys.name}</h3>
      <div className="msub">Роль: {role.name} ({FUNCS[role.func || 'fsup']})</div>
      <div className="seg">
        {(([['norm', 'Виконується'], ['vacant', 'Вакансія'], ['na', 'Не потрібно']]) as [CellSt, string][]).map(([v, l]) => (
          <button key={v} type="button" className={st === v ? 'on' : ''} onClick={() => setSt(v)}>{l}</button>
        ))}
      </div>
      {st === 'norm' && (
        <div>
          <div className="fld"><label>Люди домену</label></div>
          <input type="text" placeholder="Пошук людини" style={{ width: '100%' }} value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="pklist" style={{ maxHeight: 170 }}>
            {!state.people.length && <p className="mut sm" style={{ padding: 6 }}>Довідник людей порожній.</p>}
            {UNIT_ORDER.map((u) => {
              const list = state.people.filter((pp) => pp.unit === u && (!ql || pp.name.toLowerCase().includes(ql)));
              if (!list.length) return null;
              return (
                <div key={u}>
                  <div className="pkgrp">{UNITS[u].name}</div>
                  {list.map((pp) => (
                    <label key={pp.id} className="pk-row">
                      <input type="checkbox" checked={p.includes(pp.id)} onChange={() => toggle(p, setP, pp.id)} />
                      <span className="who">{pp.name}{pp.flag && <> <span className="chip c-biz">{pp.flag}</span></>}</span>
                      <span className="meta">{pp.grade}</span>
                    </label>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="fld" style={{ marginTop: 10 }}><label>Виконавці (суміжні домени, партнери, бізнес)</label></div>
          <div className="pklist" style={{ maxHeight: 130 }}>
            {state.execs.map((e) => (
              <label key={e.id} className="pk-row">
                <input type="checkbox" checked={x.includes(e.id)} onChange={() => toggle(x, setX, e.id)} />
                <span className="who">{e.name}</span>
                <span className="meta">{XTYPES[e.type]}</span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <input type="text" placeholder="Новий виконавець…" style={{ flex: 1 }}
                   value={newName} onChange={(e) => setNewName(e.target.value)} />
            <select value={newType} onChange={(e) => setNewType(e.target.value as ExecType)}>
              {(Object.keys(XTYPES) as ExecType[]).map((k) => <option key={k} value={k}>{XTYPES[k]}</option>)}
            </select>
            <button className="ghost" type="button" onClick={addInline}>Додати</button>
          </div>
          <Fld label="Резерв (хто підхопить за відсутності основного виконавця)">
            <select value={b} onChange={(e) => setB(e.target.value)}>
              <option value="">— без резерву —</option>
              {state.people.map((pp) => (
                <option key={pp.id} value={pp.id}>{pp.name} ({UNITS[pp.unit].name})</option>
              ))}
            </select>
          </Fld>
        </div>
      )}
      <Fld label="Нотатка"><textarea value={n} onChange={(e) => setN(e.target.value)} /></Fld>
      <div className="formErr">{err}</div>
      <div className="mactions">
        <div className="right">
          <button className="ghost" type="button" onClick={onClose}>Скасувати</button>
          <button className="btn" type="button" onClick={save}>Зберегти</button>
        </div>
      </div>
    </Modal>
  );
};
export default CellEditor;
