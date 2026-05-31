const Storage = {
  getPlayers() {
    try { return JSON.parse(localStorage.getItem('masters_players')) || []; }
    catch { return []; }
  },
  savePlayers(players) {
    localStorage.setItem('masters_players', JSON.stringify(players));
  },
  getRounds() {
    try { return JSON.parse(localStorage.getItem('masters_rounds')) || []; }
    catch { return []; }
  },
  saveRounds(rounds) {
    localStorage.setItem('masters_rounds', JSON.stringify(rounds));
  },
  getActiveRound() {
    try { return JSON.parse(localStorage.getItem('masters_active_round')); }
    catch { return null; }
  },
  saveActiveRound(round) {
    localStorage.setItem('masters_active_round', JSON.stringify(round));
  },
  clearActiveRound() {
    localStorage.removeItem('masters_active_round');
  },
  getProfile() {
    try { return JSON.parse(localStorage.getItem('masters_profile')) || null; }
    catch { return null; }
  },
  saveProfile(profile) {
    localStorage.setItem('masters_profile', JSON.stringify(profile));
  },
  generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
};

// Returns profile + friends merged — use this everywhere players are needed for a round
function getAllPlayers() {
  const profile = Storage.getProfile();
  const friends = Storage.getPlayers();
  return profile ? [profile, ...friends] : friends;
}
