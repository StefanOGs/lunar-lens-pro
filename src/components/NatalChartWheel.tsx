import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// Zodiac signs with their symbols
const ZODIAC_SIGNS = [
  { name: "Овен", symbol: "♈" },
  { name: "Телец", symbol: "♉" },
  { name: "Близнаци", symbol: "♊" },
  { name: "Рак", symbol: "♋" },
  { name: "Лъв", symbol: "♌" },
  { name: "Дева", symbol: "♍" },
  { name: "Везни", symbol: "♎" },
  { name: "Скорпион", symbol: "♏" },
  { name: "Стрелец", symbol: "♐" },
  { name: "Козирог", symbol: "♑" },
  { name: "Водолей", symbol: "♒" },
  { name: "Риби", symbol: "♓" },
];

// Planet symbols and colors
const PLANET_CONFIG: { [key: string]: { symbol: string; color: string } } = {
  "Слънце": { symbol: "☉", color: "#f4c430" },
  "Луна": { symbol: "☽", color: "#7a7a7a" },
  "Меркурий": { symbol: "☿", color: "#7a7a7a" },
  "Венера": { symbol: "♀", color: "#c77ddf" },
  "Марс": { symbol: "♂", color: "#e63946" },
  "Юпитер": { symbol: "♃", color: "#43aa8b" },
  "Сатурн": { symbol: "♄", color: "#4d4d4d" },
  "Уран": { symbol: "♅", color: "#0077b6" },
  "Нептун": { symbol: "♆", color: "#2a9d8f" },
  "Плутон": { symbol: "♇", color: "#6b5b95" },
};

// Aspect colors
const ASPECT_CONFIG: { [key: string]: { color: string } } = {
  "Конюнкция": { color: "rgba(136, 136, 136, 0.75)" },
  "Опозиция": { color: "rgba(230, 57, 70, 0.75)" },
  "Квадрат": { color: "rgba(230, 57, 70, 0.75)" },
  "Тригон": { color: "rgba(0, 119, 182, 0.75)" },
  "Секстил": { color: "rgba(42, 157, 143, 0.75)" },
};

interface Planet {
  name: string;
  sign: string;
  degree: number;
  house: number;
}

interface House {
  house: number;
  sign: string;
  degree: number;
}

interface Aspect {
  planet1: string;
  planet2: string;
  aspect: string;
  angle: number;
}

interface NatalChartWheelProps {
  planets: Planet[];
  houses: House[];
  aspects: Aspect[];
  ascendantDegree: number;
}

// Convert astrological degree to SVG angle
const astroToSvgAngle = (astroDegree: number, ascendant: number): number => {
  return 180 - (astroDegree - ascendant);
};

// Get absolute degree for a planet
const getAbsoluteDegree = (signName: string, degreeInSign: number): number => {
  const signIndex = ZODIAC_SIGNS.findIndex(s => s.name === signName);
  return signIndex >= 0 ? signIndex * 30 + degreeInSign : 0;
};

// Polar to Cartesian conversion
const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
};

const NatalChartWheel = ({ planets, houses, aspects, ascendantDegree }: NatalChartWheelProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const size = 600;
  const cx = size / 2;
  const cy = size / 2;
  
  // Ring radii
  const outerRadius = 280;
  const zodiacInnerRadius = 230;
  const houseOuterRadius = 220;
  const houseInnerRadius = 170;
  const planetRadius = 145;
  const aspectCircleRadius = 100;

  // Calculate house cusp degrees
  const houseCusps = houses.map(h => getAbsoluteDegree(h.sign, h.degree));

  // Export to PNG
  const exportToPng = useCallback(() => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size * 2;
      canvas.height = size * 2;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = "natal-chart.png";
        link.href = pngUrl;
        link.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  // Get house label angle
  const getHouseLabelAngle = (houseIndex: number) => {
    const currentCusp = houseCusps[houseIndex];
    const nextCusp = houseCusps[(houseIndex + 1) % 12];
    let midDegree = currentCusp + ((nextCusp - currentCusp + 360) % 360) / 2;
    if (nextCusp < currentCusp) midDegree = currentCusp + ((nextCusp + 360 - currentCusp) / 2);
    return astroToSvgAngle(midDegree % 360, ascendantDegree);
  };

  // Calculate planet positions with collision avoidance
  const calculatePlanetPositions = () => {
    const positions: { planet: Planet; angle: number; radius: number; absoluteDegree: number }[] = [];
    
    planets.forEach((planet) => {
      const absoluteDegree = getAbsoluteDegree(planet.sign, planet.degree);
      const angle = astroToSvgAngle(absoluteDegree, ascendantDegree);
      
      let radius = planetRadius;
      const minDistance = 22;
      
      for (const existing of positions) {
        const angleDiff = Math.abs(angle - existing.angle);
        if (angleDiff < 12 || angleDiff > 348) {
          if (Math.abs(radius - existing.radius) < minDistance) {
            radius = existing.radius - minDistance;
          }
        }
      }
      
      positions.push({ planet, angle, radius: Math.max(radius, 108), absoluteDegree });
    });
    
    return positions;
  };

  const planetPositions = calculatePlanetPositions();

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[600px] h-auto"
        style={{ background: "#ffffff" }}
      >
        <defs>
          <filter id="planetShadow">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.15"/>
          </filter>
        </defs>

        {/* Outer circle */}
        <circle cx={cx} cy={cy} r={outerRadius} fill="none" stroke="#333" strokeWidth="3" />

        {/* Zodiac ring with alternating backgrounds */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const startAngle = astroToSvgAngle((i + 1) * 30, ascendantDegree);
          const endAngle = astroToSvgAngle(i * 30, ascendantDegree);
          const midAngle = (startAngle + endAngle) / 2;
          
          const glyphPos = polarToCartesian(cx, cy, (outerRadius + zodiacInnerRadius) / 2 + 5, midAngle);
          
          const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
          const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
          const innerStart = polarToCartesian(cx, cy, zodiacInnerRadius, startAngle);
          const innerEnd = polarToCartesian(cx, cy, zodiacInnerRadius, endAngle);
          
          const segmentPath = `
            M ${outerStart.x} ${outerStart.y}
            A ${outerRadius} ${outerRadius} 0 0 0 ${outerEnd.x} ${outerEnd.y}
            L ${innerEnd.x} ${innerEnd.y}
            A ${zodiacInnerRadius} ${zodiacInnerRadius} 0 0 1 ${innerStart.x} ${innerStart.y}
            Z
          `;
          
          return (
            <g key={sign.name}>
              <path
                d={segmentPath}
                fill={i % 2 === 0 ? "#f5f5f5" : "#ffffff"}
                stroke="#ccc"
                strokeWidth="1"
              />
              <text
                x={glyphPos.x}
                y={glyphPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#333"
                fontSize="24"
                fontWeight="bold"
                fontFamily="serif"
              >
                {sign.symbol}
              </text>
            </g>
          );
        })}

        {/* Inner zodiac ring border */}
        <circle cx={cx} cy={cy} r={zodiacInnerRadius} fill="none" stroke="#555" strokeWidth="1.5" />

        {/* House ring */}
        <circle cx={cx} cy={cy} r={houseOuterRadius} fill="#fafafa" stroke="#ccc" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={houseInnerRadius} fill="#ffffff" stroke="#bbb" strokeWidth="1" />

        {/* House cusp lines */}
        {houseCusps.map((cusp, i) => {
          const angle = astroToSvgAngle(cusp, ascendantDegree);
          const innerPoint = polarToCartesian(cx, cy, aspectCircleRadius, angle);
          const outerPoint = polarToCartesian(cx, cy, houseOuterRadius, angle);
          
          const isAngular = i === 0 || i === 3 || i === 6 || i === 9;
          
          return (
            <line
              key={`house-cusp-${i}`}
              x1={innerPoint.x}
              y1={innerPoint.y}
              x2={outerPoint.x}
              y2={outerPoint.y}
              stroke={isAngular ? "#333" : "#555"}
              strokeWidth={isAngular ? 2 : 1.5}
            />
          );
        })}

        {/* House numbers */}
        {houseCusps.map((_, i) => {
          const labelAngle = getHouseLabelAngle(i);
          const labelPos = polarToCartesian(cx, cy, (houseOuterRadius + houseInnerRadius) / 2, labelAngle);
          
          return (
            <text
              key={`house-num-${i}`}
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#444"
              fontSize="18"
              fontWeight="500"
              fontFamily="Arial, sans-serif"
            >
              {i + 1}
            </text>
          );
        })}

        {/* Inner aspect circle */}
        <circle cx={cx} cy={cy} r={aspectCircleRadius} fill="none" stroke="#ddd" strokeWidth="1" />

        {/* Aspect lines */}
        {aspects.map((aspect, i) => {
          const planet1Pos = planetPositions.find(p => p.planet.name === aspect.planet1);
          const planet2Pos = planetPositions.find(p => p.planet.name === aspect.planet2);
          
          if (!planet1Pos || !planet2Pos) return null;
          
          const pos1 = polarToCartesian(cx, cy, aspectCircleRadius - 8, planet1Pos.angle);
          const pos2 = polarToCartesian(cx, cy, aspectCircleRadius - 8, planet2Pos.angle);
          
          const config = ASPECT_CONFIG[aspect.aspect] || { color: "rgba(136, 136, 136, 0.5)" };
          
          return (
            <line
              key={`aspect-${i}`}
              x1={pos1.x}
              y1={pos1.y}
              x2={pos2.x}
              y2={pos2.y}
              stroke={config.color}
              strokeWidth="1.5"
            />
          );
        })}

        {/* Planet markers and glyphs */}
        {planetPositions.map(({ planet, angle, radius }) => {
          const markerPos = polarToCartesian(cx, cy, radius, angle);
          const config = PLANET_CONFIG[planet.name] || { symbol: planet.name[0], color: "#666" };
          
          return (
            <g key={planet.name} filter="url(#planetShadow)">
              <circle
                cx={markerPos.x}
                cy={markerPos.y}
                r="4"
                fill={config.color}
                stroke="#fff"
                strokeWidth="1"
              />
              <text
                x={markerPos.x + 12}
                y={markerPos.y - 3}
                textAnchor="start"
                dominantBaseline="central"
                fill={config.color}
                fontSize="20"
                fontWeight="bold"
                fontFamily="serif"
              >
                {config.symbol}
              </text>
              <text
                x={markerPos.x + 12}
                y={markerPos.y + 10}
                textAnchor="start"
                dominantBaseline="central"
                fill="#666"
                fontSize="10"
                fontFamily="Arial, sans-serif"
              >
                {Math.round(planet.degree)}°
              </text>
            </g>
          );
        })}

        {/* Angular point labels */}
        <g fontFamily="Arial, sans-serif">
          <text x={cx - outerRadius - 12} y={cy} textAnchor="end" dominantBaseline="central" fill="#333" fontSize="14" fontWeight="bold">ASC</text>
          <text x={cx + outerRadius + 12} y={cy} textAnchor="start" dominantBaseline="central" fill="#666" fontSize="12">DSC</text>
          <text x={cx} y={cy - outerRadius - 8} textAnchor="middle" dominantBaseline="auto" fill="#333" fontSize="14" fontWeight="bold">MC</text>
          <text x={cx} y={cy + outerRadius + 14} textAnchor="middle" dominantBaseline="hanging" fill="#666" fontSize="12">IC</text>
        </g>
      </svg>

      <Button onClick={exportToPng} variant="outline" className="gap-2">
        <Download className="w-4 h-4" />
        Изтегли като PNG
      </Button>
    </div>
  );
};

export default NatalChartWheel;
