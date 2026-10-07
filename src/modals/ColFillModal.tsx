import { useState } from 'react';
import type { Actions } from '../App';
import { XTYPES } from '../model';
import type { AppState } from '../types';
import { Modal } from '../ui';

const ColFillModal = ({ state, roleId, sysIds, actions, onClose }: {
  state: AppState; roleId: string; sysIds: string[]; actions: Actions; onClose: () => void;
}) => {
  const role = state.roles.find((r) => r.id === roleId);
  const [xid, setXid] = useState(state.execs[0]?.id ?? '');
  const [onlyUnset, setOnlyUnset] = useState(true);
  const [err, setErr] = useState('');
  if (!role) return null;

  const go = () => {
    if (!xid) { setErr('Оберіть виконавця.'); return; }
    actions.colFill(roleId, sysIds, xid, onlyUnset);
  };

  return (
    <Modal onClose={onClose}>
      <h3>Масове заповнення: {role.name}</h3>
      <div className="msub">
        Виконавця буде додано до ролі «{role.name}» для систем за поточними фільтрами матриці ({sysIds.length} шт.).
      </div>
      <div className="pklist" style={{ maxHeight: 180 }}>
        {state.execs.length ? state.execs.map((x) => (
          <label key={x.id} className="pk-row">
            <input type="radio" name="cfx" checked={xid === x.id} onChange={() => setXid(x.id)} />
            <span className="who">{x.name}</span><span className="meta">{XTYPES[x.type]}</span>
          </label>
        )) : <p className="mut sm" style={{ padding: 6 }}>Довідник виконавців порожній.</p>}
      </div>
      <label className="chk" style={{ marginTop: 10 }}>
        <input type="checkbox" checked={onlyUnset} onChange={(e) => setOnlyUnset(e.target.checked)} />
        лише нерозібрані клітинки (не чіпати заповнені, вакансії та «не потрібно»)
      </label>
      <div className="formErr">{err}</div>
      <div className="mactions">
        <div className="right">
          <button className="ghost" type="button" onClick={onClose}>Скасувати</button>
          <button className="btn" type="button" onClick={go}>Застосувати</button>
        </div>
      </div>
    </Modal>
  );
};
export default ColFillModal;
