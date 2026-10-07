import { useState } from 'react';
import type { Actions } from '../App';
import { UNITS, UNIT_ORDER } from '../model';
import type { AppState, UnitId } from '../types';
import { ArmButton, Fld, Modal } from '../ui';

const GRADES = ['Senior M', 'Senior', 'Middle', 'Junior'];
const TYPES = [['штат', 'Штатний співробітник'], ['ГІГ', 'Співробітник ГІГ']] as const;

const PersonEditor: React.FC<{
  state: AppState; perId: string | null; actions: Actions; onClose: () => void;
}> = ({ state, perId, actions, onClose }) => {
  const p = perId ? state.people.find((x) => x.id === perId) : undefined;
  const [name, setName] = useState(p?.name ?? '');
  const [unit, setUnit] = useState<UnitId>(p?.unit ?? 'fin');
  const [grade, setGrade] = useState(p?.grade ?? 'Middle');
  const [type, setType] = useState(p?.type ?? 'штат');
  const [flag, setFlag] = useState(p?.flag ?? '');
  const [title, setTitle] = useState(p?.title ?? '');
  const [err, setErr] = useState('');

  const save = () => {
    if (!name.trim()) { setErr('Вкажіть прізвище та імʼя.'); return; }
    actions.savePerson(perId, {
      name: name.trim(), unit, grade, type, flag: flag.trim(), title: title.trim(),
    });
  };

  return (
    <Modal onClose={onClose}>
      <h3>{p ? 'Співробітник' : 'Нова людина'}</h3>
      <div className="msub">{p ? p.name : 'Додавання людини до домену'}</div>
      <Fld label="Прізвище, імʼя"><input type="text" value={name} onChange={(e) => setName(e.target.value)} /></Fld>
      <div className="fldrow">
        <Fld label="Відділ">
          <select value={unit} onChange={(e) => setUnit(e.target.value as UnitId)}>
            {UNIT_ORDER.map((u) => <option key={u} value={u}>{UNITS[u].name}</option>)}
          </select>
        </Fld>
        <Fld label="Грейд">
          <select value={grade} onChange={(e) => setGrade(e.target.value)}>
            {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </Fld>
      </div>
      <div className="fldrow">
        <Fld label="Тип">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Fld>
        <Fld label="Позначка (відпустка, служба…)"><input type="text" value={flag} onChange={(e) => setFlag(e.target.value)} /></Fld>
      </div>
      <Fld label="Посада (корпоративна назва)"><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} /></Fld>
      <div className="formErr">{err}</div>
      <div className="mactions">
        {p ? <ArmButton label="Видалити" confirmLabel="Підтвердити видалення" onConfirm={() => actions.deletePerson(p.id)} /> : <span />}
        <div className="right">
          <button className="ghost" type="button" onClick={onClose}>Скасувати</button>
          <button className="btn" type="button" onClick={save}>Зберегти</button>
        </div>
      </div>
    </Modal>
  );
};
export default PersonEditor;
