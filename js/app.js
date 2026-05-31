const AppState = {
  activeTab:   'home',
  profileOpen: false,
  prevTab:     'home'
};

const App = {
  init() {
    const activeRound = Storage.getActiveRound();
    if (activeRound) {
      LiveRoundUI.subView = 'scorecard';
    }
    this._attachListeners();
    this.renderContent();
  },

  renderContent() {
    let html = '';
    if (AppState.profileOpen) {
      html = ProfileUI.render();
    } else {
      switch (AppState.activeTab) {
        case 'home':    html = HomeUI.render();     break;
        case 'history': html = HistoryUI.render();  break;
        case 'players': html = PlayersUI.render();  break;
        case 'stats':   html = StatsUI.render();    break;
        case 'live':    html = LiveRoundUI.render(); break;
      }
    }
    document.getElementById('content').innerHTML = html;
    this._updateNav();
  },

  navigateTo(tab) {
    AppState.activeTab = tab;
    this.renderContent();
  },

  _updateNav() {
    const hasActiveRound = !!Storage.getActiveRound();
    document.querySelectorAll('.nav-tab').forEach(btn => {
      const isActive = !AppState.profileOpen && btn.dataset.tab === AppState.activeTab;
      btn.classList.toggle('active', isActive);
      const existing = btn.querySelector('.live-dot');
      if (btn.dataset.tab === 'live') {
        if (hasActiveRound && !existing) {
          const dot = document.createElement('span');
          dot.className = 'live-dot';
          btn.appendChild(dot);
        } else if (!hasActiveRound && existing) {
          existing.remove();
        }
      }
    });
  },

  _attachListeners() {
    document.getElementById('bottom-nav').addEventListener('click', e => {
      const tab = e.target.closest('[data-tab]');
      if (!tab) return;
      const tabName = tab.dataset.tab;
      if (tabName === 'live') {
        const activeRound = Storage.getActiveRound();
        if (activeRound && LiveRoundUI.subView === 'setup') {
          LiveRoundUI.subView = 'scorecard';
        }
      }
      AppState.profileOpen = false;
      AppState.activeTab   = tabName;
      this.renderContent();
    });

    document.getElementById('content').addEventListener('click', e => {
      const actionEl = e.target.closest('[data-action]');
      if (!actionEl || actionEl.disabled) return;
      const action = actionEl.dataset.action;
      this._dispatch(action, actionEl);
    });
  },

  _dispatch(action, target) {
    // Profile
    if (action === 'open-profile') {
      AppState.prevTab     = AppState.activeTab;
      AppState.profileOpen = true;
      this.renderContent();
      return;
    }
    if (action === 'profile-close' || action === 'profile-save' || action === 'profile-color') {
      ProfileUI.handleAction(action, target);
      return;
    }

    // Home
    if (action === 'start-new-round') {
      LiveRoundUI.resetSetup();
      this.navigateTo('live');
      return;
    }

    // History
    if (action === 'view-round' || action === 'history-back' || action === 'history-delete') {
      HistoryUI.handleAction(action, target);
      return;
    }

    // Friends (Players)
    if (action.startsWith('players-')) {
      PlayersUI.handleAction(action, target);
      return;
    }

    // Setup flow
    if (action.startsWith('setup-') || action === 'start-round' || action === 'go-to-players') {
      LiveRoundUI.handleSetupAction(action, target);
      return;
    }

    // Score +/−
    if (action === 'score-inc' || action === 'score-dec') {
      LiveRoundUI.handleScoreAction(action, target);
      return;
    }

    // Round navigation + finish/save + meters cycling
    if (['next-hole', 'prev-hole', 'finish-round', 'save-round', 'discard-round', 'cycle-meters'].includes(action)) {
      LiveRoundUI.handleRoundAction(action, target);
      return;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
