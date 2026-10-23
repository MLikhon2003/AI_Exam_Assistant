import React from 'react';

// Renders an accuracy-trend line chart from an array of percentage scores (0-100).
// Kept as a plain SVG (no charting library) to match the original design exactly
// and keep the dependency list minimal.
export default function AccuracyChart({ values }) {
  const width = 480;
  const height = 160;
  const paddingTop = 20;
  const paddingBottom = 20;
  const usableHeight = height - paddingTop - paddingBottom;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - 20) + 10;
    const y = height - paddingBottom - ((v - min) / range) * usableHeight;
    return { x, y };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPoints = `${polylinePoints} ${points[points.length - 1].x},${height} ${points[0].x},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height }}>
      <line x1="0" y1="40" x2={width} y2="40" stroke="var(--line-soft)" strokeWidth="1" />
      <line x1="0" y1="80" x2={width} y2="80" stroke="var(--line-soft)" strokeWidth="1" />
      <line x1="0" y1="120" x2={width} y2="120" stroke="var(--line-soft)" strokeWidth="1" />
      <polyline points={polylinePoints} fill="none" stroke="var(--amber-deep)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={areaPoints} fill="var(--amber)" opacity="0.12" />
      <g fill="var(--amber-deep)">
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 5 : 4} stroke={i === points.length - 1 ? 'white' : 'none'} strokeWidth={i === points.length - 1 ? 2 : 0} />
        ))}
      </g>
    </svg>
  );
}
