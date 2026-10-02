// @ts-nocheck
import { useState } from 'react';
import { Bell, BellRing, Check, Clock, Download, FileText, FileX2, HeartHandshake, MessageCircle, RotateCcw, Search, Send, Undo2, Wallet } from 'lucide-react';
import { Card, CardTitle, GhostButton, IconBubble, Pill, PrimaryButton, T, TONE, Timeline, type TimelineStep } from './ui';
import { DECISION_DAYS, DEMO, DEMO_TODAY, HISTORY, addWorkdays, draftFigures, fmtDate, pluralMonths, uah } from './loanData';

/* ───── Вертикальний таймлайн (архівні стани) ───── */
function VTimeline({ steps }) {
  return (
    <ol style={{ margin: '24px 0 0', padding: 0, listStyle: 'none' }}>
      {steps.map((s, i) => {
        const st = TONE[s.tone]; const last = i === steps.length - 1;
        return (
          <li key={s.title} style={{ position: 'relative', display: 'grid', gridTemplateColumns: '40px 1fr', gap: 16, paddingBottom: last ? 0 : 24 }}>
            {!last && <span style={{ position: 'absolute', top: 40, bottom: 0, left: 19, width: 2, borderRadius: 999, background: s.state === 'done' ? T.mint : T.line }} />}
            <span className={s.state === 'current' ? 'ks-pulse-ring' : ''} style={{ position: 'relative', zIndex: 1, display: 'grid', width: 40, height: 40, placeItems: 'center', borderRadius: '50%', background: s.state === 'waiting' ? '#fff' : st.bg, color: st.fg, border: s.state === 'waiting' ? '2px dashed #c9d6e4' : 'none' }}>
              {s.state === 'done' ? <Check size={18} strokeWidth={2.6} /> : s.state === 'current' ? <Search size={17} strokeWidth={2.3} /> : <Clock size={16} strokeWidth={2.2} />}
            </span>
            <div style={{ paddingTop: 4 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 12px' }}><p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.ink }}>{s.title}</p><span style={{ fontSize: 12.5, fontWeight: 600, color: T.muted }}>{s.when}</span></div>
              <p style={{ margin: '4px 0 0', fontSize: 13.5, lineHeight: 1.4, color: T.muted }}>{s.caption}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function RequestCard({ draft, stage }) {
  const { monthly } = draftFigures(draft);
  const rows = [['Сума', uah(draft.amount)], ['Строк', `${draft.months} ${pluralMonths(draft.months)}`], ['Щомісяця', uah(monthly)], ['Мета', draft.purpose || 'Не вказано'], ['Подано', fmtDate(DEMO_TODAY)]];
  return (
    <Card delay={220}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <IconBubble Icon={FileText} tone={stage === 'pending' ? 'blue' : 'grey'} />
        <div><p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: T.navy }}>Заявка KS-0412</p><p style={{ margin: 0, fontSize: 12.5, color: T.muted }}>{stage === 'pending' ? 'На розгляді' : 'Розгляд завершено'}</p></div>
      </div>
      <dl style={{ margin: '16px 0 0' }}>
        {rows.map(([l, v]) => <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', fontSize: 13.5, borderTop: `1px solid ${T.line}` }}><dt style={{ color: T.muted }}>{l}</dt><dd style={{ margin: 0, textAlign: 'right', fontWeight: 700, color: T.ink }}>{v}</dd></div>)}
      </dl>
    </Card>
  );
}

function PendingStatus() {
  const deadline = addWorkdays(DEMO_TODAY, DECISION_DAYS);
  const steps = [
    { title: 'Заявку отримали', caption: 'Усе заповнено правильно — додатково нічого не потрібно.', when: `${fmtDate(DEMO_TODAY)}, 10:24`, tone: 'mint', state: 'done' },
    { title: 'Перевіряємо умови', caption: 'Колеги з фінансового відділу переглядають стаж і ліміт програми.', when: 'зараз', tone: 'blue', state: 'current' },
    { title: 'Рішення', caption: 'Повідомимо в порталі й на пошту одразу, щойно буде відповідь.', when: `до ${fmtDate(deadline)}`, tone: 'grey', state: 'waiting' },
  ];
  return (
    <Card delay={140}>
      <CardTitle title="Заявка на розгляді" caption={`Зазвичай це займає до ${DECISION_DAYS} робочих днів. Можна видихнути — ми все зробимо.`} />
      <div style={{ marginTop: 20, borderRadius: 16, padding: 16, background: T.blue050 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: T.blueText }}><span>День 1 з {DECISION_DAYS}</span><span>Очікуємо до {fmtDate(deadline)}</span></div>
        <span style={{ marginTop: 10, display: 'block', height: 8, overflow: 'hidden', borderRadius: 999, background: '#fff' }}><span className="ks-shimmer" style={{ display: 'block', height: '100%', width: '20%', borderRadius: 999, background: T.blue }} /></span>
      </div>
      <VTimeline steps={steps} />
    </Card>
  );
}

function RejectedStatus({ onNew }) {
  const [remind, setRemind] = useState(false);
  const steps = [
    { title: 'Заявку отримали', caption: 'Дякуємо, що звернулися.', when: fmtDate(DEMO_TODAY), tone: 'mint', state: 'done' },
    { title: 'Перевірили умови', caption: 'Уважно переглянули заявку й умови програми.', when: fmtDate(addWorkdays(DEMO_TODAY, 2)), tone: 'mint', state: 'done' },
    { title: 'Цього разу — не вийшло', caption: 'Причину й наступні кроки пояснили нижче.', when: fmtDate(addWorkdays(DEMO_TODAY, 3)), tone: 'yellow', state: 'done' },
  ];
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <Card delay={140}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <IconBubble Icon={HeartHandshake} tone="yellow" size={48} />
          <div><h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: T.navy }}>Розуміємо, це не та відповідь, на яку ви чекали</h2><p style={{ margin: '4px 0 0', fontSize: 14, lineHeight: 1.5, color: '#4a5b71' }}>Рішення стосується лише умов програми, а не вас особисто. І ми не зникаємо — ось що можна зробити.</p></div>
        </div>
        <div style={{ marginTop: 20, borderRadius: 16, padding: 16, background: T.yellow050, border: '1px solid #fbe9a6' }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: T.yellowText }}>Причина</p>
          <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600, lineHeight: 1.4, color: T.ink }}>{DEMO.rejectReason}</p>
        </div>
        <VTimeline steps={steps} />
      </Card>
      <Card delay={220}>
        <CardTitle title="Що можна зробити далі" />
        <div className="ks-grid-2" style={{ marginTop: 16, gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ borderRadius: 16, padding: 16, background: '#f8fafc' }}>
            <IconBubble Icon={remind ? BellRing : Bell} tone={remind ? 'mint' : 'blue'} size={36} />
            <p style={{ margin: '12px 0 0', fontSize: 14.5, fontWeight: 700, color: T.ink }}>Подати знову з {fmtDate(DEMO.rejectAfter)}</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: T.muted }}>Тоді умова стажу буде виконана. Можемо нагадати.</p>
            <button type="button" onClick={() => setRemind(v => !v)} style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', ...(remind ? { background: T.mint050, color: T.mintText, border: 'none' } : { background: '#fff', color: T.navy, border: `1px solid ${T.line}` }) }}>
              {remind ? <><Check size={15} /> Нагадаємо {fmtDate(DEMO.rejectAfter)}</> : <><Bell size={15} /> Нагадати мені</>}
            </button>
          </div>
          <div style={{ borderRadius: 16, padding: 16, background: '#f8fafc' }}>
            <IconBubble Icon={MessageCircle} tone="blue" size={36} />
            <p style={{ margin: '12px 0 0', fontSize: 14.5, fontWeight: 700, color: T.ink }}>Поговорити з HR-партнером</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: T.muted }}>Підкажемо інші програми підтримки, які можуть підійти саме зараз.</p>
            <span style={{ marginTop: 12, display: 'inline-block' }}><GhostButton><MessageCircle size={15} /> Написати</GhostButton></span>
          </div>
        </div>
        <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <PrimaryButton onClick={onNew}><RotateCcw size={16} /> Подати нову заявку</PrimaryButton>
          <span style={{ fontSize: 12.5, color: T.muted }}>Якщо обставини змінились — це можна зробити будь-коли</span>
        </div>
      </Card>
    </div>
  );
}

export function ReviewStage({ stage, draft, onNew }) {
  return (
    <div className="ks-grid-2" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
      {stage === 'pending' ? <PendingStatus /> : <RejectedStatus onNew={onNew} />}
      <div style={{ display: 'grid', gap: 20 }}>
        <RequestCard draft={draft} stage={stage} />
        {stage === 'pending' && (
          <Card delay={300}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <IconBubble Icon={Undo2} tone="grey" size={36} />
              <div>
                <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: T.ink }}>Передумали або щось змінилось?</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: T.muted }}>Заявку можна відкликати до рішення — без пояснень.</p>
                <button type="button" onClick={onNew} style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: T.blue, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}>Відкликати заявку →</button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ───── Історія ───── */
export type CurrentApplication = { title: string; amount: number; caption: string; status: string; tone: any; steps: TimelineStep[] };

export function HistoryCard({ current }: { current?: CurrentApplication | null }) {
  return (
    <Card delay={120} style={{ padding: 0, overflow: 'hidden' }}>
      {current && (
        <div style={{ padding: '20px 24px', background: 'linear-gradient(180deg,#f7fbff 0%,#ffffff 100%)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', minWidth: 0, alignItems: 'center', gap: 14 }}>
              <IconBubble Icon={Send} tone="blue" size={42} />
              <div style={{ minWidth: 0 }}><p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.ink }}>{current.title} · {uah(current.amount)}</p><p style={{ margin: 0, fontSize: 13, color: T.muted }}>{current.caption}</p></div>
            </div>
            <Pill tone={current.tone} bold>{current.status}</Pill>
          </div>
          <Timeline steps={current.steps} />
        </div>
      )}
      {HISTORY.map((item, i) => {
        const closed = item.status === 'closed';
        return (
          <div key={item.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) 130px minmax(0,1.3fr) 130px', alignItems: 'center', gap: 16, padding: '16px 24px', borderTop: i === 0 && !current ? 'none' : `1px solid ${T.line}` }}>
            <div style={{ display: 'flex', minWidth: 0, alignItems: 'center', gap: 14 }}>
              <IconBubble Icon={item.kind === 'loan' ? Wallet : FileX2} tone={closed ? 'mint' : 'grey'} size={42} />
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 15, fontWeight: 700, color: T.ink }}>{item.title} · {uah(item.amount)}</p>
                <p style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 13, color: T.muted }}>{item.id} · {item.period}</p>
              </div>
            </div>
            <span><Pill tone={closed ? 'mint' : 'grey'} bold>{item.statusLabel}</Pill></span>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.4, color: T.muted }}>{item.note}</p>
            <button type="button" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, justifySelf: 'end', borderRadius: 10, background: '#fff', padding: '8px 16px', fontSize: 13, fontWeight: 700, border: `1px solid ${T.cardLine}`, color: T.navy, cursor: 'pointer', fontFamily: 'inherit' }}>
              {closed ? <><Download size={15} /> Довідка</> : <><FileText size={15} /> Деталі</>}
            </button>
          </div>
        );
      })}
    </Card>
  );
}
