import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { LogoFull } from '../../components/shared/Logo';

const AdminLogin = () => {
  const [form, setForm] = useState({ email:'', password:'' });
  const { loginAdmin, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await loginAdmin(form.email, form.password);
    if (result.success) {
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  const fillDemo = () => setForm({ email:'admin@mpowerfitness.com', password:'Admin@123456' });

  return (
    <div style={{ minHeight:'100vh', background:'var(--black)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px', position:'relative', overflow:'hidden' }}>
      {/* Ambient glow */}
      <div style={{ position:'absolute', top:'20%', right:'15%', width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle,rgba(200,238,68,.07),transparent 65%)', filter:'blur(50px)', pointerEvents:'none', willChange:'transform' }}/>
      <div style={{ position:'absolute', bottom:'15%', left:'10%', width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(231,100,43,.06),transparent 65%)', filter:'blur(50px)', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:400, animation:'slideUp 0.45s ease forwards' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:40 }}>
          <LogoFull height={48}/>
        </div>

        {/* Eyebrow */}
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10.5, fontWeight:500, letterSpacing:'.24em', textTransform:'uppercase', color:'var(--amber)', marginBottom:24, textAlign:'center' }}>
          // ADMIN PORTAL
        </div>

        <div style={{ background:'linear-gradient(180deg,rgba(22,24,29,.75),rgba(14,15,18,.65))', border:'1px solid rgba(255,255,255,.07)', backdropFilter:'blur(12px)', padding:'36px 32px' }}>
          <h1 style={{ fontFamily:"'Archivo',sans-serif", fontSize:22, fontWeight:900, marginBottom:6, color:'var(--t1)', letterSpacing:'-.01em' }}>Admin Sign In</h1>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", color:'var(--t2)', fontSize:12.5, letterSpacing:'.03em', marginBottom:28 }}>Restricted — authorised personnel only</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div className="form-group">
              <label className="form-label">Admin email</label>
              <input className="form-input" type="email" placeholder="admin@mpowerfitness.com"
                value={form.email} onChange={e => setForm({...form, email:e.target.value})} required autoComplete="email"/>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password:e.target.value})} required autoComplete="current-password"/>
            </div>
            <button type="submit" className="btn btn-primary btn-full" style={{ height:46, fontSize:14, clipPath:'none', marginTop:4 }} disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{ margin:'22px 0 0' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
              <div style={{ flex:1, height:1, background:'rgba(255,255,255,.07)' }}/>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--t3)' }}>Demo</span>
              <div style={{ flex:1, height:1, background:'rgba(255,255,255,.07)' }}/>
            </div>
            <button type="button" onClick={fillDemo} style={{
              width:'100%', padding:'12px 14px',
              background:'rgba(195,220,106,.04)',
              border:'1px solid rgba(195,220,106,.14)',
              cursor:'pointer', textAlign:'left', transition:'background .15s',
              fontFamily:'inherit',
            }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(195,220,106,.08)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(195,220,106,.04)'}
            >
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'var(--volt)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:6 }}>Fill demo credentials</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'var(--t2)' }}>admin@mpowerfitness.com · Admin@123456</div>
            </button>
          </div>
        </div>

        <div style={{ marginTop:22, display:'flex', justifyContent:'center', gap:28 }}>
          <Link to="/login" style={{ fontFamily:"'JetBrains Mono',monospace", color:'var(--t3)', fontSize:12, textDecoration:'none', letterSpacing:'.04em' }}>User login</Link>
          <Link to="/trainer/login" style={{ fontFamily:"'JetBrains Mono',monospace", color:'var(--t3)', fontSize:12, textDecoration:'none', letterSpacing:'.04em' }}>Trainer login</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
