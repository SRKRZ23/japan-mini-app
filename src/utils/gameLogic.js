// ==================== STREAK ====================
export const calculateStreak = (progressData) => {
  if (!progressData || progressData.length === 0) return 0;
  const dates = [...new Set(progressData.map(p =>
    new Date(p.completed_at).toISOString().split('T')[0]
  ))].sort().reverse();

  if (dates.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = Math.round((prev - curr) / 86400000);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
};

// ==================== DAILY MISSIONS ====================
export const calculateDailyCount = (progressData) => {
  if (!progressData || progressData.length === 0) return 0;
  const today = new Date().toISOString().split('T')[0];
  const uniqueLessons = new Set(
    progressData
      .filter(p => new Date(p.completed_at).toISOString().split('T')[0] === today)
      .map(p => p.lesson_id)
  );
  return uniqueLessons.size;
};

// ==================== HEARTS REGEN (1 per 30 min) ====================
export const MAX_HEARTS = 5;
const REGEN_MS = 30 * 60 * 1000;

export const getCurrentHearts = (userData) => {
  if (!userData) return MAX_HEARTS;
  const hearts = typeof userData.hearts === 'number' ? userData.hearts : MAX_HEARTS;
  if (hearts >= MAX_HEARTS) return MAX_HEARTS;

  const updatedAt = userData.hearts_updated_at ? new Date(userData.hearts_updated_at) : new Date();
  const elapsed = Date.now() - updatedAt.getTime();
  const regenCount = Math.floor(elapsed / REGEN_MS);
  return Math.min(MAX_HEARTS, hearts + regenCount);
};

export const getNextHeartIn = (userData) => {
  if (!userData) return null;
  const hearts = getCurrentHearts(userData);
  if (hearts >= MAX_HEARTS) return null;
  const updatedAt = userData.hearts_updated_at ? new Date(userData.hearts_updated_at) : new Date();
  const elapsed = Date.now() - updatedAt.getTime();
  const nextIn = REGEN_MS - (elapsed % REGEN_MS);
  const minutes = Math.ceil(nextIn / 60000);
  return minutes;
};

// ==================== SOUND EFFECTS (Web Audio API) ====================
let audioCtx = null;
const getAudioCtx = () => {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
  }
  return audioCtx;
};

export const playDing = () => {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) { console.log('Sound error:', e); }
};

export const playBuzz = () => {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) { console.log('Sound error:', e); }
};

export const playLevelUp = () => {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.2);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.2);
    });
  } catch (e) { console.log('Sound error:', e); }
};

