import { useState } from 'react';
import type { Actions } from '../App';
import { XTYPES, execUsage } from '../model';
import type { AppState, ExecType } from '../types';
import { ArmButton, Fld, Modal } from '../ui';

const ExecEditor = ({ state, xid, actions, onClose }: {
  state: AppState; xid: string | null; actions: Actions; onClose: () => void;
}) => {
  const x = xid ? state.execs.find((e) => e.id === xid) : undefined;
  const [name, setName] = useState(x?.name ?? '');
  const [type, setType] = useState<ExecType>(x?.type ?? 'itdom');
  const [note, setNote] = useState(x?.note ?? '');
  const [err, setErr] = useState('');
  const used = x ? execUsage(state, x.id).cells : 0;

  const save = () => {
    if (!name.trim()) { setErr('Вкажіть назву.'); return; }
    actions.saveExec(xid, { name: name.trim(), type, note: note.trim() });
  };

  return (
    <Modal onClose={onClose}>
      <h3>{x ? 'Виконавець' : 'Новий виконавець'}</h3>
      <div className="msub">{x ? x.name : 'Суміжний домен, партнер або бізнес-підрозділ'}</div>
      <Fld label="Назва"><input type="text" value={name} placeholder="Напр., ITSS" onChange={(e) => setName(e.target.value)} /></Fld>
      <Fld label="Тип">
        <select value={type} onChange={(e) => setType(e.target.value as ExecType)}>
          {(Object.keys(XTYPES) as ExecType[]).map((k) => <option key={k} value={k}>{XTYPES[k]}</option>)}
        </select>
      </Fld>
      <Fld label="Нотатка"><textarea value={note} onChange={(e) => setNote(e.target.value)} /></Fld>
      <div className="formErr">{err}</div>
      <div className="mactions">
        {x ? (
          <ArmButton label={`Видалити${used ? ` (${used} клітинок)` : ''}`} confirmLabel="Підтвердити видалення"
                     onConfirm={() => actions.deleteExec(x.id)} />
        ) : <span />}
        <div className="right">
          <button className="ghost" type="button" onClick={onClose}>Скасувати</button>
          <button className="btn" type="button" onClick={save}>Зберегти</button>
        </div>
      </div>
    </Modal>
  );
};
export default ExecEditor;
