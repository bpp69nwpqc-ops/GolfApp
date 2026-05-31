const HomeUI = {
  render() {
    const profile  = Storage.getProfile();
    const rounds   = Storage.getRounds();
    const lastRound = rounds.length ? rounds[rounds.length - 1] : null;

    const profileBtnHtml = (() => {
      if (!profile) {
        return `<button class="profile-hdr-btn home-profile-btn" data-action="open-profile">
          <div class="profile-hdr-avatar empty"><i class="ti ti-user"></i></div>
        </button>`;
      }
      const initials = profile.name.split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2);
      return `<button class="profile-hdr-btn home-profile-btn" data-action="open-profile">
        <div class="profile-hdr-avatar" style="background-color:${profile.avatarColor}">${initials}</div>
      </button>`;
    })();

    return `
      <div>
        <header class="page-header home-header">
          ${profileBtnHtml}
          <img src="Logo_GolfApp_Masters.png" alt="Masters" class="home-logo">
          <p class="home-subtitle">Belgian Golf</p>
        </header>
        <div class="home-content">
          <button class="btn-primary btn-start-round" data-action="start-new-round">
            + Start New Round
          </button>
          ${lastRound ? this._lastRoundCard(lastRound) : this._emptyLastRound()}
          ${profile ? this._handicapCard(profile) : this._emptyHandicapCard()}
        </div>
        <div style="text-align:center;padding:8px 0 16px;font-size:10px;color:var(--text-secondary);opacity:0.5">v9</div>
      </div>
    `;
  },

  _lastRoundCard(round) {
    const club   = getClub(round.clubId);
    const course = getCourse(round.clubId, round.courseId);
    const date   = new Date(round.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `
      <div class="card last-round-card">
        <div class="card-label">Last Round</div>
        <div class="card-title">${club ? club.name : round.clubId}</div>
        <div class="card-sub">${course ? course.name : ''} · ${round.totalHoles} holes</div>
        <div class="round-meta">
          <span class="format-badge format-${round.format}">${this._fmtLabel(round.format)}</span>
          <span class="round-date">${date}</span>
        </div>
      </div>
    `;
  },

  _emptyLastRound() {
    return `
      <div class="card empty-card">
        <div class="card-label">Last Round</div>
        <div class="empty-text">No rounds yet — start your first!</div>
      </div>
    `;
  },

  _handicapCard(profile) {
    const hcp = profile.currentHandicap != null ? profile.currentHandicap.toFixed(1) : '—';
    return `
      <div class="card hcp-card">
        <div class="card-label">Handicap Index</div>
        <div class="hcp-display">
          <span class="hcp-name">${profile.name}</span>
          <span class="hcp-value">${hcp}</span>
        </div>
      </div>
    `;
  },

  _emptyHandicapCard() {
    return `
      <div class="card empty-card" style="cursor:pointer" data-action="open-profile">
        <div class="card-label">Handicap Index</div>
        <div class="empty-text">Set up your profile to track handicap</div>
      </div>
    `;
  },

  _fmtLabel(fmt) {
    return { strokeplay: 'Strokeplay', stableford: 'Stableford', matchplay: 'Matchplay', scramble: 'Scramble', bestball: 'Best Ball' }[fmt] || fmt;
  }
};
