import React, { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceDot } from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';

/* ──────────────────────────────────────────────────────────────
   Free Consultation Funnel — multi-step lead capture
   Step flow: Goal → About you → Target → Projection → Health → Contact
   Posts to existing /consultations endpoint (now accepts funnel metrics).
   ────────────────────────────────────────────────────────────── */

const GOALS = [
  { value: 'Lose weight',              icon: '🔥', sub: 'Shed fat & feel lighter' },
  { value: 'Build muscle',             icon: '💪', sub: 'Gain strength & size' },
  { value: 'Manage health condition',  icon: '🩺', sub: 'PCOD, thyroid, diabetes…' },
  { value: 'Improve fitness',          icon: '⚡', sub: 'Stamina, energy & mobility' },
  { value: 'Sports performance',       icon: '🏆', sub: 'Train like an athlete' },
  { value: 'General wellbeing',        icon: '🌿', sub: 'Feel & live better' },
];

const HEALTH_CONDITIONS = [
  { value:'pcod',              label:'PCOD / PCOS',           icon:'🌸' },
  { value:'thyroid',           label:'Thyroid Disorder',      icon:'🦋' },
  { value:'diabetes',          label:'Diabetes',              icon:'💉' },
  { value:'insulin_resistance',label:'Insulin Resistance',    icon:'📊' },
  { value:'hypertension',      label:'Hypertension',          icon:'❤️' },
  { value:'joint_pain',        label:'Joint Pain / Arthritis',icon:'🦴' },
  { value:'heart_condition',   label:'Heart Condition',       icon:'🫀' },
  { value:'asthma',            label:'Asthma / Breathing',    icon:'🌬️' },
  { value:'obesity',           label:'Obesity / High BMI',    icon:'⚖️' },
  { value:'none',              label:'None of the above',     icon:'✅' },
];

const ACTIVITY_LEVELS = [
  { value:'sedentary', label:'Sedentary',     icon:'🪑', sub:'Little / no exercise' },
  { value:'light',     label:'Lightly active',icon:'🚶', sub:'1–2 days/week' },
  { value:'moderate',  label:'Moderate',      icon:'🏃', sub:'3–4 days/week' },
  { value:'active',    label:'Very active',   icon:'🔥', sub:'5+ days/week' },
];

const DELIVERY_MODES = [
  { value:'online_video',    label:'Online Video Sessions', icon:'💻' },
  { value:'trainer_at_home', label:'Trainer at My Home',    icon:'🏠' },
  { value:'mpower_gym',      label:'At MPower Gym',          icon:'🏋️' },
  { value:'partner_gym',     label:'At My Existing Gym',     icon:'📍' },
  { value:'self_guided',     label:'Self-Guided Online',     icon:'💻' },
];

const BUDGET_SEGMENTS = [
  { value:'budget',  label:'₹499 – 999/mo',   icon:'🟢' },
  { value:'mid',     label:'₹1,499 – 2,999/mo',icon:'🔵' },
  { value:'premium', label:'₹2,999+/mo',       icon:'🟣' },
];

const C = {
  lime:   'var(--volt)',          /* #c3dc6a — matte volt */
  orange: 'var(--amber)',         /* #e8743f — warm amber */
  surf:   'var(--s1)',            /* card surface */
  surf2:  'var(--s2)',            /* elevated surface */
  border: 'var(--border)',        /* rgba(255,255,255,.07) */
  t1:     'var(--t1)',
  t2:     'var(--t2)',
  t3:     'var(--t3)',
};

/* ── shared bits ─────────────────────────────────────────────── */
const Chip = ({ selected, onClick, icon, label, sub }) => (
  <button type="button" onClick={onClick} style={{
    padding: sub ? '12px 14px' : '8px 13px',
    cursor:'pointer', transition:'all 0.16s',
    display:'inline-flex', alignItems:'center', gap:10,
    fontSize:13, fontWeight:600, fontFamily:'var(--font-body)', textAlign:'left',
    background: selected ? 'rgba(195,220,106,0.1)' : C.surf2,
    border: `1.5px solid ${selected ? 'rgba(195,220,106,0.5)' : C.border}`,
    color: selected ? C.lime : C.t2,
    boxShadow: selected ? '0 0 0 1px rgba(195,220,106,0.2)' : 'none',
  }}>
    {icon && <span style={{ fontSize:18, lineHeight:1 }}>{icon}</span>}
    <span style={{ display:'flex', flexDirection:'column', gap:2 }}>
      <span>{label}</span>
      {sub && <span style={{ fontSize:11, fontWeight:500, color: selected ? 'rgba(195,220,106,0.65)' : C.t3 }}>{sub}</span>}
    </span>
  </button>
);

const Field = ({ label, suffix, children }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div style={{ position:'relative' }}>
      {children}
      {suffix && <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
        fontSize:13, color:C.t3, pointerEvents:'none' }}>{suffix}</span>}
    </div>
  </div>
);

const StepTitle = ({ children, sub }) => (
  <div style={{ marginBottom:20 }}>
    <h2 style={{ margin:0, fontSize:'clamp(20px,5vw,26px)', fontWeight:800, lineHeight:1.2, color:C.t1 }}>{children}</h2>
    {sub && <p style={{ margin:'8px 0 0', fontSize:14, color:C.t2, lineHeight:1.5 }}>{sub}</p>}
  </div>
);

/* ── validation helpers ─────────────────────────────────────── */
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((e || '').trim());
const inRange = (v, lo, hi) => { const n = Number(v); return v !== '' && v != null && !Number.isNaN(n) && n >= lo && n <= hi; };
export const CONSULT_DONE_KEY = 'mpower-consultation-done';

/* ── projection math: decelerating (easeOut) curve to target ──── */
const buildProjection = (current, target, months) => {
  const cur = Number(current), tgt = Number(target);
  const n = Math.max(2, Math.min(12, Number(months) || 6));
  const now = new Date();
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const frac = i / n;
    const ease = 1 - Math.pow(1 - frac, 3); // easeOutCubic — fast early, flattening
    const w = cur - (cur - tgt) * ease;
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    pts.push({
      month: d.toLocaleString('en-US', { month: 'short' }),
      year: d.getFullYear(),
      weight: Math.round(w * 10) / 10,
    });
  }
  return pts;
};

const ConsultationModal = ({ onClose }) => {
  const { user, updateUser, isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    age: user?.age || '',
    gender: user?.gender || '',
    heightCm: '',
    currentWeight: '',
    targetWeight: '',
    timeframeMonths: 6,
    activityLevel: '',
    healthConditions: user?.healthConditions || [],
    primaryGoal: '',
    currentChallenges: '',
    fitnessLevel: user?.fitnessLevel || '',
    budgetSegment: 'mid',
    deliveryPreference: 'online_video',
  });
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  const submit = useMutation({
    mutationFn: (body) => api.post('/consultations', body),
    onSuccess: () => {
      setDone(true);
      // Persist so the same browser never sees the CTA again (covers anonymous leads)
      try { localStorage.setItem(CONSULT_DONE_KEY, '1'); } catch (_) { /* storage unavailable */ }
      // Only touch the auth user object when actually logged in — avoid creating a phantom user
      if (isAuthenticated) updateUser({ consultationDone: true });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to submit. Please try again.'),
  });

  const toggleCondition = (val) => setForm(f => {
    const cur = f.healthConditions;
    if (val === 'none') return { ...f, healthConditions: cur.includes('none') ? [] : ['none'] };
    const without = cur.filter(c => c !== 'none');
    return { ...f, healthConditions: without.includes(val) ? without.filter(c => c !== val) : [...without, val] };
  });

  const projection = useMemo(
    () => buildProjection(form.currentWeight, form.targetWeight, form.timeframeMonths),
    [form.currentWeight, form.targetWeight, form.timeframeMonths]
  );
  const last = projection[projection.length - 1];
  const deltaKg = Math.abs(Number(form.currentWeight || 0) - Number(form.targetWeight || 0));
  const losing = Number(form.targetWeight) <= Number(form.currentWeight);

  // ── step config: validity + total ──
  const steps = [
    { key:'goal',       valid: !!form.primaryGoal },
    { key:'about',      valid: !!form.gender && inRange(form.heightCm, 120, 230) && inRange(form.currentWeight, 30, 250) },
    { key:'target',     valid: inRange(form.targetWeight, 30, 250) },
    { key:'projection', valid: true },
    { key:'health',     valid: !!form.activityLevel },
    { key:'contact',    valid: form.name.trim().length >= 2 && isEmail(form.email) },
  ];
  const total = steps.length;
  const cur = steps[step];

  const go = (n) => { setDir(n > step ? 1 : -1); setStep(n); };
  const next = () => { if (!cur.valid) return; if (step < total - 1) go(step + 1); else doSubmit(); };
  const back = () => { if (step === 0) onClose(); else go(step - 1); };

  const doSubmit = () => {
    if (form.name.trim().length < 2 || !form.primaryGoal) {
      return toast.error('Please enter your name and goal');
    }
    if (!isEmail(form.email)) {
      return toast.error('Please enter a valid email address');
    }
    submit.mutate({
      ...form,
      age: form.age ? Number(form.age) : null,
      heightCm: form.heightCm ? Number(form.heightCm) : null,
      currentWeight: form.currentWeight ? Number(form.currentWeight) : null,
      targetWeight: form.targetWeight ? Number(form.targetWeight) : null,
      timeframeMonths: Number(form.timeframeMonths) || null,
    });
  };

  const slideVariants = {
    enter: (d) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.78)', zIndex:9999,
      display:'flex', alignItems:'center', justifyContent:'center', padding:'16px',
      backdropFilter:'blur(6px)',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background:C.surf, border:`1px solid ${C.border}`,
        width:'100%', maxWidth:560, maxHeight:'92vh', overflow:'hidden',
        display:'flex', flexDirection:'column', boxShadow:'0 24px 80px rgba(0,0,0,0.65)',
      }}>
        {/* Header + progress */}
        <div style={{ padding:'16px 20px 0', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <button onClick={back} aria-label="Back" style={{
              background:'none', border:`1px solid ${C.border}`,
              width:34, height:34, cursor:'pointer', color:C.t2, fontSize:16,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'var(--font-mono)',
            }}>←</button>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.t3, letterSpacing:'0.05em' }}>
                {done ? 'COMPLETE' : `STEP ${step + 1} / ${total}`}
              </span>
              <button onClick={onClose} aria-label="Close" style={{
                background:'none', border:'none', cursor:'pointer', color:C.t3, fontSize:20, lineHeight:1, padding:4 }}>✕</button>
            </div>
          </div>
          <div style={{ height:3, background:C.surf2, overflow:'hidden', marginBottom:4 }}>
            <motion.div
              animate={{ width: `${((done ? total : step + 1) / total) * 100}%` }}
              transition={{ duration:0.4, ease:'easeOut' }}
              style={{ height:'100%', background:`linear-gradient(90deg, ${C.lime}, ${C.orange})` }}
            />
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY:'auto', flex:1, padding:'20px 20px 24px' }}>
          {done ? (
            <SuccessView form={form} last={last} onClose={onClose} />
          ) : (
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={cur.key} custom={dir} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration:0.25, ease:'easeOut' }}
              >
                {/* ───────────── STEP 1 — GOAL ───────────── */}
                {cur.key === 'goal' && (
                  <>
                    <StepTitle sub="We'll tailor your free consultation around what matters most to you.">
                      What's your <span style={{ color:C.lime }}>#1 goal</span>?
                    </StepTitle>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      {GOALS.map(g => (
                        <button key={g.value} type="button"
                          onClick={() => { set({ primaryGoal: g.value }); setTimeout(() => go(1), 160); }}
                          style={{
                            padding:'16px 14px', cursor:'pointer', textAlign:'left',
                            transition:'all 0.16s', fontFamily:'var(--font-body)',
                            background: form.primaryGoal === g.value ? 'rgba(195,220,106,0.1)' : C.surf2,
                            border:`1.5px solid ${form.primaryGoal === g.value ? 'rgba(195,220,106,0.5)' : C.border}`,
                          }}>
                          <div style={{ fontSize:26, marginBottom:8 }}>{g.icon}</div>
                          <div style={{ fontSize:14, fontWeight:700, color: form.primaryGoal === g.value ? C.lime : C.t1 }}>{g.value}</div>
                          <div style={{ fontSize:12, color:C.t3, marginTop:2 }}>{g.sub}</div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* ───────────── STEP 2 — ABOUT YOU ───────────── */}
                {cur.key === 'about' && (
                  <>
                    <StepTitle sub="Quick basics so we can calculate your personalised plan.">
                      Tell us about <span style={{ color:C.lime }}>you</span>
                    </StepTitle>
                    <div style={{ marginBottom:18 }}>
                      <label className="form-label" style={{ display:'block', marginBottom:8 }}>Gender</label>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        {['Male','Female','Other'].map(g => (
                          <Chip key={g} label={g} selected={form.gender === g} onClick={() => set({ gender: g })} />
                        ))}
                      </div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                      <Field label="Age" suffix="yrs">
                        <input className="form-input" type="number" min="13" max="100" value={form.age}
                          onChange={e => set({ age: e.target.value })} placeholder="28" />
                      </Field>
                      <Field label="Height" suffix="cm">
                        <input className="form-input" type="number" min="120" max="230" value={form.heightCm}
                          onChange={e => set({ heightCm: e.target.value })} placeholder="170" />
                      </Field>
                      <Field label="Weight" suffix="kg">
                        <input className="form-input" type="number" min="30" max="250" value={form.currentWeight}
                          onChange={e => set({ currentWeight: e.target.value })} placeholder="82" />
                      </Field>
                    </div>
                    {form.heightCm && form.currentWeight && (
                      <BmiNote height={form.heightCm} weight={form.currentWeight} />
                    )}
                  </>
                )}

                {/* ───────────── STEP 3 — TARGET ───────────── */}
                {cur.key === 'target' && (
                  <>
                    <StepTitle sub="Pick a realistic target — we'll show you exactly how to get there.">
                      Your <span style={{ color:C.lime }}>target</span> weight
                    </StepTitle>
                    <Field label="Target weight" suffix="kg">
                      <input className="form-input" type="number" min="30" max="250" value={form.targetWeight}
                        onChange={e => set({ targetWeight: e.target.value })}
                        placeholder={form.currentWeight ? String(Math.max(40, Math.round(form.currentWeight - 8))) : '73'} />
                    </Field>
                    <div style={{ marginTop:22 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10 }}>
                        <label className="form-label" style={{ margin:0 }}>Timeline</label>
                        <span style={{ fontSize:15, fontWeight:800, color:C.lime }}>{form.timeframeMonths} months</span>
                      </div>
                      <input type="range" min="2" max="12" step="1" value={form.timeframeMonths}
                        onChange={e => set({ timeframeMonths: Number(e.target.value) })}
                        style={{ width:'100%', accentColor:'var(--neon-lime)', cursor:'pointer' }} />
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:C.t3, marginTop:4 }}>
                        <span>2 mo</span><span>12 mo</span>
                      </div>
                    </div>
                    {deltaKg > 0 && (
                      <div style={{ marginTop:20, padding:'14px 16px',
                        background:'rgba(195,220,106,0.07)', border:'1px solid rgba(195,220,106,0.2)' }}>
                        <span style={{ fontSize:13, color:C.t2 }}>You want to {losing ? 'lose' : 'gain'} </span>
                        <span style={{ fontSize:15, fontWeight:800, color:C.orange }}>{Math.round(deltaKg * 10) / 10} kg</span>
                        <span style={{ fontSize:13, color:C.t2 }}> in {form.timeframeMonths} months —
                          that's ~{(deltaKg / form.timeframeMonths).toFixed(1)} kg/month. 💪</span>
                      </div>
                    )}
                  </>
                )}

                {/* ───────────── STEP 4 — PROJECTION ───────────── */}
                {cur.key === 'projection' && (
                  <ProjectionView projection={projection} last={last} losing={losing}
                    deltaKg={deltaKg} months={form.timeframeMonths} target={form.targetWeight} />
                )}

                {/* ───────────── STEP 5 — HEALTH ───────────── */}
                {cur.key === 'health' && (
                  <>
                    <StepTitle sub="This helps us match you with the right expert and a safe plan.">
                      Health & <span style={{ color:C.lime }}>lifestyle</span>
                    </StepTitle>
                    <div style={{ marginBottom:20 }}>
                      <label className="form-label" style={{ display:'block', marginBottom:8 }}>
                        Any health conditions? <span style={{ color:C.t3, fontWeight:400, fontSize:12 }}>(optional)</span>
                      </label>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                        {HEALTH_CONDITIONS.map(c => (
                          <Chip key={c.value} icon={c.icon} label={c.label}
                            selected={form.healthConditions.includes(c.value)}
                            onClick={() => toggleCondition(c.value)} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="form-label" style={{ display:'block', marginBottom:8 }}>How active are you?</label>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                        {ACTIVITY_LEVELS.map(a => (
                          <Chip key={a.value} icon={a.icon} label={a.label} sub={a.sub}
                            selected={form.activityLevel === a.value}
                            onClick={() => set({ activityLevel: a.value })} />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ───────────── STEP 6 — CONTACT ───────────── */}
                {cur.key === 'contact' && (
                  <>
                    <StepTitle sub="Last step — our certified coach will call you within 24 hours. 100% free, no commitment.">
                      Where should we send your <span style={{ color:C.lime }}>plan</span>?
                    </StepTitle>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                      <Field label="Name *">
                        <input className="form-input" value={form.name}
                          onChange={e => set({ name:e.target.value })} placeholder="Your full name" />
                      </Field>
                      <Field label="Email *">
                        <input className="form-input" type="email" value={form.email}
                          onChange={e => set({ email:e.target.value })} placeholder="your@email.com"
                          style={{ borderColor: form.email && !isEmail(form.email) ? 'var(--error)' : undefined }} />
                      </Field>
                    </div>
                    {form.email && !isEmail(form.email) && (
                      <div style={{ fontSize:12, color:'var(--error)', marginTop:-8, marginBottom:8 }}>
                        Please enter a valid email address
                      </div>
                    )}
                    <Field label="Phone (WhatsApp)">
                      <input className="form-input" type="tel" value={form.phone}
                        onChange={e => set({ phone:e.target.value })} placeholder="+91 98765 43210" />
                    </Field>
                    <div style={{ margin:'16px 0' }}>
                      <label className="form-label" style={{ display:'block', marginBottom:8 }}>How would you like to train?</label>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                        {DELIVERY_MODES.map(m => (
                          <Chip key={m.value} icon={m.icon} label={m.label}
                            selected={form.deliveryPreference === m.value}
                            onClick={() => set({ deliveryPreference:m.value })} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="form-label" style={{ display:'block', marginBottom:8 }}>Approx. budget</label>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                        {BUDGET_SEGMENTS.map(b => (
                          <Chip key={b.value} icon={b.icon} label={b.label}
                            selected={form.budgetSegment === b.value}
                            onClick={() => set({ budgetSegment:b.value })} />
                        ))}
                      </div>
                    </div>
                    <div style={{ marginTop:16, padding:'10px 12px', background:'rgba(195,220,106,0.04)',
                      border:'1px solid rgba(195,220,106,0.12)',
                      fontSize:12, color:C.t3, lineHeight:1.5 }}>
                      🔒 Your information is confidential and used only to personalise your consultation. Never shared with third parties.
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Footer CTA */}
        {!done && cur.key !== 'goal' && (
          <div style={{ padding:'14px 20px', borderTop:`1px solid ${C.border}`, flexShrink:0 }}>
            <button onClick={next} className="btn btn-primary btn-full"
              disabled={!cur.valid || submit.isPending}
              style={{ height:50, fontSize:15, fontWeight:700, clipPath:'none' }}>
              {submit.isPending ? 'Submitting…'
                : step === total - 1 ? 'Claim My Free Consultation →'
                : 'Continue →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── BMI helper note ─────────────────────────────────────────── */
const BmiNote = ({ height, weight }) => {
  const m = Number(height) / 100;
  const bmi = m > 0 ? Number(weight) / (m * m) : 0;
  if (!bmi || !isFinite(bmi)) return null;
  const cat = bmi < 18.5 ? ['Underweight', 'var(--info)']
    : bmi < 25 ? ['Healthy', 'var(--neon-lime)']
    : bmi < 30 ? ['Overweight', 'var(--warning)']
    : ['Obese', 'var(--electric-orange)'];
  return (
    <div style={{ marginTop:14, fontSize:13, color:C.t2 }}>
      Your BMI is <strong style={{ color: cat[1] }}>{bmi.toFixed(1)}</strong>
      <span style={{ color: cat[1], fontWeight:700 }}> · {cat[0]}</span>
    </div>
  );
};

/* ── Projection chart view ───────────────────────────────────── */
const ProjectionView = ({ projection, last, losing, deltaKg, months }) => (
  <div>
    <div style={{ textAlign:'center', marginBottom:8 }}>
      <div className="badge badge-neon" style={{ display:'inline-flex', marginBottom:14 }}>✨ Your projection</div>
      <h2 style={{ margin:0, fontSize:'clamp(20px,5vw,24px)', fontWeight:800, color:C.t1, lineHeight:1.3 }}>
        We can help you reach
      </h2>
      <div style={{ fontSize:'clamp(40px,11vw,56px)', fontWeight:900, color:C.orange, lineHeight:1.05, margin:'4px 0' }}>
        {last?.weight} kg<span style={{ fontSize:24 }}>*</span>
      </div>
      <div style={{ fontSize:18, fontWeight:700, color:C.lime }}>by {last?.month} {last?.year}</div>
    </div>
    <p style={{ textAlign:'center', fontSize:13, color:C.t2, maxWidth:380, margin:'10px auto 18px', lineHeight:1.6 }}>
      Using proven, science-backed coaching to help you {losing ? 'lose' : 'gain'} {Math.round(deltaKg * 10) / 10} kg
      over {months} months — and sustain it for life.
    </p>
    <div style={{ height:200, marginBottom:8 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={projection} margin={{ top:10, right:12, left:-18, bottom:0 }}>
          <defs>
            <linearGradient id="projFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c3dc6a" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#c3dc6a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false}
            domain={['dataMin - 2', 'dataMax + 2']} width={40} />
          <Tooltip
            contentStyle={{ background:'var(--s2)', border:'1px solid rgba(255,255,255,.07)', fontSize:12 }}
            labelStyle={{ color:'var(--t2)' }}
            formatter={(v) => [`${v} kg`, 'Weight']} />
          <Area type="monotone" dataKey="weight" stroke="#c3dc6a" strokeWidth={2.5}
            fill="url(#projFill)" dot={{ r:3, fill:'#c3dc6a' }} activeDot={{ r:5 }} />
          {last && <ReferenceDot x={last.month} y={last.weight} r={6} fill="var(--neon-lime)" stroke="var(--surface)" strokeWidth={2} />}
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <p style={{ fontSize:11, color:C.t3, textAlign:'center', margin:0 }}>
      *Indicative projection based on your inputs. Individual results vary.
    </p>
  </div>
);

/* ── Success view ────────────────────────────────────────────── */
const SuccessView = ({ form, last, onClose }) => (
  <div style={{ textAlign:'center', padding:'12px 4px' }}>
    <div style={{ fontSize:56, marginBottom:12 }}>🎉</div>
    <h3 style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>You're all set, {form.name?.split(' ')[0] || 'champion'}!</h3>
    <p style={{ color:C.t2, lineHeight:1.6, maxWidth:400, margin:'0 auto 22px' }}>
      Our certified health coach will review your profile and call / WhatsApp you within <strong style={{ color:C.t1 }}>24 hours</strong> with
      a personalised plan{last?.weight ? <> to reach <strong style={{ color:C.orange }}>{last.weight} kg</strong></> : ''}.
    </p>
    <div style={{ background:'rgba(195,220,106,0.05)', border:'1px solid rgba(195,220,106,0.16)',
      padding:'16px 18px', maxWidth:400, margin:'0 auto 22px', textAlign:'left' }}>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:C.t3, textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:12, fontWeight:500 }}>
        // What happens next
      </div>
      {['Expert reviews your goals & health profile','Personalised plan curated for you','Free call / WhatsApp within 24 hours'].map((s, i) => (
        <div key={i} style={{ display:'flex', gap:10, fontSize:13, color:C.t2, marginBottom:i < 2 ? 8 : 0, alignItems:'center' }}>
          <span style={{ width:22, height:22, flexShrink:0, background:'rgba(195,220,106,0.15)',
            color:C.lime, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>{i+1}</span>
          {s}
        </div>
      ))}
    </div>
    <button className="btn btn-primary" onClick={onClose} style={{ minWidth:200, height:48, clipPath:'polygon(0 0,100% 0,100% 100%,11px 100%,0 calc(100% - 11px))' }}>Done</button>
  </div>
);

export default ConsultationModal;
