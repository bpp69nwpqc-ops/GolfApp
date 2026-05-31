const HistoryUI = {
  subView: 'list',
  detailRoundId: null,

  render() {
    if (this.subView === 'detail') {
      const round = Storage.getRounds().find(r => r.id === this.detailRoundId);
      if (!round) { this.subView = 'list'; return this._renderList(); }
      return this._renderDetail(round);
    }
    return this._renderList();
  },

  _renderList() {
    const rounds = Storage.getRounds();
    return `
      <div>
        <header class="page-header">
          <div class="page-header-row">
            <h1 class="page-title">History</h1>
            ${profileHeaderBtn()}
          </div>
        </header>
        <div class="content-body">
          ${rounds.length === 0 ? this._empty() : this._roundList(rounds)}
        </div>
      </div>
    `;
  },

  _empty() {
    return `
      <div class="empty-state">
        <i class="ti ti-clock empty-icon"></i>
        <p class="empty-title">No rounds saved yet</p>
        <p class="empty-sub">Completed rounds will appear here</p>
      </div>
    `;
  },

  _roundList(rounds) {
    const fmtLabel = { strokeplay: 'Strokeplay', stableford: 'Stableford', matchplay: 'Matchplay', scramble: 'Scramble', bestball: 'Best Ball' };
    return rounds.slice().reverse().map(r => {
      const club    = getClub(r.clubId);
      const course  = getCourse(r.clubId, r.courseId);
      const date    = new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const players = Storage.getPlayers();
      const winner  = r.winner ? players.find(p => p.id === r.winner) : null;
      return `
        <div class="card round-row" data-action="view-round" data-round-id="${r.id}">
          <div class="round-row-title">${club ? club.name : r.clubId}</div>
          <div class="round-row-meta">${date} · ${course ? course.name : ''} · ${r.totalHoles} holes</div>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-top:6px;">
            <span class="format-badge format-${r.format}">${fmtLabel[r.format] || r.format}</span>
            ${winner ? `<span style="font-size:12px; color:var(--gold); font-weight:600;">🏆 ${winner.name}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  _renderDetail(round) {
    const club    = getClub(round.clubId);
    const course  = getCourse(round.clubId, round.courseId);
    const players = Storage.getPlayers().filter(p => round.playerIds.includes(p.id));
    const pars    = getCoursePars(round.clubId, round.courseId, round.totalHoles);
    const fmtLabel = { strokeplay: 'Strokeplay', stableford: 'Stableford', matchplay: 'Matchplay', scramble: 'Scramble', bestball: 'Best Ball' };
    const fmtName  = fmtLabel[round.format] || round.format;
    const date     = new Date(round.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const scoreTotals = {};
    players.forEach(p => {
      const scores = round.scores[p.id] || new Array(round.totalHoles).fill(null);
      scoreTotals[p.id] = round.format === 'stableford'
        ? Scoring.totalStableford(scores, pars)
        : Scoring.totalGross(scores, pars);
    });

    const winner = round.winner ? players.find(p => p.id === round.winner) : null;

    return `
      <div class="summary-screen">
        <header class="page-header">
          <div class="page-header-row">
            <button class="header-back" data-action="history-back"><i class="ti ti-arrow-left"></i></button>
            <h1 class="page-title">Round Detail</h1>
            ${profileHeaderBtn()}
          </div>
        </header>

        <div class="content-body">
          <div class="card">
            <div style="font-size:15px;font-family:var(--font-serif);font-weight:700;margin-bottom:2px;">${club ? club.name : round.clubId}</div>
            <div style="font-size:13px;color:var(--text-secondary)">${course ? course.name : round.courseId} · ${round.totalHoles} holes</div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;">
              <span style="font-size:12px;color:var(--text-secondary)">${date}</span>
              <span class="format-badge format-${round.format}">${fmtName}</span>
            </div>
          </div>

          ${winner ? `
            <div class="winner-banner">
              <div class="winner-trophy">🏆</div>
              <div>
                <div class="winner-label">Winner</div>
                <div class="winner-name">${winner.name}</div>
                <div class="winner-detail">${fmtName}</div>
              </div>
            </div>
          ` : ''}

          ${buildScorecardTable(round, players, pars, scoreTotals, round.winner)}

          <button class="btn-danger" data-action="history-delete" data-round-id="${round.id}">Delete Round</button>
        </div>
      </div>
    `;
  },

  handleAction(action, target) {
    if (action === 'view-round') {
      this.detailRoundId = target.dataset.roundId;
      this.subView = 'detail';
      App.renderContent();
    } else if (action === 'history-back') {
      this.subView = 'list';
      App.renderContent();
    } else if (action === 'history-delete') {
      if (!confirm('Delete this round? This cannot be undone.')) return;
      const remaining = Storage.getRounds().filter(r => r.id !== target.dataset.roundId);
      Storage.saveRounds(remaining);
      this.subView = 'list';
      App.renderContent();
    }
  }
};
