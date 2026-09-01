interface Props {
  data: (number | null)[]
  width?: number
  height?: number
  className?: string
}

/** Sparkline ligero en SVG — no amerita traer un chart completo por celda. */
export function Sparkline({ data, width = 72, height = 26, className }: Props) {
  const pts = data.filter((v): v is number => v != null)
  if (pts.length < 2) return null

  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const rng = max - min || 1
  const step = width / (pts.length - 1)

  const coords = pts.map((v, i) => [i * step, height - ((v - min) / rng) * height] as const)
  const line = coords.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const area = `${line} L${width} ${height} L0 ${height} Z`
  const [lx, ly] = coords[coords.length - 1]

  return (
    <svg
      width={width}
      height={height + 4}
      viewBox={`0 0 ${width} ${height + 4}`}
      className={className}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <path d={area} fill="var(--color-primary)" fillOpacity={0.1} />
      <path
        d={line}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lx} cy={ly} r={2.4} fill="var(--color-primary)" stroke="var(--color-card)" strokeWidth={1.5} />
    </svg>
  )
}
