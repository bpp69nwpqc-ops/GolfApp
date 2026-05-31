const StatsUI = {
  render() {
    const profile = Storage.getProfile();
    if (!profile) return this._noProfile();

    const myRounds = Storage.getRounds().filter(r => r.playerIds && r.playerIds.includes(profile.id));
    if (myRounds.length === 0) return this._noRounds(profile);

    return `
      <div>
        <header class="page-header">
          <div class="page-header-row">
            <h1 class="page-title">Stats</h1>
            ${profileHeaderBtn()}
          </div>
        </header>
        <div class="content-body">
          ${this._overview(profile, myRounds)}
          ${this._scoringDistribution(profile, myRounds)}
          ${this._recentRounds(profile, myRounds)}
          ${this._handicapEvolution(profile)}
          ${this._perCourse(profile, myRounds)}
        </div>
      </div>
    `;
  },

  _noProfile() {
    return `
      <div>
        <header class="page-header">
          <div class="page-header-row">
            <h1 class="page-title">Stats</h1>
            ${profileHeaderBtn()}
          </div>
        </header>
        <div class="empty-state" style="padding-top:48px">
          <i class="ti ti-user-circle empty-icon"></i>
          <p class="empty-title">Set up your profile</p>
          <p class="empty-sub">Stats are based on rounds you play</p>
          <button class="btn-primary" data-action="open-profile"
                  style="margin-top:20px;max-width:200px;padding:12px">
            Set Up Profile
          </button>
        </div>
      </div>
    `;
  },

  _noRounds(profile) {
    return `
      <div>
        <header class="page-header">
          <div class="page-header-row">
            <h1 class="page-title">Stats</h1>
            ${profileHeaderBtn()}
          </div>
        </header>
        <div class="empty-state" style="padding-top:48px">
          <i class="ti ti-chart-bar empty-icon"></i>
          <p class="empty-title">No rounds yet, ${profile.name.split(' ')[0]}</p>
          <p class="empty-sub">Play and save rounds to see your stats here</p>
        </div>
      </div>
    `;
  },

  _overview(profile, rounds) {
    const vsParList = rounds.map(r => {
      const pars   = getCoursePars(r.clubId, r.courseId, r.totalHoles);
      const scores = r.scores[profile.id] || new Array(r.totalHoles).fill(null);
      const gross  = Scoring.totalGross(scores, pars);
      const par    = pars.reduce((a, b) => a + b, 0);
      return gross - par;
    });

    const best = Math.min(...vsParList);
    const avg  = vsParList.reduce((a, b) => a + b, 0) / vsParList.length;
    const fmtVsPar = v => v === 0 ? 'E' : v > 0 ? `+${v}` : `${v}`;
    const fmtAvg   = v => {
      if (v === 0) return 'E';
      const rounded = Math.round(v * 10) / 10;
      return v > 0 ? `+${rounded.toFixed(1)}` : `${rounded.toFixed(1)}`;
    };

    return `
      <div class="stats-section">
        <div class="stats-section-label">Overview</div>
        <div class="stats-overview-row">
          <div class="stats-chip">
            <div class="stats-chip-value">${rounds.length}</div>
            <div class="stats-chip-label">Rounds</div>
          </div>
          <div class="stats-chip">
            <div class="stats-chip-value">${fmtVsPar(best)}</div>
            <div class="stats-chip-label">Best</div>
          </div>
          <div class="stats-chip">
            <div class="stats-chip-value">${fmtAvg(avg)}</div>
            <div class="stats-chip-label">Avg</div>
          </div>
        </div>
      </div>
    `;
  },

  _scoringDistribution(profile, rounds) {
    const counts = { eagle: 0, birdie: 0, par: 0, bogey: 0, double: 0, triple: 0 };
    let total = 0;

    rounds.forEach(r => {
      const pars   = getCoursePars(r.clubId, r.courseId, r.totalHoles);
      const scores = r.scores[profile.id] || new Array(r.totalHoles).fill(null);
      scores.forEach((s, i) => {
        const val  = s !== null ? s : pars[i];
        const diff = val - pars[i];
        total++;
        if      (diff <= -2) counts.eagle++;
        else if (diff === -1) counts.birdie++;
        else if (diff === 0)  counts.par++;
        else if (diff === 1)  counts.bogey++;
        else if (diff === 2)  counts.double++;
        else                  counts.triple++;
      });
    });

    const pct = n => total > 0 ? +((n / total) * 100).toFixed(0) : 0;
    const segments = [
      { label: 'Eagle+', color: '#085041', count: counts.eagle  },
      { label: 'Birdie', color: '#27AE60', count: counts.birdie },
      { label: 'Par',    color: '#9A9690', count: counts.par    },
      { label: 'Bogey',  color: '#BA7517', count: counts.bogey  },
      { label: 'Double', color: '#E65100', count: counts.double },
      { label: 'Triple+',color: '#C62828', count: counts.triple },
    ].filter(s => s.count > 0);

    const bar = segments.map(s =>
      `<div class="stacked-segment" style="flex-basis:${pct(s.count)}%;background:${s.color}"></div>`
    ).join('');

    const legend = segments.map(s =>
      `<div class="stacked-legend-item">
        <span class="stacked-dot" style="background:${s.color}"></span>
        <span class="stacked-legend-name">${s.label}</span>
        <span class="stacked-pct">${pct(s.count)}%</span>
      </div>`
    ).join('');

    return `
      <div class="stats-section">
        <div class="stats-section-label">Scoring Distribution</div>
        <div class="stacked-bar">${bar}</div>
        <div class="stacked-legend">${legend}</div>
      </div>
    `;
  },

  _recentRounds(profile, rounds) {
    const fmtLabel = { strokeplay: 'Strokeplay', stableford: 'Stableford', matchplay: 'Matchplay', scramble: 'Scramble', bestball: 'Best Ball' };
    const recent = rounds.slice().reverse().slice(0, 8);

    const rows = recent.map(r => {
      const club   = getClub(r.clubId);
      const course = getCourse(r.clubId, r.courseId);
      const date   = new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const pars   = getCoursePars(r.clubId, r.courseId, r.totalHoles);
      const totalPar = pars.reduce((a, b) => a + b, 0);
      const scores = r.scores[profile.id] || new Array(r.totalHoles).fill(null);
      const gross  = Scoring.totalGross(scores, pars);
      const diff   = gross - totalPar;
      const diffStr = diff === 0 ? 'E' : diff > 0 ? `+${diff}` : `${diff}`;
      const diffCls = diff < 0 ? 'under' : diff > 0 ? 'over' : '';
      return `
        <div class="recent-round-row card">
          <div class="recent-round-info">
            <div class="recent-round-course">${club ? club.name.split(' ')[0] : ''} ${course ? course.name : ''}</div>
            <div class="recent-round-date">${date} · <span class="format-badge format-${r.format}" style="font-size:10px">${fmtLabel[r.format] || r.format}</span></div>
          </div>
          <div class="recent-round-score ${diffCls}">${diffStr}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="stats-section">
        <div class="stats-section-label">Recent Rounds</div>
        ${rows}
      </div>
    `;
  },

  _handicapEvolution(profile) {
    const hist = (profile.handicapHistory || []).slice().reverse();
    if (hist.length < 2) {
      return `
        <div class="stats-section">
          <div class="stats-section-label">Handicap Evolution</div>
          <div class="card" style="text-align:center;padding:16px;color:var(--text-secondary);font-size:13px">
            Not enough data yet — update your handicap after each round
          </div>
        </div>
      `;
    }

    const rows = hist.map(entry => {
      const date = new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      return `
        <div class="hcp-history-row">
          <span class="hcp-history-date">${date}</span>
          <span class="hcp-history-value">${entry.value.toFixed(1)}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="stats-section">
        <div class="stats-section-label">Handicap Evolution</div>
        <div class="card" style="padding:0">
          ${rows}
        </div>
      </div>
    `;
  },

  _perCourse(profile, rounds) {
    const map = {};
    rounds.forEach(r => {
      const key    = `${r.clubId}::${r.courseId}`;
      const pars   = getCoursePars(r.clubId, r.courseId, r.totalHoles);
      const totalPar = pars.reduce((a, b) => a + b, 0);
      const scores = r.scores[profile.id] || new Array(r.totalHoles).fill(null);
      const gross  = Scoring.totalGross(scores, pars);
      if (!map[key]) {
        const club   = getClub(r.clubId);
        const course = getCourse(r.clubId, r.courseId);
        map[key] = {
          name:   `${club ? club.name.split(' ')[0] : ''} — ${course ? course.name : r.courseId}`,
          count:  0,
          total:  0
        };
      }
      map[key].count++;
      map[key].total += gross - totalPar;
    });

    const rows = Object.values(map).map(c => {
      const avg  = c.total / c.count;
      const avgStr = avg === 0 ? 'E' : avg > 0 ? `+${avg.toFixed(1)}` : `${avg.toFixed(1)}`;
      const cls  = avg < 0 ? 'under' : avg > 0 ? 'over' : '';
      return `
        <div class="course-stat-row card">
          <div class="course-stat-info">
            <div class="course-stat-name">${c.name}</div>
            <div class="course-stat-meta">${c.count} round${c.count > 1 ? 's' : ''}</div>
          </div>
          <div class="course-stat-avg ${cls}">${avgStr}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="stats-section">
        <div class="stats-section-label">Per Course</div>
        ${rows}
      </div>
    `;
  }
};
