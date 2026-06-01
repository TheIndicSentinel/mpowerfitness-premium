import React from 'react';
import { Link } from 'react-router-dom';

/* ── Momentum palette (final) ─────────────────────────────────── */
const LIME   = '#c8ee44';   /* M + P — both the same lime (solid variant) */
const CREAM  = '#f3f1e8';   /* wordmark text */
const ORANGE = '#e7642b';   /* accent bar + period */

/* ── MP Monogram ──────────────────────────────────────────────── */
/* Upright Archivo 900. Both M and P are identical lime (solid).
   Straight (non-skewed) orange accent bar at bottom-right.      */
const MPMono = ({ size = 80, onLime = false }) => {
  const col  = onLime ? '#14160f' : LIME;
  const mpSz = size;
  /* Bar proportions from design: width=34, height=11, right=-4, bottom=12
     at font-size 186. Scale proportionally.                      */
  const scale  = mpSz / 186;
  const barW   = Math.round(34 * scale);
  const barH   = Math.max(2, Math.round(11 * scale));
  const barR   = Math.round(-4 * scale);
  const barB   = Math.round(12 * scale);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <span style={{
        fontFamily: "'Archivo',system-ui,sans-serif",
        fontWeight: 900,
        fontSize: mpSz,
        letterSpacing: '-.04em',
        lineHeight: .82,
        display: 'block',
        userSelect: 'none',
        color: col,
      }}>
        M<span style={{ marginLeft: '-.28em' }}>P</span>
      </span>
      {/* Straight orange accent bar */}
      <span style={{
        position: 'absolute',
        right: barR,
        bottom: barB,
        width: barW,
        height: barH,
        background: ORANGE,
        display: 'block',
      }}/>
    </div>
  );
};

/* ── Full horizontal lockup ───────────────────────────────────── */
/* height prop = target visual height of the whole mark.
   Scales: MP mark dominant, MPOWER. + FITNESS block fits within it. */
export const LogoFull = ({ height = 50, linkTo = '/', style }) => {
  const mpSz   = height * 1.22;            /* MP font-size → visual height ≈ height */
  const wordSz = height * 0.82;            /* MPOWER. font-size */
  const fitSz  = Math.max(7, height * 0.2);/* FITNESS spread font-size */
  const gap    = height * 0.18;            /* horizontal gap between mark and text */

  const logo = (
    <div
      role="img"
      aria-label="MPower Fitness"
      style={{ display: 'inline-flex', alignItems: 'center', gap, flexShrink: 0, ...style }}
    >
      <MPMono size={mpSz}/>

      <div style={{ display: 'flex', flexDirection: 'column', gap: height * 0.07 }}>
        {/* MPOWER. — upright, sets column width */}
        <div style={{
          fontFamily: "'Archivo',system-ui,sans-serif",
          fontWeight: 800,
          fontSize: wordSz,
          lineHeight: .76,
          letterSpacing: '-.02em',
          color: CREAM,
          whiteSpace: 'nowrap',
        }}>
          MPOWER<span style={{ color: ORANGE }}>.</span>
        </div>

        {/* FITNESS — upright, spreads letter-by-letter to match MPOWER. width */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: "'Archivo',system-ui,sans-serif",
          fontWeight: 700,
          fontSize: fitSz,
          color: CREAM,
          lineHeight: 1,
        }}>
          {'FITNESS'.split('').map((c, i) => <span key={i}>{c}</span>)}
        </div>
      </div>
    </div>
  );

  if (!linkTo) return logo;
  return (
    <Link
      to={linkTo}
      style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
      aria-label="MPower Fitness"
    >
      {logo}
    </Link>
  );
};

/* ── Icon-only mark ───────────────────────────────────────────── */
/* Collapsed sidebar, app icon contexts. Square, no border-radius. */
export const LogoIcon = ({ size = 40, onLime = false, style }) => (
  <div style={{
    width: size,
    height: size,
    background: onLime ? LIME : '#101310',
    border: onLime ? 'none' : '1px solid rgba(200,238,68,.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...style,
  }}>
    <MPMono size={size * 0.68} onLime={onLime}/>
  </div>
);

export const LogoMark = ({ height = 50 }) => <LogoFull height={height} linkTo={null}/>;

export default LogoFull;
