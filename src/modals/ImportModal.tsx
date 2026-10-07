import { useState } from 'react';
import type { Actions } from '../App';
import { normalize } from '../model';
import { SEED } from '../seed';
import { Modal } from '../ui';

const ImportModal: React.FC<{ actions: Actions; onClose: () => void }> = ({ actions, onClose }) => {
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const [armed, setArmed] = useState(false);

  const go = () => {
    let d: unknown;
    try { d = JSON.parse(text); }
    catch (e) { setMsg(`Це не схоже на коректний JSON: ${(e as Error).message}`); setArmed(false); return; }
    const obj = d as { people?: unknown; systems?: unknown };
    if (!obj || (!Array.isArray(obj.people) && !Array.isArray(obj.systems))) {
      setMsg('У JSON немає масивів people або systems — це точно експорт кокпіта?'); setArmed(false); return;
    }
    if (!armed) {
      const norm = normalize(d, SEED);
      setMsg(`Знайдено: людей — ${norm.people.length}, систем — ${norm.systems.length}, заповнених клітинок — ${Object.keys(norm.cells).length}. Натисніть ще раз, щоб замінити поточні дані.`);
      setArmed(true);
      return;
    }
    actions.importState(d);
  };

  return (
    <Modal onClose={onClose}>
      <h3>Імпорт даних</h3>
      <div className="msub">Вставте JSON у форматі кокпіта (такий, як дає «Експорт JSON»). Поточні дані буде замінено.</div>
      <textarea style={{ width: '100%', minHeight: 200, fontSize: 11 }} placeholder="{ ... }"
                value={text} onChange={(e) => { setText(e.target.value); setArmed(false); }} />
      <div className="formErr">{msg}</div>
      <div className="mactions">
        <div className="right">
          <button className="ghost" type="button" onClick={onClose}>Скасувати</button>
          <button className="btn" type="button" onClick={go}>{armed ? 'Підтвердити заміну' : 'Перевірити та імпортувати'}</button>
        </div>
      </div>
    </Modal>
  );
};
export default ImportModal;
