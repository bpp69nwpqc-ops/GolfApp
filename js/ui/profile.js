/* ─── Global helper: profile button for page headers ─── */
function profileHeaderBtn() {
  const p = Storage.getProfile();
  if (!p) {
    return `<button class="profile-hdr-btn" data-action="open-profile">
      <div class="profile-hdr-avatar empty"><i class="ti ti-user"></i></div>
    </button>`;
  }
  const initials = p.name.split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2);
  return `<button class="profile-hdr-btn" data-action="open-profile">
    <div class="profile-hdr-avatar" style="background-color:${p.avatarColor}">${initials}</div>
  </button>`;
}

/* ─── ProfileUI ─── */
const PROFILE_COLORS = ['#0F6E56', '#085041', '#BA7517', '#1565C0', '#C62828', '#5E35B1'];

const ProfileUI = {
  render() {
    const p       = Storage.getProfile();
    const selColor = p ? p.avatarColor : PROFILE_COLORS[0];
    const initials = p ? p.name.split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2) : '';

    return `
      <div class="profile-screen">
        <header class="page-header">
          <div class="page-header-row">
            <div style="width:32px"></div>
            <h1 class="page-title">${p ? 'My Profile' : 'Set Up Profile'}</h1>
            <button class="profile-close-btn" data-action="profile-close">
              <i class="ti ti-x"></i>
            </button>
          </div>
        </header>

        <div class="form-body">
          <div style="display:flex;justify-content:center;margin-bottom:4px">
            <div class="profile-avatar-lg" id="profile-avatar-preview" style="background-color:${selColor}">
              ${initials || '<i class="ti ti-user" style="font-size:28px;color:rgba(255,255,255,0.75)"></i>'}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Your Name</label>
            <input id="profile-name" type="text" class="form-input" placeholder="Your name"
                   value="${p ? this._esc(p.name) : ''}" autocomplete="off">
          </div>
          <div class="form-group">
            <label class="form-label">Handicap Index</label>
            <input id="profile-hcp" type="number" class="form-input" placeholder="e.g. 12.4"
                   step="0.1" min="0" max="54"
                   value="${p && p.currentHandicap != null ? p.currentHandicap : ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Avatar Color</label>
            <div class="color-picker">
              ${PROFILE_COLORS.map(c => `
                <button type="button" class="color-swatch ${c === selColor ? 'selected' : ''}"
                        data-action="profile-color" data-color="${c}"
                        style="background-color:${c}"></button>
              `).join('')}
            </div>
          </div>

          <button type="button" class="btn-primary" data-action="profile-save" style="margin-top:8px">
            Save Profile
          </button>
        </div>
      </div>
    `;
  },

  _esc(str) {
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;');
  },

  _selectedColor() {
    const el = document.querySelector('.color-swatch.selected');
    return el ? el.dataset.color : PROFILE_COLORS[0];
  },

  handleAction(action, target) {
    if (action === 'profile-close') {
      AppState.profileOpen = false;
      AppState.activeTab   = AppState.prevTab || 'home';
      App.renderContent();
      return;
    }

    if (action === 'profile-color') {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      target.classList.add('selected');
      const preview = document.getElementById('profile-avatar-preview');
      if (preview) {
        preview.style.backgroundColor = target.dataset.color;
        const nameEl = document.getElementById('profile-name');
        if (nameEl) {
          const name = nameEl.value.trim();
          const initials = name.split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2);
          preview.innerHTML = initials || '<i class="ti ti-user" style="font-size:28px;color:rgba(255,255,255,0.75)"></i>';
        }
      }
      return;
    }

    if (action === 'profile-save') {
      const name   = (document.getElementById('profile-name').value || '').trim();
      const hcpStr = document.getElementById('profile-hcp').value;
      const hcp    = hcpStr !== '' ? parseFloat(hcpStr) : null;
      const color  = this._selectedColor();
      if (!name) { alert('Please enter your name.'); return; }

      const existing   = Storage.getProfile();
      const hcpChanged = hcp != null && (!existing || hcp !== existing.currentHandicap);
      const profile    = {
        id:               existing ? existing.id : Storage.generateId(),
        name,
        avatarColor:      color,
        currentHandicap:  hcp,
        handicapHistory:  hcpChanged
          ? [...(existing ? existing.handicapHistory || [] : []), { date: new Date().toISOString().slice(0, 10), value: hcp }]
          : (existing ? existing.handicapHistory || [] : [])
      };
      Storage.saveProfile(profile);
      AppState.profileOpen = false;
      AppState.activeTab   = AppState.prevTab || 'home';
      App.renderContent();
    }
  }
};
