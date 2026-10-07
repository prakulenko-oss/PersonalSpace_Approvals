import { useState } from 'react';
import type { Actions } from '../App';
import { STREAMS, SUPPORT, UNITS, UNIT_ORDER } from '../model';
import type { AppState, StreamId, SupportId, SystemStatus, UnitId } from '../types';
import { ArmButton, Fld, Modal } from '../ui';

const SystemEditor: React.FC<{
  state: AppState; sysId: string | null; actions: Actions; onClose: () => void;
}> = ({ state, sysId, actions, onClose }) => {
  const s = sysId ? state.systems.find((x) => x.id === sysId) : undefined;
  const [name, setName] = useState(s?.name ?? '');
  const [unit, setUnit] = useState<UnitId>(s?.unit ?? 'fin');
  const [stream, setStream] = useState<StreamId>(s?.stream ?? 's2');
  const [sox, setSox] = useState(s?.sox ?? false);
  const [saas, setSaas] = useState(s?.saas ?? false);
  const [support, setSupport] = useState<SupportId>(s?.support ?? 'it_full');
  const [partner, setPartner] = useState(s?.partner ?? '');
  const [status, setStatus] = useState<SystemStatus>(s?.status ?? 'active');
  const [note, setNote] = useState(s?.note ?? '');
  const [cEnd, setCEnd] = useState(s?.contractEnd ?? '');
  const [cCap, setCCap] = useState(s?.contractCap ?? '');
  const [cUrl, setCUrl] = useState(s?.contractUrl ?? '');
  const [err, setErr] = useState('');

  const save = () => {
    if (!name.trim()) { setErr('Вкажіть назву системи.'); return; }
    actions.saveSystem(sysId, {
      caseText: s?.caseText ?? '',
      caseUrl: s?.caseUrl ?? '',
      name: name.trim(), unit, stream, sox, saas, support,
      partner: partner.trim(), status, note: note.trim(),
      contractEnd: cEnd.trim(), contractCap: cCap.trim(), contractUrl: cUrl.trim(),
    });
  };

  return (
    <Modal onClose={onClose}>
      <h3>{s ? 'Система' : 'Нова система'}</h3>
      <div className="msub">{s ? s.name : 'Додавання системи до карти домену'}</div>
      <Fld label="Назва"><input type="text" value={name} onChange={(e) => setName(e.target.value)} /></Fld>
      <div className="fldrow">
        <Fld label="Відділ">
          <select value={unit} onChange={(e) => setUnit(e.target.value as UnitId)}>
            {UNIT_ORDER.map((u) => <option key={u} value={u}>{UNITS[u].name}</option>)}
          </select>
        </Fld>
        <Fld label="Стрім стратегії">
          <select value={stream} onChange={(e) => setStream(e.target.value as StreamId)}>
            {(Object.keys(STREAMS) as StreamId[]).map((k) => <option key={k} value={k}>{STREAMS[k]}</option>)}
          </select>
        </Fld>
      </div>
      <div className="fldrow">
        <Fld label="Модель підтримки">
          <select value={support} onChange={(e) => setSupport(e.target.value as SupportId)}>
            {(Object.keys(SUPPORT) as SupportId[]).map((k) => <option key={k} value={k}>{SUPPORT[k]}</option>)}
          </select>
        </Fld>
        <Fld label="Партнер (якщо є)"><input type="text" value={partner} onChange={(e) => setPartner(e.target.value)} /></Fld>
      </div>
      <div className="fldrow">
        <Fld label="Статус">
          <select value={status} onChange={(e) => setStatus(e.target.value as SystemStatus)}>
            <option value="active">Активна</option>
            <option value="sunset">На виведенні</option>
          </select>
        </Fld>
        <Fld label="SOX-scope">
          <label className="chk" style={{ paddingTop: 7 }}>
            <input type="checkbox" checked={sox} onChange={(e) => setSox(e.target.checked)} /> так
          </label>
        </Fld>
        <Fld label="SaaS">
          <label className="chk" style={{ paddingTop: 7 }}>
            <input type="checkbox" checked={saas} onChange={(e) => setSaas(e.target.checked)} /> так
          </label>
        </Fld>
      </div>
      <div className="fldrow">
        <Fld label="Договір діє до"><input type="date" value={cEnd} style={{ width: '100%' }} onChange={(e) => setCEnd(e.target.value)} /></Fld>
        <Fld label="Гранична сума"><input type="text" value={cCap} placeholder="Напр., 2,4 млн грн/рік" onChange={(e) => setCCap(e.target.value)} /></Fld>
      </div>
      <Fld label="Посилання на договір у BPMS"><input type="text" value={cUrl} placeholder="https://…" onChange={(e) => setCUrl(e.target.value)} /></Fld>
      <Fld label="Нотатка"><textarea value={note} onChange={(e) => setNote(e.target.value)} /></Fld>
      <div className="formErr">{err}</div>
      <div className="mactions">
        {s ? <ArmButton label="Видалити" confirmLabel="Підтвердити видалення" onConfirm={() => actions.deleteSystem(s.id)} /> : <span />}
        <div className="right">
          <button className="ghost" type="button" onClick={onClose}>Скасувати</button>
          <button className="btn" type="button" onClick={save}>Зберегти</button>
        </div>
      </div>
    </Modal>
  );
};
export default SystemEditor;
