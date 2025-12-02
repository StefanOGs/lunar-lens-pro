import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// Zodiac signs with their symbols - old school earth tones
const ZODIAC_SIGNS = [
  { name: "Овен", symbol: "♈", color: "hsl(0, 45%, 45%)", element: "fire" },
  { name: "Телец", symbol: "♉", color: "hsl(35, 40%, 35%)", element: "earth" },
  { name: "Близнаци", symbol: "♊", color: "hsl(45, 35%, 50%)", element: "air" },
  { name: "Рак", symbol: "♋", color: "hsl(200, 35%, 45%)", element: "water" },
  { name: "Лъв", symbol: "♌", color: "hsl(25, 50%, 45%)", element: "fire" },
  { name: "Дева", symbol: "♍", color: "hsl(80, 25%, 35%)", element: "earth" },
  { name: "Везни", symbol: "♎", color: "hsl(40, 30%, 55%)", element: "air" },
  { name: "Скорпион", symbol: "♏", color: "hsl(350, 40%, 35%)", element: "water" },
  { name: "Стрелец", symbol: "♐", color: "hsl(15, 45%, 40%)", element: "fire" },
  { name: "Козирог", symbol: "♑", color: "hsl(30, 25%, 30%)", element: "earth" },
  { name: "Водолей", symbol: "♒", color: "hsl(50, 25%, 50%)", element: "air" },
  { name: "Риби", symbol: "♓", color: "hsl(210, 30%, 40%)", element: "water" },
];

// Planet symbols
const PLANET_SYMBOLS: { [key: string]: string } = {
  "Слънце": "☉",
  "Луна": "☽",
  "Меркурий": "☿",
  "Венера": "♀",
  "Марс": "♂",
  "Юпитер": "♃",
  "Сатурн": "♄",
  "Уран": "♅",
  "Нептун": "♆",
  "Плутон": "♇",
};

// Aspect colors - muted old-school palette
const ASPECT_COLORS: { [key: string]: string } = {
  "Конюнкция": "#8b7355",
  "Опозиция": "#8b4040",
  "Квадрат": "#8b4040",
  "Тригон": "#4a6b8b",
  "Секстил": "#4a6b8b",
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
// In astrology: 0° Aries is at 9 o'clock, increases counter-clockwise
// In SVG: 0° is at 3 o'clock, increases clockwise
const astroToSvgAngle = (astroDegree: number, ascendant: number): number => {
  // Rotate so Ascendant is at 9 o'clock (180° in SVG)
  const adjusted = 180 - (astroDegree - ascendant);
  return adjusted;
};

// Get absolute degree for a planet (sign index * 30 + degree in sign)
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

// Create arc path
const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

const NatalChartWheel = ({ planets, houses, aspects, ascendantDegree }: NatalChartWheelProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const size = 700;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.46;
  const degreeTickRadius = size * 0.42;
  const zodiacInnerRadius = size * 0.36;
  const houseOuterRadius = size * 0.33;
  const houseInnerRadius = size * 0.12;
  const planetRadius = size * 0.26;
  const houseLabelRadius = size * 0.22;

  // Calculate house cusp degrees (absolute)
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
        ctx.fillStyle = "#0f0f1a";
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

  // Calculate house label positions (middle of each house)
  const getHouseLabelAngle = (houseIndex: number) => {
    const currentCusp = houseCusps[houseIndex];
    const nextCusp = houseCusps[(houseIndex + 1) % 12];
    let midDegree = currentCusp + ((nextCusp - currentCusp + 360) % 360) / 2;
    if (nextCusp < currentCusp) midDegree = currentCusp + ((nextCusp + 360 - currentCusp) / 2);
    return astroToSvgAngle(midDegree % 360, ascendantDegree);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[600px] h-auto"
        style={{ background: "#1a1a1a" }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="shadow">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#000" floodOpacity="0.5"/>
          </filter>
          {/* Old parchment texture pattern */}
          <pattern id="parchment" patternUnits="userSpaceOnUse" width="100" height="100">
            <rect width="100" height="100" fill="#2a2520"/>
            <circle cx="20" cy="20" r="1" fill="#1a1510" opacity="0.3"/>
            <circle cx="70" cy="50" r="0.5" fill="#1a1510" opacity="0.2"/>
            <circle cx="40" cy="80" r="0.8" fill="#1a1510" opacity="0.25"/>
          </pattern>
        </defs>

        {/* Background with old parchment feel */}
        <circle cx={cx} cy={cy} r={outerRadius + 20} fill="#1a1510" />
        <circle cx={cx} cy={cy} r={outerRadius + 15} fill="url(#parchment)" />
        <circle cx={cx} cy={cy} r={outerRadius + 15} fill="none" stroke="#8b7355" strokeWidth="3" />
        <circle cx={cx} cy={cy} r={outerRadius + 12} fill="none" stroke="#6b5344" strokeWidth="1" />

        {/* Zodiac ring - 12 segments */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const startAngle = astroToSvgAngle((i + 1) * 30, ascendantDegree);
          const endAngle = astroToSvgAngle(i * 30, ascendantDegree);
          const midAngle = (startAngle + endAngle) / 2;
          
          const labelPos = polarToCartesian(cx, cy, (outerRadius + zodiacInnerRadius) / 2 + 5, midAngle);
          
          return (
            <g key={sign.name}>
              {/* Segment arc */}
              <path
                d={`${describeArc(cx, cy, outerRadius, startAngle, endAngle)} 
                    L ${polarToCartesian(cx, cy, zodiacInnerRadius, endAngle).x} ${polarToCartesian(cx, cy, zodiacInnerRadius, endAngle).y}
                    ${describeArc(cx, cy, zodiacInnerRadius, endAngle, startAngle).replace('M', 'L').replace(/A [^ ]+ [^ ]+ 0 [01] 0/, 'A ' + zodiacInnerRadius + ' ' + zodiacInnerRadius + ' 0 0 1')}
                    Z`}
                fill={sign.color}
                fillOpacity="0.25"
                stroke="#8b7355"
                strokeWidth="1.5"
              />
              {/* Sign symbol */}
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#d4c4a8"
                fontSize="24"
                fontWeight="bold"
                fontFamily="serif"
                filter="url(#glow)"
              >
                {sign.symbol}
              </text>
            </g>
          );
        })}

        {/* Degree tick marks on zodiac ring */}
        {Array.from({ length: 360 }).map((_, deg) => {
          const angle = astroToSvgAngle(deg, ascendantDegree);
          const isMajor = deg % 30 === 0;
          const isMinor = deg % 10 === 0 && !isMajor;
          const is5deg = deg % 5 === 0 && !isMajor && !isMinor;
          
          const outerTick = polarToCartesian(cx, cy, zodiacInnerRadius, angle);
          const innerTick = polarToCartesian(cx, cy, zodiacInnerRadius - (isMajor ? 8 : isMinor ? 6 : is5deg ? 4 : 2), angle);
          
          if (!isMajor && !isMinor && !is5deg && deg % 1 !== 0) return null;
          
          return (
            <line
              key={`tick-${deg}`}
              x1={outerTick.x}
              y1={outerTick.y}
              x2={innerTick.x}
              y2={innerTick.y}
              stroke={isMajor ? "#d4c4a8" : isMinor ? "#a89880" : "#6b5344"}
              strokeWidth={isMajor ? 2 : isMinor ? 1.5 : 0.5}
              opacity={isMajor ? 1 : isMinor ? 0.8 : 0.4}
            />
          );
        })}

        {/* Degree labels every 10° within each sign */}
        {Array.from({ length: 36 }).map((_, i) => {
          const deg = i * 10;
          const angle = astroToSvgAngle(deg, ascendantDegree);
          const labelPos = polarToCartesian(cx, cy, degreeTickRadius - 12, angle);
          const degInSign = deg % 30;
          
          if (degInSign === 0) return null; // Skip sign boundaries
          
          return (
            <text
              key={`deg-label-${deg}`}
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#8b7355"
              fontSize="9"
              fontFamily="serif"
            >
              {degInSign}°
            </text>
          );
        })}

        {/* Inner wheel border - double line for old-school look */}
        <circle cx={cx} cy={cy} r={zodiacInnerRadius} fill="none" stroke="#8b7355" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={zodiacInnerRadius - 3} fill="none" stroke="#6b5344" strokeWidth="1" />

        {/* House wheel background */}
        <circle cx={cx} cy={cy} r={houseOuterRadius} fill="#252018" />
        <circle cx={cx} cy={cy} r={houseOuterRadius} fill="none" stroke="#6b5344" strokeWidth="1.5" />

        {/* House cusps */}
        {houseCusps.map((cusp, i) => {
          const angle = astroToSvgAngle(cusp, ascendantDegree);
          const innerPoint = polarToCartesian(cx, cy, houseInnerRadius, angle);
          const outerPoint = polarToCartesian(cx, cy, houseOuterRadius, angle);
          
          const isAngular = i === 0 || i === 3 || i === 6 || i === 9;
          
          // Cusp degree label
          const cuspLabelPos = polarToCartesian(cx, cy, houseOuterRadius + 12, angle);
          const degInSign = Math.floor(cusp % 30);
          
          return (
            <g key={`house-${i}`}>
              <line
                x1={innerPoint.x}
                y1={innerPoint.y}
                x2={outerPoint.x}
                y2={outerPoint.y}
                stroke={isAngular ? "#d4c4a8" : "#8b7355"}
                strokeWidth={isAngular ? 2.5 : 1}
                opacity={isAngular ? 1 : 0.6}
              />
              {/* Cusp degree */}
              <text
                x={cuspLabelPos.x}
                y={cuspLabelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#a89880"
                fontSize="8"
                fontFamily="serif"
              >
                {degInSign}°
              </text>
            </g>
          );
        })}

        {/* House numbers - positioned in middle of each house */}
        {houseCusps.map((_, i) => {
          const labelAngle = getHouseLabelAngle(i);
          const labelPos = polarToCartesian(cx, cy, houseLabelRadius, labelAngle);
          const isAngular = i === 0 || i === 3 || i === 6 || i === 9;
          
          return (
            <text
              key={`house-num-${i}`}
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={isAngular ? "#d4c4a8" : "#8b7355"}
              fontSize={isAngular ? "16" : "13"}
              fontWeight={isAngular ? "bold" : "normal"}
              fontFamily="serif"
            >
              {i + 1}
            </text>
          );
        })}

        {/* Inner circle - central area */}
        <circle cx={cx} cy={cy} r={houseInnerRadius} fill="#1a1510" stroke="#8b7355" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={houseInnerRadius - 3} fill="none" stroke="#6b5344" strokeWidth="1" />

        {/* Aspect lines */}
        {aspects.map((aspect, i) => {
          const planet1 = planets.find(p => p.name === aspect.planet1);
          const planet2 = planets.find(p => p.name === aspect.planet2);
          
          if (!planet1 || !planet2) return null;
          
          const deg1 = getAbsoluteDegree(planet1.sign, planet1.degree);
          const deg2 = getAbsoluteDegree(planet2.sign, planet2.degree);
          
          const angle1 = astroToSvgAngle(deg1, ascendantDegree);
          const angle2 = astroToSvgAngle(deg2, ascendantDegree);
          
          const pos1 = polarToCartesian(cx, cy, houseInnerRadius - 8, angle1);
          const pos2 = polarToCartesian(cx, cy, houseInnerRadius - 8, angle2);
          
          const color = ASPECT_COLORS[aspect.aspect] || "#6b5344";
          
          return (
            <line
              key={`aspect-${i}`}
              x1={pos1.x}
              y1={pos1.y}
              x2={pos2.x}
              y2={pos2.y}
              stroke={color}
              strokeWidth="1.5"
              opacity="0.5"
              strokeDasharray={aspect.aspect === "Опозиция" || aspect.aspect === "Квадрат" ? "4,2" : "none"}
            />
          );
        })}

        {/* Planets */}
        {planets.map((planet, i) => {
          const absoluteDegree = getAbsoluteDegree(planet.sign, planet.degree);
          const angle = astroToSvgAngle(absoluteDegree, ascendantDegree);
          
          // Offset to avoid overlapping planets
          const offset = planets.filter((p, j) => {
            if (j >= i) return false;
            const deg = getAbsoluteDegree(p.sign, p.degree);
            return Math.abs(deg - absoluteDegree) < 10;
          }).length * 18;
          
          const pos = polarToCartesian(cx, cy, planetRadius - offset, angle);
          const symbol = PLANET_SYMBOLS[planet.name] || planet.name[0];
          
          return (
            <g key={planet.name} filter="url(#shadow)">
              <circle
                cx={pos.x}
                cy={pos.y}
                r="14"
                fill="#2a2520"
                stroke="#d4c4a8"
                strokeWidth="1.5"
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#d4c4a8"
                fontSize="16"
                fontWeight="bold"
                fontFamily="serif"
              >
                {symbol}
              </text>
              {/* Degree label */}
              <text
                x={pos.x}
                y={pos.y + 22}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#a89880"
                fontSize="9"
                fontFamily="serif"
              >
                {planet.degree}°
              </text>
            </g>
          );
        })}

        {/* Angular point markers */}
        <g>
          {/* ASC */}
          <text
            x={cx - outerRadius - 30}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#d4c4a8"
            fontSize="14"
            fontWeight="bold"
            fontFamily="serif"
            filter="url(#glow)"
          >
            ASC
          </text>
          {/* DSC */}
          <text
            x={cx + outerRadius + 30}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#a89880"
            fontSize="12"
            fontFamily="serif"
          >
            DSC
          </text>
          {/* MC */}
          <text
            x={cx}
            y={cy - outerRadius - 20}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#d4c4a8"
            fontSize="14"
            fontWeight="bold"
            fontFamily="serif"
            filter="url(#glow)"
          >
            MC
          </text>
          {/* IC */}
          <text
            x={cx}
            y={cy + outerRadius + 20}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#a89880"
            fontSize="12"
            fontFamily="serif"
          >
            IC
          </text>
        </g>

        {/* Decorative corner elements for old-school feel */}
        <circle cx={cx} cy={cy} r={outerRadius + 18} fill="none" stroke="#4a3f30" strokeWidth="1" strokeDasharray="2,4" />
      </svg>

      <Button onClick={exportToPng} variant="outline" className="gap-2 border-[#8b7355] text-[#d4c4a8] hover:bg-[#2a2520]">
        <Download className="w-4 h-4" />
        Изтегли като PNG
      </Button>
    </div>
  );
};

export default NatalChartWheel;
