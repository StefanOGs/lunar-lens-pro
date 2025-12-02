import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// Zodiac signs with their symbols
const ZODIAC_SIGNS = [
  { name: "Овен", symbol: "♈", color: "hsl(0, 70%, 50%)" },
  { name: "Телец", symbol: "♉", color: "hsl(120, 40%, 45%)" },
  { name: "Близнаци", symbol: "♊", color: "hsl(45, 80%, 50%)" },
  { name: "Рак", symbol: "♋", color: "hsl(200, 60%, 50%)" },
  { name: "Лъв", symbol: "♌", color: "hsl(30, 90%, 55%)" },
  { name: "Дева", symbol: "♍", color: "hsl(90, 35%, 45%)" },
  { name: "Везни", symbol: "♎", color: "hsl(330, 50%, 55%)" },
  { name: "Скорпион", symbol: "♏", color: "hsl(350, 65%, 40%)" },
  { name: "Стрелец", symbol: "♐", color: "hsl(270, 50%, 55%)" },
  { name: "Козирог", symbol: "♑", color: "hsl(30, 30%, 35%)" },
  { name: "Водолей", symbol: "♒", color: "hsl(195, 70%, 50%)" },
  { name: "Риби", symbol: "♓", color: "hsl(220, 60%, 55%)" },
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

// Aspect colors
const ASPECT_COLORS: { [key: string]: string } = {
  "Конюнкция": "hsl(0, 0%, 50%)",
  "Опозиция": "hsl(0, 70%, 50%)",
  "Квадрат": "hsl(0, 70%, 50%)",
  "Тригон": "hsl(210, 70%, 50%)",
  "Секстил": "hsl(210, 70%, 50%)",
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

  const size = 600;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.45;
  const zodiacInnerRadius = size * 0.38;
  const houseOuterRadius = size * 0.35;
  const houseInnerRadius = size * 0.15;
  const planetRadius = size * 0.30;

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

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[500px] h-auto"
        style={{ background: "hsl(var(--background))" }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle cx={cx} cy={cy} r={outerRadius + 10} fill="hsl(var(--card))" />

        {/* Zodiac ring - 12 segments */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const startAngle = astroToSvgAngle((i + 1) * 30, ascendantDegree);
          const endAngle = astroToSvgAngle(i * 30, ascendantDegree);
          const midAngle = (startAngle + endAngle) / 2;
          
          const labelPos = polarToCartesian(cx, cy, (outerRadius + zodiacInnerRadius) / 2, midAngle);
          
          return (
            <g key={sign.name}>
              {/* Segment arc */}
              <path
                d={`${describeArc(cx, cy, outerRadius, startAngle, endAngle)} 
                    L ${polarToCartesian(cx, cy, zodiacInnerRadius, endAngle).x} ${polarToCartesian(cx, cy, zodiacInnerRadius, endAngle).y}
                    ${describeArc(cx, cy, zodiacInnerRadius, endAngle, startAngle).replace('M', 'L').replace(/A [^ ]+ [^ ]+ 0 [01] 0/, 'A ' + zodiacInnerRadius + ' ' + zodiacInnerRadius + ' 0 0 1')}
                    Z`}
                fill={sign.color}
                fillOpacity="0.15"
                stroke={sign.color}
                strokeWidth="1"
              />
              {/* Sign symbol */}
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={sign.color}
                fontSize="20"
                fontWeight="bold"
              >
                {sign.symbol}
              </text>
            </g>
          );
        })}

        {/* Inner wheel border */}
        <circle
          cx={cx}
          cy={cy}
          r={zodiacInnerRadius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />

        {/* House cusps */}
        {houseCusps.map((cusp, i) => {
          const angle = astroToSvgAngle(cusp, ascendantDegree);
          const innerPoint = polarToCartesian(cx, cy, houseInnerRadius, angle);
          const outerPoint = polarToCartesian(cx, cy, houseOuterRadius, angle);
          const labelPos = polarToCartesian(cx, cy, houseInnerRadius - 15, angle);
          
          const isAngular = i === 0 || i === 3 || i === 6 || i === 9;
          
          return (
            <g key={`house-${i}`}>
              <line
                x1={innerPoint.x}
                y1={innerPoint.y}
                x2={outerPoint.x}
                y2={outerPoint.y}
                stroke={isAngular ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                strokeWidth={isAngular ? 2 : 1}
                opacity={isAngular ? 1 : 0.5}
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="hsl(var(--muted-foreground))"
                fontSize="10"
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* Inner circle */}
        <circle
          cx={cx}
          cy={cy}
          r={houseInnerRadius}
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />

        {/* Aspect lines */}
        {aspects.map((aspect, i) => {
          const planet1 = planets.find(p => p.name === aspect.planet1);
          const planet2 = planets.find(p => p.name === aspect.planet2);
          
          if (!planet1 || !planet2) return null;
          
          const deg1 = getAbsoluteDegree(planet1.sign, planet1.degree);
          const deg2 = getAbsoluteDegree(planet2.sign, planet2.degree);
          
          const angle1 = astroToSvgAngle(deg1, ascendantDegree);
          const angle2 = astroToSvgAngle(deg2, ascendantDegree);
          
          const pos1 = polarToCartesian(cx, cy, houseInnerRadius - 5, angle1);
          const pos2 = polarToCartesian(cx, cy, houseInnerRadius - 5, angle2);
          
          const color = ASPECT_COLORS[aspect.aspect] || "hsl(var(--muted-foreground))";
          
          return (
            <line
              key={`aspect-${i}`}
              x1={pos1.x}
              y1={pos1.y}
              x2={pos2.x}
              y2={pos2.y}
              stroke={color}
              strokeWidth="1"
              opacity="0.4"
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
            return Math.abs(deg - absoluteDegree) < 8;
          }).length * 15;
          
          const pos = polarToCartesian(cx, cy, planetRadius - offset, angle);
          const symbol = PLANET_SYMBOLS[planet.name] || planet.name[0];
          
          return (
            <g key={planet.name} filter="url(#glow)">
              <circle
                cx={pos.x}
                cy={pos.y}
                r="12"
                fill="hsl(var(--card))"
                stroke="hsl(var(--primary))"
                strokeWidth="1"
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="hsl(var(--primary))"
                fontSize="14"
                fontWeight="bold"
              >
                {symbol}
              </text>
              {/* Degree label */}
              <text
                x={pos.x}
                y={pos.y + 20}
                textAnchor="middle"
                dominantBaseline="central"
                fill="hsl(var(--muted-foreground))"
                fontSize="8"
              >
                {planet.degree}°
              </text>
            </g>
          );
        })}

        {/* Ascendant marker */}
        <g>
          <text
            x={cx - outerRadius - 25}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fill="hsl(var(--primary))"
            fontSize="14"
            fontWeight="bold"
          >
            ASC
          </text>
        </g>

        {/* MC marker (top) */}
        <g>
          <text
            x={cx}
            y={cy - outerRadius - 15}
            textAnchor="middle"
            dominantBaseline="central"
            fill="hsl(var(--primary))"
            fontSize="14"
            fontWeight="bold"
          >
            MC
          </text>
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
