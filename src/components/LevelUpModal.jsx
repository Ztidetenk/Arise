export default function LevelUpModal({ level, onClose, availablePoints, stats, onAllocate }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-blue-400/50 bg-slate-900 p-8 text-center shadow-[0_0_50px_10px_rgba(59,130,246,0.25)]">
                <p className="text-xs font-semibold tracking-[0.24em] text-blue-300">SYSTEM MESSAGE</p>
                <h2 className="mt-2 text-5xl font-black text-white">LEVEL UP</h2>
                <p className="mt-3 text-sm text-slate-300">Level {level} reached. Allocate your stat points to shape your build.</p>

                <p className="mt-5 text-sm font-semibold text-blue-200">Available Points: {availablePoints}</p>

                <div className="mt-3 grid gap-2">
                    {Object.entries(stats).map(([name, value]) => (
                        <button
                            key={name}
                            className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/70 px-4 py-3 text-left transition hover:border-blue-500 hover:bg-slate-800"
                            onClick={() => onAllocate(name)}
                            disabled={availablePoints === 0}
                        >
                            <span className="font-medium text-slate-100">{name}</span>
                            <span className="text-blue-300">{value}</span>
                        </button>
                    ))}
                </div>

                <button className="mt-6 w-full rounded-lg bg-blue-500 px-5 py-2 font-semibold text-white disabled:opacity-50" onClick={onClose}>
                    Continue
                </button>
            </div>
            <audio autoPlay>
                <source src="https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg" type="audio/ogg" />
            </audio>
        </div>
    );
}
