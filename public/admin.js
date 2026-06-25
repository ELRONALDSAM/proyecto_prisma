'use strict';

const CONFIG = { perPage: 8, apiBase: '', stockList: [12,8,24,5,3,17,9,31,6,2,14,19,7] };
const CAT_LABEL = { mujer: 'Mujer', hombre: 'Hombre', nino: 'Niño', accesorios: 'Accesorios' };
const PAGE_TITLE = { dashboard: 'Dashboard', productos: 'Productos', categorias: 'Categorías', ofertas: 'Ofertas', inventario: 'Inventario' };
const state = { products: [], activityLog: [], nextId: 1, editingId: null, deletingId: null, currentPage: 1 };

const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const fmt = n => 'C$ ' + parseFloat(n).toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const el = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

const showToast = (m, t = 'ok') => { const d = el('admin-toast'); d.textContent = m; d.className = `show ${t}`; clearTimeout(d._t); d._t = setTimeout(() => d.className = '', 3200); };

async function apiLoadProducts() { try { const r = await fetch(`${CONFIG.apiBase}/products`); if (!r.ok) throw 1; const d = await r.json(); state.products = d; state.nextId = Math.max(...d.map(p => p.id), 0) + 1; } catch { state.products = SEED_PRODUCTS; state.nextId = SEED_PRODUCTS.length + 1; state.activityLog = SEED_LOG; } }
async function apiSaveProduct(p, id = null) { try { const token = localStorage.getItem('token'); const m = id ? 'PUT' : 'POST', u = id ? `${CONFIG.apiBase}/products/${id}` : `${CONFIG.apiBase}/products`; const r = await fetch(u, { method: m, headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify(p) }); return r.ok ? await r.json() : null; } catch { return null; } }
async function apiDeleteProduct(id) { try { const token = localStorage.getItem('token'); return (await fetch(`${CONFIG.apiBase}/products/${id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } })).ok; } catch { return false; } }

const renderPage = p => ({ dashboard: renderDashboard, productos: renderProducts, categorias: renderCategorias, ofertas: renderOfertas, inventario: renderInventario })[p]?.();

function renderDashboard() {
  const { products: p, activityLog: al } = state, t = p.length, w = p.filter(x => x.discount > 0).length, a = t ? p.reduce((s, x) => s + x.price, 0) / t : 0, c = new Set(p.map(x => x.category)).size;
  el('stats-grid').innerHTML = [
    { i: 'fa-tshirt', l: 'Total Productos', v: t, s: '<i class="fas fa-arrow-up"></i> Catálogo activo' }, { i: 'fa-tags', l: 'Categorías', v: c, s: '<i class="fas fa-layer-group"></i> En total' },
    { i: 'fa-percentage', l: 'Con Descuento', v: w, s: '<i class="fas fa-fire"></i> Ofertas activas' }, { i: 'fa-coins', l: 'Precio Promedio', v: fmt(a), s: '<i class="fas fa-chart-line"></i> Por producto', sm: 1 }
  ].map(s => `<div class="stat-card"><div class="stat-card__icon"><i class="fas ${s.i}"></i></div><div class="stat-card__label">${s.l}</div><div class="stat-card__val${s.sm ? ' stat-card__val--sm' : ''}">${s.v}</div><div class="stat-card__sub">${s.s}</div></div>`).join('');
  el('recent-products-list').innerHTML = [...p].reverse().slice(0, 5).map(x => `<div class="mini-list-item"><div class="mini-img"><img src="${esc(x.img)}" loading="lazy" onerror="this.style.display='none'"/></div><div class="mini-info"><strong>${esc(x.name)}</strong><span>${esc(CAT_LABEL[x.category] || x.category)}</span></div><div class="mini-price">${fmt(x.price)}</div></div>`).join('');
  el('activity-log').innerHTML = al.map(x => `<div class="activity-item"><div class="activity-dot ${x.type}"></div><div><p>${esc(x.text)}</p><time>${esc(x.time)}</time></div></div>`).join('');
  el('total-badge').textContent = t;
}

const getFiltered = () => { const q = (el('prod-search')?.value || '').toLowerCase(), c = el('cat-filter')?.value || '', s = el('status-filter')?.value || ''; return state.products.filter(p => (!q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) && (!c || p.category === c) && (!s || p.status === s)); };
const buildPagination = f => { const t = Math.ceil(f.length / CONFIG.perPage), c = state.currentPage; if (t <= 1) return ''; let h = c > 1 ? `<button class="page-btn" data-page="${c - 1}"><i class="fas fa-chevron-left"></i></button>` : ''; for (let i = 1; i <= t; i++) h += `<button class="page-btn${i === c ? ' active' : ''}" data-page="${i}">${i}</button>`; return h + (c < t ? `<button class="page-btn" data-page="${c + 1}"><i class="fas fa-chevron-right"></i></button>` : ''); };

function renderProducts() {
  const f = getFiltered(), st = (state.currentPage - 1) * CONFIG.perPage, sl = f.slice(st, st + CONFIG.perPage);
  el('table-info').textContent = `${f.length} producto${f.length !== 1 ? 's' : ''}`;
  el('products-tbody').innerHTML = sl.length ? sl.map(p => `<tr><td><div class="product-name-cell"><div class="product-thumb"><img src="${esc(p.img)}" loading="lazy" onerror="this.style.display='none'"/></div><div><strong>${esc(p.name)}</strong><br/><span class="sub-text">${esc(p.desc.slice(0, 50))}…</span></div></div></td><td><span class="badge badge-${esc(p.category)}">${esc(CAT_LABEL[p.category] || p.category)}</span></td><td class="price-cell">${fmt(p.price)}</td><td>${p.discount > 0 ? `<span class="badge badge-discount">-${p.discount}%</span>` : '<span class="text-muted">—</span>'}</td><td><span class="badge badge-${p.status}">${p.status === 'activo' ? 'Activo' : 'Inactivo'}</span></td><td><div class="actions-cell"><button class="icon-action view" data-action="view" data-id="${p.id}"><i class="fas fa-eye"></i></button> <button class="icon-action edit" data-action="edit" data-id="${p.id}"><i class="fas fa-edit"></i></button> <button class="icon-action delete" data-action="delete" data-id="${p.id}"><i class="fas fa-trash-alt"></i></button></div></td></tr>`).join('') : `<tr><td colspan="6"><div class="empty-state"><i class="fas fa-search"></i><p>No se encontraron productos.</p></div></td></tr>`;
  el('pagination').innerHTML = buildPagination(f);
}

function renderCategorias() {
  const s = ['mujer', 'hombre', 'nino', 'accesorios'].map(c => { const ps = state.products.filter(p => p.category === c), pr = ps.map(p => p.price); return { c, n: ps.length, a: pr.length ? pr.reduce((a, b) => a + b, 0) / pr.length : 0, mx: pr.length ? Math.max(...pr) : 0, mn: pr.length ? Math.min(...pr) : 0 }; });
  el('cat-stats').innerHTML = s.map(x => `<div class="stat-card"><div class="stat-card__icon"><i class="fas fa-tags"></i></div><div class="stat-card__label">${esc(CAT_LABEL[x.c])}</div><div class="stat-card__val">${x.n}</div><div class="stat-card__sub"><i class="fas fa-box"></i> productos</div></div>`).join('');
  el('cat-tbody').innerHTML = s.map(x => `<tr><td><span class="badge badge-${x.c}">${esc(CAT_LABEL[x.c])}</span></td><td>${x.n}</td><td class="price-cell">${x.a ? fmt(x.a) : '—'}</td><td>${x.mx ? fmt(x.mx) : '—'}</td><td>${x.mn ? fmt(x.mn) : '—'}</td></tr>`).join('');
}

function renderOfertas() {
  const w = state.products.filter(p => p.discount > 0);
  el('offers-tbody').innerHTML = w.length ? w.map(p => `<tr><td><div class="product-name-cell"><div class="product-thumb"><img src="${esc(p.img)}" loading="lazy" onerror="this.style.display='none'"/></div><strong>${esc(p.name)}</strong></div></td><td class="strikethrough">${fmt(p.price / (1 - p.discount / 100))}</td><td><span class="badge badge-discount">-${p.discount}%</span></td><td class="price-cell">${fmt(p.price)}</td><td><div class="actions-cell"><button class="icon-action edit" data-action="edit" data-id="${p.id}"><i class="fas fa-edit"></i></button> <button class="icon-action delete" data-action="delete" data-id="${p.id}"><i class="fas fa-trash-alt"></i></button></div></td></tr>`).join('') : `<tr><td colspan="5"><div class="empty-state"><i class="fas fa-percentage"></i><p>No hay productos con descuento.</p></div></td></tr>`;
}

function renderInventario() {
  el('inv-tbody').innerHTML = state.products.map((p, i) => { const s = CONFIG.stockList[i % CONFIG.stockList.length], c = s < 5 ? 'var(--coral)' : s < 10 ? '#f5a623' : 'var(--sage)'; return `<tr><td><div class="product-name-cell"><div class="product-thumb"><img src="${esc(p.img)}" loading="lazy" onerror="this.style.display='none'"/></div><strong>${esc(p.name)}</strong></div></td><td><span class="badge badge-${p.category}">${esc(CAT_LABEL[p.category])}</span></td><td class="price-cell">${fmt(p.price)}</td><td style="font-weight:600;color:${c}">${s} unid.</td><td><span class="badge badge-${p.status}">${p.status === 'activo' ? 'Activo' : 'Inactivo'}</span></td></tr>` }).join('');
}

const navTo = p => { $$('.page, [data-page]').forEach(n => n.classList.remove('active')); el(`page-${p}`)?.classList.add('active'); $(`[data-page="${p}"]`)?.classList.add('active'); el('page-title').textContent = PAGE_TITLE[p] || p; state.currentPage = 1; renderPage(p); closeSidebar(); };
const closeModal = id => el(id)?.classList.remove('open'), closeAllModals = () => $$('.modal-overlay.open').forEach(m => m.classList.remove('open')), closeSidebar = () => { el('sidebar')?.classList.remove('open'); el('sidebar-backdrop')?.classList.remove('open'); };

function openModal(m, id = null) {
  ['field-name', 'field-cat', 'field-price', 'field-desc', 'field-img'].forEach(f => { if (el(f)) el(f).value = ''; });
  el('field-discount').value = '0'; el('field-status').value = 'activo'; el('img-preview').src = ''; el('img-preview-wrap').classList.remove('has-img'); state.editingId = null;
  if (m === 'edit' && id != null) {
    const p = state.products.find(x => x.id === id); if (!p) return; state.editingId = id;
    el('modal-title').textContent = 'Editar Producto'; el('modal-sub').textContent = 'Modifica los datos.';
    el('field-name').value = p.name; el('field-cat').value = p.category; el('field-price').value = p.price; el('field-discount').value = p.discount; el('field-status').value = p.status; el('field-desc').value = p.desc; el('field-img').value = p.img;
    if (p.img) { el('img-preview').src = p.img; el('img-preview-wrap').classList.add('has-img'); }
  } else { el('modal-title').textContent = 'Nuevo Producto'; el('modal-sub').textContent = 'Completa los datos.'; }
  el('modal-product').classList.add('open'); el('field-name').focus();
}

async function saveProduct() {
  const n = el('field-name').value.trim(), c = el('field-cat').value, pr = parseFloat(el('field-price').value), d = parseInt(el('field-discount').value) || 0, s = el('field-status').value, ds = el('field-desc').value.trim(), i = el('field-img').value.trim() || el('img-preview').src;
  if (!n) { showToast('Nombre requerido', 'err'); return el('field-name').focus(); } if (!c) { showToast('Categoría requerida', 'err'); return el('field-cat').focus(); } if (!pr || pr <= 0) { showToast('Precio inválido', 'err'); return el('field-price').focus(); }
  const payload = { name: n, category: c, price: pr, discount: d, status: s, desc: ds, img: i };
  if (state.editingId) {
    await apiSaveProduct(payload, state.editingId); const p = state.products.find(x => x.id === state.editingId); if (p) Object.assign(p, payload);
    state.activityLog.unshift({ type: 'edit', text: `Se editó "${n}"`, time: 'Ahora' }); showToast(`"${n}" actualizado ✓`);
  } else {
    const res = await apiSaveProduct(payload); state.products.push(res || { id: state.nextId++, ...payload });
    state.activityLog.unshift({ type: 'add', text: `Se agregó "${n}"`, time: 'Ahora' }); showToast(`"${n}" agregado ✓`);
  }
  closeModal('modal-product'); el('total-badge').textContent = state.products.length; renderPage($('[data-page].active')?.dataset.page || 'dashboard');
}

function openDeleteModal(id) { state.deletingId = id; const p = state.products.find(x => x.id === id); el('delete-product-name').textContent = p ? `"${p.name}"` : ''; el('modal-delete').classList.add('open'); }
async function confirmDelete() {
  const p = state.products.find(x => x.id === state.deletingId);
  if (p) { await apiDeleteProduct(state.deletingId); state.products = state.products.filter(x => x.id !== state.deletingId); state.activityLog.unshift({ type: 'del', text: `Se eliminó "${p.name}"`, time: 'Ahora' }); showToast(`"${p.name}" eliminado.`, 'err'); }
  closeModal('modal-delete'); el('total-badge').textContent = state.products.length; renderPage($('[data-page].active')?.dataset.page || 'dashboard');
}

function viewProduct(id) {
  const p = state.products.find(x => x.id === id); if (!p) return;
  el('view-name').textContent = p.name; el('view-cat').textContent = CAT_LABEL[p.category] || p.category; el('view-img').src = p.img; el('view-price').textContent = fmt(p.price);
  el('view-discount').textContent = p.discount > 0 ? `-${p.discount}% · Precio final: ${fmt(p.price)}` : 'Sin descuento';
  const st = el('view-status'); st.className = `badge badge-${p.status}`; st.textContent = p.status === 'activo' ? 'Activo' : 'Inactivo';
  el('view-desc').textContent = p.desc || 'Sin descripción.'; el('view-edit-btn').onclick = () => { closeModal('modal-view'); openModal('edit', p.id); }; el('modal-view').classList.add('open');
}

function initListeners() {
  el('img-file')?.addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; if (f.size > 4194304) return showToast('Imagen > 4MB', 'err'); const r = new FileReader(); r.onload = ev => { el('img-preview').src = ev.target.result; el('img-preview-wrap').classList.add('has-img'); el('field-img').value = ''; }; r.readAsDataURL(f); });
  el('field-img')?.addEventListener('input', e => { const u = e.target.value.trim(); if (u) { el('img-preview').src = u; el('img-preview-wrap').classList.add('has-img'); } else el('img-preview-wrap').classList.remove('has-img'); });
  el('hamburger-admin')?.addEventListener('click', () => { el('sidebar').classList.add('open'); el('sidebar-backdrop').classList.add('open'); });
  el('sidebar-backdrop')?.addEventListener('click', closeSidebar); document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeSidebar(); closeAllModals(); } });
  $$('[data-page]').forEach(e => e.addEventListener('click', () => navTo(e.dataset.page)));
  document.addEventListener('click', e => { const b = e.target.closest('[data-action]'), pb = e.target.closest('.page-btn[data-page]'); if (b) { const { action, id } = b.dataset, n = +id; if (action === 'view') viewProduct(n); if (action === 'edit') openModal('edit', n); if (action === 'delete') openDeleteModal(n); } if (pb) { state.currentPage = +pb.dataset.page; renderProducts(); } });
  $$('.modal-overlay').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); }));
  ['prod-search', 'cat-filter', 'status-filter'].forEach(i => el(i)?.addEventListener('input', () => { state.currentPage = 1; renderProducts(); }));
  el('btn-new-product')?.addEventListener('click', () => openModal('add')); el('btn-save-product')?.addEventListener('click', saveProduct); el('btn-confirm-delete')?.addEventListener('click', confirmDelete); el('btn-go-home')?.addEventListener('click', () => window.location.href = 'index.html'); el('btn-logout')?.addEventListener('click', () => showToast('Sesión cerrada'));
}

document.addEventListener('DOMContentLoaded', async () => { await apiLoadProducts(); initListeners(); renderDashboard(); el('total-badge').textContent = state.products.length; });

const SEED_PRODUCTS = [{id:1,name:'Vestido de Gala Seda',category:'mujer',price:3679.15,discount:0,status:'activo',img:'imagen/vestido-gala-seda .png',desc:'Seda natural. S–XL.'},{id:2,name:'Traje Lino Italiano',category:'hombre',price:8800,discount:0,status:'activo',img:'imagen/traje_hombre.png',desc:'Corte slim.'},{id:3,name:'Conjunto Niño Premium',category:'nino',price:3200,discount:0,status:'activo',img:'imagen/conjunto-niño.png',desc:'Algodón orgánico.'},{id:4,name:'Falda Plisada Larga',category:'mujer',price:2800,discount:0,status:'activo',img:'imagen/falda-elegante.png',desc:'Gasa de poliéster.'},{id:5,name:'Vestido Midi Floral',category:'mujer',price:2660,discount:30,status:'activo',img:'imagen/Vestido Midi Floral.png',desc:'Manga corta.'},{id:6,name:'Blusa de Seda Estampada',category:'mujer',price:1875,discount:25,status:'activo',img:'imagen/blusa de seda.png',desc:'Cierre espalda.'},{id:7,name:'Accesorios Mujer',category:'accesorios',price:1520,discount:20,status:'activo',img:'imagen/asesorios de mujer .png',desc:'Bolso + collar.'},{id:8,name:'Camisa Casual de Rayas',category:'hombre',price:1520,discount:20,status:'activo',img:'imagen/camisa-casual-hombre.png',desc:'Rayas verticales.'},{id:9,name:'Pantalón Chino Verde',category:'hombre',price:2040,discount:15,status:'activo',img:'imagen/pantalon-verde-hombres.png',desc:'Color salvia.'},{id:10,name:'Accesorios Hombre',category:'accesorios',price:715,discount:35,status:'activo',img:'imagen/accesorio de hombre.png',desc:'Cinturón + pañuelo.'},{id:11,name:'Camisa Casual Niño',category:'nino',price:2660,discount:30,status:'activo',img:'imagen/camisa casual de niño.png',desc:'Algodón cómoda.'},{id:12,name:'Short Casual Niño',category:'nino',price:1875,discount:25,status:'activo',img:'imagen/short casual de niño .png',desc:'Bolsillos laterales.'},{id:13,name:'Accesorios Niño',category:'accesorios',price:1520,discount:20,status:'activo',img:'imagen/accesorio de niño .png',desc:'Mochila + gorra.'}];
const SEED_LOG = [{type:'add',text:'Se agregó "Vestido de Gala"',time:'Hoy, 10:14'},{type:'edit',text:'Se editó "Traje Lino"',time:'Hoy, 09:52'},{type:'add',text:'Se agregó "Accesorios Niño"',time:'Ayer, 16:30'},{type:'del',text:'Se eliminó "Bufanda"',time:'Ayer, 14:05'}];