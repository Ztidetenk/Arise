const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchDailyQuests(stats) {
    try {
        const response = await fetch(`${API_BASE}/quests/daily`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stats }),
        });
        if (!response.ok) {
            throw new Error('Failed to load quests');
        }
        return await response.json();
    } catch {
        return null;
    }
}
