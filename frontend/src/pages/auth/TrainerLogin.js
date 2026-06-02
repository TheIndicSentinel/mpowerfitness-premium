import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { LogoFull } from '../../components/shared/Logo';

const TrainerLogin = () => {
  const [form, setForm] = useState({ email:'', password:'' });
  const { loginTrainer, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await loginTrainer(form.email, form.password);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`);
      navigate('/trainer/dashboard');
    } else {
      if (result.code === 'PENDING_APPROVAL') {
        toast.error('Your account is awaiting admin approval.', { duration: 5000 });
      } else {
        toast.error(result.error);
      }
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--black)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px', position:'relative', overflow:'hidden' }}>
      {/* Ambient glow */}
      <div style={{ position:'absolute', top:'15%', left:'8%', width:420, height:420, borderRadius:'50%', background:'radial-gradient(circle,rgba(200,238,68,.08),transparent 65%)', filter:'blur(50px)', pointerEvents:'none', willChange:'transform' }}/>
      <div style={{ position:'absolute', bottom:'10%', right:'5%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(231,100,43,.07),transparent 65%)', filter:'blur(50px)', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:420, animation:'slideUp 0.45s ease forwards' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:40 }}>
          <LogoFull height={48}/>
        </div>

        {/* Eyebrow */}
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10.5, fontWeight:500, letterSpacing:'.24em', textTransform:'uppercase', color:'var(--volt)', marginBottom:24, textAlign:'center' }}>
          // TRAINER PORTAL
        </div>

        <div style={{ background:'linear-gradient(180deg,rgba(22,24,29,.75),rgba(14,15,18,.65))', border:'1px solid rgba(255,255,255,.07)', backdropFilter:'blur(12px)', padding:'36px 32px' }}>
          <h1 style={{ fontFamily:"'Archivo',sans-serif", fontSize:22, fontWeight:900, marginBottom:6, color:'var(--t1)', letterSpacing:'-.01em' }}>Trainer Sign In</h1>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", color:'var(--t2)', fontSize:12.5, letterSpacing:'.03em', marginBottom:28 }}>Access your dashboard and manage clients</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" placeholder="trainer@example.com"
                value={form.email} onChange={e => setForm({...form, email:e.target.value})} required autoComplete="email"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('tl-pass')?.focus(); }}}/>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input id="tl-pass" className="form-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password:e.target.value})} required autoComplete="current-password"/>
            </div>
            <button type="submit" className="btn btn-primary btn-full" style={{ height:46, fontSize:14, clipPath:'none', marginTop:4 }} disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign In as Trainer →'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontFamily:"'JetBrains Mono',monospace", color:'var(--t2)', fontSize:12.5, marginTop:24 }}>
            New trainer?{' '}
            <Link to="/trainer/register" style={{ color:'var(--volt)', fontWeight:700, textDecoration:'none' }}>Apply to join</Link>
          </p>
        </div>

        <div style={{ marginTop:22, display:'flex', justifyContent:'center', gap:28 }}>
          <Link to="/login" style={{ fontFamily:"'JetBrains Mono',monospace", color:'var(--t3)', fontSize:12, textDecoration:'none', letterSpacing:'.04em' }}>User login</Link>
          <Link to="/admin/login" style={{ fontFamily:"'JetBrains Mono',monospace", color:'var(--t3)', fontSize:12, textDecoration:'none', letterSpacing:'.04em' }}>Admin login</Link>
        </div>
      </div>
    </div>
  );
};

export default TrainerLogin;
