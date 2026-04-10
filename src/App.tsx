import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  Zap, 
  Clock, 
  User, 
  Settings, 
  Activity, 
  TrendingUp, 
  Trophy, 
  Shield, 
  Sparkles, 
  Globe, 
  CodeXml, 
  Bell, 
  Volume2, 
  Vibrate, 
  Trash2, 
  LogOut, 
  ChevronRight, 
  KeyRound,
  Info
} from 'lucide-react';

// --- Types ---
type GameType = 'wingo1m' | 'wingo30s';
type PredictionStatus = 'Pending' | 'WIN' | 'LOSS';
type PredictionValue = 'BIG' | 'SMALL';

interface Signal {
  id: string;
  period: string;
  prediction: PredictionValue;
  status: PredictionStatus;
  result: string;
  confidence: number;
}

interface Stats {
  wins: number;
  losses: number;
  signals: number;
  rate: number;
}

// --- Constants ---
const ACTIVATION_KEY = "VERSION -X ULTRA";
const STORAGE_KEY_AUTH = "_gz_auth_v3";
const STORAGE_KEY_HISTORY = "_gz_history_v3";

// --- Components ---

const Background = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let candles: any[] = [];
    let offset = 0;
    let animationFrame: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initCandles = () => {
      candles = [];
      let lastClose = 100 + Math.random() * 50;
      const count = Math.ceil(canvas.width / 22) + 5;
      for (let i = 0; i < count; i++) {
        const change = (Math.random() - 0.48) * 8;
        const open = lastClose;
        lastClose = Math.max(20, open + change);
        candles.push({
          open,
          close: lastClose,
          high: Math.max(open, lastClose) + Math.random() * 6,
          low: Math.min(open, lastClose) - Math.random() * 6
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const candleWidth = 12;
      const gap = 8;
      const step = candleWidth + gap;
      const centerY = canvas.height * 0.6;
      const scale = 3;

      offset = (offset + 0.25) % step;

      candles.forEach((c, i) => {
        const x = i * step - offset;
        if (x < -step || x > canvas.width + step) return;

        const color = c.close >= c.open ? 'rgba(180, 160, 80, 0.3)' : 'rgba(200, 60, 60, 0.25)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + candleWidth / 2, centerY - (c.high - 80) * scale);
        ctx.lineTo(x + candleWidth / 2, centerY - (c.low - 80) * scale);
        ctx.stroke();

        ctx.fillStyle = color;
        const top = Math.min(centerY - (c.open - 80) * scale, centerY - (c.close - 80) * scale);
        ctx.fillRect(x, top, candleWidth, Math.max(2, Math.abs((c.open - c.close) * scale)));
      });

      // Trend line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(200, 170, 60, 0.15)';
      ctx.lineWidth = 1.5;
      let first = true;
      candles.forEach((c, i) => {
        const x = i * step + candleWidth / 2 - offset;
        const y = centerY - ((c.open + c.close) / 2 - 80) * scale;
        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    initCandles();
    draw();

    window.addEventListener('resize', resize);
    const interval = setInterval(initCandles, 15000);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, hsl(45 100% 50%) 40px, hsl(45 100% 50%) 41px)' }} />
      <div className="absolute inset-0 animate-grid-move" style={{ backgroundImage: 'linear-gradient(rgba(200,170,60,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(200,170,60,.02) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 25% 35%, rgba(200,170,60,.04) 0%, transparent 55%), radial-gradient(ellipse at 75% 65%, rgba(180,100,30,.03) 0%, transparent 55%)' }} />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-[1000] h-14 flex items-center justify-between px-4 bg-background/90 backdrop-blur-2xl border-b border-border/50">
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 animate-gold-pulse">
        <Crown size={17} className="text-primary" strokeWidth={1.8} />
      </div>
      <span className="font-brand text-[11px] font-bold tracking-[3px] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        VERSION -X ULTRA
      </span>
    </div>
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-[1.5px] bg-accent/10 border border-accent/15 text-accent">
      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
      LIVE
    </div>
  </nav>
);

const TabBar = ({ active, onChange }: { active: string, onChange: (id: string) => void }) => {
  const tabs = [
    { id: 'pred', label: 'PREDICT', icon: Zap },
    { id: 'hist', label: 'HISTORY', icon: Clock },
    { id: 'prof', label: 'PROFILE', icon: User },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] h-[62px] flex bg-background/95 backdrop-blur-2xl border-t border-border/40">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 relative transition-all duration-300 ${active === tab.id ? 'text-primary' : 'text-muted-foreground'}`}
        >
          {active === tab.id && (
            <motion.span 
              layoutId="activeTab"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[2px] rounded-b bg-primary shadow-[0_0_12px_hsl(var(--color-primary))]" 
            />
          )}
          <tab.icon size={19} strokeWidth={active === tab.id ? 2.2 : 1.6} />
          <span className="text-[8px] font-bold tracking-[1.5px] font-brand">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

const PredictionView = ({ 
  current, 
  timer, 
  timerFraction, 
  stats, 
  game, 
  onGameChange 
}: { 
  current: Signal | null, 
  timer: number, 
  timerFraction: number, 
  stats: Stats, 
  game: GameType, 
  onGameChange: (g: GameType) => void,
  key?: string
}) => {
  const prediction = current?.prediction?.toUpperCase() || "---";
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'wingo1m', name: 'WINGO 1 MIN', desc: '1 Min Cycle', icon: Activity, color: 'primary' },
          { id: 'wingo30s', name: 'WINGO 30 SEC', desc: '30 Sec Cycle', icon: TrendingUp, color: 'secondary' }
        ].map((g) => (
          <button
            key={g.id}
            onClick={() => onGameChange(g.id as GameType)}
            className={`rounded-2xl p-4 text-center flex flex-col items-center gap-2 transition-all duration-300 ${game === g.id ? '-translate-y-1' : ''}`}
            style={{ 
              background: game === g.id ? `linear-gradient(135deg, var(--color-${g.color}) 0.1, var(--color-${g.color}) 0.03)` : 'hsl(var(--color-card))',
              border: `1px solid ${game === g.id ? `hsl(var(--color-${g.color}) / 0.3)` : 'hsl(var(--color-border) / 0.4)'}`,
              boxShadow: game === g.id ? `0 8px 30px hsl(var(--color-${g.color}) / 0.1)` : 'none'
            }}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-${g.color}/10 border border-${itemColor(g.color)}/15`}>
              <g.icon size={19} className={`text-${g.color}`} />
            </div>
            <span className="font-brand text-[10px] font-bold text-foreground tracking-[1px]">{g.name}</span>
            <span className="text-[9px] text-muted-foreground">{g.desc}</span>
          </button>
        ))}
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-card to-card/80 border border-border/50">
        <div className="h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        <div className="px-5 py-3 flex items-center justify-between border-b border-border/40">
          <span className="font-brand text-[9px] font-bold text-muted-foreground tracking-[2px]">CURRENT PERIOD</span>
          <span className="font-mono text-[11px] font-bold px-3 py-1 rounded-lg text-primary bg-primary/5 border border-primary/10">
            {current?.period || "—"}
          </span>
        </div>

        <div className="py-7 px-5 text-center">
          <div className="w-[115px] h-[115px] mx-auto mb-6 relative animate-ring-glow">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="43" fill="none" className="stroke-border/20" strokeWidth="4" />
              <circle 
                cx="50" cy="50" r="43" fill="none" 
                stroke="url(#timerGrad)" 
                strokeWidth="5" 
                strokeLinecap="round" 
                strokeDasharray="270.17" 
                strokeDashoffset={(1 - timerFraction / 100) * 270.17}
                style={{ transition: 'stroke-dashoffset 0.5s linear' }}
              />
              <defs>
                <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--color-primary))" />
                  <stop offset="100%" stopColor="hsl(var(--color-secondary))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-brand text-[26px] font-black text-primary">{timer}</span>
              <span className="text-[7px] text-muted-foreground font-bold tracking-[3px] mt-0.5">SECONDS</span>
            </div>
          </div>

          <div 
            className={`font-brand text-[48px] font-black mb-1 tracking-[3px] animate-signal-pulse ${prediction === 'BIG' ? 'text-accent' : prediction === 'SMALL' ? 'text-destructive' : 'text-muted-foreground'}`}
            style={{ textShadow: prediction !== '---' ? '0 0 30px currentColor' : 'none' }}
          >
            {prediction}
          </div>
          
          <div className="flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground tracking-[2px]">
            <Trophy size={10} /> AI PREDICTION SIGNAL
          </div>

          <div className="mt-6 px-3">
            <div className="h-[6px] rounded-full overflow-hidden bg-input">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${current?.confidence || 0}%` }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_15px_hsl(var(--color-primary))]" 
              />
            </div>
            <div className="flex justify-between mt-2 text-[9px]">
              <span className="text-muted-foreground tracking-[2px]">CONFIDENCE</span>
              <span className="font-mono font-bold text-primary">{current?.confidence || "--"}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 border-t border-border/30">
          {[
            { val: stats.wins, label: 'WIN', color: 'text-accent' },
            { val: stats.losses, label: 'LOSS', color: 'text-destructive' },
            { val: stats.signals, label: 'SIGNAL', color: 'text-primary' },
            { val: `${stats.rate}%`, label: 'RATE', color: 'text-secondary' }
          ].map((s, i) => (
            <div key={i} className={`text-center py-4 ${i > 0 ? 'border-l border-border/20' : ''}`}>
              <div className={`font-brand text-lg font-extrabold ${s.color}`}>{s.val}</div>
              <div className="text-[8px] text-muted-foreground mt-0.5 tracking-[2px] font-bold">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Helper for dynamic colors
const itemColor = (c: string) => {
  if (c === 'primary') return 'primary';
  if (c === 'secondary') return 'secondary';
  return 'muted';
};

const HistoryView = ({ history }: { history: Signal[], key?: string }) => {
  const [filter, setFilter] = useState<'all' | PredictionStatus>('all');
  const filtered = filter === 'all' ? history : history.filter(s => s.status === filter);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-brand text-xs font-bold tracking-[3px] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          SIGNAL HISTORY
        </h2>
        <div className="text-[9px] font-mono text-muted-foreground/50">TOTAL: {history.length}</div>
      </div>
      
      <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-card to-card/80 border border-border/50 shadow-xl">
        <div className="h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        <div className="flex gap-2 px-4 pt-4 pb-2 overflow-x-auto no-scrollbar">
          {['all', 'WIN', 'LOSS', 'Pending'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1.5 rounded-full text-[9px] font-bold tracking-[1.5px] transition-all duration-200 whitespace-nowrap ${filter === f ? 'bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg' : 'bg-transparent border border-border/30 text-muted-foreground'}`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="p-3 space-y-3 max-h-[450px] overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-3">
                <Clock size={20} className="text-muted-foreground/30" />
              </div>
              <div className="text-muted-foreground text-[10px] tracking-[2px] uppercase">No signals found</div>
            </div>
          ) : (
            filtered.map((s, i) => (
              <motion.div 
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="relative group"
              >
                <div className={`absolute -inset-[1px] rounded-xl bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity ${s.status === 'WIN' ? 'from-accent to-accent/0' : s.status === 'LOSS' ? 'from-destructive to-destructive/0' : 'from-primary to-primary/0'}`} />
                <div className="relative flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/10 hover:border-border/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-brand font-black text-sm ${s.prediction === 'BIG' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
                      {s.prediction[0]}
                    </div>
                    <div>
                      <div className="font-mono text-[9px] text-muted-foreground tracking-tighter">{s.period}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`font-brand text-[11px] font-bold ${s.prediction === 'BIG' ? 'text-accent' : 'text-destructive'}`}>
                          {s.prediction}
                        </span>
                        {s.result !== '-' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                            RES: {s.result}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[9px] font-black tracking-[1px] ${
                      s.status === 'WIN' ? 'text-accent' : 
                      s.status === 'LOSS' ? 'text-destructive' : 
                      'text-primary'
                    }`}>
                      {s.status.toUpperCase()}
                    </div>
                    <div className="text-[8px] text-muted-foreground/40 mt-0.5 font-mono">{s.confidence}% CONF</div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ProfileView = () => {
  const profileItems = [
    { label: 'Status', value: '● ACTIVE', color: 'hsl(var(--color-accent))', icon: Shield },
    { label: 'Plan', value: 'FREE PREMIUM', color: 'hsl(var(--color-primary))', icon: Sparkles },
    { label: 'Expiry', value: 'LIFETIME', color: 'hsl(var(--color-secondary))', icon: Globe },
    { label: 'Version', value: 'v3.0', color: 'hsl(var(--color-muted-foreground))', icon: CodeXml },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <h2 className="font-brand text-xs font-bold tracking-[3px] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        PROFILE
      </h2>
      <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-card to-card/80 border border-border/50">
        <div className="h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="p-6">
          <div className="relative w-[85px] h-[85px] mx-auto mb-5">
            <div className="absolute inset-0 rounded-2xl rotate-45 bg-primary/10 border border-primary/20" />
            <div className="absolute inset-0 flex items-center justify-center animate-float">
              <Crown size={34} className="text-primary" strokeWidth={1.5} />
            </div>
            <div className="absolute -inset-2 rounded-[22px] rotate-45 border border-primary/5" />
          </div>
          
          <div className="text-center mb-6">
            <h3 className="font-brand text-lg font-black tracking-[2px] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              VERSION -X ULTRA
            </h3>
            <p className="font-mono text-[10px] text-muted-foreground mt-1 tracking-wider">PREMIUM ACCESS • LIFETIME</p>
          </div>

          <div className="space-y-1">
            {profileItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3.5 border-b border-border/10 last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted">
                    <item.icon size={13} className="text-muted-foreground" />
                  </div>
                  <span className="text-[11px] text-muted-foreground">{item.label}</span>
                </div>
                <span className="font-brand text-[10px] font-bold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-card to-card/80 border border-border/50">
        <div className="p-5">
          <span className="font-brand text-[8px] font-bold text-muted-foreground tracking-[2px]">DEVELOPER</span>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg bg-primary/10 border border-primary/15">
              🧑‍💻
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">MMT TEAM</div>
              <div className="text-[10px] text-muted-foreground">Advanced AI Trading Solutions</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SettingsView = ({ onLogout, onClearHistory }: { onLogout: () => void, onClearHistory: () => void, key?: string }) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('gz_settings_notif');
    return saved === null ? true : saved === 'true';
  });
  const [sound, setSound] = useState(() => {
    const saved = localStorage.getItem('gz_settings_sound');
    return saved === null ? true : saved === 'true';
  });
  const [vibration, setVibration] = useState(() => {
    const saved = localStorage.getItem('gz_settings_vibrate');
    return saved === 'true';
  });

  const handleToggleNotif = () => {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem('gz_settings_notif', String(next));
    if (next && "Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  };

  const handleToggleSound = () => {
    const next = !sound;
    setSound(next);
    localStorage.setItem('gz_settings_sound', String(next));
  };

  const handleToggleVibrate = () => {
    const next = !vibration;
    setVibration(next);
    localStorage.setItem('gz_settings_vibrate', String(next));
  };

  const Toggle = ({ value, onToggle }: { value: boolean, onToggle: () => void }) => (
    <button 
      onClick={onToggle}
      className={`w-11 h-6 rounded-full relative transition-all duration-300 ${value ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-muted'}`}
    >
      <motion.span 
        animate={{ x: value ? 22 : 2 }}
        className="absolute top-0.5 left-0 w-5 h-5 rounded-full bg-white shadow-sm" 
      />
    </button>
  );

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="rounded-2xl overflow-hidden mb-4 bg-gradient-to-b from-card to-card/80 border border-border/50">
      <div className="px-4 pt-4 pb-2">
        <span className="font-brand text-[8px] font-bold text-muted-foreground tracking-[2px]">{title}</span>
      </div>
      {children}
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <h2 className="font-brand text-xs font-bold tracking-[3px] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        SETTINGS
      </h2>
      
      <Section title="PREFERENCES">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/10">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted">
              <Bell size={14} className="text-muted-foreground" />
            </div>
            <span className="text-sm text-foreground">Notifications</span>
          </div>
          <Toggle value={notifications} onToggle={handleToggleNotif} />
        </div>
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/10">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted">
              <Volume2 size={14} className="text-muted-foreground" />
            </div>
            <span className="text-sm text-foreground">Sound Effects</span>
          </div>
          <Toggle value={sound} onToggle={handleToggleSound} />
        </div>
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted">
              <Vibrate size={14} className="text-muted-foreground" />
            </div>
            <span className="text-sm text-foreground">Vibration</span>
          </div>
          <Toggle value={vibration} onToggle={handleToggleVibrate} />
        </div>
      </Section>

      <Section title="ACTIONS">
        <button 
          onClick={onClearHistory}
          className="flex items-center justify-between w-full px-4 py-3.5 hover:bg-muted/10 transition-colors border-b border-border/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-warning/10">
              <Trash2 size={14} className="text-warning" />
            </div>
            <span className="text-sm text-foreground">Clear History</span>
          </div>
          <ChevronRight size={14} className="text-muted-foreground" />
        </button>
        <button 
          onClick={onLogout}
          className="flex items-center justify-between w-full px-4 py-3.5 hover:bg-muted/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-destructive/10">
              <LogOut size={14} className="text-destructive" />
            </div>
            <span className="text-sm text-destructive">Logout</span>
          </div>
          <ChevronRight size={14} className="text-muted-foreground" />
        </button>
      </Section>

      <div className="rounded-2xl p-4 bg-card border border-border/30">
        <div className="flex items-center gap-2 mb-2">
          <Info size={12} className="text-muted-foreground" />
          <span className="font-brand text-[8px] font-bold text-muted-foreground tracking-[2px]">ABOUT</span>
        </div>
        <div className="text-[11px] text-muted-foreground space-y-1">
          <p>VERSION -X ULTRA v3.0</p>
          <p>AI-Powered Premium Signal Predictor</p>
          <p className="text-primary/40">© VERSION -X MOD SERVER</p>
        </div>
      </div>
    </motion.div>
  );
};

const AuthScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim().toUpperCase() === ACTIVATION_KEY) {
      localStorage.setItem(STORAGE_KEY_AUTH, "true");
      onLogin();
    } else {
      setError("Invalid activation key");
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        window.open("https://t.me/VERSION_X_COMMUNITY", "_blank");
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-5 bg-gradient-to-br from-background via-card to-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-[350px] h-[350px] rounded-full opacity-30 bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full opacity-30 bg-secondary/5 blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-[360px]"
      >
        <div className="text-center mb-8">
          <div className="relative w-[88px] h-[88px] mx-auto mb-5">
            <div className="absolute inset-0 rounded-[22px] rotate-45 bg-primary/20 border border-primary/20" />
            <div className="absolute inset-0 flex items-center justify-center animate-float">
              <Crown size={38} className="text-primary" strokeWidth={1.5} />
            </div>
            <div className="absolute -inset-2 rounded-[26px] rotate-45 border border-primary/10" />
          </div>
          <h1 className="font-brand text-[22px] font-black tracking-[4px] bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            VERSION -X ULTRA
          </h1>
          <p className="text-muted-foreground text-[11px] mt-2 tracking-[2px] uppercase">Premium Signal Predictor</p>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-border bg-gradient-to-b from-card to-card/90">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="p-6">
            <div className="flex justify-center gap-6 mb-7">
              {[
                { icon: Zap, label: 'FAST', color: 'primary' },
                { icon: Shield, label: 'SECURE', color: 'accent' },
                { icon: Crown, label: 'AI PRO', color: 'secondary' }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${item.color}/10 border border-${item.color}/15`}>
                    <item.icon size={17} className={`text-${item.color}`} />
                  </div>
                  <span className="text-[8px] font-bold tracking-[1.5px] text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground tracking-[2px] mb-2.5 block">ACTIVATION KEY</label>
                <motion.div animate={isShaking ? { x: [-8, 8, -5, 5, 0] } : {}}>
                  <div className="relative">
                    <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="text" 
                      value={key}
                      onChange={(e) => { setKey(e.target.value); setError(""); }}
                      placeholder="Enter your key..."
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                </motion.div>
                {error && <p className="text-destructive text-[11px] mt-2 flex items-center gap-1"><span>⚠</span> {error}</p>}
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 rounded-xl font-brand text-xs font-bold tracking-[2px] text-primary-foreground bg-gradient-to-br from-primary via-secondary to-primary shadow-[0_4px_24px_hsl(var(--color-primary)/0.3)] hover:brightness-110 active:scale-[0.98] transition-all"
              >
                ACTIVATE ACCESS
              </button>

              <div className="flex items-center gap-3 pt-2">
                <a 
                  href="https://t.me/VERSION_X_COMMUNITY" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 py-2.5 rounded-lg text-[9px] font-bold tracking-[1px] text-center bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all"
                >
                  JOIN TELEGRAM
                </a>
                <a 
                  href="https://t.me/error_404_system" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 py-2.5 rounded-lg text-[9px] font-bold tracking-[1px] text-center bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all"
                >
                  CONTACT DEV
                </a>
              </div>
            </form>
            <div className="mt-5 text-center">
              <p className="text-[9px] text-muted-foreground/40 tracking-[1px]">POWERED BY GZ AI ENGINE v3.0</p>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-[10px] text-muted-foreground/30">Developed by <span className="text-primary/50 font-semibold">MMT TEAM</span></p>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(STORAGE_KEY_AUTH) === "true");
  const [activeTab, setActiveTab] = useState("pred");
  const [game, setGame] = useState<GameType>("wingo1m");
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [history, setHistory] = useState<Signal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [timer, setTimer] = useState(30);
  const [timerFraction, setTimerFraction] = useState(0);
  const lastProcessedPeriod = useRef<string | null>(null);

  // Stats calculation
  const stats = useMemo(() => {
    const completed = history.filter(s => s.status !== 'Pending');
    const wins = completed.filter(s => s.status === 'WIN').length;
    return {
      wins,
      losses: completed.length - wins,
      signals: history.length,
      rate: completed.length > 0 ? Math.round((wins / completed.length) * 100) : 0
    };
  }, [history]);

  const generatePrediction = useCallback((period: string): PredictionValue => {
    // Deterministic prediction based on period string
    let hash = 0;
    for (let i = 0; i < period.length; i++) {
      hash = ((hash << 5) - hash) + period.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 2 === 0 ? 'BIG' : 'SMALL';
  }, []);

  const updateSignals = useCallback(() => {
    const now = new Date();
    const seconds = now.getSeconds();
    const cycleSeconds = game === 'wingo30s' ? 30 : 60;
    const currentTimer = cycleSeconds - (seconds % cycleSeconds);
    
    setTimer(currentTimer);
    setTimerFraction((currentTimer / cycleSeconds) * 100);

    // Period calculation
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    let currentPeriod = '';
    if (game === 'wingo30s') {
      const interval = seconds < 30 ? "0" : "1";
      currentPeriod = `${year}${month}${day}${hours}${minutes}${interval}`;
    } else {
      currentPeriod = `${year}${month}${day}${hours}${minutes}`;
    }

    if (currentPeriod !== lastProcessedPeriod.current) {
      setHistory(prev => {
        const newHistory = [...prev];
        
        // Update previous pending signal
        if (newHistory.length > 0 && newHistory[0].status === 'Pending') {
          // Simulate result
          const resultNum = Math.floor(Math.random() * 10);
          const resultType = resultNum >= 5 ? 'BIG' : 'SMALL';
          const isWin = resultType === newHistory[0].prediction;
          
          newHistory[0] = {
            ...newHistory[0],
            status: isWin ? 'WIN' : 'LOSS',
            result: String(resultNum)
          };
        }

        // Add new signal
        const prediction = generatePrediction(currentPeriod);
        const confidence = 85 + Math.floor(Math.random() * 14);
        const newSignal: Signal = {
          id: Date.now().toString(),
          period: currentPeriod,
          prediction,
          status: 'Pending',
          result: '-',
          confidence
        };

        const updated = [newSignal, ...newHistory].slice(0, 50);
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
        return updated;
      });
      lastProcessedPeriod.current = currentPeriod;
    }
  }, [generatePrediction, game]);

  useEffect(() => {
    setHistory([]);
    lastProcessedPeriod.current = null;
  }, [game]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const initTimeout = setTimeout(() => setIsInitializing(false), 1500);
    
    const interval = setInterval(updateSignals, 1000);
    updateSignals(); // Initial call

    return () => {
      clearTimeout(initTimeout);
      clearInterval(interval);
    };
  }, [isAuthenticated, updateSignals]);

  // Handle WIN/LOSS Effects (Sound, Notification, Vibration)
  useEffect(() => {
    if (history.length === 0) return;
    const latest = history[0];
    
    // We only trigger when a signal changes from Pending to WIN/LOSS
    // To avoid multiple triggers, we track the last notified period
    const lastNotified = localStorage.getItem('_gz_last_notified');
    
    if (latest.status !== 'Pending' && latest.period !== lastNotified) {
      const isWin = latest.status === 'WIN';
      const settings = {
        notif: localStorage.getItem('gz_settings_notif') !== 'false',
        sound: localStorage.getItem('gz_settings_sound') !== 'false',
        vibrate: localStorage.getItem('gz_settings_vibrate') === 'true'
      };

      // Notification
      if (settings.notif) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(isWin ? "🎯 WINNER!" : "📉 LOSS", {
            body: `Period: ${latest.period}\nResult: ${latest.prediction}`,
            icon: "/favicon.ico"
          });
        }
      }

      // Vibration (If enabled, sound is disabled as per request)
      if (settings.vibrate) {
        if ("vibrate" in navigator) {
          navigator.vibrate(isWin ? [200, 100, 200] : [500]);
        }
      } else if (settings.sound) {
        // Sound (Only if vibration is OFF)
        const audio = new Audio(isWin 
          ? "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3" // Win sound
          : "https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3" // Loss sound
        );
        audio.play().catch(() => {});
      }
      
      localStorage.setItem('_gz_last_notified', latest.period);
    }
  }, [history]);

  // Request Notification Permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY_AUTH);
    setIsAuthenticated(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  };

  if (!isAuthenticated) {
    return <AuthScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  if (isInitializing) {
    return (
      <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center gap-6 bg-background">
        <Background />
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-2xl rotate-45 bg-primary/10 border border-primary/20 animate-gold-pulse" />
          <div className="absolute inset-0 flex items-center justify-center animate-float">
            <Crown size={34} className="text-primary" strokeWidth={1.5} />
          </div>
        </div>
        <div className="font-brand text-xs tracking-[4px] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          VERSION -X ULTRA
        </div>
        <div className="w-[180px] h-[2px] rounded-full overflow-hidden bg-muted">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary animate-loader-bar" />
        </div>
        <div className="text-[9px] text-muted-foreground tracking-[3px]">INITIALIZING ENGINE...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Background />
      <Navbar />
      
      <main className="flex-1 relative z-10 pt-14 pb-[80px] overflow-y-auto">
        <div className="w-full max-w-[440px] mx-auto px-4 py-5">
          <AnimatePresence mode="wait">
            {activeTab === 'pred' && (
              <PredictionView 
                key="pred"
                current={history[0] || null} 
                timer={timer} 
                timerFraction={timerFraction}
                stats={stats}
                game={game}
                onGameChange={setGame}
              />
            )}
            {activeTab === 'hist' && (
              <HistoryView key="hist" history={history} />
            )}
            {activeTab === 'prof' && (
              <ProfileView key="prof" />
            )}
            {activeTab === 'settings' && (
              <SettingsView 
                key="settings"
                onLogout={handleLogout} 
                onClearHistory={handleClearHistory} 
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      <TabBar active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
