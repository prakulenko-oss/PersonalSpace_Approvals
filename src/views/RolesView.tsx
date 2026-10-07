import type { Actions } from '../App';
import { FUNCS } from '../model';
import type { AppState } from '../types';

const RolesView = ({ state, actions }: { state: AppState; actions: Actions }) => {
  const usage = (roleId: string) =>
    Object.keys(state.cells).filter((k) => k.split('|')[1] === roleId).length;
  return (
    <>
      <div className="toolbar">
        <span className="mut sm">Словник ролей: порядок визначає колонки матриці та рядки на картках (у межах функції).</span>
        <span className="grow" />
        <button className="ghost" type="button" onClick={() => actions.openRoleEditor(null)}>+ Додати роль</button>
      </div>
      <div className="mxwrap">
        <table className="tbl">
          <thead>
            <tr><th style={{ width: 36 }} /><th>Назва</th><th>Коротко</th><th>Функція</th><th className="num">Використань</th><th style={{ width: 90 }} /></tr>
          </thead>
          <tbody>
            {state.roles.map((r, i) => (
              <tr key={r.id} onClick={() => actions.openRoleEditor(r.id)}>
                <td className="mut sm">{i + 1}</td>
                <td><b style={{ fontWeight: 500 }}>{r.name}</b></td>
                <td className="mut sm">{r.short}</td>
                <td className="sm"><span className="chip c-mut">{FUNCS[r.func || 'fsup']}</span></td>
                <td className="num sm">{usage(r.id)}</td>
                <td>
                  <span style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button className="ghost sm" type="button" title="Вище"
                            onClick={(e) => { e.stopPropagation(); actions.moveRole(r.id, -1); }}>↑</button>
                    <button className="ghost sm" type="button" title="Нижче"
                            onClick={(e) => { e.stopPropagation(); actions.moveRole(r.id, 1); }}>↓</button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
export default RolesView;
