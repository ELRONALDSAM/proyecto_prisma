'use strict';

let cart = [], currentUser = null, currentUserId = null, currentUserRole = null, wishlist = {};
let favoriteIdMap = {};
let productIdToProduct = {};


function shippingKey() {
  return currentUser ? `prisma_shipping_${currentUser}` : 'prisma_shipping_guest';
}

function saveShippingData(data) {
  try { localStorage.setItem(shippingKey(), JSON.stringify(data)); } catch(e) {}
}

function loadShippingData() {
  try {
    const d = localStorage.getItem(shippingKey());
    return d ? JSON.parse(d) : null;
  } catch(e) { return null; }
}

function clearShippingData() {
  try { localStorage.removeItem(shippingKey()); } catch(e) {}
}

/* ══════════════════════════════════
   PERSISTENCIA GENERAL
   ══════════════════════════════════ */
function saveWishlist() {
  try { localStorage.setItem('prisma_wishlist', JSON.stringify(wishlist)); } catch(e) {}
}
function loadWishlist() {
  try { const d = localStorage.getItem('prisma_wishlist'); if(d) wishlist = JSON.parse(d); } catch(e) {}
}
function saveUser(userId, role) {
  try { 
    if(currentUser) {
      localStorage.setItem('prisma_user', currentUser);
      if (userId) {
        localStorage.setItem('userId', userId);
        currentUserId = parseInt(userId);
      }
      if (role) {
        localStorage.setItem('role', role);
        currentUserRole = role;
      }
    } else {
      localStorage.removeItem('prisma_user');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      currentUserId = null;
      currentUserRole = null;
    }
  } catch(e) {}
}
function loadUser() {
  try { 
    currentUser = localStorage.getItem('prisma_user') || null; 
    currentUserId = parseInt(localStorage.getItem('userId')) || null;
    currentUserRole = localStorage.getItem('role') || null;
  } catch(e) {}
}

const $ = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => [...c.querySelectorAll(s)];
const fmt = n => 'C$ ' + parseFloat(n).toLocaleString('es-NI', {minimumFractionDigits:2, maximumFractionDigits:2});

function showToast(msg, type='success') {
  const t = $('#toast');
  t.textContent = msg;
  t.className = `toast toast--${type} show`;
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 3500);
}

const openModal  = id => { const m=document.getElementById(id); if(m){ m.classList.add('active'); document.body.style.overflow='hidden'; } };
const closeModal = m  => { if(!m) return; m.classList.remove('active'); if(!$$('.modal.active').length) document.body.style.overflow=''; };
const closeAll   = () => $$('.modal.active').forEach(closeModal);

document.addEventListener('click', e => {
  if(e.target.closest('[data-close-modal]')) { closeModal(e.target.closest('.modal')); return; }
  if(e.target.classList.contains('modal') && e.target.classList.contains('active')) closeModal(e.target);
});
document.addEventListener('keydown', e => { if(e.key==='Escape') closeAll(); });

/* ── HEADER / NAV ── */
(function() {
  const header = $('#header'), ham = $('#hamburger'), nav = $('#main-nav');
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY>40), {passive:true});
  ham?.addEventListener('click', () => { const o=nav.classList.toggle('open'); ham.setAttribute('aria-expanded',o); document.body.style.overflow=o?'hidden':''; });
  $$('#main-nav a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); document.body.style.overflow=''; }));
})();

/* ── CARRUSEL ── */
(function() {
  const track=$('#carousel-track'), slides=$$('.carousel__slide'), dots=$('#carousel-dots');
  if(!track||!slides.length) return;
  let cur=0, auto;
  slides.forEach((_,i) => { const d=document.createElement('button'); d.className='dot'+(i===0?' active':''); d.addEventListener('click',()=>go(i)); dots.appendChild(d); });
  const go = i => { cur=(i+slides.length)%slides.length; track.style.transform=`translateX(-${cur*100}%)`; $$('.dot',dots).forEach((d,i)=>d.classList.toggle('active',i===cur)); };
  const stop=()=>clearInterval(auto), start=()=>{auto=setInterval(()=>go(cur+1),5500);};
  $('#prev-btn')?.addEventListener('click',()=>{stop();go(cur-1);start();});
  $('#next-btn')?.addEventListener('click',()=>{stop();go(cur+1);start();});
  let sx=0;
  track.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;},{passive:true});
  track.addEventListener('touchend',e=>{const d=sx-e.changedTouches[0].clientX; if(Math.abs(d)>50){stop();go(cur+(d>0?1:-1));start();}});
  start();
})();

/* ── UTILIDADES DE VALIDACIÓN DE CAMPOS ── */
function setFieldError(input, hasError) {
  if(!input) return;
  input.classList.toggle('input-error', hasError);
  input.classList.toggle('input-ok',    !hasError);
}
function showFormMsg(formId, msg, type='error') {
  let el = document.getElementById(formId+'-msg');
  if(!el) { el=document.createElement('p'); el.id=formId+'-msg'; el.className='form-msg'; const form=document.getElementById(formId); form?.appendChild(el); }
  el.textContent = msg;
  el.className = 'form-msg form-msg--'+type;
  el.style.display = msg ? '' : 'none';
}
function clearFormMsg(formId) { showFormMsg(formId,''); }

/* ── CONTRASEÑA ── */
function getPasswordIssues(password) {
  const issues = [];
  if (password.length < 8) issues.push('al menos 8 caracteres');
  if (!/[A-Z]/.test(password)) issues.push('una letra mayúscula');
  if (!/[0-9]/.test(password)) issues.push('un número');
  return issues;
}
function isPasswordValid(password) { return getPasswordIssues(password).length === 0; }
function getPasswordStrengthLevel(password) {
  if (!password) return null;
  const issuesCount = getPasswordIssues(password).length;
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  if (issuesCount > 0) return 'weak';
  if (password.length >= 12 && hasSymbol) return 'strong';
  return 'medium';
}

/* ── OJO CONTRASEÑA ── */
$$('.toggle-password-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    if (!input) return;
    const willShow = input.type === 'password';
    input.type = willShow ? 'text' : 'password';
    btn.classList.toggle('is-visible', willShow);
    btn.querySelector('i').className = willShow ? 'fas fa-eye-slash' : 'far fa-eye';
    btn.setAttribute('aria-label', willShow ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });
});

const regPasswordInput = $('#reg-password');
const strengthBar = $('#password-strength-bar');
regPasswordInput?.addEventListener('input', () => {
  const val = regPasswordInput.value;
  const level = getPasswordStrengthLevel(val);
  if (!strengthBar) return;
  strengthBar.className = 'password-strength' + (level ? ` strength-${level}` : '');
});

/* ══════════════════════════════════
   USUARIO — UI
══════════════════════════════════ */
function updateUserUI() {
  const show = !!currentUser;
  const loginTrigger = $('#login-trigger');
  const userGreeting = $('#user-greeting');
  if(loginTrigger) loginTrigger.style.display = show ? 'none' : '';
  if(userGreeting)  userGreeting.style.display = show ? 'flex' : 'none';
  if(show && $('#user-name-display')) $('#user-name-display').textContent = '¡Hola, '+currentUser+'!';

  const isAdmin = show && currentUserRole === 'ADMIN';

  // Desktop Link
  let adminLinkDesktop = $('#admin-link-desktop');
  if (isAdmin) {
    if (!adminLinkDesktop) {
      adminLinkDesktop = document.createElement('a');
      adminLinkDesktop.id = 'admin-link-desktop';
      adminLinkDesktop.href = '/admin';
      adminLinkDesktop.style.color = '#F4C542';
      adminLinkDesktop.style.fontWeight = '600';
      adminLinkDesktop.style.textDecoration = 'underline';
      adminLinkDesktop.style.margin = '0 10px';
      adminLinkDesktop.textContent = 'Panel Admin';
      const userDisplay = $('#user-name-display');
      if (userDisplay) {
        userDisplay.insertAdjacentElement('afterend', adminLinkDesktop);
      }
    }
  } else {
    if (adminLinkDesktop) {
      adminLinkDesktop.remove();
    }
  }

  // Mobile Link
  let adminLinkMobile = $('#nav-admin-link');
  if (isAdmin) {
    if (!adminLinkMobile) {
      adminLinkMobile = document.createElement('a');
      adminLinkMobile.id = 'nav-admin-link';
      adminLinkMobile.href = '/admin';
      adminLinkMobile.className = 'nav-account-item';
      adminLinkMobile.style.color = '#F4C542';
      adminLinkMobile.style.fontWeight = '600';
      adminLinkMobile.innerHTML = '<i class="fas fa-user-shield"></i> Panel Admin';
      const navGreeting = $('.nav-account-greeting');
      if (navGreeting) {
        navGreeting.insertAdjacentElement('afterend', adminLinkMobile);
      }
    }
  } else {
    if (adminLinkMobile) {
      adminLinkMobile.remove();
    }
  }

  // Sincronización con el dropdown de cuenta
  const dropdownGuestMenu = $('#dropdown-guest-menu');
  const dropdownUserMenu = $('#dropdown-user-menu');
  const dropdownUsername = $('#dropdown-username');
  if(dropdownGuestMenu) dropdownGuestMenu.style.display = show ? 'none' : 'block';
  if(dropdownUserMenu) dropdownUserMenu.style.display = show ? 'block' : 'none';
  if(show && dropdownUsername) dropdownUsername.textContent = currentUser;

  // Sincronización con la sección Cuenta en el menú móvil (hamburguesa)
  const navGuestMenu = $('#nav-guest-menu');
  const navUserMenu = $('#nav-user-menu');
  const navUsername = $('#nav-username');
  if(navGuestMenu) navGuestMenu.style.display = show ? 'none' : 'block';
  if(navUserMenu) navUserMenu.style.display = show ? 'block' : 'none';
  if(show && navUsername) navUsername.textContent = currentUser;
}

async function loadUserDataFromServer() {
  if (!currentUser || !currentUserId) return;
  const token = localStorage.getItem('token');
  if (!token) return;
  
  try {
    const res = await fetch(`/users/${currentUserId}`, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    if (res.ok) {
      const data = await res.json();
      console.log('[loadUserDataFromServer] Datos del usuario recibidos:', data);
      
      if (data.direccion || data.telefono || data.ciudad || data.departamento || data.notas) {
        const shippingData = {
          name: data.nombre,
          phone: data.telefono || '',
          email: data.email || '',
          address: data.direccion || '',
          city: data.ciudad || '',
          dept: data.departamento || '',
          notes: data.notas || '',
          savedAt: new Date().toISOString()
        };
        saveShippingData(shippingData);
        populateCheckoutShippingSummary(shippingData);
        prefillShippingForm();
      }
    }
  } catch (err) {
    console.error('Error al cargar datos de usuario desde el servidor:', err);
  }
}

/* ── LOGIN ── */
$('#login-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  clearFormMsg('login-form');
  const userInput = $('#username');
  const passInput = $('#password');
  const email = userInput.value.trim();
  const password = passInput.value;

  if (!email || !password) { showFormMsg('login-form', 'Por favor complete todos los campos.', 'error'); return; }

  const passwordIssues = getPasswordIssues(password);
  if (passwordIssues.length) {
    setFieldError(passInput.closest('.password-field') || passInput, true);
    showFormMsg('login-form', 'La contraseña debe tener ' + passwordIssues.join(', ') + '.', 'error');
    return;
  }
  setFieldError(passInput.closest('.password-field') || passInput, false);

  try {
    const response = await fetch('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.id);
      localStorage.setItem('role', data.role || 'CLIENTE');
      document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Strict`;
      currentUser = data.nombre;
      saveUser(data.id, data.role || 'CLIENTE');
      updateUserUI();
      loadFavorites();
      loadCartFromServer();
      loadUserDataFromServer();
      closeModal($('#login-modal'));
      showToast('¡Inicio de sesión exitoso!', 'success');
      e.target.reset();
      if (data.role === 'ADMIN' || data.role === 'admin') window.location.href = '/admin';
    } else {
      showFormMsg('login-form', data.error || 'Email o contraseña incorrectos', 'error');
    }
  } catch (error) {
    console.error(error);
    showFormMsg('login-form', 'Error al conectar con el servidor', 'error');
  }
});

$$('#login-form input').forEach(inp => inp.addEventListener('input', () => {
  setFieldError(inp, false);
  setFieldError($('#password')?.closest('.password-field'), false);
  clearFormMsg('login-form');
}));

/* ── LOGOUT ── */
$('#logout-btn')?.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('token');
  document.cookie = "token=; path=/; max-age=0; SameSite=Strict";
  saveUser();
  wishlist = {};
  favoriteIdMap = {};
  saveWishlist();
  updateUserUI();
  $$('.product-card__wishlist').forEach(b => {
    b.classList.remove('active');
    b.querySelector('i').className = 'far fa-heart';
    const c = b.querySelector('.like-count');
    if(c) c.remove();
  });
  updateFavIcon();
  renderFavoritesSection();
  showToast('Sesión cerrada. ¡Hasta pronto!');
});

/* ── ABRIR REGISTRO ── */
$('#open-register-btn')?.addEventListener('click', e => {
  e.preventDefault();
  closeModal($('#login-modal'));
  openModal('register-modal');
});
$('#back-to-login')?.addEventListener('click', e => {
  e.preventDefault();
  closeModal($('#register-modal'));
  openModal('login-modal');
});

/* ── REGISTRO ── */
$('#register-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  clearFormMsg('register-form');
  const nameInp  = $('#reg-fullname');
  const emailInp = $('#reg-email');
  const userInp  = $('#reg-username');
  const passInp  = $('#reg-password');
  const pass2Inp = $('#reg-password2');
  const name  = nameInp.value.trim();
  const email = emailInp.value.trim();
  const pass  = passInp.value;
  const pass2 = pass2Inp.value;
  let hasEmpty = false;
  [nameInp, emailInp, userInp, passInp, pass2Inp].forEach(inp => {
    if(!inp.value.trim()) { setFieldError(inp, true); hasEmpty = true; }
    else { setFieldError(inp, false); }
  });
  if(hasEmpty) { showFormMsg('register-form','Por favor complete todos los campos.','error'); return; }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError(emailInp, true); showFormMsg('register-form','Ingresa un correo electrónico válido.','error'); return; }
  const passwordIssues = getPasswordIssues(pass);
  if (passwordIssues.length) {
    setFieldError(passInp.closest('.password-field') || passInp, true);
    showFormMsg('register-form', 'La contraseña debe tener ' + passwordIssues.join(', ') + '.', 'error');
    return;
  }
  setFieldError(passInp.closest('.password-field') || passInp, false);
  if(pass !== pass2) {
    setFieldError(pass2Inp.closest('.password-field') || pass2Inp, true);
    showFormMsg('register-form','Las contraseñas no coinciden.','error');
    return;
  }
  setFieldError(pass2Inp.closest('.password-field') || pass2Inp, false);
  try {
    const response = await fetch('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: name, email: email, password: pass })
    });
    const data = await response.json();
    if(response.ok) {
      currentUser = name;
      saveUser(data.id);
      updateUserUI();
      loadFavorites();
      loadCartFromServer();
      closeModal($('#register-modal'));
      showToast('¡Cuenta creada correctamente!', 'success');
      e.target.reset();
      strengthBar?.classList.remove('strength-weak','strength-medium','strength-strong');
    } else {
      showFormMsg('register-form', data.error || 'Error al registrar usuario', 'error');
    }
  } catch(error) {
    console.error(error);
    showFormMsg('register-form', 'Error al conectar con el servidor', 'error');
  }
});

$$('#register-form input').forEach(inp => inp.addEventListener('input', () => {
  setFieldError(inp, false);
  setFieldError($('#reg-password')?.closest('.password-field'), false);
  setFieldError($('#reg-password2')?.closest('.password-field'), false);
  clearFormMsg('register-form');
}));

/* ══════════════════════════════════
   BÚSQUEDA
══════════════════════════════════ */
function getAllProductData() {
  const cards = $$('[data-name]');
  return cards.map(c => ({
    id:       c.dataset.productId ? parseInt(c.dataset.productId) : null,
    name:     c.dataset.name     || '',
    price:    c.dataset.price    || '',
    img:      c.dataset.img      || '',
    desc:     c.dataset.desc     || '',
    category: c.dataset.category || '',
    badge:    c.querySelector('.offer-card__badge')?.textContent || '',
  })).filter((v,i,a) => a.findIndex(x=>x.name===v.name)===i);
}

function openSearchModal() {
  openModal('search-modal');
  setTimeout(() => $('#search-input')?.focus(), 100);
}

function runSearch(query) {
  const q = query.trim().toLowerCase();
  const resultBox = $('#search-results');
  if(!resultBox) return;
  if(!q) { resultBox.innerHTML = '<p class="search-hint">Escribe el nombre de un producto para buscarlo.</p>'; return; }
  const allProducts = getAllProductData();
  const matches = allProducts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    (p.desc && p.desc.toLowerCase().includes(q))
  );
  if(!matches.length) {
    resultBox.innerHTML = '<p class="search-no-results"><i class="fas fa-search-minus"></i> No se encontraron productos para "<strong>'+query+'</strong>".</p>';
    return;
  }
  resultBox.innerHTML = `<p class="search-count">${matches.length} resultado${matches.length!==1?'s':''} para "<strong>${query}</strong>"</p>
  <div class="search-grid">
    ${matches.map(p=>`
    <div class="search-product-card" data-product-id="${p.id || ''}" data-name="${p.name}" data-price="${p.price}" data-img="${p.img}" data-desc="${p.desc}" data-category="${p.category}" data-badge="${p.badge}">
      <div class="search-product-img"><img src="${p.img}" alt="${p.name}"/>${p.badge?`<span class="offer-card__badge">${p.badge}</span>`:''}</div>
      <div class="search-product-info">
        <h4>${p.name}</h4>
        <p class="search-product-cat">${p.category||'Producto'}</p>
        <p class="search-product-price">${fmt(p.price)}</p>
        <div class="search-product-btns">
          <button class="btn btn-primary btn-sm btn-add-cart">Añadir al carrito</button>
          <button class="btn btn-outline btn-sm btn-search-detail">Ver detalle</button>
        </div>
      </div>
    </div>`).join('')}
  </div>`;
}

function injectSearchModal() {
  const html = `
  <div id="search-modal" class="modal" role="dialog" aria-modal="true">
    <div class="modal__backdrop" data-close-modal></div>
    <div class="modal__box modal__box--search">
      <button class="modal__close" data-close-modal><i class="fas fa-times"></i></button>
      <div class="search-modal-header">
        <div class="search-input-wrap">
          <i class="fas fa-search search-icon-inner"></i>
          <input type="text" id="search-input" placeholder="Buscar productos..." autocomplete="off"/>
          <button id="search-clear-btn" aria-label="Limpiar"><i class="fas fa-times-circle"></i></button>
        </div>
      </div>
      <div id="search-results"><p class="search-hint">Escribe el nombre de un producto para buscarlo.</p></div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  const input = $('#search-input');
  input?.addEventListener('input', () => {
    const q = input.value;
    $('#search-clear-btn').style.display = q ? '' : 'none';
    runSearch(q);
  });
  input?.addEventListener('keydown', e => { if(e.key==='Enter') runSearch(input.value); });
  $('#search-clear-btn')?.addEventListener('click', () => { input.value=''; input.focus(); $('#search-clear-btn').style.display='none'; runSearch(''); });
  document.addEventListener('click', e => {
    const detailBtn = e.target.closest('.btn-search-detail');
    if(detailBtn) {
      const card = detailBtn.closest('[data-name]');
      if(card) {
        closeModal($('#search-modal'));
        const id = card.dataset.productId ? parseInt(card.dataset.productId) : null;
        openProductModal(id, card.dataset.name, card.dataset.price, card.dataset.img, card.dataset.desc, card.dataset.badge, card.dataset.category);
      }
      return;
    }
    if(e.target.closest('.btn-add-cart')||e.target.closest('.btn-search-detail')) return;
    const sCard = e.target.closest('.search-product-card');
    if(sCard) {
      closeModal($('#search-modal'));
      const id = sCard.dataset.productId ? parseInt(sCard.dataset.productId) : null;
      openProductModal(id, sCard.dataset.name, sCard.dataset.price, sCard.dataset.img, sCard.dataset.desc, sCard.dataset.badge, sCard.dataset.category);
    }
  });
}

document.querySelector('.icon-btn[aria-label="Buscar"]')?.addEventListener('click', openSearchModal);

/* ══════════════════════════════════
   FAVORITOS
══════════════════════════════════ */
function updateFavIcon() {
  const total = Object.values(wishlist).filter(Boolean).length;
  const ico = document.querySelector('.icon-btn[aria-label="Favoritos"] i');
  if(ico){ ico.className=total>0?'fas fa-heart':'far fa-heart'; ico.style.color=total>0?'var(--coral)':''; }
}

function renderFavoritesSection() {
  const sec = $('#favorites-section');
  if(!sec) return;
  const favNames = Object.keys(wishlist).filter(k=>wishlist[k]);
  if(!favNames.length) { sec.style.display = 'none'; return; }
  sec.style.display = '';
  const allProducts = getAllProductData();
  const favItems = favNames.map(name => allProducts.find(p=>p.name===name)).filter(Boolean);
  const grid = $('#favorites-grid');
  if(!grid) return;
  grid.innerHTML = favItems.map(p=>`
    <div class="product-card" data-product-id="${p.id || ''}" data-name="${p.name}" data-price="${p.price}" data-img="${p.img}" data-desc="${p.desc}" data-category="${p.category}">
      <div class="product-card__img-wrap">
        <img src="${p.img}" alt="${p.name}"/>
        <button class="product-card__wishlist active" aria-label="Favorito"><i class="fas fa-heart"></i></button>
      </div>
      <div class="product-card__info">
        <h3>${p.name}</h3>
        <p class="product-card__price">${fmt(p.price)}</p>
        <button class="btn btn-primary btn-sm btn-add-cart">Añadir al carrito</button>
      </div>
    </div>`).join('');
}

function injectFavoritesSection() {
  const section = `
  <section id="favorites-section" class="section favoritos" style="display:none">
    <div class="section__header">
      <span class="section__tag">Guardados</span>
      <h2 class="section__title">Mis Favoritos</h2>
      <p class="section__desc">Los productos que marcaste con <i class="fas fa-heart" style="color:var(--coral)"></i> aparecen aquí.</p>
    </div>
    <div class="products-grid" id="favorites-grid"></div>
    <div class="section__cta"><button class="btn btn-outline" id="clear-favorites-btn"><i class="far fa-trash-alt"></i> Limpiar favoritos</button></div>
  </section>`;
  const blogSection = $('#blog');
  if(blogSection) blogSection.insertAdjacentHTML('beforebegin', section);
  else document.querySelector('footer')?.insertAdjacentHTML('beforebegin', section);

  $('#clear-favorites-btn')?.addEventListener('click', () => {
    wishlist = {};
    saveWishlist();
    updateFavIcon();
    renderFavoritesSection();
    $$('.product-card__wishlist.active, .offer-card__wishlist.active').forEach(b=>{
      b.classList.remove('active');
      b.querySelector('i').className='far fa-heart';
    });
    showToast('Favoritos vaciados.');
  });

  const navList = $('.nav-list');
  if(navList) {
    const li = document.createElement('li');
    li.innerHTML = '<a href="#favorites-section">Favoritos</a>';
    const items = navList.querySelectorAll('li');
    const contactItem = [...items].find(i=>i.querySelector('a[href="#contacto"]'));
    if(contactItem) navList.insertBefore(li, contactItem);
    else navList.appendChild(li);
  }
}

// Map to cache product IDs from database
let productMap = {};

// Load product map from backend
function loadProductMap() {
  return fetch('/products')
    .then(res => res.json())
    .then(products => {
      products.forEach(p => {
        productMap[p.name.toLowerCase().trim()] = p.id;
        productIdToProduct[p.id] = p;
      });
      renderDynamicProducts(products);
    })
    .catch(err => console.error('Error al cargar mapa de productos:', err));
}

function renderDynamicProducts(products) {
  const activeProducts = products.filter(p => p.status === 'activo');

  // Render Catalog
  const grid = document.getElementById('products-grid');
  if (grid) {
    grid.innerHTML = activeProducts.map(p => `
      <div class="product-card" data-product-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-img="${p.img}" data-desc="${p.desc}" data-category="${p.category}">
        <div class="product-card__img-wrap">
          <img src="${p.img}" alt="${p.name}"/>
          <button class="product-card__wishlist" aria-label="Favorito"><i class="far fa-heart"></i></button>
          <button class="product-card__quick" data-action="quick-view">Vista rápida</button>
        </div>
        <div class="product-card__info">
          <h3>${p.name}</h3>
          <p class="product-card__price">${fmt(p.price)}</p>
          <button class="btn btn-primary btn-sm btn-add-cart">Añadir al carrito</button>
        </div>
      </div>
    `).join('');
  }

  // Render Offers
  const renderOffersGrid = (category, containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const offers = activeProducts.filter(p => p.category === category && p.discount > 0);
    container.innerHTML = offers.map(p => {
      const badgeText = `-${p.discount}%`;
      const originalPrice = p.precioAnterior || (p.price / (1 - p.discount / 100));
      return `
        <div class="offer-card" data-product-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-img="${p.img}" data-desc="${p.desc}" data-category="${p.category}">
          <div class="offer-card__badge">${badgeText}</div>
          <div class="offer-card__img-wrap">
            <img src="${p.img}" alt="${p.name}"/>
          </div>
          <div class="offer-card__info">
            <h4>${p.name}</h4>
            <div class="offer-card__prices">
              <span class="price-original">${fmt(originalPrice)}</span>
              <span class="price-offer">${fmt(p.price)}</span>
            </div>
            <button class="btn btn-primary btn-sm btn-add-cart">Agregar</button>
          </div>
        </div>
      `;
    }).join('');
  };

  renderOffersGrid('mujer', 'offers-grid-mujer');
  renderOffersGrid('hombre', 'offers-grid-hombre');
  renderOffersGrid('nino', 'offers-grid-nino');

  // Trigger heart update to ensure they match backend wishlist
  syncWishlistHearts();
  
  // Re-observe scroll animations
  initScrollAnimations();
}

function initScrollAnimations() {
  const targets = $$('.product-card:not(.ah),.offer-card:not(.ah),.cat-card:not(.ah),.blog-card:not(.ah),.section__header:not(.ah)');
  if (targets.length === 0) return;
  
  if (!window.scrollObserver) {
    const style = document.createElement('style');
    style.textContent = '.ah{opacity:0;transform:translateY(30px);transition:opacity .6s ease,transform .6s ease}.ah.av{opacity:1;transform:translateY(0)}';
    document.head.appendChild(style);

    window.scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach((en, i) => {
        if (en.isIntersecting) {
          setTimeout(() => en.target.classList.add('av'), i * 60);
          window.scrollObserver.unobserve(en.target);
        }
      });
    }, { threshold: 0.1 });
  }
  
  targets.forEach(el => {
    el.classList.add('ah');
    window.scrollObserver.observe(el);
  });
}

// Get ID by name (fuzzy matching helper)
function getProductIdByName(name) {
  if (!name) return 1;
  const lowerName = name.toLowerCase().trim();
  if (productMap[lowerName]) return productMap[lowerName];
  // Substring match
  const key = Object.keys(productMap).find(k => k.includes(lowerName) || lowerName.includes(k));
  if (key) return productMap[key];
  return 1;
}

// Fetch favorites from backend and sync with wishlist
function loadFavorites() {
  if (!currentUserId) {
    wishlist = {};
    favoriteIdMap = {};
    saveWishlist();
    updateFavIcon();
    renderFavoritesSection();
    syncWishlistHearts();
    return;
  }
  console.log(`[loadFavorites] Cargando favoritos para el usuario ID: ${currentUserId}`);
  fetch(`/favorites?userId=${currentUserId}`)
    .then(res => res.json())
    .then(favorites => {
      console.log('[loadFavorites] Favoritos recibidos del backend:', favorites);
      wishlist = {};
      favoriteIdMap = {};
      favorites.forEach(fav => {
        if (fav.product) {
          const name = fav.product.name || fav.product.nombre;
          if (name) {
            wishlist[name] = true;
            favoriteIdMap[fav.productId] = fav.id;
          }
        }
      });
      saveWishlist();
      updateFavIcon();
      renderFavoritesSection();
      syncWishlistHearts();
    })
    .catch(err => console.error('[loadFavorites] Error al cargar favoritos:', err));
}

function syncFavoritesWithServer() {
  loadFavorites();
}

function loadCartFromServer() {
  if (!currentUserId) {
    cart = [];
    updateCartUI();
    updateCheckoutUI();
    return;
  }
  console.log(`[loadCart] Cargando carrito de la DB para el usuario ID: ${currentUserId}`);
  fetch(`/cart?userId=${currentUserId}`)
    .then(res => res.json())
    .then(dbCartItems => {
      console.log('[loadCart] Carrito recibido del backend:', dbCartItems);
      cart = [];
      dbCartItems.forEach(item => {
        const prod = productIdToProduct[item.productId];
        if (prod) {
          cart.push({
            id: item.id.toString(),
            dbId: item.id,
            productId: item.productId,
            name: prod.name || prod.nombre,
            price: parseFloat(prod.price || prod.precio),
            img: prod.img || '',
            size: 'M',
            qty: item.quantity
          });
        }
      });
      updateCartUI();
      updateCheckoutUI();
    })
    .catch(err => console.error('[loadCart] Error al cargar carrito:', err));
}

document.addEventListener('click', e => {
  const btn = e.target.closest('.product-card__wishlist, .offer-card__wishlist');
  if(!btn) return;
  e.stopPropagation();
  
  if (!currentUser || !currentUserId) {
    showToast('Inicia sesión para guardar favoritos', 'error');
    openModal('login-modal');
    return;
  }

  const name = btn.closest('[data-name]')?.dataset.name;
  if(!name) return;
  const card = btn.closest('[data-product-id]');
  let prodId = card ? parseInt(card.dataset.productId) : null;
  if (!prodId || isNaN(prodId)) {
    prodId = getProductIdByName(name);
  }
  console.log(`[Click corazón] Producto: "${name}", ID del producto: ${prodId}, User ID: ${currentUserId}`);

  // Toggle wishlist state
  wishlist[name] = !wishlist[name];

  if(wishlist[name]) {
    console.log(`productId enviado desde el frontend: ${prodId}`);
    console.log(`[Click corazón] Guardando favorito en la DB: { userId: ${currentUserId}, productId: ${prodId} }`);
    fetch('/favorites', { 
      method:'POST', 
      headers:{'Content-Type':'application/json'}, 
      body: JSON.stringify({userId: currentUserId, productId: prodId}) 
    })
      .then(res=>res.json())
      .then(data=>{
        console.log('[Click corazón] Favorito guardado en DB:', data);
        if (data && data.id) {
          favoriteIdMap[prodId] = data.id;
        }
        updateFavIcon(); 
        renderFavoritesSection();
      })
      .catch(err=> {
        console.error('[Click corazón] Error al guardar favorito:', err);
        wishlist[name] = false;
        updateFavIcon();
        renderFavoritesSection();
      });
  } else { 
    const favId = favoriteIdMap[prodId];
    if (favId) {
      console.log(`[Click corazón] Eliminando favorito ID: ${favId} para producto: ${name} (ID: ${prodId})`);
      fetch(`/favorites/${favId}`, { 
        method:'DELETE'
      })
        .then(res=>res.json())
        .then(data=>{
          console.log('[Click corazón] Favorito eliminado de DB:', data);
          delete favoriteIdMap[prodId];
          delete wishlist[name];
          updateFavIcon(); 
          renderFavoritesSection();
        })
        .catch(err=> {
          console.error('[Click corazón] Error al eliminar favorito:', err);
          wishlist[name] = true;
          updateFavIcon();
          renderFavoritesSection();
        });
    } else {
      console.warn(`[Click corazón] No se encontró ID de favorito en favoriteIdMap para el producto ID: ${prodId}.`);
      delete wishlist[name];
      updateFavIcon(); 
      renderFavoritesSection();
    }
  }
  
  saveWishlist();
  const ico = btn.querySelector('i');
  if(wishlist[name]) {
    btn.classList.add('active'); ico.className = 'fas fa-heart';
    showToast('Añadido a favoritos: ' + name);
  } else {
    btn.classList.remove('active'); ico.className='far fa-heart';
    showToast('Eliminado de favoritos');
  }
  updateFavIcon(); renderFavoritesSection();
});

document.querySelector('.icon-btn[aria-label="Favoritos"]')?.addEventListener('click', () => {
  const sec = $('#favorites-section');
  if(sec && sec.style.display !== 'none') sec.scrollIntoView({behavior:'smooth', block:'start'});
  else showToast('Aún no tienes favoritos. ¡Marca con el corazón los que te gusten!', 'success');
});

function syncWishlistHearts() {
  $$('[data-name]').forEach(card => {
    const name = card.dataset.name; if(!name) return;
    const btn = card.querySelector('.product-card__wishlist, .offer-card__wishlist'); if(!btn) return;
    if(wishlist[name]) { btn.classList.add('active'); btn.querySelector('i').className = 'fas fa-heart'; }
  });
}

/* ══════════════════════════════════
   CARRITO
══════════════════════════════════ */
function updateCartUI() {
  const count=cart.reduce((s,i)=>s+i.qty,0), total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const ce=$('#cart-count'); ce.textContent=count; ce.classList.toggle('visible',count>0);
  const con=$('#cart-items-container'), cb=$('#checkout-button');
  if(!con) return;
  if(!cart.length) { con.innerHTML='<p class="empty-cart-msg">Tu carrito está vacío.</p>'; cb.disabled=true; }
  else {
    con.innerHTML=cart.map(i=>`<div class="cart-item" data-id="${i.id}"><div class="cart-item__img"><img src="${i.img}" alt="${i.name}"/></div><div class="cart-item__info"><h4>${i.name}</h4><p>Talla: ${i.size} · Cant: ${i.qty}</p></div><div><div class="cart-item__price">${fmt(i.price*i.qty)}</div><span class="cart-item__remove" data-remove="${i.id}">Eliminar</span></div></div>`).join('');
    $$('[data-remove]',con).forEach(b=>b.addEventListener('click',()=>{
      const cartItemId = parseInt(b.dataset.remove);
      if (!isNaN(cartItemId)) {
        console.log(`[Eliminar del carrito] Enviando DELETE a /cart/${cartItemId}`);
        fetch(`/cart/${cartItemId}`, { method: 'DELETE' })
          .then(res => res.json())
          .then(data => {
            console.log('[Eliminar del carrito] Respuesta recibida:', data);
            cart = cart.filter(i=>i.id!==b.dataset.remove);
            updateCartUI();
            updateCheckoutUI();
          })
          .catch(err => console.error('[Eliminar del carrito] Error:', err));
      } else {
        cart = cart.filter(i=>i.id!==b.dataset.remove);
        updateCartUI();
        updateCheckoutUI();
      }
    }));
    cb.disabled=false;
  }
  $('#cart-subtotal').textContent=fmt(total); $('#cart-final-total').textContent=fmt(total);
}

function addToCart(name, price, img, size='M') {
  if (!currentUser || !currentUserId) {
    showToast('Inicia sesión para agregar productos al carrito', 'error');
    openModal('login-modal');
    return;
  }
  const prodId = getProductIdByName(name);
  const qty = 1;

  console.log('currentUser:', currentUser);
  console.log('currentUserId:', currentUserId);
  console.log('productId:', prodId);

  fetch('/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: currentUserId, productId: prodId, quantity: qty })
  })
    .then(res => res.json())
    .then(data => {
      console.log('respuesta del backend:', data);
      showToast(`"${name}" añadido al carrito`);
      loadCartFromServer();
    })
    .catch(err => console.error('Error al añadir al carrito:', err));
}

function updateCheckoutUI() {
  const el=$('#checkout-items'); if(!el) return;
  const sub=cart.reduce((s,i)=>s+i.price*i.qty,0), ship=sub>0?80:0;
  el.innerHTML=cart.length?cart.map(i=>`<div class="cart-item" style="grid-template-columns:48px 1fr auto"><div class="cart-item__img"><img src="${i.img}" alt="${i.name}"/></div><div class="cart-item__info"><h4>${i.name}</h4><p>${i.size} · ×${i.qty}</p></div><div class="cart-item__price">${fmt(i.price*i.qty)}</div></div>`).join(''):'<p class="empty-cart-msg">Carrito vacío</p>';
  $('#subtotal-amount').textContent=fmt(sub); $('#shipping-cost').textContent=fmt(ship); $('#final-total-amount').textContent=fmt(sub+ship);
}

$('#cart-trigger')?.addEventListener('click',()=>{updateCartUI();openModal('cart-modal');});

/* ── Ir a Pagar → abre modal de datos de envío primero ── */
$('#checkout-button')?.addEventListener('click',()=>{
  closeModal($('#cart-modal'));
  openShippingModal();
});

document.addEventListener('click', e => {
  const btn=e.target.closest('.btn-add-cart'); if(!btn) return;
  e.preventDefault(); e.stopPropagation();
  const c=btn.closest('[data-name]'); if(!c) return;
  addToCart(c.dataset.name, c.dataset.price, c.dataset.img, 'M');
});

document.addEventListener('click', e => {
  if(e.target.closest('.btn-add-cart')||e.target.closest('.product-card__wishlist')||e.target.closest('.offer-card__wishlist')||e.target.closest('.btn-search-detail')) return;
  const card=e.target.closest('[data-name]'); if(!card) return;
  const badge=card.querySelector('.offer-card__badge')?.textContent||card.dataset.badge||'';
  const cat=card.dataset.category||'';
  const id = card.dataset.productId ? parseInt(card.dataset.productId) : null;
  openProductModal(id, card.dataset.name, card.dataset.price, card.dataset.img, card.dataset.desc, badge, cat);
});

/* ══════════════════════════════════
   MODAL DATOS DE ENVÍO
══════════════════════════════════ */

/* Rellena el formulario con datos guardados y muestra/oculta el aviso */
function prefillShippingForm() {
  const saved = loadShippingData();
  const notice = $('#saved-address-notice');
  const preview = $('#saved-address-preview');
  const form = $('#shipping-form');

  if (saved) {
    /* Mostrar aviso con resumen */
    const summary = `${saved.name} · ${saved.phone} — ${saved.address}, ${saved.city}`;
    if (preview) preview.textContent = summary;
    if (notice) notice.style.display = 'flex';

    /* Rellenar campos (el usuario puede editar) */
    _fillShippingFields(saved);
    if (form) form.style.display = ''; // siempre visible
  } else {
    if (notice) notice.style.display = 'none';
  }
}

function _fillShippingFields(data) {
  const set = (id, val) => { const el=document.getElementById(id); if(el) el.value = val || ''; };
  set('ship-name',    data.name);
  set('ship-phone',   data.phone);
  set('ship-email',   data.email);
  set('ship-address', data.address);
  set('ship-city',    data.city);
  set('ship-notes',   data.notes);
  const dept = document.getElementById('ship-dept');
  if (dept && data.dept) dept.value = data.dept;
  const chk = document.getElementById('save-shipping-data');
  if (chk) chk.checked = true;
}

function openShippingModal() {
  prefillShippingForm();
  openModal('shipping-modal');
}

/* Botón "Cambiar" dirección guardada — limpia aviso y deja editar */
$('#btn-change-address')?.addEventListener('click', () => {
  const notice = $('#saved-address-notice');
  if (notice) notice.style.display = 'none';
  clearShippingData();
  /* limpiar campos */
  $$('#shipping-form input, #shipping-form select, #shipping-form textarea').forEach(el => {
    if (el.type !== 'checkbox') el.value = '';
  });
  document.getElementById('ship-name')?.focus();
  showToast('Ingresa la nueva dirección de envío');
});

/* ── Validaciones individuales de envío ── */
function validateShipField(id, errorId, validator) {
  const el = document.getElementById(id);
  const errEl = document.getElementById(errorId);
  if (!el) return true;
  const msg = validator(el.value.trim());
  el.classList.toggle('input-error', !!msg);
  el.classList.toggle('input-ok',    !msg);
  if (errEl) { errEl.textContent = msg; errEl.classList.toggle('show', !!msg); }
  return !msg;
}

function validateShipName()    { return validateShipField('ship-name',    'ship-name-error',    v => v ? '' : 'Ingresa el nombre de quien recibe.'); }
function validateShipPhone()   { return validateShipField('ship-phone',   'ship-phone-error',   v => v ? '' : 'Ingresa un número de teléfono.'); }
function validateShipEmail()   { return validateShipField('ship-email',   'ship-email-error',   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Correo inválido.'); }
function validateShipAddress() { return validateShipField('ship-address', 'ship-address-error', v => v ? '' : 'Ingresa la dirección de envío.'); }
function validateShipCity()    { return validateShipField('ship-city',    'ship-city-error',    v => v ? '' : 'Ingresa la ciudad o municipio.'); }

/* Validar en tiempo real */
document.getElementById('ship-name')?.addEventListener('input',    validateShipName);
document.getElementById('ship-phone')?.addEventListener('input',   validateShipPhone);
document.getElementById('ship-email')?.addEventListener('input',   validateShipEmail);
document.getElementById('ship-address')?.addEventListener('input', validateShipAddress);
document.getElementById('ship-city')?.addEventListener('input',    validateShipCity);

$('#shipping-form')?.addEventListener('submit', e => {
  e.preventDefault();

  const ok = [
    validateShipName(),
    validateShipPhone(),
    validateShipEmail(),
    validateShipAddress(),
    validateShipCity()
  ].every(Boolean);

  if (!ok) {
    showToast('Por favor completa los campos requeridos.', 'error');
    return;
  }

  const shippingData = {
    name: document.getElementById('ship-name').value.trim(),
    phone: document.getElementById('ship-phone').value.trim(),
    email: document.getElementById('ship-email').value.trim(),
    address: document.getElementById('ship-address').value.trim(),
    city: document.getElementById('ship-city').value.trim(),
    dept: document.getElementById('ship-dept').value,
    notes: document.getElementById('ship-notes').value.trim(),
    savedAt: new Date().toISOString()
  };

  const saveChk = document.getElementById('save-shipping-data');

  if (currentUserId) {
    const token = localStorage.getItem('token');
    const payload = {
      telefono: shippingData.phone,
      direccion: shippingData.address,
      ciudad: shippingData.city,
      departamento: shippingData.dept,
      notas: shippingData.notes
    };
    
    fetch(`/users/${currentUserId}/address`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      // success
    })
    .catch(err => {
      console.error('[Frontend] Error al guardar dirección en backend:', err);
    });
  }

  if (saveChk?.checked) {
    saveShippingData(shippingData);
  } else {
    clearShippingData();
  }

  populateCheckoutShippingSummary(shippingData);

  closeModal($('#shipping-modal'));

  updateCheckoutUI();

  openModal('checkout-modal');

  showToast('Datos de envío guardados', 'success');

});

  /* Recoger datos */
  const shippingData = {
    name:    document.getElementById('ship-name').value.trim(),
    phone:   document.getElementById('ship-phone').value.trim(),
    email:   document.getElementById('ship-email').value.trim(),
    address: document.getElementById('ship-address').value.trim(),
    city:    document.getElementById('ship-city').value.trim(),
    dept:    document.getElementById('ship-dept').value,
    notes:   document.getElementById('ship-notes').value.trim(),
    savedAt: new Date().toISOString(),
  };

  



/* Rellena el resumen de envío en el modal de pago */
function populateCheckoutShippingSummary(data) {
  const namePhone = $('#css-name-phone');
  const addressLine = $('#css-address-line');
  if (namePhone) namePhone.textContent = `${data.name}  ·  ${data.phone}`;
  if (addressLine) addressLine.textContent = [data.address, data.city, data.dept].filter(Boolean).join(', ');
}

/* Botón "Editar" dentro del modal de pago — vuelve al modal de envío */
$('#btn-edit-shipping')?.addEventListener('click', () => {
  closeModal($('#checkout-modal'));
  openShippingModal();
});

/* ══════════════════════════════════
   MODAL PRODUCTO
══════════════════════════════════ */
let detailQty = 1;

function openProductModal(id, name, price, img, desc, badge, category) {
  const m=$('#product-detail-modal');
  $('#detail-name').textContent = name;
  $('#detail-price').textContent = fmt(price);
  $('#detail-img').src = img;
  $('#detail-img').alt = name;
  $('#detail-desc').textContent = desc || 'Descripción no disponible.';
  const badgeEl=$('#detail-badge');
  if(badge){badgeEl.textContent=badge;badgeEl.style.display='';}else{badgeEl.style.display='none';}
  const catEl=$('#detail-category');
  catEl.textContent = category ? category.charAt(0).toUpperCase()+category.slice(1) : '';
  detailQty=1; $('#qty-value').textContent='1';
  const wishBtn=$('#detail-wish-btn');
  const liked=!!wishlist[name];
  wishBtn.querySelector('i').className = liked?'fas fa-heart':'far fa-heart';
  wishBtn.classList.toggle('liked', liked);
  $$('.size-btn').forEach(b=>b.classList.toggle('active', b.dataset.size==='M'));
  m.dataset.productId=id || '';
  m.dataset.productName=name; m.dataset.productPrice=price; m.dataset.productImg=img;
  openModal('product-detail-modal');
}

$('#detail-wish-btn')?.addEventListener('click', () => {
  const m = $('#product-detail-modal');
  const name = m.dataset.productName; if(!name) return;
  
  if (!currentUser || !currentUserId) {
    showToast('Inicia sesión para guardar favoritos', 'error');
    openModal('login-modal');
    return;
  }

  const prodId = m.dataset.productId ? parseInt(m.dataset.productId) : null;
  console.log(`[Modal corazón] Click en favorito. Producto: "${name}", ID del producto: ${prodId}, User ID: ${currentUserId}`);

  wishlist[name] = !wishlist[name];

  if (wishlist[name]) {
    console.log(`productId enviado desde el frontend: ${prodId}`);
    console.log(`[Modal corazón] Guardando favorito en la DB: { userId: ${currentUserId}, productId: ${prodId} }`);
    fetch('/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUserId, productId: prodId })
    })
      .then(res => res.json())
      .then(data => {
        console.log('[Modal corazón] Respuesta recibida del backend (POST):', data);
        if (data && data.id) {
          favoriteIdMap[prodId] = data.id;
        }
        console.log('Contenido de favoriteIdMap:', favoriteIdMap);
        updateFavIcon();
        renderFavoritesSection();
      })
      .catch(err => {
        console.error('[Modal corazón] Error al guardar favorito:', err);
        wishlist[name] = false;
        updateFavIcon();
        renderFavoritesSection();
      });
  } else {
    const favId = favoriteIdMap[prodId];
    if (favId) {
      console.log(`[Modal corazón] Eliminando favorito ID: ${favId} para producto: ${name} (ID: ${prodId})`);
      fetch(`/favorites/${favId}`, {
        method: 'DELETE'
      })
        .then(res => res.json())
        .then(data => {
          console.log('[Modal corazón] Respuesta recibida del backend (DELETE):', data);
          delete favoriteIdMap[prodId];
          delete wishlist[name];
          console.log('Contenido de favoriteIdMap:', favoriteIdMap);
          updateFavIcon();
          renderFavoritesSection();
        })
        .catch(err => {
          console.error('[Modal corazón] Error al eliminar favorito:', err);
          wishlist[name] = true;
          updateFavIcon();
          renderFavoritesSection();
        });
    } else {
      console.warn(`[Modal corazón] No se encontró ID de favorito en favoriteIdMap para el producto ID: ${prodId}.`);
      delete wishlist[name];
      updateFavIcon();
      renderFavoritesSection();
    }
  }

  saveWishlist();
  const btn = $('#detail-wish-btn');
  btn.querySelector('i').className = wishlist[name] ? 'fas fa-heart' : 'far fa-heart';
  btn.classList.toggle('liked', !!wishlist[name]);
  $$('.product-card__wishlist, .offer-card__wishlist').forEach(b => {
    const c = b.closest('[data-name]'); if (c && c.dataset.name === name) {
      b.classList.toggle('active', !!wishlist[name]);
      b.querySelector('i').className = wishlist[name] ? 'fas fa-heart' : 'far fa-heart';
    }
  });
  showToast(wishlist[name] ? 'Añadido a favoritos' : 'Eliminado de favoritos');
});

$$('.size-btn').forEach(b=>b.addEventListener('click',()=>{
  $$('.size-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active');
}));

$('#qty-minus')?.addEventListener('click',()=>{if(detailQty>1){detailQty--;$('#qty-value').textContent=detailQty;}});
$('#qty-plus')?.addEventListener('click',()=>{detailQty++;$('#qty-value').textContent=detailQty;});

$('#add-to-cart-detail-btn')?.addEventListener('click',()=>{
  const m=$('#product-detail-modal');
  const size=$('.size-btn.active')?.dataset.size||'M';
  for(let i=0;i<detailQty;i++) addToCart(m.dataset.productName, m.dataset.productPrice, m.dataset.productImg, size);
  if(!currentUser) return;
  closeModal(m); openModal('cart-modal'); updateCartUI();
});

/* ══════════════════════════════════
   CHECKOUT — VALIDACIÓN PAGO
══════════════════════════════════ */
$$('.payment-tab').forEach(tab=>tab.addEventListener('click',()=>{
  $$('.payment-tab').forEach(t=>t.classList.remove('active'));
  $$('.payment-panel').forEach(p=>p.classList.remove('active'));
  tab.classList.add('active'); document.getElementById('tab-'+tab.dataset.tab)?.classList.add('active');
  validateCheckoutForm();
}));

function setCheckoutFieldError(inputId, msg) {
  const input = document.getElementById(inputId);
  const errEl = document.getElementById(inputId + '-error');
  if (input) input.classList.toggle('input-error', !!msg);
  if (errEl) { errEl.textContent = msg || ''; errEl.classList.toggle('show', !!msg); }
}

function validateCardName()   { const v=$('#card-name')?.value.trim()||''; if(!v){setCheckoutFieldError('card-name','Ingresa el nombre como aparece en la tarjeta.');return false;} setCheckoutFieldError('card-name','');return true; }
function validateCardNumber() { const raw=($('#card-number')?.value||'').replace(/\s/g,''); if(!raw){setCheckoutFieldError('card-number','Ingresa el número de tarjeta.');return false;} if(!/^\d{16}$/.test(raw)){setCheckoutFieldError('card-number','El número debe tener 16 dígitos.');return false;} setCheckoutFieldError('card-number','');return true; }
function validateExpiryDate() {
  const v=$('#expiry-date')?.value.trim()||'';
  if(!v){setCheckoutFieldError('expiry-date','Ingresa la fecha de vencimiento.');return false;}
  const match=/^(\d{2})\/(\d{2})$/.exec(v);
  if(!match){setCheckoutFieldError('expiry-date','Formato inválido. Usa MM/AA.');return false;}
  const month=parseInt(match[1],10), year=parseInt(match[2],10);
  if(month<1||month>12){setCheckoutFieldError('expiry-date','El mes debe estar entre 01 y 12.');return false;}
  const now=new Date(), cy=now.getFullYear()%100, cm=now.getMonth()+1;
  if(year<cy||(year===cy&&month<cm)){setCheckoutFieldError('expiry-date','La tarjeta está vencida.');return false;}
  setCheckoutFieldError('expiry-date','');return true;
}
function validateCVV() { const v=$('#cvv')?.value.trim()||''; if(!v){setCheckoutFieldError('cvv','Ingresa el CVV.');return false;} if(!/^\d{3,4}$/.test(v)){setCheckoutFieldError('cvv','El CVV debe tener 3 o 4 dígitos.');return false;} setCheckoutFieldError('cvv','');return true; }

function validateCheckoutForm() {
  const activeTab = $('.payment-tab.active')?.dataset.tab || 'card';
  const payBtn = $('#pay-now-btn');
  if (!payBtn) return;
  if (!cart.length) { payBtn.disabled = true; return; }
  if (activeTab !== 'card') { payBtn.disabled = false; return; }
  const nameOk=validateCardName(), numberOk=validateCardNumber(), expiryOk=validateExpiryDate(), cvvOk=validateCVV();
  payBtn.disabled = !(nameOk && numberOk && expiryOk && cvvOk);
}

$('#card-name')?.addEventListener('input', () => { validateCardName(); validateCheckoutForm(); });
$('#card-number')?.addEventListener('input',e=>{ let v=e.target.value.replace(/\D/g,'').slice(0,16); e.target.value=v.replace(/(.{4})/g,'$1 ').trim(); validateCardNumber(); validateCheckoutForm(); });
$('#expiry-date')?.addEventListener('input',e=>{ let v=e.target.value.replace(/\D/g,'').slice(0,4); if(v.length>2) v=v.slice(0,2)+'/'+v.slice(2); e.target.value=v; validateExpiryDate(); validateCheckoutForm(); });
$('#cvv')?.addEventListener('input',e=>{ e.target.value=e.target.value.replace(/\D/g,'').slice(0,4); validateCVV(); validateCheckoutForm(); });

/* ── PAGAR AHORA ── */
$('#pay-now-btn')?.addEventListener('click', () => {
  if (!cart.length) { showToast('Tu carrito está vacío','error'); return; }

  const activeTab = $('.payment-tab.active')?.dataset.tab || 'card';
  if (activeTab === 'card') {
    if (!(validateCardName() && validateCardNumber() && validateExpiryDate() && validateCVV())) {
      validateCheckoutForm();
      showToast('Revisa los datos de tu tarjeta antes de continuar', 'error');
      return;
    }
  }

  /* Total final */
  const sub = cart.reduce((s,i)=>s+i.price*i.qty, 0);
  const total = sub + 80;

  const shippingData = loadShippingData() || {};

  console.log('=== CREANDO ORDEN ===');
  console.log('userId:', currentUserId);
  console.log('total:', total);
  console.log('shippingData:', shippingData);

  fetch('/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: currentUserId,
      total: total,
      telefono: shippingData.phone || null,
      direccion: shippingData.address || null,
      ciudad: shippingData.city || null,
      departamento: shippingData.dept || null,
      notas: shippingData.notes || null
    })
  })
  .then(res => {
    if (!res.ok) throw new Error('Error al procesar la orden');
    return res.json();
  })
  .then(newOrder => {
    console.log('[createOrder] Respuesta recibida del backend:', newOrder);

    /* Datos de envío guardados */
    const shippingData = loadShippingData();

    /* Mostrar modal de éxito */
    const addrBox = $('#order-success-address');
    const totalBox = $('#order-success-total');
    if (addrBox && shippingData) {
      addrBox.innerHTML = `<strong>Dirección de entrega</strong>${shippingData.name}<br>${shippingData.address}, ${shippingData.city}${shippingData.dept ? ', ' + shippingData.dept : ''}<br>${shippingData.phone}`;
    } else if (addrBox) {
      addrBox.innerHTML = '';
    }
    if (totalBox) totalBox.textContent = `Total pagado: ${fmt(total)}`;

    /* Limpiar estado */
    cart = [];
    updateCartUI();
    updateCheckoutUI();
    loadCartFromServer();

    showToast('Compra realizada correctamente', 'success');

    closeAll();
    ['card-name','card-number','expiry-date','cvv'].forEach(id => {
      const inp=document.getElementById(id); if(inp) inp.value='';
      setCheckoutFieldError(id,'');
    });
    $('#pay-now-btn').disabled = true;

    /* Abrir modal de confirmación */
    setTimeout(() => openModal('order-success-modal'), 200);
  })
  .catch(err => {
    console.error('[Pagar] Error:', err);
    showToast('Error al procesar el pago y crear la orden', 'error');
  });
});

/* ── CONTACTO ── */
$('#contact-form')?.addEventListener('submit',e=>{e.preventDefault();showToast('¡Mensaje enviado! Te contactaremos pronto');e.target.reset();});

/* ── CATEGORÍAS ── */
$$('.cat-card').forEach(card => {
  const btn = card.querySelector('.btn-ghost'); if(!btn) return;
  btn.addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation();
    const cat = card.dataset.category;
    document.querySelector('#novedades')?.scrollIntoView({behavior:'smooth'});
    setTimeout(() => {
      $$('.cat-filter-btn').forEach(b=>b.classList.remove('active'));
      const target = document.querySelector(`.cat-filter-btn[data-filter="${cat}"]`);
      if(target) {
        target.classList.add('active');
        $$('#products-grid .product-card').forEach(c => {
          const match = c.dataset.category === cat;
          c.style.display = match?'':'none';
          if(match) c.style.animation='fadeInCard .4s ease';
        });
      }
    }, 600);
  });
});

$$('.cat-filter-btn').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.cat-filter-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  const f=btn.dataset.filter;
  $$('#products-grid .product-card').forEach(c=>{
    const match=f==='all'||c.dataset.category===f;
    c.style.display=match?'':'none'; if(match) c.style.animation='fadeInCard .4s ease';
  });
}));

/* ── ANIMACIONES DE SCROLL ── */
(function() {
  const style=document.createElement('style');
  style.textContent='.ah{opacity:0;transform:translateY(30px);transition:opacity .6s ease,transform .6s ease}.ah.av{opacity:1;transform:translateY(0)}';
  document.head.appendChild(style);
  const obs=new IntersectionObserver((entries)=>entries.forEach((en,i)=>{if(en.isIntersecting){setTimeout(()=>en.target.classList.add('av'),i*60);obs.unobserve(en.target);}}),{threshold:.1});
  $$('.product-card,.offer-card,.cat-card,.blog-card,.section__header').forEach(el=>{el.classList.add('ah');obs.observe(el);});
})();


document.addEventListener('DOMContentLoaded', () => {
  loadUser();
  const token = localStorage.getItem('token');
  if (token) {
    document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict`;
  }
  loadWishlist();
  updateCartUI();
  updateUserUI();
  loadUserDataFromServer();
  injectSearchModal();
  injectFavoritesSection();

  // Cargar productos para mapear IDs y luego cargar favoritos y carrito del servidor
  loadProductMap().then(() => {
    loadFavorites();
    loadCartFromServer();
  });

  validateCheckoutForm();

  /* Rellenar shipping si ya hay datos */
  const saved = loadShippingData();
  if (saved) populateCheckoutShippingSummary(saved);

  // Lógica del dropdown de cuenta en móviles
  const accountDropdown = document.getElementById('account-dropdown');

  const toggleAccountDropdown = (e) => {
    if (window.innerWidth < 992) {
      e.preventDefault();
      e.stopPropagation();
      if (accountDropdown) {
        const isVisible = accountDropdown.style.display === 'block';
        accountDropdown.style.display = isVisible ? 'none' : 'block';
      }
    }
  };

  // Clic en la "personita" cuando NO hay sesión iniciada (o desktop "Iniciar Sesión")
  const loginTrigger = document.getElementById('login-trigger');
  const loginModal = document.getElementById('login-modal');
  if (loginTrigger) {
    loginTrigger.addEventListener('click', (e) => {
      if (window.innerWidth < 992) {
        toggleAccountDropdown(e);
      } else {
        e.preventDefault();
        loginModal?.classList.add('active');
      }
    });
  }

  // Clic en la "personita" cuando SÍ hay sesión iniciada
  const userGreeting = document.getElementById('user-greeting');
  if (userGreeting) {
    userGreeting.addEventListener('click', (e) => {
      if (window.innerWidth < 992) {
        if (e.target.closest('#logout-btn')) return;
        toggleAccountDropdown(e);
      }
    });
  }

  // Cerrar dropdown al hacer click fuera
  document.addEventListener('click', (e) => {
    if (accountDropdown && accountDropdown.style.display === 'block') {
      if (!e.target.closest('#user-area')) {
        accountDropdown.style.display = 'none';
      }
    }
  });

  // Acciones internas del dropdown
  document.getElementById('dropdown-login-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (accountDropdown) accountDropdown.style.display = 'none';
    openModal('login-modal');
  });

  document.getElementById('dropdown-register-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (accountDropdown) accountDropdown.style.display = 'none';
    openModal('register-modal');
  });

  document.getElementById('dropdown-favs-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (accountDropdown) accountDropdown.style.display = 'none';
    document.querySelector('.icon-btn[aria-label="Favoritos"]')?.click();
  });

  document.getElementById('dropdown-orders-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (accountDropdown) accountDropdown.style.display = 'none';
    openModal('orders-modal');
    loadOrdersHistory();
  });

  document.getElementById('dropdown-logout-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (accountDropdown) accountDropdown.style.display = 'none';
    document.getElementById('logout-btn')?.click();
  });

  // Acciones de la sección Cuenta en el menú móvil (hamburguesa)
  document.getElementById('nav-login-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    $('#hamburger')?.click();
    openModal('login-modal');
  });

  document.getElementById('nav-register-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    $('#hamburger')?.click();
    openModal('register-modal');
  });

  document.getElementById('nav-favs-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    $('#hamburger')?.click();
    document.querySelector('.icon-btn[aria-label="Favoritos"]')?.click();
  });

  document.getElementById('nav-orders-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    $('#hamburger')?.click();
    openModal('orders-modal');
    loadOrdersHistory();
  });

  document.getElementById('nav-logout-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    $('#hamburger')?.click();
    document.getElementById('logout-btn')?.click();
  });
});

async function loadOrdersHistory() {
  const container = document.getElementById('orders-list-container');
  if (!container) return;

  container.innerHTML = '<div class="orders-loading"><i class="fas fa-spinner fa-spin"></i> Cargando tus pedidos...</div>';

  if (!currentUserId) {
    container.innerHTML = '<div class="orders-empty">Debes iniciar sesión para ver tus pedidos.</div>';
    return;
  }

  try {
    const response = await fetch('/orders');
    if (!response.ok) throw new Error('Error al obtener pedidos');
    const allOrders = await response.json();
    
    // Filtrar pedidos por el userId del usuario actual
    const myOrders = allOrders.filter(order => order.userId === currentUserId);

    if (myOrders.length === 0) {
      container.innerHTML = '<div class="orders-empty">No tienes pedidos registrados todavía.</div>';
      return;
    }

    // Renderizar los pedidos
    let html = '<div class="orders-history-list">';
    myOrders.forEach(order => {
      html += `
        <div class="order-history-item" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px; margin-bottom: 12px; background: rgba(255,255,255,0.02);">
          <div class="order-info" style="display: flex; justify-content: space-between; font-weight: bold;">
            <span class="order-id"><i class="fas fa-receipt"></i> Pedido #${order.id}</span>
            <span class="order-total">${fmt(order.total)}</span>
          </div>
          ${(order.telefono || order.direccion || order.ciudad) ? `
            <div class="order-shipping-details" style="font-size: 0.85rem; color: #8a8b9a; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px; margin-top: 8px;">
              <div><strong>Dirección:</strong> ${esc(order.direccion || 'No especificada')}, ${esc(order.ciudad || '')}${order.departamento ? ', ' + esc(order.departamento) : ''}</div>
              <div><strong>Teléfono:</strong> ${esc(order.telefono || 'No especificado')}</div>
              ${order.notas ? `<div><strong>Notas:</strong> ${esc(order.notas)}</div>` : ''}
            </div>
          ` : `
            <div class="order-shipping-details" style="font-size: 0.85rem; color: #ff5c3a; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px; margin-top: 8px;">
              <i class="fas fa-exclamation-triangle"></i> Datos de envío no registrados (NULL)
            </div>
          `}
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  } catch (error) {
    console.error(error);
    container.innerHTML = '<div class="orders-error">Hubo un problema al cargar tus pedidos. Por favor, intenta de nuevo.</div>';
  }
}
