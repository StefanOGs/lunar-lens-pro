// Zodiac signs mapping
const ZODIAC_SIGNS_BG = [
  'Овен', 'Телец', 'Близнаци', 'Рак', 'Лъв', 'Дева',
  'Везни', 'Скорпион', 'Стрелец', 'Козирог', 'Водолей', 'Риби'
];

const PLANET_NAMES_BG: { [key: number]: string } = {
  0: 'Слънце',
  1: 'Луна',
  2: 'Меркурий',
  3: 'Венера',
  4: 'Марс',
  5: 'Юпитер',
  6: 'Сатурн',
  7: 'Уран',
  8: 'Нептун',
  9: 'Плутон'
};

// Get zodiac sign from degree
const getZodiacSign = (degree: number): { sign: string, signDegree: number } => {
  const signIndex = Math.floor(degree / 30);
  const signDegree = degree % 30;
  return {
    sign: ZODIAC_SIGNS_BG[signIndex],
    signDegree: Math.floor(signDegree)
  };
};

// Calculate house position for a planet
const getHousePosition = (planetDegree: number, houseCusps: number[]): number => {
  for (let i = 0; i < 12; i++) {
    const currentCusp = houseCusps[i];
    const nextCusp = houseCusps[(i + 1) % 12];
    
    if (nextCusp > currentCusp) {
      if (planetDegree >= currentCusp && planetDegree < nextCusp) {
        return i + 1;
      }
    } else {
      // Handle wrap around 360°
      if (planetDegree >= currentCusp || planetDegree < nextCusp) {
        return i + 1;
      }
    }
  }
  return 1; // Default to first house
};

export interface NatalChartData {
  birthData: {
    date: string;
    time: string;
    location: string;
    coordinates: { lat: number; lon: number };
  };
  chart: {
    sunSign: string;
    ascendant: { sign: string; degree: number };
    planets: Array<{
      name: string;
      sign: string;
      degree: number;
      house: number;
    }>;
    houses: Array<{
      house: number;
      sign: string;
      degree: number;
    }>;
    aspects: Array<{
      planet1: string;
      planet2: string;
      aspect: string;
      angle: number;
    }>;
  };
}

// Initialize Swiss Ephemeris WASM
let sweph: any = null;

const initSwissEph = async () => {
  if (sweph) return sweph;
  
  const SwissEPH = (await import('sweph-wasm')).default;
  sweph = await SwissEPH.init();
  await sweph.swe_set_ephe_path();
  return sweph;
};

export const calculateNatalChart = async (
  birthDate: string,
  birthTime: string,
  location: { city: string; country: string; lat: number; lon: number }
): Promise<NatalChartData> => {
  // Initialize Swiss Ephemeris
  const swe = await initSwissEph();

  // Parse birth date and time
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = birthTime.split(':').map(Number);

  // Calculate Julian day (UT time)
  const time = hour + minute / 60;
  const julianDay = swe.swe_julday(year, month, day, time, 1); // 1 = Gregorian calendar

  // Calculate houses using Placidus system
  const housesResult = swe.swe_houses(julianDay, location.lat, location.lon, 'P');
  const houseCusps = housesResult.cusps.slice(1); // Remove first element (0 index is empty)
  const ascendantDegree = housesResult.ascmc[0]; // Ascendant is first element of ascmc array

  // Get ascendant sign
  const ascendant = getZodiacSign(ascendantDegree);

  // Calculate planet positions
  const planets = [];
  const planetPositions: { name: string; degree: number }[] = [];

  // Planet IDs in sweph-wasm (SE_SUN = 0, SE_PLUTO = 9)
  for (let planetId = 0; planetId <= 9; planetId++) {
    try {
      const planetData = swe.swe_calc_ut(julianDay, planetId, 0); // 0 = default flags
      const longitude = planetData[0]; // longitude is first element
      const zodiac = getZodiacSign(longitude);
      const house = getHousePosition(longitude, houseCusps);

      const planet = {
        name: PLANET_NAMES_BG[planetId],
        sign: zodiac.sign,
        degree: zodiac.signDegree,
        house: house
      };

      planets.push(planet);
      planetPositions.push({ name: PLANET_NAMES_BG[planetId], degree: longitude });
    } catch (error) {
      console.warn(`Failed to calculate planet ${planetId}:`, error);
    }
  }

  // Get sun sign
  const sunSign = planets[0].sign;

  // Calculate houses data
  const housesData = [];
  for (let i = 0; i < 12; i++) {
    const cuspDegree = houseCusps[i];
    const zodiac = getZodiacSign(cuspDegree);
    housesData.push({
      house: i + 1,
      sign: zodiac.sign,
      degree: zodiac.signDegree
    });
  }

  // Calculate aspects
  const aspects = [];
  const aspectTypes = [
    { name: "Конюнкция", degree: 0, orb: 8 },
    { name: "Опозиция", degree: 180, orb: 8 },
    { name: "Квадрат", degree: 90, orb: 6 },
    { name: "Тригон", degree: 120, orb: 8 },
    { name: "Секстил", degree: 60, orb: 6 },
  ];

  for (let i = 0; i < planetPositions.length; i++) {
    for (let j = i + 1; j < planetPositions.length; j++) {
      const planet1 = planetPositions[i];
      const planet2 = planetPositions[j];
      
      let angle = Math.abs(planet1.degree - planet2.degree);
      if (angle > 180) angle = 360 - angle;
      
      for (const aspectType of aspectTypes) {
        if (Math.abs(angle - aspectType.degree) <= aspectType.orb) {
          aspects.push({
            planet1: planet1.name,
            planet2: planet2.name,
            aspect: aspectType.name,
            angle: Math.round(angle)
          });
          break;
        }
      }
    }
  }

  // Note: sweph-wasm doesn't require explicit cleanup like Node.js version

  return {
    birthData: {
      date: birthDate,
      time: birthTime,
      location: `${location.city}, ${location.country}`,
      coordinates: {
        lat: location.lat,
        lon: location.lon
      }
    },
    chart: {
      sunSign,
      ascendant: {
        sign: ascendant.sign,
        degree: ascendant.signDegree
      },
      planets,
      houses: housesData,
      aspects
    }
  };
};
