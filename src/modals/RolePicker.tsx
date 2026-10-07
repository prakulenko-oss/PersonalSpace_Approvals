import type { Actions } from '../App';
import { DISP_LABEL, FUNCS, FUNC_ORDER, dispState, execById, getCell, personById, surname } from '../model';
import type { AppState } from '../types';
import { Modal } from '../ui';

const RolePicker = ({ state, subjKind, id, sysId, fromKey, actions, onClose }: {
  state: AppState; subjKind: 'person' | 'exec'; id: string; sysId: string;
  fromKey: string | null; actions: Actions; onClose: () => void;
}) => {
  const subj = subjKind === 'exec' ? execById(state, id) : personById(state, id);
  const sys = state.systems.find((x) => x.id === sysId);
  if (!subj || !sys) return null;
  return (
    <Modal onClose={onClose}>
      <h3>{subj.name}</h3>
      <div className="msub">Система: {sys.name}{fromKey ? ' (перенесення)' : ''}. Оберіть роль:</div>
      {FUNC_ORDER.map((f) => {
        const roles = state.roles.filter((r) => (r.func || 'fsup') === f);
        if (!roles.length) return null;
        return (
          <div key={f}>
            <div className="fhdr" style={{ marginBottom: 5 }}>{FUNCS[f]}</div>
            {roles.map((r) => {
              const c = getCell(state, sysId, r.id);
              const ds = dispState(c);
              const hint = ds === 'filled'
                ? c.p.map((v) => { const pp = personById(state, v); return pp ? surname(pp.name) : '?'; })
                    .concat(c.x.map((v) => execById(state, v)?.name || '?')).join(', ')
                : ds !== 'unset' ? DISP_LABEL[ds] : '';
              return (
                <button key={r.id} type="button" className="ghost"
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}
                        onClick={() => {
                          (subjKind === 'exec' ? actions.assignExec : actions.assignPerson)(id, sysId, r.id, fromKey);
                          onClose();
                        }}>
                  <span>{r.name}</span><span className="mut sm">{hint}</span>
                </button>
              );
            })}
          </div>
        );
      })}
      <div className="mactions">
        <div className="right"><button className="ghost" type="button" onClick={onClose}>Скасувати</button></div>
      </div>
    </Modal>
  );
};
export default RolePicker;
