import { useRef } from 'react';
import type { DataSource } from '../types';

type Theme = 'auto' | 'light' | 'dark';

const SettingsView = ({
  theme, setTheme, source, fsOk, onOpenFile, onCreateFile, onDetach, onReconnect, onExport, onImport, onFeed,
}: {
  theme: Theme;
  setTheme: (t: Theme) => void;
  source: DataSource;
  fsOk: boolean;
  onOpenFile: () => void;
  onCreateFile: () => void;
  onDetach: () => void;
  onReconnect: () => void;
  onExport: () => void;
  onImport: () => void;
  onFeed: (kind: 'people' | 'contracts', raw: unknown) => void;
}) => {
  const peopleRef = useRef<HTMLInputElement>(null);
  const contractsRef = useRef<HTMLInputElement>(null);
  const readFeed = (kind: 'people' | 'contracts') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    f.text().then((t) => {
      try { onFeed(kind, JSON.parse(t)); }
      catch { onFeed(kind, null); }
    });
  };
  return (
  <div className="setgrid">
    <div className="panel">
      <h2 style={{ fontSize: 14.5, margin: '0 0 10px' }}>Тема інтерфейсу</h2>
      <div className="seg">
        {(([['auto', 'Авто'], ['light', 'Світла'], ['dark', 'Темна']]) as [Theme, string][]).map(([k, l]) => (
          <button key={k} type="button" className={theme === k ? 'on' : ''} onClick={() => setTheme(k)}>{l}</button>
        ))}
      </div>
      <p className="mut sm" style={{ margin: '6px 0 0' }}>«Авто» — за налаштуванням системи.</p>
    </div>

    <div className="panel">
      <h2 style={{ fontSize: 14.5, margin: '0 0 10px' }}>Джерело даних</h2>
      <p className="sm" style={{ margin: '0 0 10px' }}>
        Зараз: {source.mode === 'file'
          ? <b style={{ fontWeight: 600 }}>файл {source.name}{source.pending ? ' (не підключено)' : ''}</b>
          : <b style={{ fontWeight: 600 }}>localStorage браузера</b>}
      </p>
      {fsOk ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="ghost" type="button" onClick={onOpenFile}>Відкрити файл даних…</button>
          <button className="ghost" type="button" onClick={onCreateFile}>Створити файл даних…</button>
          {source.mode === 'file' && source.pending && (
            <button className="btn" type="button" onClick={onReconnect}>Підключити {source.name}</button>
          )}
          {source.mode === 'file' && (
            <button className="ghost" type="button" onClick={onDetach}>Відключити файл</button>
          )}
        </div>
      ) : (
        <p className="mut sm" style={{ margin: 0 }}>
          Цей браузер не підтримує роботу з локальними файлами (потрібен Chrome або Edge). Використовуйте імпорт/експорт нижче.
        </p>
      )}
      <p className="mut sm" style={{ margin: '10px 0 0' }}>
        Робота з файлом — спосіб тримати персональні дані (список колег) на своєму диску, а не в коді проєкту
        чи сховищі браузера. Файл в OneDrive дає бекап і версіонування корпоративними засобами.
      </p>
    </div>

    <div className="panel">
      <h2 style={{ fontSize: 14.5, margin: '0 0 10px' }}>Імпорт / експорт</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="ghost" type="button" onClick={onImport}>Імпорт JSON</button>
        <button className="ghost" type="button" onClick={onExport}>Експорт JSON</button>
      </div>
      <p className="mut sm" style={{ margin: '10px 0 0' }}>
        Формат сумісний з артефакт-версією кокпіта в claude.ai: «Експорт JSON» там → «Імпорт» тут (і навпаки).
        Старий формат даних розпізнається і мігрується автоматично.
      </p>
    </div>

    <div className="panel">
      <h2 style={{ fontSize: 14.5, margin: '0 0 10px' }}>Модулі кокпіта</h2>
      <p className="mut sm" style={{ margin: 0 }}>
        Модуль 1 — карта систем і відповідальностей (активний). Модуль 2 — перспективна завантаженість ресурсів.
        Модуль 3 — договори та статуси оплат. Спільні довідники: системи, люди, виконавці, ролі.
      </p>
    </div>
    <div className="panel">
      <h2 style={{ fontSize: 14.5, margin: '0 0 10px' }}>Фіди від агентів</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="ghost" type="button" onClick={() => peopleRef.current?.click()}>Оновити людей з файлу…</button>
        <button className="ghost" type="button" onClick={() => contractsRef.current?.click()}>Оновити договори з файлу…</button>
        <input ref={peopleRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={readFeed('people')} />
        <input ref={contractsRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={readFeed('contracts')} />
      </div>
      <p className="mut sm" style={{ margin: '10px 0 0' }}>
        Фід — окремий JSON, який формує агент (HR-список, вивантаження договорів з BPMS). Кокпіт мержить його
        в робочі дані і показує звіт: кого додано, що оновлено, чого не знайдено. Нічого не видаляється автоматично.
        Формати описано в README.
      </p>
    </div>
  </div>
  );
};
export default SettingsView;