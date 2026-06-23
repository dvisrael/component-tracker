/* Auto-generated from src/app.jsx by tools/build.mjs — do not edit directly. */
/* Component Tracker — bike chain / wax / sealant maintenance PWA.
   Distance for the Wax and Chain cards is driven by Garmin rides synced into
   rides.json by a scheduled GitHub Action. Counters combine a manual baseline
   with the sum of rides recorded after a per-component "sync anchor", so a
   reset or a hand-edited total is never double-counted against past rides. */
const {
  useState,
  useEffect,
  useRef,
  useMemo
} = React;

/* ── Theme presets ─────────────────────────────────────────────── */
const PRESETS = {
  editorial: {
    light: {
      bg: '#FFFFFF',
      card: '#FFFFFF',
      text: '#100F0C',
      muted: '#6E6C64',
      faint: '#A6A49C',
      line: '#E7E5DE',
      accent: '#141310',
      'accent-ink': '#FAFAF8',
      radius: '5px',
      shadow: '0 1px 2px rgba(20,18,12,.05)',
      ticks: 'none',
      'num-font': 'var(--sans)',
      cal: 'none'
    },
    dark: {
      bg: '#0E0E0C',
      card: '#161512',
      text: '#F1EFE8',
      muted: '#8C8A82',
      faint: '#56544E',
      line: '#262420',
      accent: '#F1EFE8',
      'accent-ink': '#0E0E0C',
      radius: '5px',
      shadow: 'none',
      ticks: 'none',
      'num-font': 'var(--sans)',
      cal: 'invert(1)'
    }
  },
  instrument: {
    light: {
      bg: '#E9EAE5',
      card: '#FCFCFA',
      text: '#15160F',
      muted: '#67695C',
      faint: '#9B9D8E',
      line: '#D8DACD',
      accent: '#D96E1C',
      'accent-ink': '#FFFFFF',
      radius: '3px',
      shadow: 'none',
      ticks: 'repeating-linear-gradient(90deg,transparent 0 9px,var(--card) 9px 11px)',
      'num-font': 'var(--sans)',
      cal: 'none'
    },
    dark: {
      bg: '#0B0C09',
      card: '#13150E',
      text: '#E7EAD6',
      muted: '#878A77',
      faint: '#52564A',
      line: '#23261B',
      accent: '#F2842B',
      'accent-ink': '#1C1206',
      radius: '3px',
      shadow: 'none',
      ticks: 'repeating-linear-gradient(90deg,transparent 0 9px,var(--card) 9px 11px)',
      'num-font': 'var(--sans)',
      cal: 'invert(1)'
    }
  },
  warm: {
    light: {
      bg: '#F1ECE1',
      card: '#FBF7EE',
      text: '#221D13',
      muted: '#7C7263',
      faint: '#ABA08C',
      line: '#E5DCCB',
      accent: '#3D6E5E',
      'accent-ink': '#FBF7EE',
      radius: '12px',
      shadow: '0 1px 2px rgba(70,55,30,.06)',
      ticks: 'none',
      'num-font': 'var(--sans)',
      cal: 'none'
    },
    dark: {
      bg: '#191510',
      card: '#221D16',
      text: '#ECE3D4',
      muted: '#9C9181',
      faint: '#615A4C',
      line: '#2F2820',
      accent: '#5F9A89',
      'accent-ink': '#0F1A16',
      radius: '12px',
      shadow: 'none',
      ticks: 'none',
      'num-font': 'var(--sans)',
      cal: 'invert(1)'
    }
  }
};
const nowIso = () => new Date().toISOString();
const daysAgoIso = n => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};
const SAMPLE = {
  sealant: {
    firstDate: daysAgoIso(78),
    cycleCount: 1,
    lastDate: daysAgoIso(52),
    lastTopUpMl: 50
  },
  wax: {
    resetDate: daysAgoIso(21),
    adjustKm: 268,
    method: 'Drip'
  },
  chain: {
    installDate: daysAgoIso(132),
    adjustKm: 540,
    lastCheckKm: 0
  }
};
const KEYS = {
  sealant: 'chain:sealant_v2',
  wax: 'chain:wax_reset',
  chain: 'chain:chain_install',
  theme: 'chain:theme',
  dir: 'chain:direction',
  units: 'chain:units',
  rides: 'chain:rides_cache',
  ghToken: 'chain:gh_token',
  cards: 'chain:cards',
  bikes: 'chain:bikes'
};
const CARD_META = {
  sealant: 'Sealant',
  wax: 'Wax',
  chain: 'Chain Wear'
};
const DEFAULT_CARDS = [{
  id: 'sealant',
  visible: true
}, {
  id: 'wax',
  visible: true
}, {
  id: 'chain',
  visible: true
}];

/* ── Date / format helpers ─────────────────────────────────────── */
const daysUntil = iso => Math.floor((new Date(iso).getTime() - Date.now()) / 864e5);
const addDays = (iso, n) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString();
};
const fmtLong = iso => {
  if (!iso) return '—';
  const d = new Date(iso),
    day = d.getDate();
  const s = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).replace(/(\d+)/, `$1${s}`);
};
const isoDay = iso => new Date(iso).toISOString().split('T')[0];
const todayDay = () => new Date().toISOString().split('T')[0];
const relTime = iso => {
  if (!iso) return 'never';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return Math.floor(hrs / 24) + 'd ago';
};
const persist = (key, val) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch (_) {}
};
const parse = v => {
  try {
    return v ? JSON.parse(v) : null;
  } catch (_) {
    return null;
  }
};

/* ── Small presentational pieces ───────────────────────────────── */
const SEG = (active, flex) => ({
  flex: flex ? 1 : undefined,
  padding: '8px 13px',
  border: 'none',
  cursor: 'pointer',
  background: active ? 'var(--accent)' : 'transparent',
  color: active ? 'var(--accent-ink)' : 'var(--muted)',
  fontFamily: 'var(--mono)',
  fontSize: '10px',
  letterSpacing: '.12em',
  textTransform: 'uppercase'
});
const CHIP = active => ({
  flex: 1,
  padding: '10px 0',
  borderRadius: 'var(--radius)',
  cursor: 'pointer',
  background: active ? 'var(--accent)' : 'transparent',
  border: '1px solid ' + (active ? 'var(--accent)' : 'var(--line)'),
  color: active ? 'var(--accent-ink)' : 'var(--text)',
  fontFamily: 'var(--mono)',
  fontSize: '11px',
  letterSpacing: '.06em'
});
function badgeColors(kind) {
  if (kind === 'warn') return {
    bg: 'var(--warn)',
    text: '#3A2400'
  };
  if (kind === 'danger') return {
    bg: 'var(--danger)',
    text: '#fff'
  };
  return {
    bg: 'var(--line)',
    text: 'var(--muted)'
  };
}
const Seg = ({
  active,
  flex,
  label,
  onClick
}) => /*#__PURE__*/React.createElement("button", {
  className: "seg",
  onClick: onClick,
  style: SEG(active, flex)
}, label);
const Chip = ({
  active,
  label,
  onClick
}) => /*#__PURE__*/React.createElement("button", {
  className: "chip",
  onClick: onClick,
  style: CHIP(active)
}, label);
const Badge = ({
  label,
  bg,
  text
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: 'var(--mono)',
    fontSize: '9.5px',
    letterSpacing: '.1em',
    padding: '4px 9px',
    borderRadius: '99px',
    background: bg,
    color: text
  }
}, label);
const Hamburger = ({
  onClick
}) => /*#__PURE__*/React.createElement("button", {
  className: "icon-btn",
  onClick: onClick,
  style: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px 2px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    display: 'block',
    width: '16px',
    height: '2px',
    borderRadius: '2px',
    background: 'var(--text)'
  }
}), /*#__PURE__*/React.createElement("span", {
  style: {
    display: 'block',
    width: '16px',
    height: '2px',
    borderRadius: '2px',
    background: 'var(--text)'
  }
}), /*#__PURE__*/React.createElement("span", {
  style: {
    display: 'block',
    width: '16px',
    height: '2px',
    borderRadius: '2px',
    background: 'var(--text)'
  }
}));
const BigNum = ({
  num,
  unit,
  color
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '9px',
    margin: '17px 0 0'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: 'var(--num-font)',
    fontSize: '46px',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    lineHeight: '.9',
    color: color
  }
}, num), /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: 'var(--mono)',
    fontSize: '12px',
    color: 'var(--muted)',
    letterSpacing: '.03em'
  }
}, unit));
const Bar = ({
  pct,
  color,
  marker,
  left,
  right
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    margin: '15px 0 16px'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'relative',
    height: '8px',
    borderRadius: '99px',
    background: 'var(--line)',
    overflow: 'hidden'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: pct,
    background: color,
    borderRadius: '99px',
    transition: 'width .6s cubic-bezier(.4,0,.2,1),background .3s'
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'var(--ticks)',
    pointerEvents: 'none'
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    top: '-2px',
    bottom: '-2px',
    left: marker,
    width: '2px',
    background: 'var(--faint)',
    opacity: .55
  }
})), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: 'var(--mono)',
    fontSize: '9px',
    letterSpacing: '.1em',
    color: 'var(--faint)',
    marginTop: '8px',
    textTransform: 'uppercase'
  }
}, /*#__PURE__*/React.createElement("span", null, left), /*#__PURE__*/React.createElement("span", null, right)));
const Stat = ({
  label,
  children
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1,
    minWidth: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: 'var(--mono)',
    fontSize: '9px',
    letterSpacing: '.16em',
    color: 'var(--faint)',
    textTransform: 'uppercase'
  }
}, label), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: '12.5px',
    color: 'var(--muted)',
    lineHeight: 1.5,
    marginTop: '5px'
  }
}, children));
const Alert = ({
  text
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    marginTop: '14px',
    padding: '10px 12px',
    borderRadius: 'var(--radius)',
    background: 'color-mix(in srgb,var(--danger) 11%,transparent)',
    border: '1px solid color-mix(in srgb,var(--danger) 28%,transparent)',
    fontFamily: 'var(--mono)',
    fontSize: '10.5px',
    letterSpacing: '.03em',
    color: 'var(--danger)'
  }
}, text);
const Primary = ({
  onClick,
  label
}) => /*#__PURE__*/React.createElement("button", {
  className: "press",
  onClick: onClick,
  style: {
    marginTop: '16px',
    width: '100%',
    padding: '13px',
    border: 'none',
    borderRadius: 'var(--radius)',
    background: 'var(--accent)',
    color: 'var(--accent-ink)',
    fontFamily: 'var(--mono)',
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '.08em',
    textTransform: 'uppercase',
    cursor: 'pointer'
  }
}, label);
const cardStyle = {
  background: 'var(--card)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius)',
  boxShadow: 'var(--shadow)',
  padding: '21px 21px 19px'
};
const backStyle = {
  background: 'var(--card)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius)',
  boxShadow: 'var(--shadow)',
  padding: '21px'
};
const fieldLabel = {
  fontFamily: 'var(--mono)',
  fontSize: '9px',
  letterSpacing: '.16em',
  color: 'var(--faint)',
  textTransform: 'uppercase',
  marginBottom: '7px'
};
const dateInput = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 12px',
  borderRadius: 'var(--radius)',
  background: 'transparent',
  border: '1px solid var(--line)',
  color: 'var(--text)',
  fontFamily: 'var(--mono)',
  fontSize: '13px',
  outline: 'none'
};
const numInput = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 44px 11px 12px',
  borderRadius: 'var(--radius)',
  background: 'transparent',
  border: '1px solid var(--line)',
  color: 'var(--text)',
  fontFamily: 'var(--num-font)',
  fontSize: '18px',
  fontWeight: 600,
  textAlign: 'center',
  outline: 'none'
};
const EditHeader = ({
  title,
  sub,
  onClose
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '18px',
    gap: '12px'
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: '16px',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    color: 'var(--text)'
  }
}, title), /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: 'var(--mono)',
    fontSize: '9.5px',
    letterSpacing: '.16em',
    color: 'var(--faint)',
    textTransform: 'uppercase',
    marginTop: '5px'
  }
}, sub)), /*#__PURE__*/React.createElement("button", {
  className: "x-btn",
  onClick: onClose,
  style: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--faint)',
    fontSize: '17px',
    lineHeight: 1,
    padding: '2px 4px'
  }
}, "✕"));
const editBtns = (onCancel, onSave, saveLabel = 'Save') => /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    gap: '8px'
  }
}, /*#__PURE__*/React.createElement("button", {
  onClick: onCancel,
  style: {
    flex: 1,
    padding: '12px',
    borderRadius: 'var(--radius)',
    background: 'transparent',
    border: '1px solid var(--line)',
    color: 'var(--muted)',
    fontFamily: 'var(--mono)',
    fontSize: '11px',
    letterSpacing: '.08em',
    textTransform: 'uppercase',
    cursor: 'pointer'
  }
}, "Cancel"), /*#__PURE__*/React.createElement("button", {
  onClick: onSave,
  style: {
    flex: 2,
    padding: '12px',
    borderRadius: 'var(--radius)',
    background: 'var(--accent)',
    border: 'none',
    color: 'var(--accent-ink)',
    fontFamily: 'var(--mono)',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '.08em',
    textTransform: 'uppercase',
    cursor: 'pointer'
  }
}, saveLabel));
const cardTitle = t => /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: '17px',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    color: 'var(--text)'
  }
}, t);
const cardSub = t => /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: 'var(--mono)',
    fontSize: '10px',
    letterSpacing: '.18em',
    color: 'var(--faint)',
    textTransform: 'uppercase',
    marginTop: '5px'
  }
}, t);
const Toggle = ({
  on,
  onChange
}) => /*#__PURE__*/React.createElement("div", {
  onClick: () => onChange(!on),
  role: "switch",
  "aria-checked": on,
  style: {
    width: '42px',
    height: '24px',
    borderRadius: '12px',
    cursor: 'pointer',
    flexShrink: 0,
    userSelect: 'none',
    background: on ? 'var(--accent)' : 'var(--line)',
    position: 'relative',
    transition: 'background .2s'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    top: '3px',
    left: on ? '21px' : '3px',
    width: '18px',
    height: '18px',
    borderRadius: '9px',
    background: on ? 'var(--accent-ink)' : 'var(--card)',
    transition: 'left .15s',
    boxShadow: '0 1px 3px rgba(0,0,0,.15)'
  }
}));
const NumField = ({
  value,
  onChange,
  min,
  max,
  unit,
  fsize
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'relative'
  }
}, /*#__PURE__*/React.createElement("input", {
  type: "number",
  min: min,
  max: max,
  value: value,
  onChange: onChange,
  style: fsize ? {
    ...numInput,
    fontSize: fsize
  } : numInput
}), /*#__PURE__*/React.createElement("span", {
  style: {
    position: 'absolute',
    right: '13px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontFamily: 'var(--mono)',
    fontSize: '12px',
    color: 'var(--muted)',
    pointerEvents: 'none'
  }
}, unit));
const editHint = {
  fontFamily: 'var(--mono)',
  fontSize: '9.5px',
  color: 'var(--faint)',
  marginTop: '9px',
  lineHeight: 1.7
};
const settingsLabel = {
  fontFamily: 'var(--mono)',
  fontSize: '10px',
  letterSpacing: '.18em',
  color: 'var(--faint)',
  textTransform: 'uppercase',
  marginBottom: '12px'
};
const segGroup = {
  display: 'flex',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius)',
  overflow: 'hidden'
};
const BikePicker = ({
  bikes,
  value,
  onChange
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  }
}, /*#__PURE__*/React.createElement(Chip, {
  active: !value,
  label: "All bikes",
  onClick: () => onChange(null)
}), bikes.map(b => /*#__PURE__*/React.createElement(Chip, {
  key: b.id,
  active: value === b.id,
  label: b.name,
  onClick: () => onChange(b.id)
})));
const GearIcon = () => /*#__PURE__*/React.createElement("svg", {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "3"
}), /*#__PURE__*/React.createElement("path", {
  d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
}));
const BackIcon = () => /*#__PURE__*/React.createElement("svg", {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("line", {
  x1: "19",
  y1: "12",
  x2: "5",
  y2: "12"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "12 19 5 12 12 5"
}));

/* ── App ───────────────────────────────────────────────────────── */
function App() {
  const [s, setS] = useState({
    sealantData: null,
    waxData: null,
    chainData: null,
    theme: 'light',
    direction: 'editorial',
    units: 'metric',
    view: 'main',
    rides: [],
    ridesUpdated: null,
    syncing: false,
    githubToken: '',
    cards: DEFAULT_CARDS,
    bikes: [],
    toast: null,
    modal: null,
    form: {},
    flip: null
  });
  const patch = p => setS(prev => ({
    ...prev,
    ...(typeof p === 'function' ? p(prev) : p)
  }));
  const toastTimer = useRef(null);
  const syncTimer = useRef(null);

  // Distance = adjustKm + (Garmin rides since the install/wax date). Normalise any
  // earlier shape (raw km totals, or the old manualKm+syncAnchor) to adjustKm:0 so
  // the counter becomes Garmin-driven from the stored date.
  const normWax = w => {
    if (!w) return null;
    const base = w.adjustKm === undefined ? {
      resetDate: w.resetDate || nowIso(),
      adjustKm: 0,
      method: w.method || 'Drip'
    } : w;
    return {
      bikeId: null,
      ...base
    };
  };
  const normChain = c => {
    if (!c) return null;
    const base = c.adjustKm === undefined ? {
      installDate: c.installDate || nowIso(),
      adjustKm: 0,
      lastCheckKm: c.lastCheckKm || 0
    } : c;
    return {
      bikeId: null,
      ...base
    };
  };

  // initial load + sample seed + ride cache
  useEffect(() => {
    let ls;
    try {
      ls = window.localStorage;
    } catch (_) {
      ls = null;
    }
    const g = k => {
      try {
        return ls ? ls.getItem(k) : null;
      } catch (_) {
        return null;
      }
    };
    const sd = parse(g(KEYS.sealant)),
      wd = normWax(parse(g(KEYS.wax))),
      cd = normChain(parse(g(KEYS.chain)));
    const seed = !sd && !wd && !cd;
    const cache = parse(g(KEYS.rides)) || {
      rides: [],
      updated: null
    };
    patch({
      sealantData: sd || (seed ? SAMPLE.sealant : null),
      waxData: wd || (seed ? SAMPLE.wax : null),
      chainData: cd || (seed ? SAMPLE.chain : null),
      theme: parse(g(KEYS.theme)) || 'light',
      direction: parse(g(KEYS.dir)) || 'editorial',
      units: parse(g(KEYS.units)) || 'metric',
      rides: cache.rides || [],
      ridesUpdated: cache.updated || null,
      githubToken: parse(g(KEYS.ghToken)) || '',
      bikes: parse(g(KEYS.bikes)) || [],
      cards: (() => {
        const raw = parse(g(KEYS.cards));
        const valid = ['sealant', 'wax', 'chain'];
        const stored = Array.isArray(raw) ? raw.filter(c => valid.includes(c.id)) : [];
        const missing = valid.filter(id => !stored.find(c => c.id === id));
        return [...stored, ...missing.map(id => ({
          id,
          visible: true
        }))];
      })()
    });
    loadRides();
    const onVis = () => {
      if (document.visibilityState === 'visible') loadRides();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // fetch the Garmin-synced ride log
  function loadRides() {
    fetch('rides.json?ts=' + Date.now(), {
      cache: 'no-store'
    }).then(r => r.ok ? r.json() : Promise.reject(r.status)).then(j => {
      const rides = Array.isArray(j.rides) ? j.rides : [];
      patch({
        rides,
        ridesUpdated: j.updated || null
      });
      persist(KEYS.rides, {
        rides,
        updated: j.updated || null
      });
    }).catch(() => {/* offline / not yet deployed — keep cached rides */});
  }

  // apply theme css vars
  useEffect(() => {
    const el = document.documentElement;
    const v = PRESETS[s.direction][s.theme];
    const map = {
      bg: '--bg',
      card: '--card',
      text: '--text',
      muted: '--muted',
      faint: '--faint',
      line: '--line',
      accent: '--accent',
      'accent-ink': '--accent-ink',
      radius: '--radius',
      shadow: '--shadow',
      'num-font': '--num-font',
      cal: '--cal-filter'
    };
    for (const k in map) el.style.setProperty(map[k], v[k]);
    el.style.setProperty('--ticks', v.ticks);
    el.style.setProperty('color-scheme', s.theme);
    const tc = document.getElementById('theme-color');
    if (tc) tc.setAttribute('content', v.bg);
  }, [s.theme, s.direction]);
  const toast = (msg, type) => {
    patch({
      toast: {
        msg,
        type: type || 'ok'
      }
    });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => patch({
      toast: null
    }), 3200);
  };
  const setForm = (key, val) => patch(prev => ({
    form: {
      ...prev.form,
      [key]: val
    }
  }));
  const setTheme = m => {
    patch({
      theme: m
    });
    persist(KEYS.theme, m);
  };
  const setDirection = d => {
    patch({
      direction: d
    });
    persist(KEYS.dir, d);
  };
  const setUnits = u => {
    patch({
      units: u
    });
    persist(KEYS.units, u);
  };
  const setGithubToken = t => {
    patch({
      githubToken: t
    });
    persist(KEYS.ghToken, t);
  };

  // Unique (gearId, gearName) pairs seen in rides — used as options when adding a bike
  const gearFromRides = useMemo(() => {
    const seen = new Map();
    for (const r of s.rides) {
      if (r.gearId && !seen.has(r.gearId)) seen.set(r.gearId, r.gearName || r.gearId);
    }
    return [...seen.entries()].map(([gearId, gearName]) => ({
      gearId,
      gearName
    }));
  }, [s.rides]);
  const saveBikes = list => {
    patch({
      bikes: list
    });
    persist(KEYS.bikes, list);
  };
  const addBike = (name, gearId, gearName) => {
    const id = 'b_' + Date.now();
    saveBikes([...s.bikes, {
      id,
      name: name.trim() || gearName,
      garminGearId: gearId,
      garminGearName: gearName
    }]);
  };
  const deleteBike = id => {
    saveBikes(s.bikes.filter(b => b.id !== id));
    // unlink any components that referenced this bike
    const uc = s.chainData?.bikeId === id ? {
      ...s.chainData,
      bikeId: null
    } : s.chainData;
    const uw = s.waxData?.bikeId === id ? {
      ...s.waxData,
      bikeId: null
    } : s.waxData;
    if (uc !== s.chainData) {
      patch({
        chainData: uc
      });
      persist(KEYS.chain, uc);
    }
    if (uw !== s.waxData) {
      patch({
        waxData: uw
      });
      persist(KEYS.wax, uw);
    }
  };
  const openAddBike = () => patch({
    form: {
      bikeName: '',
      bikeGearId: '',
      bikeGearName: ''
    },
    modal: {
      kind: 'add-bike'
    }
  });
  const confirmAddBike = () => {
    const f = s.form;
    if (!f.bikeGearId) {
      toast('Pick a bike from the list first', 'warn');
      return;
    }
    addBike(f.bikeName, f.bikeGearId, f.bikeGearName);
    patch({
      modal: null
    });
    toast('Bike added');
  };
  const moveCard = (idx, dir) => {
    const next = [...s.cards];
    const to = idx + dir;
    if (to < 0 || to >= next.length) return;
    [next[idx], next[to]] = [next[to], next[idx]];
    patch({
      cards: next
    });
    persist(KEYS.cards, next);
  };
  const toggleCardVisible = id => {
    const next = s.cards.map(c => c.id === id ? {
      ...c,
      visible: !c.visible
    } : c);
    patch({
      cards: next
    });
    persist(KEYS.cards, next);
  };
  function triggerSync() {
    const token = s.githubToken;
    if (!token) {
      loadRides();
      return;
    }
    patch({
      syncing: true
    });
    fetch('https://api.github.com/repos/dvisrael/component-tracker/actions/workflows/sync.yml/dispatches', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ref: 'main'
      })
    }).then(r => {
      if (r.status === 204) {
        toast('Garmin sync triggered · updating in ~1 min');
        clearTimeout(syncTimer.current);
        syncTimer.current = setTimeout(() => {
          loadRides();
          patch({
            syncing: false
          });
        }, 90000);
      } else {
        patch({
          syncing: false
        });
        toast('Sync failed — check token in Settings', 'err');
        loadRides();
      }
    }).catch(() => {
      patch({
        syncing: false
      });
      loadRides();
    });
  }

  // unit conversions (depend on current units)
  const imperial = s.units === 'imperial';
  const dispUnit = imperial ? 'mi' : 'km';
  const volUnit = imperial ? 'oz' : 'ml';
  const toDisp = km => imperial ? km * 0.621371 : km;
  const fromDisp = v => {
    const n = parseFloat(v);
    if (isNaN(n)) return NaN;
    return imperial ? n / 0.621371 : n;
  };
  const toVol = ml => imperial ? ml * 0.033814 : ml;
  const fromVol = v => {
    const n = parseFloat(v);
    if (isNaN(n)) return NaN;
    return imperial ? n / 0.033814 : n;
  };
  const fmtVol = ml => {
    const v = toVol(ml);
    return imperial ? v.toFixed(1) : v.toFixed(0);
  };

  // sum of ride distance (km) recorded at/after an anchor timestamp.
  // If garminGearId is provided, rides on a DIFFERENT known bike are excluded;
  // rides with no gear data (gearId absent or '') are always included.
  const ridesSince = (anchorIso, garminGearId) => {
    if (!anchorIso) return 0;
    const t = new Date(anchorIso).getTime();
    let sum = 0;
    for (const r of s.rides) {
      const rt = new Date(r.date).getTime();
      if (isNaN(rt) || rt < t) continue;
      if (garminGearId && r.gearId && r.gearId !== garminGearId) continue;
      sum += +r.km || 0;
    }
    return sum;
  };
  const cancelFlip = () => patch({
    flip: null
  });
  const toggleSettings = () => patch(prev => ({
    view: prev.view === 'settings' ? 'main' : 'settings',
    flip: null,
    modal: null
  }));
  const closeModal = () => patch({
    modal: null
  });
  const stop = e => e.stopPropagation();

  /* ── sealant actions (time-based, ride-independent) ── */
  const installSealant = () => {
    const now = nowIso();
    const fresh = {
      firstDate: now,
      cycleCount: 0,
      lastDate: now
    };
    patch({
      sealantData: fresh
    });
    persist(KEYS.sealant, fresh);
    toast('Fresh sealant logged — top-up in 90 days');
  };
  const openSealantMl = () => patch({
    form: {
      ml: imperial ? '2' : '50'
    },
    modal: {
      kind: 'seal-ml'
    }
  });
  const completeSealantCycle = ml => {
    const sd = s.sealantData;
    const now = nowIso();
    const action = sd.cycleCount % 2 === 0 ? 'TOP UP' : 'REPLACE';
    const updated = {
      ...sd,
      cycleCount: sd.cycleCount + 1,
      lastDate: now,
      ...(action === 'TOP UP' ? {
        lastTopUpMl: ml
      } : {
        lastReplaceMl: ml
      })
    };
    patch({
      sealantData: updated
    });
    persist(KEYS.sealant, updated);
    toast(`${action === 'TOP UP' ? 'Top up' : 'Replace'} logged${ml ? ` · ${fmtVol(ml)} ${volUnit}` : ''}`);
  };
  const confirmSealantMl = () => {
    const ml = Math.round(fromVol(s.form.ml));
    patch({
      modal: null
    });
    completeSealantCycle(isNaN(ml) || ml <= 0 ? null : ml);
  };
  const openEditSeal = () => {
    const sd = s.sealantData;
    patch({
      form: {
        date: sd ? isoDay(sd.lastDate) : todayDay(),
        ml: String(fmtVol(sd ? sd.lastTopUpMl || sd.lastReplaceMl || 50 : 50)),
        type: sd ? sd.cycleCount % 2 === 1 ? 'TOP UP' : 'REPLACE' : 'TOP UP'
      },
      flip: 'sealant'
    });
  };
  const saveEditSeal = () => {
    const f = s.form;
    if (!f.date) {
      patch({
        flip: null
      });
      return;
    }
    const iso = new Date(f.date).toISOString();
    const ml = Math.round(fromVol(f.ml));
    const mlVal = isNaN(ml) || ml <= 0 ? null : ml;
    const cycleCount = f.type === 'TOP UP' ? 1 : 2;
    const updated = {
      firstDate: s.sealantData?.firstDate || iso,
      cycleCount,
      lastDate: iso,
      ...(f.type === 'TOP UP' ? {
        lastTopUpMl: mlVal
      } : {
        lastReplaceMl: mlVal
      })
    };
    patch({
      sealantData: updated,
      flip: null
    });
    persist(KEYS.sealant, updated);
    toast('Sealant history updated');
  };

  /* ── wax actions ── */
  const openWaxMethod = () => patch({
    modal: {
      kind: 'wax-method'
    }
  });
  const confirmWaxMethod = method => {
    const now = nowIso();
    const fresh = {
      resetDate: now,
      adjustKm: 0,
      method,
      bikeId: s.waxData?.bikeId || null
    };
    patch({
      waxData: fresh,
      modal: null
    });
    persist(KEYS.wax, fresh);
    toast(`Wax replaced (${method}) — counter reset`);
  };
  const openEditWax = () => {
    const wd = s.waxData;
    patch({
      form: {
        date: wd?.resetDate ? isoDay(wd.resetDate) : todayDay(),
        km: String(Math.round(toDisp(wd?.adjustKm || 0))),
        method: wd?.method || 'Drip',
        bikeId: wd?.bikeId || null
      },
      flip: 'wax'
    });
  };
  const saveEditWax = () => {
    const f = s.form;
    if (!f.date) {
      patch({
        flip: null
      });
      return;
    }
    const iso = new Date(f.date).toISOString();
    const adj = fromDisp(f.km);
    const updated = {
      resetDate: iso,
      adjustKm: isNaN(adj) ? 0 : adj,
      method: f.method,
      bikeId: f.bikeId || null
    };
    patch({
      waxData: updated,
      flip: null
    });
    persist(KEYS.wax, updated);
    toast('Wax updated');
  };

  /* ── chain actions ── */
  const resetChain = () => {
    const now = nowIso();
    const fresh = {
      installDate: now,
      adjustKm: 0,
      lastCheckKm: 0,
      bikeId: s.chainData?.bikeId || null
    };
    patch({
      chainData: fresh,
      flip: null
    });
    persist(KEYS.chain, fresh);
    toast('New chain — lifetime counter started');
  };
  const checkChain = () => {
    const cd = s.chainData;
    if (!cd) return;
    const chainBikeGear = (cd.bikeId ? s.bikes.find(b => b.id === cd.bikeId) : null)?.garminGearId || null;
    const ck = (cd.adjustKm || 0) + ridesSince(cd.installDate, chainBikeGear);
    const cleared = Math.floor(ck / 800) * 800;
    const updated = {
      ...cd,
      lastCheckKm: cleared
    };
    patch({
      chainData: updated
    });
    persist(KEYS.chain, updated);
    toast(`Wear check logged — next check at ${(cleared + 800).toFixed(0)} km`);
  };
  const openEditChain = () => {
    const cd = s.chainData;
    patch({
      form: {
        date: cd?.installDate ? isoDay(cd.installDate) : todayDay(),
        km: String(Math.round(toDisp(cd?.adjustKm || 0))),
        bikeId: cd?.bikeId || null
      },
      flip: 'chain'
    });
  };
  const saveEditChain = () => {
    const f = s.form;
    if (!f.date) {
      patch({
        flip: null
      });
      return;
    }
    const iso = new Date(f.date).toISOString();
    const adj = fromDisp(f.km);
    const updated = {
      installDate: iso,
      adjustKm: isNaN(adj) ? 0 : adj,
      lastCheckKm: s.chainData?.lastCheckKm || 0,
      bikeId: f.bikeId || null
    };
    patch({
      chainData: updated,
      flip: null
    });
    persist(KEYS.chain, updated);
    toast('Chain updated');
  };

  /* ── computed values ── */
  // sealant
  const sd = s.sealantData,
    hasSealant = !!sd;
  const sealDue = hasSealant ? addDays(sd.lastDate, 90) : null;
  const sealDaysLeft = sealDue ? daysUntil(sealDue) : null;
  const sealPctN = hasSealant ? Math.max(0, Math.min(1, 1 - sealDaysLeft / 90)) : 0;
  const sealOverdue = sealDaysLeft !== null && sealDaysLeft < 0;
  const sealUrgent = sealDaysLeft !== null && sealDaysLeft >= 0 && sealDaysLeft <= 14;
  const sealStatus = sealOverdue ? 'danger' : sealUrgent ? 'warn' : 'healthy';
  const sealColor = sealStatus === 'healthy' ? 'var(--accent)' : sealStatus === 'warn' ? 'var(--warn)' : 'var(--danger)';
  const nextAction = hasSealant ? sd.cycleCount % 2 === 0 ? 'TOP UP' : 'REPLACE' : 'TOP UP';
  const lastMl = hasSealant ? sd.lastTopUpMl || sd.lastReplaceMl || null : null;
  const sbc = badgeColors(!hasSealant ? 'neutral' : sealOverdue ? 'danger' : sealUrgent ? 'warn' : 'neutral');
  const sealLastAction = hasSealant ? sd.cycleCount === 0 ? 'Fresh install' : sd.cycleCount % 2 === 1 ? 'Top up' : 'Replaced' : 'Not set';

  // wax
  const wd = s.waxData;
  const waxBike = wd?.bikeId ? s.bikes.find(b => b.id === wd.bikeId) || null : null;
  const waxKm = wd ? (wd.adjustKm || 0) + ridesSince(wd.resetDate, waxBike?.garminGearId || null) : 0;
  const waxOverdue = waxKm >= 300,
    waxUrgent = waxKm >= 250 && waxKm < 300;
  const waxStatus = waxOverdue ? 'danger' : waxUrgent ? 'warn' : 'healthy';
  const waxColor = waxStatus === 'healthy' ? 'var(--accent)' : waxStatus === 'warn' ? 'var(--warn)' : 'var(--danger)';
  const wbc = badgeColors(!wd ? 'neutral' : waxOverdue ? 'danger' : waxUrgent ? 'warn' : 'neutral');

  // chain
  const cd = s.chainData;
  const chainBike = cd?.bikeId ? s.bikes.find(b => b.id === cd.bikeId) || null : null;
  const chainKm = cd ? (cd.adjustKm || 0) + ridesSince(cd.installDate, chainBike?.garminGearId || null) : 0;
  const checkInterval = 800;
  const lastCheck = Math.floor((cd?.lastCheckKm ?? 0) / checkInterval) * checkInterval;
  const nextCheck = lastCheck + checkInterval;
  const intoWindow = Math.max(0, chainKm - lastCheck);
  const chainPctN = Math.min(intoWindow / checkInterval, 1);
  const chainDue = intoWindow >= checkInterval,
    chainUrgent = intoWindow >= checkInterval - 100 && intoWindow < checkInterval;
  const chainStatus = chainDue ? 'danger' : chainUrgent ? 'warn' : 'healthy';
  const chainColor = chainStatus === 'healthy' ? 'var(--accent)' : chainStatus === 'warn' ? 'var(--warn)' : 'var(--danger)';
  const cbc = badgeColors(!cd ? 'neutral' : chainDue ? 'danger' : chainUrgent ? 'warn' : 'neutral');

  // modal / form
  const modal = s.modal,
    kind = modal?.kind,
    f = s.form;
  // Live preview for the edit forms: Garmin distance recorded since the chosen date.
  const formBike = f.bikeId ? s.bikes.find(b => b.id === f.bikeId) || null : null;
  const formGarminKm = f.date ? ridesSince(new Date(f.date).toISOString(), formBike?.garminGearId || null) : 0;
  const formAdjDisp = parseFloat(f.km) || 0;
  const formTotalDisp = (toDisp(formGarminKm) + formAdjDisp).toFixed(0);
  const formGarminDisp = toDisp(formGarminKm).toFixed(0);
  const modalMeta = {
    'seal-ml': {
      title: nextAction === 'TOP UP' ? 'Top Up Sealant' : 'Replace Sealant',
      sub: 'How much did you add?'
    },
    'wax-method': {
      title: 'Wax Method',
      sub: 'How did you wax?'
    },
    'add-bike': {
      title: 'Add Bike',
      sub: 'Name · Garmin gear'
    }
  }[kind] || {
    title: '',
    sub: ''
  };
  const mlOpts = imperial ? [1, 2, 3, 4] : [25, 50, 75, 100];
  const toastBg = !s.toast ? '' : s.toast.type === 'warn' ? 'var(--warn)' : s.toast.type === 'err' ? 'var(--danger)' : 'var(--text)';
  const toastColor = !s.toast ? '' : s.toast.type === 'ok' ? 'var(--bg)' : '#fff';
  const flipCls = name => 'flip-inner' + (s.flip === name ? ' flipped' : '');
  const syncLabel = s.syncing ? 'Syncing…' : s.ridesUpdated ? `Garmin · ${s.rides.length} ride${s.rides.length === 1 ? '' : 's'} · synced ${relTime(s.ridesUpdated)}` : 'Garmin sync not connected yet';
  const isSettings = s.view === 'settings';
  const isMain = !isSettings;
  const headerTitle = isSettings ? 'Settings' : 'Component Tracker';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)',
      fontFamily: 'var(--sans)',
      transition: 'background .4s ease,color .4s ease',
      padding: '40px 20px 56px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: '452px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '22px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: '33px',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      lineHeight: 1,
      color: 'var(--text)'
    }
  }, headerTitle), /*#__PURE__*/React.createElement("button", {
    onClick: toggleSettings,
    "aria-label": isMain ? 'Settings' : 'Back',
    className: "hdr-btn",
    style: {
      background: 'none',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius)',
      cursor: 'pointer',
      width: '42px',
      height: '42px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text)',
      flexShrink: 0,
      transition: 'border-color .15s,color .15s'
    }
  }, isMain ? /*#__PURE__*/React.createElement(GearIcon, null) : /*#__PURE__*/React.createElement(BackIcon, null))), isMain && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }
  }, s.cards.filter(c => c.visible).map(c => /*#__PURE__*/React.createElement(React.Fragment, {
    key: c.id
  }, c.id === 'sealant' &&
  /*#__PURE__*/
  /* ===== SEALANT ===== */
  React.createElement("div", {
    className: "flip"
  }, /*#__PURE__*/React.createElement("div", {
    className: flipCls('sealant')
  }, /*#__PURE__*/React.createElement("section", {
    className: "flip-front",
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", null, cardTitle('Sealant'), cardSub('90-Day Cycle')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    label: !hasSealant ? 'NOT SET' : sealOverdue ? 'OVERDUE' : sealUrgent ? 'DUE SOON' : 'ON TRACK',
    bg: sbc.bg,
    text: sbc.text
  }), /*#__PURE__*/React.createElement(Hamburger, {
    onClick: openEditSeal
  }))), /*#__PURE__*/React.createElement(BigNum, {
    num: !hasSealant ? '—' : String(Math.abs(sealDaysLeft)),
    unit: !hasSealant ? 'not set' : sealDaysLeft >= 0 ? 'days left' : 'days over',
    color: sealStatus === 'danger' ? 'var(--danger)' : 'var(--text)'
  }), /*#__PURE__*/React.createElement(Bar, {
    pct: Math.round(sealPctN * 100) + '%',
    color: sealColor,
    marker: "84%",
    left: "Fresh",
    right: "90 days"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '20px',
      borderTop: '1px solid var(--line)',
      paddingTop: '14px'
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "Last"
  }, hasSealant ? fmtLong(sd.lastDate) : '—', /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text)',
      fontWeight: 500
    }
  }, sealLastAction), lastMl ? ` · ${fmtVol(lastMl)} ${volUnit}` : ''), /*#__PURE__*/React.createElement(Stat, {
    label: "Next"
  }, hasSealant ? fmtLong(sealDue) : '—', /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text)',
      fontWeight: 500
    }
  }, nextAction === 'TOP UP' ? 'Top up' : 'Replace'))), sealOverdue && /*#__PURE__*/React.createElement(Alert, {
    text: `Overdue — time to ${nextAction.toLowerCase()} your sealant`
  }), hasSealant ? /*#__PURE__*/React.createElement(Primary, {
    onClick: openSealantMl,
    label: nextAction === 'TOP UP' ? 'Top Up' : 'Replace'
  }) : /*#__PURE__*/React.createElement(Primary, {
    onClick: installSealant,
    label: "Log First Install"
  })), /*#__PURE__*/React.createElement("section", {
    className: "flip-back",
    style: backStyle
  }, /*#__PURE__*/React.createElement(EditHeader, {
    title: "Edit Sealant",
    sub: "Date · Type · Amount",
    onClose: cancelFlip
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '13px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: fieldLabel
  }, "Date"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: f.date || '',
    onChange: e => setForm('date', e.target.value),
    style: dateInput
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '13px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: fieldLabel
  }, "Type"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px'
    }
  }, [['TOP UP', 'Top Up'], ['REPLACE', 'Replace']].map(([k, l]) => /*#__PURE__*/React.createElement(Chip, {
    key: k,
    active: f.type === k,
    label: l,
    onClick: () => setForm('type', k)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: fieldLabel
  }, "Amount"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '7px',
      marginBottom: '9px'
    }
  }, mlOpts.map(v => /*#__PURE__*/React.createElement(Chip, {
    key: v,
    active: String(f.ml) === String(v),
    label: String(v),
    onClick: () => setForm('ml', String(v))
  }))), /*#__PURE__*/React.createElement(NumField, {
    min: "1",
    max: "500",
    value: f.ml || '',
    onChange: e => setForm('ml', e.target.value),
    unit: volUnit
  })), editBtns(cancelFlip, saveEditSeal)))), c.id === 'wax' && /*#__PURE__*/React.createElement("div", {
    className: "flip"
  }, /*#__PURE__*/React.createElement("div", {
    className: flipCls('wax')
  }, /*#__PURE__*/React.createElement("section", {
    className: "flip-front",
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", null, cardTitle('Wax'), cardSub(waxBike ? `${waxBike.name} · ~${toDisp(300).toFixed(0)} ${dispUnit}` : `Distance · ~${toDisp(300).toFixed(0)} ${dispUnit}`)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    label: !wd ? 'NOT SET' : waxOverdue ? 'RE-WAX' : waxUrgent ? 'DUE SOON' : 'ON TRACK',
    bg: wbc.bg,
    text: wbc.text
  }), /*#__PURE__*/React.createElement(Hamburger, {
    onClick: openEditWax
  }))), /*#__PURE__*/React.createElement(BigNum, {
    num: toDisp(waxKm).toFixed(0),
    unit: `${dispUnit} ridden`,
    color: waxStatus === 'danger' ? 'var(--danger)' : 'var(--text)'
  }), /*#__PURE__*/React.createElement(Bar, {
    pct: Math.round(Math.min(waxKm / 300, 1) * 100) + '%',
    color: waxColor,
    marker: "83%",
    left: "0",
    right: `${toDisp(300).toFixed(0)} ${dispUnit}`
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '20px',
      borderTop: '1px solid var(--line)',
      paddingTop: '14px'
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "Last wax"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text)',
      fontWeight: 500
    }
  }, wd?.resetDate ? fmtLong(wd.resetDate) : '—')), /*#__PURE__*/React.createElement(Stat, {
    label: "Method"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text)',
      fontWeight: 500
    }
  }, wd?.method ? `${wd.method} wax` : 'Not set'))), waxOverdue && /*#__PURE__*/React.createElement(Alert, {
    text: "Chain is due for a fresh wax"
  }), /*#__PURE__*/React.createElement(Primary, {
    onClick: openWaxMethod,
    label: "Wax"
  })), /*#__PURE__*/React.createElement("section", {
    className: "flip-back",
    style: backStyle
  }, /*#__PURE__*/React.createElement(EditHeader, {
    title: "Edit Wax",
    sub: "Date · Distance · Method",
    onClose: cancelFlip
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '13px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: fieldLabel
  }, "Last wax date"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: f.date || '',
    onChange: e => setForm('date', e.target.value),
    style: dateInput
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '13px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: fieldLabel
  }, "Manual adjustment"), /*#__PURE__*/React.createElement(NumField, {
    min: "-20000",
    max: "20000",
    value: f.km ?? '',
    onChange: e => setForm('km', e.target.value),
    unit: dispUnit
  }), /*#__PURE__*/React.createElement("div", {
    style: editHint
  }, "+ ", formGarminDisp, " ", dispUnit, " ridden on Garmin since this date", /*#__PURE__*/React.createElement("br", null), "= ", formTotalDisp, " ", dispUnit, " since last wax")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '13px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: fieldLabel
  }, "Method"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px'
    }
  }, ['Drip', 'Immersion'].map(m => /*#__PURE__*/React.createElement(Chip, {
    key: m,
    active: f.method === m,
    label: m,
    onClick: () => setForm('method', m)
  })))), s.bikes.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: fieldLabel
  }, "Bike"), /*#__PURE__*/React.createElement(BikePicker, {
    bikes: s.bikes,
    value: f.bikeId || null,
    onChange: v => setForm('bikeId', v)
  })), editBtns(cancelFlip, saveEditWax)))), c.id === 'chain' && /*#__PURE__*/React.createElement("div", {
    className: "flip"
  }, /*#__PURE__*/React.createElement("div", {
    className: flipCls('chain')
  }, /*#__PURE__*/React.createElement("section", {
    className: "flip-front",
    style: cardStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", null, cardTitle('Chain Wear'), cardSub(chainBike ? `${chainBike.name} · check every ${toDisp(800).toFixed(0)} ${dispUnit}` : `Check every ${toDisp(800).toFixed(0)} ${dispUnit}`)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    label: !cd ? 'NOT SET' : chainDue ? 'CHECK WEAR' : chainUrgent ? 'CHECK SOON' : 'HEALTHY',
    bg: cbc.bg,
    text: cbc.text
  }), /*#__PURE__*/React.createElement(Hamburger, {
    onClick: openEditChain
  }))), /*#__PURE__*/React.createElement(BigNum, {
    num: toDisp(chainKm).toFixed(0),
    unit: `${dispUnit} lifetime`,
    color: chainStatus === 'danger' ? 'var(--danger)' : 'var(--text)'
  }), /*#__PURE__*/React.createElement(Bar, {
    pct: Math.round(chainPctN * 100) + '%',
    color: chainColor,
    marker: "88%",
    left: cd ? `${toDisp(lastCheck).toFixed(0)} ${dispUnit}` : '0',
    right: `${toDisp(nextCheck).toFixed(0)} ${dispUnit}`
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '20px',
      borderTop: '1px solid var(--line)',
      paddingTop: '14px'
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "Installed"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text)',
      fontWeight: 500
    }
  }, cd ? fmtLong(cd.installDate) : '—')), /*#__PURE__*/React.createElement(Stat, {
    label: "To check"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text)',
      fontWeight: 500
    }
  }, cd ? chainDue ? 'Check now' : `${toDisp(nextCheck - chainKm).toFixed(0)} ${dispUnit}` : '—'))), chainDue && /*#__PURE__*/React.createElement(Alert, {
    text: "Check stretch with a chain gauge — replace at 0.5%"
  }), cd ? /*#__PURE__*/React.createElement(Primary, {
    onClick: checkChain,
    label: "Check"
  }) : /*#__PURE__*/React.createElement(Primary, {
    onClick: resetChain,
    label: "Log New Chain"
  })), /*#__PURE__*/React.createElement("section", {
    className: "flip-back",
    style: backStyle
  }, /*#__PURE__*/React.createElement(EditHeader, {
    title: "Edit Chain",
    sub: "Install date · Distance",
    onClose: cancelFlip
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '13px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: fieldLabel
  }, "Install date"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: f.date || '',
    onChange: e => setForm('date', e.target.value),
    style: dateInput
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: fieldLabel
  }, "Manual adjustment"), /*#__PURE__*/React.createElement(NumField, {
    min: "-20000",
    max: "20000",
    value: f.km ?? '',
    onChange: e => setForm('km', e.target.value),
    unit: dispUnit
  }), /*#__PURE__*/React.createElement("div", {
    style: editHint
  }, "+ ", formGarminDisp, " ", dispUnit, " ridden on Garmin since install", /*#__PURE__*/React.createElement("br", null), "= ", formTotalDisp, " ", dispUnit, " lifetime")), s.bikes.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '13px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: fieldLabel
  }, "Bike"), /*#__PURE__*/React.createElement(BikePicker, {
    bikes: s.bikes,
    value: f.bikeId || null,
    onChange: v => setForm('bikeId', v)
  })), /*#__PURE__*/React.createElement("button", {
    className: "replace-link",
    onClick: resetChain,
    style: {
      width: '100%',
      padding: '11px',
      marginBottom: '8px',
      borderRadius: 'var(--radius)',
      background: 'transparent',
      border: '1px solid var(--line)',
      color: 'var(--muted)',
      fontFamily: 'var(--mono)',
      fontSize: '10.5px',
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      cursor: 'pointer'
    }
  }, "Replace chain · reset lifetime"), editBtns(cancelFlip, saveEditChain))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '14px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: triggerSync,
    disabled: s.syncing,
    className: "x-btn",
    style: {
      background: 'none',
      border: 'none',
      cursor: s.syncing ? 'default' : 'pointer',
      fontFamily: 'var(--mono)',
      fontSize: '9.5px',
      letterSpacing: '.12em',
      textTransform: 'uppercase',
      color: 'var(--faint)',
      opacity: s.syncing ? .55 : 1
    }
  }, syncLabel, s.syncing ? '' : ' · ↻'))), isSettings && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '19px 21px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: settingsLabel
  }, "Style"), /*#__PURE__*/React.createElement("div", {
    style: segGroup
  }, [['editorial', 'Editorial'], ['instrument', 'Instrument'], ['warm', 'Warm']].map(([v, l]) => /*#__PURE__*/React.createElement(Seg, {
    key: v,
    flex: true,
    active: s.direction === v,
    label: l,
    onClick: () => setDirection(v)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '19px 21px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: settingsLabel
  }, "Appearance"), /*#__PURE__*/React.createElement("div", {
    style: segGroup
  }, ['light', 'dark'].map(m => /*#__PURE__*/React.createElement(Seg, {
    key: m,
    flex: true,
    active: s.theme === m,
    label: m,
    onClick: () => setTheme(m)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '19px 21px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: settingsLabel
  }, "Units"), /*#__PURE__*/React.createElement("div", {
    style: segGroup
  }, ['metric', 'imperial'].map(u => /*#__PURE__*/React.createElement(Seg, {
    key: u,
    flex: true,
    active: s.units === u,
    label: u,
    onClick: () => setUnits(u)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '19px 21px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: settingsLabel
  }, "Cards"), s.cards.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 0',
      borderBottom: i < s.cards.length - 1 ? '1px solid var(--line)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1px',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => moveCard(i, -1),
    disabled: i === 0,
    style: {
      background: 'none',
      border: 'none',
      cursor: i === 0 ? 'default' : 'pointer',
      color: 'var(--muted)',
      padding: '2px 5px',
      lineHeight: 1,
      opacity: i === 0 ? .2 : 1,
      fontSize: '13px'
    }
  }, "↑"), /*#__PURE__*/React.createElement("button", {
    onClick: () => moveCard(i, 1),
    disabled: i === s.cards.length - 1,
    style: {
      background: 'none',
      border: 'none',
      cursor: i === s.cards.length - 1 ? 'default' : 'pointer',
      color: 'var(--muted)',
      padding: '2px 5px',
      lineHeight: 1,
      opacity: i === s.cards.length - 1 ? .2 : 1,
      fontSize: '13px'
    }
  }, "↓")), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: '13px',
      fontWeight: 500,
      color: c.visible ? 'var(--text)' : 'var(--faint)'
    }
  }, CARD_META[c.id]), /*#__PURE__*/React.createElement(Toggle, {
    on: c.visible,
    onChange: () => toggleCardVisible(c.id)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '19px 21px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: settingsLabel
  }, "Bikes"), /*#__PURE__*/React.createElement("button", {
    onClick: openAddBike,
    style: {
      background: 'none',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius)',
      cursor: 'pointer',
      color: 'var(--muted)',
      fontFamily: 'var(--mono)',
      fontSize: '10px',
      letterSpacing: '.1em',
      padding: '5px 10px'
    }
  }, "+ ADD")), s.bikes.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '10px',
      color: 'var(--faint)',
      letterSpacing: '.08em'
    }
  }, "No bikes added yet — tap + ADD to create one") : s.bikes.map(b => /*#__PURE__*/React.createElement("div", {
    key: b.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '9px 0',
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      fontWeight: 500,
      color: 'var(--text)'
    }
  }, b.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '9.5px',
      color: 'var(--faint)',
      marginTop: '2px'
    }
  }, b.garminGearName)), /*#__PURE__*/React.createElement("button", {
    onClick: () => deleteBike(b.id),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--faint)',
      fontSize: '16px',
      lineHeight: 1,
      padding: '4px 6px'
    }
  }, "×")))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '19px 21px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: settingsLabel
  }, "Garmin"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...fieldLabel,
      marginBottom: '7px'
    }
  }, "GitHub token (enables force-sync)"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: s.githubToken || '',
    onChange: e => setGithubToken(e.target.value),
    placeholder: "ghp_…",
    style: {
      ...dateInput,
      letterSpacing: '.04em'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '9px',
      color: 'var(--faint)',
      marginTop: '8px',
      lineHeight: 1.75
    }
  }, "Fine-grained PAT · Actions read/write · this repo only · stored on-device"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '18px',
      fontFamily: 'var(--mono)',
      fontSize: '9.5px',
      letterSpacing: '.14em',
      color: 'var(--faint)',
      textAlign: 'center',
      textTransform: 'uppercase',
      lineHeight: 1.9
    }
  }, "Wax 250/300 km · Chain check 800 km · Sealant 90 days"))), s.toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      left: '50%',
      bottom: '28px',
      transform: 'translateX(-50%)',
      background: toastBg,
      color: toastColor,
      padding: '11px 18px',
      borderRadius: 'var(--radius)',
      fontFamily: 'var(--mono)',
      fontSize: '11.5px',
      letterSpacing: '.02em',
      zIndex: 300,
      maxWidth: '90vw',
      textAlign: 'center',
      boxShadow: '0 8px 30px rgba(0,0,0,.18)',
      animation: 'pop .25s ease'
    }
  }, s.toast.msg), modal && /*#__PURE__*/React.createElement("div", {
    onClick: closeModal,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'rgba(8,8,6,.46)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'pop .2s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: stop,
    style: {
      width: '330px',
      maxWidth: '100%',
      background: 'var(--card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius)',
      boxShadow: '0 26px 64px rgba(0,0,0,.34)',
      padding: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '20px',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: 'var(--text)'
    }
  }, modalMeta.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '9.5px',
      letterSpacing: '.16em',
      color: 'var(--faint)',
      textTransform: 'uppercase',
      marginTop: '5px'
    }
  }, modalMeta.sub)), /*#__PURE__*/React.createElement("button", {
    className: "x-btn",
    onClick: closeModal,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--faint)',
      fontSize: '17px',
      lineHeight: 1,
      padding: '2px 4px'
    }
  }, "✕")), kind === 'seal-ml' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '7px',
      marginBottom: '9px'
    }
  }, mlOpts.map(v => /*#__PURE__*/React.createElement(Chip, {
    key: v,
    active: String(f.ml) === String(v),
    label: String(v),
    onClick: () => setForm('ml', String(v))
  }))), /*#__PURE__*/React.createElement(NumField, {
    min: "1",
    max: "500",
    value: f.ml || '',
    onChange: e => setForm('ml', e.target.value),
    unit: volUnit,
    fsize: "20px"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: closeModal,
    style: {
      flex: 1,
      padding: '12px',
      borderRadius: 'var(--radius)',
      background: 'transparent',
      border: '1px solid var(--line)',
      color: 'var(--muted)',
      fontFamily: 'var(--mono)',
      fontSize: '11px',
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      cursor: 'pointer'
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    onClick: confirmSealantMl,
    style: {
      flex: 2,
      padding: '12px',
      borderRadius: 'var(--radius)',
      background: 'var(--accent)',
      border: 'none',
      color: 'var(--accent-ink)',
      fontFamily: 'var(--mono)',
      fontSize: '11px',
      fontWeight: 500,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      cursor: 'pointer'
    }
  }, `Confirm ${f.ml || '—'} ${volUnit}`))), kind === 'add-bike' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '13px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: fieldLabel
  }, "Name"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "e.g. Scott Road Bike",
    value: f.bikeName || '',
    onChange: e => setForm('bikeName', e.target.value),
    style: {
      ...dateInput,
      fontSize: '14px'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: fieldLabel
  }, "Garmin gear"), gearFromRides.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--mono)',
      fontSize: '10px',
      color: 'var(--faint)',
      lineHeight: 1.6
    }
  }, "No gear data in rides yet — tap ↻ sync first") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }
  }, gearFromRides.map(g => /*#__PURE__*/React.createElement("button", {
    key: g.gearId,
    onClick: () => {
      setForm('bikeGearId', g.gearId);
      setForm('bikeGearName', g.gearName);
    },
    style: {
      width: '100%',
      padding: '13px 14px',
      borderRadius: 'var(--radius)',
      cursor: 'pointer',
      textAlign: 'left',
      background: f.bikeGearId === g.gearId ? 'var(--accent)' : 'transparent',
      border: '1px solid ' + (f.bikeGearId === g.gearId ? 'var(--accent)' : 'var(--line)'),
      color: f.bikeGearId === g.gearId ? 'var(--accent-ink)' : 'var(--text)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: '12px',
      fontWeight: 600,
      fontFamily: 'var(--mono)',
      letterSpacing: '.04em'
    }
  }, g.gearName))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: closeModal,
    style: {
      flex: 1,
      padding: '12px',
      borderRadius: 'var(--radius)',
      background: 'transparent',
      border: '1px solid var(--line)',
      color: 'var(--muted)',
      fontFamily: 'var(--mono)',
      fontSize: '11px',
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      cursor: 'pointer'
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    onClick: confirmAddBike,
    style: {
      flex: 2,
      padding: '12px',
      borderRadius: 'var(--radius)',
      background: 'var(--accent)',
      border: 'none',
      color: 'var(--accent-ink)',
      fontFamily: 'var(--mono)',
      fontSize: '11px',
      fontWeight: 500,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      cursor: 'pointer'
    }
  }, "Add Bike"))), kind === 'wax-method' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '9px'
    }
  }, [['Drip', 'Drip wax applied to chain'], ['Immersion', 'Chain soaked in molten wax']].map(([m, d]) => /*#__PURE__*/React.createElement("button", {
    key: m,
    className: "method-act",
    onClick: () => confirmWaxMethod(m),
    style: {
      width: '100%',
      padding: '15px 16px',
      borderRadius: 'var(--radius)',
      cursor: 'pointer',
      textAlign: 'left',
      background: 'transparent',
      border: '1px solid var(--line)',
      color: 'var(--text)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: '13px',
      fontWeight: 600,
      letterSpacing: '.04em',
      textTransform: 'uppercase',
      fontFamily: 'var(--mono)'
    }
  }, m), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: '11px',
      opacity: .7,
      marginTop: '4px',
      fontWeight: 400,
      fontFamily: 'var(--sans)',
      letterSpacing: 0
    }
  }, d)))))));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
