/* ─── Constants ─── */
const TEE_COLORS = {
  black:  '#1A1A1A',
  white:  '#FFFFFF',
  yellow: '#F5C518',
  blue:   '#1565C0',
  red:    '#C62828',
  orange: '#E65100'
};

const FORMAT_INFO = {
  strokeplay: { name: 'Strokeplay', desc: 'Lowest strokes wins' },
  stableford: { name: 'Stableford', desc: 'Points system' },
  matchplay:  { name: 'Matchplay',  desc: 'Hole by hole' },
  scramble:   { name: 'Scramble',   desc: 'Best shot (teams)' },
  bestball:   { name: 'Best Ball',  desc: 'Best score (teams)' }
};

const TEAM_FORMATS = ['matchplay', 'scramble', 'bestball'];

/* ─── Shared transposed scorecard table builder ─── */
function buildScorecardTable(round, players, pars, scoreTotals, winnerId) {
  const isSf  = round.format === 'stableford';
  const total = round.totalHoles;
  const is18  = total === 18;

  const playerHeaders = players.map(p => {
    const isWin = p.id === winnerId;
    return `<th class="col-player">
      <span class="player-th-name${isWin ? ' is-winner' : ''}">${p.name}</span>
    </th>`;
  }).join('');

  const scoreCell = (pid, hi) => {
    const par = pars[hi];
    const raw = (round.scores[pid] || [])[hi];
    const val = (raw !== null && raw !== undefined) ? raw : par;
    if (isSf) {
      const pts = Scoring.getStablefordPoints(val - par);
      const cls = pts >= 3 ? ' under' : pts <= 1 ? ' over' : '';
      return `<td class="cell-s${cls}">${pts}</td>`;
    }
    const diff = val - par;
    const cls  = diff < 0 ? ' under' : diff > 0 ? ' over' : '';
    return `<td class="cell-s${cls}">${val}</td>`;
  };

  const holeRow = i => {
    const hi = i - 1;
    return `<tr>
      <td class="cell-h">${i}</td>
      <td class="cell-p">${pars[hi]}</td>
      ${players.map(p => scoreCell(p.id, hi)).join('')}
    </tr>`;
  };

  const subRow = (label, from, to) => {
    const subPar = pars.slice(from - 1, to).reduce((a, b) => a + b, 0);
    const cells  = players.map(p => {
      const slice  = (round.scores[p.id] || []).slice(from - 1, to);
      const pSlice = pars.slice(from - 1, to);
      const val    = isSf ? Scoring.totalStableford(slice, pSlice) : Scoring.totalGross(slice, pSlice);
      return `<td class="cell-s">${isSf ? val + 'pt' : val}</td>`;
    }).join('');
    return `<tr class="row-sub">
      <td class="cell-h">${label}</td>
      <td class="cell-p">${subPar}</td>
      ${cells}
    </tr>`;
  };

  let rows = '';
  if (is18) {
    for (let i = 1;  i <= 9;  i++) rows += holeRow(i);
    rows += subRow('OUT', 1, 9);
    for (let i = 10; i <= 18; i++) rows += holeRow(i);
    rows += subRow('IN', 10, 18);
  } else {
    for (let i = 1; i <= total; i++) rows += holeRow(i);
  }

  const totPar   = pars.reduce((a, b) => a + b, 0);
  const totCells = players.map(p => {
    const isWin = p.id === winnerId;
    const val   = scoreTotals[p.id];
    return `<td class="cell-s${isWin ? ' cell-winner' : ''}">${isSf ? val + 'pt' : val}</td>`;
  }).join('');

  return `
    <div class="st-outer">
      <table class="scorecard-table-v">
        <thead>
          <tr>
            <th class="col-label">Hole</th>
            <th class="col-label">Par</th>
            ${playerHeaders}
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr class="row-tot">
            <td class="cell-h">TOT</td>
            <td class="cell-p">${totPar}</td>
            ${totCells}
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

/* ─── LiveRoundUI ─── */
const LiveRoundUI = {
  setup: {
    step: 1,
    clubId: null,
    courseId: null,
    totalHoles: 9,
    playedTwice: false,
    tee: null,
    format: null,
    playerIds: [],
    teams: { a: [], b: [] }
  },

  subView: 'setup', // 'setup' | 'scorecard' | 'summary'

  resetSetup() {
    const profile = Storage.getProfile();
    this.setup = { step: 1, clubId: null, courseId: null, totalHoles: 9, playedTwice: false, tee: null, format: null, playerIds: profile ? [profile.id] : [], teams: { a: [], b: [] } };
    this.subView = 'setup';
  },

  /* ─── Main render router ─── */
  render() {
    const activeRound = Storage.getActiveRound();
    if (!activeRound) {
      this.subView = 'setup';
      return this._renderSetupStep();
    }
    if (this.subView === 'summary') return this._renderSummary(activeRound);
    this.subView = 'scorecard';
    return this._renderScorecard(activeRound);
  },

  /* ════════════════════════════════════════
     SETUP FLOW
  ════════════════════════════════════════ */
  _renderSetupStep() {
    switch (this.setup.step) {
      case 1: return this._renderStep1();
      case 2: return this._renderStep2();
      case 3: return this._renderStep3();
      case 4: return this._renderStep4();
      case 5: return this._renderStep5();
      case 6: return this._renderStep6();
      default: return this._renderStep1();
    }
  },

  _summaryBar() {
    const s = this.setup;
    const parts = [];
    if (s.clubId) {
      const club = getClub(s.clubId);
      parts.push(`<span class="summary-chip">${club ? club.name.replace('Golf & Country Club', 'G&CC') : s.clubId}</span>`);
    }
    if (s.courseId) {
      const course = getCourse(s.clubId, s.courseId);
      parts.push(`<span class="summary-sep">·</span>`);
      parts.push(`<span class="summary-chip">${course ? course.name : s.courseId} · ${s.totalHoles}h</span>`);
    }
    if (s.tee) {
      const tc = TEE_COLORS[s.tee] || '#888';
      const border = s.tee === 'white' ? 'border:1px solid rgba(255,255,255,0.5);' : '';
      parts.push(`<span class="summary-sep">·</span>`);
      parts.push(`<span class="summary-chip"><span class="summary-tee-dot" style="background:${tc};${border}"></span>${s.tee.charAt(0).toUpperCase() + s.tee.slice(1)}</span>`);
    }
    if (s.format) {
      parts.push(`<span class="summary-sep">·</span>`);
      parts.push(`<span class="summary-chip">${FORMAT_INFO[s.format].name}</span>`);
    }
    return parts.length ? `<div class="summary-bar">${parts.join('')}</div>` : '';
  },

  /* Step 1 — Select Club */
  _renderStep1() {
    return `
      <div class="setup-screen">
        <div class="setup-step-header">
          <div class="setup-step-top">
            <span class="setup-step-title">Select Club</span>
          </div>
          <div class="setup-step-subtitle">Choose your golf club</div>
        </div>
        <div class="setup-content">
          ${COURSES.map(club => `
            <div class="club-item ${this.setup.clubId === club.id ? 'selected' : ''}"
                 data-action="setup-select-club" data-club-id="${club.id}">
              <div class="club-item-info">
                <div class="club-item-name">${club.name}</div>
                <div class="club-item-region">${club.region}</div>
              </div>
              <div class="radio-circle ${this.setup.clubId === club.id ? 'checked' : ''}"></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /* Step 2 — Course + Holes */
  _renderStep2() {
    const club = getClub(this.setup.clubId);
    if (!club) return this._renderStep1();
    const canContinue = !!this.setup.courseId;
    return `
      <div class="setup-screen">
        <div class="setup-step-header">
          <div class="setup-step-top">
            <button class="header-back" data-action="setup-back"><i class="ti ti-arrow-left"></i></button>
            <span class="setup-step-title">Course &amp; Holes</span>
          </div>
          <div class="setup-step-subtitle">Select course and round length</div>
        </div>
        ${this._summaryBar()}
        <div class="setup-content">
          ${club.courses.map(c => `
            <div class="course-option ${this.setup.courseId === c.id ? 'selected' : ''}"
                 data-action="setup-select-course" data-course-id="${c.id}">
              <div class="course-option-name">${c.name}</div>
              <div class="course-option-meta">${c.holes} holes · Par ${c.par}</div>
            </div>
          `).join('')}
          <div class="setup-section-label">Number of holes</div>
          <div class="holes-toggle">
            <button class="holes-btn ${this.setup.totalHoles === 9 ? 'active' : ''}"
                    data-action="setup-holes" data-holes="9">9 holes</button>
            <button class="holes-btn ${this.setup.totalHoles === 18 ? 'active' : ''}"
                    data-action="setup-holes" data-holes="18">18 holes</button>
          </div>
          ${(() => {
            if (this.setup.totalHoles !== 18 || !this.setup.courseId) return '';
            const c = getCourse(this.setup.clubId, this.setup.courseId);
            return (c && c.holes === 9) ? `<div style="font-size:12px;color:var(--text-secondary);text-align:center;padding:4px 0;">Playing ${c.name} twice — SI values adjust for second pass</div>` : '';
          })()}
        </div>
        <div class="setup-footer">
          <button class="btn-primary" data-action="setup-continue" ${!canContinue ? 'disabled' : ''}>Continue</button>
        </div>
      </div>
    `;
  },

  /* Step 3 — Tee Color */
  _renderStep3() {
    const course = getCourse(this.setup.clubId, this.setup.courseId);
    if (!course) return this._renderStep2();
    return `
      <div class="setup-screen">
        <div class="setup-step-header">
          <div class="setup-step-top">
            <button class="header-back" data-action="setup-back"><i class="ti ti-arrow-left"></i></button>
            <span class="setup-step-title">Select Tee</span>
          </div>
          <div class="setup-step-subtitle">Choose your tee color</div>
        </div>
        ${this._summaryBar()}
        <div class="setup-content">
          <div class="tee-chips-grid">
            ${course.tees.map(tee => {
              const tc = TEE_COLORS[tee] || '#888';
              const isWhite = tee === 'white';
              return `
                <div class="tee-chip-item ${this.setup.tee === tee ? 'selected' : ''}"
                     data-action="setup-select-tee" data-tee="${tee}">
                  <div class="tee-circle ${isWhite ? 'white-tee' : ''}" style="background-color:${tc}"></div>
                  <span class="tee-chip-label">${tee.charAt(0).toUpperCase() + tee.slice(1)}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  },

  /* Step 4 — Format */
  _renderStep4() {
    return `
      <div class="setup-screen">
        <div class="setup-step-header">
          <div class="setup-step-top">
            <button class="header-back" data-action="setup-back"><i class="ti ti-arrow-left"></i></button>
            <span class="setup-step-title">Select Format</span>
          </div>
          <div class="setup-step-subtitle">How do you want to play?</div>
        </div>
        ${this._summaryBar()}
        <div class="setup-content">
          <div class="format-grid">
            ${Object.entries(FORMAT_INFO).map(([key, info]) => `
              <div class="format-card ${this.setup.format === key ? 'selected' : ''}"
                   data-action="setup-select-format" data-format="${key}">
                <div class="format-card-name">${info.name}</div>
                <div class="format-card-desc">${info.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  /* Step 5 — Players */
  _renderStep5() {
    const profile  = Storage.getProfile();
    const friends  = Storage.getPlayers();
    const selected = this.setup.playerIds;
    const isTeam   = TEAM_FORMATS.includes(this.setup.format);
    const canStart = selected.length >= 1;

    const renderPlayer = (p, isMe) => {
      const initials   = p.name.split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2);
      const isSelected = selected.includes(p.id);
      const disabled   = !isSelected && selected.length >= 4;
      return `
        <div class="player-check-row ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}"
             data-action="setup-toggle-player" data-player-id="${p.id}">
          <div class="player-avatar-sm" style="background-color:${p.avatarColor}">${initials}</div>
          <div class="player-check-info">
            <div class="player-check-name">
              ${p.name}${isMe ? '<span class="me-tag">Me</span>' : ''}
            </div>
            <div class="player-check-hcp">HCP ${p.currentHandicap != null ? p.currentHandicap.toFixed(1) : '—'}</div>
          </div>
          <div class="check-circle ${isSelected ? 'checked' : ''}"></div>
        </div>
      `;
    };

    const hasAnyPlayer = profile || friends.length > 0;

    return `
      <div class="setup-screen">
        <div class="setup-step-header">
          <div class="setup-step-top">
            <button class="header-back" data-action="setup-back"><i class="ti ti-arrow-left"></i></button>
            <span class="setup-step-title">Select Players</span>
          </div>
          <div class="setup-step-subtitle">Up to 4 players</div>
        </div>
        ${this._summaryBar()}
        <div class="setup-content">
          ${!hasAnyPlayer
            ? `<div class="card" style="text-align:center;padding:24px 16px;">
                 <div style="font-size:14px;color:var(--text-secondary);margin-bottom:12px;">No players found.</div>
                 <button class="btn-secondary" data-action="go-to-players">Go to Friends tab to add</button>
               </div>`
            : `${profile ? renderPlayer(profile, true) : ''}
               ${friends.map(p => renderPlayer(p, false)).join('')}`
          }
        </div>
        <div class="setup-footer">
          ${isTeam
            ? `<button class="btn-primary" data-action="setup-continue" ${!canStart ? 'disabled' : ''}>Continue to Teams</button>`
            : `<button class="btn-primary" data-action="start-round" ${!canStart ? 'disabled' : ''}>Start Round</button>`
          }
        </div>
      </div>
    `;
  },

  /* Step 6 — Team Assignment (team formats only) */
  _renderStep6() {
    const players = getAllPlayers().filter(p => this.setup.playerIds.includes(p.id));
    const teams   = this.setup.teams;
    const unassigned = players.filter(p => !teams.a.includes(p.id) && !teams.b.includes(p.id));
    const renderTeamCol = (teamKey, label) => {
      const members = players.filter(p => teams[teamKey].includes(p.id));
      return `
        <div class="team-col">
          <div class="team-col-header">${label}</div>
          ${members.map(p => {
            const initials = p.name.split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2);
            return `
              <div class="team-player-chip" data-action="setup-team-move" data-player-id="${p.id}" data-from="${teamKey}">
                <div class="player-avatar-sm" style="background-color:${p.avatarColor};width:24px;height:24px;font-size:10px;">${initials}</div>
                ${p.name.split(' ')[0]}
              </div>
            `;
          }).join('')}
        </div>
      `;
    };
    return `
      <div class="setup-screen">
        <div class="setup-step-header">
          <div class="setup-step-top">
            <button class="header-back" data-action="setup-back"><i class="ti ti-arrow-left"></i></button>
            <span class="setup-step-title">Assign Teams</span>
          </div>
          <div class="setup-step-subtitle">Tap a player to move between teams</div>
        </div>
        ${this._summaryBar()}
        <div class="setup-content">
          ${unassigned.length ? `
            <div class="team-unassigned">
              <div class="team-unassigned-label">Unassigned</div>
              ${unassigned.map(p => {
                const initials = p.name.split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2);
                return `
                  <span class="unassigned-chip" data-action="setup-team-assign" data-player-id="${p.id}" data-to="a">
                    <div class="player-avatar-sm" style="background-color:${p.avatarColor};width:24px;height:24px;font-size:10px;">${initials}</div>
                    ${p.name.split(' ')[0]}
                  </span>
                `;
              }).join('')}
              <div style="font-size:11px;color:var(--text-secondary);margin-top:6px;">Tap to assign to Team A; assigned players can be moved</div>
            </div>
          ` : ''}
          <div class="team-columns">
            ${renderTeamCol('a', 'Team A')}
            ${renderTeamCol('b', 'Team B')}
          </div>
        </div>
        <div class="setup-footer">
          <button class="btn-primary" data-action="start-round" ${unassigned.length ? 'disabled' : ''}>Start Round</button>
        </div>
      </div>
    `;
  },

  /* ════════════════════════════════════════
     LIVE SCORECARD
  ════════════════════════════════════════ */
  _renderScorecard(round) {
    const holeNum  = round.currentHole || 1;
    const holeInfo = getHoleData(round.clubId, round.courseId, holeNum, round.playedTwice, round.tee);
    if (!holeInfo) return `<div class="empty-state"><p class="empty-title">Course data error</p></div>`;

    const players  = getAllPlayers().filter(p => round.playerIds.includes(p.id));
    const course   = getCourse(round.clubId, round.courseId);
    const club     = getClub(round.clubId);
    const fmtInfo  = FORMAT_INFO[round.format] || { name: round.format };
    const isLast   = holeNum === round.totalHoles;

    // Ensure scores exist for this hole (default to par)
    round.playerIds.forEach(id => {
      if (!round.scores[id]) round.scores[id] = new Array(round.totalHoles).fill(null);
      if (round.scores[id][holeNum - 1] === null) {
        round.scores[id][holeNum - 1] = holeInfo.par;
        Storage.saveActiveRound(round);
      }
    });

    return `
      <div class="scorecard-screen">
        <div class="scorecard-header">
          <div class="scorecard-header-top">
            <span class="scorecard-course-name">${club ? club.name.split(' ')[0] + ' G&CC' : ''} · ${course ? course.name : ''}</span>
            <span class="scorecard-format-badge">${fmtInfo.name}</span>
          </div>
          <div class="scorecard-hole-title">Hole ${holeNum} of ${round.totalHoles}</div>
          <div class="hole-info-bar">
            <div class="hole-info-item">
              <span class="hole-info-label">Par</span>
              <span class="hole-info-value">${holeInfo.par}</span>
            </div>
            <div class="hole-info-item">
              <span class="hole-info-label">Meters</span>
              <span class="hole-info-value">${holeInfo.meters}</span>
            </div>
            <div class="hole-info-item">
              <span class="hole-info-label">SI</span>
              <span class="hole-info-value">${holeInfo.si}</span>
            </div>
          </div>
        </div>

        <div class="players-area">
          ${players.map(p => this._playerCard(p, round, holeNum, holeInfo.par)).join('')}
        </div>

        <div class="scorecard-footer">
          ${this._holeProgress(round.totalHoles, holeNum)}
          <div class="scorecard-nav">
            <button class="nav-btn-prev" data-action="prev-hole" ${holeNum === 1 ? 'disabled' : ''}>
              <i class="ti ti-arrow-left" style="font-size:16px"></i> Prev
            </button>
            ${isLast
              ? `<button class="nav-btn-finish" data-action="finish-round">Finish Round ✓</button>`
              : `<button class="nav-btn-next" data-action="next-hole">
                   Next <i class="ti ti-arrow-right" style="font-size:16px"></i>
                 </button>`
            }
          </div>
        </div>
      </div>
    `;
  },

  _playerCard(player, round, holeNum, par) {
    const initials = player.name.split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2);
    const score    = round.scores[player.id] ? round.scores[player.id][holeNum - 1] : par;
    const dispScore = score !== null ? score : par;
    const badge    = Scoring.getScoreBadge(dispScore, par);
    return `
      <div class="player-scorecard-card" id="player-card-${player.id}">
        <div class="player-card-top">
          <div class="player-card-left">
            <div class="player-avatar-sm" style="background-color:${player.avatarColor}">${initials}</div>
            <div>
              <div class="player-name-text">${player.name}</div>
              <div class="player-hcp-text">${player.currentHandicap != null ? 'HCP ' + player.currentHandicap.toFixed(1) : ''}</div>
            </div>
          </div>
          <div class="score-badge" id="badge-${player.id}"
               style="background:${badge.bg};color:${badge.color}">${badge.label}</div>
        </div>
        <div class="score-input-row">
          <button class="score-btn" data-action="score-dec" data-player-id="${player.id}">−</button>
          <span class="score-display" id="score-${player.id}">${dispScore}</span>
          <button class="score-btn" data-action="score-inc" data-player-id="${player.id}">+</button>
        </div>
      </div>
    `;
  },

  _holeProgress(totalHoles, currentHole) {
    const dots = Array.from({ length: totalHoles }, (_, i) => {
      const n = i + 1;
      if (n < currentHole)  return `<span class="dot dot-done"></span>`;
      if (n === currentHole) return `<span class="dot dot-current"></span>`;
      return `<span class="dot dot-remaining"></span>`;
    }).join('');
    return `<div class="hole-progress">${dots}</div>`;
  },

  /* ════════════════════════════════════════
     SUMMARY / FINISH SCREEN
  ════════════════════════════════════════ */
  _renderSummary(round) {
    const players  = getAllPlayers().filter(p => round.playerIds.includes(p.id));
    const course   = getCourse(round.clubId, round.courseId);
    const club     = getClub(round.clubId);
    const pars     = getCoursePars(round.clubId, round.courseId, round.totalHoles);
    const winnerId = Scoring.determineWinner(round, players, course?.holeData || []);
    const winner   = winnerId ? players.find(p => p.id === winnerId) : null;
    const fmtInfo  = FORMAT_INFO[round.format] || { name: round.format };

    const scoreTotals = {};
    players.forEach(p => {
      const scores = round.scores[p.id] || new Array(round.totalHoles).fill(null);
      scoreTotals[p.id] = round.format === 'stableford'
        ? Scoring.totalStableford(scores, pars)
        : Scoring.totalGross(scores, pars);
    });

    const winnerDetail = winner
      ? (round.format === 'stableford' ? `${scoreTotals[winner.id]} pts` : `${scoreTotals[winner.id]} strokes`)
      : '';

    return `
      <div class="summary-screen">
        <div class="summary-header">
          <div class="summary-header-title">Round Complete</div>
          <div class="summary-header-sub">${club ? club.name : ''} · ${course ? course.name : ''} · ${round.totalHoles} holes</div>
        </div>

        ${winner ? `
          <div class="winner-banner">
            <div class="winner-trophy">🏆</div>
            <div>
              <div class="winner-label">Winner</div>
              <div class="winner-name">${winner.name}</div>
              <div class="winner-detail">${winnerDetail} · ${fmtInfo.name}</div>
            </div>
          </div>
        ` : `
          <div style="padding:16px 16px 0;">
            <div class="card" style="text-align:center;padding:14px;">
              <span style="font-size:13px;color:var(--text-secondary)">${fmtInfo.name} · ${round.totalHoles} holes</span>
            </div>
          </div>
        `}

        <div style="padding:16px">
          ${buildScorecardTable(round, players, pars, scoreTotals, winnerId)}
        </div>

        <div class="summary-actions">
          <button class="btn-primary" data-action="save-round">Save Round</button>
          <button class="btn-secondary" data-action="discard-round">Discard Round</button>
        </div>
      </div>
    `;
  },

  /* ════════════════════════════════════════
     ACTION HANDLERS
  ════════════════════════════════════════ */
  handleSetupAction(action, target) {
    const s = this.setup;
    switch (action) {
      case 'setup-back':
        if (s.step > 1) { s.step--; App.renderContent(); }
        break;

      case 'setup-select-club': {
        const id = target.dataset.clubId;
        if (id !== s.clubId) {
          s.clubId = id; s.courseId = null; s.tee = null; s.format = null; s.playerIds = [];
        }
        s.step = 2;
        App.renderContent();
        break;
      }

      case 'setup-select-course': {
        const id = target.dataset.courseId;
        if (id !== s.courseId) {
          s.courseId = id; s.tee = null; s.format = null; s.playerIds = [];
          // Default holes based on course
          const c = getCourse(s.clubId, id);
          if (c) { s.totalHoles = c.holes; s.playedTwice = false; }
        }
        App.renderContent();
        break;
      }

      case 'setup-holes': {
        const holes = parseInt(target.dataset.holes);
        s.totalHoles  = holes;
        const c = getCourse(s.clubId, s.courseId);
        s.playedTwice = !!(c && c.holes === 9 && holes === 18);
        App.renderContent();
        break;
      }

      case 'setup-continue':
        if (target.disabled) return;
        s.step++;
        App.renderContent();
        break;

      case 'setup-select-tee': {
        const tee = target.dataset.tee;
        if (tee !== s.tee) { s.tee = tee; s.format = null; s.playerIds = []; }
        s.step = 4;
        App.renderContent();
        break;
      }

      case 'setup-select-format': {
        const fmt = target.dataset.format;
        if (fmt !== s.format) {
          const profile = Storage.getProfile();
          s.format    = fmt;
          s.playerIds = profile ? [profile.id] : [];
        }
        s.step = 5;
        App.renderContent();
        break;
      }

      case 'setup-toggle-player': {
        const pid = target.closest('[data-player-id]').dataset.playerId;
        const idx = s.playerIds.indexOf(pid);
        if (idx >= 0) {
          s.playerIds.splice(idx, 1);
        } else if (s.playerIds.length < 4) {
          s.playerIds.push(pid);
        }
        App.renderContent();
        break;
      }

      case 'setup-team-assign': {
        const pid = target.dataset.playerId;
        const to  = target.dataset.to;
        if (!s.teams.a.includes(pid) && !s.teams.b.includes(pid)) {
          s.teams[to].push(pid);
          App.renderContent();
        }
        break;
      }

      case 'setup-team-move': {
        const pid  = target.dataset.playerId;
        const from = target.dataset.from;
        const to   = from === 'a' ? 'b' : 'a';
        s.teams[from] = s.teams[from].filter(id => id !== pid);
        s.teams[to].push(pid);
        App.renderContent();
        break;
      }

      case 'go-to-players':
        App.navigateTo('players');
        break;

      case 'start-round':
        if (target.disabled) return;
        this._startRound();
        break;
    }
  },

  _startRound() {
    const s = this.setup;
    const course = getCourse(s.clubId, s.courseId);
    if (!course || !s.tee || !s.format || s.playerIds.length === 0) return;

    const scores = {};
    s.playerIds.forEach(id => { scores[id] = new Array(s.totalHoles).fill(null); });

    const round = {
      id: Storage.generateId(),
      date: new Date().toISOString(),
      clubId:      s.clubId,
      courseId:    s.courseId,
      tee:         s.tee,
      totalHoles:  s.totalHoles,
      playedTwice: s.playedTwice,
      format:      s.format,
      playerIds:   [...s.playerIds],
      teams:       TEAM_FORMATS.includes(s.format) ? { a: [...s.teams.a], b: [...s.teams.b] } : null,
      scores,
      currentHole: 1,
      completed:   false
    };

    Storage.saveActiveRound(round);
    this.subView = 'scorecard';
    App.renderContent();
  },

  /* Score +/− (DOM-only update, no re-render) */
  handleScoreAction(action, target) {
    const playerId = target.dataset.playerId;
    const round    = Storage.getActiveRound();
    if (!round) return;

    const holeNum  = round.currentHole || 1;
    const holeInfo = getHoleData(round.clubId, round.courseId, holeNum, round.playedTwice, round.tee);
    if (!holeInfo) return;

    let current = round.scores[playerId] ? round.scores[playerId][holeNum - 1] : null;
    if (current === null) current = holeInfo.par;

    const newScore = action === 'score-inc'
      ? Math.min(current + 1, 15)
      : Math.max(current - 1, 1);

    if (!round.scores[playerId]) round.scores[playerId] = new Array(round.totalHoles).fill(null);
    round.scores[playerId][holeNum - 1] = newScore;
    Storage.saveActiveRound(round);

    // Update DOM directly
    const scoreEl = document.getElementById(`score-${playerId}`);
    const badgeEl = document.getElementById(`badge-${playerId}`);
    if (scoreEl) scoreEl.textContent = newScore;
    if (badgeEl) {
      const badge = Scoring.getScoreBadge(newScore, holeInfo.par);
      badgeEl.textContent        = badge.label;
      badgeEl.style.background   = badge.bg;
      badgeEl.style.color        = badge.color;
    }
  },

  /* Hole navigation + finish/save */
  handleRoundAction(action, target) {
    if (target && target.disabled) return;
    const round = Storage.getActiveRound();
    if (!round) return;

    switch (action) {
      case 'next-hole':
        if (round.currentHole < round.totalHoles) {
          round.currentHole++;
          Storage.saveActiveRound(round);
          App.renderContent();
        }
        break;

      case 'prev-hole':
        if (round.currentHole > 1) {
          round.currentHole--;
          Storage.saveActiveRound(round);
          App.renderContent();
        }
        break;

      case 'finish-round':
        round.completed = true;
        Storage.saveActiveRound(round);
        this.subView = 'summary';
        App.renderContent();
        break;

      case 'save-round': {
        const rounds = Storage.getRounds();
        // Determine winner before saving
        const courseData = getCourse(round.clubId, round.courseId);
        const allP = getAllPlayers().filter(p => round.playerIds.includes(p.id));
        round.winner = courseData
          ? Scoring.determineWinner(round, allP, courseData.holeData)
          : null;
        rounds.push(round);
        Storage.saveRounds(rounds);
        Storage.clearActiveRound();
        this.resetSetup();
        App.navigateTo('history');
        break;
      }

      case 'discard-round':
        if (confirm('Discard this round? All scores will be lost.')) {
          Storage.clearActiveRound();
          this.resetSetup();
          App.navigateTo('home');
        }
        break;
    }
  }
};
