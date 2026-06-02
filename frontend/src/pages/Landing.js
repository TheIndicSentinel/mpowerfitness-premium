import React, { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { LogoFull } from '../components/shared/Logo';
import Footer from '../components/shared/Footer';
import useAuthStore from '../store/authStore';

const ConsultationModal = lazy(() => import('../components/shared/ConsultationModal'));

/* ── Blueprint tokens (mirror of globals.css for inline use) ──── */
const VOLT    = '#c3dc6a';
const AMBER   = '#e8743f';
const LINE    = 'rgba(212,249,94,.16)';
const LINE2   = 'rgba(255,255,255,.07)';
const LINE3   = 'rgba(255,255,255,.12)';
const BG      = '#08090b';
const CHAR    = '#0e0f12';
const S1      = '#16181d';

/* ── Scroll-reveal wrapper ────────────────────────────────────── */
const FadeIn = ({ children, delay = 0, style = {} }) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : 'translateY(22px)',
      transition: `opacity .65s ease ${delay}ms, transform .65s ease ${delay}ms`,
      ...style,
    }}>{children}</div>
  );
};

/* ── Blueprint grid backdrop ──────────────────────────────────── */
const GridBg = ({ style = {} }) => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: `linear-gradient(${LINE2} 1px,transparent 1px),linear-gradient(90deg,${LINE2} 1px,transparent 1px)`,
    backgroundSize: '52px 52px',
    ...style,
  }}/>
);

/* ── Crosshair marker ─────────────────────────────────────────── */
const Crosshair = ({ style = {} }) => (
  <div style={{ position: 'absolute', width: 16, height: 16, pointerEvents: 'none', ...style }}>
    <div style={{ position:'absolute', left:'50%', top:0, width:1, height:'100%', background:VOLT, opacity:.4, transform:'translateX(-.5px)' }}/>
    <div style={{ position:'absolute', top:'50%', left:0, height:1, width:'100%', background:VOLT, opacity:.4, transform:'translateY(-.5px)' }}/>
  </div>
);

/* ── Angular clip-path button (inline, for sections not using .btn) */
const BtnVolt = ({ children, onClick, href, style = {} }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    fontFamily: "'Archivo',sans-serif", fontWeight: 800, fontSize: 13.5,
    letterSpacing: '.05em', textTransform: 'uppercase',
    padding: '15px 28px', border: '1.5px solid transparent',
    cursor: 'pointer', background: VOLT, color: '#14160c',
    clipPath: 'polygon(0 0,100% 0,100% 100%,11px 100%,0 calc(100% - 11px))',
    boxShadow: `0 10px 26px -16px rgba(195,220,106,.45)`,
    transition: '.2s', textDecoration: 'none', ...style,
  };
  if (href) return <a href={href} style={base}>{children}</a>;
  return <button onClick={onClick} style={base}>{children}</button>;
};
const BtnGhost = ({ children, onClick, href, style = {} }) => {
  const [hov, setHov] = useState(false);
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    fontFamily: "'Archivo',sans-serif", fontWeight: 800, fontSize: 13.5,
    letterSpacing: '.05em', textTransform: 'uppercase',
    padding: '15px 28px', border: `1.5px solid ${hov ? VOLT : LINE3}`,
    cursor: 'pointer', background: hov ? `rgba(195,220,106,.12)` : 'rgba(255,255,255,.015)',
    color: hov ? VOLT : '#f3f4ef',
    clipPath: 'polygon(0 0,100% 0,100% 100%,11px 100%,0 calc(100% - 11px))',
    transition: '.2s', textDecoration: 'none', ...style,
  };
  if (href) return <a href={href} style={base} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{children}</a>;
  return <button onClick={onClick} style={base} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{children}</button>;
};

/* ── Mono eyebrow label ───────────────────────────────────────── */
const Eyebrow = ({ children }) => (
  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize: 11.5, fontWeight: 500, letterSpacing: '.28em', textTransform: 'uppercase', color: VOLT }}>
    {children}
  </span>
);

/* ── Hero rotating gallery ────────────────────────────────────── */
const GALLERY_LABELS = [
  'Brand image 1 — raw strength / iron',
  'Brand image 2 — conditioning / sweat',
  'Brand image 3 — focus / discipline',
  'Brand image 4 — transformation / win',
];
const WORDS = ['Discipline', 'Strength', 'Conditioning', 'Results'];
/* Placeholder shown behind the real image while it loads / if missing */
const SlidePlaceholder = ({ label }) => (
  <>
    <div style={{
      position:'absolute', inset:0,
      background:'linear-gradient(160deg,#131419,#0d0e12)',
      backgroundImage:`linear-gradient(rgba(195,220,106,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(195,220,106,.035) 1px,transparent 1px)`,
      backgroundSize:'44px 44px',
    }}/>
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, zIndex:1 }}>
      <div style={{ border:`1px solid rgba(195,220,106,.22)`, width:56, height:56, display:'grid', placeItems:'center' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={VOLT} strokeWidth="1.2" opacity=".45">
          <rect x="3" y="3" width="18" height="18"/>
          <circle cx="8.5" cy="8.5" r="1.5" fill={VOLT} stroke="none" opacity=".6"/>
          <polyline points="21,15 16,10 5,21" opacity=".7"/>
        </svg>
      </div>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(195,220,106,.38)', textAlign:'center', maxWidth:160, lineHeight:1.5 }}>{label}</span>
    </div>
  </>
);

/*
 * GallerySlide — placeholder always underneath, real image fades in on load.
 * imgFile is a filename from manifest.json (e.g. "strengthncondition.jpg").
 * If imgFile is null/undefined the placeholder stays visible.
 */
const GallerySlide = ({ imgFile, label, active }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ position:'absolute', inset:0, opacity: active ? 1 : 0, transition:'opacity .9s ease' }}>
      <SlidePlaceholder label={label}/>
      {imgFile && (
        <img
          src={`/hero/${imgFile}`}
          alt=""
          style={{
            position:'absolute', top:0, left:0, width:'100%', height:'100%',
            objectFit:'cover', display:'block', zIndex:2,
            opacity: loaded ? 1 : 0,
            transition:'opacity .5s ease',
          }}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
};

const HeroRight = () => {
  const [slide, setSlide] = useState(0);
  const [wordVis, setWordVis] = useState(true);
  const [word, setWord] = useState(WORDS[0]);
  /* heroImages loaded from /hero/manifest.json — any filename, any count */
  const [heroImages, setHeroImages] = useState([]);

  useEffect(() => {
    /* Fetch manifest; silently shows placeholders if manifest missing */
    fetch('/hero/manifest.json')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => setHeroImages(Array.isArray(data) ? data : (data.images || [])))
      .catch(() => {});

    const t = setInterval(() => {
      setSlide(i => (i + 1) % 4);
      setWordVis(false);
      setTimeout(() => {
        setWord(w => WORDS[(WORDS.indexOf(w) + 1) % WORDS.length]);
        setWordVis(true);
      }, 220);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  /* Cycle images across the 4 slots (e.g. 1 image repeats on all 4) */
  const imgForSlot = (i) => heroImages.length > 0 ? heroImages[i % heroImages.length] : null;

  return (
    <div style={{ position:'relative', borderLeft:`1px solid ${LINE2}`, minHeight:580 }} className="hero-right-bp">

      {/* Gallery slides — fills full panel, placeholder underneath, real img fades in */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden' }}>
        {GALLERY_LABELS.map((label, i) => (
          <GallerySlide key={i} imgFile={imgForSlot(i)} label={label} active={i === slide}/>
        ))}
      </div>

      {/* Scrim overlays */}
      <div style={{ position:'absolute', inset:0, zIndex:2, pointerEvents:'none', background:`linear-gradient(180deg,rgba(8,9,11,.35) 0%,transparent 30%,transparent 60%,rgba(8,9,11,.55) 100%),linear-gradient(90deg,rgba(8,9,11,.5),transparent 22%)` }}/>

      {/* Corner brackets — sit exactly on the panel edges */}
      <div style={{ position:'absolute', top:0, left:0, width:32, height:32, border:`2px solid ${VOLT}`, borderRight:0, borderBottom:0, zIndex:4 }}/>
      <div style={{ position:'absolute', bottom:0, right:0, width:32, height:32, border:`2px solid ${VOLT}`, borderLeft:0, borderTop:0, zIndex:4 }}/>

      {/* Progress dots (inset from TL bracket with clear spacing) */}
      <div style={{ position:'absolute', top:18, left:50, zIndex:5, display:'flex', gap:7 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width:22, height:3, background: i === slide ? VOLT : 'rgba(255,255,255,.22)', transition:'background .3s' }}/>
        ))}
      </div>

      {/* Float card (top-right, inset from bracket) */}
      <div style={{ position:'absolute', top:18, right:18, zIndex:5, background:'rgba(14,15,18,.72)', backdropFilter:'blur(14px)', border:`1px solid ${LINE}`, padding:'16px 18px', minWidth:168, boxShadow:'0 20px 50px -20px rgba(0,0,0,.7)' }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:'.16em', textTransform:'uppercase', color:'#9b9da4' }}>Output index</div>
        <div style={{ fontFamily:"'Anton',sans-serif", fontSize:30, color:VOLT, marginTop:5, lineHeight:1 }}>+35%</div>
        <div style={{ height:5, background:'rgba(255,255,255,.08)', marginTop:12, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:'0 35% 0 0', background:`linear-gradient(90deg,#9bb53f,${VOLT})` }}/>
        </div>
      </div>

      {/* Attitude word (bottom-left, inside bracket) */}
      <div style={{ position:'absolute', left:24, bottom:74, zIndex:5 }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:'.2em', textTransform:'uppercase', color:VOLT, marginBottom:6 }}>// This is</div>
        <div style={{
          fontFamily:"'Anton',sans-serif", textTransform:'uppercase',
          fontSize:'clamp(32px,3.8vw,50px)', lineHeight:.88, color:'#fff', letterSpacing:'.01em',
          fontStyle:'italic', transform:'skewX(-7deg)', transformOrigin:'left',
          opacity: wordVis ? 1 : 0, transition:'opacity .25s ease',
        }}>{word}</div>
      </div>

      {/* Readout (bottom bar) */}
      <div style={{ position:'absolute', left:24, bottom:24, zIndex:5, fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:'.12em', textTransform:'uppercase', color:VOLT, background:'rgba(8,9,11,.66)', backdropFilter:'blur(6px)', border:`1px solid ${LINE}`, padding:'7px 11px' }}>
        STATUS: <span style={{ color:'#9b9da4' }}>SYSTEM ONLINE</span>
      </div>
    </div>
  );
};

/* ── Landing ──────────────────────────────────────────────────── */
const Landing = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showConsult, setShowConsult] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [email, setEmail] = useState('');
  const { user: authUser, isAuthenticated } = useAuthStore();
  const [browserConsultDone, setBrowserConsultDone] = useState(() => {
    try { return localStorage.getItem('mpower-consultation-done') === '1'; } catch { return false; }
  });
  const consultationDone = (isAuthenticated && authUser?.consultationDone) || browserConsultDone;
  const refreshConsultDone = () => {
    try { setBrowserConsultDone(localStorage.getItem('mpower-consultation-done') === '1'); } catch (_) {}
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (y <= 10) {
        setNavVisible(true);
      } else if (y > lastScrollY.current + 6) {
        setNavVisible(false);   // scrolling down → hide
      } else if (y < lastScrollY.current - 6) {
        setNavVisible(true);    // scrolling up  → show
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const wrap = { maxWidth: 1280, margin: '0 auto', padding: '0 32px' };

  /* ── Programs ──────────────────────────────── */
  const programs = [
    { code:'P-01', slug:'fat-loss',  ico:'🔥', name:'Fat-Loss Engine',   desc:'High-output, sustainable fat loss built around food you\'ll actually eat. The protocol recalibrates every week against your real numbers.', stat:'-21 lbs', statLbl:'Avg / 12 weeks', tag:'Most popular', hot:true },
    { code:'P-02', slug:'strength',  ico:'💪', name:'Strength Matrix',   desc:'Progressive-overload programming with auto-regulated load — tracked rep by rep to build real, measurable strength.', stat:'+35%', statLbl:'Avg squat max', tag:'Explore →', hot:false },
    { code:'P-03', slug:'pcod',      ico:'🌸', name:'Hormonal / PCOD',   desc:'Condition-aware training and nutrition built with specialists for hormonal balance and sustainable results.', stat:'1:1', statLbl:'Specialist-led', tag:'Explore →', hot:false },
    { code:'P-04', slug:'metabolic', ico:'🩺', name:'Metabolic Health',  desc:'Safe, calibrated coaching for diabetes and thyroid that runs alongside your medical care.', stat:'24/7', statLbl:'Coach support', tag:'Explore →', hot:false },
    { code:'P-05', slug:'beginner',  ico:'🌱', name:'Zero-to-One',       desc:'Brand new to training? A beginner on-ramp engineered to remove all overwhelm and build the habit first.', stat:'0→1', statLbl:'Beginner path', tag:'Explore →', hot:false },
    { code:'P-06', slug:'nutrition', ico:'🥗', name:'Nutrition Engine',  desc:'Smart, flexible macro guidance — no crash diets, no banned foods. Built to fit the way you actually live.', stat:'92%', statLbl:'Adherence', tag:'Explore →', hot:false },
  ];

  /* ── Reviews ───────────────────────────────── */
  const reviews = [
    { init:'P', bg:VOLT, q:'"My PCOD protocol finally <b>worked with my body.</b>"', name:'Priya M.' },
    { init:'A', bg:AMBER, q:'"Adapts to a hotel room. <b>Consistent for the first time.</b>"', name:'Arjun K.' },
    { init:'R', bg:VOLT, q:'"Went from zero to a <b>6-month streak.</b>"', name:'Ritika S.' },
    { init:'S', bg:AMBER, q:'"Type-2 diabetic. <b>Levels stable, strength up.</b>"', name:'Sanjay R.' },
    { init:'N', bg:VOLT, q:'"The analytics keep me <b>brutally honest.</b>"', name:'Neha T.' },
  ];

  const navBg = scrolled ? 'rgba(8,9,11,.96)' : 'rgba(8,9,11,.78)';

  return (
    <div style={{ background: BG, minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAV — fixed, hides on scroll-down, reappears on scroll-up ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
        background: navBg, backdropFilter: 'blur(18px)',
        borderBottom: `1px solid ${LINE2}`,
        transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform .35s ease, background .3s',
      }}>
        <nav style={{ ...wrap, display:'flex', alignItems:'center', justifyContent:'space-between', height:84 }}>

          <LogoFull height={52}/>

          {/* Desktop links */}
          <div className="landing-nav-links" style={{ display:'flex', gap:34, fontFamily:"'JetBrains Mono',monospace", fontWeight:500, fontSize:13, letterSpacing:'.04em', color:'#9b9da4', textTransform:'uppercase' }}>
            <a href="#method" style={{ color:'inherit', textDecoration:'none', transition:'color .2s' }} onMouseEnter={e=>e.target.style.color=VOLT} onMouseLeave={e=>e.target.style.color='#9b9da4'}>Method</a>
            <a href="#programs" style={{ color:'inherit', textDecoration:'none', transition:'color .2s' }} onMouseEnter={e=>e.target.style.color=VOLT} onMouseLeave={e=>e.target.style.color='#9b9da4'}>Programs</a>
            <a href="#proof" style={{ color:'inherit', textDecoration:'none', transition:'color .2s' }} onMouseEnter={e=>e.target.style.color=VOLT} onMouseLeave={e=>e.target.style.color='#9b9da4'}>Proof</a>
            <a href="#pricing" style={{ color:'inherit', textDecoration:'none', transition:'color .2s' }} onMouseEnter={e=>e.target.style.color=VOLT} onMouseLeave={e=>e.target.style.color='#9b9da4'}>Pricing</a>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <Link to="/login" style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, letterSpacing:'.04em', color:'#9b9da4', textTransform:'uppercase', textDecoration:'none', transition:'color .2s' }}
              className="landing-nav-links"
              onMouseEnter={e=>e.currentTarget.style.color='#f3f4ef'} onMouseLeave={e=>e.currentTarget.style.color='#9b9da4'}>
              Log in
            </Link>
            <button onClick={() => setShowConsult(true)} className="btn btn-primary hide-mobile" style={{ padding:'11px 20px', fontSize:12 }}>
              Free Consultation
            </button>
            {/* Mobile hamburger */}
            <button className="landing-hamburger" onClick={() => setMobileOpen(o => !o)}
              aria-label="Menu" aria-expanded={mobileOpen}
              style={{ display:'none', background:'none', border:`1px solid ${LINE3}`, cursor:'pointer', color:'#9b9da4', padding:'6px 8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div style={{ background:'rgba(8,9,11,.97)', borderTop:`1px solid ${LINE2}`, padding:'14px 32px 22px', display:'flex', flexDirection:'column', gap:2, animation:'slideDown .22s ease' }}>
            {[['#method','Method'],['#programs','Programs'],['#proof','Proof'],['#pricing','Pricing']].map(([h,l]) => (
              <a key={h} href={h} className="landing-mobile-link" onClick={() => setMobileOpen(false)} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, letterSpacing:'.08em', textTransform:'uppercase' }}>{l}</a>
            ))}
            <Link to="/login" className="landing-mobile-link" onClick={() => setMobileOpen(false)} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, letterSpacing:'.08em', textTransform:'uppercase' }}>Log in</Link>
            <button className="btn btn-primary btn-full" style={{ marginTop:12, clipPath:'none' }}
              onClick={() => { setMobileOpen(false); setShowConsult(true); }}>Free Consultation →</button>
          </div>
        )}
      </header>

      {/* Spacer — accounts for fixed header height */}
      <div style={{ height: 84 }}/>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ position:'relative', overflow:'hidden', borderBottom:`1px solid ${LINE2}` }}>
        <GridBg style={{ WebkitMaskImage:'radial-gradient(120% 100% at 28% 18%,#000 32%,transparent 76%)', maskImage:'radial-gradient(120% 100% at 28% 18%,#000 32%,transparent 76%)', opacity:.85 }}/>
        {/* Haze */}
        <div style={{ position:'absolute', width:680, height:680, borderRadius:'50%', background:`radial-gradient(circle,rgba(195,220,106,.1),transparent 62%)`, top:-220, left:-120, pointerEvents:'none', willChange:'transform' }}/>
        <Crosshair style={{ top:120, left:'6%' }}/>
        <Crosshair style={{ bottom:90, left:'40%' }}/>

        <div style={{ ...wrap, position:'relative', zIndex:3 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1.04fr .96fr', alignItems:'stretch' }} className="hero-inner">

            {/* LEFT */}
            <div style={{ padding:'64px 48px 64px 0', display:'flex', flexDirection:'column', justifyContent:'center' }} className="hero-left-bp">
              {/* Kicker */}
              <div style={{ display:'inline-flex', alignItems:'center', gap:11, fontFamily:"'JetBrains Mono',monospace", fontSize:11.5, letterSpacing:'.18em', textTransform:'uppercase', color:VOLT, border:`1px solid ${LINE}`, padding:'7px 14px', width:'max-content', background:'rgba(195,220,106,.06)' }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:VOLT, animation:'pulse 2s ease infinite' }}/>
                Precision digital coaching
              </div>

              {/* Hero headline */}
              <h1 style={{ fontFamily:"'Anton',sans-serif", fontSize:'clamp(54px,7.4vw,108px)', margin:'24px 0 0', lineHeight:.94, textTransform:'uppercase', letterSpacing:'.005em', fontStyle:'italic', transform:'skewX(-7deg)', transformOrigin:'left' }}>
                <span style={{ display:'block', color:'#f3f4ef', lineHeight:.94 }}>Engineer</span>
                <span style={{ display:'block', color:'#f3f4ef', lineHeight:.94 }}>your</span>
                <span style={{ display:'block', color:'transparent', WebkitTextStroke:'.35px rgba(243,244,239,.8)', lineHeight:.94, marginTop:6 }}>potential<span style={{ color:AMBER, WebkitTextStroke:0, marginLeft:'.05em' }}>.</span></span>
              </h1>

              {/* Hook */}
              <p style={{ fontFamily:"'Archivo',sans-serif", fontWeight:600, fontStyle:'italic', fontSize:'clamp(17px,1.7vw,21px)', color:'#f3f4ef', marginTop:24, maxWidth:430, lineHeight:1.4 }}>
                Stop training on guesswork.{' '}
                <span style={{ color:VOLT, fontStyle:'normal', fontWeight:800 }}>Start building the body the data says you're capable of.</span>
              </p>

              <p style={{ fontFamily:"'JetBrains Mono',monospace", marginTop:16, fontSize:13.5, lineHeight:1.7, color:'#9b9da4', maxWidth:420 }}>
                Personalised protocols, certified coaches and real-time analytics — engineered around your numbers, your goals and your life.
              </p>

              <div style={{ display:'flex', gap:14, marginTop:34, flexWrap:'wrap' }}>
                <BtnVolt onClick={() => setShowConsult(true)}>Free Consultation →</BtnVolt>
                <BtnGhost href="#method">See the method</BtnGhost>
              </div>

              {/* Stats bar */}
              <div style={{ display:'flex', marginTop:44, borderTop:`1px solid ${LINE2}` }}>
                {[['30K+','Sessions logged'],['200+','Certified coaches'],['4.9★','Avg rating']].map(([v, l], i) => (
                  <div key={l} style={{ flex:1, padding:'20px 20px 4px', borderRight: i < 2 ? `1px solid ${LINE2}` : 'none', paddingLeft: i > 0 ? 20 : 0 }}>
                    <b style={{ fontFamily:"'Anton',sans-serif", fontSize:32, lineHeight:1, display:'block', textTransform:'uppercase' }}>
                      {v.replace('+','')}{v.includes('+') && <em style={{ fontStyle:'normal', color:VOLT }}>+</em>}
                      {v.includes('★') && <em style={{ fontStyle:'normal', color:VOLT }}>★</em>}
                    </b>
                    <small style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', color:'#5f6168', display:'block', marginTop:8 }}>{l}</small>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — rotating image gallery */}
            <HeroRight/>
          </div>
        </div>
      </section>

      {/* ── TICKER ───────────────────────────────────────────────── */}
      <div style={{ marginTop:52, borderTop:`1px solid ${LINE2}`, borderBottom:`1px solid ${LINE2}`, background:CHAR, overflow:'hidden' }}>
        <div style={{ display:'flex', gap:48, padding:'14px 0', whiteSpace:'nowrap', animation:'marquee 30s linear infinite', width:'max-content' }}>
          {['Tailored protocols','Real-time analytics','Certified coaches','Macro tracking','Adaptive load','Condition-aware',
            'Tailored protocols','Real-time analytics','Certified coaches','Macro tracking','Adaptive load','Condition-aware'].map((t, i) => (
            <span key={i} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, letterSpacing:'.1em', textTransform:'uppercase', color:'#9b9da4', display:'inline-flex', alignItems:'center', gap:48 }}>
              {t}
              <span style={{ display:'inline-block', width:5, height:5, background:AMBER, transform:'rotate(45deg)', flexShrink:0 }}/>
            </span>
          ))}
        </div>
      </div>

      {/* ── METHOD ───────────────────────────────────────────────── */}
      <section style={{ padding:'112px 0', position:'relative' }} id="method">
        <div style={wrap}>
          <FadeIn>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:30, marginBottom:62, flexWrap:'wrap' }}>
            <div style={{ maxWidth:680 }}>
              <Eyebrow>// The method</Eyebrow>
              <h2 style={{ fontFamily:"'Anton',sans-serif", fontSize:'clamp(38px,5vw,74px)', marginTop:18, lineHeight:.88, textTransform:'uppercase', letterSpacing:'.005em', fontWeight:400 }}>
                Three phases.{' '}
                <span style={{ color:'transparent', WebkitTextStroke:`1.2px #9b9da4` }}>Zero guesswork.</span>
              </h2>
            </div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, letterSpacing:'.16em', color:'#5f6168', textTransform:'uppercase', paddingBottom:8 }}>FIG.01 — HOW IT WORKS</div>
          </div>

          </FadeIn>
          <FadeIn delay={120}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', border:`1px solid ${LINE2}`, background:CHAR }} className="steps-grid">
            {[
              { n:'01', h:'Diagnostic', p:'A precise intake on your goals, lifestyle, training history and any conditions — PCOD, thyroid, diabetes. Two minutes, fully calibrated.' },
              { n:'02', h:'Engineer', p:'We match you to a certified coach and generate a personalised protocol: training load, nutrition macros and recovery, all in one system.' },
              { n:'03', h:'Execute', p:'Train anywhere, log every set, and watch the protocol recalibrate against your real output week over week.' },
            ].map(({ n, h, p }, i) => (
              <div key={n} className="step-cell" style={{ padding:'38px 32px', borderRight: i < 2 ? `1px solid ${LINE2}` : 'none', position:'relative' }}>
                <div style={{ fontFamily:"'Anton',sans-serif", fontSize:60, color:'transparent', WebkitTextStroke:`1.2px ${LINE2}`, lineHeight:.8 }}>{n}</div>
                <h3 style={{ fontFamily:"'Archivo',sans-serif", fontWeight:900, textTransform:'uppercase', fontSize:20, margin:'18px 0 10px', letterSpacing:'.01em' }}>{h}</h3>
                <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12.5, lineHeight:1.6, color:'#9b9da4' }}>{p}</p>
              </div>
            ))}
          </div>
          </FadeIn>
        </div>
      </section>

      {/* ── PROGRAMS ─────────────────────────────────────────────── */}
      <section style={{ paddingBottom:'112px' }} id="programs">
        <div style={wrap}>
          <FadeIn>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:30, marginBottom:62, flexWrap:'wrap' }}>
            <div style={{ maxWidth:680 }}>
              <Eyebrow>// Programs</Eyebrow>
              <h2 style={{ fontFamily:"'Anton',sans-serif", fontSize:'clamp(38px,5vw,74px)', marginTop:18, lineHeight:.88, textTransform:'uppercase', fontWeight:400 }}>
                A protocol for{' '}
                <span style={{ color:'transparent', WebkitTextStroke:`1.2px #9b9da4` }}>every objective.</span>
              </h2>
            </div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, letterSpacing:'.16em', color:'#5f6168', textTransform:'uppercase', paddingBottom:8 }}>FIG.02 — ALL PROGRAMS</div>
          </div>
          </FadeIn>
          <FadeIn delay={100}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }} className="pgrid">
            {programs.map(({ code, slug, ico, name, desc, stat, statLbl, tag, hot }) => (
              <Link key={code} to={`/programs/${slug}`}
                className="pcard-bp"
                style={{ border:`1px solid ${hot ? LINE : LINE2}`, background: hot ? `linear-gradient(180deg,rgba(195,220,106,.08),transparent 62%)` : CHAR, padding:28, display:'flex', flexDirection:'column', cursor:'pointer', transition:'.2s', position:'relative', textDecoration:'none', color:'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = LINE; e.currentTarget.style.background = hot ? `linear-gradient(180deg,rgba(195,220,106,.1),transparent 62%)` : '#131419'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = hot ? LINE : LINE2; e.currentTarget.style.background = hot ? `linear-gradient(180deg,rgba(195,220,106,.08),transparent 62%)` : CHAR; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.14em', color: hot ? VOLT : '#5f6168', textTransform:'uppercase' }}>{code}</span>
                  <span style={{ fontSize:24, lineHeight:1 }}>{ico}</span>
                </div>
                <h3 style={{ fontFamily:"'Archivo',sans-serif", fontWeight:900, textTransform:'uppercase', fontSize:21, letterSpacing:'.01em', margin:'22px 0 10px', lineHeight:1.04 }}>{name}</h3>
                <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12.5, lineHeight:1.65, color:'#9b9da4', flex:1 }}>{desc}</p>
                <div style={{ marginTop:22, paddingTop:16, borderTop:`1px solid ${LINE2}`, display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
                  <div>
                    <b style={{ fontFamily:"'Anton',sans-serif", fontSize:24, color:VOLT, display:'block', lineHeight:1 }}>{stat}</b>
                    <small style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:'.1em', textTransform:'uppercase', color:'#5f6168', display:'block', marginTop:5 }}>{statLbl}</small>
                  </div>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.1em', textTransform:'uppercase', color:VOLT }}>{tag}</span>
                </div>
              </Link>
            ))}
          </div>
          </FadeIn>
        </div>
      </section>

      {/* ── PROOF / TESTIMONIALS ─────────────────────────────────── */}
      <section style={{ paddingBottom:'112px' }} id="proof">
        <div style={wrap}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:30, marginBottom:62, flexWrap:'wrap' }}>
            <div style={{ maxWidth:680 }}>
              <Eyebrow>// Proof in motion</Eyebrow>
              <h2 style={{ fontFamily:"'Anton',sans-serif", fontSize:'clamp(38px,5vw,74px)', marginTop:18, lineHeight:.88, textTransform:'uppercase', fontWeight:400 }}>
                Results,{' '}
                <span style={{ color:'transparent', WebkitTextStroke:`1.2px #9b9da4` }}>measured.</span>
              </h2>
            </div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, letterSpacing:'.16em', color:'#5f6168', textTransform:'uppercase', paddingBottom:8 }}>FIG.03 — CLIENT RESULTS</div>
          </div>

          {/* Before / After cards — Blueprint style */}
          <FadeIn delay={100}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }} className="ba-grid">
            {[
              {
                name:'Priya M.', sub:'Fat-Loss Engine · Bengaluru', week:12,
                metrics:[{val:'12',lbl:'Weeks',neg:false},{val:'−21',lbl:'lbs',neg:true},{val:'+35%',lbl:'Squat max',neg:false}],
              },
              {
                name:'Arjun K.', sub:'Strength Matrix · Mumbai', week:16,
                metrics:[{val:'16',lbl:'Weeks',neg:false},{val:'+8.4',lbl:'kg lean',neg:false},{val:'+50%',lbl:'Pull vol.',neg:false}],
              },
            ].map(({ name, sub, week, metrics }) => (
              <div key={name} style={{ border:`1px solid ${LINE2}`, background:CHAR, overflow:'hidden' }}>
                {/* Split image area */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', position:'relative', height:260 }}>
                  {/* Before slot */}
                  <div style={{
                    background:'#0d0e12',
                    backgroundImage:`linear-gradient(rgba(195,220,106,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(195,220,106,.03) 1px,transparent 1px)`,
                    backgroundSize:'36px 36px',
                    position:'relative', display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={VOLT} strokeWidth="1" opacity=".25">
                      <rect x="3" y="3" width="18" height="18"/><circle cx="8.5" cy="8.5" r="1.5" fill={VOLT} stroke="none"/><polyline points="21,15 16,10 5,21"/>
                    </svg>
                    <span style={{ position:'absolute', top:12, left:12, fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:'.14em', textTransform:'uppercase', background:'rgba(8,9,11,.78)', backdropFilter:'blur(4px)', padding:'5px 9px', color:'#f3f4ef', border:`1px solid ${LINE2}`, zIndex:4 }}>Before</span>
                  </div>
                  {/* After slot */}
                  <div style={{
                    background:'#0f1009',
                    backgroundImage:`linear-gradient(rgba(195,220,106,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(195,220,106,.05) 1px,transparent 1px)`,
                    backgroundSize:'36px 36px',
                    position:'relative', display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={VOLT} strokeWidth="1" opacity=".4">
                      <rect x="3" y="3" width="18" height="18"/><circle cx="8.5" cy="8.5" r="1.5" fill={VOLT} stroke="none"/><polyline points="21,15 16,10 5,21"/>
                    </svg>
                    <span style={{ position:'absolute', top:12, right:12, fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:'.14em', textTransform:'uppercase', background:'rgba(8,9,11,.78)', backdropFilter:'blur(4px)', padding:'5px 9px', color:VOLT, border:`1px solid ${LINE}`, zIndex:4 }}>Week {week}</span>
                  </div>
                  {/* Volt divider */}
                  <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:1, background:VOLT, opacity:.6, transform:'translateX(-.5px)', zIndex:3 }}/>
                </div>
                {/* Data row */}
                <div style={{ display:'flex', alignItems:'stretch', borderTop:`1px solid ${LINE2}` }}>
                  <div style={{ padding:'18px 20px', flex:1, borderRight:`1px solid ${LINE2}` }}>
                    <b style={{ fontFamily:"'Archivo',sans-serif", fontWeight:800, fontSize:15, display:'block' }}>{name}</b>
                    <small style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', color:'#5f6168', display:'block', marginTop:5 }}>{sub}</small>
                  </div>
                  {metrics.map(({ val, lbl, neg }) => (
                    <div key={lbl} style={{ padding:'18px', borderRight:`1px solid ${LINE2}`, textAlign:'center', flex:'0 0 auto' }}>
                      <b style={{ fontFamily:"'Anton',sans-serif", fontSize:26, lineHeight:1, display:'block', color: neg ? AMBER : VOLT }}>{val}</b>
                      <small style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:'.1em', textTransform:'uppercase', color:'#5f6168', display:'block', marginTop:6 }}>{lbl}</small>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          </FadeIn>
        </div>

        {/* Review marquee */}
        <div style={{ marginTop:48, borderTop:`1px solid ${LINE2}`, borderBottom:`1px solid ${LINE2}`, background:CHAR, overflow:'hidden', padding:'22px 0', position:'relative' }}>
          <div style={{ position:'absolute', top:0, bottom:0, left:0, width:120, background:`linear-gradient(90deg,${CHAR},transparent)`, zIndex:3, pointerEvents:'none' }}/>
          <div style={{ position:'absolute', top:0, bottom:0, right:0, width:120, background:`linear-gradient(270deg,${CHAR},transparent)`, zIndex:3, pointerEvents:'none' }}/>
          <div style={{ display:'flex', gap:16, width:'max-content', animation:'marquee 42s linear infinite' }}>
            {[...reviews, ...reviews].map(({ init, bg, q, name }, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:13, border:`1px solid ${LINE2}`, background:BG, padding:'13px 18px', minWidth:330 }}>
                <div style={{ width:38, height:38, flexShrink:0, display:'grid', placeItems:'center', fontFamily:"'Archivo',sans-serif", fontWeight:800, color: bg === VOLT ? '#14160c' : '#fff', background:bg, fontSize:14 }}>{init}</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, lineHeight:1.4, color:'#f3f4ef' }}>
                  <span style={{ color:VOLT, letterSpacing:1, fontSize:10, display:'block', marginBottom:3 }}>★★★★★</span>
                  <span dangerouslySetInnerHTML={{ __html: q + ' — <b style="color:' + VOLT + '">' + name + '</b>' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING MATRIX ───────────────────────────────────────── */}
      <section style={{ paddingBottom:'112px' }} id="pricing">
        <div style={wrap}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:30, marginBottom:62, flexWrap:'wrap' }}>
            <div style={{ maxWidth:680 }}>
              <Eyebrow>// Plans</Eyebrow>
              <h2 style={{ fontFamily:"'Anton',sans-serif", fontSize:'clamp(38px,5vw,74px)', marginTop:18, lineHeight:.88, textTransform:'uppercase', fontWeight:400 }}>
                Pick your{' '}
                <span style={{ color:'transparent', WebkitTextStroke:`1.2px #9b9da4` }}>protocol.</span>
              </h2>
            </div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, letterSpacing:'.16em', color:'#5f6168', textTransform:'uppercase', paddingBottom:8 }}>FIG.04 — SUBSCRIPTION PLANS</div>
          </div>

          <div style={{ border:`1px solid ${LINE3}`, background:CHAR, overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:680 }}>
              <colgroup><col/><col/><col style={{ background:'rgba(195,220,106,.06)' }}/><col/></colgroup>
              <thead>
                <tr>
                  <th style={{ ...thBase, background:'#131419' }}>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.16em', textTransform:'uppercase', color:'#5f6168', fontWeight:500 }}>Specification</span>
                  </th>
                  {[
                    { name:'Starter', price:'Free', hot:false },
                    { name:'Pro', price:'₹1,499/mo', hot:true },
                    { name:'Elite', price:'₹2,999/mo', hot:false },
                  ].map(({ name, price, hot }) => (
                    <th key={name} style={{ ...thBase, background: hot ? 'rgba(195,220,106,.08)' : '#131419', position:'relative', verticalAlign:'bottom' }}>
                      {hot && <span style={{ position:'absolute', top:10, right:16, fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'#14160c', background:VOLT, padding:'3px 8px' }}>Most chosen</span>}
                      <span style={{ fontFamily:"'Archivo',sans-serif", fontWeight:900, textTransform:'uppercase', fontSize:16, letterSpacing:'.02em', display:'block' }}>{name}</span>
                      <span style={{ fontFamily:"'Anton',sans-serif", fontSize:32, lineHeight:1, display:'block', marginTop:8, color: hot ? VOLT : '#f3f4ef' }}>{price.replace('/mo','')}<span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'#5f6168', fontWeight:400 }}>{price.includes('/mo') ? '/mo' : ''}</span></span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Personalised diagnostic', '✓', '✓', '✓', [false,true,false]],
                  ['Adaptive workout protocol', 'Starter plan', 'Full + weekly recalibration', 'Full + weekly recalibration', [false,false,false]],
                  ['Dedicated certified coach', '—', '✓', '✓', [false,false,false]],
                  ['Nutrition & macro tracking', '—', '✓', '✓', [false,false,false]],
                  ['Real-time analytics', 'Basic', 'Advanced', 'Advanced', [false,false,false]],
                  ['Chat support', '—', 'Unlimited', 'Priority', [false,false,false]],
                  ['1-on-1 video coaching', '—', '—', 'Weekly', [false,false,false]],
                  ['Condition specialist access', '—', '—', '✓', [false,false,false]],
                ].map(([feat, s, p, e, highlights]) => (
                  <tr key={feat}>
                    <td style={{ ...tdBase }}><span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:'#9b9da4' }}>{feat}</span></td>
                    <td style={{ ...tdBase }}><span style={{ ...cellStyle(s) }}>{s}</span></td>
                    <td style={{ ...tdBase, background:'rgba(195,220,106,.04)' }}><span style={{ ...cellStyle(p) }}>{p}</span></td>
                    <td style={{ ...tdBase }}><span style={{ ...cellStyle(e) }}>{e}</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ ...tdBase, border:0 }}/>
                  <td style={{ ...tdBase, border:0 }}>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize:11, padding:'10px 16px' }} onClick={() => setShowConsult(true)}>Free Consultation</button>
                  </td>
                  <td style={{ ...tdBase, border:0, background:'rgba(195,220,106,.04)' }}>
                    <button className="btn btn-primary btn-sm" style={{ fontSize:11, padding:'10px 16px' }} onClick={() => setShowConsult(true)}>Free Consultation →</button>
                  </td>
                  <td style={{ ...tdBase, border:0 }}>
                    <Link to="/register" className="btn btn-ghost btn-sm" style={{ fontSize:11, padding:'10px 16px', display:'inline-flex', textDecoration:'none' }}>Choose Elite →</Link>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* ── GATE / CTA ───────────────────────────────────────────── */}
      <section style={{ position:'relative', overflow:'hidden', borderTop:`1px solid ${LINE2}` }} id="gate">
        <GridBg style={{ opacity:1, WebkitMaskImage:'radial-gradient(80% 130% at 50% 120%,#000 20%,transparent 70%)', maskImage:'radial-gradient(80% 130% at 50% 120%,#000 20%,transparent 70%)' }}/>
        <div style={{ position:'absolute', left:'50%', bottom:-340, width:760, height:760, borderRadius:'50%', background:'radial-gradient(circle,rgba(195,220,106,.1),transparent 62%)', transform:'translateX(-50%)', pointerEvents:'none' }}/>
        <div style={{ ...wrap, position:'relative', zIndex:3, textAlign:'center', padding:'120px 0' }}>
          <Eyebrow>// Start here</Eyebrow>
          <h2 style={{ fontFamily:"'Anton',sans-serif", fontSize:'clamp(44px,6.6vw,100px)', lineHeight:.88, textTransform:'uppercase', fontWeight:400, marginTop:18, fontStyle:'italic', transform:'skewX(-7deg)', transformOrigin:'center' }}>
            Ready to unlock<br/>
            your <span style={{ color:VOLT }}>M-Power?</span>
          </h2>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, letterSpacing:'.04em', color:'#9b9da4', margin:'26px auto 0', maxWidth:500, lineHeight:1.6 }}>
            Book a free consultation, run the 2-minute diagnostic, and get your first engineered protocol — free. No contracts. Cancel anytime.
          </p>
          <form onSubmit={e => { e.preventDefault(); setShowConsult(true); }}
            className="gate-form"
            style={{ display:'flex', maxWidth:540, margin:'38px auto 0', border:`1.5px solid ${LINE3}`, background:'rgba(14,15,18,.6)', backdropFilter:'blur(8px)', transition:'.2s' }}
            onFocus={e => e.currentTarget.style.borderColor = VOLT}
            onBlur={e => e.currentTarget.style.borderColor = LINE3}>
            <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
              style={{ flex:1, background:'transparent', border:0, outline:0, color:'#f3f4ef', fontFamily:"'JetBrains Mono',monospace", fontSize:14, padding:'0 20px', letterSpacing:'.02em', minWidth:0 }}/>
            <button type="submit" className="btn btn-primary gate-submit" style={{ clipPath:'none', flexShrink:0 }}>Free Consultation →</button>
          </form>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.08em', color:'#5f6168', marginTop:18, textTransform:'uppercase' }}>
            7-day free trial · No card required
          </div>
        </div>
      </section>

      <Footer variant="landing"/>

      {showConsult && (
        <Suspense fallback={null}>
          <ConsultationModal onClose={() => { setShowConsult(false); refreshConsultDone(); }}/>
        </Suspense>
      )}

      <style>{`
        @keyframes marquee  { from{transform:translateX(0)}  to{transform:translateX(-50%)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes slideDown{ from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:none} }

        /* ── Nav: hide desktop links + show hamburger on mobile ── */
        @media(max-width:900px){
          .landing-nav-links { display:none !important; }
          .landing-hamburger { display:inline-flex !important; }
        }

        /* ── Hero: stack on mobile ──────────────────────────────── */
        @media(max-width:900px){
          .hero-inner     { grid-template-columns:1fr !important; }
          .hero-left-bp   { padding:48px 0 36px !important; }
          .hero-right-bp  { border-left:0 !important; border-top:1px solid rgba(255,255,255,.07) !important; min-height:360px !important; }
        }

        /* ── Method steps: borders on mobile stack ──────────────── */
        @media(max-width:760px){
          .steps-grid { grid-template-columns:1fr !important; }
          .step-cell  { border-right:none !important; border-bottom:1px solid rgba(255,255,255,.07) !important; }
          .step-cell:last-child { border-bottom:none !important; }
        }

        /* ── Programs grid ──────────────────────────────────────── */
        @media(max-width:900px){ .pgrid { grid-template-columns:1fr 1fr !important; } }
        @media(max-width:520px){ .pgrid { grid-template-columns:1fr !important; } }

        /* ── Before/after cards ─────────────────────────────────── */
        @media(max-width:760px){ .ba-grid { grid-template-columns:1fr !important; } }

        /* ── Gate CTA form: stack on narrow screens ─────────────── */
        @media(max-width:600px){
          .gate-form        { flex-direction:column !important; }
          .gate-form input  { padding:16px 20px !important; width:100% !important; }
          .gate-submit      { width:100% !important; justify-content:center !important; }
        }

        /* ── Footer consistent with page ────────────────────────── */
        @media(max-width:600px){
          .foot { grid-template-columns:1fr 1fr !important; }
        }
        @media(max-width:400px){
          .foot { grid-template-columns:1fr !important; }
        }
      `}</style>
    </div>
  );
};

/* ── Table cell helpers ───────────────────────────────────────── */
const thBase = {
  textAlign: 'left', padding: '20px 24px',
  borderBottom: `1px solid rgba(255,255,255,.07)`,
  borderRight: `1px solid rgba(255,255,255,.07)`,
  verticalAlign: 'bottom',
};
const tdBase = {
  textAlign: 'left', padding: '16px 24px',
  borderBottom: `1px solid rgba(255,255,255,.07)`,
  borderRight: `1px solid rgba(255,255,255,.07)`,
};
const cellStyle = (v) => ({
  fontFamily: "'JetBrains Mono',monospace", fontSize: 13,
  color: v === '✓' ? '#c3dc6a' : v === '—' ? '#5f6168' : '#f3f4ef',
  fontWeight: v === '✓' ? 700 : 400,
});

export default Landing;
