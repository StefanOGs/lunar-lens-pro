import { calculateNatalChart, NatalChartData } from './swissEphemerisClient';

const LOVABLE_API_KEY = import.meta.env.VITE_LOVABLE_API_KEY || '';

export const generateNatalChartWithAnalysis = async (
  birthDate: string,
  birthTime: string,
  location: { city: string; country: string; lat: number; lon: number }
): Promise<NatalChartData & { analysis: string }> => {
  // Calculate natal chart using Swiss Ephemeris
  const chartData = await calculateNatalChart(birthDate, birthTime, location);

  // Generate AI analysis
  const prompt = `Генерирай пълен астрологичен анализ на натална карта на български език за човек роден на ${birthDate} в ${birthTime} в ${location.city}, ${location.country}.

Астрологични данни:
- Слънце в ${chartData.chart.sunSign}
- Асцендент (Възходящ знак): ${chartData.chart.ascendant.sign} на ${chartData.chart.ascendant.degree}°

Позиции на планетите:
${chartData.chart.planets.map(p => `- ${p.name}: ${p.sign} ${p.degree}° (${p.house} дом)`).join('\n')}

Върхове на домовете:
${chartData.chart.houses.map(h => `- ${h.house} дом: ${h.sign} ${h.degree}°`).join('\n')}

Аспекти между планетите:
${chartData.chart.aspects.length > 0 ? chartData.chart.aspects.map(a => `- ${a.planet1} ${a.aspect} ${a.planet2} (${a.angle}°)`).join('\n') : 'Няма значими аспекти'}

Моля, предостави задълбочен анализ на личността, силните страни, предизвикателствата и жизнения път на този човек, базиран на горните астрологични данни. Анализът трябва да е между 500 и 800 думи и да включва:

1. Общи характеристики на личността (базирано на Слънцето и Асцендента)
2. Емоционален живот и взаимоотношения
3. Кариера и призвание
4. Предизвикателства и уроци за растеж
5. Уникални качества и потенциал

Пиши на български език, с професионален и вдъхновяващ тон.`;

  try {
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'Ти си опитен астролог с дълбоки познания в западната астрология. Твоят анализ е точен, вдъхновяващ и полезен.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('Failed to generate AI analysis');
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;

    return {
      ...chartData,
      analysis
    };
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    // Return chart data with a default message if AI fails
    return {
      ...chartData,
      analysis: 'Анализът не може да бъде генериран в момента. Моля, опитайте отново.'
    };
  }
};
