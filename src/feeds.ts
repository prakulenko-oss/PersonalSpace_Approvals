import { uid } from './model';
import type { AppState, Person, UnitId } from './types';

/** Результат застосування фіда. */
export interface FeedReport {
  title: string;
  lines: string[];
}

const UNIT_BY_NAME: Record<string, UnitId> = {
  'відділ управління фінансовими системами': 'fin',
  'відділ автоматизації операційних процесів': 'auto',
  'відділ управління операційними системами': 'ops',
  'технічна дирекція': 'td',
};

const normName = (s: string) => (s || '').trim().replace(/\s+/g, ' ').toLowerCase();
const shortName = (s: string) => (s || '').trim().split(/\s+/).slice(0, 2).join(' ');

function toUnit(v: unknown): UnitId | null {
  const s = String(v ?? '').trim();
  if (s === 'fin' || s === 'auto' || s === 'ops' || s === 'td') return s;
  return UNIT_BY_NAME[s.toLowerCase()] ?? null;
}

function toTypeFlag(row: Record<string, unknown>): { type: string; flag: string } {
  const raw = String(row.status ?? row['Статус працівника'] ?? row.type ?? '').trim();
  if (!raw) {
    return { type: String(row.type ?? 'штат'), flag: String(row.flag ?? '') };
  }
  const type = raw.includes('ГІГ') ? 'ГІГ' : 'штат';
  let flag = String(row.flag ?? '');
  if (!flag) {
    if (raw.toLowerCase().includes('відпустка')) flag = 'відпустка';
    if (raw.toLowerCase().includes('військов')) flag = 'військова служба';
  }
  return { type, flag };
}

/** Фід людей: {people:[...]} або просто масив. Поля гнучкі (укр. заголовки теж). */
export function applyPeopleFeed(state: AppState, raw: unknown): { next: AppState; report: FeedReport } {
  const arr: Record<string, unknown>[] = Array.isArray(raw)
    ? raw as Record<string, unknown>[]
    : (raw && typeof raw === 'object' && Array.isArray((raw as { people?: unknown }).people))
      ? (raw as { people: Record<string, unknown>[] }).people
      : [];
  if (!arr.length) {
    return { next: state, report: { title: 'Фід людей', lines: ['У файлі не знайдено списку people.'] } };
  }
  const next = structuredClone(state);
  const byId = new Map(next.people.map((p) => [p.id, p]));
  const byName = new Map(next.people.map((p) => [normName(shortName(p.name)), p]));
  const added: string[] = [];
  let updated = 0;
  const seen = new Set<string>();

  arr.forEach((row) => {
    const nameRaw = String(row.name ?? row["Прізвище, ім'я, по-батькові"] ?? '').trim();
    if (!nameRaw) return;
    const name = shortName(nameRaw);
    const unit = toUnit(row.unit ?? row['Назва підрозділу']) ?? 'fin';
    const { type, flag } = toTypeFlag(row);
    const grade = String(row.grade ?? row['Грейд посади'] ?? '').trim();
    const title = String(row.title ?? row['Нова корпоративна назва'] ?? row['Корпоративна назва'] ?? '').trim();
    const lead = !!row.lead || String(row['Підрозділ, посада'] ?? '').includes('Начальник');

    const id = String(row.id ?? '').trim();
    let target: Person | undefined = id ? byId.get(id) : undefined;
    if (!target) target = byName.get(normName(name));

    if (target) {
      const before = JSON.stringify([target.name, target.unit, target.grade, target.type, target.flag, target.title, !!target.lead]);
      target.name = name; target.unit = unit; target.grade = grade;
      target.type = type; target.flag = flag; target.title = title;
      if (lead) target.lead = true;
      if (JSON.stringify([target.name, target.unit, target.grade, target.type, target.flag, target.title, !!target.lead]) !== before) updated++;
      seen.add(target.id);
    } else {
      const p: Person = { id: id || uid('p'), name, unit, grade, type, flag, title, ...(lead ? { lead: true } : {}) };
      next.people.push(p);
      added.push(name);
      seen.add(p.id);
    }
  });

  const missing = next.people.filter((p) => !seen.has(p.id)).map((p) => p.name);
  const lines = [
    `У фіді: ${arr.length} записів.`,
    `Додано нових: ${added.length}${added.length ? ` (${added.join(', ')})` : ''}.`,
    `Оновлено полів у наявних: ${updated}.`,
  ];
  if (missing.length) {
    lines.push(`Є в кокпіті, але немає у фіді (${missing.length}): ${missing.join(', ')}. Нікого не видалено — перевірте вручну.`);
  }
  return { next, report: { title: 'Фід людей застосовано', lines } };
}

/** Фід договорів: {items:[{system, contractEnd?, contractCap?, contractUrl?}]} або масив. */
export function applyContractsFeed(state: AppState, raw: unknown): { next: AppState; report: FeedReport } {
  const arr: Record<string, unknown>[] = Array.isArray(raw)
    ? raw as Record<string, unknown>[]
    : (raw && typeof raw === 'object' && Array.isArray((raw as { items?: unknown }).items))
      ? (raw as { items: Record<string, unknown>[] }).items
      : [];
  if (!arr.length) {
    return { next: state, report: { title: 'Фід договорів', lines: ['У файлі не знайдено списку items.'] } };
  }
  const next = structuredClone(state);
  const updatedNames: string[] = [];
  const unmatched: string[] = [];

  arr.forEach((row) => {
    const key = String(row.system ?? row.systemId ?? row['Система'] ?? '').trim();
    if (!key) return;
    const sys = next.systems.find((s) => s.id === key)
      ?? next.systems.find((s) => s.name.toLowerCase() === key.toLowerCase());
    if (!sys) { unmatched.push(key); return; }
    let changed = false;
    (['contractEnd', 'contractCap', 'contractUrl'] as const).forEach((f) => {
      const v = row[f] ?? row[{ contractEnd: 'Дата закінчення', contractCap: 'Гранична сума', contractUrl: 'Посилання' }[f]];
      if (v !== undefined && String(v).trim() !== sys[f]) { sys[f] = String(v).trim(); changed = true; }
    });
    if (changed) updatedNames.push(sys.name);
  });

  const lines = [
    `У фіді: ${arr.length} записів.`,
    `Оновлено систем: ${updatedNames.length}${updatedNames.length ? ` (${updatedNames.join(', ')})` : ''}.`,
  ];
  if (unmatched.length) lines.push(`Не знайдено в довіднику систем: ${unmatched.join(', ')}.`);
  return { next, report: { title: 'Фід договорів застосовано', lines } };
}
