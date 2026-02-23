import { useState } from 'react';

export default function AuthGate({ onLogin, onRegister, onContinueGuest }) {
    const [mode, setMode] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const submit = () => {
        setError('');
        if (!email.trim() || !password.trim()) {
            setError('Email and password are required.');
            return;
        }

        if (mode === 'register') {
            if (!name.trim()) {
                setError('Display name is required for sign up.');
                return;
            }
            const success = onRegister({ name: name.trim(), email: email.trim(), password });
            if (!success) setError('This email is already in use.');
            return;
        }

        const success = onLogin({ email: email.trim(), password });
        if (!success) setError('Invalid credentials.');
    };

    return (
        <div className="mx-auto w-full max-w-md rounded-2xl border border-blue-500/30 bg-slate-900/70 p-6 shadow-2xl shadow-blue-900/20">
            <h1 className="text-2xl font-bold text-blue-300">ARISE</h1>
            <p className="mt-2 text-sm text-slate-300">Sign in for full progression sync and analytics.</p>

            <div className="mt-5 grid grid-cols-2 rounded-lg border border-slate-700 bg-slate-950 p-1 text-sm">
                <button className={`rounded-md px-3 py-2 ${mode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-400'}`} onClick={() => setMode('login')}>
                    Login
                </button>
                <button className={`rounded-md px-3 py-2 ${mode === 'register' ? 'bg-blue-600 text-white' : 'text-slate-400'}`} onClick={() => setMode('register')}>
                    Register
                </button>
            </div>

            <div className="mt-4 space-y-3">
                {mode === 'register' && (
                    <input
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-slate-100"
                        placeholder="Display Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                )}
                <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-slate-100"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-slate-100"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

            <button className="mt-5 w-full rounded-lg bg-blue-500 px-4 py-3 font-semibold text-white" onClick={submit}>
                {mode === 'login' ? 'Login' : 'Create Account'}
            </button>
            <button className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200" onClick={onContinueGuest}>
                Continue as Guest
            </button>
        </div>
    );
}
