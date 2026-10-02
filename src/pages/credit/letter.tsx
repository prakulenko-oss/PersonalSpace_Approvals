// @ts-nocheck
import { useRef, useState } from 'react';
import { CheckCircle2, FileCheck2, Info, Mail, Paperclip, Send, UploadCloud, UserCheck, X } from 'lucide-react';
import { Card, CardTitle, Chip, IconBubble, PrimaryButton, T } from './ui';
import { APPROVAL_ACCEPT, EMPLOYEE, HR_EMAIL, LOAN_MAX, LOAN_MIN, PAY_DAY, PURPOSES, draftFigures, fmtDateFull, pluralMonths, uah } from './loanData';

export type Attachment = { name: string; size: number };
export type SentLetter = { draft: any; files: Attachment[]; sentAt: Date };

const fileSize = b => (b < 1024 ? `${b} Б` : b < 1024 * 1024 ? `${Math.round(b / 1024)} КБ` : `${(b / 1024 / 1024).toFixed(1)} МБ`);
export const letterSubject = () => `Заява на безвідсоткову позику — ${EMPLOYEE.short}, таб. № ${EMPLOYEE.tabNumber}`;

function letterRows(draft) {
  const { monthly } = draftFigures(draft);
  return [
    ['ПІБ', EMPLOYEE.fullName], ['Табельний номер', EMPLOYEE.tabNumber], ['Посада', EMPLOYEE.position], ['Підрозділ', EMPLOYEE.department], ['Керівник', EMPLOYEE.manager],
    ['Сума позики', uah(draft.amount)], ['Строк', `${draft.months} ${pluralMonths(draft.months)}`], ['Щомісячний платіж', uah(monthly)], ['Мета', draft.purpose || '—'], ['Коментар', draft.note.trim() || '—'],
  ];
}

/** Попередній перегляд листа — однаковий у формі й у надісланому вигляді */
function LetterPreview({ draft, files }) {
  const hdr = (l, v, bold = 600, c = T.ink) => (
    <p style={{ margin: 0, display: 'flex' }}><span style={{ display: 'inline-block', width: 56, flexShrink: 0, color: T.muted }}>{l}</span><span style={{ fontWeight: bold, color: c }}>{v}</span></p>
  );
  return (
    <div style={{ overflow: 'hidden', borderRadius: 18, background: '#fff', border: `1px solid ${T.line}` }}>
      <div style={{ display: 'grid', gap: 6, padding: '16px 20px', fontSize: 13, background: '#f8fafc', borderBottom: `1px solid ${T.line}` }}>
        {hdr('Кому', HR_EMAIL)}{hdr('Копія', EMPLOYEE.managerEmail)}{hdr('Тема', letterSubject(), 700, T.navy)}
      </div>
      <div style={{ padding: '16px 20px', fontSize: 13.5, lineHeight: 1.6, color: T.ink }}>
        <p style={{ margin: 0 }}>Доброго дня!</p>
        <p style={{ margin: '8px 0 0' }}>Прошу надати мені безвідсоткову позику відповідно до Положення про безвідсоткові позики працівникам.</p>
        <dl style={{ margin: '12px 0 0', overflow: 'hidden', borderRadius: 12, border: `1px solid ${T.line}` }}>
          {letterRows(draft).map(([l, v], i) => (
            <div key={l} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 12, padding: '8px 14px', fontSize: 13, borderTop: i ? `1px solid ${T.line}` : 'none', background: i % 2 ? '#fbfcfe' : '#fff' }}>
              <dt style={{ color: T.muted }}>{l}</dt><dd style={{ margin: 0, fontWeight: 600, wordBreak: 'break-word' }}>{v}</dd>
            </div>
          ))}
        </dl>
        <p style={{ margin: '12px 0 0' }}>Погодження керівника додаю у вкладенні. З Положенням ознайомлена(-ий), зобов'язуюсь погашати позику щомісяця до {PAY_DAY} числа.</p>
        <p style={{ margin: '12px 0 0' }}>З повагою,<br />{EMPLOYEE.fullName}<br /><span style={{ color: T.muted }}>{EMPLOYEE.position}</span></p>
        <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {files.length ? files.map(f => (
            <span key={f.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '6px 12px', fontSize: 12.5, fontWeight: 600, background: T.blue050, color: T.blueText }}><Paperclip size={13} /> {f.name}</span>
          )) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '6px 12px', fontSize: 12.5, fontWeight: 600, background: '#f1f4f8', color: T.muted, border: '1px dashed #c9d6e4' }}><Paperclip size={13} /> Тут буде погодження керівника</span>
          )}
        </div>
      </div>
    </div>
  );
}

function AttachZone({ files, onAdd, onRemove }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  const take = list => { if (!list?.length) return; onAdd(Array.from(list).map(f => ({ name: f.name, size: f.size }))); };
  return (
    <div>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.ink }}>Погодження керівника</p>
      <button type="button" onClick={() => input.current?.click()}
        onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={e => { e.preventDefault(); setOver(false); take(e.dataTransfer.files); }}
        style={{ marginTop: 8, display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'center', gap: 6, borderRadius: 16, padding: '20px 16px', textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit', background: over ? T.blue050 : '#f8fafc', border: `1.5px dashed ${over ? T.blue : '#c9d6e4'}`, transition: 'all .2s' }}>
        <UploadCloud size={24} style={{ color: T.blue }} />
        <span style={{ fontSize: 13.5, fontWeight: 700, color: T.navy }}>Прикласти файл</span>
        <span style={{ fontSize: 12, color: T.muted }}>Лист від керівника (.msg, .eml), PDF або скрін · можна перетягнути сюди</span>
      </button>
      <input ref={input} type="file" multiple accept={APPROVAL_ACCEPT} style={{ display: 'none' }} aria-label="Прикласти погодження керівника" onChange={e => { take(e.target.files); e.target.value = ''; }} />
      {files.length > 0 && (
        <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
          {files.map(f => (
            <li key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 12, background: '#fff', padding: '10px 12px', border: '1px solid #bfeedd' }}>
              <FileCheck2 size={18} style={{ flexShrink: 0, color: T.mintText }} />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 13, fontWeight: 600, color: T.ink }}>{f.name}</span>
                <span style={{ fontSize: 11.5, color: T.muted }}>{fileSize(f.size)}</span>
              </span>
              <button type="button" onClick={() => onRemove(f.name)} aria-label={`Прибрати ${f.name}`} style={{ display: 'grid', width: 28, height: 28, placeItems: 'center', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: T.muted }}><X size={15} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Step({ index, done, title, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <span style={{ display: 'grid', width: 28, height: 28, flexShrink: 0, placeItems: 'center', borderRadius: '50%', fontSize: 12.5, fontWeight: 800, ...(done ? { background: T.mint, color: '#fff' } : { background: T.blue050, color: T.blueText }) }}>
        {done ? <CheckCircle2 size={16} /> : index}
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ margin: 0, paddingTop: 2, fontSize: 14, fontWeight: 700, color: T.ink }}>{title}</p>
        {children}
      </div>
    </div>
  );
}

/** Блок із автоматично сформованим листом у HR */
export function LetterComposer({ draft, onChange, onSend }) {
  const [files, setFiles] = useState<Attachment[]>([]);
  const amountOk = draft.amount >= LOAN_MIN && draft.amount <= LOAN_MAX;
  const ready = amountOk && draft.agree && files.length > 0;
  const missing = [!amountOk && 'перевірте суму в калькуляторі', !files.length && 'прикладіть погодження керівника', !draft.agree && 'погодьтесь з умовами'].filter(Boolean);

  return (
    <Card delay={0}>
      <div id="loan-letter" style={{ scrollMarginTop: 24 }} />
      <CardTitle title="Лист до HR" caption="Ми вже сформували лист з ваших даних і розрахунку. Залишилось додати погодження керівника й надіслати." />
      <div className="ks-grid-2" style={{ marginTop: 20, gridTemplateColumns: '1fr 1.1fr', gap: 24 }}>
        <div style={{ display: 'grid', gap: 20 }}>
          <Step index={1} done={files.length > 0} title="Погодьте кредит з керівником">
            <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.4, color: T.muted }}>Напишіть керівнику ({EMPLOYEE.manager}) у пошті чи Teams і збережіть відповідь — лист, PDF або скрін.</p>
          </Step>
          <Step index={2} done={files.length > 0} title="Прикладіть погодження">
            <div style={{ marginTop: 8 }}>
              <AttachZone files={files} onAdd={list => setFiles(c => [...c, ...list.filter(f => !c.some(x => x.name === f.name))])} onRemove={n => setFiles(c => c.filter(f => f.name !== n))} />
            </div>
          </Step>
          <Step index={3} done={draft.agree} title="Додайте деталі, якщо хочете">
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PURPOSES.map(p => <Chip key={p} active={draft.purpose === p} onClick={() => onChange({ purpose: draft.purpose === p ? '' : p })}>{p}</Chip>)}
            </div>
            <textarea value={draft.note} onChange={e => onChange({ note: e.target.value })} rows={2} placeholder="Коментар для HR — за бажанням"
              style={{ marginTop: 10, width: '100%', resize: 'none', borderRadius: 16, background: '#fff', padding: '12px 16px', fontSize: 14, outline: 'none', border: `1px solid ${T.line}`, color: T.ink, fontFamily: 'inherit' }} />
            <label style={{ marginTop: 10, display: 'flex', cursor: 'pointer', alignItems: 'flex-start', gap: 12, borderRadius: 16, padding: 14, background: draft.agree ? T.mint050 : '#f8fafc', border: `1px solid ${draft.agree ? '#bfeedd' : T.line}`, transition: 'all .2s' }}>
              <input type="checkbox" checked={draft.agree} onChange={e => onChange({ agree: e.target.checked })} style={{ marginTop: 2, width: 18, height: 18, flexShrink: 0, accentColor: T.blue }} />
              <span style={{ fontSize: 13, lineHeight: 1.4, color: T.ink }}>Ознайомлена(-ий) з <a href="#" onClick={e => e.preventDefault()} style={{ fontWeight: 700, color: T.blue }}>Положенням про безвідсоткові позики</a> і погашатиму кредит до {PAY_DAY} числа щомісяця.</span>
            </label>
          </Step>
          <div style={{ display: 'grid', gap: 10 }}>
            <PrimaryButton onClick={() => ready && onSend(files)} disabled={!ready}><Send size={16} /> Надіслати в HR</PrimaryButton>
            <p style={{ margin: 0, display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, lineHeight: 1.4, color: T.muted }}>
              <Info size={14} style={{ marginTop: 2, flexShrink: 0 }} />
              {missing.length ? `Ще трохи: ${missing.join(', ')}.` : 'Після надсилання HR підготує наказ і договір та напише вам на пошту.'}
            </p>
          </div>
        </div>
        <div>
          <p style={{ margin: '0 0 8px', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: T.blueText }}><Mail size={14} /> Так виглядатиме лист</p>
          <LetterPreview draft={draft} files={files} />
        </div>
      </div>
    </Card>
  );
}

/** Надісланий лист — показується в розгорнутому «Мій кредит» */
export function SentLetterCard({ letter, note }) {
  return (
    <div className="ks-grid-2b">
      <Card delay={0}>
        <IconBubble Icon={UserCheck} tone="mint" size={44} />
        <h3 style={{ margin: '16px 0 0', fontSize: 18, fontWeight: 800, color: T.navy }}>Заявку надіслано в HR</h3>
        <p style={{ margin: '4px 0 0', fontSize: 13.5, lineHeight: 1.5, color: '#4a5b71' }}>{fmtDateFull(letter.sentAt)} · {uah(letter.draft.amount)} на {letter.draft.months} {pluralMonths(letter.draft.months)}. Погодження керівника — у вкладенні.</p>
        {note && (
          <p style={{ margin: '16px 0 0', display: 'flex', alignItems: 'flex-start', gap: 8, borderRadius: 12, padding: '10px 12px', fontSize: 13, lineHeight: 1.4, background: '#f1f4f8', color: '#4a5b71' }}>
            <Info size={15} style={{ marginTop: 2, flexShrink: 0, color: T.blue }} />{note}
          </p>
        )}
      </Card>
      <LetterPreview draft={letter.draft} files={letter.files} />
    </div>
  );
}
