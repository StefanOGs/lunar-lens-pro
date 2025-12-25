// Rule-based Dream Analysis Engine
// Placeholder for future AI integration

import { DreamAnalysis, DreamAnalysisApproach } from '../types';

// Jung archetypes mapping
const JUNG_ARCHETYPES: Record<string, { archetype: string; meaning: string }> = {
  // Shadow
  'враг': { archetype: 'Shadow', meaning: 'Потиснати аспекти на себе си' },
  'чудовище': { archetype: 'Shadow', meaning: 'Неинтегрирана тъмна страна' },
  'преследвач': { archetype: 'Shadow', meaning: 'Избягвани емоции или страхове' },
  'крадец': { archetype: 'Shadow', meaning: 'Отнета енергия или ресурси' },
  'тъмнина': { archetype: 'Shadow', meaning: 'Неосъзнати части от психиката' },
  
  // Anima/Animus
  'жена': { archetype: 'Anima', meaning: 'Женски аспект на психиката' },
  'мъж': { archetype: 'Animus', meaning: 'Мъжки аспект на психиката' },
  'любов': { archetype: 'Anima/Animus', meaning: 'Интеграция на противоположностите' },
  'красавица': { archetype: 'Anima', meaning: 'Идеализиран женски образ' },
  
  // Self
  'мандала': { archetype: 'Self', meaning: 'Цялостност и интеграция' },
  'кръг': { archetype: 'Self', meaning: 'Завършеност' },
  'център': { archetype: 'Self', meaning: 'Ядрото на личността' },
  'светлина': { archetype: 'Self', meaning: 'Просветление' },
  
  // Persona
  'маска': { archetype: 'Persona', meaning: 'Социална роля' },
  'дрехи': { archetype: 'Persona', meaning: 'Външен образ' },
  'огледало': { archetype: 'Persona', meaning: 'Самоотражение' },
  
  // Wise Old Man/Woman
  'старец': { archetype: 'Wise Old Man', meaning: 'Вътрешна мъдрост' },
  'учител': { archetype: 'Wise Old Man', meaning: 'Наставник' },
  'баба': { archetype: 'Wise Old Woman', meaning: 'Женска мъдрост' },
  'магьосник': { archetype: 'Wise Old Man', meaning: 'Духовно ръководство' },
  
  // Hero
  'герой': { archetype: 'Hero', meaning: 'Преодоляване на препятствия' },
  'пътуване': { archetype: 'Hero\'s Journey', meaning: 'Лично израстване' },
  'битка': { archetype: 'Hero', meaning: 'Вътрешна борба' },
  'победа': { archetype: 'Hero', meaning: 'Постигане на целта' },
  
  // Trickster
  'клоун': { archetype: 'Trickster', meaning: 'Нарушаване на правилата' },
  'лисица': { archetype: 'Trickster', meaning: 'Хитрост и адаптивност' },
  'шега': { archetype: 'Trickster', meaning: 'Освобождаване от ограничения' },
  
  // Mother
  'майка': { archetype: 'Great Mother', meaning: 'Грижа и защита' },
  'земя': { archetype: 'Great Mother', meaning: 'Подхранване' },
  'океан': { archetype: 'Great Mother', meaning: 'Несъзнаваното' },
  'гора': { archetype: 'Great Mother', meaning: 'Природна сила' },
  
  // Father
  'баща': { archetype: 'Father', meaning: 'Авторитет и ред' },
  'крал': { archetype: 'Father', meaning: 'Властова структура' },
  'закон': { archetype: 'Father', meaning: 'Правила и граници' },
  
  // Child
  'дете': { archetype: 'Divine Child', meaning: 'Нови начала' },
  'бебе': { archetype: 'Divine Child', meaning: 'Потенциал' },
  'игра': { archetype: 'Divine Child', meaning: 'Спонтанност' },
};

// Freud symbols mapping
const FREUD_SYMBOLS: Record<string, { category: string; meaning: string }> = {
  // Phallic symbols
  'змия': { category: 'Phallic', meaning: 'Мъжка сексуалност' },
  'меч': { category: 'Phallic', meaning: 'Агресия и власт' },
  'оръжие': { category: 'Phallic', meaning: 'Мъжка енергия' },
  'кула': { category: 'Phallic', meaning: 'Амбиция' },
  'ключ': { category: 'Phallic', meaning: 'Достъп и контрол' },
  
  // Vaginal symbols
  'пещера': { category: 'Vaginal', meaning: 'Женска сексуалност' },
  'стая': { category: 'Vaginal', meaning: 'Интимност' },
  'кутия': { category: 'Vaginal', meaning: 'Скрито съдържание' },
  'врата': { category: 'Vaginal', meaning: 'Преход' },
  
  // Water = unconscious
  'вода': { category: 'Unconscious', meaning: 'Емоции и несъзнавано' },
  'река': { category: 'Unconscious', meaning: 'Поток на живота' },
  'море': { category: 'Unconscious', meaning: 'Колективно несъзнавано' },
  'потъване': { category: 'Unconscious', meaning: 'Потапяне в емоции' },
  
  // Death = transformation
  'смърт': { category: 'Transformation', meaning: 'Край на фаза, промяна' },
  'гроб': { category: 'Transformation', meaning: 'Потиснати спомени' },
  
  // Flying = liberation/sexuality
  'летене': { category: 'Liberation', meaning: 'Сексуално освобождение' },
  'птица': { category: 'Liberation', meaning: 'Свобода от ограничения' },
  
  // Falling = anxiety
  'падане': { category: 'Anxiety', meaning: 'Страх от загуба на контрол' },
  'бездна': { category: 'Anxiety', meaning: 'Страх от провал' },
  
  // Teeth = aggression
  'зъби': { category: 'Aggression', meaning: 'Агресия или безсилие' },
  
  // House = self
  'къща': { category: 'Self', meaning: 'Психическа структура' },
  'стълби': { category: 'Self', meaning: 'Нива на съзнанието' },
  
  // Nakedness = vulnerability
  'гол': { category: 'Vulnerability', meaning: 'Уязвимост, срам' },
  'дрехи': { category: 'Persona', meaning: 'Социална маска' },
  
  // Parents
  'майка': { category: 'Oedipal', meaning: 'Привързаност към майката' },
  'баща': { category: 'Oedipal', meaning: 'Конфликт с авторитета' },
  
  // Animals = instincts
  'куче': { category: 'Instinct', meaning: 'Лоялност или агресия' },
  'котка': { category: 'Instinct', meaning: 'Независимост, женственост' },
  'кон': { category: 'Instinct', meaning: 'Либидо, жизнена сила' },
};

// Common themes
const THEMES: Record<string, string[]> = {
  'transformation': ['промяна', 'метаморфоза', 'раждане', 'смърт', 'нов', 'край'],
  'pursuit': ['бягам', 'преследван', 'гоня', 'бързам', 'страх'],
  'loss': ['загубен', 'търся', 'изгубих', 'няма', 'липсва'],
  'water': ['вода', 'море', 'река', 'плувам', 'потъвам', 'дъжд'],
  'flying': ['летя', 'въздух', 'крила', 'небе', 'птица'],
  'falling': ['падам', 'бездна', 'пропаст', 'стръмно'],
  'examination': ['изпит', 'тест', 'не знам', 'закъснявам', 'училище'],
  'relationship': ['любов', 'семейство', 'приятел', 'брак', 'раздяла'],
  'death': ['смърт', 'умирам', 'гроб', 'погребение', 'дух'],
  'power': ['сила', 'власт', 'контрол', 'безсилен', 'крал'],
};

// Simple tokenizer for Bulgarian
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()\[\]{}]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
}

// Find matching symbols in text
function findSymbols(text: string, symbolDict: Record<string, any>): string[] {
  const tokens = tokenize(text);
  const found: string[] = [];
  
  for (const token of tokens) {
    if (symbolDict[token] && !found.includes(token)) {
      found.push(token);
    }
  }
  
  // Also check for partial matches (substrings)
  const lowerText = text.toLowerCase();
  for (const symbol of Object.keys(symbolDict)) {
    if (lowerText.includes(symbol) && !found.includes(symbol)) {
      found.push(symbol);
    }
  }
  
  return found;
}

// Detect themes
function detectThemes(text: string): string[] {
  const lowerText = text.toLowerCase();
  const detectedThemes: string[] = [];
  
  for (const [theme, keywords] of Object.entries(THEMES)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        if (!detectedThemes.includes(theme)) {
          detectedThemes.push(theme);
        }
        break;
      }
    }
  }
  
  return detectedThemes;
}

// Generate Jung analysis
function analyzeJung(text: string): { archetypes: string[]; symbols: string[]; summary: string } {
  const foundSymbols = findSymbols(text, JUNG_ARCHETYPES);
  const archetypes = [...new Set(foundSymbols.map(s => JUNG_ARCHETYPES[s].archetype))];
  const themes = detectThemes(text);
  
  let summary = '';
  
  if (archetypes.length > 0) {
    summary += `Този сън съдържа елементи от архетипите: ${archetypes.join(', ')}. `;
  }
  
  if (foundSymbols.length > 0) {
    const meanings = foundSymbols.slice(0, 3).map(s => JUNG_ARCHETYPES[s].meaning);
    summary += `Ключови символи: ${meanings.join('; ')}. `;
  }
  
  if (themes.includes('transformation')) {
    summary += 'Сънят може да отразява процес на индивидуация. ';
  }
  
  if (themes.includes('pursuit')) {
    summary += 'Преследването често символизира бягство от сянката. ';
  }
  
  if (!summary) {
    summary = 'Сънят изисква по-дълбок анализ. Помислете какви емоции предизвика.';
  }
  
  return { archetypes, symbols: foundSymbols, summary };
}

// Generate Freud analysis
function analyzeFreud(text: string): { symbols: string[]; categories: string[]; summary: string } {
  const foundSymbols = findSymbols(text, FREUD_SYMBOLS);
  const categories = [...new Set(foundSymbols.map(s => FREUD_SYMBOLS[s].category))];
  const themes = detectThemes(text);
  
  let summary = '';
  
  if (categories.length > 0) {
    summary += `Фройдистки категории: ${categories.join(', ')}. `;
  }
  
  if (foundSymbols.length > 0) {
    const meanings = foundSymbols.slice(0, 3).map(s => FREUD_SYMBOLS[s].meaning);
    summary += `Интерпретация: ${meanings.join('; ')}. `;
  }
  
  if (themes.includes('falling')) {
    summary += 'Падането може да означава страх от загуба на контрол или статус. ';
  }
  
  if (themes.includes('flying')) {
    summary += 'Летенето често се свързва със сексуално освобождение или амбиция. ';
  }
  
  if (themes.includes('examination')) {
    summary += 'Изпитите символизират страх от оценка и неадекватност. ';
  }
  
  if (!summary) {
    summary = 'Сънят изисква изследване на латентното съдържание отвъд явните образи.';
  }
  
  return { symbols: foundSymbols, categories, summary };
}

// Main analysis function - ready for future AI hook
export async function analyzeDream(
  dreamId: string,
  dreamText: string,
  approach: DreamAnalysisApproach = 'mixed'
): Promise<Omit<DreamAnalysis, 'id' | 'created_at'>> {
  const jungAnalysis = analyzeJung(dreamText);
  const freudAnalysis = analyzeFreud(dreamText);
  const themes = detectThemes(dreamText);
  
  let summary = '';
  let keySymbols: string[] = [];
  let archetypes: string[] = [];
  
  switch (approach) {
    case 'jung':
      summary = jungAnalysis.summary;
      keySymbols = jungAnalysis.symbols;
      archetypes = jungAnalysis.archetypes;
      break;
    case 'freud':
      summary = freudAnalysis.summary;
      keySymbols = freudAnalysis.symbols;
      break;
    case 'mixed':
    default:
      summary = `Юнгиански поглед: ${jungAnalysis.summary}\n\nФройдистки поглед: ${freudAnalysis.summary}`;
      keySymbols = [...new Set([...jungAnalysis.symbols, ...freudAnalysis.symbols])];
      archetypes = jungAnalysis.archetypes;
  }
  
  // Calculate confidence based on matches
  const totalMatches = keySymbols.length + themes.length + archetypes.length;
  const confidence = Math.min(0.95, Math.max(0.1, totalMatches * 0.1));
  
  return {
    dream_id: dreamId,
    approach,
    summary,
    key_symbols: keySymbols,
    themes,
    archetypes,
    confidence,
  };
}

// Export symbol dictionaries for highlighting
export { JUNG_ARCHETYPES, FREUD_SYMBOLS, THEMES };
