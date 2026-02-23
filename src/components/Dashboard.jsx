import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { QUICK_ACTION_DAILY_LIMIT } from '../lib/game';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard({
    profile,
    game,
    quests,
    toggleQuest,
    questLocked,
    dailyResetTimer,
    completeTask,
    boss,
    bossLocked,
    bossResetLabel,
    updateBoss,
    claimBoss,
    claimShadow,
    allocateStatPoint,
    isGuest,
    onOpenAuth,
}) {
    const chartData = {
        labels: game.history.map((h) => h.day),
        datasets: [
            {
                label: 'Total XP',
                data: game.history.map((h) => h.xp),
                borderColor: '#60a5fa',
                tension: 0.3,
            },
        ],
    };

    const passiveCandidates = Object.entries(game.habits)
        .filter(([, days]) => days >= 7)
        .map(([habit]) => habit);

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="rounded-2xl border border-blue-500/30 bg-slate-900/70 p-6 shadow-xl shadow-blue-900/10">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-200">{profile.name} • Level {game.level}</h2>
                        <p className="text-sm text-slate-300">Rise with consistency.</p>
                    </div>
                    <div className="rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs text-slate-300">
                        <p>Strength: <span className="text-blue-300">{game.statValues.Strength}</span></p>
                        <p>Intelligence: <span className="text-blue-300">{game.statValues.Intelligence}</span></p>
                        <p>Discipline: <span className="text-blue-300">{game.statValues.Discipline}</span></p>
                        <p className="mt-1">Unspent Points: <span className="text-emerald-300">{game.availableStatPoints}</span></p>
                    </div>
                </div>

                <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: `${game.progress}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-sm text-slate-300">
                    <span>{game.xp} XP</span>
                    <span>Streak: {game.streak} days</span>
                    <span>Quests Cleared: {game.completedQuests}</span>
                </div>
            </div>

            <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
                <h3 className="text-lg font-semibold text-white">Stat Points</h3>
                <p className="mt-1 text-xs text-slate-400">Spend unspent points anytime to upgrade your build.</p>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                    {['Strength', 'Intelligence', 'Discipline'].map((stat) => (
                        <button
                            key={stat}
                            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-left text-sm disabled:opacity-50"
                            disabled={game.availableStatPoints <= 0}
                            onClick={() => allocateStatPoint(stat)}
                        >
                            +1 {stat} <span className="float-right text-blue-300">{game.statValues[stat]}</span>
                        </button>
                    ))}
                </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Daily Quests</h3>
                        <span className="text-xs text-slate-400">Reset in {dailyResetTimer}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                        {questLocked ? 'Daily reward already claimed. Come back after reset.' : 'Complete all 3 once per day for +40 XP bonus.'}
                    </p>
                    <div className="mt-3 space-y-3">
                        {quests.map((quest) => (
                            <label key={quest.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/70 p-3 text-sm">
                                <span>{quest.label}</span>
                                <input type="checkbox" checked={quest.done} disabled={questLocked} onChange={() => toggleQuest(quest.id)} />
                            </label>
                        ))}
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
                    <h3 className="text-lg font-semibold text-white">Quick XP Actions</h3>
                    <p className="mt-1 text-xs text-slate-400">Each action can be claimed max {QUICK_ACTION_DAILY_LIMIT} times per day.</p>
                    <div className="mt-3 grid gap-2">
                        {game.taskPool.map((task) => {
                            const count = game.quickActionUsage[task.label] || 0;
                            const disabled = count >= QUICK_ACTION_DAILY_LIMIT;

                            return (
                                <button
                                    key={task.label}
                                    className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-left text-sm transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800/50 disabled:text-slate-500"
                                    onClick={() => completeTask(task)}
                                    disabled={disabled}
                                >
                                    <span>{task.label}</span>{' '}
                                    <span className="text-blue-300">(+{task.xp} XP)</span>
                                    <span className="float-right text-xs text-slate-400">{count}/{QUICK_ACTION_DAILY_LIMIT}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            </div>

            <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-white">Boss Battle</h3>
                    <span className="text-xs text-slate-400">{bossLocked ? `Locked until ${bossResetLabel}` : `Resets on ${bossResetLabel}`}</span>
                </div>
                <p className="text-sm text-slate-300">{boss.title}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                        type="number"
                        min="0"
                        className="w-28 rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm"
                        value={boss.progress}
                        disabled={bossLocked}
                        onChange={(e) => updateBoss(Number(e.target.value))}
                    />
                    <span className="text-sm text-slate-300">/ {boss.target} {boss.unit}</span>
                    <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm disabled:opacity-50" onClick={() => claimBoss(true)} disabled={bossLocked}>
                        Complete
                    </button>
                    <button className="rounded-lg bg-rose-600 px-3 py-2 text-sm disabled:opacity-50" onClick={() => claimBoss(false)} disabled={bossLocked}>
                        Fail
                    </button>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
                <h3 className="text-lg font-semibold text-white">Shadow Army Mode</h3>
                <p className="text-sm text-slate-300">Habits with 7+ streak days unlock passive XP summons.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {passiveCandidates.length === 0 && <span className="text-sm text-slate-400">No shadows unlocked yet.</span>}
                    {passiveCandidates.map((habit) => (
                        <button key={habit} className="rounded-lg bg-violet-700 px-3 py-2 text-sm" onClick={() => claimShadow(habit)}>
                            Summon {habit} (+5 XP)
                        </button>
                    ))}
                </div>
            </section>

            <section className="relative rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
                <h3 className="text-lg font-semibold text-white">Growth Graph</h3>
                <div className={isGuest ? 'pointer-events-none select-none blur-[2px] opacity-65' : ''}>
                    <Line data={chartData} />
                </div>
                {isGuest && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-xl border border-blue-500/40 bg-slate-950/90 px-5 py-4 text-center">
                            <p className="text-sm font-semibold text-blue-200">Sign in to get full experience</p>
                            <button className="mt-2 rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white" onClick={onOpenAuth}>
                                Sign In
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
