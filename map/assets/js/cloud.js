/* ============================================================
   Supabase: cuentas del equipo + POIs compartidos
   Sin configurar (config.js vacío) la web sigue funcionando en local.
   ============================================================ */
window.MapCloud = (() => {
  const cfg = window.MAP_CONFIG || {};
  const enabled = Boolean(
    cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase && window.supabase.createClient
  );
  const domain = String(cfg.emailDomain || 'team.waysider.com').replace(/^@/, '');

  let client = null;
  let user = null;
  const listeners = [];

  const notify = () => listeners.forEach((fn) => fn(user));

  async function init() {
    if (!enabled) return false;
    client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    const { data } = await client.auth.getSession();
    user = data.session?.user ?? null;
    client.auth.onAuthStateChange((_event, session) => {
      user = session?.user ?? null;
      notify();
    });
    return true;
  }

  function emailFor(username) {
    const raw = String(username || '').trim();
    return raw.includes('@') ? raw : `${raw}@${domain}`;
  }

  async function signIn(username, password) {
    if (!client) throw new Error('Cloud not ready');
    const { data, error } = await client.auth.signInWithPassword({
      email: emailFor(username),
      password,
    });
    if (error) throw new Error(error.message);
    user = data.user;
    notify();
    return user;
  }

  async function signOut() {
    if (!client) return;
    await client.auth.signOut();
    user = null;
    notify();
  }

  const mapRow = (r) => ({
    id: r.id,
    name: r.name,
    cat: r.cat,
    x: Number(r.x),
    y: Number(r.y),
    desc: r.desc || '',
  });

  async function list() {
    const { data, error } = await client
      .from('pois')
      .select('id,name,cat,x,y,desc')
      .order('name');
    if (error) throw new Error(error.message);
    return (data || []).map(mapRow);
  }

  async function upsert(poi) {
    const { error } = await client.from('pois').upsert({
      id: poi.id,
      name: poi.name,
      cat: poi.cat,
      x: poi.x,
      y: poi.y,
      desc: poi.desc || '',
      updated_by: user?.id ?? null,
    });
    if (error) throw new Error(error.message);
  }

  async function remove(id) {
    const { error } = await client.from('pois').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  return {
    enabled,
    domain,
    init,
    signIn,
    signOut,
    list,
    upsert,
    remove,
    emailFor,
    onAuth: (fn) => { listeners.push(fn); return fn; },
    get user() { return user; },
    get signedIn() { return Boolean(user); },
  };
})();
