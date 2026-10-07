const M: Record<string, [string, string]> = {
  m2: ['Модуль 2: завантаженість',
    'Перспективна завантаженість людей: скільки ролей і систем на кожному, план відпусток і ротацій, сигнали перевантаження та bus-фактора. Спиратиметься на призначення з Модуля 1.'],
  m3: ['Модуль 3: договори та оплати',
    'Реєстр договорів по системах: терміни, граничні суми, статуси оплат, нагадування про подовження. Стартові поля (дата, сума, посилання на BPMS) вже є в довіднику систем.'],
};
const StubView = ({ nav }: { nav: 'm2' | 'm3' }) => {
  const [title, text] = M[nav];
  return (
    <div className="panel stub">
      <h2 style={{ fontSize: 16, margin: '0 0 8px' }}>{title}</h2>
      <p className="mut" style={{ margin: '0 0 12px' }}>{text}</p>
      <span className="chip c-mut">У розробці</span>
    </div>
  );
};
export default StubView;
