import type { Actions } from '../App';
import { UNITS, UNIT_ORDER, personLoad } from '../model';
import type { AppState } from '../types';

const PeopleView: React.FC<{ state: AppState; actions: Actions }> = ({ state, actions }) => {
  const load = personLoad(state);
  return (
    <>
      <div className="toolbar">
        <span className="mut sm">Людей у домені: {state.people.length}</span>
        <span className="grow" />
        <button className="ghost" type="button" onClick={() => actions.openPerson(null)}>+ Додати людину</button>
      </div>
      <div className="mxwrap">
        <table className="tbl">
          <thead>
            <tr><th>Прізвище, ім’я</th><th>Грейд</th><th>Тип</th><th>Посада</th><th>Призначення</th></tr>
          </thead>
          <tbody>
            {UNIT_ORDER.flatMap((u) => {
              const list = state.people.filter((p) => p.unit === u);
              if (!list.length) return [];
              return [
                <tr key={`g-${u}`} className="grp" style={{ ['--uc' as string]: `var(--unit-${u})` }}>
                  <td colSpan={5}>{UNITS[u].full} ({list.length})</td>
                </tr>,
                ...list.map((p) => {
                  const asg = load[p.id] || [];
                  const bySys: Record<string, string[]> = {};
                  asg.forEach((a) => {
                    const role = state.roles.find((r) => r.id === a.roleId);
                    (bySys[a.sysId] ||= []).push(role ? role.short || role.name : a.roleId);
                  });
                  return (
                    <tr key={p.id} onClick={() => actions.openPerson(p.id)}>
                      <td>
                        <b style={{ fontWeight: 500 }}>{p.name}</b>
                        {p.lead && <> <span className="chip c-mut">керівник</span></>}
                        {p.flag && <> <span className="chip c-biz">{p.flag}</span></>}
                      </td>
                      <td className="sm">{p.grade}</td>
                      <td className="sm">{p.type}</td>
                      <td className="mut sm">{p.title}</td>
                      <td>
                        {Object.keys(bySys).length ? (
                          <span className="assign-chips">
                            {Object.entries(bySys).map(([sid, roles]) => {
                              const s = state.systems.find((x) => x.id === sid);
                              return <span key={sid} className="chip c-mut">{s ? s.name : sid}: {roles.join(', ')}</span>;
                            })}
                          </span>
                        ) : <span className="mut sm">немає призначень</span>}
                      </td>
                    </tr>
                  );
                }),
              ];
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};
export default PeopleView;
