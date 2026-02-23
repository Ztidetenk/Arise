import { useEffect, useMemo, useState } from 'react';
import AuthGate from './components/AuthGate';
import CharacterSetup from './components/CharacterSetup';
import Dashboard from './components/Dashboard';
import LevelUpModal from './components/LevelUpModal';
import { fetchDailyQuests } from './lib/api';
import {
    TASKS,
    QUICK_ACTION_DAILY_LIMIT,
    calcLevel,
    defaultBoss,
    formatDuration,
    getDayKey,
    getMsUntilMidnight,
    getRandomQuests,
    getWeekKey,
    progressToNextLevel,
} from './lib/game';

const INITIAL_FORM = { name: '' };
const INITIAL_STATS = { Strength: 0, Intelligence: 0, Discipline: 0 };
const STORAGE_KEY = 'arise-save-v3';
const USERS_KEY = 'arise-users';

export default function App() {
    const [form, setForm] = useState(INITIAL_FORM);
    const [profile, setProfile] = useState(null);
    const [authUser, setAuthUser] = useState(null);
    const [isGuest, setIsGuest] = useState(false);

    const [xp, setXp] = useState(0);
    const [streak, setStreak] = useState(0);
    const [completedQuests, setCompletedQuests] = useState(0);
    const [history, setHistory] = useState([{ day: 'Day 1', xp: 0 }]);
    const [quests, setQuests] = useState([]);
    const [questDayKey, setQuestDayKey] = useState(getDayKey());
    const [dailyQuestLocked, setDailyQuestLocked] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [lastLevel, setLastLevel] = useState(0);
    const [habits, setHabits] = useState({});
    const [boss, setBoss] = useState({ ...defaultBoss, progress: 0 });
    const [bossWeekKey, setBossWeekKey] = useState(getWeekKey());
    const [bossLocked, setBossLocked] = useState(false);
    const [quickActionDateKey, setQuickActionDateKey] = useState(getDayKey());
    const [quickActionUsage, setQuickActionUsage] = useState({});
    const [statValues, setStatValues] = useState(INITIAL_STATS);
    const [availableStatPoints, setAvailableStatPoints] = useState(0);
    const [dailyResetTimer, setDailyResetTimer] = useState(formatDuration(getMsUntilMidnight()));

    const level = useMemo(() => calcLevel(xp), [xp]);
    const progress = useMemo(() => progressToNextLevel(xp), [xp]);

    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        try {
            const saved = JSON.parse(raw);
            setProfile(saved.profile ?? null);
            setAuthUser(saved.authUser ?? null);
            setIsGuest(saved.isGuest ?? false);
            setXp(saved.xp ?? 0);
            setStreak(saved.streak ?? 0);
            setCompletedQuests(saved.completedQuests ?? 0);
            setHistory(saved.history?.length ? saved.history : [{ day: 'Day 1', xp: 0 }]);
            setQuests(saved.quests ?? []);
            setQuestDayKey(saved.questDayKey ?? getDayKey());
            setDailyQuestLocked(saved.dailyQuestLocked ?? false);
            setLastLevel(saved.lastLevel ?? 0);
            setHabits(saved.habits ?? {});
            setBoss(saved.boss ?? { ...defaultBoss, progress: 0 });
            setBossWeekKey(saved.bossWeekKey ?? getWeekKey());
            setBossLocked(saved.bossLocked ?? false);
            setQuickActionDateKey(saved.quickActionDateKey ?? getDayKey());
            setQuickActionUsage(saved.quickActionUsage ?? {});
            setStatValues(saved.statValues ?? INITIAL_STATS);
            setAvailableStatPoints(saved.availableStatPoints ?? 0);
        } catch {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                profile,
                authUser,
                isGuest,
                xp,
                streak,
                completedQuests,
                history,
                quests,
                questDayKey,
                dailyQuestLocked,
                lastLevel,
                habits,
                boss,
                bossWeekKey,
                bossLocked,
                quickActionDateKey,
                quickActionUsage,
                statValues,
                availableStatPoints,
            }),
        );
    }, [
        profile,
        authUser,
        isGuest,
        xp,
        streak,
        completedQuests,
        history,
        quests,
        questDayKey,
        dailyQuestLocked,
        lastLevel,
        habits,
        boss,
        bossWeekKey,
        bossLocked,
        quickActionDateKey,
        quickActionUsage,
        statValues,
        availableStatPoints,
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDailyResetTimer(formatDuration(getMsUntilMidnight()));
            const todayKey = getDayKey();
            if (todayKey !== questDayKey && profile) {
                setQuestDayKey(todayKey);
                setDailyQuestLocked(false);
                generateQuests();
            }
            if (todayKey !== quickActionDateKey) {
                setQuickActionDateKey(todayKey);
                setQuickActionUsage({});
            }
            const weekKey = getWeekKey();
            if (weekKey !== bossWeekKey) {
                setBossWeekKey(weekKey);
                setBossLocked(false);
                setBoss((prev) => ({ ...prev, progress: 0 }));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [bossWeekKey, profile, questDayKey, quickActionDateKey]);

    useEffect(() => {
        if (level > lastLevel) {
            const levelsGained = level - lastLevel;
            setAvailableStatPoints((prev) => prev + levelsGained * 3);
            setShowLevelUp(true);
            setLastLevel(level);
        }
    }, [level, lastLevel]);

    const getUsers = () => {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        } catch {
            return [];
        }
    };

    const register = ({ name, email, password }) => {
        const users = getUsers();
        if (users.some((user) => user.email === email)) return false;
        users.push({ name, email, password });
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        setAuthUser({ name, email });
        setIsGuest(false);
        return true;
    };

    const login = ({ email, password }) => {
        const users = getUsers();
        const user = users.find((candidate) => candidate.email === email && candidate.password === password);
        if (!user) return false;
        setAuthUser({ name: user.name, email: user.email });
        setIsGuest(false);
        return true;
    };

    const continueGuest = () => {
        setAuthUser(null);
        setIsGuest(true);
    };

    const addXp = (amount) => {
        setXp((prev) => {
            const next = Math.max(0, prev + amount);
            setHistory((current) => [...current.slice(-19), { day: `Day ${current.length + 1}`, xp: next }]);
            return next;
        });
    };

    const generateQuests = async () => {
        const fromApi = await fetchDailyQuests(['Strength', 'Intelligence', 'Discipline']);
        if (fromApi?.quests?.length) {
            setQuests(fromApi.quests.map((quest, idx) => ({ ...quest, id: `${Date.now()}-${idx}`, done: false })));
            return;
        }
        setQuests(getRandomQuests(TASKS).map((quest) => ({ ...quest, done: false })));
    };

    const createCharacter = async () => {
        if (!form.name.trim()) return;
        setProfile({ name: form.name.trim() });
        setStatValues(INITIAL_STATS);
        setStreak(1);
        setDailyQuestLocked(false);
        setQuestDayKey(getDayKey());
        await generateQuests();
    };

    const completeTask = (task) => {
        const today = getDayKey();
        if (today !== quickActionDateKey) {
            setQuickActionDateKey(today);
            setQuickActionUsage({});
        }
        const currentCount = quickActionUsage[task.label] || 0;
        if (currentCount >= QUICK_ACTION_DAILY_LIMIT) return;

        addXp(task.xp);
        setHabits((prev) => ({ ...prev, [task.label]: (prev[task.label] || 0) + 1 }));
        setQuickActionUsage((prev) => ({ ...prev, [task.label]: (prev[task.label] || 0) + 1 }));
    };

    const toggleQuest = (id) => {
        if (dailyQuestLocked) return;
        setQuests((prev) => {
            const updated = prev.map((quest) => (quest.id === id ? { ...quest, done: !quest.done } : quest));
            const nowComplete = updated.length > 0 && updated.every((quest) => quest.done);
            const wasComplete = prev.length > 0 && prev.every((quest) => quest.done);
            if (nowComplete && !wasComplete) {
                addXp(40);
                setCompletedQuests((count) => count + updated.length);
                setStreak((days) => days + 1);
                setDailyQuestLocked(true);
            }
            return updated;
        });
    };

    const claimBoss = (success) => {
        if (bossLocked) return;
        if (success && boss.progress >= boss.target) {
            addXp(boss.rewardXp);
        } else {
            addXp(-boss.penaltyXp);
            setStreak(0);
        }
        setBossLocked(true);
    };

    const claimShadow = () => addXp(5);

    const allocateStatPoint = (stat) => {
        setAvailableStatPoints((points) => {
            if (points <= 0) return points;
            setStatValues((prev) => ({ ...prev, [stat]: (prev[stat] || 0) + 1 }));
            return points - 1;
        });
    };

    const bossResetLabel = useMemo(() => {
        const now = new Date();
        const day = now.getDay();
        const daysUntilMonday = (8 - day) % 7 || 7;
        const nextMonday = new Date(now);
        nextMonday.setDate(now.getDate() + daysUntilMonday);
        return nextMonday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }, [bossWeekKey]);

    if (!authUser && !isGuest) {
        return (
            <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(30,58,138,.35),rgba(2,6,23,1)_45%)] p-6 text-slate-100">
                <AuthGate onLogin={login} onRegister={register} onContinueGuest={continueGuest} />
            </main>
        );
    }

    if (!profile) {
        return (
            <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(30,58,138,.35),rgba(2,6,23,1)_45%)] p-6 text-slate-100">
                <CharacterSetup form={form} setForm={setForm} onCreate={createCharacter} />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(30,58,138,.35),rgba(2,6,23,1)_45%)] p-6 text-slate-100">
            <Dashboard
                profile={profile}
                quests={quests}
                toggleQuest={toggleQuest}
                questLocked={dailyQuestLocked}
                dailyResetTimer={dailyResetTimer}
                completeTask={completeTask}
                boss={boss}
                bossLocked={bossLocked}
                bossResetLabel={bossResetLabel}
                updateBoss={(progressValue) => setBoss((prev) => ({ ...prev, progress: progressValue }))}
                claimBoss={claimBoss}
                claimShadow={claimShadow}
                allocateStatPoint={allocateStatPoint}
                isGuest={isGuest}
                onOpenAuth={() => {
                    setIsGuest(false);
                    setProfile(null);
                }}
                game={{
                    level,
                    xp,
                    progress,
                    streak,
                    completedQuests,
                    history,
                    taskPool: TASKS,
                    habits,
                    quickActionUsage,
                    statValues,
                    availableStatPoints,
                }}
            />
            {showLevelUp && (
                <LevelUpModal
                    level={level}
                    availablePoints={availableStatPoints}
                    stats={statValues}
                    onAllocate={allocateStatPoint}
                    onClose={() => setShowLevelUp(false)}
                />
            )}
        </main>
    );
}
