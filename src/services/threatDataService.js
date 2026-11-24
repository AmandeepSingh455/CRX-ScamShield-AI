/**
 * CRX ScamShield AI - Threat Map Live Data Service
 * Provides baseline data matching reference screenshots and live simulated data stream.
 */

export const INITIAL_KPIS = {
  scamsDetectedToday: 1847,
  activeScamScripts: 23,
  flaggedUpiIds: 6412,
  reportsFiled: 912,
};

// Tile map grid coordinates (x 0-8, y 0-7)
export const INITIAL_STATE_TILES = [
  // Row 0
  { code: 'JK', name: 'Jammu & Kashmir', count: 19, x: 3, y: 0, row: 0, col: 3 },
  // Row 1
  { code: 'PB', name: 'Punjab', count: 152, x: 2, y: 1, row: 1, col: 2 },
  { code: 'HP', name: 'Himachal Pradesh', count: 21, x: 3, y: 1, row: 1, col: 3 },
  // Row 2
  { code: 'RJ', name: 'Rajasthan', count: 198, x: 1, y: 2, row: 2, col: 1 },
  { code: 'HR', name: 'Haryana', count: 169, x: 2, y: 2, row: 2, col: 2 },
  { code: 'DL', name: 'Delhi', count: 341, x: 3, y: 2, row: 2, col: 3 },
  { code: 'UK', name: 'Uttarakhand', count: 33, x: 4, y: 2, row: 2, col: 4 },
  { code: 'SK', name: 'Sikkim', count: 2, x: 6, y: 2, row: 2, col: 6 },
  { code: 'AR', name: 'Arunachal Pradesh', count: 3, x: 8, y: 2, row: 2, col: 8 },
  // Row 3
  { code: 'GJ', name: 'Gujarat', count: 187, x: 0, y: 3, row: 3, col: 0 },
  { code: 'MP', name: 'Madhya Pradesh', count: 131, x: 2, y: 3, row: 3, col: 2 },
  { code: 'UP', name: 'Uttar Pradesh', count: 412, x: 3, y: 3, row: 3, col: 3 },
  { code: 'BR', name: 'Bihar', count: 149, x: 4, y: 3, row: 3, col: 4 },
  { code: 'WB', name: 'West Bengal', count: 221, x: 5, y: 3, row: 3, col: 5 },
  { code: 'AS', name: 'Assam', count: 38, x: 7, y: 3, row: 3, col: 7 },
  { code: 'NL', name: 'Nagaland', count: 4, x: 8, y: 3, row: 3, col: 8 },
  // Row 4
  { code: 'MH', name: 'Maharashtra', count: 388, x: 1, y: 4, row: 4, col: 1 },
  { code: 'CG', name: 'Chhattisgarh', count: 41, x: 3, y: 4, row: 4, col: 3 },
  { code: 'JH', name: 'Jharkhand', count: 63, x: 4, y: 4, row: 4, col: 4 },
  { code: 'ML', name: 'Meghalaya', count: 6, x: 6, y: 4, row: 4, col: 6 },
  { code: 'TR', name: 'Tripura', count: 7, x: 7, y: 4, row: 4, col: 7 },
  { code: 'MN', name: 'Manipur', count: 5, x: 8, y: 4, row: 4, col: 8 },
  // Row 5
  { code: 'GA', name: 'Goa', count: 14, x: 0, y: 5, row: 5, col: 0 },
  { code: 'TS', name: 'Telangana', count: 264, x: 2, y: 5, row: 5, col: 2 },
  { code: 'OD', name: 'Odisha', count: 74, x: 4, y: 5, row: 5, col: 4 },
  { code: 'MZ', name: 'Mizoram', count: 3, x: 7, y: 5, row: 5, col: 7 },
  // Row 6
  { code: 'KA', name: 'Karnataka', count: 297, x: 1, y: 6, row: 6, col: 1 },
  { code: 'AP', name: 'Andhra Pradesh', count: 118, x: 2, y: 6, row: 6, col: 2 },
  // Row 7
  { code: 'KL', name: 'Kerala', count: 86, x: 1, y: 7, row: 7, col: 1 },
  { code: 'TN', name: 'Tamil Nadu', count: 176, x: 2, y: 7, row: 7, col: 2 },
];

export const INITIAL_TOP_CITIES = [
  { rank: 1, name: 'Noida', count: 220 },
  { rank: 2, name: 'Gurugram', count: 209 },
  { rank: 3, name: 'Bengaluru', count: 198 },
  { rank: 4, name: 'Hyderabad', count: 187 },
  { rank: 5, name: 'Pune', count: 176 },
  { rank: 6, name: 'Mumbai', count: 165 },
  { rank: 7, name: 'Kolkata', count: 154 },
  { rank: 8, name: 'Jaipur', count: 143 },
];

export const INITIAL_NEWS_ALERTS = [
  {
    id: 1,
    title: 'Fake Russian Embassy Recruitment Scam',
    summary:
      'Delhi Police arrested two men for running a fake website (embassytest.com) mimicking the Russian Embassy to sell fake overseas jobs and collect illegal registration fees.',
    date: 'Oct 2026',
    location: 'Delhi',
    iconType: 'red',
  },
  {
    id: 2,
    title: 'Task-Based Online Shopping Fraud',
    summary:
      'A Hyderabad victim lost over ₹37 lakh to a remote "product rating" job. Scammers paid small early returns, then froze funds and demanded huge deposits to unlock payouts.',
    date: 'Oct 2026',
    location: 'Hyderabad',
    iconType: 'red',
  },
  {
    id: 3,
    title: 'Government Job Consultancy Scheme',
    summary:
      'Crime Branch filed charges against fake job consultancies issuing forged government appointment letters and taking large upfront fees for "direct entry" job quotas.',
    date: 'Oct 2026',
    location: 'Crime Branch',
    iconType: 'amber',
  },
  {
    id: 4,
    title: 'Fake IT Recruiters on Telegram & WhatsApp',
    summary:
      'Coordinated phishing network impersonating major multinational IT vendors dismantled in cyber operation after issuing forged appointment letters requesting security equipment deposits.',
    date: 'Oct 2026',
    location: 'Cyber Cell',
    iconType: 'blue',
  },
  {
    id: 5,
    title: 'Prepaid Review Fraud Ring Busted',
    summary:
      'Police seized 42 SIM cards and frozen bank accounts linked to an organized syndicate charging unsuspecting job seekers for fake online movie ratings and restaurant reviews.',
    date: 'Oct 2026',
    location: 'Bengaluru',
    iconType: 'red',
  },
];

export const INITIAL_HOURLY_DATA = [
  { time: '05 pm', count: 29 },
  { time: '07 pm', count: 32 },
  { time: '09 pm', count: 21 },
  { time: '11 pm', count: 27 },
  { time: '01 am', count: 23 },
  { time: '03 am', count: 26 },
  { time: '05 am', count: 34 },
  { time: '07 am', count: 22 },
  { time: '09 am', count: 31 },
  { time: '11 am', count: 24 },
  { time: '01 pm', count: 27 },
  { time: '03 pm', count: 22 },
];

export const INITIAL_TRENDING_SCRIPTS = [
  { name: 'Like & earn task', change: '+34%', positive: false, percent: 82 },
  { name: 'Prepaid task', change: '+22%', positive: false, percent: 68 },
  { name: 'Fake offer letter', change: '+12%', positive: false, percent: 54 },
  { name: 'Data-entry scam', change: '-6%', positive: true, percent: 40 },
  { name: 'Review & rating', change: '+41%', positive: false, percent: 88 },
  { name: 'Crypto task', change: '+9%', positive: false, percent: 32 },
];

export const INITIAL_FLAGGED_IDENTIFIERS = [
  {
    id: 1,
    type: 'UPI ID',
    icon: 'at',
    identifier: 'ea******92@okaxis',
    reports: 34,
    status: 'Unverified',
  },
  {
    id: 2,
    type: 'Phone number',
    icon: 'phone',
    identifier: '+91 91•••••881',
    reports: 28,
    status: 'Unverified',
  },
  {
    id: 3,
    type: 'Telegram',
    icon: 'at',
    identifier: '@a******ip',
    reports: 41,
    status: 'Unverified',
  },
  {
    id: 4,
    type: 'UPI ID',
    icon: 'at',
    identifier: 'tr******01@paytm',
    reports: 23,
    status: 'Unverified',
  },
  {
    id: 5,
    type: 'Phone number',
    icon: 'phone',
    identifier: '+91 88•••••412',
    reports: 19,
    status: 'Unverified',
  },
  {
    id: 6,
    type: 'UPI ID',
    icon: 'at',
    identifier: 'pay******99@ybl',
    reports: 16,
    status: 'Unverified',
  },
];

/**
 * Calculates tile background color, text color, and border based on report count.
 */
export function getTileColorStyle(count) {
  if (count >= 300) {
    // Deep crimson/red
    return {
      bg: 'bg-[#ef4444]',
      text: 'text-white',
      border: 'border-[#dc2626]',
      badgeBg: 'bg-black/20',
      badgeText: 'text-white',
    };
  }
  if (count >= 200) {
    // Warm orange
    return {
      bg: 'bg-[#f97316]',
      text: 'text-white',
      border: 'border-[#ea580c]',
      badgeBg: 'bg-black/20',
      badgeText: 'text-white',
    };
  }
  if (count >= 100) {
    // Soft yellow/amber
    return {
      bg: 'bg-[#fde047]',
      text: 'text-[#854d0e]',
      border: 'border-[#facc15]',
      badgeBg: 'bg-black/10',
      badgeText: 'text-[#713f12]',
    };
  }
  if (count >= 30) {
    // Pale mint/light green
    return {
      bg: 'bg-[#dcfce7]',
      text: 'text-[#166534]',
      border: 'border-[#bbf7d0]',
      badgeBg: 'bg-black/10',
      badgeText: 'text-[#14532d]',
    };
  }
  // Low (<30): soft pale mint
  return {
    bg: 'bg-[#e2fbe8]',
    text: 'text-[#166534]',
    border: 'border-[#bbf7d0]',
    badgeBg: 'bg-black/10',
    badgeText: 'text-[#166534]',
  };
}

/**
 * Creates SVG cubic bezier path string from numeric points.
 */
export function generateSplinePath(data, width = 600, height = 180, padding = 20) {
  if (!data || data.length === 0) return { path: '', area: '', points: [] };

  const minVal = 0;
  const maxVal = 36;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const stepX = usableWidth / (data.length - 1);

  const points = data.map((d, i) => {
    const x = padding + i * stepX;
    const normY = (d.count - minVal) / (maxVal - minVal);
    const y = height - padding - normY * usableHeight;
    return { x, y, val: d.count, label: d.time };
  });

  if (points.length === 1) {
    return {
      path: `M ${points[0].x} ${points[0].y}`,
      area: '',
      points,
    };
  }

  // Generate smooth cubic bezier spline curve
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const bottomY = height - padding;
  const area = `${path} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`;

  return { path, area, points };
}
