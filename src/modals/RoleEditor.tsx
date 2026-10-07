import { useState } from 'react';
import type { Actions } from '../App';
import { FUNCS, FUNC_ORDER } from '../model';
import type { AppState, FuncId } from '../types';
import { ArmButton, Fld, Modal } from '../ui';

const RoleEditor = ({ state, roleId, actions, onClose }: {
  state: AppState; roleId: string | null; actions: Actions; onClose: () => void;
}) => {
  const r = roleId ? state.roles.find((x) => x.id === roleId) : undefined;
  const [name, setName] = useState(r?.name ?? '');
  const [short, setShort] = useState(r?.short ?? '');
  const [func, setFunc] = useState<FuncId>(r?.func ?? 'fsup');
  const [err, setErr] = useState('');
  const used = r ? Object.keys(state.cells).filter((k) => k.split('|')[1] === r.id).length : 0;

  const save = () => {
    if (!name.trim()) { setErr('Вкажіть назву ролі.'); return; }
    actions.saveRole(roleId, { name: name.trim(), short: short.trim() || name.trim(), func });
  };

  return (
    <Modal onClose={onClose}>
      <h3>{r ? 'Роль' : 'Нова роль'}</h3>
      <div className="msub">{r ? r.name : 'Додавання ролі до словника'}</div>
      <Fld label="Назва"><input type="text" value={name} placeholder="Напр., Ключовий користувач" onChange={(e) => setName(e.target.value)} /></Fld>
      <Fld label="Коротка назва (для матриці)"><input type="text" value={short} onChange={(e) => setShort(e.target.value)} /></Fld>
      <Fld label="Функція">
        <select value={func} onChange={(e) => setFunc(e.target.value as FuncId)}>
          {FUNC_ORDER.map((f) => <option key={f} value={f}>{FUNCS[f]}</option>)}
        </select>
      </Fld>
      <div className="formErr">{err}</div>
      <div className="mactions">
        {r ? (
          <ArmButton label={`Видалити${used ? ` (${used} клітинок)` : ''}`} confirmLabel="Підтвердити видалення"
                     onConfirm={() => actions.deleteRole(r.id)} />
        ) : <span />}
        <div className="right">
          <button className="ghost" type="button" onClick={onClose}>Скасувати</button>
          <button className="btn" type="button" onClick={save}>Зберегти</button>
        </div>
      </div>
    </Modal>
  );
};
export default RoleEditor;
