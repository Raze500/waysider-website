/* ============================================================
   Interactive server map — logic
   ============================================================ */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const CATS = {
    boss:     { label: 'Boss',     color: '#e06f5e' },
    miniboss: { label: 'Mini boss', color: '#b07bd8' },
    portal:   { label: 'Portal',   color: '#6f8fe0' },
    chests:   { label: 'Chests',   color: '#e0b160' },
    poi:      { label: 'POI',      color: '#5ed29c' },
  };

  const ICONS = {
    boss: '<path d="M3 8l4.5 4L12 6l4.5 6L21 8v11H3z"/><path d="M3 19h18"/>',
    miniboss: '<path d="M12 3a7 7 0 0 0-7 7v3l2 2v3h10v-3l2-2v-3a7 7 0 0 0-7-7z"/><circle cx="9.5" cy="10" r="1.3"/><circle cx="14.5" cy="10" r="1.3"/><path d="M10 15h4"/>',
    portal: '<path d="M12 3c4.4 0 8 4 8 9s-3.6 9-8 9-8-4-8-9 3.6-9 8-9z"/><path d="M12 3c2 2.4 3 5.4 3 9s-1 6.6-3 9c-2-2.4-3-5.4-3-9s1-6.6 3-9z"/>',
    chests: '<rect x="3" y="8" width="18" height="11" rx="1"/><path d="M3 12h18"/><circle cx="12" cy="15.5" r="1.3"/>',
    poi: '<path d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  };

  const state = {
    map: null,
    meta: null,
    pois: [],
    catsOn: new Set(Object.keys(CATS)),
    query: '',
    editMode: false,
    editing: null,   // poi being edited
    pending: null,   // coords for a new poi
    markers: new Map(),
    activeId: null,
    cloud: false,
    user: null,
  };

  const LS_KEY = 'hytale-pois-v1';
  const CLOUD = window.MapCloud || null;

  // ---------------------------------------------------------------- helpers
  let toastTimer = 0;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  }

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  const ll = (x, y) => L.latLng(state.meta.height - y, x);
  const px = (latlng) => ({ x: latlng.lng, y: state.meta.height - latlng.lat });

  function iconSvg(cat) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"
      stroke-linecap="round" stroke-linejoin="round">${ICONS[cat] || ICONS.poi}</svg>`;
  }

  // -------------------------------------------------------------------- map
  function initMap(meta) {
    const h = meta.height;
    const w = meta.width;
    const map = L.map('map', {
      crs: L.CRS.Simple,
      minZoom: -6,
      maxZoom: 2,
      zoomSnap: 0,
      zoomDelta: 0.5,
      attributionControl: false,
      zoomControl: false,
      preferCanvas: false,
      maxBoundsViscosity: 0.75,
    });
    window.__map = map;
    const bounds = [[0, 0], [h, w]];
    L.imageOverlay(meta.image, bounds, { className: 'world-image' }).addTo(map);
    const pad = window.innerWidth > 760
      ? { padding: [12, 12] }
      : { paddingTopLeft: [12, 76], paddingBottomRight: [12, 12] };
    map.fitBounds(bounds, pad);
    map.setMaxBounds([[-h * 0.2, -w * 0.2], [h * 1.2, w * 1.2]]);
    const c0 = px(map.getCenter());
    $('#cx').textContent = Math.round(c0.x);
    $('#cz').textContent = Math.round(c0.y);

    map.on('mousemove', (e) => {
      const p = px(e.latlng);
      $('#cx').textContent = Math.round(p.x);
      $('#cz').textContent = Math.round(p.y);
    });

    map.on('click', (e) => {
      if (!state.editMode) return;
      const p = px(e.latlng);
      if (p.x < 0 || p.y < 0 || p.x > w || p.y > h) return;
      openEditor(null, { x: Math.round(p.x), y: Math.round(p.y) });
    });

    setZoomButtons(map);
    return map;
  }

  function setZoomButtons(map) {
    $('#zin').onclick = () => map.zoomIn(0.5);
    $('#zout').onclick = () => map.zoomOut(0.5);
    $('#zhome').onclick = () => map.fitBounds(
      [[0, 0], [state.meta.height, state.meta.width]], { padding: [12, 12] });
  }

  // ---------------------------------------------------------------- markers
  function buildMarker(poi) {
    const cat = CATS[poi.cat] || CATS.poi;
    const html = `
      <div class="poi-mark" style="--cat:${cat.color}">
        <div class="pin">${iconSvg(poi.cat)}</div>
        <span class="label">${esc(poi.name)}</span>
      </div>`;
    const icon = L.divIcon({
      className: 'poi-mark-wrap',
      html,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -12],
    });
    return L.marker(ll(poi.x, poi.y), { icon, riseOnHover: true, title: poi.name });
  }

  function popupHtml(poi) {
    const cat = CATS[poi.cat] || CATS.poi;
    return `
      <div class="pop" style="--cat:${cat.color}">
        <span class="cat" style="color:${cat.color}">${esc(cat.label)}</span>
        <h3>${esc(poi.name)}</h3>
        ${poi.desc ? `<p>${esc(poi.desc)}</p>` : ''}
        <div class="row">
          <code>X ${poi.x} · Z ${poi.y}</code>
          <button class="copy" data-copy="${poi.x}, ${poi.y}">Copiar</button>
        </div>
        ${state.editMode ? `<div class="pop-actions">
          <button class="edit-mini" data-edit="${poi.id}">Edit</button>
          <button class="edit-mini danger" data-del="${poi.id}">Delete</button>
        </div>` : ''}
      </div>`;
  }

  function bindPopup(marker, poi) {
    marker.bindPopup(popupHtml(poi), { closeButton: true, maxWidth: 280, minWidth: 240 });
    marker.on('popupopen', (e) => {
      const el = e.popup.getElement();
      el.querySelector('.copy')?.addEventListener('click', async (ev) => {
        const txt = ev.currentTarget.dataset.copy;
        try {
          await navigator.clipboard.writeText(txt);
          toast('Coordinates copied');
        } catch {
          toast(`Coordinates: ${txt}`);
        }
      });
      el.querySelector('.edit-mini')?.addEventListener('click', () => {
        marker.closePopup();
        openEditor(poi);
      });
      el.querySelector('.edit-mini.danger')?.addEventListener('click', (ev) => {
        ev.stopPropagation();
        marker.closePopup();
        removePoi(poi);
      });
    });
    marker.on('click', () => setActive(poi.id, false));
  }

  function renderMarkers() {
    const map = state.map;
    for (const m of state.markers.values()) map.removeLayer(m);
    state.markers.clear();

    for (const poi of state.pois) {
      if (!state.catsOn.has(poi.cat)) continue;
      if (!matchesQuery(poi)) continue;
      const m = buildMarker(poi);
      bindPopup(m, poi);
      m.addTo(map);
      state.markers.set(poi.id, m);
    }
    applyActiveStyles();
  }

  function matchesQuery(poi) {
    if (!state.query) return true;
    const q = state.query.toLowerCase();
    return (poi.name + ' ' + (poi.desc || '') + ' ' + (CATS[poi.cat]?.label || ''))
      .toLowerCase().includes(q);
  }

  function applyActiveStyles() {
    for (const [id, marker] of state.markers) {
      const el = marker.getElement();
      if (!el) continue;
      el.classList.toggle('active', id === state.activeId);
    }
  }

  function setActive(id, fly = true) {
    state.activeId = id;
    applyActiveStyles();
    $$('.poi-item').forEach((li) => li.classList.toggle('active', li.dataset.id === id));
    const poi = state.pois.find((p) => p.id === id);
    if (poi && fly) {
      state.map.flyTo(ll(poi.x, poi.y), Math.max(state.map.getZoom(), -0.5), { duration: 0.6 });
    }
  }

  // ------------------------------------------------------------------ UI
  function renderFilters() {
    const box = $('#filters');
    box.innerHTML = '';
    for (const [key, cat] of Object.entries(CATS)) {
      const count = state.pois.filter((p) => p.cat === key).length;
      if (!count) continue;
      const b = document.createElement('button');
      b.className = 'chip ' + (state.catsOn.has(key) ? 'on' : 'off');
      b.innerHTML = `<span class="swatch" style="background:${cat.color}"></span>${cat.label}`;
      b.onclick = () => {
        if (state.catsOn.has(key)) state.catsOn.delete(key);
        else state.catsOn.add(key);
        renderFilters();
        renderMarkers();
        renderList();
      };
      box.appendChild(b);
    }
  }

  function renderList() {
    const ul = $('#poi-list');
    ul.innerHTML = '';
    const items = state.pois
      .filter((p) => state.catsOn.has(p.cat) && matchesQuery(p))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));

    $('#poi-count').textContent = state.pois.length;
    const emptyMsg = $('#empty-msg');
    emptyMsg.hidden = items.length > 0;
    emptyMsg.textContent = state.pois.length
      ? 'Nothing matches your search.'
      : 'No points yet. Use Mark to add the first one.';

    for (const poi of items) {
      const cat = CATS[poi.cat] || CATS.poi;
      const li = document.createElement('li');
      li.className = 'poi-item';
      li.dataset.id = poi.id;
      li.style.color = cat.color;
      li.innerHTML = `
        <span class="glyph">${iconSvg(poi.cat)}</span>
        <span>
          <span class="nm">${esc(poi.name)}</span><br>
          <span class="sub">${esc(cat.label)} · X ${poi.x} Z ${poi.y}</span>
        </span>
        ${state.editMode
          ? `<button class="poi-del" title="Delete point" aria-label="Delete point">✕</button>`
          : '<span class="arrow">→</span>'}`;
      li.onclick = () => {
        setActive(poi.id, true);
        const m = state.markers.get(poi.id);
        if (m) setTimeout(() => m.openPopup(), 420);
        if (window.innerWidth <= 760) $('#sidebar').classList.remove('open');
      };
      li.querySelector('.poi-del')?.addEventListener('click', (ev) => {
        ev.stopPropagation();
        removePoi(poi);
      });
      ul.appendChild(li);
    }
    applyActiveStyles();
  }

  function updateFooter() {
    const n = state.pois.length;
    $('#foot-text').textContent = n ? `${n} points marked` : 'No points yet';
  }

  // ---------------------------------------------------------------- editor
  function openEditor(poi, coords) {
    state.editing = poi || null;
    state.pending = coords || null;
    $('#modal-title').textContent = poi ? 'Edit point of interest' : 'New point of interest';
    $('#f-name').value = poi ? poi.name : '';
    $('#f-desc').value = poi ? poi.desc || '' : '';
    const pos = poi ? { x: poi.x, y: poi.y } : coords;
    $('#f-coords').textContent = pos ? `X ${pos.x} · Z ${pos.y}` : '—';
    $('#f-delete').hidden = !poi;

    const picker = $('#f-cats');
    picker.innerHTML = '';
    const current = poi ? poi.cat : 'poi';
    for (const [key, cat] of Object.entries(CATS)) {
      const b = document.createElement('button');
      b.className = 'cat-opt' + (key === current ? ' sel' : '');
      b.dataset.cat = key;
      b.style.color = key === current ? cat.color : '';
      b.innerHTML = `<span class="swatch"></span>${cat.label}`;
      b.onclick = () => {
        $$('.cat-opt', picker).forEach((x) => {
          x.classList.remove('sel');
          x.style.color = '';
        });
        b.classList.add('sel');
        b.style.color = cat.color;
      };
      picker.appendChild(b);
    }

    $('#modal').hidden = false;
    setTimeout(() => $('#f-name').focus(), 30);
  }

  function closeEditor() {
    $('#modal').hidden = true;
    state.editing = null;
    state.pending = null;
  }

  function selectedCat() {
    return $('.cat-opt.sel')?.dataset.cat || 'poi';
  }

  function savePoi() {
    const name = $('#f-name').value.trim();
    if (!name) {
      $('#f-name').focus();
      toast('Give the point a name');
      return;
    }
    const cat = selectedCat();
    const desc = $('#f-desc').value.trim();

    if (state.editing) {
      Object.assign(state.editing, { name, cat, desc });
    } else {
      const pos = state.pending || { x: 0, y: 0 };
      state.pois.push({
        id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        name, cat, desc, x: pos.x, y: pos.y,
      });
    }
    const wasEdit = Boolean(state.editing);
    const target = state.editing || state.pois[state.pois.length - 1];
    persistLocal();
    if (state.cloud) syncUpsert(target);
    closeEditor();
    renderAll();
    toast(wasEdit ? 'Point updated' : 'Point added');
  }

  function removePoi(poi) {
    if (!poi) return;
    if (!confirm(`Delete "${poi.name}"?`)) return;
    state.pois = state.pois.filter((p) => p.id !== poi.id);
    persistLocal();
    if (state.cloud) syncDelete(poi.id);
    if (state.editing === poi) closeEditor();
    if (state.activeId === poi.id) state.activeId = null;
    renderAll();
    toast('Point deleted');
  }

  function deletePoi() {
    if (!state.editing) return;
    removePoi(state.editing);
  }

  function persistLocal() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ pois: state.pois, ts: Date.now() }));
    } catch { /* sin espacio */ }
  }

  async function syncUpsert(poi) {
    if (!state.cloud || !state.user || !poi) return;
    try {
      await CLOUD.upsert(poi);
    } catch (e) {
      toast(`Could not save: ${e.message}`);
    }
  }

  async function syncDelete(id) {
    if (!state.cloud || !state.user) return;
    try {
      await CLOUD.remove(id);
    } catch (e) {
      toast(`Could not delete: ${e.message}`);
    }
  }

  async function reloadFromCloud() {
    if (!state.cloud) return;
    try {
      const rows = await CLOUD.list();
      state.pois = rows.map((p) => ({ ...p, cat: CATS[p.cat] ? p.cat : 'poi' }));
      renderAll();
    } catch (e) {
      toast(`Could not load points: ${e.message}`);
    }
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data;
      return Array.isArray(data?.pois) ? data.pois : null;
    } catch {
      return null;
    }
  }

  function downloadPois() {
    const blob = new Blob([JSON.stringify(state.pois, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pois.json';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('pois.json downloaded — upload it to the /data folder of the site');
  }

  // ------------------------------------------------------------------- boot
  function renderAll() {
    renderFilters();
    renderMarkers();
    renderList();
    updateFooter();
  }

  function applyEditMode(on) {
    state.editMode = on;
    $('#editbar').hidden = !on;
    $('#btn-edit').classList.toggle('active', on);
    document.body.classList.toggle('editing', on);
    $('#map').style.cursor = on ? 'crosshair' : '';
    renderMarkers();
  }

  function readUrl() {
    const p = new URLSearchParams(location.search);
    const x = parseFloat(p.get('x'));
    const y = parseFloat(p.get('y'));
    const z = parseFloat(p.get('z'));
    const poi = p.get('poi');
    return { x, y, z, poi };
  }

  function updateAuthUI() {
    const signed = Boolean(state.cloud && state.user);
    const login = $('#btn-login');
    const chip = $('#user-chip');
    if (login) login.hidden = !state.cloud || signed;
    if (chip) chip.hidden = !signed;
    if (signed) {
      $('#user-name').textContent = String(state.user.email || '').split('@')[0];
    }
    if (!signed && state.editMode) applyEditMode(false);
  }

  function openLogin() {
    $('#login-error').hidden = true;
    $('#login-modal').hidden = false;
    setTimeout(() => $('#login-user').focus(), 30);
  }

  function closeLogin() {
    $('#login-modal').hidden = true;
  }

  function showLoginError(msg) {
    const el = $('#login-error');
    el.textContent = msg;
    el.hidden = false;
  }

  async function doLogin() {
    const username = $('#login-user').value.trim();
    const password = $('#login-pass').value;
    if (!username || !password) {
      showLoginError('Enter your username and password.');
      return;
    }
    const btn = $('#login-submit');
    btn.disabled = true;
    btn.textContent = 'Signing in…';
    try {
      await CLOUD.signIn(username, password);
      closeLogin();
      toast('Signed in');
      await reloadFromCloud();
      applyEditMode(true);
    } catch (e) {
      showLoginError(e.message || 'Sign in failed.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign in';
    }
  }

  async function boot() {
    let meta;
    try {
      meta = await fetch('data/map.json').then((r) => r.json());
    } catch {
      meta = { name: 'Hytale Map', image: 'assets/map/world.webp', width: 2560, height: 2560 };
    }
    state.meta = meta;

    let pois = [];
    try {
      pois = await fetch('data/pois.json').then((r) => r.json());
    } catch {
      pois = [];
    }

    if (CLOUD && CLOUD.enabled) {
      state.cloud = true;
      try {
        await CLOUD.init();
        state.user = CLOUD.user;
      } catch (e) {
        console.warn(e);
      }
      CLOUD.onAuth((u) => {
        state.user = u;
        updateAuthUI();
      });
    } else {
      const local = loadLocal();
      if (local) {
        pois = local;
        toast('Showing your local changes (draft)');
      }
    }
    state.pois = (Array.isArray(pois) ? pois : []).map((p) => ({
      ...p,
      cat: CATS[p.cat] ? p.cat : 'poi',
    }));

    const img = new Image();
    img.src = meta.image;
    img.onload = () => {
      state.map = initMap(meta);
      renderAll();
      updateAuthUI();
      if (state.cloud) reloadFromCloud();
      const u = readUrl();
      if (Number.isFinite(u.x) && Number.isFinite(u.y)) {
        state.map.setView(ll(u.x, u.y), Number.isFinite(u.z) ? u.z : 0);
      }
      if (u.poi) {
        const target = state.pois.find((p) => p.id === u.poi || p.name === u.poi);
        if (target) {
          setActive(target.id, true);
          setTimeout(() => state.markers.get(target.id)?.openPopup(), 500);
        }
      }
      $('#server-name').textContent = meta.name || 'Hytale Map';
      document.title = meta.name ? meta.name + ' — Waysider' : 'Hytale Map — Waysider';
    };
    img.onerror = () => toast('Could not load the map image');

    // eventos de UI
    $('#search').addEventListener('input', (e) => {
      state.query = e.target.value.trim();
      renderMarkers();
      renderList();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' &&
          document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        $('#search').focus();
      }
      if (e.key === 'Escape') {
        if (!state.editMode) return;
        closeEditor();
      }
    });

    $('#menu-toggle').onclick = () => $('#sidebar').classList.toggle('open');
    $('#btn-share').onclick = async () => {
      const c = state.map.getCenter();
      const p = px(c);
      const url = new URL(location.href);
      url.search = '';
      url.searchParams.set('x', Math.round(p.x));
      url.searchParams.set('y', Math.round(p.y));
      url.searchParams.set('z', state.map.getZoom().toFixed(2));
      try {
        await navigator.clipboard.writeText(url.toString());
        toast('Link copied');
      } catch {
        toast(url.toString());
      }
    };
    $('#btn-edit').onclick = () => {
      if (!state.map) return;
      if (state.cloud && !state.user) {
        openLogin();
        return;
      }
      applyEditMode(!state.editMode);
      if (state.editMode) toast('Click the map to mark a point');
    };
    $('#btn-login').onclick = openLogin;
    $('#login-close').onclick = closeLogin;
    $('#login-cancel').onclick = closeLogin;
    $('#login-submit').onclick = doLogin;
    $('#login-pass').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doLogin();
    });
    $('#login-modal').addEventListener('click', (e) => {
      if (e.target.id === 'login-modal') closeLogin();
    });
    $('#btn-signout').onclick = async () => {
      applyEditMode(false);
      await CLOUD.signOut();
      await reloadFromCloud();
      toast('Signed out');
    };
    updateAuthUI();
    $('#edit-exit').onclick = () => applyEditMode(false);
    $('#edit-export').onclick = downloadPois;
    $('#edit-clear').onclick = () => {
      if (!state.pois.length) return;
      if (!confirm(`Delete all ${state.pois.length} points?`)) return;
      const ids = state.pois.map((p) => p.id);
      state.pois = [];
      state.activeId = null;
      persistLocal();
      if (state.cloud) ids.forEach((id) => syncDelete(id));
      renderAll();
      toast('All points deleted');
    };
    $('#edit-reset').onclick = () => {
      if (!confirm('Discard your local changes and load the published points?')) return;
      try { localStorage.removeItem(LS_KEY); } catch { /* nada */ }
      location.reload();
    };
    $('#modal-close').onclick = closeEditor;
    $('#f-cancel').onclick = closeEditor;
    $('#f-save').onclick = savePoi;
    $('#f-delete').onclick = deletePoi;
    $('#modal').addEventListener('click', (e) => {
      if (e.target.id === 'modal') closeEditor();
    });
    $('#f-name').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') savePoi();
    });
  }

  boot();
})();
