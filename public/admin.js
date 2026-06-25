'use strict';

const CONFIG = { perPage: 8, apiBase: '', stockList: [12,8,24,5,3,17,9,31,6,2,14,19,7] };
const CAT_LABEL = { mujer: 'Mujer', hombre: 'Hombre', nino: 'Niño', accesorios: 'Accesorios' };
const PAGE_TITLE = { productos: 'Productos', categorias: 'Categorías', usuarios: 'Usuarios' };
const state = { products: [], users: [], activityLog: [], nextId: 1, editingId: null, deletingId: null, currentPage: 1 };

const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const fmt = n => 'C$ ' + parseFloat(n).toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const el = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

const showToast = (m, t = 'ok') => { const d = el('admin-toast'); if (d) { d.textContent = m; d.className = `show ${t}`; clearTimeout(d._t); d._t = setTimeout(() => d.className = '', 3200); } };

async function apiLoadProducts() {
  try {
    const r = await fetch(`${CONFIG.apiBase}/products`);
    if (!r.ok) throw new Error('Error al cargar productos');
    const d = await r.json();
    state.products = d;
    state.nextId = Math.max(...d.map(p => p.id), 0) + 1;
  } catch (err) {
    console.error('Error cargando productos:', err);
    state.products = SEED_PRODUCTS;
    state.nextId = SEED_PRODUCTS.length + 1;
  }
}

async function apiLoadUsers() {
  try {
    const token = localStorage.getItem('token');
    const r = await fetch(`${CONFIG.apiBase}/users`, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    if (!r.ok) throw new Error('Error al cargar usuarios');
    const d = await r.json();
    state.users = d;
  } catch (err) {
    console.error('Error cargando usuarios:', err);
    state.users = [];
  }
}

async function apiSaveProduct(p, id = null) {
  try {
    const token = localStorage.getItem('token');
    const m = id ? 'PUT' : 'POST';
    const u = id ? `${CONFIG.apiBase}/products/${id}` : `${CONFIG.apiBase}/products`;
    const r = await fetch(u, {
      method: m,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(p)
    });
    return r.ok ? await r.json() : null;
  } catch (err) {
    console.error('Error al guardar producto:', err);
    return null;
  }
}

async function apiDeleteProduct(id) {
  try {
    const token = localStorage.getItem('token');
    const r = await fetch(`${CONFIG.apiBase}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    return r.ok;
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    return false;
  }
}

const renderPage = p => ({
  productos: renderProducts,
  categorias: renderCategorias,
  usuarios: renderUsuarios
})[p]?.();

const getFiltered = () => {
  const q = (el('prod-search')?.value || '').toLowerCase();
  const c = el('cat-filter')?.value || '';
  const s = el('status-filter')?.value || '';
  return state.products.filter(p => 
    (!q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) && 
    (!c || p.category === c) && 
    (!s || p.status === s)
  );
};

const buildPagination = f => {
  const t = Math.ceil(f.length / CONFIG.perPage);
  const c = state.currentPage;
  if (t <= 1) return '';
  let h = c > 1 ? `<button class="page-btn" data-page="${c - 1}"><i class="fas fa-chevron-left"></i></button>` : '';
  for (let i = 1; i <= t; i++) {
    h += `<button class="page-btn${i === c ? ' active' : ''}" data-page="${i}">${i}</button>`;
  }
  return h + (c < t ? `<button class="page-btn" data-page="${c + 1}"><i class="fas fa-chevron-right"></i></button>` : '');
};

function renderProducts() {
  const f = getFiltered();
  const st = (state.currentPage - 1) * CONFIG.perPage;
  const sl = f.slice(st, st + CONFIG.perPage);
  
  if (el('table-info')) {
    el('table-info').textContent = `${f.length} producto${f.length !== 1 ? 's' : ''}`;
  }
  
  const tbody = el('products-tbody');
  if (tbody) {
    tbody.innerHTML = sl.length ? sl.map(p => `
      <tr>
        <td>
          <div class="product-thumb">
            <img src="${esc(p.img)}" loading="lazy" onerror="this.style.display='none'"/>
          </div>
        </td>
        <td>
          <strong>${esc(p.name)}</strong>
          <span class="badge badge-${p.status}">${p.status === 'activo' ? 'Activo' : 'Inactivo'}</span>
          <br/>
          <span class="sub-text">${esc(p.desc.slice(0, 50))}…</span>
        </td>
        <td>
          <span class="badge badge-${esc(p.category)}">${esc(CAT_LABEL[p.category] || p.category)}</span>
        </td>
        <td class="price-cell">
          ${fmt(p.price)}
          ${p.discount > 0 ? `<br/><span class="badge badge-discount">-${p.discount}%</span>` : ''}
        </td>
        <td>
          <strong>${p.stock !== undefined ? p.stock : 10}</strong> unid.
        </td>
        <td>
          <div class="actions-cell">
            <button class="icon-action view" data-action="view" data-id="${p.id}"><i class="fas fa-eye"></i></button>
            <button class="icon-action edit" data-action="edit" data-id="${p.id}"><i class="fas fa-edit"></i></button>
            <button class="icon-action delete" data-action="delete" data-id="${p.id}"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      </tr>
    `).join('') : `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <i class="fas fa-search"></i>
            <p>No se encontraron productos.</p>
          </div>
        </td>
      </tr>
    `;
  }
  
  if (el('pagination')) {
    el('pagination').innerHTML = buildPagination(f);
  }
}

function renderCategorias() {
  const s = ['mujer', 'hombre', 'nino', 'accesorios'].map(c => {
    const ps = state.products.filter(p => p.category === c);
    const pr = ps.map(p => p.price);
    return {
      c,
      n: ps.length,
      a: pr.length ? pr.reduce((a, b) => a + b, 0) / pr.length : 0,
      mx: pr.length ? Math.max(...pr) : 0,
      mn: pr.length ? Math.min(...pr) : 0
    };
  });
  
  if (el('cat-stats')) {
    el('cat-stats').innerHTML = s.map(x => `
      <div class="stat-card">
        <div class="stat-card__icon"><i class="fas fa-tags"></i></div>
        <div class="stat-card__label">${esc(CAT_LABEL[x.c])}</div>
        <div class="stat-card__val">${x.n}</div>
        <div class="stat-card__sub"><i class="fas fa-box"></i> productos</div>
      </div>
    `).join('');
  }
  
  if (el('cat-tbody')) {
    el('cat-tbody').innerHTML = s.map(x => `
      <tr>
        <td><span class="badge badge-${x.c}">${esc(CAT_LABEL[x.c])}</span></td>
        <td>${x.n}</td>
        <td class="price-cell">${x.a ? fmt(x.a) : '—'}</td>
        <td>${x.mx ? fmt(x.mx) : '—'}</td>
        <td>${x.mn ? fmt(x.mn) : '—'}</td>
      </tr>
    `).join('');
  }
}

async function renderUsuarios() {
  await apiLoadUsers();
  const u = state.users || [];
  const tbody = el('users-tbody');
  if (tbody) {
    tbody.innerHTML = u.length ? u.map(x => `
      <tr>
        <td>${x.id}</td>
        <td><strong>${esc(x.nombre)}</strong></td>
        <td>${esc(x.email)}</td>
        <td><span class="badge ${x.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}">${x.role}</span></td>
      </tr>
    `).join('') : `
      <tr>
        <td colspan="4">
          <div class="empty-state">
            <i class="fas fa-users-slash"></i>
            <p>No se encontraron usuarios.</p>
          </div>
        </td>
      </tr>
    `;
  }
}

const navTo = p => {
  $$('.page, [data-page]').forEach(n => n.classList.remove('active'));
  el(`page-${p}`)?.classList.add('active');
  $(`[data-page="${p}"]`)?.classList.add('active');
  if (el('page-title')) {
    el('page-title').textContent = PAGE_TITLE[p] || p;
  }
  state.currentPage = 1;
  renderPage(p);
  closeSidebar();
};

const closeModal = id => el(id)?.classList.remove('open');
const closeAllModals = () => $$('.modal-overlay.open').forEach(m => m.classList.remove('open'));
const closeSidebar = () => { el('sidebar')?.classList.remove('open'); el('sidebar-backdrop')?.classList.remove('open'); };

function openModal(m, id = null) {
  ['field-name', 'field-cat', 'field-price', 'field-desc', 'field-img'].forEach(f => { if (el(f)) el(f).value = ''; });
  if (el('field-discount')) el('field-discount').value = '0';
  if (el('field-status')) el('field-status').value = 'activo';
  if (el('img-preview')) el('img-preview').src = '';
  el('img-preview-wrap')?.classList.remove('has-img');
  state.editingId = null;
  
  if (m === 'edit' && id != null) {
    const p = state.products.find(x => x.id === id);
    if (!p) return;
    state.editingId = id;
    if (el('modal-title')) el('modal-title').textContent = 'Editar Producto';
    if (el('modal-sub')) el('modal-sub').textContent = 'Modifica los datos.';
    
    if (el('field-name')) el('field-name').value = p.name;
    if (el('field-cat')) el('field-cat').value = p.category;
    if (el('field-price')) el('field-price').value = p.price;
    if (el('field-discount')) el('field-discount').value = p.discount;
    if (el('field-status')) el('field-status').value = p.status;
    if (el('field-desc')) el('field-desc').value = p.desc;
    if (el('field-img')) el('field-img').value = p.img;
    
    if (p.img && el('img-preview')) {
      el('img-preview').src = p.img;
      el('img-preview-wrap')?.classList.add('has-img');
    }
  } else {
    if (el('modal-title')) el('modal-title').textContent = 'Nuevo Producto';
    if (el('modal-sub')) el('modal-sub').textContent = 'Completa los datos.';
  }
  el('modal-product')?.classList.add('open');
  el('field-name')?.focus();
}

async function saveProduct() {
  const n = el('field-name')?.value.trim();
  const c = el('field-cat')?.value;
  const pr = parseFloat(el('field-price')?.value || '0');
  const d = parseInt(el('field-discount')?.value || '0') || 0;
  const s = el('field-status')?.value || 'activo';
  const ds = el('field-desc')?.value.trim() || '';
  const i = el('field-img')?.value.trim() || el('img-preview')?.src || '';
  
  if (!n) { showToast('Nombre requerido', 'err'); return el('field-name')?.focus(); }
  if (!c) { showToast('Categoría requerida', 'err'); return el('field-cat')?.focus(); }
  if (!pr || pr <= 0) { showToast('Precio inválido', 'err'); return el('field-price')?.focus(); }
  
  const payload = { name: n, category: c, price: pr, discount: d, status: s, desc: ds, img: i };
  
  if (state.editingId) {
    const res = await apiSaveProduct(payload, state.editingId);
    if (res) {
      const p = state.products.find(x => x.id === state.editingId);
      if (p) Object.assign(p, res);
      showToast(`"${n}" actualizado ✓`);
    } else {
      showToast('Error al actualizar producto', 'err');
    }
  } else {
    const res = await apiSaveProduct(payload);
    if (res) {
      state.products.push(res);
      showToast(`"${n}" agregado ✓`);
    } else {
      showToast('Error al agregar producto', 'err');
    }
  }
  closeModal('modal-product');
  if (el('total-badge')) el('total-badge').textContent = state.products.length;
  renderProducts();
}

function openDeleteModal(id) {
  state.deletingId = id;
  const p = state.products.find(x => x.id === id);
  if (el('delete-product-name')) {
    el('delete-product-name').textContent = p ? `"${p.name}"` : '';
  }
  el('modal-delete')?.classList.add('open');
}

async function confirmDelete() {
  const p = state.products.find(x => x.id === state.deletingId);
  if (p) {
    const ok = await apiDeleteProduct(state.deletingId);
    if (ok) {
      state.products = state.products.filter(x => x.id !== state.deletingId);
      showToast(`"${p.name}" eliminado.`, 'err');
    } else {
      showToast('Error al eliminar producto', 'err');
    }
  }
  closeModal('modal-delete');
  if (el('total-badge')) el('total-badge').textContent = state.products.length;
  renderProducts();
}

function viewProduct(id) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  if (el('view-name')) el('view-name').textContent = p.name;
  if (el('view-cat')) el('view-cat').textContent = CAT_LABEL[p.category] || p.category;
  if (el('view-img')) el('view-img').src = p.img;
  if (el('view-price')) el('view-price').textContent = fmt(p.price);
  
  if (el('view-discount')) {
    el('view-discount').textContent = p.discount > 0 ? `-${p.discount}% · Precio final: ${fmt(p.price)}` : 'Sin descuento';
  }
  
  const st = el('view-status');
  if (st) {
    st.className = `badge badge-${p.status}`;
    st.textContent = p.status === 'activo' ? 'Activo' : 'Inactivo';
  }
  
  if (el('view-desc')) el('view-desc').textContent = p.desc || 'Sin descripción.';
  
  const editBtn = el('view-edit-btn');
  if (editBtn) {
    editBtn.onclick = () => { closeModal('modal-view'); openModal('edit', p.id); };
  }
  el('modal-view')?.classList.add('open');
}

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
  localStorage.removeItem('userId');
  showToast('Cerrando sesión...', 'ok');
  setTimeout(() => window.location.replace('/'), 1000);
};

function initListeners() {
  el('img-file')?.addEventListener('change', async e => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5242880) return showToast('Imagen > 5MB', 'err');
    
    const fd = new FormData();
    fd.append('image', f);
    
    const token = localStorage.getItem('token');
    try {
      showToast('Subiendo imagen...');
      const res = await fetch(`${CONFIG.apiBase}/products/upload`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        body: fd
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al subir imagen');
      }
      const data = await res.json();
      el('img-preview').src = data.url;
      el('img-preview-wrap').classList.add('has-img');
      el('field-img').value = data.url;
      showToast('Imagen subida con éxito ✓');
    } catch (err) {
      showToast(err.message || 'Error al subir imagen', 'err');
      console.error(err);
    }
  });

  el('field-img')?.addEventListener('input', e => {
    const u = e.target.value.trim();
    if (u) {
      if (el('img-preview')) el('img-preview').src = u;
      el('img-preview-wrap')?.classList.add('has-img');
    } else {
      el('img-preview-wrap')?.classList.remove('has-img');
    }
  });

  el('hamburger-admin')?.addEventListener('click', () => {
    el('sidebar')?.classList.add('open');
    el('sidebar-backdrop')?.classList.add('open');
  });

  el('sidebar-backdrop')?.addEventListener('click', closeSidebar);
  
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeSidebar();
      closeAllModals();
    }
  });

  $$('[data-page]').forEach(e => e.addEventListener('click', () => navTo(e.dataset.page)));

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-action]');
    const pb = e.target.closest('.page-btn[data-page]');
    if (b) {
      const { action, id } = b.dataset;
      const n = +id;
      if (action === 'view') viewProduct(n);
      if (action === 'edit') openModal('edit', n);
      if (action === 'delete') openDeleteModal(n);
    }
    if (pb) {
      state.currentPage = +pb.dataset.page;
      renderProducts();
    }
  });

  $$('.modal-overlay').forEach(m => m.addEventListener('click', e => {
    if (e.target === m) m.classList.remove('open');
  }));

  ['prod-search', 'cat-filter', 'status-filter'].forEach(i => el(i)?.addEventListener('input', () => {
    state.currentPage = 1;
    renderProducts();
  }));

  el('btn-new-product')?.addEventListener('click', () => openModal('add'));
  el('btn-save-product')?.addEventListener('click', saveProduct);
  el('btn-confirm-delete')?.addEventListener('click', confirmDelete);
  el('btn-go-home')?.addEventListener('click', () => window.location.href = '/');
  el('btn-logout')?.addEventListener('click', handleLogout);
  el('btn-logout-sidebar')?.addEventListener('click', handleLogout);
}

document.addEventListener('DOMContentLoaded', async () => {
  await apiLoadProducts();
  initListeners();
  navTo('productos');
  if (el('total-badge')) el('total-badge').textContent = state.products.length;
});

const SEED_PRODUCTS = [
  {id:1,name:'Vestido de Gala Seda',category:'mujer',price:3679.15,discount:0,status:'activo',img:'imagen/vestido-gala-seda .png',desc:'Seda natural. S–XL.'},
  {id:2,name:'Traje Lino Italiano',category:'hombre',price:8800,discount:0,status:'activo',img:'imagen/traje_hombre.png',desc:'Corte slim.'},
  {id:3,name:'Conjunto Niño Premium',category:'nino',price:3200,discount:0,status:'activo',img:'imagen/conjunto-niño.png',desc:'Algodón orgánico.'},
  {id:4,name:'Falda Plisada Larga',category:'mujer',price:2800,discount:0,status:'activo',img:'imagen/falda-elegante.png',desc:'Gasa de poliéster.'},
  {id:5,name:'Vestido Midi Floral',category:'mujer',price:2660,discount:30,status:'activo',img:'imagen/Vestido Midi Floral.png',desc:'Manga corta.'},
  {id:6,name:'Blusa de Seda Estampada',category:'mujer',price:1875,discount:25,status:'activo',img:'imagen/blusa de seda.png',desc:'Cierre espalda.'},
  {id:7,name:'Accesorios Mujer',category:'accesorios',price:1520,discount:20,status:'activo',img:'imagen/asesorios de mujer .png',desc:'Bolso + collar.'},
  {id:8,name:'Camisa Casual de Rayas',category:'hombre',price:1520,discount:20,status:'activo',img:'imagen/camisa-casual-hombre.png',desc:'Rayas verticales.'},
  {id:9,name:'Pantalón Chino Verde',category:'hombre',price:2040,discount:15,status:'activo',img:'imagen/pantalon-verde-hombres.png',desc:'Color salvia.'},
  {id:10,name:'Accesorios Hombre',category:'accesorios',price:715,discount:35,status:'activo',img:'imagen/accesorio de hombre.png',desc:'Cinturón + pañuelo.'},
  {id:11,name:'Camisa Casual Niño',category:'nino',price:2660,discount:30,status:'activo',img:'imagen/camisa casual de niño.png',desc:'Algodón cómoda.'},
  {id:12,name:'Short Casual Niño',category:'nino',price:1875,discount:25,status:'activo',img:'imagen/short casual de niño .png',desc:'Bolsillos laterales.'},
  {id:13,name:'Accesorios Niño',category:'accesorios',price:1520,discount:20,status:'activo',img:'imagen/accesorio de niño .png',desc:'Mochila + gorra.'}
];