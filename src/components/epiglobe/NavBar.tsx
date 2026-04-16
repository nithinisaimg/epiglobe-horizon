interface NavBarProps {
  timeMode: string;
  onTimeModeChange: (mode: string) => void;
}

const TIME_MODES = ['PAST', 'PRESENT', 'FUTURE'] as const;

export default function NavBar({ timeMode, onTimeModeChange }: NavBarProps) {
  return (
    <nav className="relative z-20 flex items-center justify-between px-6 py-3"
      style={{ background: 'rgba(5,10,20,0.85)', borderBottom: '1px solid #1A2540', backdropFilter: 'blur(8px)' }}>
      
      {/* Brand */}
      <div className="select-none">
        <div className="text-lg font-bold tracking-[0.25em] uppercase" style={{ color: '#00FFD1' }}>
          DSP
        </div>
        <div className="text-[11px] tracking-wide" style={{ color: 'rgba(0,255,209,0.5)' }}>
          Disease Spread Prediction
        </div>
      </div>

      {/* Center - intentionally empty */}
      <div />

      {/* Time mode toggle */}
      <div className="flex gap-0">
        {TIME_MODES.map(mode => {
          const active = timeMode === mode;
          return (
            <button
              key={mode}
              onClick={() => onTimeModeChange(mode)}
              className="px-4 py-1.5 text-xs font-medium tracking-[0.1em] uppercase transition-all duration-200"
              style={{
                background: active ? 'rgba(0,255,209,0.08)' : 'transparent',
                border: `1px solid ${active ? '#00FFD1' : '#1A2540'}`,
                color: active ? '#00FFD1' : '#E8EDF588',
                borderRadius: 0,
                marginLeft: '-1px',
              }}
            >
              {mode}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
