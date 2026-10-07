import type { Actions } from '../App';
import {
  FUNCS, SUPPORT, UNITS, UNIT_ORDER, XCLS, XTYPES, daysTo, dispState, execUsage, fmtDate,
  gapsData, getCell, personLoad, rolesOrdered,
} from '../model';
import type { AppState, SupportId } from '../types';
import {
  IcAlert, IcArrowUR, IcChevR, IcHelp, IcJson, IcLayers, IcNet, IcPeople, IcShield, IcShieldOk,
} from '../icons';

const Overview = ({ state, actions }: { state: AppState; actions: Actions }) => {
  const g = gapsData(state);
  const parsed = g.applTotal ? Math.round((100 * (g.applTotal - g.unsetCount)) / g.applTotal) : 0;
  const counts = { filled: g.filledCount, vacant: g.vacancies.length, unset: g.unsetCount };
  const total = counts.filled + counts.vacant + counts.unset || 1;
  const load = personLoad(state);
  const unassigned = state.people.filter((p) => !(load[p.id] || []).length);
  const withC = state.systems
    .filter((s) => s.contractEnd)
    .map((s) => ({ s, d: daysTo(s.contractEnd) }))
    .sort((a, b) => (a.d ?? 1e9) - (b.d ?? 1e9));
  const unitsWithSystems = UNIT_ORDER.filter((u) => state.systems.some((s) => s.unit === u));

  const Signal = ({ tone, count, title, text, icon, onClick }: {
    tone: string; count: number; title: string; text: string; icon: React.ReactNode; onClick: () => void;
  }) => (
    <button type="button" className={`signal ${tone}`} onClick={onClick}>
      <span className="signal-icon">{icon}</span>
      <strong>{count}</strong>
      <h3>{title}</h3>
      <p>{text}</p>
    </button>
  );

  return (
    <>
      <div className="overview-banner">
        <div>
          <span className="eyebrow">Відповідальність без сліпих зон</span>
          <h2>Системи під контролем.<br /><span>Команда — у фокусі.</span></h2>
          <p>Спершу зрозуміти, де є прогалина.<br />Потім — обговорити рішення мовою фактів.</p>
          <button type="button" className="text-button" onClick={() => actions.goMap('matrix')}>
            Перейти до матриці відповідальності <IcArrowUR />
          </button>
        </div>
        <div className="orbit" aria-hidden="true">
          <div className="orbit-ring" />
          <div className="orbit-ring r2" />
          <span className="orbit-core"><IcNet /><b>ERM</b></span>
          <span className="orbit-node n1"><IcPeople /><span>Команда</span></span>
          <span className="orbit-node n2"><IcShieldOk sz={18} /><span>Відповідальність</span></span>
          <span className="orbit-node n3"><IcLayers /><span>Системи</span></span>
        </div>
        <div className="banner-inventory">
          <div><strong>{state.systems.length}</strong><span>систем у контурі</span></div>
          <div><strong>{unitsWithSystems.length}</strong><span>підрозділи</span></div>
          <div><strong>{state.people.length}</strong><span>людей у довіднику</span></div>
        </div>
      </div>

      <div className="overview-section-title">
        <h2>Потребує уваги</h2>
        <span>Призначення й резерв · не оцінка завантаженості</span>
      </div>
      <div className="signal-grid">
        <Signal tone="red" count={g.vacancies.length} title="Підтверджені вакансії"
          text="Відомо, яку роль потрібно закрити" icon={<IcAlert />}
          onClick={() => actions.goMap('matrix', { problem: 'vacant' })} />
        <Signal tone="amber" count={g.noBackupSystems} title="Системи без резерву"
          text="Є виконавець, але немає підстраховки" icon={<IcShield />}
          onClick={() => actions.goMap('matrix', { problem: 'nobackup' })} />
        <Signal tone="mut" count={g.noPO.length} title="Product Owner не визначено"
          text="Потрібно уточнити відповідальність" icon={<IcHelp />}
          onClick={() => actions.goMap('matrix', { problem: 'po' })} />
        <Signal tone="blue" count={g.unsetSystems} title="Системи з нерозібраними ролями"
          text="Спочатку уточнити, потім оцінювати" icon={<IcJson />}
          onClick={() => actions.goMap('matrix', { problem: 'unset' })} />
      </div>

      <div className="overview-grid">
        <section className="panel">
          <div className="section-head">
            <div>
              <h2>Прогалини, які варто обговорити</h2>
              <p>Підтверджені вакансії та виконавці без підстраховки</p>
            </div>
            <button type="button" className="text-button" onClick={() => actions.goMap('matrix', { problem: 'vacant' })}>
              Уся матриця <IcArrowUR sz={13} />
            </button>
          </div>
          {!g.vacancies.length && !g.noBackup.length && (
            <p className="mut sm" style={{ padding: '4px 24px 18px' }}>
              Підтверджених вакансій немає. Прогалини можуть ховатись у нерозібраних клітинках.
            </p>
          )}
          {g.vacancies.map(({ sys, role, note }) => (
            <button key={sys.id + role.id} type="button" className="priority-row" onClick={() => actions.openPassport(sys.id)}>
              <span className="priority-icon"><IcAlert /></span>
              <div>
                <strong>{sys.name}</strong>
                <p>{role.name} · {UNITS[sys.unit].name}</p>
                {note && <small>{note}</small>}
              </div>
              <span className="badge red">Вакансія</span>
              <IcChevR />
            </button>
          ))}
          {g.noBackup.slice(0, 4).map(({ sys, role }) => (
            <button key={'b' + sys.id + role.id} type="button" className="priority-row" onClick={() => actions.openPassport(sys.id)}>
              <span className="priority-icon amber"><IcShield /></span>
              <div>
                <strong>{sys.name} · {role.name}</strong>
                <p>{FUNCS[role.func]}</p>
                <small>Одна точка залежності — привід уточнити план підстрахування.</small>
              </div>
              <span className="badge amber">Без резерву</span>
              <IcChevR />
            </button>
          ))}
          {g.noBackup.length > 4 && (
            <div className="panel-note">Ще {g.noBackup.length - 4} призначень без резерву — повний список у матриці за фільтром «без резерву».</div>
          )}
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <h2>Наскільки картина уточнена</h2>
              <p>Повнота даних, а не здоров'я команди</p>
            </div>
          </div>
          <div className="clarity-number">
            {parsed}<span>%</span>
            <small>призначень уточнено</small>
          </div>
          <div className="stack-track">
            <i style={{ width: `${(100 * counts.filled) / total}%` }} />
            <i className="vacant" style={{ width: `${(100 * counts.vacant) / total}%` }} />
            <i className="unset" style={{ flex: 1 }} />
          </div>
          <div className="clarity-legend">
            <span><i className="dot" style={{ background: 'var(--ok)' }} />Виконується<b>{counts.filled}</b></span>
            <span><i className="dot" style={{ background: 'var(--gap)' }} />Вакансія<b>{counts.vacant}</b></span>
            <span><i className="dot" style={{ background: 'var(--unset)' }} />Не уточнено<b>{counts.unset}</b></span>
          </div>
          <p className="clarity-foot">Ролі «не потрібно» виключено з розрахунку.</p>
          <button type="button" className="ghost clarity-cta" onClick={() => actions.goMap('matrix', { problem: 'unset' })}>
            Уточнити призначення <IcArrowUR sz={13} />
          </button>
        </section>
      </div>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="section-head"><div><h2>Підрозділи — один контур відповідальності</h2></div></div>
        <div className="departments">
          {unitsWithSystems.map((u, i) => {
            const list = state.systems.filter((s) => s.unit === u);
            return (
              <button key={u} type="button" onClick={() => actions.goMap('matrix', { unit: u })}>
                <span className="department-number">0{i + 1}</span>
                <div>
                  <strong>{UNITS[u].name}</strong>
                  <small>{list.length} систем · {state.people.filter((p) => p.unit === u).length} людей</small>
                </div>
                <IcArrowUR />
              </button>
            );
          })}
        </div>
      </section>

      <div className="overview-grid even">
        <section className="panel">
          <div className="section-head"><div>
            <h2>Покриття за ролями</h2>
            <p>Закрито / вакансії / не розібрано по всіх системах</p>
          </div></div>
          <div className="rowlist">
            {rolesOrdered(state).map((r) => {
              let filled = 0, vac = 0, un = 0, na = 0;
              state.systems.forEach((s) => {
                const st = dispState(getCell(state, s.id, r.id));
                if (st === 'na') { na++; return; }
                if (st === 'filled') filled++;
                else if (st === 'vacant') vac++;
                else un++;
              });
              const tot = filled + vac + un || 1;
              return (
                <div key={r.id} className="rowitem">
                  <span style={{ minWidth: 118 }}>{r.name}</span>
                  <div className="stackbar" title={`закрито: ${filled}, вакансії: ${vac}, не розібрано: ${un}`}>
                    <i style={{ width: `${(100 * filled) / tot}%`, background: 'var(--ok)' }} />
                    <i style={{ width: `${(100 * vac) / tot}%`, background: 'var(--gap)' }} />
                    <i style={{ flex: 1, background: 'var(--unset)' }} />
                  </div>
                  <span className="sm mut" style={{ minWidth: 96, textAlign: 'right' }}>
                    {filled} / {vac} / {un}{na ? ` · н/п ${na}` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="section-head"><div>
            <h2>Розріз за виконавцями</h2>
            <p>Скільки систем і ролей на суміжних доменах, партнерах і бізнесі</p>
          </div></div>
          <div className="rowlist">
            {state.execs.length ? state.execs.map((x) => {
              const u = execUsage(state, x.id);
              return (
                <div key={x.id} className="rowitem">
                  <span><span className={`chip ${XCLS[x.type]}`}>{x.name}</span> <span className="mut sm">{XTYPES[x.type]}</span></span>
                  <span className="sm mut">{u.systems} систем · {u.cells} ролей</span>
                </div>
              );
            }) : <p className="mut sm" style={{ padding: '0 24px 16px' }}>Довідник виконавців порожній.</p>}
          </div>
        </section>
      </div>

      <div className="overview-grid even">
        <section className="panel">
          <div className="section-head"><div>
            <h2>Договори</h2>
            <p>Найближчі закінчення; прострочені — червоним</p>
          </div></div>
          <div className="rowlist">
            {withC.length ? withC.map(({ s, d }) => {
              const late = d !== null && d < 0;
              const soon = d !== null && d >= 0 && d <= 120;
              return (
                <div key={s.id} className="rowitem">
                  <span>
                    <button type="button" className="text-button" style={{ color: 'inherit', fontSize: 11.5 }} onClick={() => actions.openPassport(s.id)}>{s.name}</button>
                    <span className="mut sm"> до {fmtDate(s.contractEnd)}{s.contractCap ? ` · ${s.contractCap}` : ''}</span>
                  </span>
                  {late ? <span className="badge red">прострочено</span>
                    : soon ? <span className="badge amber">за {d} дн.</span>
                    : <span className="mut sm">за {d} дн.</span>}
                </div>
              );
            }) : <p className="mut sm" style={{ padding: '0 24px 16px' }}>Дати договорів ще не заповнені — вони додаються в картці системи.</p>}
          </div>
        </section>

        <section className="panel">
          <div className="section-head"><div>
            <h2>Команда і моделі підтримки</h2>
            <p>Сигнали довідника, без оцінки завантаженості</p>
          </div></div>
          <div className="rowlist">
            <div className="rowitem">
              <span>Люди без жодного призначення</span>
              <b style={{ fontWeight: 700 }}>{state.people.length ? unassigned.length : '—'}</b>
            </div>
            {(Object.keys(SUPPORT) as SupportId[]).map((k) => {
              const n = state.systems.filter((s) => s.support === k).length;
              return n ? (
                <div key={k} className="rowitem">
                  <span className="mut">{SUPPORT[k]}</span>
                  <b style={{ fontWeight: 700 }}>{n}</b>
                </div>
              ) : null;
            })}
          </div>
          {!state.people.length && (
            <div className="panel-note">Довідник людей порожній — підключіть файл даних у Налаштуваннях.</div>
          )}
        </section>
      </div>
    </>
  );
};
export default Overview;
