import { calculateNatalChart, NatalChartData } from './swissEphemerisClient';
import { supabase } from '@/integrations/supabase/client';

export const generateNatalChartWithAnalysis = async (
  birthDate: string,
  birthTime: string,
  location: { city: string; country: string; lat: number; lon: number }
): Promise<NatalChartData & { analysis: string }> => {
  // Calculate natal chart using local Swiss Ephemeris WASM
  const chartData = await calculateNatalChart(birthDate, birthTime, location);

  // Generate AI analysis via edge function
  try {
    const { data, error } = await supabase.functions.invoke('generate-natal-chart-analysis', {
      body: { chartData }
    });

    if (error) {
      throw error;
    }

    return {
      ...chartData,
      analysis: data.analysis
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
