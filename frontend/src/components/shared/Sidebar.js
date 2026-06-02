import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  LayoutDashboard, Dumbbell, Salad, BarChart3, Award, CalendarDays, CalendarCheck,
  Target, Users, MessageCircle, User, Flame, Star, BookOpen, Calendar, TrendingUp,
  CreditCard, Bell, FileText, Stethoscope, LogOut
} from 'lucide-react';
import { LogoFull, LogoIcon } from './Logo';
import useAuthStore from '../../store/authStore';

/* ── Shared link component ───────────────────────────────────────────── */
const NavItem = ({ to, icon, label, collapsed }) => (
  <NavLink
    to={to}
    title={collapsed ? label : undefined}
    style={{ textDecoration:'none' }}
    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
  >
    <span className="nav-link-icon">{icon}</span>
    {!collapsed && <span style={{ overflow:'hidden', textOverflow:'ellipsis', lineHeight:1.3 }}>{label}</span>}
  </NavLink>
);

/* ── Sign-out icon ───────────────────────────────────────────────────── */
const SignOutIcon = () => <LogOut size={16} strokeWidth={1.9}/>;

/* ── Shared sidebar shell ────────────────────────────────────────────── */
const SidebarShell = ({ collapsed, onToggle, accent, badge, badgeClass, userSub, navItems, onLogout }) => {
  const { user } = useAuthStore();

  return (
    <div style={{
      width: collapsed ? 72 : 252,
      height:'100vh', background:'var(--carbon)',
      borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column',
      overflow:'hidden', transition:'width .22s ease',
    }}>

      {/* Logo row */}
      <div style={{
        padding: collapsed ? '14px 0' : '12px 14px',
        borderBottom:'1px solid var(--border)',
        display:'flex', flexDirection:'column', gap:6,
        flexShrink:0, minHeight:72,
        justifyContent:'center', overflow:'hidden',
      }}>
        {collapsed ? (
          <div style={{ display:'flex', justifyContent:'center' }}>
            <LogoIcon size={38}/>
          </div>
        ) : (
          <>
            <div style={{ overflow:'hidden', maxWidth:'100%' }}>
              <LogoFull height={34} linkTo={null}/>
            </div>
            {badge && (
              <span className={`badge ${badgeClass}`} style={{ alignSelf:'flex-start', fontSize:9, letterSpacing:'.1em' }}>
                {badge}
              </span>
            )}
          </>
        )}
      </div>

      {/* User info strip */}
      {!collapsed && user && (
        <div style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:34, height:34, borderRadius:'50%', flexShrink:0,
              background:`rgba(${accent},.14)`, color:`rgb(${accent})`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, fontWeight:700,
            }}>{user.name?.[0]?.toUpperCase() || '?'}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--t1)' }}>
                {user.name}
              </div>
              <div style={{ fontSize:11, color:`rgb(${accent})`, marginTop:1 }}>{userSub}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'6px 0' }}>
        {navItems.map(item => (
          <NavItem key={item.to} {...item} collapsed={collapsed}/>
        ))}
      </nav>

      {/* Sign out */}
      <div style={{ padding:'6px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
        <button
          onClick={onLogout}
          aria-label="Sign out"
          style={{
            width:'100%', display:'flex', alignItems:'center',
            gap:10, padding:'9px 12px',
            borderRadius:'var(--r-md)', border:'none', cursor:'pointer',
            background:'none', color:'var(--t3)',
            fontSize:14, fontWeight:500, transition:'all .14s',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='var(--s1)'; e.currentTarget.style.color='var(--t1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--t3)'; }}
        >
          <SignOutIcon/>
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );
};

const I = 18; // icon size for nav items
const S = 1.7; // stroke width

/* ── User Sidebar ─────────────────────────────────────────────────────── */
export const UserSidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const doLogout = async () => { await logout(); toast.success('Signed out'); navigate('/'); };
  return (
    <SidebarShell
      collapsed={collapsed} onToggle={onToggle}
      accent="46,138,255"
      userSub={<><Flame size={12} style={{display:'inline',verticalAlign:'-1px'}}/> {user?.streak || 0} day streak</>}
      navItems={[
        { to:'/user/dashboard', icon:<LayoutDashboard size={I} strokeWidth={S}/>, label:'Dashboard' },
        { to:'/user/workouts',  icon:<Dumbbell size={I} strokeWidth={S}/>,        label:'Workouts' },
        { to:'/user/nutrition', icon:<Salad size={I} strokeWidth={S}/>,           label:'Nutrition' },
        { to:'/user/progress',  icon:<BarChart3 size={I} strokeWidth={S}/>,       label:'Progress' },
        { to:'/user/trainers',  icon:<Award size={I} strokeWidth={S}/>,           label:'My Trainer' },
        { to:'/user/sessions',  icon:<CalendarDays size={I} strokeWidth={S}/>,    label:'My Sessions' },
        { to:'/user/bookings',  icon:<CalendarCheck size={I} strokeWidth={S}/>,   label:'My Bookings' },
        { to:'/user/programs',  icon:<Target size={I} strokeWidth={S}/>,          label:'Programs' },
        { to:'/user/community', icon:<Users size={I} strokeWidth={S}/>,           label:'Community' },
        { to:'/user/chat',      icon:<MessageCircle size={I} strokeWidth={S}/>,   label:'Messages' },
        { to:'/user/profile',   icon:<User size={I} strokeWidth={S}/>,            label:'Profile' },
      ]}
      onLogout={doLogout}
    />
  );
};

/* ── Trainer Sidebar ──────────────────────────────────────────────────── */
export const TrainerSidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const doLogout = async () => { await logout(); toast.success('Signed out'); navigate('/'); };
  return (
    <SidebarShell
      collapsed={collapsed} onToggle={onToggle}
      accent="91,168,255"
      userSub={<><Star size={12} style={{display:'inline',verticalAlign:'-1px'}}/> {user?.rating?.toFixed(1) || '5.0'} rating</>}
      navItems={[
        { to:'/trainer/dashboard', icon:<LayoutDashboard size={I} strokeWidth={S}/>, label:'Dashboard' },
        { to:'/trainer/bookings',  icon:<CalendarCheck size={I} strokeWidth={S}/>,   label:'Bookings' },
        { to:'/trainer/clients',   icon:<Users size={I} strokeWidth={S}/>,           label:'My Clients' },
        { to:'/trainer/schedule',  icon:<Calendar size={I} strokeWidth={S}/>,        label:'Availability' },
        { to:'/trainer/workouts',  icon:<Dumbbell size={I} strokeWidth={S}/>,        label:'Workout Plans' },
        { to:'/trainer/nutrition', icon:<Salad size={I} strokeWidth={S}/>,           label:'Nutrition Plans' },
        { to:'/trainer/analytics', icon:<TrendingUp size={I} strokeWidth={S}/>,      label:'Analytics' },
        { to:'/trainer/chat',      icon:<MessageCircle size={I} strokeWidth={S}/>,   label:'Messages' },
        { to:'/trainer/profile',   icon:<User size={I} strokeWidth={S}/>,            label:'Profile' },
      ]}
      onLogout={doLogout}
    />
  );
};

/* ── Admin Sidebar ────────────────────────────────────────────────────── */
export const AdminSidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const doLogout = async () => { await logout(); toast.success('Signed out'); navigate('/'); };
  return (
    <SidebarShell
      collapsed={collapsed} onToggle={onToggle}
      accent="46,138,255"
      userSub={user?.role?.toUpperCase() || 'ADMIN'}
      navItems={[
        { to:'/admin/dashboard',     icon:<LayoutDashboard size={I} strokeWidth={S}/>, label:'Overview' },
        { to:'/admin/users',         icon:<Users size={I} strokeWidth={S}/>,           label:'Users' },
        { to:'/admin/trainers',      icon:<Award size={I} strokeWidth={S}/>,           label:'Trainers' },
        { to:'/admin/bookings',      icon:<CalendarCheck size={I} strokeWidth={S}/>,   label:'Bookings' },
        { to:'/admin/payments',      icon:<CreditCard size={I} strokeWidth={S}/>,      label:'Revenue' },
        { to:'/admin/workouts',      icon:<Dumbbell size={I} strokeWidth={S}/>,        label:'Workouts' },
        { to:'/admin/programs',      icon:<Target size={I} strokeWidth={S}/>,          label:'Programs' },
        { to:'/admin/nutrition',     icon:<Salad size={I} strokeWidth={S}/>,           label:'Nutrition' },
        { to:'/admin/analytics',     icon:<TrendingUp size={I} strokeWidth={S}/>,      label:'Analytics' },
        { to:'/admin/notifications', icon:<Bell size={I} strokeWidth={S}/>,            label:'Notifications' },
        { to:'/admin/blog',          icon:<FileText size={I} strokeWidth={S}/>,        label:'Blog' },
        { to:'/admin/consultations', icon:<Stethoscope size={I} strokeWidth={S}/>,     label:'Consultations' },
      ]}
      onLogout={doLogout}
    />
  );
};
