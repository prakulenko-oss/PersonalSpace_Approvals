import { useState } from 'react';
import type { Actions } from '../App';
import {
  FUNCS, STREAMS, SUPPORT, UNITS, XCLS, coverage, daysTo, dispState, execById, fmtDate,
  getCell, initials, monogram, personById,
} from '../model';
import type { AppState, System } from '../types';
import { IcArrowL, IcInfo, IcPencil, IcShieldOk } from '../icons';

type Tab = 'all' | 'team' | 'case' | 'attrs';

const Passport = ({ state, sys, actions, onBack }: {
  state: AppState; sys: System; actions: Actions; onBack: () => void;
}) => {
  const [tab, setTab] = useState<Tab>('all');
  const [caseEdit, setCaseEdit] = useState(false);
  const cov = coverage(state, sys.id);
  const d = daysTo(sys.contractEnd);
  const show = (t: Exclude<Tab, 'all'>) => tab === 'all' || tab === t;

  return (
    <>
      <button type="button" className="back-link" onClick={onBack}>
        <IcArrowL /> Повернутися назад
      </button>
      <div className="passport-head">
        <span className="mono lg">{monogram(sys.name)}</span>
        <div>
          <div className="eyebrow">Паспорт системи · {UNITS[sys.unit].name}</div>
          <h1>{sys.name}</h1>
          <div className="inline-tags">
            {sys.sox && <span className="badge blue">SOX</span>}
            {sys.saas && <span className="badge blue">SaaS</span>}
            <span className={`badge ${sys.status === 'sunset' ? 'amber' : 'green'}`}>
              {sys.status === 'sunset' ? 'На виведенні' : 'Активна'}
            </span>
            <span className="badge muted">{SUPPORT[sys.support]}{sys.partner ? ` · ${sys.partner}` : ''}</span>
          </div>
        </div>
        <button type="button" className="ghost" onClick={() => actions.openSystem(sys.id)}>
          <IcPencil /> Редагувати атрибути
        </button>
      </div>
      <div className="owner-strip">
        <IcShieldOk sz={17} />
        <strong>Відповідальний — наш департамент</strong>
        <span>Партнери та суміжні домени виконують окремі функції, але не перебирають відповідальність.</span>
      </div>
      <div className="detail-tabs">
        {(([['all', 'Повна картина'], ['team', 'Команда та ролі'], ['case', 'Захищений кейс'], ['attrs', 'Атрибути']]) as [Tab, string][]).map(([id, name]) => (
          <button key={id} type="button" className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{name}</button>
        ))}
      </div>
      <div className="passport-grid">
        <div className="passport-main">
          {show('team') && (
            <section className="panel">
              <div className="section-head"><div>
                <h2>Команда та відповідальність</h2>
                <p>Виконавці й резерв для кожної функції</p>
              </div></div>
              <div className="team-table">
                <div className="team-head"><span>РОЛЬ / ФУНКЦІЯ</span><span>ХТО ВИКОНУЄ</span><span>РЕЗЕРВ</span><span /></div>
                {state.roles.map((r) => {
                  const c = getCell(state, sys.id, r.id);
                  const ds = dispState(c);
                  const backup = c.b ? personById(state, c.b) : undefined;
                  return (
                    <div key={r.id} className="team-row">
                      <div><strong>{r.name}</strong><small>{FUNCS[r.func || 'fsup']}</small></div>
                      <div>
                        {ds === 'filled' ? (
                          <div className="names">
                            {c.p.map((pid) => {
                              const p = personById(state, pid);
                              return p ? (
                                <span key={pid} className="person-tag"><i>{initials(p.name)}</i>{p.name}</span>
                              ) : null;
                            })}
                            {c.x.map((xid) => {
                              const x = execById(state, xid);
                              return x ? <span key={xid} className={`chip ${XCLS[x.type]}`}>{x.name}</span> : null;
                            })}
                          </div>
                        ) : ds === 'vacant' ? <span className="badge red">Вакансія</span>
                          : ds === 'na' ? <span className="mut sm">не потрібно</span>
                          : <span className="badge muted">Не розібрано</span>}
                      </div>
                      <div>
                        {ds === 'filled' && c.p.length ? (
                          backup ? (
                            <span className="reserve-name"><IcShieldOk sz={13} />{backup.name}</span>
                          ) : <span className="badge amber">Без резерву</span>
                        ) : <span className="mut">—</span>}
                      </div>
                      <button type="button" className="icon-button" aria-label={`Редагувати ${r.name}`}
                              onClick={() => actions.openCell(sys.id, r.id)}>
                        <IcPencil />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="panel-note">
                <IcInfo /> Призначення показує відповідальність, а не доступність чи достатність ресурсу. Резерв — хто підхопить функцію за відсутності основного виконавця.
              </div>
            </section>
          )}
          {show('case') && (
            <section className="panel">
              <div className="section-head">
                <div>
                  <h2>Захищений кейс</h2>
                  <p>Які люди та ролі були погоджені — без втрати контексту</p>
                </div>
                <button type="button" className="text-button" onClick={() => setCaseEdit(!caseEdit)}>
                  <IcPencil /> {caseEdit ? 'Закрити' : 'Редагувати'}
                </button>
              </div>
              {caseEdit ? (
                <div className="case-form">
                  <label>
                    Опис погодженого складу
                    <textarea id="caseText" rows={5} defaultValue={sys.caseText} />
                  </label>
                  <label>
                    Посилання на кейс
                    <input id="caseUrl" type="url" placeholder="https://…" defaultValue={sys.caseUrl} />
                  </label>
                  <div>
                    <button type="button" className="btn" onClick={() => {
                      const text = (document.getElementById('caseText') as HTMLTextAreaElement).value;
                      const url = (document.getElementById('caseUrl') as HTMLInputElement).value;
                      actions.saveCase(sys.id, text, url);
                      setCaseEdit(false);
                    }}>Зберегти кейс</button>
                  </div>
                </div>
              ) : (
                <div className="case-body">
                  <div><span className={`badge ${sys.caseText ? 'green' : 'muted'}`}>{sys.caseText ? 'Кейс зафіксовано' : 'Кейс не зафіксовано'}</span></div>
                  {sys.caseText
                    ? <p style={{ whiteSpace: 'pre-wrap' }}>{sys.caseText}</p>
                    : <p className="mut">Опишіть, який склад і які ролі були погоджені для цієї системи, — і контекст рішення не загубиться.</p>}
                  {sys.caseUrl && <p><a href={sys.caseUrl} target="_blank" rel="noopener noreferrer">Відкрити погоджений кейс</a></p>}
                </div>
              )}
            </section>
          )}
          {show('attrs') && sys.note && (
            <section className="panel">
              <div className="section-head"><div><h2>Нотатка</h2></div></div>
              <div className="case-body"><p style={{ whiteSpace: 'pre-wrap' }}>{sys.note}</p></div>
            </section>
          )}
        </div>
        <div className="passport-side">
          <section className="panel">
            <div className="section-head"><div><h2>Атрибути</h2></div></div>
            <div className="attr-list">
              <div><span>Відділ</span><span>{UNITS[sys.unit].name}</span></div>
              <div><span>Стрім стратегії</span><span>{STREAMS[sys.stream]}</span></div>
              <div><span>Модель підтримки</span><span>{SUPPORT[sys.support]}{sys.partner ? ` · ${sys.partner}` : ''}</span></div>
              <div><span>Покриття ролей</span><span>{cov.covered} / {cov.total}</span></div>
            </div>
          </section>
          <section className="panel">
            <div className="section-head"><div><h2>Договір</h2></div></div>
            <div className="attr-list">
              <div><span>Діє до</span><span>{sys.contractEnd ? fmtDate(sys.contractEnd) : '—'}</span></div>
              {d !== null && (
                <div><span>Залишилось</span>
                  <span>{d < 0 ? <span className="badge red">прострочено {-d} дн.</span>
                    : d <= 120 ? <span className="badge amber">{d} дн.</span> : `${d} дн.`}</span>
                </div>
              )}
              <div><span>Гранична сума</span><span>{sys.contractCap || '—'}</span></div>
              <div><span>Посилання</span><span>{sys.contractUrl ? <a href={sys.contractUrl} target="_blank" rel="noopener noreferrer">договір</a> : '—'}</span></div>
            </div>
            <div className="panel-note">Договірні поля редагуються в атрибутах системи; фід договорів оновлює їх масово.</div>
          </section>
        </div>
      </div>
    </>
  );
};
export default Passport;
