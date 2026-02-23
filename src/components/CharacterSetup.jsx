export default function CharacterSetup({ form, setForm, onCreate }) {
    return (
        <div className="mx-auto w-full max-w-md rounded-2xl border border-blue-500/30 bg-slate-900/70 p-6 shadow-2xl shadow-blue-900/20">
            <h1 className="text-2xl font-bold tracking-wide text-blue-300">ARISE // Character Setup</h1>
            <p className="mt-2 text-sm text-slate-300">Enter your hunter name to begin.</p>

            <input
                className="mt-6 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-slate-100"
                placeholder="Hunter Name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />

            <button
                className="mt-5 w-full rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-3 font-semibold text-white transition hover:opacity-90"
                onClick={onCreate}
            >
                Enter Dungeon
            </button>
        </div>
    );
}
