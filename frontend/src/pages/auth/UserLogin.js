import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { LogoFull } from '../../components/shared/Logo';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const UserLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { loginUser, isLoading } = useAuthStore();
  const navigate = useNavigate();
  useDocumentTitle('Login', 'Log in to your MPower Fitness account to access workouts, trainers, nutrition plans and progress tracking.');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) { toast.error('Please enter your email and password'); return; }
    const result = await loginUser(form.email, form.password);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`);
      navigate(result.user.onboardingCompleted ? '/user/dashboard' : '/onboarding');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--black)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'10%', right:'-5%', width:480, height:480, borderRadius:'50%', background:'radial-gradient(circle,rgba(195,220,106,.35),transparent 70%)', filter:'blur(70px)', opacity:.3, pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'5%', left:'-5%', width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle,rgba(232,116,63,.3),transparent 70%)', filter:'blur(70px)', opacity:.18, pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:420, animation:'slideUp 0.45s ease forwards' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:36 }}>
          <LogoFull height={55} />
        </div>

        <div style={{ background:'linear-gradient(180deg,rgba(22,24,29,.75),rgba(14,15,18,.65))', border:'1px solid rgba(255,255,255,.07)', padding:'36px 32px', backdropFilter:'blur(12px)' }}>
          <h1 style={{ fontFamily:"'Archivo',sans-serif", fontSize:22, fontWeight:900, marginBottom:6, color:'var(--t1)', letterSpacing:'-.01em' }}>Welcome back</h1>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", color:'var(--t2)', fontSize:12.5, letterSpacing:'.04em', marginBottom:28 }}>Sign in to continue your fitness journey</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email:e.target.value})}
                required autoComplete="email"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('login-password')?.focus(); }}}/>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <input id="login-password" className="form-input" type={showPass ? 'text' : 'password'}
                  placeholder="••••••••" value={form.password}
                  onChange={e => setForm({...form, password:e.target.value})}
                  required autoComplete="current-password" style={{ paddingRight:46 }}/>
                <button type="button" onClick={() => setShowPass(v => !v)} style={{
                  position:'absolute', right:13, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer',
                  color:'var(--text-muted)', display:'flex', alignItems:'center', padding:2,
                  transition:'color 0.15s'
                }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--text-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
                ><EyeIcon open={showPass}/></button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ height:46, fontSize:15 }} disabled={isLoading}>
              {isLoading ? (
                <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:'spin 0.7s linear infinite' }}><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontFamily:"'JetBrains Mono',monospace", color:'var(--t2)', fontSize:12.5, marginTop:24 }}>
            No account? <Link to="/register" style={{ color:'var(--volt)', fontWeight:700, textDecoration:'none' }}>Sign up free</Link>
          </p>
        </div>

        <div style={{ marginTop:22, display:'flex', justifyContent:'center', gap:28 }}>
          <Link to="/trainer/login" style={{ fontFamily:"'JetBrains Mono',monospace", color:'var(--t3)', fontSize:12, textDecoration:'none', letterSpacing:'.04em' }}>Trainer login</Link>
          <Link to="/admin/login" style={{ fontFamily:"'JetBrains Mono',monospace", color:'var(--t3)', fontSize:12, textDecoration:'none', letterSpacing:'.04em' }}>Admin login</Link>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
