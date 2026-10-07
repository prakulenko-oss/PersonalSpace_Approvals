import type { Actions } from '../App';
import { XCLS, XTYPES, execUsage } from '../model';
import type { AppState } from '../types';

const ExecsView = ({ state, actions }: { state: AppState; actions: Actions }) => (
  <>
    <div className="toolbar">
      <span className="mut sm">Суміжні ІТ-домени, партнери та бізнес-підрозділи, які виконують функції по системах.</span>
      <span className="grow" />
      <button className="ghost" type="button" onClick={() => actions.openExec(null)}>+ Додати виконавця</button>
    </div>
    <div className="mxwrap">
      <table className="tbl">
        <thead>
          <tr><th>Назва</th><th>Тип</th><th className="num">Клітинок</th><th className="num">Систем</th><th>Нотатка</th></tr>
        </thead>
        <tbody>
          {state.execs.map((x) => {
            const u = execUsage(state, x.id);
            return (
              <tr key={x.id} onClick={() => actions.openExec(x.id)}>
                <td><span className={`chip ${XCLS[x.type]}`}>{x.name}</span></td>
                <td className="sm">{XTYPES[x.type]}</td>
                <td className="num sm">{u.cells}</td>
                <td className="num sm">{u.systems}</td>
                <td className="mut sm">{x.note}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </>
);
export default ExecsView;
