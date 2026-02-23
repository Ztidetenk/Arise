export const TASKS = [
    { label: 'Study 1 hour', xp: 20, stat: 'Intelligence' },
    { label: 'Workout', xp: 30, stat: 'Strength' },
    { label: 'Apply to 1 internship', xp: 15, stat: 'Discipline' },
    { label: 'Complete DSA problem', xp: 10, stat: 'Intelligence' },
    { label: '30 min coding', xp: 20, stat: 'Intelligence' },
    { label: 'Drink 2L water', xp: 8, stat: 'Discipline' },
];

export const LEVEL_XP = 100;
export const QUICK_ACTION_DAILY_LIMIT = 5;

export const calcLevel = (totalXp) => Math.floor(totalXp / LEVEL_XP);
export const progressToNextLevel = (totalXp) => totalXp % LEVEL_XP;

export const defaultBoss = {
    title: 'Weekly Boss: Internship Hunter',
    target: 10,
    unit: 'applications',
    rewardXp: 150,
    penaltyXp: 40,
};

export const getRandomQuests = (pool, count = 3) => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map((quest, idx) => ({ ...quest, id: `${Date.now()}-${idx}` }));
};

export const getDayKey = (date = new Date()) => date.toISOString().slice(0, 10);

export const getWeekKey = (date = new Date()) => {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7);
    return `${utcDate.getUTCFullYear()}-W${week}`;
};

export const getMsUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight - now;
};

export const formatDuration = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};
