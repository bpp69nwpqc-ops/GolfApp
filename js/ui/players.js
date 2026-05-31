const AVATAR_COLORS = ['#0F6E56', '#085041', '#BA7517', '#1565C0', '#C62828', '#5E35B1'];

const PlayersUI = {
  subView: 'list',
  editingPlayerId: null,

  render() {
    if (this.subView === 'add')  return this._renderAdd();
    if (this.subView === 'edit') return this._renderEdit();
    return this._renderList();
  },

  _renderList() {
    const players = Storage.getPlayers();
    return `
      <div class="players-screen">
        <header class="page-header">
          <div class="page-header-row">
            <h1 class="page-title">Friends</h1>
          </div>
        </header>
        <div class="content-body">
          ${players.length === 0 ? this._emptyState() : players.map(p => this._playerRow(p)).join('')}
          <div class="add-player-card card" data-action="players-add">+ Add Player</div>
        </div>
      </div>
    `;
  },

  _emptyState() {
    return `
      <div class="empty-state">
        <i class="ti ti-users empty-icon"></i>
        <p class="empty-title">No players yet</p>
        <p class="empty-sub">Add players to start tracking rounds</p>
      </div>
    `;
  },

  _playerRow(player) {
    const initials = player.name.split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2);
    const hcp = player.currentHandicap != null ? player.currentHandicap.toFixed(1) : '—';
    const updated = this._lastUpdated(player);
    return `
      <div class="card player-row" data-action="players-edit" data-player-id="${player.id}">
        <div class="player-avatar" style="background-color:${player.avatarColor}">${initials}</div>
        <div class="player-row-info">
          <div class="player-row-name">${player.name}</div>
          <div class="player-row-meta">HCP index · updated ${updated}</div>
        </div>
        <div class="player-row-hcp">${hcp}</div>
      </div>
    `;
  },

  _renderAdd() {
    return this._renderForm({ title: 'Add Player', saveAction: 'players-save', player: null });
  },

  _renderEdit() {
    const player = Storage.getPlayers().find(p => p.id === this.editingPlayerId);
    if (!player) { this.subView = 'list'; return this._renderList(); }
    return this._renderForm({ title: 'Edit Player', saveAction: 'players-update', player });
  },

  _renderForm({ title, saveAction, player }) {
    const selColor = player ? player.avatarColor : AVATAR_COLORS[0];
    return `
      <div class="players-screen">
        <header class="page-header">
          <div class="page-header-row">
            <button class="header-back" data-action="players-list"><i class="ti ti-arrow-left"></i></button>
            <h1 class="page-title">${title}</h1>
            <div style="width:28px"></div>
          </div>
        </header>
        <div class="form-body">
          <div class="form-group">
            <label class="form-label">Naam</label>
            <input id="player-name" type="text" class="form-input" placeholder="bijv. Jan De Smet"
                   value="${player ? this._esc(player.name) : ''}" autocomplete="off">
          </div>
          <div class="form-group">
            <label class="form-label">Bijnaam <span style="font-weight:400;color:var(--text-secondary)">(optioneel)</span></label>
            <input id="player-nickname" type="text" class="form-input" placeholder="bijv. Papa, Bro, Koen…"
                   value="${player && player.nickname ? this._esc(player.nickname) : ''}" autocomplete="off">
            <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">Wordt gebruikt op de scorecard in plaats van de volledige naam</div>
          </div>
          <div class="form-group">
            <label class="form-label">Handicap Index</label>
            <input id="player-hcp" type="number" class="form-input" placeholder="e.g. 12.4"
                   step="0.1" min="0" max="54"
                   value="${player && player.currentHandicap != null ? player.currentHandicap : ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Avatar Color</label>
            <div class="color-picker">
              ${AVATAR_COLORS.map(c => `
                <button type="button" class="color-swatch ${c === selColor ? 'selected' : ''}"
                        data-action="players-color" data-color="${c}"
                        style="background-color:${c}${c === '#FFFFFF' ? ';border:1.5px solid #ccc' : ''}"></button>
              `).join('')}
            </div>
          </div>
          ${player ? `<input type="hidden" id="edit-player-id" value="${player.id}">` : ''}
          <button type="button" class="btn-primary" data-action="${saveAction}" style="margin-top:8px">Save Player</button>
          ${player ? `<button type="button" class="btn-danger" data-action="players-delete" data-player-id="${player.id}">Remove Player</button>` : ''}
        </div>
      </div>
    `;
  },

  _lastUpdated(player) {
    if (!player.handicapHistory || !player.handicapHistory.length) return 'never';
    const last = player.handicapHistory[player.handicapHistory.length - 1];
    return new Date(last.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  },

  _selectedColor() {
    const el = document.querySelector('.color-swatch.selected');
    return el ? el.dataset.color : AVATAR_COLORS[0];
  },

  _esc(str) {
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;');
  },

  handleAction(action, target) {
    switch (action) {
      case 'players-add':
        this.subView = 'add';
        App.renderContent();
        break;

      case 'players-list':
        this.subView = 'list';
        App.renderContent();
        break;

      case 'players-color': {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        target.classList.add('selected');
        break;
      }

      case 'players-save': {
        const name     = (document.getElementById('player-name').value || '').trim();
        const nickname = (document.getElementById('player-nickname').value || '').trim() || null;
        const hcpStr   = document.getElementById('player-hcp').value;
        const hcp      = hcpStr !== '' ? parseFloat(hcpStr) : null;
        const color    = this._selectedColor();
        if (!name) { alert('Please enter a player name.'); return; }
        const player = {
          id: Storage.generateId(),
          name,
          nickname,
          avatarColor: color,
          currentHandicap: hcp,
          handicapHistory: hcp != null ? [{ date: new Date().toISOString().slice(0, 10), value: hcp }] : [],
          active: true
        };
        const players = Storage.getPlayers();
        players.push(player);
        Storage.savePlayers(players);
        this.subView = 'list';
        App.renderContent();
        break;
      }

      case 'players-edit':
        this.editingPlayerId = target.dataset.playerId;
        this.subView = 'edit';
        App.renderContent();
        break;

      case 'players-update': {
        const name     = (document.getElementById('player-name').value || '').trim();
        const nickname = (document.getElementById('player-nickname').value || '').trim() || null;
        const hcpStr   = document.getElementById('player-hcp').value;
        const hcp      = hcpStr !== '' ? parseFloat(hcpStr) : null;
        const color    = this._selectedColor();
        if (!name) { alert('Please enter a player name.'); return; }
        const players = Storage.getPlayers();
        const idx     = players.findIndex(p => p.id === this.editingPlayerId);
        if (idx >= 0) {
          const prev = players[idx];
          const hcpChanged = hcp != null && hcp !== prev.currentHandicap;
          players[idx] = {
            ...prev,
            name,
            nickname,
            avatarColor: color,
            currentHandicap: hcp,
            handicapHistory: hcpChanged
              ? [...(prev.handicapHistory || []), { date: new Date().toISOString().slice(0, 10), value: hcp }]
              : (prev.handicapHistory || [])
          };
          Storage.savePlayers(players);
        }
        this.subView = 'list';
        App.renderContent();
        break;
      }

      case 'players-delete': {
        if (!confirm('Remove this player?')) return;
        const remaining = Storage.getPlayers().filter(p => p.id !== target.dataset.playerId);
        Storage.savePlayers(remaining);
        this.subView = 'list';
        App.renderContent();
        break;
      }
    }
  }
};
