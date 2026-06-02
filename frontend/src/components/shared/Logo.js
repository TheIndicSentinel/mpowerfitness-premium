import React from 'react';
import { Link } from 'react-router-dom';

/* ──────────────────────────────────────────────────────────────────
   MPower Fitness — Green badge logo
   Faithful recreation of "MPower Fitness Logo - Green.html".
   Reference proportions are keyed to an 88px badge; everything scales
   off the `height` prop (= badge size) so the lockup stays pixel-true
   at any size.
   ────────────────────────────────────────────────────────────────── */

const GREEN   = '#c4f000';   /* MP letters + separators */
const BADGE_BG = '#111410';  /* badge fill */
const BADGE_BORDER = '#2a3318';
const TAG_COLOR = '#7e8a52';  /* tagline words (lightened from #4a5230 for legibility on dark surfaces) */
const FONT = "'Montserrat', system-ui, sans-serif";

/* ── MP Badge ─────────────────────────────────────────────────────── */
const MPBadge = ({ size = 88 }) => (
  <div style={{
    width: size,
    height: size,
    background: BADGE_BG,
    borderRadius: Math.max(4, size * 0.102),
    border: `${Math.max(1, size * 0.017)}px solid ${BADGE_BORDER}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: 'inset 0 1px 0 rgba(196,240,0,0.06), 0 0 0 0.5px rgba(196,240,0,0.04)',
  }}>
    <div style={{
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size * 0.5,
      color: GREEN,
      letterSpacing: '-0.068em',
      lineHeight: 1,
      marginTop: -(size * 0.011),
      userSelect: 'none',
    }}>MP</div>
  </div>
);

/* ── Full lockup: badge + wordmark + tagline ──────────────────────── */
export const LogoFull = ({ height = 50, linkTo = '/', showTagline = true, style }) => {
  /* height === badge size (the dominant element) */
  const badge   = height;
  const gap     = height * 0.295;       /* badge ↔ text */
  const brandSz = height * 0.432;       /* "Mpower" / "Fitness" */
  const wordGap = height * 0.125;       /* space between words */
  const blockGap = height * 0.102;      /* brand ↔ tagline */
  const tagSz   = height * 0.119;       /* tagline word size — strict design ratio */
  const tagline = showTagline;

  const logo = (
    <div
      role="img"
      aria-label="MPower Fitness"
      style={{ display: 'inline-flex', alignItems: 'center', gap, userSelect: 'none', ...style }}
    >
      <MPBadge size={badge}/>

      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: blockGap, alignItems: 'flex-start' }}>
        {/* Wordmark */}
        <div style={{ fontFamily: FONT, lineHeight: 1, display: 'flex', alignItems: 'baseline', whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 800, fontSize: brandSz, color: '#ffffff', letterSpacing: '-0.013em' }}>Mpower</span>
          <span style={{ display: 'inline-block', width: wordGap }}/>
          <span style={{ fontWeight: 300, fontSize: brandSz, color: '#ffffff', letterSpacing: '0.013em' }}>Fitness</span>
        </div>

        {/* Tagline — stretches to match wordmark width */}
        {tagline && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span style={tagWordStyle(tagSz)}>Strength</span>
            <span style={tagSepStyle(tagSz)}>|</span>
            <span style={tagWordStyle(tagSz)}>Health</span>
            <span style={tagSepStyle(tagSz)}>|</span>
            <span style={tagWordStyle(tagSz)}>Nutrition</span>
          </div>
        )}
      </div>
    </div>
  );

  if (!linkTo) return logo;
  return (
    <Link to={linkTo} style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }} aria-label="MPower Fitness">
      {logo}
    </Link>
  );
};

const tagWordStyle = (size) => ({
  fontFamily: FONT,
  fontSize: size,
  fontWeight: 600,
  letterSpacing: '0.08em',
  color: TAG_COLOR,
  textTransform: 'uppercase',
});
const tagSepStyle = (size) => ({
  fontFamily: FONT,
  fontSize: size * 0.95,
  fontWeight: 300,
  color: GREEN,
  opacity: 0.7,
});

/* ── Icon-only mark — the MP badge (collapsed sidebar, app icon) ──── */
export const LogoIcon = ({ size = 40, style }) => (
  <div style={style}>
    <MPBadge size={size}/>
  </div>
);

export const LogoMark = ({ height = 50 }) => <LogoFull height={height} linkTo={null}/>;

export default LogoFull;
