// Symbol Analyzer - Rule-based interpretation engine
// Placeholder for future AI integration

import { SymbolAnalysis, PatternData, SymbolLogWithCategories } from '../types';

// Jungian archetype mappings for synchronicity
const JUNG_SYNCHRONICITY: Record<string, { archetype: string; meaning: string }> = {
  // Животни
  'гарван': { archetype: 'Вестител', meaning: 'Трансформация, послание от несъзнаваното, преход между светове' },
  'врана': { archetype: 'Вестител', meaning: 'Промяна, мъдрост, тайни знания' },
  'сова': { archetype: 'Мъдрец', meaning: 'Интуиция, скрита мъдрост, виждане отвъд илюзията' },
  'змия': { archetype: 'Трансформатор', meaning: 'Преобразяване, изцеление, кундалини енергия' },
  'вълк': { archetype: 'Водач', meaning: 'Инстинкт, свобода, връзка със стаята' },
  'орел': { archetype: 'Духът', meaning: 'Висша перспектива, свобода, духовно издигане' },
  'котка': { archetype: 'Женското начало', meaning: 'Независимост, мистерия, интуиция' },
  'куче': { archetype: 'Верен спътник', meaning: 'Лоялност, защита, несъзнавани инстинкти' },
  'пеперуда': { archetype: 'Трансформация', meaning: 'Метаморфоза, красота от хаоса, душа' },
  'паяк': { archetype: 'Творецът', meaning: 'Съдба, творчество, женска сила' },
  
  // Числа
  '11': { archetype: 'Портал', meaning: 'Духовно пробуждане, интуиция, синхроничност' },
  '111': { archetype: 'Проявление', meaning: 'Мисли стават реалност, нов цикъл' },
  '22': { archetype: 'Майсторът строител', meaning: 'Баланс, партньорства, майсторство' },
  '222': { archetype: 'Хармония', meaning: 'Баланс, вяра, всичко е по план' },
  '33': { archetype: 'Учителят', meaning: 'Духовна мъдрост, вдъхновение, творчество' },
  '333': { archetype: 'Покровителство', meaning: 'Подкрепа от висши сили, растеж' },
  '44': { archetype: 'Основи', meaning: 'Стабилност, сигурност, ангелска защита' },
  '444': { archetype: 'Защита', meaning: 'Ангелско присъствие, стабилност' },
  '55': { archetype: 'Промяна', meaning: 'Голяма промяна, освобождаване, приключения' },
  '555': { archetype: 'Трансформация', meaning: 'Масивна промяна, нови възможности' },
  
  // Природни явления
  'дъга': { archetype: 'Мост', meaning: 'Връзка между светове, надежда, обещание' },
  'мълния': { archetype: 'Озарение', meaning: 'Внезапно прозрение, божествена намеса, енергия' },
  'гръмотевица': { archetype: 'Гласът', meaning: 'Космическо послание, пробуждане' },
  'пълнолуние': { archetype: 'Пълнота', meaning: 'Кулминация, емоционален връх, завършване' },
  'новолуние': { archetype: 'Начало', meaning: 'Нов цикъл, възможности, засяване' },
  'затъмнение': { archetype: 'Сянка', meaning: 'Разкриване на скритото, трансформация' },
  
  // Предмети и символи
  'ключ': { archetype: 'Откриватели', meaning: 'Нови възможности, решения, тайни' },
  'врата': { archetype: 'Преход', meaning: 'Нови начала, избор, възможности' },
  'огледало': { archetype: 'Рефлексия', meaning: 'Самопознание, истина, отражение на душата' },
  'часовник': { archetype: 'Хронос', meaning: 'Момент за действие, цикличност, време' },
  'монета': { archetype: 'Късмет', meaning: 'Изобилие, решения, стойност' },
  'перо': { archetype: 'Ангел', meaning: 'Духовно послание, лекота, истина' },
  'кръст': { archetype: 'Центърът', meaning: 'Пресечна точка, решение, жертва и възкресение' },
  'спирала': { archetype: 'Развитие', meaning: 'Еволюция, космически ритъм, растеж' },
};

// Freudian association mappings
const FREUD_ASSOCIATIONS: Record<string, { category: string; meaning: string }> = {
  // Животни
  'змия': { category: 'Либидо', meaning: 'Фалически символ, потиснати сексуални желания, страх от мъжката сила' },
  'паяк': { category: 'Майчин комплекс', meaning: 'Задушаваща майка, женска власт, страх от погълщане' },
  'вълк': { category: 'Агресия', meaning: 'Потиснати агресивни импулси, страх от властта' },
  'куче': { category: 'Суперего', meaning: 'Лоялност, съвест, морални ограничения' },
  'котка': { category: 'Женственост', meaning: 'Женска сексуалност, независимост, капризност' },
  
  // Числа
  '3': { category: 'Едипов комплекс', meaning: 'Триъгълникът дете-майка-баща, семейна динамика' },
  '7': { category: 'Цикличност', meaning: 'Седемдневни цикли, биологични ритми' },
  '13': { category: 'Страх', meaning: 'Потиснати страхове, табута, суеверие като защитен механизъм' },
  
  // Предмети
  'ключ': { category: 'Либидо', meaning: 'Фалически символ, желание за проникване, власт' },
  'врата': { category: 'Ерос', meaning: 'Женски символ, вход, желание за интимност' },
  'огледало': { category: 'Нарцисизъм', meaning: 'Самолюбие, идеализиран образ на себе си' },
  'вода': { category: 'Несъзнавано', meaning: 'Емоции, майчина утроба, раждане и смърт' },
  'огън': { category: 'Либидо', meaning: 'Страст, трансформираща енергия, разрушителен импулс' },
  
  // Действия/ситуации
  'падане': { category: 'Тревожност', meaning: 'Страх от провал, загуба на контрол, сексуална капитулация' },
  'летене': { category: 'Либидо', meaning: 'Сексуално желание, амбиция, бягство от реалността' },
  'преследване': { category: 'Тревожност', meaning: 'Избягване на конфликт, потиснати страхове' },
};

// Common synchronicity themes
const THEMES: Record<string, string[]> = {
  'духовно_пробуждане': ['11:11', '111', 'ангел', 'перо', 'светлина', 'медитация', 'съзнание'],
  'трансформация': ['смърт', 'раждане', 'пеперуда', 'змия', 'феникс', 'край', 'начало'],
  'послание': ['гарван', 'врана', 'сова', 'глас', 'знак', 'сигнал', 'интуиция'],
  'връзки': ['сродна душа', 'среща', 'синхрон', 'огледало', 'двойник', 'партньор'],
  'изобилие': ['монета', 'пари', 'зелено', '888', 'дърво', 'плод', 'реколта'],
  'защита': ['444', 'ангел', 'светлина', 'щит', 'кръст', 'амулет'],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\wа-яА-Я\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
}

function findMatches(text: string, dictionary: Record<string, any>): string[] {
  const words = tokenize(text);
  const found: string[] = [];
  
  for (const key of Object.keys(dictionary)) {
    const keyLower = key.toLowerCase();
    if (words.some(w => w.includes(keyLower) || keyLower.includes(w))) {
      found.push(key);
    }
    // Check for number patterns in original text
    if (/^\d+$/.test(key) && text.includes(key)) {
      if (!found.includes(key)) found.push(key);
    }
  }
  
  return found;
}

function detectThemes(text: string): string[] {
  const detectedThemes: string[] = [];
  const textLower = text.toLowerCase();
  
  for (const [theme, keywords] of Object.entries(THEMES)) {
    if (keywords.some(kw => textLower.includes(kw))) {
      detectedThemes.push(theme.replace('_', ' '));
    }
  }
  
  return detectedThemes;
}

function analyzeJung(symbol: string, context: string): string {
  const fullText = `${symbol} ${context}`;
  const matches = findMatches(fullText, JUNG_SYNCHRONICITY);
  const themes = detectThemes(fullText);
  
  if (matches.length === 0) {
    return `Синхроничността "${symbol}" може да бъде лична проекция на колективното несъзнавано. Обърнете внимание на емоциите и асоциациите, които предизвиква. Юнг би казал, че няма случайности – всяко събитие носи смисъл за индивидуацията.`;
  }
  
  const interpretations = matches.map(m => {
    const data = JUNG_SYNCHRONICITY[m];
    return `**${m}** (${data.archetype}): ${data.meaning}`;
  });
  
  let summary = `## Юнгиански анализ\n\n`;
  summary += `### Открити архетипни символи\n`;
  summary += interpretations.join('\n\n');
  
  if (themes.length > 0) {
    summary += `\n\n### Теми\n`;
    summary += themes.map(t => `- ${t}`).join('\n');
  }
  
  summary += `\n\n### Синхроничност\n`;
  summary += `Това събитие е "смислено съвпадение" – външно събитие, което резонира с вътрешно психическо състояние. Юнг вярваше, че такива моменти разкриват по-дълбок ред във Вселената.`;
  
  return summary;
}

function analyzeFreud(symbol: string, context: string): string {
  const fullText = `${symbol} ${context}`;
  const matches = findMatches(fullText, FREUD_ASSOCIATIONS);
  
  if (matches.length === 0) {
    return `От Фройдистка гледна точка, фокусът върху "${symbol}" може да разкрива несъзнавани желания или тревоги. Попитайте се: какви спомени или емоции предизвиква? Повторяемостта на символа може да сигнализира за неразрешен вътрешен конфликт.`;
  }
  
  const interpretations = matches.map(m => {
    const data = FREUD_ASSOCIATIONS[m];
    return `**${m}** (${data.category}): ${data.meaning}`;
  });
  
  let summary = `## Фройдистки анализ\n\n`;
  summary += `### Символни асоциации\n`;
  summary += interpretations.join('\n\n');
  
  summary += `\n\n### Защитни механизми\n`;
  summary += `Обърнете внимание дали фокусът върху този символ не служи като:\n`;
  summary += `- **Рационализация**: обяснение на случайности като знаци\n`;
  summary += `- **Проекция**: приписване на вътрешни състояния на външния свят\n`;
  summary += `- **Изместване**: пренасочване на емоции към "безопасен" обект\n`;
  
  return summary;
}

export function analyzePattern(
  currentSymbol: SymbolLogWithCategories,
  allSymbols: SymbolLogWithCategories[]
): PatternData[] {
  const patterns: PatternData[] = [];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentSymbols = allSymbols.filter(s => 
    new Date(s.logged_at) >= thirtyDaysAgo
  );
  
  // Count symbol occurrences
  const symbolCounts: Record<string, { count: number; dates: string[] }> = {};
  
  for (const s of recentSymbols) {
    const key = s.symbol.toLowerCase().trim();
    if (!symbolCounts[key]) {
      symbolCounts[key] = { count: 0, dates: [] };
    }
    symbolCounts[key].count++;
    symbolCounts[key].dates.push(s.logged_at);
  }
  
  // Find patterns (symbols appearing more than once)
  for (const [symbol, data] of Object.entries(symbolCounts)) {
    if (data.count >= 2) {
      const sortedDates = data.dates.sort();
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      
      // Simple trend detection based on date distribution
      if (data.count >= 3) {
        const midIndex = Math.floor(sortedDates.length / 2);
        const firstHalf = sortedDates.slice(0, midIndex);
        const secondHalf = sortedDates.slice(midIndex);
        
        if (secondHalf.length > firstHalf.length) {
          trend = 'increasing';
        } else if (firstHalf.length > secondHalf.length) {
          trend = 'decreasing';
        }
      }
      
      patterns.push({
        symbol,
        count: data.count,
        dates: sortedDates,
        trend
      });
    }
  }
  
  return patterns.sort((a, b) => b.count - a.count);
}

export async function analyzeSymbol(
  symbolLog: SymbolLogWithCategories,
  allSymbols: SymbolLogWithCategories[]
): Promise<SymbolAnalysis> {
  const { symbol, context } = symbolLog;
  const contextText = context || '';
  
  const jung = analyzeJung(symbol, contextText);
  const freud = analyzeFreud(symbol, contextText);
  const pattern = analyzePattern(symbolLog, allSymbols);
  
  return {
    jung,
    freud,
    pattern
  };
}

export { JUNG_SYNCHRONICITY, FREUD_ASSOCIATIONS, THEMES };
