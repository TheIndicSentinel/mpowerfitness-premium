import React, { lazy, Suspense, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { InfoLayout } from './About';

const ConsultationModal = lazy(() => import('../../components/shared/ConsultationModal'));

/* ── Blueprint tokens ─────────────────────────────────────────── */
const VOLT  = '#c3dc6a';
const AMBER = '#e8743f';
const LINE  = 'rgba(212,249,94,.16)';
const LINE2 = 'rgba(255,255,255,.07)';
const CHAR  = '#0e0f12';
const S1    = '#16181d';

/* ── Program data ─────────────────────────────────────────────── */
const PROGRAMS = {
  'fat-loss': {
    code:'P-01', icon:'🔥', name:'Fat-Loss Engine',
    tagline:'High-output, sustainable fat loss — built around food you\'ll actually eat.',
    duration:'8–16 weeks', audience:'General fitness · Weight loss · Busy professionals',
    stat:{ val:'−21', unit:'lbs', label:'Average over 12 weeks' },
    about:'The Fat-Loss Engine is a precision protocol, not a crash diet. We start with your current food preferences, lifestyle constraints, and activity levels to build a sustainable calorie deficit that actually works long-term. Your macros recalibrate every week against your real logged numbers — not a static target that stops working after month one.',
    features:[
      { icon:'📊', title:'Weekly Macro Recalibration', desc:'Targets adjust automatically based on what you actually logged — not a static number that plateaus.' },
      { icon:'🍽️', title:'No Food Banning', desc:'Flexible dieting (IIFYM). Pizza, rice, chapati — all included when they fit your macros.' },
      { icon:'🏋️', title:'Progressive Resistance + Cardio', desc:'Programming that burns fat while actively preserving muscle mass through progressive overload.' },
      { icon:'📱', title:'Weekly Coach Check-ins', desc:'Video or chat review every week — your coach adjusts the plan based on your real results.' },
      { icon:'📸', title:'Body Composition Tracking', desc:'Progress photos, measurements, and scale weight — triangulated so you see what\'s really changing.' },
      { icon:'🔄', title:'Plateau Breaker Protocol', desc:'Pre-built refeed days, macro cycling, and training variation deployed when fat loss stalls.' },
    ],
    process:[
      { n:'01', title:'Intake & Diagnostic', desc:'15 minutes on your food history, current weight, goal, health conditions, and lifestyle. No generic templates.' },
      { n:'02', title:'Protocol Build', desc:'Your coach sets starting macros, builds a 4-week training block, and creates an Indian-food macro guide for your preferences.' },
      { n:'03', title:'Execute & Log', desc:'Train, eat, and log daily in the app. Your coach monitors and messages if they spot anything needing adjustment.' },
      { n:'04', title:'Weekly Review', desc:'Every Sunday, your coach reviews weight trend, adherence, and performance. Targets update for the next week.' },
    ],
    results:[
      { val:'−21 lbs', label:'Average fat loss over 12 weeks' },
      { val:'94%', label:'Maintain results at 6 months' },
      { val:'4.9★', label:'Average client rating' },
    ],
  },
  'strength': {
    code:'P-02', icon:'💪', name:'Strength Matrix',
    tagline:'Progressive-overload programming tracked rep by rep.',
    duration:'12–20 weeks', audience:'Intermediate · Advanced · Competitive athletes',
    stat:{ val:'+35%', unit:'', label:'Avg squat max in 16 weeks' },
    about:'The Strength Matrix is a data-driven resistance protocol built entirely on the science of progressive overload. Every set, rep, and load is tracked, and the system auto-adjusts your next session targets based on actual performance — not a spreadsheet someone made in 2018.',
    features:[
      { icon:'📈', title:'Auto-Regulated Load Progression', desc:'Your last performance drives your next targets. Overperform → progress faster. Underperform → intelligent deload.' },
      { icon:'🎯', title:'Hypertrophy or Strength Focus', desc:'Choose your primary goal. The matrix adjusts volume and intensity ratios accordingly throughout the programme.' },
      { icon:'📋', title:'3–5x / Week Programming', desc:'Full-body, upper/lower, or PPL — structured to your schedule and recovery capacity.' },
      { icon:'🔄', title:'Deload Weeks Built In', desc:'Strategic deloads every 4–6 weeks prevent overtraining and maximise long-term adaptation.' },
      { icon:'🏠', title:'Home or Gym Adaptive', desc:'Hotel room or full commercial gym — every session scales to your available equipment automatically.' },
      { icon:'📊', title:'Live 1RM Tracking', desc:'Your estimated 1-rep maxes update after every session so you see strength gains in real numbers.' },
    ],
    process:[
      { n:'01', title:'Movement Screening', desc:'Assess your current strength baseline, mobility limitations, and training history to set accurate starting loads.' },
      { n:'02', title:'Block Programming', desc:'A 4-week mesocycle built around your goal: accumulation (volume) → intensification (load) → peaking (max strength).' },
      { n:'03', title:'Rep-by-Rep Logging', desc:'Log every set as you do it. The system analyses performance and updates your next session targets instantly.' },
      { n:'04', title:'Monthly Strength Test', desc:'Every 4 weeks, test your main lifts. Real 1RM data feeds into the next programming block.' },
    ],
    results:[
      { val:'+35%', label:'Average squat max increase (16 wks)' },
      { val:'+28%', label:'Average deadlift max increase (16 wks)' },
      { val:'3.2×', label:'Bodyweight squat achieved on average' },
    ],
  },
  'pcod': {
    code:'P-03', icon:'🌸', name:'Hormonal / PCOD',
    tagline:'Cycle-synced training and nutrition built for hormonal balance.',
    duration:'16+ weeks', audience:'PCOD · PCOS · Hormonal conditions',
    stat:{ val:'1:1', unit:'', label:'Specialist-led coaching' },
    about:'Generic fitness programmes often worsen hormonal symptoms because they\'re designed for a body without PCOD or PCOS. This programme is built with specialists in hormonal health — training that phases with your cycle, nutrition that reduces inflammation, and a coach who actually understands what you\'re dealing with.',
    features:[
      { icon:'🩺', title:'Specialist-Matched Coach', desc:'You\'re matched with a coach specifically trained in PCOD/PCOS — not a generalist.' },
      { icon:'🌙', title:'Cycle-Synced Training', desc:'Intensity and nutrition targets phase around your menstrual cycle to work with your hormones, not against them.' },
      { icon:'🥗', title:'Anti-Inflammatory Nutrition', desc:'Meal plans built around foods that reduce inflammation and support insulin sensitivity — key for PCOD management.' },
      { icon:'💊', title:'Medication-Aware Programming', desc:'Your protocol accounts for Metformin and other medications, and coordinates with your medical team.' },
      { icon:'📞', title:'GP Communication Support', desc:'We help you communicate progress to your doctor and interpret test results in the context of your training.' },
      { icon:'♾️', title:'Long-Term Lifestyle Focus', desc:'No crash phases. This is about building a sustainable routine that keeps symptoms managed for life.' },
    ],
    process:[
      { n:'01', title:'Health History Review', desc:'A detailed review of your diagnosis, medications, symptoms, test results, and previous treatment history.' },
      { n:'02', title:'Specialist Protocol Design', desc:'Your coach designs a cycle-phased training plan and anti-inflammatory nutrition protocol for your specific condition.' },
      { n:'03', title:'Symptom & Progress Tracking', desc:'Track energy, mood, cycle regularity, and body composition in one place — shared with your coach.' },
      { n:'04', title:'Monthly Specialist Review', desc:'A dedicated 30-min video review each month with your specialist coach to assess progress and adjust the approach.' },
    ],
    results:[
      { val:'87%', label:'Report improved cycle regularity' },
      { val:'−12 lbs', label:'Average fat loss over 16 weeks' },
      { val:'92%', label:'Report reduced symptoms' },
    ],
  },
  'metabolic': {
    code:'P-04', icon:'🩺', name:'Metabolic Health',
    tagline:'Safe, calibrated coaching for diabetes & thyroid alongside your medical care.',
    duration:'Ongoing', audience:'Type 2 Diabetes · Thyroid conditions · Pre-diabetes',
    stat:{ val:'24/7', unit:'', label:'Coach support available' },
    about:'Exercising with Type 2 diabetes or a thyroid condition requires careful calibration. The wrong training load or nutrition approach can spike blood sugar, trigger fatigue, or worsen your symptoms. This programme puts evidence-based safety at the centre of every decision — and works in parallel with your medical team.',
    features:[
      { icon:'💉', title:'Blood Sugar-Aware Programming', desc:'Training timing, intensity, and carbohydrate intake are coordinated to keep blood glucose stable during and after exercise.' },
      { icon:'🦋', title:'Thyroid-Safe Load Management', desc:'Training volumes that don\'t place excessive stress on the HPA axis or exacerbate fatigue.' },
      { icon:'🤝', title:'Medical Team Collaboration', desc:'With your permission, we communicate directly with your GP or endocrinologist to align on safe parameters.' },
      { icon:'📊', title:'Metabolic Marker Tracking', desc:'HbA1c, fasting glucose, TSH — we track what matters and translate numbers into training adjustments.' },
      { icon:'🛡️', title:'Safety-First Escalation Protocol', desc:'Clear protocol for when to pause training and refer back to your medical team immediately.' },
      { icon:'💬', title:'24/7 Chat Support', desc:'Questions about a food, a workout, or a symptom? Your coach responds within 2 hours, any day.' },
    ],
    process:[
      { n:'01', title:'Medical History Review', desc:'We review your diagnosis, current medications, recent blood work, and any exercise restrictions from your doctor.' },
      { n:'02', title:'Safe Baseline Establishment', desc:'We start conservatively — building a movement baseline and food awareness before progressing intensity.' },
      { n:'03', title:'Gradual Evidence-Based Progression', desc:'Load and volume increase slowly and deliberately, with blood glucose and fatigue as the key progress indicators.' },
      { n:'04', title:'Quarterly Medical Alignment', desc:'Before your quarterly GP visit, we prepare a progress summary you can share with your doctor.' },
    ],
    results:[
      { val:'−0.4%', label:'Avg HbA1c reduction (12 weeks)' },
      { val:'89%', label:'Report improved energy levels' },
      { val:'24/7', label:'Coach availability' },
    ],
  },
  'beginner': {
    code:'P-05', icon:'🌱', name:'Zero-to-One',
    tagline:'From zero fitness experience to a strong, consistent habit.',
    duration:'8–12 weeks', audience:'Complete beginners · No equipment · First-timers',
    stat:{ val:'0→1', unit:'', label:'Beginner to consistent' },
    about:'Starting from zero is the hardest part — not because of fitness, but because of confusion. Zero-to-One removes every barrier that makes beginners quit in the first month: not knowing what to do, doing too much too fast, and losing momentum before seeing results. This is your first chapter.',
    features:[
      { icon:'🎯', title:'No Equipment Required', desc:'Start with just your bodyweight. No gym membership, no dumbbells — just you and a bit of floor space.' },
      { icon:'🧠', title:'Habit Architecture', desc:'We build the workout habit before we build the workout. Small wins, daily check-ins, and streak tracking from day one.' },
      { icon:'🚶', title:'Truly Gentle Progression', desc:'Week 1 is genuinely easy. The challenge builds gradually — no shock to the system, no brutal first-week soreness.' },
      { icon:'🍽️', title:'Nutrition Basics Included', desc:'Simple eating principles (not a strict diet) that give you enough energy to actually train.' },
      { icon:'📹', title:'Exercise Video Library', desc:'Every exercise has a clear demo video. You\'ll never be confused about form.' },
      { icon:'🎉', title:'Milestone Celebrations', desc:'First workout, first week, first month — every milestone gets marked to keep your momentum alive.' },
    ],
    process:[
      { n:'01', title:'Baseline Assessment', desc:'A 10-minute questionnaire about your current fitness, health, goals, and available time. Completely judgment-free.' },
      { n:'02', title:'Week 1: Just Show Up', desc:'Three 20-minute sessions. Nothing intense. The only goal is to build the habit of showing up.' },
      { n:'03', title:'Weeks 2–6: Build the Foundation', desc:'Gradual increases in duration, volume, and intensity — always challenging enough to progress, never overwhelming.' },
      { n:'04', title:'Weeks 7–12: Find Your Stride', desc:'By week 8 you have a consistent routine. Week 12 you graduate to a full training programme.' },
    ],
    results:[
      { val:'4 wks', label:'Avg time to consistent habit' },
      { val:'3×/wk', label:'Average training frequency achieved' },
      { val:'96%', label:'Complete the full 8-week programme' },
    ],
  },
  'nutrition': {
    code:'P-06', icon:'🥗', name:'Nutrition Engine',
    tagline:'Flexible macro guidance — no crash diets, no banned foods.',
    duration:'Ongoing', audience:'All goals · Indian diet · Flexible dieters',
    stat:{ val:'92%', unit:'', label:'Average adherence rate' },
    about:'Most nutrition plans fail because they\'re too rigid to survive real life. The Nutrition Engine is built on flexible dieting — you get personalised macro targets, a library of Indian-food macro data, and the skills to hit your targets without giving up the food you love. No crash diets, no 30-day cleanses, no banned foods.',
    features:[
      { icon:'🇮🇳', title:'Indian Food Macro Database', desc:'Dal, sabzi, chapati, rice, idli, dosa — all pre-calculated so you never have to guess.' },
      { icon:'🔄', title:'Flexible Dieting (IIFYM)', desc:'If it fits your macros, you eat it. The system shows you how to include social meals, sweets, and restaurant food.' },
      { icon:'📊', title:'Monthly Macro Recalibration', desc:'Targets update monthly based on progress — not a static number that becomes irrelevant after 4 weeks.' },
      { icon:'💊', title:'Evidence-Based Supplement Guide', desc:'What actually works, what\'s a waste of money — no sales pitch, just evidence.' },
      { icon:'🍳', title:'Recipe Ideas & Smart Swaps', desc:'High-protein versions of your favourite foods and easy macro-friendly meal ideas for busy days.' },
      { icon:'📱', title:'Same-Day Food Logging Help', desc:'Not sure if something fits? Message your nutritionist before you eat it and get a real answer.' },
    ],
    process:[
      { n:'01', title:'Food Preference Audit', desc:'We map every food you love, hate, and are allergic to — building a plan around what you\'ll actually eat.' },
      { n:'02', title:'Macro Target Setting', desc:'TDEE calculation, macro split, and a personalised calorie target based on your goal and lifestyle.' },
      { n:'03', title:'Logging & Habit Building', desc:'Daily food logging with real-time macro tracking. Your nutritionist checks in weekly to review patterns.' },
      { n:'04', title:'Monthly Target Refresh', desc:'Every 4 weeks we review your progress data and update your targets. This is how you keep progressing for months.' },
    ],
    results:[
      { val:'92%', label:'Average adherence rate' },
      { val:'−8 lbs', label:'Average fat loss over 8 weeks' },
      { val:'4 wks', label:'Avg time to build the logging habit' },
    ],
  },
};

/* ── Label chip ───────────────────────────────────────────────── */
const Chip = ({ children, color = VOLT }) => (
  <span style={{
    display:'inline-block', fontFamily:"'JetBrains Mono',monospace", fontSize:10,
    fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase',
    color, border:`1px solid ${color === VOLT ? LINE : 'rgba(232,116,63,.3)'}`,
    background: color === VOLT ? 'rgba(195,220,106,.06)' : 'rgba(232,116,63,.06)',
    padding:'4px 10px',
  }}>{children}</span>
);

/* ── ProgramPage ──────────────────────────────────────────────── */
const ProgramPage = () => {
  const { slug } = useParams();
  const [showConsult, setShowConsult] = useState(false);
  const prog = PROGRAMS[slug];

  if (!prog) {
    return (
      <InfoLayout title="Program Not Found" description="">
        <div style={{ textAlign:'center', padding:'80px 0' }}>
          <div style={{ fontFamily:"'Anton',sans-serif", fontSize:64, color:'rgba(195,220,106,.2)', lineHeight:1 }}>404</div>
          <h1 style={{ fontFamily:"'Archivo',sans-serif", fontWeight:900, fontSize:28, margin:'16px 0 10px' }}>Program not found</h1>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", color:'#9b9da4', marginBottom:28 }}>Check the URL or browse all programs below.</p>
          <Link to="/#programs" className="btn btn-primary">View all programs</Link>
        </div>
      </InfoLayout>
    );
  }

  const { code, icon, name, tagline, duration, audience, stat, about, features, process, results } = prog;

  return (
    <InfoLayout title={name} description={tagline}>

      {/* ── Program hero ── */}
      <div style={{ marginBottom:56 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, flexWrap:'wrap' }}>
          <Chip>{code}</Chip>
          <Chip color={AMBER}>{duration}</Chip>
          <Chip color="#9b9da4">{audience}</Chip>
        </div>

        <h1 style={{
          fontFamily:"'Anton',sans-serif", fontWeight:400,
          fontSize:'clamp(36px,5vw,64px)', lineHeight:.88,
          textTransform:'uppercase', letterSpacing:'.005em',
          marginBottom:20,
        }}>
          <span style={{ fontSize:'1.4em', marginRight:16 }}>{icon}</span>
          {name}
        </h1>

        <p style={{
          fontFamily:"'Archivo',sans-serif", fontWeight:600, fontStyle:'italic',
          fontSize:'clamp(17px,2vw,22px)', color:'#f3f4ef',
          maxWidth:640, lineHeight:1.4, marginBottom:28,
        }}>{tagline}</p>

        {/* Stat highlight */}
        <div style={{ display:'inline-flex', alignItems:'baseline', gap:8, border:`1px solid ${LINE}`, background:'rgba(195,220,106,.06)', padding:'16px 24px' }}>
          <span style={{ fontFamily:"'Anton',sans-serif", fontSize:48, color:VOLT, lineHeight:1 }}>{stat.val}{stat.unit}</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.14em', textTransform:'uppercase', color:'#9b9da4' }}>{stat.label}</span>
        </div>
      </div>

      {/* ── About ── */}
      <section style={{ marginBottom:56, borderLeft:`2px solid ${VOLT}`, paddingLeft:24 }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.22em', textTransform:'uppercase', color:VOLT, display:'block', marginBottom:12 }}>// About this programme</span>
        <p style={{ fontFamily:"'Archivo',sans-serif", fontSize:17, lineHeight:1.7, color:'#e8e9e4', maxWidth:720 }}>{about}</p>
      </section>

      {/* ── Features grid ── */}
      <section style={{ marginBottom:56 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:28, flexWrap:'wrap', gap:12 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.22em', textTransform:'uppercase', color:VOLT }}>// What's included</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.16em', color:'#5f6168', textTransform:'uppercase' }}>FIG.01 — FEATURES</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
          {features.map(({ icon: fi, title, desc }) => (
            <div key={title} style={{ border:`1px solid ${LINE2}`, background:CHAR, padding:22 }}>
              <div style={{ fontSize:24, marginBottom:12 }}>{fi}</div>
              <h3 style={{ fontFamily:"'Archivo',sans-serif", fontWeight:800, fontSize:15, textTransform:'uppercase', letterSpacing:'.01em', marginBottom:8 }}>{title}</h3>
              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, lineHeight:1.65, color:'#9b9da4' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Process steps ── */}
      <section style={{ marginBottom:56 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:28, flexWrap:'wrap', gap:12 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.22em', textTransform:'uppercase', color:VOLT }}>// How it works</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.16em', color:'#5f6168', textTransform:'uppercase' }}>FIG.02 — PROCESS</span>
        </div>
        <div style={{ border:`1px solid ${LINE2}`, background:CHAR }}>
          {process.map(({ n, title, desc }, i) => (
            <div key={n} style={{ display:'flex', gap:24, padding:'24px 28px', borderBottom: i < process.length - 1 ? `1px solid ${LINE2}` : 'none', alignItems:'flex-start' }}>
              <div style={{ fontFamily:"'Anton',sans-serif", fontSize:44, color:'rgba(195,220,106,.2)', lineHeight:.82, flexShrink:0, width:44 }}>{n}</div>
              <div>
                <h3 style={{ fontFamily:"'Archivo',sans-serif", fontWeight:900, textTransform:'uppercase', fontSize:16, letterSpacing:'.02em', marginBottom:8 }}>{title}</h3>
                <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12.5, lineHeight:1.65, color:'#9b9da4' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Results ── */}
      <section style={{ marginBottom:56 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:28, flexWrap:'wrap', gap:12 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.22em', textTransform:'uppercase', color:VOLT }}>// Expected results</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.16em', color:'#5f6168', textTransform:'uppercase' }}>FIG.03 — OUTCOMES</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }} className="results-grid">
          {results.map(({ val, label }) => (
            <div key={label} style={{ border:`1px solid ${LINE}`, background:'rgba(195,220,106,.04)', padding:'24px 20px' }}>
              <div style={{ fontFamily:"'Anton',sans-serif", fontSize:40, color:VOLT, lineHeight:1, marginBottom:8 }}>{val}</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:'.12em', textTransform:'uppercase', color:'#9b9da4' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ border:`1px solid ${LINE2}`, background:CHAR, padding:'40px 36px', textAlign:'center', position:'relative', overflow:'hidden', marginBottom:8 }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:`linear-gradient(rgba(195,220,106,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(195,220,106,.03) 1px,transparent 1px)`, backgroundSize:'44px 44px', pointerEvents:'none' }}/>
        <div style={{ position:'relative', zIndex:1 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.22em', textTransform:'uppercase', color:VOLT, display:'block', marginBottom:16 }}>// Ready to start?</span>
          <h2 style={{ fontFamily:"'Anton',sans-serif", fontWeight:400, fontSize:'clamp(28px,4vw,48px)', textTransform:'uppercase', lineHeight:.9, marginBottom:16 }}>
            Start your {name} protocol
          </h2>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:'#9b9da4', maxWidth:460, margin:'0 auto 28px', lineHeight:1.6 }}>
            Book a free consultation to get your personalised assessment and first protocol — no contracts, no card required.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => setShowConsult(true)} className="btn btn-primary" style={{ fontSize:14, padding:'14px 28px' }}>
              Free Consultation →
            </button>
            <Link to="/#programs" className="btn btn-ghost" style={{ fontSize:14, padding:'14px 28px' }}>
              View all programs
            </Link>
          </div>
        </div>
      </section>

      {/* Browse other programs */}
      <div style={{ paddingTop:32 }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.22em', textTransform:'uppercase', color:'#5f6168', display:'block', marginBottom:16 }}>// Other programs</span>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {Object.entries(PROGRAMS).filter(([s]) => s !== slug).map(([s, p]) => (
            <Link key={s} to={`/programs/${s}`} style={{
              display:'inline-flex', alignItems:'center', gap:8,
              fontFamily:"'JetBrains Mono',monospace", fontSize:12, letterSpacing:'.06em',
              color:'#9b9da4', border:`1px solid ${LINE2}`, background:CHAR,
              padding:'8px 14px', textDecoration:'none', transition:'.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = VOLT; e.currentTarget.style.borderColor = LINE; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#9b9da4'; e.currentTarget.style.borderColor = LINE2; }}>
              {p.icon} {p.name}
            </Link>
          ))}
        </div>
      </div>

      {showConsult && (
        <Suspense fallback={null}>
          <ConsultationModal onClose={() => setShowConsult(false)}/>
        </Suspense>
      )}

      <style>{`
        @media(max-width:560px) {
          .results-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </InfoLayout>
  );
};

export default ProgramPage;
