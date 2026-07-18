// web/components/ShapeDiagram.tsx

/**
 * Parses a shape code of the form `[[shape:type|key=value|key=value]]`
 * into its type and parameter map. Values are plain strings — numeric
 * parsing/fallbacks happen at render time per shape, since a teacher
 * may leave a param blank or type a non-numeric label on purpose.
 */
export function parseShapeCode(code: string): { type: string; params: Record<string, string> } {
  const inner = code.slice(2, -2); // strip leading '[[' and trailing ']]'
  const withoutPrefix = inner.startsWith('shape:') ? inner.slice(6) : inner;
  const parts = withoutPrefix.split('|');
  const type = parts[0] ?? '';
  const params: Record<string, string> = {};
  for (let i = 1; i < parts.length; i++) {
    const eq = parts[i].indexOf('=');
    if (eq === -1) continue;
    params[parts[i].slice(0, eq)] = parts[i].slice(eq + 1);
  }
  return { type, params };
}

/** True for any text segment that looks like a shape code, so callers can tell it apart from plain text or `$...$` math. */
export function isShapeBlock(segment: string) {
  return segment.startsWith('[[shape:') && segment.endsWith(']]');
}

const SVG_SIZE = { width: 140, height: 110 };

function label(key: string, params: Record<string, string>) {
  const v = params[key];
  return v !== undefined && v !== '' ? v : key;
}

function numeric(key: string, params: Record<string, string>, fallback: number) {
  const v = Number(params[key]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${SVG_SIZE.width} ${SVG_SIZE.height}`}
      width={SVG_SIZE.width}
      height={SVG_SIZE.height}
      className="inline-block align-middle"
      style={{ color: 'inherit' }}
    >
      {children}
    </svg>
  );
}

function Triangle({ params }: { params: Record<string, string> }) {
  return (
    <Wrap>
      <polygon points="70,15 15,95 125,95" fill="none" stroke="currentColor" strokeWidth={2} />
      <text x={38} y={58} fontSize={12} textAnchor="middle" fill="currentColor">
        {label('c', params)}
      </text>
      <text x={102} y={58} fontSize={12} textAnchor="middle" fill="currentColor">
        {label('b', params)}
      </text>
      <text x={70} y={108} fontSize={12} textAnchor="middle" fill="currentColor">
        {label('a', params)}
      </text>
    </Wrap>
  );
}

function RightTriangle({ params }: { params: Record<string, string> }) {
  return (
    <Wrap>
      <polygon points="20,95 120,95 20,15" fill="none" stroke="currentColor" strokeWidth={2} />
      <rect x={20} y={87} width={8} height={8} fill="none" stroke="currentColor" strokeWidth={1.5} />
      <text x={70} y={108} fontSize={12} textAnchor="middle" fill="currentColor">
        {label('base', params)}
      </text>
      <text x={10} y={58} fontSize={12} textAnchor="middle" fill="currentColor">
        {label('height', params)}
      </text>
      <text x={80} y={48} fontSize={12} textAnchor="middle" fill="currentColor">
        {label('hyp', params)}
      </text>
    </Wrap>
  );
}

function Square({ params }: { params: Record<string, string> }) {
  return (
    <Wrap>
      <rect x={30} y={15} width={80} height={80} fill="none" stroke="currentColor" strokeWidth={2} />
      <text x={70} y={10} fontSize={12} textAnchor="middle" fill="currentColor">
        {label('s', params)}
      </text>
    </Wrap>
  );
}

function Rectangle({ params }: { params: Record<string, string> }) {
  return (
    <Wrap>
      <rect x={20} y={20} width={100} height={70} fill="none" stroke="currentColor" strokeWidth={2} />
      <text x={70} y={13} fontSize={12} textAnchor="middle" fill="currentColor">
        {label('w', params)}
      </text>
      <text x={130} y={58} fontSize={12} textAnchor="middle" fill="currentColor">
        {label('h', params)}
      </text>
    </Wrap>
  );
}

function Parallelogram({ params }: { params: Record<string, string> }) {
  return (
    <Wrap>
      <polygon points="45,15 125,15 95,95 15,95" fill="none" stroke="currentColor" strokeWidth={2} />
      <text x={85} y={10} fontSize={12} textAnchor="middle" fill="currentColor">
        {label('a', params)}
      </text>
      <text x={20} y={58} fontSize={12} textAnchor="middle" fill="currentColor">
        {label('b', params)}
      </text>
    </Wrap>
  );
}

function Trapezium({ params }: { params: Record<string, string> }) {
  return (
    <Wrap>
      <polygon points="50,15 90,15 125,95 15,95" fill="none" stroke="currentColor" strokeWidth={2} />
      <text x={70} y={10} fontSize={12} textAnchor="middle" fill="currentColor">
        {label('a', params)}
      </text>
      <text x={70} y={108} fontSize={12} textAnchor="middle" fill="currentColor">
        {label('b', params)}
      </text>
      <line x1={70} y1={15} x2={70} y2={95} stroke="currentColor" strokeWidth={1} strokeDasharray="3,3" />
      <text x={78} y={58} fontSize={11} textAnchor="start" fill="currentColor">
        {label('h', params)}
      </text>
    </Wrap>
  );
}

function Circle({ params }: { params: Record<string, string> }) {
  return (
    <Wrap>
      <circle cx={70} cy={55} r={40} fill="none" stroke="currentColor" strokeWidth={2} />
      <line x1={70} y1={55} x2={110} y2={55} stroke="currentColor" strokeWidth={1.5} />
      <text x={90} y={48} fontSize={12} textAnchor="middle" fill="currentColor">
        {label('r', params)}
      </text>
    </Wrap>
  );
}

function Sector({ params }: { params: Record<string, string> }) {
  const r = 40;
  const cx = 70;
  const cy = 55;
  const deg = numeric('deg', params, 60);
  const rad = (deg * Math.PI) / 180;
  const x1 = cx + r;
  const y1 = cy;
  const x2 = cx + r * Math.cos(rad);
  const y2 = cy + r * Math.sin(rad);
  const largeArc = deg > 180 ? 1 : 0;
  const midRad = (Math.min(deg, 60) * Math.PI) / 360; // label kept close to the vertex regardless of deg size
  return (
    <Wrap>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity={0.35} strokeWidth={1.5} />
      <path
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill="currentColor"
        fillOpacity={0.12}
        stroke="currentColor"
        strokeWidth={2}
      />
      <text
        x={cx + 18 * Math.cos(midRad)}
        y={cy + 18 * Math.sin(midRad)}
        fontSize={11}
        textAnchor="middle"
        fill="currentColor"
      >
        {label('deg', params)}°
      </text>
    </Wrap>
  );
}

function Angle({ params }: { params: Record<string, string> }) {
  const vertexX = 20;
  const vertexY = 95;
  const length = 95;
  const deg = numeric('deg', params, 40);
  const rad = (deg * Math.PI) / 180;
  const x2 = vertexX + length * Math.cos(rad);
  const y2 = vertexY - length * Math.sin(rad);
  const arcR = 24;
  const arcX = vertexX + arcR * Math.cos(rad / 2);
  const arcY = vertexY - arcR * Math.sin(rad / 2);
  return (
    <Wrap>
      <line x1={vertexX} y1={vertexY} x2={120} y2={vertexY} stroke="currentColor" strokeWidth={2} />
      <line x1={vertexX} y1={vertexY} x2={x2} y2={y2} stroke="currentColor" strokeWidth={2} />
      <path
        d={`M ${vertexX + arcR} ${vertexY} A ${arcR} ${arcR} 0 0 0 ${vertexX + arcR * Math.cos(rad)} ${
          vertexY - arcR * Math.sin(rad)
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <text x={arcX + 12} y={arcY - 4} fontSize={12} textAnchor="middle" fill="currentColor">
        {label('deg', params)}°
      </text>
    </Wrap>
  );
}

function Cuboid({ params, isCube }: { params: Record<string, string>; isCube?: boolean }) {
  const dx = 25;
  const dy = -20;
  const frontX = 20;
  const frontY = 45;
  const frontW = 70;
  const frontH = 50;
  return (
    <Wrap>
      {/* back face */}
      <polygon
        points={`${frontX + dx},${frontY + dy} ${frontX + frontW + dx},${frontY + dy} ${frontX + frontW + dx},${
          frontY + frontH + dy
        } ${frontX + dx},${frontY + frontH + dy}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeOpacity={0.5}
      />
      {/* connecting edges */}
      <line x1={frontX} y1={frontY} x2={frontX + dx} y2={frontY + dy} stroke="currentColor" strokeWidth={1.2} strokeOpacity={0.5} />
      <line
        x1={frontX + frontW}
        y1={frontY}
        x2={frontX + frontW + dx}
        y2={frontY + dy}
        stroke="currentColor"
        strokeWidth={1.2}
        strokeOpacity={0.5}
      />
      <line
        x1={frontX + frontW}
        y1={frontY + frontH}
        x2={frontX + frontW + dx}
        y2={frontY + frontH + dy}
        stroke="currentColor"
        strokeWidth={1.2}
        strokeOpacity={0.5}
      />
      {/* front face */}
      <rect x={frontX} y={frontY} width={frontW} height={frontH} fill="none" stroke="currentColor" strokeWidth={2} />
      <text x={frontX + frontW / 2} y={frontY + frontH + 15} fontSize={11} textAnchor="middle" fill="currentColor">
        {label(isCube ? 's' : 'l', params)}
      </text>
      <text x={frontX - 10} y={frontY + frontH / 2} fontSize={11} textAnchor="middle" fill="currentColor">
        {label(isCube ? 's' : 'h', params)}
      </text>
      {!isCube && (
        <text
          x={frontX + frontW + dx / 2 + 6}
          y={frontY + dy / 2 - 4}
          fontSize={11}
          textAnchor="middle"
          fill="currentColor"
        >
          {label('w', params)}
        </text>
      )}
    </Wrap>
  );
}

/**
 * Renders a shape code like `[[shape:triangle|a=5|b=6|c=7]]` as inline
 * SVG. Unrecognized shape types fail visibly (a small red tag) rather
 * than silently — same principle as MathText's own malformed-equation
 * fallback: never take down the whole question over one bad block.
 */
export default function ShapeDiagram({ code }: { code: string }) {
  const { type, params } = parseShapeCode(code);
  switch (type) {
    case 'triangle':
      return <Triangle params={params} />;
    case 'right-triangle':
      return <RightTriangle params={params} />;
    case 'square':
      return <Square params={params} />;
    case 'rectangle':
      return <Rectangle params={params} />;
    case 'parallelogram':
      return <Parallelogram params={params} />;
    case 'trapezium':
      return <Trapezium params={params} />;
    case 'circle':
      return <Circle params={params} />;
    case 'sector':
      return <Sector params={params} />;
    case 'angle':
      return <Angle params={params} />;
    case 'cube':
      return <Cuboid params={params} isCube />;
    case 'cuboid':
      return <Cuboid params={params} />;
    default:
      return <span className="text-red-500">{code}</span>;
  }
}