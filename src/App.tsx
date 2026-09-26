import { useEffect, useMemo, useRef, useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from 'react'
import { BrowserRouter, Link, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Activity, ArrowDown, ArrowDownUp, ArrowLeft, ArrowRight, ArrowUpRight, BedDouble, Building2,
  CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Heart, Home, KeyRound,
  LayoutDashboard, ListFilter, LockKeyhole, LogIn, Mail, MapPin, Menu, MessageSquare, Moon, MoveRight,
  Plus, Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Sun, Users, Wallet, X,
} from 'lucide-react'
import { defaultRequirement, loadSavedRequirements, properties } from './data/properties'
import { amenityCategories, amenityOptions } from './data/amenities'
import { demoAppointments, demoConversations, demoProjects, demoRoommates, demoServiceProviders, demoUsers, studentStays } from './data/demoData'
import { authenticateDemoUser, listDemoAccounts, type DemoAccount } from './services/authService'
import { analyzeRequirements } from './services/aiService'
import { listAppointments, saveAppointments, updateAppointmentStatus } from './services/appointmentService'
import { exportDemoReport, getAdminOverview } from './services/adminService'
import { getProperty } from './services/propertyService'
import { searchDemoUsers } from './services/userService'
import { listDemoTransactions } from './services/transactionService'
import { findProviders } from './services/serviceMarketplaceService'
import { matchProperties } from './services/matchingService'
import { confidenceFor } from './ai/confidenceEngine'
import { explainMatch } from './ai/explanationEngine'
import { scoreProperty } from './ai/scoring'
import { readStorage, writeStorage } from './services/storage'
import type { AnalysisPurchase, Appointment, DemoUser, HousingProfile, MatchResult, Property, PropertyRequirement } from './types'
import { createPendingPurchase, createPropertyAnalysis, findAnalysisPurchase, hasUnlockedAnalysis, listAnalysisPurchases, processMockPayment, saveAnalysisPurchases, settlePurchase } from './services/analysisPurchaseService'
import './App.css'

const emptyProfile: HousingProfile = {
  name: '', age: '', familySize: '2', children: false, elderly: false, pets: false, income: '',
  budget: '', monthlyAffordability: '', currentLocation: '', workplace: '', university: '', preferredCities: 'Mangaluru',
  preferredAreas: '', propertyType: 'Any', bhk: '', area: '', furnishing: 'Any', amenities: [], maxCommute: '30', preferredTransport: 'Any',
}

function App() {
  const [user, setUser] = useState<DemoUser | null>(() => readStorage('user', null))
  const [saved, setSaved] = useState<string[]>(() => readStorage('saved', []))
  const [compared, setCompared] = useState<string[]>(() => readStorage('compare', []))
  const [requirement, setRequirement] = useState<PropertyRequirement>(() => loadSavedRequirements())
  const [profile, setProfile] = useState<HousingProfile>(() => readStorage('profile', emptyProfile))
  const [appointments, setAppointments] = useState<Appointment[]>(() => listAppointments(demoAppointments))
  const [analysisPurchases, setAnalysisPurchases] = useState<AnalysisPurchase[]>(() => listAnalysisPurchases())
  const [theme, setTheme] = useState(() => readStorage('theme', 'system'))
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('habryn:intro'))

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    writeStorage('theme', theme)
  }, [theme])

  useEffect(() => {
    if (showSplash) {
      sessionStorage.setItem('habryn:intro', 'played')
      const timer = window.setTimeout(() => setShowSplash(false), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 650 : 2450)
      return () => window.clearTimeout(timer)
    }
  }, [showSplash])

  useEffect(() => { writeStorage('user', user) }, [user])
  useEffect(() => { writeStorage('saved', saved) }, [saved])
  useEffect(() => { writeStorage('compare', compared) }, [compared])
  useEffect(() => { writeStorage('requirements', requirement) }, [requirement])
  useEffect(() => { writeStorage('profile', profile) }, [profile])
  useEffect(() => { saveAppointments(appointments) }, [appointments])
  useEffect(() => { saveAnalysisPurchases(analysisPurchases) }, [analysisPurchases])

  const toggleSaved = (id: string) => setSaved((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  const toggleCompare = (id: string) => setCompared((items) => items.includes(id) ? items.filter((item) => item !== id) : items.length >= 4 ? items : [...items, id])
  const login = (account: DemoUser) => setUser(account)

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {showSplash && <OpeningSplash />}
      <Routes>
        <Route path="/" element={<Landing user={user} />} />
        <Route path="/login" element={<Login onLogin={login} />} />
        <Route path="/admin/login" element={<Login onLogin={login} adminOnly />} />
        <Route path="/register" element={<Register onRegister={(name, email) => setUser({ role: 'user', name, email })} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route element={<ProtectedLayout user={user} onLogout={() => setUser(null)} theme={theme} setTheme={setTheme} />}>
          <Route path="/dashboard" element={<Dashboard user={user!} saved={saved} purchases={analysisPurchases} />} />
          <Route path="/buy/requirements" element={<Requirements requirement={requirement} setRequirement={setRequirement} profile={profile} />} />
          <Route path="/buy/results" element={<Results requirement={requirement} saved={saved} compared={compared} onSave={toggleSaved} onCompare={toggleCompare} userId={user?.email ?? ''} purchases={analysisPurchases} />} />
          <Route path="/property/:id" element={<PropertyDetail saved={saved} compared={compared} onSave={toggleSaved} onCompare={toggleCompare} user={user!} analysisPurchases={analysisPurchases} setAnalysisPurchases={setAnalysisPurchases} requirement={requirement} />} />
          <Route path="/analysis/:id" element={<AnalysisPage user={user!} purchases={analysisPurchases} requirement={requirement} compared={compared} onPurchasesChange={setAnalysisPurchases} onCompare={toggleCompare} />} />
          <Route path="/saved" element={<SavedProperties ids={saved} onSave={toggleSaved} onCompare={toggleCompare} compared={compared} userId={user?.email ?? ''} purchases={analysisPurchases} />} />
          <Route path="/compare" element={<Compare ids={compared} onCompare={toggleCompare} />} />
          <Route path="/profile/housing" element={<Profile profile={profile} setProfile={setProfile} />} />
          <Route path="/appointments" element={<Appointments appointments={appointments} setAppointments={setAppointments} />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/sell" element={<SellWizard />} />
          <Route path="/owner/*" element={<RoleDashboard role="owner" />} />
          <Route path="/developer/*" element={<RoleDashboard role="developer" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/admin/login" replace />} />
          <Route path="/admin/:section" element={user?.role === 'admin' ? <UtilityPage saved={saved} theme={theme} setTheme={setTheme} /> : <Navigate to="/admin/login" replace />} />
          <Route path="/:section" element={<UtilityPage saved={saved} theme={theme} setTheme={setTheme} />} />
          <Route path="/my-home/:section" element={<UtilityPage saved={saved} theme={theme} setTheme={setTheme} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function OpeningSplash() {
  const hour = new Date().getHours()
  const greeting = hour >= 5 && hour < 12 ? 'Good morning' : hour >= 12 && hour < 17 ? 'Good afternoon' : 'Good evening'
  return <div className="opening" aria-label="Welcome to Habryn"><div className="opening-orb" /><div className="opening-copy"><span>HABRYN</span><h1>Welcome to HABRYN</h1><p>{greeting}</p></div></div>
}

function Landing({ user }: { user: DemoUser | null }) {
  return <main className="landing">
    <header className="landing-nav"><Link to="/" className="brand"><span className="brand-mark">H</span> HABRYN</Link><nav><a href="#how">How it works</a><a href="#intelligence">Intelligence</a><Link to="/login">Log in</Link></nav><Link className="button primary small" to={user ? '/dashboard' : '/login'}>{user ? 'Go to dashboard' : 'Get started'} <ArrowRight size={16} /></Link></header>
    <section className="landing-hero">
      <div className="hero-copy"><div className="eyebrow"><span className="live-dot" /> A more thoughtful way home</div><h1>Find a place.<br /><span>Find your place.</span></h1><p>Housing decisions, made personal. Discover homes that fit your budget, your commute, and the life you're building.</p><div className="hero-actions"><Link to={user ? '/buy/requirements' : '/login'} className="button primary">Find my property <ArrowRight size={17} /></Link><a href="#how" className="button quiet">Explore Habryn <ArrowDown size={16} /></a></div><div className="hero-trust"><div className="avatar-stack"><span>A</span><span>M</span><span>S</span><span>+</span></div><span>Better decisions begin with you.</span></div></div>
      <div className="hero-art"><img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=85" alt="Modern home surrounded by greenery" /><div className="floating-match"><span className="mini-icon"><Sparkles size={16} /></span><span><strong>Made for you</strong><small>A better kind of match</small></span><span className="match-ring">92</span></div><div className="image-caption"><MapPin size={14} /> A home that feels like yours</div></div>
    </section>
    <section className="trust-strip"><span>Thoughtful matches, not endless scrolling</span><span><ShieldCheck size={15} /> Your priorities come first</span><span><Activity size={15} /> Clarity at every step</span></section>
    <section className="landing-intro" id="how"><div className="eyebrow">HOME IS MORE THAN AN ADDRESS</div><h2>The right home starts<br />with <span>understanding you.</span></h2><p>HABRYN brings your needs, budget, family, and everyday life together—so you can explore homes with confidence.</p><div className="feature-row">{[['01', 'Tell us what matters', 'Your priorities, family needs, and real-world budget set the direction.'], ['02', 'See your best-fit homes', 'Each recommendation is ranked against your requirements—with the why.'], ['03', 'Decide with clarity', 'Understand trade-offs, compare homes, and take your next step.']].map(([number, title, copy]) => <article className="feature-card" key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p><ArrowUpRight size={17} /></article>)}</div></section>
    <section className="intelligence-banner" id="intelligence"><div><span className="eyebrow"><Sparkles size={14} /> HABRYN INTELLIGENCE</span><h2>More clarity.<br /><span>Less guesswork.</span></h2><p>A transparent matching simulation that respects your hard requirements and explains every match. Built to put people—not listings—first.</p><Link to={user ? '/buy/requirements' : '/login'} className="text-link">See it in action <ArrowRight size={16} /></Link></div><div className="score-card"><div className="score-top"><span>YOUR MATCH OVERVIEW</span><span className="badge">SIMULATED</span></div><strong>Made to fit your life.</strong><div className="progress-list">{[['Budget fit', '88%'], ['Everyday commute', '92%'], ['What matters most', '84%']].map(([label, score], i) => <div key={label}><span>{label}<b>{score}</b></span><div className="progress-track"><i style={{ width: score }} data-index={i} /></div></div>)}</div><small><ShieldCheck size={13} /> A clear explanation behind every recommendation</small></div></section>
    <section className="closing-cta"><div><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>Ready to find your<br />kind of home?</h2></div><Link to={user ? '/buy/requirements' : '/login'} className="button primary">Start your search <ArrowRight size={17} /></Link></section>
    <footer className="landing-footer"><Link to="/" className="brand"><span className="brand-mark">H</span> HABRYN</Link><span>Find. Decide. Belong.</span><span>Prototype · Demo data · Made for better home decisions</span></footer>
  </main>
}

function ProtectedLayout({ user, onLogout, theme, setTheme }: { user: DemoUser | null; onLogout: () => void; theme: string; setTheme: (theme: string) => void }) {
  const location = useLocation()
  if (!user) return <Navigate to={location.pathname.startsWith('/admin') ? '/admin/login' : '/login'} state={{ from: location.pathname }} replace />
  const isAdminPath = location.pathname.startsWith('/admin')
  if (isAdminPath && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  if (user.role === 'admin' && !isAdminPath) return <Navigate to="/admin" replace />
  if (user.role === 'owner' && !location.pathname.startsWith('/owner') && !['/messages', '/appointments'].includes(location.pathname)) return <Navigate to="/owner" replace />
  if (user.role === 'developer' && !location.pathname.startsWith('/developer') && !['/messages', '/appointments'].includes(location.pathname)) return <Navigate to="/developer" replace />
  return <div className="app-shell"><Sidebar user={user} onLogout={onLogout} /><main className="workspace"><TopBar user={user} theme={theme} setTheme={setTheme} /><div className="page-content"><Outlet /></div></main></div>
}

const userLinks = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Find a home', to: '/buy/requirements', icon: Search },
  { label: 'Saved homes', to: '/saved', icon: Heart },
  { label: 'Compare', to: '/compare', icon: ArrowDownUp },
  { label: 'Appointments', to: '/appointments', icon: CalendarDays },
  { label: 'Messages', to: '/messages', icon: MessageSquare },
  { label: 'My home', to: '/my-home', icon: Home },
  { label: 'My profile', to: '/profile/housing', icon: Users },
]
const adminLinks = [
  { label: 'Overview', to: '/admin', icon: LayoutDashboard },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Properties', to: '/admin/properties', icon: Building2 },
  { label: 'Appointments', to: '/admin/appointments', icon: CalendarDays },
  { label: 'Transactions', to: '/admin/transactions', icon: Wallet },
  { label: 'AI monitoring', to: '/admin/ai', icon: Sparkles },
  { label: 'Reports', to: '/admin/reports', icon: Activity },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

function Sidebar({ user, onLogout }: { user: DemoUser; onLogout: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const links = user.role === 'admin' ? adminLinks : user.role === 'owner' ? [
    { label: 'Owner dashboard', to: '/owner', icon: LayoutDashboard }, { label: 'Properties', to: '/owner/properties', icon: Building2 },
    { label: 'Leads', to: '/owner/leads', icon: Users }, { label: 'Appointments', to: '/appointments', icon: CalendarDays }, { label: 'Messages', to: '/messages', icon: MessageSquare },
  ] : user.role === 'developer' ? [
    { label: 'Developer dashboard', to: '/developer', icon: LayoutDashboard }, { label: 'Projects', to: '/developer/projects', icon: Building2 },
    { label: 'Inventory', to: '/developer/inventory', icon: Home }, { label: 'Leads', to: '/developer/leads', icon: Users }, { label: 'Messages', to: '/messages', icon: MessageSquare },
  ] : userLinks
  return <>
    <button className="mobile-menu button quiet" aria-label="Open navigation" onClick={() => setMobileOpen(!mobileOpen)}><Menu size={19} /></button>
    {mobileOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}><Link to="/" className="brand"><span className="brand-mark">H</span> HABRYN</Link><div className="workspace-label">{user.role === 'admin' ? 'PLATFORM' : user.role === 'user' ? 'YOUR SPACE' : `${user.role.toUpperCase()} SPACE`}</div><nav className="side-links">{links.map(({ label, to, icon: Icon }) => <NavLink to={to} key={label} onClick={() => setMobileOpen(false)} end={to === '/dashboard' || to === '/admin' || to === '/owner' || to === '/developer'} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><Icon size={17} />{label}<ChevronRight size={14} className="side-chevron" /></NavLink>)}</nav>
      {user.role === 'user' && <><div className="workspace-label secondary-nav-label">DISCOVER & PREPARE</div><nav className="side-links secondary-nav">{[['Explore services', '/services'], ['Student housing', '/student'], ['Find roommates', '/roommates'], ['Move-in checklist', '/move-in'], ['True cost', '/true-cost'], ['Property documents', '/documents'], ['Property protection', '/property-shield'], ['My home passport', '/home-passport'], ['Sell a home', '/sell'], ['Theme settings', '/settings']].map(([label, to], index) => { const icons = [Settings, KeyRound, Users, Home, Wallet, Building2, ShieldCheck, Home, Building2, Sun]; const Icon = icons[index]; return <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><Icon size={15} />{label}</NavLink> })}</nav></>}
      {user.role === 'user' && <Link to="/buy/requirements" className="sidebar-tip"><span className="tip-icon"><Sparkles size={16} /></span><strong>Find your kind of home</strong><small>Start with what matters to you.</small><span className="tip-link">Start exploring <ArrowRight size={13} /></span></Link>}
      <div className="sidebar-bottom"><div className="demo-status"><span className="live-dot" /> Prototype · Demo data</div><div className="user-menu"><span className="user-avatar">{user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span className="user-details"><strong>{user.name}</strong><small>{user.role}</small></span><button title="Log out" className="icon-button" onClick={onLogout}><LogIn size={15} /></button></div></div>
    </aside>
  </>
}

function TopBar({ user, theme, setTheme }: { user: DemoUser; theme: string; setTheme: (theme: string) => void }) {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const onSearch = (event: FormEvent) => { event.preventDefault(); navigate(`/buy/results?q=${encodeURIComponent(search)}`) }
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')
  const themeState = theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'
  return <header className="topbar"><form className="global-search" onSubmit={onSearch}><Search size={16} /><input aria-label="Search homes" placeholder="Search homes, locations..." value={search} onChange={(event) => setSearch(event.target.value)} />{search && <button type="button" className="icon-button" onClick={() => setSearch('')}><X size={14} /></button>}<kbd>↵</kbd></form><div className="topbar-actions"><span className="demo-pill"><span className="live-dot" /> DEMO MODE</span><button className="icon-button theme-toggle" title={`Theme: ${themeState}. Click to change`} onClick={toggleTheme}>{theme === 'dark' ? <Moon size={17} /> : <Sun size={17} />}</button><span className="topbar-avatar">{user.name.charAt(0)}</span></div></header>
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>
}

function Dashboard({ user, saved, purchases }: { user: DemoUser; saved: string[]; purchases: AnalysisPurchase[] }) {
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const recommendations = matchProperties(readStorage('requirements', defaultRequirement)).slice(0, 3)
  return <>
    <div className="welcome-row"><div><span className="eyebrow">YOUR HOME JOURNEY, MADE PERSONAL</span><h1>{greeting}, {user.name.split(' ')[0]}<span className="greeting-wave"> ✳</span></h1><p>Let’s find a home that fits the way you live.</p></div><div className="profile-completion"><div className="completion-ring">68<span>%</span></div><span><b>Your profile</b><small>Almost there · <Link to="/profile/housing">Complete it</Link></small></span></div></div>
    <section className="dashboard-search"><div><span className="eyebrow"><Sparkles size={13} /> START WITH WHAT MATTERS</span><h2>Find a place to call yours.</h2><p>Your life, your requirements. Recommendations made around you.</p><Link to="/buy/requirements" className="button primary">Find my home <ArrowRight size={16} /></Link></div><div className="dash-art"><img src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=700&q=80" alt="Welcoming home exterior" /></div></section>
    <div className="quick-actions">{[['Buy a home', Search, '/buy/requirements'], ['Rent a home', KeyRound, '/buy/requirements'], ['Sell property', Building2, '/sell'], ['Student housing', BookIcon, '/student'], ['Compare homes', ArrowDownUp, '/compare'], ['My home', Home, '/my-home']].map(([label, Icon, path]) => { const ActionIcon = Icon as typeof Search; return <button className="quick-action" key={label as string} onClick={() => navigate(path as string)}><ActionIcon size={19} /><span>{label as string}</span><ArrowUpRight size={14} className="quick-arrow" /></button> })}</div>
    <div className="section-header"><div><span className="eyebrow">A FEW PLACES TO BEGIN</span><h2>Homes with potential</h2></div><Link to="/buy/results" className="text-link">Explore your matches <ArrowRight size={15} /></Link></div>
    <div className="property-grid compact">{recommendations.slice(0, 3).map((result) => <PropertyCard key={result.property.id} result={result} saved={saved.includes(result.property.id)} onSave={() => {}} compare={false} onCompare={() => {}} analysisUnlocked={hasUnlockedAnalysis(purchases, user.email, result.property.id)} />)}</div>
    <div className="dashboard-lower"><div className="panel activity-panel"><div className="section-header"><div><span className="eyebrow">YOUR NEXT STEPS</span><h3>Coming up</h3></div><Link to="/appointments" className="text-link">All visits <ArrowRight size={14} /></Link></div><div className="appointment-line"><span className="date-block">28<small>SEP</small></span><span><strong>Visit: Aurum Residences</strong><small><MapPin size={12} /> Kadri, Mangaluru · 10:30 AM</small></span><ChevronRight size={16} /></div><div className="appointment-line"><span className="date-block muted">01<small>OCT</small></span><span><strong>A home that caught your eye</strong><small><MapPin size={12} /> Bejai, Mangaluru · 2:00 PM</small></span><ChevronRight size={16} /></div></div><div className="panel insight-panel"><span className="insight-mark"><Sparkles size={16} /></span><span className="eyebrow">A LITTLE INSIGHT</span><h3>A home is more than its price tag.</h3><p>You're exploring homes around Kadri. Remember to factor in registration and ongoing costs when comparing budgets.</p><Link to="/buy/results" className="text-link">Explore your matches <ArrowRight size={14} /></Link></div></div>
  </>
}

function BookIcon(props: React.ComponentProps<typeof Home>) { return <KeyRound {...props} /> }

function Requirements({ requirement, setRequirement, profile }: { requirement: PropertyRequirement; setRequirement: Dispatch<SetStateAction<PropertyRequirement>>; profile: HousingProfile }) {
  const navigate = useNavigate()
  const [working, setWorking] = useState(false)
  const [natural, setNatural] = useState('')
  const [naturalOpen, setNaturalOpen] = useState(false)
  const [moreFilters, setMoreFilters] = useState(false)
  const update = <K extends keyof PropertyRequirement>(key: K, value: PropertyRequirement[K]) => setRequirement((current) => ({ ...current, [key]: value }))
  const updateFilter = (patch: Partial<PropertyRequirement>) => setRequirement((current) => ({ ...current, ...patch }))
  const toggleBhk = (bhk: number) => {
    const bhks = requirement.bhks.includes(bhk) ? requirement.bhks.filter((value) => value !== bhk) : [...requirement.bhks, bhk].sort()
    updateFilter({ bhks, bhk: 0 })
  }
  const toggleAmenity = (amenity: string) => {
    const amenities = requirement.amenities.includes(amenity) ? requirement.amenities.filter((item) => item !== amenity) : [...requirement.amenities, amenity]
    updateFilter({ amenities, allAmenities: amenities.length === amenityOptions.length })
  }
  const toggleAllAmenities = () => {
    const allAmenities = !requirement.allAmenities
    updateFilter({ allAmenities, amenities: allAmenities ? [...amenityOptions] : [] })
  }
  const applyProfileDefaults = () => {
    const profileBudget = Number(profile.budget.replace(/[^\d]/g, ''))
    const monthlyAffordability = Number(profile.monthlyAffordability.replace(/[^\d]/g, ''))
    const preferredAreas = profile.preferredAreas.split(',').map((area) => area.trim()).filter((area) =>
      properties.some((property) => property.city === requirement.city && property.locality.toLowerCase() === area.toLowerCase()),
    )
    return {
      ...requirement,
      ...(requirement.maxBudget === 0 && profileBudget ? { maxBudget: profileBudget < 100000 ? profileBudget * 100000 : profileBudget } : {}),
      monthlyAffordability: requirement.monthlyAffordability || monthlyAffordability,
      localities: requirement.localities.length ? requirement.localities : preferredAreas,
      workplace: requirement.workplace || profile.workplace || profile.university,
      university: profile.university,
      familySize: Number(profile.familySize) || requirement.familySize,
      children: profile.children,
      elderly: profile.elderly,
      pets: profile.pets,
      bhks: requirement.bhks.length ? requirement.bhks : profile.bhk ? [Number(profile.bhk)] : [],
      propertyType: requirement.propertyType === 'Any' ? profile.propertyType : requirement.propertyType,
      minArea: requirement.minArea || Number(profile.area),
      furnishing: requirement.furnishing === 'Any' ? profile.furnishing : requirement.furnishing,
      amenities: [...new Set([...requirement.amenities, ...profile.amenities])],
    }
  }
  const startMatching = () => {
    setWorking(true)
    const finalRequirement = applyProfileDefaults()
    setRequirement(finalRequirement)
    writeStorage('requirements', finalRequirement)
    window.setTimeout(() => navigate('/buy/results'), 850)
  }
  const parseSearch = () => {
    const text = natural.toLowerCase()
    const budgetMatch = text.match(/(?:under|below|max(?:imum)?)[^\d₹]*(\d+(?:\.\d+)?)\s*(lakh|lac|crore|cr)?/)
    const bhkMatch = text.match(/([1-4])\s*(?:bhk|bedroom)/)
    const cityMatch = Object.keys({ Mangaluru: 1, Bengaluru: 1, Mysuru: 1, Hyderabad: 1, Chennai: 1, Pune: 1, Mumbai: 1, 'Delhi NCR': 1 }).find((city) => text.includes(city.toLowerCase()))
    const updated = { ...requirement }
    if (bhkMatch) { updated.bhk = 0; updated.bhks = [Number(bhkMatch[1])] }
    if (budgetMatch) updated.maxBudget = Math.round(Number(budgetMatch[1]) * (budgetMatch[2]?.match(/cr|crore/) ? 10000000 : 100000))
    if (cityMatch) updated.city = cityMatch
    if (text.includes('parking')) updated.amenities = [...new Set([...updated.amenities, 'Parking'])]
    setRequirement(updated)
  }
  const resetFilters = () => setRequirement(defaultRequirement)
  const locations = ['Mangaluru', 'Bengaluru', 'Mysuru', 'Hyderabad', 'Chennai', 'Pune', 'Mumbai', 'Delhi NCR']
  const presets = [{ label: '₹30L', amount: 3000000 }, { label: '₹50L', amount: 5000000 }, { label: '₹75L', amount: 7500000 }, { label: '₹1Cr+', amount: 10000000 }]
  return <>
    <PageHeading eyebrow="A FASTER WAY TO FIND HOME" title="What are you looking for?" description="Choose a few essentials. Browse homes in seconds; refine the details only if you want to." />
    <div className="quick-filter-panel panel">
      <div className="quick-filter-heading"><span><span className="eyebrow"><Sparkles size={13} /> QUICK FILTERS</span><strong>Start with what matters most.</strong></span><span className="profile-hint"><CheckCircle2 size={13} /> Your saved profile fills in the rest</span></div>
      <div className="quick-filter-controls">
        <Field label="City"><select value={requirement.city} onChange={(event) => update('city', event.target.value)}>{['Any', ...locations].map((city) => <option key={city}>{city}</option>)}</select></Field>
        <Field label="Maximum budget"><MoneyInput value={requirement.maxBudget} onChange={(value) => update('maxBudget', value)} /></Field>
        <Field label="Property type"><select value={requirement.propertyType} onChange={(event) => update('propertyType', event.target.value)}>{['Any', 'Apartment', 'Villa', 'Independent House', 'Row House', 'Plot', 'Studio', 'Penthouse', 'Other'].map((type) => <option key={type}>{type}</option>)}</select></Field>
        <div className="quick-filter-unit"><span>BHK</span><div className="quick-chips">{[1, 2, 3, 4].map((bhk) => <button key={bhk} className={`quick-chip ${requirement.bhks.includes(bhk) || (!requirement.bhks.length && requirement.bhk === bhk) ? 'active' : ''}`} onClick={() => toggleBhk(bhk)}>{bhk === 4 ? '4+' : bhk}</button>)}</div></div>
        <div className="quick-filter-unit"><span>Price presets</span><div className="quick-chips">{presets.map(({ label, amount }) => <button key={label} className={`quick-chip ${requirement.maxBudget === amount ? 'active' : ''}`} onClick={() => updateFilter({ maxBudget: amount })}>{label}</button>)}</div></div>
        <div className="quick-filter-unit quick-filter-toggles"><span>Refine your shortlist</span><div className="quick-chips">
          <button className={`quick-chip toggle-chip ${requirement.status === 'Ready to move' ? 'active' : ''}`} onClick={() => update('status', requirement.status === 'Ready to move' ? 'Any' : 'Ready to move')}>Ready to move</button>
          <button className={`quick-chip toggle-chip ${requirement.furnishing === 'Fully furnished' ? 'active' : ''}`} onClick={() => update('furnishing', requirement.furnishing === 'Fully furnished' ? 'Any' : 'Fully furnished')}>Furnished</button>
          <button className={`quick-chip toggle-chip ${requirement.amenities.some((item) => item.toLowerCase() === 'parking') ? 'active' : ''}`} onClick={() => toggleAmenity('Parking')}>Parking</button>
          <button className={`quick-chip toggle-chip all-amenities-chip ${requirement.allAmenities ? 'active' : ''}`} onClick={toggleAllAmenities}>{requirement.allAmenities && <Check size={12} />} ALL AMENITIES</button>
        </div></div>
      </div>
      <div className="quick-filter-footer">
        <button className={`button secondary small ${moreFilters ? 'selected' : ''}`} onClick={() => setMoreFilters(!moreFilters)}><SlidersHorizontal size={14} /> {moreFilters ? 'Hide filters' : 'More filters'} <ChevronDown size={13} /></button>
        {requirement.allAmenities && <small>All amenities boosts homes with wider amenity coverage—it does not require a home to have every amenity.</small>}
      </div>
    </div>
    {moreFilters && <section className="panel advanced-filters">
      <div className="section-header"><div><span className="eyebrow">REFINE ONLY IF YOU NEED TO</span><h3>More filters</h3></div><button className="button quiet small" onClick={resetFilters}>Reset filters</button></div>
      <div className="advanced-filter-grid">
        <Field label="Search location or locality"><input list="property-localities" value={requirement.localitySearch} placeholder="Search a neighbourhood" onChange={(event) => update('localitySearch', event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && requirement.localitySearch.trim()) { updateFilter({ localities: [...new Set([...requirement.localities, requirement.localitySearch.trim()])], localitySearch: '' }) } }} /><datalist id="property-localities">{[...new Set(properties.filter((property) => requirement.city === 'Any' || property.city === requirement.city).map((property) => property.locality))].map((locality) => <option key={locality} value={locality} />)}</datalist></Field>
        <Field label="Localities" hint="Add multiple neighbourhoods"><MultiLocality city={requirement.city} selected={requirement.localities} onChange={(value) => update('localities', value)} /></Field>
        <Field label="Minimum budget"><MoneyInput value={requirement.minBudget} onChange={(value) => update('minBudget', value)} /></Field>
        <Field label="Monthly affordability"><div className="money-input"><span>₹</span><input type="number" min={0} step={5000} value={requirement.monthlyAffordability || ''} placeholder="No limit" onChange={(event) => update('monthlyAffordability', Number(event.target.value))} /><small>/ month</small></div></Field>
        <Field label="Minimum area · sq. ft."><input type="number" value={requirement.minArea || ''} placeholder="No minimum" onChange={(event) => update('minArea', Number(event.target.value))} /></Field>
        <Field label="Maximum area · sq. ft."><input type="number" value={requirement.maxArea || ''} placeholder="No maximum" onChange={(event) => update('maxArea', Number(event.target.value))} /></Field>
        <Field label="Furnishing"><select value={requirement.furnishing} onChange={(event) => update('furnishing', event.target.value)}>{['Any', 'Unfurnished', 'Semi-furnished', 'Fully furnished'].map((value) => <option key={value}>{value}</option>)}</select></Field>
        <Field label="Property status"><select value={requirement.status} onChange={(event) => update('status', event.target.value)}>{['Any', 'Ready to move', 'Under construction', 'New', 'Resale'].map((value) => <option key={value}>{value}</option>)}</select></Field>
        <Field label={`Preferred commute · ${requirement.commute} min`}><input type="range" min={5} max={90} step={5} value={requirement.commute} onChange={(event) => update('commute', Number(event.target.value))} /></Field>
        <Field label={`Nearby radius · ${requirement.radius} km`}><input type="range" min={0} max={50} step={1} value={requirement.radius} onChange={(event) => update('radius', Number(event.target.value))} /></Field>
        <Field label="Near workplace"><input value={requirement.workplace} placeholder="Address or locality" onChange={(event) => update('workplace', event.target.value)} /></Field>
        <Field label="Near university"><input value={requirement.university} placeholder="University or campus" onChange={(event) => update('university', event.target.value)} /></Field>
        <Field label="Near school"><input value={requirement.school} placeholder="School or neighbourhood" onChange={(event) => update('school', event.target.value)} /></Field>
        <Field label="Preferred floor"><select value={requirement.floor} onChange={(event) => update('floor', event.target.value)}>{['Any', 'Ground', 'Low', 'Mid', 'High'].map((value) => <option key={value}>{value}</option>)}</select></Field>
      </div>
      <AmenitySelector requirement={requirement} onToggleAll={toggleAllAmenities} onToggleAmenity={toggleAmenity} />
    </section>}
    <div className="quick-search-bottom">
      <button className="button quiet small" onClick={resetFilters}>Reset filters</button>
      <span><CheckCircle2 size={13} /> Free search · no analysis purchase required</span>
      <button className="button primary" onClick={startMatching} disabled={working}>{working ? <><span className="spinner" /> Finding suitable homes...</> : <>Find my properties <ArrowRight size={16} /></>}</button>
    </div>
    {naturalOpen && <div className="natural-search compact-natural"><div className="input-with-icon"><Search size={15} /><input placeholder="e.g. 2BHK under ₹60 lakh in Mangaluru with parking" value={natural} onChange={(event) => setNatural(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') parseSearch() }} /><button className="button secondary small" onClick={parseSearch}>Apply</button></div></div>}
    <button className="natural-search-link" onClick={() => setNaturalOpen(!naturalOpen)}><Sparkles size={13} /> {naturalOpen ? 'Hide natural language search' : 'Describe your ideal home instead'}</button>
    <p className="quick-search-transparency"><Sparkles size={12} /> AI/ML Matching Simulation · Home requirements from your saved profile are applied quietly.</p>
  </>
}

function MultiLocality({ city, selected, onChange }: { city: string; selected: string[]; onChange: (value: string[]) => void }) {
  const places: Record<string, string[]> = {
    Mangaluru: ['Kadri', 'Bejai', 'Kankanady', 'Bendoor', 'Derebail', 'Urwa'],
    Bengaluru: ['Whitefield', 'Indiranagar', 'Sarjapur', 'HSR Layout', 'Yelahanka', 'JP Nagar'],
    Mysuru: ['Vijayanagar', 'Gokulam', 'Hebbal', 'Saraswathipuram', 'Bogadi'],
    Hyderabad: ['Gachibowli', 'Kondapur', 'Miyapur', 'Kokapet', 'Manikonda'],
    Chennai: ['OMR', 'Adyar', 'Velachery', 'Porur', 'Anna Nagar'],
    Pune: ['Hinjewadi', 'Baner', 'Wakad', 'Kharadi', 'Aundh'],
    Mumbai: ['Powai', 'Thane', 'Andheri', 'Navi Mumbai', 'Borivali'],
    'Delhi NCR': ['Gurugram', 'Noida', 'Dwarka', 'Faridabad', 'Rohini'],
  }
  const [search, setSearch] = useState('')
  const add = (value: string) => {
    const locality = value.trim()
    if (locality && !selected.includes(locality)) onChange([...selected, locality])
    setSearch('')
  }
  return <div className="locality-select"><div className="input-with-icon locality-search"><Search size={13} /><input list="quick-locality-options" placeholder="Search and add localities" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); add(search) } }} /><datalist id="quick-locality-options">{(places[city] ?? []).map((place) => <option key={place} value={place} />)}</datalist><button type="button" className="icon-button" aria-label="Add locality" onClick={() => add(search)}><Plus size={14} /></button></div>{search && places[city]?.some((place) => place.toLowerCase().includes(search.toLowerCase())) && <div className="locality-suggestions">{places[city].filter((place) => place.toLowerCase().includes(search.toLowerCase()) && !selected.includes(place)).slice(0, 4).map((place) => <button type="button" key={place} onClick={() => add(place)}>{place}<Plus size={12} /></button>)}</div>}{selected.length > 0 && <div className="selected-areas">{selected.map((place) => <button type="button" key={place} onClick={() => onChange(selected.filter((item) => item !== place))}>{place} <X size={12} /></button>)}</div>}</div>
}

function AmenitySelector({ requirement, onToggleAll, onToggleAmenity }: { requirement: PropertyRequirement; onToggleAll: () => void; onToggleAmenity: (amenity: string) => void }) {
  return <section className="amenities-selector">
    <div className="amenities-heading"><div><span className="eyebrow">MAKE IT FEEL LIKE HOME</span><h3>Amenities</h3><p>Select must-haves to help the matcher rank the closest fits.</p></div><button className={`quick-chip all-amenities-toggle ${requirement.allAmenities ? 'active' : ''}`} onClick={onToggleAll}>{requirement.allAmenities && <Check size={13} />} ALL AMENITIES</button></div>
    <div className="amenity-category-grid">{Object.entries(amenityCategories).map(([category, options]) => {
      const selectedCount = options.filter((amenity) => requirement.amenities.includes(amenity)).length
      return <details className="amenity-category" key={category}><summary><span>{category}</span><small>{selectedCount > 0 ? `${selectedCount} selected` : `${options.length} options`}</small><ChevronDown size={14} /></summary><div className="amenity-option-grid">{options.map((amenity) => <label key={amenity}><input type="checkbox" checked={requirement.amenities.includes(amenity)} onChange={() => onToggleAmenity(amenity)} />{amenity}</label>)}</div></details>
    })}</div>
  </section>
}

function FormSection({ number, title, subtitle, children }: { number: string; title: string; subtitle: string; children: ReactNode }) {
  return <section className="form-section"><div className="form-section-heading"><span>{number}</span><div><h2>{title}</h2><p>{subtitle}</p></div></div><div className="form-section-body">{children}</div></section>
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="field"><span>{label}{hint && <small>{hint}</small>}</span>{children}</label>
}

function MoneyInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <div className="money-input"><span>₹</span><input type="number" min={0} step={5} value={value ? value / 100000 : ''} placeholder="Any" onChange={(e) => onChange(Number(e.target.value) * 100000)} /><small>Lakh</small></div>
}

function Results({ requirement, saved, compared, onSave, onCompare, userId, purchases }: { requirement: PropertyRequirement; saved: string[]; compared: string[]; onSave: (id: string) => void; onCompare: (id: string) => void; userId: string; purchases: AnalysisPurchase[] }) {
  const location = useLocation()
  const query = new URLSearchParams(location.search).get('q')?.toLowerCase() ?? ''
  const [sort, setSort] = useState('Best match')
  const [minPrice, setMinPrice] = useState('')
  const matches = useMemo(() => {
    let results = analyzeRequirements(requirement).recommendations
    if (query) results = results.filter(({ property }) => `${property.name} ${property.city} ${property.locality} ${property.type}`.toLowerCase().includes(query) || property.city.toLowerCase().includes(query))
    if (minPrice) results = results.filter(({ property }) => property.price >= Number(minPrice))
    if (sort === 'Price: low to high') results.sort((a, b) => a.property.price - b.property.price)
    else if (sort === 'Price: high to low') results.sort((a, b) => b.property.price - a.property.price)
    else if (sort === 'Closest') results.sort((a, b) => a.property.commute - b.property.commute)
    else if (sort === 'Newest') results.sort((a, b) => a.property.posted - b.property.posted)
    return results
  }, [requirement, query, minPrice, sort])
  const [amenity, setAmenity] = useState('')
  const [locality, setLocality] = useState('')
  const filtered = matches.filter(({ property }) => (!amenity || property.amenities.includes(amenity)) && (!locality || property.locality === locality))
  return <>
    <PageHeading eyebrow="A PLACE TO BEGIN" title="Homes with potential." description="Thoughtful matches, ranked around the things that matter most to you." action={<Link to="/buy/requirements" className="button secondary small"><SlidersHorizontal size={15} /> Edit search</Link>} />
    <div className="results-summary"><span className="results-icon"><Sparkles size={16} /></span><span><strong>{filtered.length} {filtered.length === 1 ? 'home' : 'homes'} match your starting point</strong><small>Ranked against your requirements · Prototype matching simulation</small></span><span className="sim-tag">DEMO DATA</span></div>
    <div className="result-toolbar"><div className="result-filters"><select aria-label="Filter by locality" value={locality} onChange={(e) => setLocality(e.target.value)}><option value="">All localities</option>{[...new Set(matches.map(({ property }) => property.locality))].map((place) => <option key={place}>{place}</option>)}</select><select aria-label="Filter by amenity" value={amenity} onChange={(e) => setAmenity(e.target.value)}><option value="">All amenities</option>{['Parking', 'Balcony', 'Lift', 'Security', 'Gym', 'Power backup'].map((item) => <option key={item}>{item}</option>)}</select><label className="min-price-filter"><span>From ₹</span><input type="number" placeholder="Any" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} /><span>L</span></label></div><label className="sort-select"><ListFilter size={15} /><select aria-label="Sort homes" value={sort} onChange={(e) => setSort(e.target.value)}>{['Best match', 'Price: low to high', 'Price: high to low', 'Closest', 'Newest'].map((item) => <option key={item}>{item}</option>)}</select></label></div>
    {filtered.length > 0 ? <div className="property-grid">{filtered.slice(0, 48).map((result) => <PropertyCard key={result.property.id} result={result} saved={saved.includes(result.property.id)} onSave={() => onSave(result.property.id)} compare={compared.includes(result.property.id)} onCompare={() => onCompare(result.property.id)} analysisUnlocked={hasUnlockedAnalysis(purchases, userId, result.property.id)} />)}</div> : <div className="empty-state"><span><Search size={24} /></span><h3>No homes match these exact preferences.</h3><p>Try clearing a filter, choosing more localities, or adjusting your budget.</p><Link to="/buy/requirements" className="button primary small">Adjust your search <ArrowRight size={15} /></Link></div>}
    {compared.length > 0 && <div className="compare-float"><span><CheckCircle2 size={17} /> {compared.length} homes selected <small>Choose up to 4</small></span><Link to="/compare" className="button primary small">Compare homes <ArrowRight size={14} /></Link></div>}
  </>
}

function PropertyCard({ result, saved, onSave, compare, onCompare, analysisUnlocked = false }: { result: MatchResult; saved: boolean; onSave: () => void; compare: boolean; onCompare: () => void; analysisUnlocked?: boolean }) {
  const { property } = result
  return <article className="property-card"><Link to={`/property/${property.id}`} className="property-image"><img src={property.image} alt={`${property.name} in ${property.locality}, ${property.city}`} loading="lazy" /><span className="property-status">{property.status}</span></Link><div className="property-card-body"><div className="property-title-row"><div><Link to={`/property/${property.id}`} className="property-name">{property.name}</Link><span className="property-location"><MapPin size={12} /> {property.locality}, {property.city}</span></div><button className={`icon-button save-button ${saved ? 'saved' : ''}`} aria-label={saved ? 'Remove from saved homes' : 'Save home'} onClick={onSave}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button></div><div className="property-price">₹{(property.price / 100000).toFixed(0)}<small> lakh</small></div><div className="property-facts"><span><BedDouble size={14} /> {property.bhk} BHK · {property.type}</span><span><MoveRight size={14} /> {property.area.toLocaleString()} sq ft</span><span><Activity size={14} /> {property.commute} min · simulated</span></div><div className="property-card-meta"><span>{property.furnishing}</span><span>{property.status}</span></div><div className="property-card-amenities">{property.amenities.slice(0, 3).map((amenity) => <span key={amenity}>{amenity}</span>)}</div><div className="match-why"><Sparkles size={13} /><span>Matches your selected property filters</span></div><div className="property-card-footer"><button className={`compare-chip ${compare ? 'selected' : ''}`} onClick={onCompare}>{compare ? <Check size={12} /> : <Plus size={12} />} Compare</button><Link className="analysis-link" to={`/analysis/${property.id}`}>{analysisUnlocked ? <CheckCircle2 size={13} /> : <LockKeyhole size={12} />}{analysisUnlocked ? 'Analysis unlocked' : 'Analyze · ₹5'}</Link><Link className="text-link card-view-link" to={`/property/${property.id}`}>View home <ArrowRight size={12} /></Link></div><Link className="card-schedule-link" to={`/appointments?propertyId=${property.id}`}><CalendarDays size={12} /> Schedule a visit</Link></div></article>
}

function PropertyDetail({ saved, compared, onSave, onCompare, user, analysisPurchases, setAnalysisPurchases, requirement }: { saved: string[]; compared: string[]; onSave: (id: string) => void; onCompare: (id: string) => void; user: DemoUser; analysisPurchases: AnalysisPurchase[]; setAnalysisPurchases: Dispatch<SetStateAction<AnalysisPurchase[]>>; requirement: PropertyRequirement }) {
  const { id = '' } = useParams()
  const property = getProperty(id)
  const navigate = useNavigate()
  const [detailNotice, setDetailNotice] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  if (!property) return <EmptyState title="This home has moved on." message="Try exploring your other recommendations." to="/buy/results" />
  const unlocked = hasUnlockedAnalysis(analysisPurchases, user.email, property.id)
  return <>
    <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back to homes</button>
    <div className="detail-top"><div><span className="eyebrow">{property.city.toUpperCase()} · {property.status.toUpperCase()}</span><h1>{property.name}</h1><span className="property-location"><MapPin size={14} /> {property.locality}, {property.city}</span></div><div className="detail-price"><strong>₹{(property.price / 100000).toFixed(0)} L</strong><small>₹{Math.round(property.price / property.area).toLocaleString()} / sq ft</small></div></div>
    <div className="detail-gallery"><img src={property.image} alt={`${property.name} exterior`} /><div><img src={`https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=700&q=80`} alt="Living space" /><img src={`https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=700&q=80`} alt="Interior details" /></div><span className="gallery-label">01 / 03 · Photo preview</span></div>
    <div className="detail-actions"><button className={`button secondary small ${saved.includes(id) ? 'selected' : ''}`} onClick={() => onSave(id)}><Heart size={15} fill={saved.includes(id) ? 'currentColor' : 'none'} /> {saved.includes(id) ? 'Saved' : 'Save home'}</button><button className="button secondary small" onClick={() => onCompare(id)}>{compared.includes(id) ? <Check size={15} /> : <ArrowDownUp size={15} />} Compare</button>{unlocked ? <Link to={`/analysis/${id}`} className="button secondary small"><CheckCircle2 size={15} /> View purchased analysis</Link> : <button className="button secondary small" onClick={() => setCheckoutOpen(true)}><LockKeyhole size={14} /> Analyze with HABRYN · ₹5</button>}<Link to={`/appointments?propertyId=${id}`} className="button primary small"><CalendarDays size={15} /> Schedule a visit</Link><Link to="/messages" className="button secondary small"><MessageSquare size={14} /> Contact</Link><button className="button secondary small" onClick={() => setDetailNotice(`Share this demo link: ${window.location.href}`)}><ArrowUpRight size={14} /> Share</button><button className="button quiet small" onClick={() => setDetailNotice('Report noted locally for prototype review. No external report was sent.')}><CircleHelp size={14} /> Report</button></div>
    {detailNotice && <div className="success-message"><CheckCircle2 size={14} /> {detailNotice}</div>}
    <div className="detail-content"><div className="detail-main"><div className="panel"><span className="eyebrow">THE HOME, AT A GLANCE</span><div className="detail-stats">{[[BedDouble, `${property.bhk} bedrooms`, 'Configuration'], [MoveRight, `${property.area.toLocaleString()} sq ft`, 'Built-up area'], [Building2, `Floor ${property.floor}`, 'Position'], [Activity, `${property.age} years`, 'Property age'], [KeyRound, property.furnishing, 'Furnishing'], [MapPin, property.locality, 'Neighbourhood']].map(([Icon, value, label]) => { const StatIcon = Icon as typeof Home; return <div key={label as string}><StatIcon size={16} /><strong>{value as string}</strong><small>{label as string}</small></div> })}</div><p className="property-description">{property.description}</p></div>
      <div className="panel"><span className="eyebrow">ROOM TO LIVE</span><h3>Designed for everyday life</h3><div className="amenity-list">{property.amenities.map((item) => <span key={item}><CheckCircle2 size={14} /> {item}</span>)}</div></div>
      <div className="panel"><span className="eyebrow">LOCATION</span><h3>A neighbourhood to get to know.</h3><p className="property-description">{property.locality}, {property.city}. Commute, local facilities, financial fit, risks and other decision intelligence are part of the paid HABRYN Analysis.</p></div></div>
      <aside className="detail-aside"><div className="panel locked-analysis-card"><span className="locked-analysis-icon"><LockKeyhole size={17} /></span><span className="eyebrow">HABRYN DECISION INTELLIGENCE</span><h3>Understand this property before you decide.</h3><p>Get a personal, transparent analysis of this home for a one-time ₹5 mock payment.</p><ul><li>Financial fit & true cost</li><li>Commute and lifestyle fit</li><li>Risk, documents & trade-offs</li></ul>{unlocked ? <Link className="button primary" to={`/analysis/${id}`}>View your purchased analysis <ArrowRight size={14} /></Link> : <button className="button primary" onClick={() => setCheckoutOpen(true)}>Unlock analysis · ₹5 <ArrowRight size={14} /></button>}<small>Mock payment · Demo only · No real charge</small></div><div className="risk-note"><ShieldCheck size={15} /><span><strong>Property details are demo data</strong><small>Verify listing information independently.</small></span></div></aside></div>
    {checkoutOpen && <AnalysisCheckout user={user} property={property} requirement={requirement} purchases={analysisPurchases} setPurchases={setAnalysisPurchases} onClose={() => setCheckoutOpen(false)} onUnlocked={() => navigate(`/analysis/${property.id}`, { replace: true })} />}
  </>
}

function AnalysisPage({ user, purchases, requirement, compared, onPurchasesChange, onCompare }: { user: DemoUser; purchases: AnalysisPurchase[]; requirement: PropertyRequirement; compared: string[]; onPurchasesChange: Dispatch<SetStateAction<AnalysisPurchase[]>>; onCompare: (id: string) => void }) {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const property = getProperty(id)
  const purchase = findAnalysisPurchase(purchases, user.email, id)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [totalCostRate, setTotalCostRate] = useState(7.5)
  const [saved, setSaved] = useState(() => readStorage(`savedAnalyses:${user.email}`, [] as string[]))
  if (!property) return <EmptyState title="We couldn’t find that home." message="Return to your search to choose another property." to="/buy/results" />
  const analysis = purchase?.analysisSnapshot
  const analysisRequirement = analysis?.requirement ?? requirement
  const match: MatchResult = analysis?.recommendations[0] ?? {
    property,
    score: scoreProperty(property, analysisRequirement),
    confidence: confidenceFor(property, analysisRequirement),
    ...explainMatch(property, analysisRequirement),
  }
  const exportAnalysis = () => {
    const data = { exportedAt: new Date().toISOString(), simulated: true, purchase, analysis, property }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `habryn-analysis-${property.id}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }
  const toggleSaved = () => {
    const updated = saved.includes(id) ? saved.filter((item: string) => item !== id) : [...saved, id]
    setSaved(updated)
    writeStorage(`savedAnalyses:${user.email}`, updated)
  }
  return <>
    <button className="back-link" onClick={() => navigate(`/property/${id}`)}><ArrowLeft size={15} /> Back to property</button>
    {!purchase ? <section className="analysis-unlock panel"><span className="locked-analysis-icon"><LockKeyhole size={20} /></span><span className="eyebrow">HABRYN DECISION INTELLIGENCE</span><h1>A clearer picture, before you decide.</h1><p>Get a property-specific analysis of <strong>{property.name}</strong>—matched to your current housing requirements.</p><div className="analysis-unlock-grid">{[['Personal fit', 'Budget, location, household and lifestyle'], ['True cost', 'An adjustable, illustrative ownership estimate'], ['Commute', 'Simulated routes to your saved destinations'], ['Property shield', 'Prototype signals and verification checklist'], ['Trade-offs', 'What fits, what doesn’t and what to ask'], ['Documents', 'Missing details to request and verify']].map(([title, text]) => <div key={title}><CheckCircle2 size={16} /><span><strong>{title}</strong><small>{text}</small></span></div>)}</div><div className="analysis-price-row"><span><strong>₹5</strong><small>one-time · per property</small></span><button className="button primary" onClick={() => setCheckoutOpen(true)}>Unlock this analysis <ArrowRight size={15} /></button></div><p className="prototype-disclaimer">Prototype / Demo Data · AI/ML Matching Simulation · Mock payment only. No real charge.</p></section> : <><PageHeading eyebrow="HABRYN DECISION INTELLIGENCE · UNLOCKED" title={property.name} description={`${property.locality}, ${property.city} · Property-specific analysis purchased ${purchase.unlockedAt ? new Date(purchase.unlockedAt).toLocaleDateString() : ''}`} action={<div className="analysis-page-actions"><button className="button secondary small" onClick={toggleSaved}>{saved.includes(id) ? <CheckCircle2 size={14} /> : <Plus size={14} />}{saved.includes(id) ? 'Saved' : 'Save analysis'}</button><button className="button secondary small" onClick={exportAnalysis}><ArrowDown size={14} /> Export</button></div>} /><div className="analysis-disclosure"><Sparkles size={15} /><span><strong>Simulated Analysis</strong> · Prototype score, demo property data and simulated commute estimates. This is not legal, financial or professional advice.</span></div>
      <section className="analysis-overview-grid"><div className="panel analysis-score-card"><span className="eyebrow">HABRYN FIT · PROTOTYPE SCORE</span><div className="large-score">{match.score}<small>/100</small></div><span className={`confidence ${match.confidence.toLowerCase()}`}><span /> {match.confidence} confidence</span><p>Indicative fit based on the selected requirements and available demo listing details—not a production ML prediction.</p></div><div className="panel analysis-fit-card"><span className="eyebrow">PERSONAL FIT</span><h3>How this home aligns with your brief</h3>{[['Budget', analysisRequirement.maxBudget <= 0 ? 'No maximum budget set' : property.price <= analysisRequirement.maxBudget ? 'Within your maximum budget' : 'Above your maximum budget'], ['Location', analysisRequirement.city === 'Any' || analysisRequirement.city === property.city ? `${property.city} matches your selected city` : `${property.city} differs from selected city`], ['Home size', `${property.bhk} BHK · ${property.area.toLocaleString()} sq ft`], ['Household', `${analysisRequirement.familySize || 1} household members${analysisRequirement.children ? ' · children' : ''}${analysisRequirement.elderly ? ' · elderly household member' : ''}${analysisRequirement.pets ? ' · pets' : ''}`], ['Commute', `${property.commute} min estimate · simulated`]].map(([label, value]) => <div className="analysis-fact" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></section>
      <section className="analysis-detail-grid"><div className="panel"><span className="eyebrow">WHY IT MAY FIT</span><h3>What lines up with your needs</h3>{match.reasons.map((reason) => <div className="analysis-list-item positive" key={reason}><CheckCircle2 size={15} />{reason}</div>)}<span className="eyebrow analysis-subheading">TRADE-OFFS & POTENTIAL CONCERNS</span>{[...match.concerns, ...(property.price > 0 && requirement.maxBudget > 0 && property.price > requirement.maxBudget ? ['Asking price exceeds your current maximum budget'] : []), 'Property and neighbourhood details are supplied as prototype demo data'].filter((item, index, all) => all.indexOf(item) === index).map((concern) => <div className="analysis-list-item concern" key={concern}><CircleHelp size={15} />{concern}</div>)}</div><div className="panel"><span className="eyebrow">TRUE COST OF HOME · ILLUSTRATIVE</span><h3>Look beyond the asking price.</h3><p className="analysis-copy">Adjust the estimated additional-cost allowance. Actual registration, taxes, financing, maintenance and utilities vary by buyer and location.</p><label className="cost-rate-control">Additional costs assumption <strong>{totalCostRate.toFixed(1)}%</strong><input type="range" min="1" max="15" step="0.5" value={totalCostRate} onChange={(event) => setTotalCostRate(Number(event.target.value))} /></label><div className="cost-breakdown"><div><span>Purchase price</span><strong>₹{(property.price / 100000).toFixed(1)} L</strong></div><div><span>Estimated additional costs</span><strong>₹{(property.price * totalCostRate / 100 / 100000).toFixed(1)} L</strong></div><div className="total-cost"><span>Illustrative total</span><strong>₹{(property.price * (1 + totalCostRate / 100) / 100000).toFixed(1)} L</strong></div></div><p className="prototype-disclaimer">Illustrative only. Not a quote or financial advice.</p></div><div className="panel"><span className="eyebrow">PROPERTY SHIELD · PROTOTYPE RISK SIGNAL</span><h3>{property.risk === 'Low' ? 'No prominent demo signal surfaced' : 'Some details deserve a closer look'}</h3><p className="analysis-copy">Prototype risk signal — not legal verification. HABRYN has not checked title, ownership, approvals, encumbrances or government records.</p>{[...(property.risk === 'Low' ? ['Confirm property identity and ownership documents directly'] : ['Review the listing details and ask for supporting documents']), 'Check building approvals, title and encumbrance through an independent professional', 'Confirm payment terms and all included charges in writing'].map((item) => <div className="analysis-list-item concern" key={item}><ShieldCheck size={15} />{item}</div>)}</div><div className="panel"><span className="eyebrow">QUESTIONS TO ASK & VERIFY</span><h3>Before moving forward</h3>{['What documents establish ownership and approvals?', 'What charges are excluded from the asking price?', 'Can the listed amenities and furnishing be confirmed in writing?', 'What is the handover or possession timeline?'].map((item) => <div className="analysis-list-item" key={item}><CircleHelp size={15} />{item}</div>)}<span className="eyebrow analysis-subheading">MISSING INFORMATION</span><p className="analysis-copy">Independent document review, verified area measurements, neighbourhood conditions, exact taxes and confirmed commute data are not available in this demo.</p></div></section>
      <div className="analysis-bottom-actions"><button className="button secondary" onClick={() => onCompare(id)}>{compared.includes(id) ? <Check size={15} /> : <ArrowDownUp size={15} />}{compared.includes(id) ? 'Remove from compare' : 'Add to compare'}</button><Link to={`/appointments?propertyId=${id}`} className="button primary"><CalendarDays size={15} /> Schedule a visit</Link><Link to={`/property/${id}`} className="button quiet">Property details <ArrowRight size={14} /></Link></div>
    </>}
    {checkoutOpen && <AnalysisCheckout user={user} property={property} requirement={requirement} purchases={purchases} setPurchases={onPurchasesChange} onClose={() => setCheckoutOpen(false)} onUnlocked={() => { setCheckoutOpen(false); navigate(`/analysis/${property.id}`, { replace: true }) }} />}
  </>
}

function AnalysisCheckout({ user, property, requirement, purchases, setPurchases, onClose, onUnlocked }: { user: DemoUser; property: Property; requirement: PropertyRequirement; purchases: AnalysisPurchase[]; setPurchases: Dispatch<SetStateAction<AnalysisPurchase[]>>; onClose: () => void; onUnlocked: () => void }) {
  const [method, setMethod] = useState<AnalysisPurchase['paymentMethod']>('MOCK_UPI')
  const [simulateFailure, setSimulateFailure] = useState(false)
  const [status, setStatus] = useState<'READY' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'ERROR'>('READY')
  const [errorMessage, setErrorMessage] = useState('')
  const activePurchaseId = useRef<string | null>(null)
  const attemptNumber = useRef(0)
  const match: MatchResult = {
    property,
    score: scoreProperty(property, requirement),
    confidence: confidenceFor(property, requirement),
    ...explainMatch(property, requirement),
  }
  const pay = async () => {
    if (hasUnlockedAnalysis(purchases, user.email, property.id)) {
      onUnlocked()
      return
    }
    const attempt = ++attemptNumber.current
    setStatus('PENDING')
    setErrorMessage('')
    try {
      const created = createPendingPurchase(purchases, user.email, property.id, method)
      activePurchaseId.current = created.purchase.id
      setPurchases(created.purchases)
      const outcome = await processMockPayment(simulateFailure)
      if (attempt !== attemptNumber.current) return
      if (outcome === 'FAILED') {
        setPurchases((items) => settlePurchase(items, created.purchase.id, 'FAILED'))
        setStatus('FAILED')
        return
      }
      const analysis = createPropertyAnalysis(property, requirement, match)
      setPurchases((items) => settlePurchase(items, created.purchase.id, 'SUCCESS', analysis))
      setStatus('SUCCESS')
      window.setTimeout(() => {
        if (attempt === attemptNumber.current) onUnlocked()
      }, 800)
    } catch (error) {
      if (attempt !== attemptNumber.current) return
      if (activePurchaseId.current) {
        setPurchases((items) => settlePurchase(items, activePurchaseId.current!, 'FAILED'))
      }
      const message = error instanceof Error ? error.message : 'Payment simulation could not be completed.'
      setErrorMessage(message)
      setStatus('ERROR')
    }
  }
  const cancel = () => {
    attemptNumber.current += 1
    if (activePurchaseId.current && status === 'PENDING') {
      setPurchases((items) => settlePurchase(items, activePurchaseId.current!, 'CANCELLED'))
    }
    onClose()
  }
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && status !== 'PENDING') onClose() }}><section className="checkout-modal panel" role="dialog" aria-modal="true" aria-labelledby="checkout-heading"><button className="icon-button modal-close" aria-label="Close payment window" onClick={cancel}><X size={17} /></button>{status === 'SUCCESS' ? <div className="checkout-state"><span className="checkout-success-icon"><CheckCircle2 size={26} /></span><span className="eyebrow">PAYMENT COMPLETE · DEMO</span><h2 id="checkout-heading">Your analysis is ready.</h2><p>Unlock confirmed for <strong>{property.name}</strong>. Opening your saved analysis…</p><span className="prototype-disclaimer">No real payment was processed.</span></div> : status === 'PENDING' ? <div className="checkout-state" aria-live="polite"><span className="checkout-spinner" /><span className="eyebrow">SECURE DEMO CHECKOUT</span><h2 id="checkout-heading">Processing your mock payment…</h2><p>This simulated payment takes a moment. Your analysis unlocks only after a successful result.</p><button className="button quiet small" onClick={cancel}>Cancel payment</button></div> : <><span className="eyebrow">HABRYN ANALYSIS · DEMO CHECKOUT</span><h2 id="checkout-heading">Unlock a clearer decision.</h2><p className="analysis-copy">One-time payment for this property and your account. No subscriptions or real charges.</p><div className="checkout-order"><img src={property.image} alt="" /><span><strong>{property.name}</strong><small>{property.locality}, {property.city} · Property analysis</small></span><strong>₹5</strong></div><div className="checkout-total"><span>Total due</span><strong>₹5.00 <small>INR</small></strong></div><fieldset className="payment-methods"><legend>Choose a simulated method</legend><label className={method === 'MOCK_UPI' ? 'selected' : ''}><input type="radio" name="payment-method" checked={method === 'MOCK_UPI'} onChange={() => setMethod('MOCK_UPI')} /> Mock UPI</label><label className={method === 'MOCK_CARD' ? 'selected' : ''}><input type="radio" name="payment-method" checked={method === 'MOCK_CARD'} onChange={() => setMethod('MOCK_CARD')} /> Mock card</label></fieldset><label className="simulate-failure"><input type="checkbox" checked={simulateFailure} onChange={(event) => setSimulateFailure(event.target.checked)} /> Simulate a declined payment (demo test)</label>{(status === 'FAILED' || status === 'ERROR') && <div className="payment-error" role="alert">{status === 'FAILED' ? 'The simulated payment was declined. No analysis has been unlocked; you can retry or cancel.' : errorMessage}</div>}<button className="button primary checkout-pay" onClick={() => void pay()}><LockKeyhole size={15} /> {status === 'FAILED' || status === 'ERROR' ? 'Retry mock payment · ₹5' : 'Pay ₹5 · Unlock analysis'}</button><button className="button quiet checkout-cancel" onClick={cancel}>Cancel</button><small className="prototype-disclaimer">Prototype / Demo Data · Payment simulation only · No real payment credentials required.</small></>}</section></div>
}

function SavedProperties({ ids, onSave, onCompare, compared, userId, purchases }: { ids: string[]; onSave: (id: string) => void; onCompare: (id: string) => void; compared: string[]; userId: string; purchases: AnalysisPurchase[] }) {
  const items = properties.filter((property) => ids.includes(property.id)).map((property) => ({ property, score: 80, confidence: 'Medium' as const, reasons: ['Saved for later', `${property.bhk} BHK in ${property.city}`], concerns: [] }))
  return <><PageHeading eyebrow="YOUR SHORTLIST" title="Homes you’ve saved." description="A little collection of places worth a second look." action={<Link to="/buy/results" className="button primary small">Discover homes <ArrowRight size={15} /></Link>} />{items.length ? <div className="property-grid">{items.map((result) => <PropertyCard key={result.property.id} result={result} saved onSave={() => onSave(result.property.id)} compare={compared.includes(result.property.id)} onCompare={() => onCompare(result.property.id)} analysisUnlocked={hasUnlockedAnalysis(purchases, userId, result.property.id)} />)}</div> : <EmptyState title="Your shortlist is a blank canvas." message="Save the homes that catch your eye. You can come back to them here." to="/buy/requirements" />}</>
}

function Compare({ ids, onCompare }: { ids: string[]; onCompare: (id: string) => void }) {
  const [analysis, setAnalysis] = useState(false)
  const items = properties.filter((property) => ids.includes(property.id))
  if (items.length < 2) return <><PageHeading eyebrow="A CLEARER PICTURE" title="Compare your contenders." description="Line up the homes you're considering to see the differences more clearly." /><EmptyState title="Every good decision starts with a choice." message={items.length ? 'Add at least one more home to compare.' : 'Save a few homes or pick them from your recommendations.'} to="/buy/results" /></>
  const rows: [string, (property: Property) => ReactNode][] = [['Asking price', (p) => `₹${(p.price / 100000).toFixed(0)} L`], ['Configuration', (p) => `${p.bhk} BHK · ${p.type}`], ['Floor area', (p) => `${p.area.toLocaleString()} sq ft`], ['Location', (p) => `${p.locality}, ${p.city}`], ['Estimated commute', (p) => `${p.commute} min · simulated`], ['Furnishing', (p) => p.furnishing], ['Parking', (p) => p.parking ? 'Available' : 'Not listed'], ['Status', (p) => p.status], ['Estimated true cost', (p) => `₹${(p.price * 1.075 / 100000).toFixed(1)} L`], ['Prototype risk signal', (p) => `${p.risk} · not legal verification`]]
  return <><PageHeading eyebrow="A CLEARER PICTURE" title="Compare your contenders." description="No arbitrary winner—just a better view of the trade-offs that matter to you." /><div className="compare-table-wrap"><table className="compare-table"><thead><tr><th>WHAT MATTERS</th>{items.map((item) => <th key={item.id}><img src={item.image} alt="" /><Link to={`/property/${item.id}`}>{item.name}</Link><span>{item.locality}, {item.city}</span><button onClick={() => onCompare(item.id)}>Remove</button></th>)}{items.length < 4 && <th><Link className="add-compare" to="/buy/results"><Plus size={17} /> Add a home</Link></th>}</tr></thead><tbody>{rows.map(([label, value]) => <tr key={label}><th>{label}</th>{items.map((item) => <td key={item.id}>{value(item)}</td>)}{items.length < 4 && <td>—</td>}</tr>)}</tbody></table></div><div className="comparison-analysis"><button className="button primary" onClick={() => setAnalysis(!analysis)}><Sparkles size={15} /> {analysis ? 'Hide comparison notes' : 'Explore the trade-offs with Habryn'}</button>{analysis && <div className="panel"><span className="eyebrow">A THOUGHTFUL SIDE-BY-SIDE · SIMULATED</span><p>{items.map((p) => `${p.name} offers ${p.bhk} bedrooms in ${p.locality} at ₹${(p.price / 100000).toFixed(0)} lakh, with a ${p.commute}-minute estimated commute.`).join(' ')}</p><small>What matters most is personal. Visit, verify, and decide at your own pace.</small></div>}</div></>
}

function Profile({ profile, setProfile }: { profile: HousingProfile; setProfile: (value: HousingProfile) => void }) {
  const [saved, setSaved] = useState(false)
  const update = (key: keyof HousingProfile, value: string | boolean | string[]) => setProfile({ ...profile, [key]: value })
  return <><PageHeading eyebrow="A LITTLE ABOUT YOU" title="Your housing profile." description="The more we understand what home means to you, the more thoughtful your matches become." /><div className="profile-form"><FormSection number="01" title="The people who make a home" subtitle="Share only what feels useful to you."><div className="field-grid"><Field label="Your name"><input value={profile.name} onChange={(e) => update('name', e.target.value)} placeholder="First and last name" /></Field><Field label="Age"><input type="number" value={profile.age} onChange={(e) => update('age', e.target.value)} placeholder="Optional" /></Field></div><Field label="Household size"><select value={profile.familySize} onChange={(e) => update('familySize', e.target.value)}>{[1, 2, 3, 4, 5, 6].map((size) => <option key={size}>{size}</option>)}</select></Field><div className="preference-checks">{[['children', 'Children at home'], ['elderly', 'Elderly family members'], ['pets', 'Pets']].map(([key, label]) => <label key={key}><input type="checkbox" checked={profile[key as keyof HousingProfile] as boolean} onChange={(e) => update(key as keyof HousingProfile, e.target.checked)} /> {label}</label>)}</div></FormSection><FormSection number="02" title="What feels comfortable" subtitle="Your financial information stays on this device.">  <div className="field-grid"><Field label="Monthly income range"><select value={profile.income} onChange={(e) => update('income', e.target.value)}><option value="">Choose a range</option>{['Under ₹50,000', '₹50,000–₹1 lakh', '₹1–2 lakh', '₹2–5 lakh', '₹5 lakh+'].map((i) => <option key={i}>{i}</option>)}</select></Field><Field label="Comfortable budget"><input value={profile.budget} onChange={(e) => update('budget', e.target.value)} placeholder="e.g. ₹60 lakh" /></Field></div><Field label="Monthly affordability"><input value={profile.monthlyAffordability} onChange={(e) => update('monthlyAffordability', e.target.value)} placeholder="e.g. ₹45,000 per month" /></Field></FormSection><FormSection number="03" title="The places you connect to" subtitle="Tell us where your day starts.">  <div className="field-grid"><Field label="Current location"><input value={profile.currentLocation} onChange={(e) => update('currentLocation', e.target.value)} placeholder="City or locality" /></Field><Field label="Workplace"><input value={profile.workplace} onChange={(e) => update('workplace', e.target.value)} placeholder="Optional" /></Field></div><div className="field-grid"><Field label="University"><input value={profile.university} onChange={(e) => update('university', e.target.value)} placeholder="Optional" /></Field><Field label="Maximum commute"><select value={profile.maxCommute} onChange={(e) => update('maxCommute', e.target.value)}>{['15', '30', '45', '60', '90'].map((value) => <option key={value} value={value}>{value} minutes</option>)}</select></Field></div><Field label="Preferred transport"><select value={profile.preferredTransport} onChange={(e) => update('preferredTransport', e.target.value)}>{['Any', 'Car', 'Bike', 'Public transport', 'Walking'].map((i) => <option key={i}>{i}</option>)}</select></Field><Field label="Preferred cities"><input value={profile.preferredCities} onChange={(e) => update('preferredCities', e.target.value)} /></Field><Field label="Preferred areas"><input value={profile.preferredAreas} onChange={(e) => update('preferredAreas', e.target.value)} placeholder="Separate areas with commas" /></Field></FormSection><FormSection number="04" title="The home you picture" subtitle="What would make a home feel right?"><div className="field-grid"><Field label="Property type"><select value={profile.propertyType} onChange={(e) => update('propertyType', e.target.value)}>  {['Apartment', 'Villa', 'Independent House', 'Plot'].map((i) => <option key={i}>{i}</option>)}</select></Field><Field label="Bedrooms"><select value={profile.bhk} onChange={(e) => update('bhk', e.target.value)}>{[1, 2, 3, 4].map((i) => <option key={i}>{i}</option>)}</select></Field></div><div className="field-grid"><Field label="Area"><input value={profile.area} onChange={(e) => update('area', e.target.value)} placeholder="sq. ft." /></Field><Field label="Furnishing"><select value={profile.furnishing} onChange={(e) => update('furnishing', e.target.value)}>{['Any', 'Unfurnished', 'Semi-furnished', 'Fully furnished'].map((i) => <option key={i}>{i}</option>)}</select></Field></div><Field label="Amenities that matter"><div className="amenity-pills">{['Parking', 'Balcony', 'Lift', 'Security', 'Power backup', 'Gym', 'Swimming pool'].map((amenity) => <button className={`amenity-pill ${profile.amenities.includes(amenity) ? 'selected' : ''}`} type="button" key={amenity} onClick={() => update('amenities', profile.amenities.includes(amenity) ? profile.amenities.filter((item) => item !== amenity) : [...profile.amenities, amenity])}>{profile.amenities.includes(amenity) && <Check size={12} />}{amenity}</button>)}</div></Field></FormSection><div className="requirements-submit"><button className="button quiet" onClick={() => { setProfile({ ...emptyProfile }); setSaved(false) }}>Reset profile</button><button className="button primary" onClick={() => setSaved(true)}>{saved ? <><Check size={15} /> Saved on this device</> : <>Save my profile <ArrowRight size={15} /></>}</button></div></div></>
}

function Appointments({ appointments, setAppointments }: { appointments: Appointment[]; setAppointments: (appointments: Appointment[]) => void }) {
  const location = useLocation()
  const [propertyId, setPropertyId] = useState(() => new URLSearchParams(location.search).get('propertyId') ?? '')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:30 AM')
  const [success, setSuccess] = useState(false)
  const minimumDate = new Date().toISOString().slice(0, 10)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!propertyId || !date) return
    setAppointments([...appointments, { id: `VIS-${Date.now().toString().slice(-5)}`, propertyId, date, time, status: 'Upcoming' }])
    setSuccess(true)
  }
  return <><PageHeading eyebrow="TAKE THE NEXT STEP" title="Visits, on your terms." description="A chance to see how a home feels in person. Choose a time that works for you." /><div className="appointment-layout"><form className="panel booking-form" onSubmit={submit}><span className="eyebrow">PLAN A HOME VISIT</span><h3>Find a time to explore.</h3><Field label="Choose a home"><select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} required><option value="">Choose from our homes…</option>{properties.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.locality}, {p.city}</option>)}</select></Field><Field label="A date that works for you"><input type="date" value={date} min={minimumDate} onChange={(e) => setDate(e.target.value)} required /></Field><Field label="Preferred time"><select value={time} onChange={(e) => setTime(e.target.value)}><option>10:30 AM</option><option>12:00 PM</option><option>2:00 PM</option><option>4:30 PM</option></select></Field><button className="button primary" type="submit">Request a visit <ArrowRight size={15} /></button>{success && <div className="success-message"><CheckCircle2 size={15} /> Your visit request is on this device.</div>}</form><div className="panel visits-panel"><div className="section-header"><div><span className="eyebrow">ON YOUR CALENDAR</span><h3>Upcoming visits</h3></div><CalendarDays size={18} /></div>{appointments.filter((a) => a.status === 'Upcoming').map((appointment) => { const property = getProperty(appointment.propertyId); return <div className="appointment-line" key={appointment.id}><span className="date-block">{new Date(`${appointment.date}T00:00:00`).getDate()}<small>{new Date(`${appointment.date}T00:00:00`).toLocaleDateString('en', { month: 'short' }).toUpperCase()}</small></span><span><strong>{property?.name ?? 'Home visit'}</strong><small><MapPin size={12} /> {property?.locality ?? 'Property details'} · {appointment.time}</small></span><input className="appointment-date-edit" type="date" aria-label={`Reschedule ${appointment.id}`} value={appointment.date} min={minimumDate} onChange={(event) => setAppointments(appointments.map((item) => item.id === appointment.id ? { ...item, date: event.target.value } : item))} /><button className="icon-button" title="Cancel visit" onClick={() => setAppointments(updateAppointmentStatus(appointments, appointment.id, 'Cancelled'))}><X size={15} /></button></div>})}{appointments.every((a) => a.status !== 'Upcoming') && <p className="muted-copy">No visits planned yet. This is a lovely place to start.</p>}<small className="sim-disclaimer">Visits are demo requests; no property owner is contacted.</small></div></div></>
}

function Messages() {
  const [active, setActive] = useState(0)
  const [text, setText] = useState('')
  const [messages, setMessages] = useState(() => readStorage<{ from: 'them' | 'you'; text: string }[]>('messages', [{ from: 'them', text: 'Hello! Thanks for your interest in Aurum Residences. I’d be happy to answer your questions.' }, { from: 'you', text: 'I’d love to learn more about the neighbourhood and arrange a visit.' }, { from: 'them', text: 'Of course. We can arrange a visit this weekend. Let me know which time works for you.' }]))
  const send = (event: FormEvent) => { event.preventDefault(); if (!text.trim()) return; const next = [...messages, { from: 'you' as const, text: text.trim() }]; setMessages(next); writeStorage('messages', next); setText('') }
  const activeConversation = demoConversations[active] ?? demoConversations[0]
  return <>
    <PageHeading eyebrow="GOOD CONVERSATIONS START HERE" title="Your messages." description="Talk through the details, ask a question, or simply say hello." />
    <div className="chat-layout">
      <aside className="panel conversation-list"><span className="eyebrow">RECENT CONVERSATIONS</span>{demoConversations.map((conversation, index) => <button key={conversation.id} className={`conversation-button ${active === index ? 'active' : ''}`} onClick={() => setActive(index)}><span className="conversation-avatar">{conversation.name.charAt(0)}</span><span><strong>{conversation.name}</strong><small>{conversation.participant} · Demo</small><small className="conversation-last">{conversation.lastMessage}</small></span></button>)}</aside>
      <section className="panel chat-panel">
        <div className="chat-header"><span className="conversation-avatar">{activeConversation.name.charAt(0)}</span><span><strong>{activeConversation.name}</strong><small>{activeConversation.participant} · Demo conversation · Responses simulated</small></span><button className="icon-button" aria-label="More conversation options"><Settings size={16} /></button></div>
        <div className="chat-messages"><div className="chat-day">TODAY · DEMO MESSAGES</div>{messages.map((message, index) => <div key={index} className={`chat-bubble ${message.from === 'you' ? 'mine' : ''}`}>{message.text}<small>{message.from === 'you' ? 'You' : activeConversation.participant} · {index % 2 === 0 ? '10:42 AM' : '10:45 AM'}</small></div>)}<small className="sim-disclaimer">Prototype conversation — no external messages are sent.</small></div>
        <form className="chat-compose" onSubmit={send}><button type="button" className="icon-button" title="Attachments are not available in demo"><Plus size={17} /></button><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a thoughtful message…" /><button className="button primary small" type="submit">Send <ArrowRight size={14} /></button></form>
      </section>
    </div>
  </>
}

function SellWizard() {
  const [step, setStep] = useState(0)
  const [listing, setListing] = useState({ type: 'Apartment', city: 'Mangaluru', locality: '', bhk: '2', price: '', title: '' })
  const [published, setPublished] = useState(false)
  const fields: [string, keyof typeof listing, string[]?][] = [
    ['What kind of home?', 'type', ['Apartment', 'Villa', 'Independent House', 'Plot']],
    ['Where is it?', 'city', ['Mangaluru', 'Bengaluru', 'Mysuru', 'Hyderabad', 'Chennai', 'Pune', 'Mumbai', 'Delhi NCR']],
    ['The details that matter', 'locality'],
    ['A thoughtful price', 'price'],
    ['Give your listing a name', 'title'],
    ['Ready for a final look?', 'title'],
  ]
  const [title, key, choices] = fields[step]
  return <><PageHeading eyebrow="A NEW CHAPTER" title="Share a home with the world." description="A simple first step toward finding the right person for your property." /><div className="wizard"><div className="wizard-progress">{fields.map(([label], index) => <div key={label} className={index <= step ? 'active' : ''}><span>{index < step ? <Check size={13} /> : index + 1}</span><small>{['Type', 'Location', 'Details', 'Price', 'Photos', 'Preview'][index]}</small></div>)}</div><div className="panel wizard-body"><span className="eyebrow">STEP {step + 1} OF {fields.length}</span><h2>{published ? 'Your listing is ready to review.' : title}</h2><p>{published ? 'This prototype has saved your draft locally. Publishing it does not create a real listing.' : 'A few thoughtful details go a long way.'}</p>{!published && <Field label={title}><>{choices ? <select value={listing[key]} onChange={(e) => setListing({ ...listing, [key]: e.target.value })}>{choices.map((option) => <option key={option}>{option}</option>)}</select> : <input value={listing[key]} onChange={(e) => setListing({ ...listing, [key]: e.target.value })} placeholder={key === 'price' ? '₹ Asking price' : key === 'title' ? 'e.g. A bright apartment in Kadri' : 'Add details'} />}</></Field>}<div className="wizard-actions">{step > 0 && !published && <button className="button quiet" onClick={() => setStep(step - 1)}>Back</button>}{!published && (step < fields.length - 1 ? <button className="button primary" onClick={() => setStep(step + 1)}>Continue <ArrowRight size={15} /></button> : <button className="button primary" onClick={() => { writeStorage('listingDraft', listing); setPublished(true) }}>Save my draft <Check size={15} /></button>)}</div></div></div></>
}

function RoleDashboard({ role }: { role: 'owner' | 'developer' }) {
  const developer = role === 'developer'
  const tiles = developer
    ? [['Active projects', '6', 'across 3 cities'], ['Homes available', '142', 'across your projects'], ['New enquiries', '28', 'this month'], ['Visits scheduled', '12', 'upcoming']]
    : [['Your homes', '4', '1 active listing'], ['New enquiries', '18', 'waiting for a reply'], ['Visits booked', '6', 'this week'], ['In conversation', '3', 'active discussions']]
  return <><PageHeading eyebrow={developer ? 'BUILT FOR WHAT COMES NEXT' : 'YOUR PROPERTY, YOUR PACE'} title={developer ? 'Project workspace.' : 'A good place to start.'} description={developer ? 'A clear picture of your projects, availability, and conversations.' : 'Keep an eye on your homes, conversations, and upcoming visits.'} action={<span className="sim-tag">DEMO DATA</span>} /><div className="stat-grid">{tiles.map(([label, value, note]) => <div className="stat-card" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>)}</div><div className="panel role-panel"><div className="section-header"><div><span className="eyebrow">{developer ? 'YOUR PROJECT PORTFOLIO' : 'RECENT INTEREST'}</span><h3>{developer ? 'A pulse on your projects.' : 'Homes people are exploring.'}</h3></div><Link to={developer ? '/developer/projects' : '/sell'} className="button secondary small">{developer ? 'View projects' : 'Add a property'} <ArrowRight size={14} /></Link></div><div className="role-list">{properties.slice(developer ? 0 : 4, developer ? 4 : 8).map((property, index) => <div key={property.id}><img src={property.image} alt="" /><span><strong>{property.name}</strong><small>{property.locality}, {property.city} · {developer ? 'Project' : 'Property'}</small></span><b>{index * 3 + 4} new {developer ? 'enquiries' : 'views'}</b><ChevronRight size={15} /></div>)}</div></div><div className="role-notice"><ShieldCheck size={16} /> This is a simulated workspace. Your activity stays in this browser and is not shared with real buyers or tenants.</div></>
}

function AdminDashboard() {
  const overview = getAdminOverview()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const stats = [['Total users', String(overview.users), 'Prototype user profiles'], ['Active properties', String(overview.properties), 'Seeded demo homes'], ['Appointments', String(overview.appointments), 'Local demo visits'], ['Transactions', String(overview.transactions), `₹${(overview.revenue / 100000).toFixed(1)}L illustrative fees`]]
  const adminNav = adminLinks
  return <><PageHeading eyebrow="PLATFORM OVERVIEW" title={`${greeting}, Admin.`} description="A thoughtful view of activity across your Habryn demo platform." action={<span className="sim-tag">SIMULATED DATA</span>} /><div className="stat-grid">{stats.map(([label, value, note]) => <div className="stat-card" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>)}</div><div className="admin-lower"><div className="panel"><div className="section-header"><div><span className="eyebrow">PLATFORM ACTIVITY</span><h3>Everything in view.</h3></div><Activity size={18} /></div><div className="admin-activity">{[['New member joined', 'A demo user created an account', '2 min ago'], ['Property submitted', 'Bluebell Heights · Bengaluru', '18 min ago'], ['AI match complete', '24 homes ranked · simulation', '1 hour ago'], ['Visit requested', 'Kadri, Mangaluru', '3 hours ago']].map(([title, subtitle, when], i) => <div key={title}><span className={`activity-dot dot-${i}`} /><span><strong>{title}</strong><small>{subtitle}</small></span><time>{when}</time></div>)}</div></div><div className="panel admin-quick-links"><span className="eyebrow">QUICK ACCESS</span><h3>Explore the platform</h3>{adminNav.slice(1).map(({ label, to, icon: Icon }) => <Link to={to} key={label}><Icon size={15} />{label}<ChevronRight size={14} /></Link>)}</div></div></>
}

function UtilityPage({ saved, theme, setTheme }: { saved: string[]; theme: string; setTheme: (theme: string) => void }) {
  const location = useLocation()
  const section = location.pathname.split('/').filter(Boolean).at(-1) ?? 'home'
  const titles: Record<string, string> = {
    home: 'Your place, your story.', services: 'A few helpful hands.', student: 'A good place to begin.', roommates: 'The right people make a place.', health: 'Know your home, a little better.', experience: 'The life you expected.', 'home-passport': 'A little history, a lot of home.', 'move-in': 'Ready for the next chapter?', transactions: 'A clear path forward.', payments: 'Thoughtful costs, clearly laid out.', 'property-shield': 'A closer look, before you decide.', documents: 'The details worth knowing.', projects: 'A closer look at what is being built.', 'risk-map': 'See the bigger picture.', community: 'Get to know the neighbourhood.', 'true-cost': 'The full picture of home ownership.', ai: 'Intelligence, made transparent.', users: 'People make the platform.', properties: 'A closer look at the homes.', reports: 'A considered view of the platform.', settings: 'A space that feels like yours.',
  }
  const title = titles[section] ?? 'Your Habryn space.'
  const [checks, setChecks] = useState<string[]>(() => readStorage(`checklist:${section}`, []))
  const [notice, setNotice] = useState('')
  const addCheck = (item: string) => { const next = checks.includes(item) ? checks.filter((value) => value !== item) : [...checks, item]; setChecks(next); writeStorage(`checklist:${section}`, next) }
  const isAdmin = location.pathname.startsWith('/admin')
  const checklist = section === 'move-in' ? ['Review the agreement', 'Set up electricity', 'Arrange water service', 'Book internet installation', 'Plan your move', 'Arrange a deep clean', 'Furniture & appliances', 'Protect your new home'] : section === 'health' ? ['Air conditioning', 'Plumbing', 'Electrical', 'Painting', 'Appliances', 'Renovation', 'Inspection', 'Warranty reminders'] : section === 'my-home' ? ['My current home', 'Home documents', 'Bills & utilities', 'Maintenance', 'Warranty', 'Home inventory', 'Service history', 'Reminders'] : section === 'services' ? ['Cleaning', 'Moving', 'AC service', 'Plumbing', 'Electrical', 'Furniture', 'Internet', 'Storage', 'Pest control', 'Groceries & milk', 'Maintenance'] : section === 'student' ? ['PG stays', 'Shared accommodation', 'Student housing', 'Near your university', 'Transport', 'Flexible budgets', 'Furnished rooms', 'Reliable internet'] : section === 'roommates' ? ['Find roommates in your city', 'Share budget preferences', 'University proximity', 'Find your move-in match', 'Compare lifestyle preferences', 'See shared homes'] : section === 'my-home' && location.pathname.endsWith('health') ? ['AC service', 'Plumbing', 'Electrical', 'Appliances', 'Painting', 'Renovation', 'Inspection', 'Warranty'] : isAdmin ? section === 'users' ? ['Search across 2,481 demo users', 'Filter by account type', 'Review account activity'] : section === 'properties' ? ['846 demo listings in database', 'Filter by city or status', 'Review pending listings'] : section === 'appointments' ? ['128 demo appointments', 'Upcoming · 32', 'Completed · 84', 'Cancelled · 12'] : section === 'transactions' ? ['64 transactions · simulated', 'Buyer · Seller · Property', '₹82.4L demo fees'] : section === 'ai' ? ['Matching requests · 128', 'Average prototype fit · 82/100', 'Confidence · High: 42% · Medium: 46% · Low: 12%', 'Failed analyses · 2 · simulated'] : ['User activity · demo', 'Property activity · demo', 'AI usage · simulated', 'Export summary · demo'] : section === 'home-passport' ? ['Current home profile', 'Housing preferences', 'Documents', 'Maintenance history', 'Service history', 'Move history', 'Decision history'] : section === 'projects' ? ['Meridian Living · 3 projects', 'Oakfield Communities · 2 projects', 'View units & pricing', 'Possession: demo data'] : section === 'community' ? ['Schools · simulated nearby', 'Hospitals · simulated nearby', 'Groceries · simulated nearby', 'Restaurants & parks', 'Public transport · simulated'] : ['Home services · explore provider options', 'Share a property with a friend', 'Review your housing preferences', 'Explore home recommendations']
  if (isAdmin && ['users', 'properties', 'appointments', 'transactions'].includes(section)) return <><PageHeading eyebrow="PLATFORM MANAGEMENT" title={title} description="Search, review, and update seeded demo records. Changes are local to this prototype." /><AdminManagement section={section} /></>
  if (section === 'services') return <><PageHeading eyebrow="HOME, MADE EASIER" title={title} description="Explore local helpers for the little things that make a home feel like home." /><ServicesMarketplace /></>
  if (section === 'student') return <><PageHeading eyebrow="A SPACE TO GROW" title={title} description="Explore student-friendly stays by city, budget, campus commute, and everyday essentials." /><StudentHousing /></>
  if (section === 'roommates') return <><PageHeading eyebrow="GOOD COMPANY, GOOD HOME" title={title} description="Find people with similar priorities, budgets, and timelines. Compatibility is illustrative." /><RoommateBrowser /></>
  if (section === 'projects' && !isAdmin) return <><PageHeading eyebrow="PROJECT INTELLIGENCE · DEMO" title={title} description="A sample of development projects, availability, and expected possession." /><ProjectBrowser /></>
  if (section === 'property-shield' || section === 'risk-map') return <><PageHeading eyebrow="PROPERTY SHIELD · PROTOTYPE" title={title} description="Sample listing signals to help you decide what to verify—not a legal or government check." /><PropertyShield /></>
  return <>
    <PageHeading eyebrow={isAdmin ? 'PLATFORM MANAGEMENT' : 'EVERYDAY LIVING'} title={title} description={isAdmin ? 'A working prototype workspace. All figures represent demo data.' : 'Your home journey continues, one thoughtful step at a time.'} action={isAdmin && section === 'settings' ? undefined : <span className="sim-tag">DEMO DATA</span>} />
    {section === 'settings' && <div className="panel settings-panel"><span className="eyebrow">YOUR EXPERIENCE</span><h3>Choose your theme</h3><p>Follow your system preference, or choose a look that feels right to you.</p><div className="theme-choice">{[['system', 'System', Settings], ['light', 'Light', Sun], ['dark', 'Dark', Moon]].map(([value, label, Icon]) => { const ThemeIcon = Icon as typeof Sun; return <button className={theme === value ? 'selected' : ''} key={value as string} onClick={() => setTheme(value as string)}><ThemeIcon size={18} />{label as string}{theme === value && <Check size={14} />}</button> })}</div></div>}
    {section === 'true-cost' && <TrueCostCalculator />}
    {section === 'documents' && <div className="panel upload-panel"><span className="eyebrow">DOCUMENT INTELLIGENCE · SIMULATED</span><h3>A first look at your paperwork.</h3><p>Try a document to see a prototype summary. No legal verification is performed.</p><label className="upload-drop"><input type="file" accept=".pdf,.doc,.docx,.png,.jpg" onChange={(e) => setNotice(e.target.files?.[0] ? `${e.target.files[0].name} selected · prototype analysis is not legal verification.` : '')} /><Plus size={20} />Choose a document to analyze<small>PDF, image, or agreement · files stay in this browser</small></label>{notice && <div className="success-message"><CheckCircle2 size={15} /> {notice}</div>}</div>}
    {(section === 'true-cost' || section === 'documents' || section === 'settings') ? null : section === 'home' ? <div className="home-cards"><div className="panel"><span className="eyebrow">YOUR SPACE</span><h3>A home you can grow into.</h3><p>When you find the right place, keep the things that matter together: useful documents, maintenance, bills, and the story of the places you've called home.</p><div className="home-actions"><Link to="/move-in" className="button primary small">Move-in checklist <ArrowRight size={14} /></Link><Link to="/home-passport" className="button secondary small">Your home passport <ArrowRight size={14} /></Link></div></div><div className="panel home-health"><span className="eyebrow">A SMALL NUDGE</span><h3>Home health, without the guesswork.</h3><p>Track a repair, set a reminder, or keep an invoice close at hand.</p><Link to="/my-home/health" className="text-link">Explore home health <ArrowRight size={14} /></Link></div></div> : <div className="utility-layout"><div className="panel checklist-panel"><div className="section-header"><div><span className="eyebrow">{section === 'services' ? 'LOCAL PROVIDERS · DEMO' : section === 'student' ? 'STUDENT LIVING · DEMO' : section === 'move-in' ? 'YOUR MOVING CHECKLIST' : section === 'roommates' ? 'LIFESTYLE MATCH · SIMULATED' : section === 'home-passport' ? 'YOUR HOUSING STORY' : 'ON THE RADAR'}</span><h3>{section === 'services' ? 'A few trusted starting points.' : section === 'student' ? 'Find a space to focus and grow.' : section === 'roommates' ? 'Find people you’ll enjoy sharing with.' : section === 'move-in' ? 'One step at a time.' : 'Your next step is yours to choose.'}</h3></div><span className="sim-tag">PROTOTYPE</span></div>{checklist.map((item, index) => { const checked = checks.includes(item); const providers = ['HomeFresh Care', 'MoveEasy Mangaluru', 'ChillPoint AC', 'FlowRight Plumbing', 'BrightSpark Electric', 'Comfort & Co.', 'ConnectHome Internet', 'Spacewise Storage', 'PureHome Pest Care', 'DailyDairy Local', 'GoodHome Maintenance']; return <div className={`checklist-row ${checked ? 'checked' : ''}`} key={item}><button aria-label={checked ? `Unmark ${item}` : `Mark ${item} complete`} onClick={() => addCheck(item)} className="check-circle">{checked && <Check size={13} />}</button><span><strong>{item}</strong><small>{section === 'services' ? `${providers[index % providers.length]} · Demo provider · from ₹${[399, 1299, 599, 299, 350, 899, 499, 899, 599, 399, 299][index % 11]}` : checked ? 'Added to your home journey' : section === 'student' ? 'Explore flexible options · simulated availability' : section === 'roommates' ? `${78 + index % 20}% lifestyle compatibility · illustrative` : 'Mark this as complete when you’re ready'}</small></span>{section === 'services' ? <button className="button secondary small" onClick={() => setNotice(`${providers[index % providers.length]} · Request saved locally.`)}>{checked ? 'Requested' : 'Request'}</button> : <ChevronRight size={15} />}</div>})}{notice && <div className="success-message"><CheckCircle2 size={14} /> {notice}</div>}<div className="checklist-progress"><div><span>Your progress</span><strong>{checks.length} / {checklist.length}</strong></div><div className="progress-track"><i style={{ width: `${checklist.length ? checks.length / checklist.length * 100 : 0}%` }} /></div></div>{['health', 'experience'].includes(section) && <button className="button secondary small" onClick={() => setNotice('Your update is saved locally in this browser.')}><Plus size={14} /> Add an update</button>}{section === 'home-passport' && <button className="button secondary small" onClick={() => setNotice('Your home passport is ready as a prototype.')}><ArrowDown size={14} /> Export my home passport</button>}</div><aside className="panel utility-aside"><span className="aside-icon"><Sparkles size={18} /></span><span className="eyebrow">A LITTLE CONTEXT</span><h3>Made for a real life.</h3><p>What you see here is a prototype powered by sample data. We’ll be clear about what’s simulated—so you can make thoughtful decisions with confidence.</p><Link to="/buy/requirements" className="text-link">Explore housing matches <ArrowRight size={14} /></Link>{section === 'home' && <span className="saved-count"><Heart size={15} /> {saved.length} saved homes</span>}</aside></div>}
    {isAdmin && section !== 'settings' && <div className="admin-export panel"><div><ShieldCheck size={17} /><span><strong>Simulated platform data</strong><small>All figures, exports, and controls are mock data and have no effect on real users or listings.</small></span></div><button className="button secondary small" onClick={() => { const file = new Blob([exportDemoReport()], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(file); const link = document.createElement('a'); link.href = url; link.download = 'habryn-demo-report.csv'; link.click(); URL.revokeObjectURL(url); setNotice('Demo report downloaded. These are simulated figures.') }}>Export demo report <ArrowDown size={14} /></button>{notice && <span className="export-notice"><Check size={13} /> {notice}</span>}</div>}
  </>
}

function TrueCostCalculator() {
  const defaultCosts = { purchase: 6500000, registration: 455000, taxes: 0, financing: 1200000, maintenance: 60000, utilities: 36000, insurance: 15000, repairs: 30000, other: 0 }
  const [costs, setCosts] = useState(() => readStorage('trueCostAssumptions', defaultCosts))
  const labels: [keyof typeof defaultCosts, string][] = [
    ['purchase', 'Purchase price'],
    ['registration', 'Registration · estimate'],
    ['taxes', 'Additional taxes · estimate'],
    ['financing', 'Financing costs · illustrative'],
    ['maintenance', 'Maintenance · 1 year'],
    ['utilities', 'Utilities · 1 year'],
    ['insurance', 'Insurance · 1 year'],
    ['repairs', 'Repairs · estimate'],
    ['other', 'Other costs'],
  ]
  const update = (key: keyof typeof defaultCosts, value: number) => {
    const next = { ...costs, [key]: value }
    setCosts(next)
    writeStorage('trueCostAssumptions', next)
  }
  const total = Object.values(costs).reduce((sum, amount) => sum + amount, 0)
  return <div className="panel calculator-panel"><span className="eyebrow">A THOUGHTFUL ESTIMATE</span><h3>What could this home really cost?</h3><p>Adjust the assumptions to explore the full picture. Actual costs vary by home, lender, and local regulations.</p><div className="calc-inputs">{labels.map(([key, label]) => <label key={key}>{label}<span>₹ <input type="number" min={0} step={5000} value={costs[key]} onChange={(event) => update(key, Number(event.target.value))} /></span></label>)}</div><div className="total-cost"><span>Illustrative estimated total</span><strong>₹{(total / 100000).toFixed(1)} L</strong></div><small className="sim-disclaimer">Illustrative calculation only; not financial advice or a lender quote.</small></div>
}

function PropertyShield() {
  const flagged = properties.filter((property) => property.risk !== 'Low')
  const lowConcern = properties.length - flagged.length
  return <><div className="risk-summary-grid">{[['LOW CONCERN', lowConcern, 'No sample flags surfaced'], ['REVIEW', properties.filter((property) => property.risk === 'Review').length, 'Details worth confirming'], ['WARNING', properties.filter((property) => property.risk === 'Warning').length, 'Check before proceeding']].map(([label, count, note]) => <div className="panel risk-summary-card" key={label as string}><span className={`risk-dot ${String(label).toLowerCase()}`} /><span className="eyebrow">{label as string}</span><strong>{count}</strong><small>{note as string}</small></div>)}</div><section className="panel admin-table-panel"><div className="admin-table-toolbar"><span className="eyebrow">DEMO RISK SIGNALS</span><span className="sim-tag">SIMULATED · NOT VERIFIED</span></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>HOME</th><th>LOCATION</th><th>PRICE</th><th>SAMPLE SIGNAL</th><th>DETAILS</th></tr></thead><tbody>{flagged.slice(0, 24).map((property) => <tr key={property.id}><td><Link to={`/property/${property.id}`}><strong>{property.name}</strong></Link><small>{property.id}</small></td><td>{property.locality}, {property.city}</td><td>₹{(property.price / 100000).toFixed(0)} L</td><td><span className={`status-badge ${property.risk.toLowerCase()}`}>{property.risk}</span></td><td><Link className="text-link" to={`/property/${property.id}`}>Review listing <ArrowRight size={12} /></Link></td></tr>)}</tbody></table></div></section><div className="risk-legal-note"><ShieldCheck size={16} /><span><strong>Prototype risk signal — not legal verification.</strong><small>All signals are generated from demo attributes only. Always independently verify ownership, documents, pricing, and transaction details.</small></span></div></>
}

function ServicesMarketplace() {
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [requests, setRequests] = useState<string[]>(() => readStorage('serviceRequests', []))
  const providers = findProviders(category || undefined, city || undefined)
  const categories = [...new Set(demoServiceProviders.map((provider) => provider.category))]
  const request = (id: string) => {
    const next = requests.includes(id) ? requests : [...requests, id]
    setRequests(next)
    writeStorage('serviceRequests', next)
  }
  return <><div className="service-toolbar"><div className="amenity-pills">{categories.map((item) => <button className={`amenity-pill ${category === item ? 'selected' : ''}`} key={item} onClick={() => setCategory(category === item ? '' : item)}>{item}</button>)}</div><select aria-label="Filter providers by city" value={city} onChange={(event) => setCity(event.target.value)}><option value="">All cities</option>{['Mangaluru', 'Bengaluru', 'Mysuru', 'Hyderabad', 'Chennai', 'Pune', 'Mumbai', 'Delhi NCR'].map((item) => <option key={item}>{item}</option>)}</select></div><div className="service-grid">{providers.map((provider) => { const requested = requests.includes(provider.id); return <article className="panel service-card" key={provider.id}><span className="service-symbol"><Settings size={16} /></span><span className="eyebrow">{provider.category.toUpperCase()}</span><h3>{provider.name}</h3><div className="service-meta"><span>★ {provider.rating.toFixed(1)} · Demo reviews</span><span>{provider.city} · Simulated</span></div><strong className="service-price">From ₹{provider.priceFrom.toLocaleString('en-IN')}</strong><button className={`button ${requested ? 'secondary' : 'primary'} small`} onClick={() => request(provider.id)}>{requested ? <><Check size={13} /> Requested · Track</> : <>Request a service <ArrowRight size={13} /></>}</button></article> })}</div>{providers.length === 0 && <EmptyState title="No providers in this area yet." message="Try another city or explore all provider categories." to="/services" />}<small className="sim-disclaimer">33 demo providers across eight cities. No real booking or payment is made.</small></>
}

function StudentHousing() {
  const [city, setCity] = useState('Mangaluru')
  const [budget, setBudget] = useState(20000)
  const [commute, setCommute] = useState(30)
  const [essentials, setEssentials] = useState<string[]>([])
  const [requests, setRequests] = useState<string[]>(() => readStorage('studentStayRequests', []))
  const candidates = studentStays.filter((stay) =>
    stay.city === city
    && stay.available
    && stay.monthlyRent <= budget
    && stay.commuteMinutes <= commute
    && essentials.every((essential) => essential === 'Furnished' ? stay.furnished : essential === 'Internet' ? stay.internet : stay.meals),
  )
  const toggleEssential = (essential: string) => setEssentials((current) => current.includes(essential) ? current.filter((item) => item !== essential) : [...current, essential])
  const request = (id: string) => {
    const next = requests.includes(id) ? requests : [...requests, id]
    setRequests(next)
    writeStorage('studentStayRequests', next)
  }
  return <><div className="student-search panel"><Field label="City"><select value={city} onChange={(event) => setCity(event.target.value)}>{['Mangaluru', 'Bengaluru', 'Mysuru', 'Hyderabad', 'Chennai', 'Pune', 'Mumbai', 'Delhi NCR'].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label={`Monthly budget · up to ₹${budget.toLocaleString('en-IN')}`}><input type="range" min={7000} max={35000} step={1000} value={budget} onChange={(event) => setBudget(Number(event.target.value))} /></Field><Field label={`Campus commute · up to ${commute} minutes`}><input type="range" min={10} max={60} step={5} value={commute} onChange={(event) => setCommute(Number(event.target.value))} /></Field><div className="amenity-pills">{['Furnished', 'Internet', 'Meals'].map((essential) => <button className={`amenity-pill ${essentials.includes(essential) ? 'selected' : ''}`} key={essential} onClick={() => toggleEssential(essential)}>{essentials.includes(essential) && <Check size={12} />}{essential}</button>)}</div></div><div className="section-header student-results-heading"><div><span className="eyebrow">STUDENT STAYS · DEMO</span><h2>{candidates.length} options near your campus</h2></div><span className="sim-tag">SIMULATED AVAILABILITY</span></div>{candidates.length ? <div className="project-grid">{candidates.map((stay) => <article className="panel project-card student-stay-card" key={stay.id}><span className="eyebrow">{stay.city.toUpperCase()} · {stay.locality}</span><h3>{stay.name}</h3><p>Near {stay.university}</p><div><span>Approx. campus commute</span><strong>{stay.commuteMinutes} min · simulated</strong></div><div><span>Monthly rent</span><strong>₹{stay.monthlyRent.toLocaleString('en-IN')}</strong></div><div className="amenity-list"><span>{stay.furnished ? 'Furnished' : 'Unfurnished'}</span><span>{stay.internet ? 'Internet' : 'Internet not listed'}</span><span>{stay.meals ? 'Meals available' : 'Meals not listed'}</span></div><button className={`button ${requests.includes(stay.id) ? 'secondary' : 'primary'} small`} onClick={() => request(stay.id)}>{requests.includes(stay.id) ? <><Check size={13} /> Interest noted</> : <>Request details <ArrowRight size={13} /></>}</button></article>)}</div> : <EmptyState title="No stays meet this combination." message="Try a wider commute, a different budget, or fewer must-haves." to="/student" />}<small className="sim-disclaimer">All stays and availability are fictional sample data. No landlords are contacted.</small></>
}

function RoommateBrowser() {
  const [city, setCity] = useState(readStorage('requirements', defaultRequirement).city)
  const [budget, setBudget] = useState(25000)
  const [connections, setConnections] = useState<string[]>(() => readStorage('roommateConnections', []))
  const candidates = demoRoommates.filter((roommate) => roommate.city === city && roommate.budget <= budget)
  const connect = (id: string) => {
    const next = connections.includes(id) ? connections : [...connections, id]
    setConnections(next)
    writeStorage('roommateConnections', next)
  }
  return <><div className="roommate-filters"><Field label="Preferred city"><select value={city} onChange={(event) => setCity(event.target.value)}>{['Mangaluru', 'Bengaluru', 'Mysuru', 'Hyderabad', 'Chennai', 'Pune', 'Mumbai', 'Delhi NCR'].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label={`Monthly budget · up to ₹${budget.toLocaleString('en-IN')}`}><input type="range" min={10000} max={35000} step={1000} value={budget} onChange={(event) => setBudget(Number(event.target.value))} /></Field><span className="sim-tag">{demoRoommates.length} DEMO PROFILES</span></div>{candidates.length ? <div className="roommate-grid">{candidates.map((roommate) => { const score = Math.max(55, roommate.compatibility - Math.round(Math.abs(budget - roommate.budget) / 2000)); const connected = connections.includes(roommate.id); return <article className="panel roommate-card" key={roommate.id}><span className="roommate-avatar">{roommate.name.split(' ').map((part) => part[0]).join('')}</span><span className="eyebrow">{roommate.city.toUpperCase()} · {roommate.moveIn.toUpperCase()}</span><h3>{roommate.name}</h3><span>{roommate.university}</span><p>{roommate.lifestyle}</p><div><span>Budget</span><strong>₹{roommate.budget.toLocaleString('en-IN')} / month</strong></div><div><span>Illustrative compatibility</span><strong className="fit-value">{score}%</strong></div><button className={`button ${connected ? 'secondary' : 'primary'} small`} onClick={() => connect(roommate.id)}>{connected ? <><Check size={13} /> Interest noted</> : <>Express interest <ArrowRight size={13} /></>}</button></article> })}</div> : <EmptyState title="No profiles match just yet." message="Try widening your monthly budget or exploring another city." to="/roommates" />}<small className="sim-disclaimer">Compatibility is an illustrative prototype score based on your selected city and budget.</small></>
}

function ProjectBrowser() {
  const [selected, setSelected] = useState<Record<string, 'analysis' | 'units'>>({})
  return <div className="project-grid">{demoProjects.map((project) => <article className="panel project-card" key={project.id}><span className="eyebrow">{project.city.toUpperCase()} · {project.status.toUpperCase()}</span><h3>{project.name}</h3><p>{project.locality} · by {project.developer}</p><div><span>Units in demo inventory</span><strong>{project.units}</strong></div><div><span>Possession</span><strong>{project.possession}</strong></div><div className="project-actions"><button className="button secondary small" onClick={() => setSelected({ ...selected, [project.id]: 'analysis' })}>Analyze project</button><button className="button secondary small" onClick={() => setSelected({ ...selected, [project.id]: 'units' })}>View units</button></div>{selected[project.id] && <div className="project-detail-note"><Sparkles size={13} />{selected[project.id] === 'analysis' ? `Simulated review: ${project.units} demo units · ${project.status} · independently verify developer and possession details.` : `Demo inventory: ${project.units} sample units. Pricing and availability are not real-time.`}</div>}<small>Demo data · availability requires independent confirmation</small></article>)}</div>
}

function AdminManagement({ section }: { section: string }) {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('Any')
  const [city, setCity] = useState('Any')
  const [userStatuses, setUserStatuses] = useState<Record<string, 'Active' | 'Pending' | 'Suspended'>>(() => readStorage('adminUserStatuses', {}))
  const [propertyStatuses, setPropertyStatuses] = useState<Record<string, string>>(() => readStorage('adminPropertyStatuses', {}))
  const [appointments, setAppointments] = useState<Appointment[]>(() => listAppointments(demoAppointments))
  useEffect(() => { saveAppointments(appointments) }, [appointments])
  const matchingUsers = searchDemoUsers(query, role).slice(0, 40)
  const matchingProperties = properties.filter((property) =>
    (city === 'Any' || property.city === city)
    && (!query || `${property.name} ${property.id} ${property.locality}`.toLowerCase().includes(query.toLowerCase())),
  ).slice(0, 40)

  if (section === 'users') return <section className="panel admin-table-panel"><div className="admin-table-toolbar"><div className="input-with-icon"><Search size={14} /><input aria-label="Search users" placeholder="Search a name, email or user ID" value={query} onChange={(event) => setQuery(event.target.value)} /></div><select aria-label="Filter by role" value={role} onChange={(event) => setRole(event.target.value)}>{['Any', 'user', 'owner', 'developer', 'admin'].map((item) => <option key={item}>{item}</option>)}</select><span className="sim-tag">{demoUsers.length} SEEDED USERS</span></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>PERSON</th><th>TYPE</th><th>JOINED</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{matchingUsers.map((user) => { const status = userStatuses[user.id] ?? user.status; return <tr key={user.id}><td><strong>{user.name}</strong><small>{user.id} · {user.email}</small></td><td><span className={`role-badge ${user.role}`}>{user.role}</span></td><td>{user.joined}</td><td><span className={`status-badge ${status.toLowerCase()}`}>{status}</span></td><td><button className="button secondary small" onClick={() => { const next = { ...userStatuses, [user.id]: status === 'Suspended' ? 'Active' as const : 'Suspended' as const }; setUserStatuses(next); writeStorage('adminUserStatuses', next) }}>{status === 'Suspended' ? 'Activate' : 'Suspend'}</button></td></tr> })}</tbody></table></div><small className="sim-disclaimer">Prototype account controls only affect this browser. No real user accounts are modified.</small></section>

  if (section === 'properties') return <section className="panel admin-table-panel"><div className="admin-table-toolbar"><div className="input-with-icon"><Search size={14} /><input aria-label="Search properties" placeholder="Search a listing, locality or ID" value={query} onChange={(event) => setQuery(event.target.value)} /></div><select aria-label="Filter by city" value={city} onChange={(event) => setCity(event.target.value)}>{['Any', ...new Set(properties.map((property) => property.city))].map((item) => <option key={item}>{item}</option>)}</select><span className="sim-tag">{properties.length} DEMO LISTINGS</span></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>PROPERTY</th><th>CITY</th><th>ASKING PRICE</th><th>STATUS</th><th>REVIEW</th></tr></thead><tbody>{matchingProperties.map((property) => { const status = propertyStatuses[property.id] ?? (property.risk === 'Low' ? 'Listed' : 'Review'); return <tr key={property.id}><td><strong>{property.name}</strong><small>{property.id} · {property.locality}</small></td><td>{property.city}</td><td>₹{(property.price / 100000).toFixed(0)} L</td><td><span className={`status-badge ${status.toLowerCase()}`}>{status}</span></td><td><button className="button secondary small" onClick={() => { const nextStatus = status === 'Review' ? 'Approved' : status === 'Suspended' ? 'Listed' : 'Review'; const next = { ...propertyStatuses, [property.id]: nextStatus }; setPropertyStatuses(next); writeStorage('adminPropertyStatuses', next) }}>{status === 'Review' ? 'Approve' : status === 'Suspended' ? 'Restore' : 'Flag for review'}</button></td></tr> })}</tbody></table></div><small className="sim-disclaimer">Prototype listing review; no external listings are affected.</small></section>

  if (section === 'appointments') return <section className="panel admin-table-panel"><div className="admin-table-toolbar"><span className="eyebrow">VISIT MANAGEMENT</span><span className="sim-tag">{appointments.length} APPOINTMENTS</span></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>VISIT</th><th>PROPERTY</th><th>DATE & TIME</th><th>STATUS</th><th>UPDATE</th></tr></thead><tbody>{appointments.map((appointment) => <tr key={appointment.id}><td><strong>{appointment.id}</strong><small>Demo buyer visit</small></td><td>{getProperty(appointment.propertyId)?.name ?? appointment.propertyId}<small>{getProperty(appointment.propertyId)?.locality}</small></td><td>{appointment.date}<small>{appointment.time}</small></td><td><span className={`status-badge ${appointment.status.toLowerCase()}`}>{appointment.status}</span></td><td><select aria-label={`Update status for ${appointment.id}`} value={appointment.status} onChange={(event) => setAppointments(updateAppointmentStatus(appointments, appointment.id, event.target.value as Appointment['status']))}>{['Upcoming', 'Completed', 'Cancelled'].map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div><small className="sim-disclaimer">Status changes are saved locally in this browser.</small></section>

  return <section className="panel admin-table-panel"><div className="admin-table-toolbar"><span className="eyebrow">TRANSACTION PIPELINE</span><span className="sim-tag">{listDemoTransactions().length} SIMULATED RECORDS</span></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>TRANSACTION</th><th>BUYER / SELLER</th><th>PROPERTY</th><th>VALUE</th><th>HABRYN FEE · DEMO</th><th>STAGE</th><th>DATE</th></tr></thead><tbody>{listDemoTransactions().map((transaction) => <tr key={transaction.id}><td><strong>{transaction.id}</strong><small>Prototype transaction</small></td><td>{transaction.buyer}<small>Seller: {transaction.seller}</small></td><td>{getProperty(transaction.propertyId)?.name ?? transaction.propertyId}</td><td>₹{(transaction.value / 100000).toFixed(0)} L</td><td>₹{(transaction.fee / 100000).toFixed(2)} L</td><td><span className="status-badge active">{transaction.status}</span></td><td>{transaction.date}</td></tr>)}</tbody></table></div><small className="sim-disclaimer">Illustrative model only: 1% buyer + 1% seller is a planned prototype example, not a universal brokerage rate.</small></section>
}

function Login({ onLogin, adminOnly = false }: { onLogin: (account: DemoUser) => void; adminOnly?: boolean }) {
  const [email, setEmail] = useState(adminOnly ? 'admin@habryn.com' : '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const accounts = listDemoAccounts(adminOnly)
  const redirectAfterLogin = (account: DemoUser) => {
    const from = (location.state as { from?: string } | null)?.from
    navigate(from?.startsWith('/admin') && account.role === 'admin' ? from : account.role === 'admin' ? '/admin' : account.role === 'owner' ? '/owner' : account.role === 'developer' ? '/developer' : '/dashboard', { replace: true })
  }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const account = authenticateDemoUser(email, password, adminOnly)
    if (!account) { setError('That email and password don’t match a demo account. Please check the details below.'); return }
    onLogin(account)
    redirectAfterLogin(account)
  }
  const useDemoAccount = (account: DemoAccount) => {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
    onLogin({ role: account.role, name: account.name, email: account.email })
    redirectAfterLogin({ role: account.role, name: account.name, email: account.email })
  }
  return <AuthShell><Link to="/" className="brand"><span className="brand-mark">H</span> HABRYN</Link><div className="auth-card"><span className="eyebrow">GOOD TO HAVE YOU HERE</span><h1>Welcome back.</h1><p>Pick up your search right where you left off.</p>{error && <div className="error-message"><CircleHelp size={15} /> {error}</div>}<form onSubmit={submit}><Field label="Email address"><div className="input-with-icon"><Mail size={15} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div></Field><Field label="Password"><div className="input-with-icon"><LockKeyhole size={15} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required /></div></Field><div className="auth-forgot"><span>Demo mode · no account needed</span><Link to="/forgot-password">Forgot password?</Link></div><button type="submit" className="button primary full">Continue to Habryn <ArrowRight size={16} /></button></form><div className="demo-credentials"><span className="eyebrow">TRY A DEMO ACCOUNT</span>{accounts.map((account) => <button key={account.email} type="button" onClick={() => useDemoAccount(account)}><span className={`role-dot ${account.role}`} /><span><strong>{account.role.charAt(0).toUpperCase() + account.role.slice(1)}</strong><small>{account.email}</small></span><span className="credential-hint">Use demo</span></button>)}</div><div className="auth-switch">New to Habryn? <Link to="/register">Create an account</Link></div></div><span className="auth-footer">Find. Decide. Belong. · Prototype / Demo Data</span></AuthShell>
}

function AuthShell({ children }: { children: ReactNode }) { return <main className="auth-page"><div className="auth-art"><div className="auth-art-copy"><span className="eyebrow"><Sparkles size={13} /> FIND. DECIDE. BELONG.</span><h2>Home is more than<br />an <span>address.</span></h2><p>Discover a home that fits your life, not just your search.</p></div><img src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85" alt="A calm, sunlit home interior" /><span className="auth-image-caption">A more thoughtful way home.</span></div><div className="auth-main">{children}</div></main> }

function Register({ onRegister }: { onRegister: (name: string, email: string) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const navigate = useNavigate()
  return <AuthShell><Link to="/" className="brand"><span className="brand-mark">H</span> HABRYN</Link><div className="auth-card"><span className="eyebrow">A WELCOME NEXT STEP</span><h1>Find your kind of home.</h1><p>Start a profile to make your search feel more like you.</p><form onSubmit={(e) => { e.preventDefault(); onRegister(name, email); navigate('/dashboard', { replace: true }) }}><Field label="Your name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="First and last name" required /></Field><Field label="Email address"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></Field><Field label="Create a password"><input type="password" minLength={6} placeholder="At least 6 characters" required /></Field><small className="sim-disclaimer">Prototype registration creates a local demo session; it does not create a real account.</small><button className="button primary full" type="submit">Create my profile <ArrowRight size={15} /></button></form><div className="auth-switch">Already have a demo account? <Link to="/login">Log in</Link></div></div><span className="auth-footer">Your information stays in this browser.</span></AuthShell>
}

function ForgotPassword() {
  const [sent, setSent] = useState(false)
  return <AuthShell><Link to="/" className="brand"><span className="brand-mark">H</span> HABRYN</Link><div className="auth-card"><span className="eyebrow">NO WORRIES</span><h1>A fresh start.</h1><p>This prototype doesn’t use real passwords or send reset emails. Choose a demo account to get back in.</p>{sent ? <div className="success-message"><CheckCircle2 size={16} /> Demo credentials are listed on the sign-in screen.</div> : <button className="button primary full" onClick={() => setSent(true)}>Show me the demo accounts <ArrowRight size={15} /></button>}<div className="auth-switch"><Link to="/login"><ArrowLeft size={13} /> Back to sign in</Link></div></div><span className="auth-footer">Prototype / Demo Data</span></AuthShell>
}

function EmptyState({ title, message, to }: { title: string; message: string; to: string }) {
  return <div className="empty-state"><span><Home size={23} /></span><h3>{title}</h3><p>{message}</p><Link className="button primary small" to={to}>Find a place to begin <ArrowRight size={15} /></Link></div>
}

export default App
