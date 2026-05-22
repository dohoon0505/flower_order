(function () {
  'use strict';

  /* ============ UTILITIES ============ */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ============ THEME ============ */
  function toggleTheme() {
    var body = document.body;
    var current = body.getAttribute('data-theme');
    var next = current === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', next);
    var icon = next === 'light' ? '☾' : '☀';
    var label = next === 'light' ? 'Dark' : 'Light';
    var sub = next === 'light' ? 'Light Mode' : 'Dark Mode';
    ['theme-icon', 'sidebar-theme-icon'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = icon;
    });
    ['theme-label', 'sidebar-theme-label'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = label;
    });
    var sbSub = document.getElementById('theme-sub');
    if (sbSub) sbSub.textContent = sub;
  }
  window.toggleTheme = toggleTheme;

  /* ============ SIDEBAR (mobile) ============ */
  function toggleSidebar() {
    var sb = document.getElementById('sidebar');
    var scrim = document.querySelector('.sidebar-scrim');
    var isOpen = sb.classList.toggle('is-open');
    if (scrim) {
      if (isOpen) {
        scrim.classList.add('is-open');
        requestAnimationFrame(function () { scrim.classList.add('is-visible'); });
        document.body.style.overflow = 'hidden';
      } else {
        scrim.classList.remove('is-visible');
        setTimeout(function () { scrim.classList.remove('is-open'); }, 200);
        document.body.style.overflow = '';
      }
    }
  }
  window.toggleSidebar = toggleSidebar;

  function closeSidebar() {
    var sb = document.getElementById('sidebar');
    var scrim = document.querySelector('.sidebar-scrim');
    sb.classList.remove('is-open');
    if (scrim) {
      scrim.classList.remove('is-visible');
      setTimeout(function () { scrim.classList.remove('is-open'); }, 200);
    }
    document.body.style.overflow = '';
  }
  window.closeSidebar = closeSidebar;

  function closeSidebarMobile() {
    if (window.matchMedia('(max-width: 1099px)').matches) closeSidebar();
  }

  /* ============ STATE ============ */
  var systemData = null;
  var shopCache = {};
  var postCache = {};

  var homeHero = document.getElementById('home-hero');
  var homeSections = document.querySelectorAll('.home-section, .home-empty');
  var detailView = document.getElementById('detail-view');
  var shopNavList = document.getElementById('shop-nav-list');
  var blogNavList = document.getElementById('blog-nav-list');

  /* ============ DATA LOADING ============ */
  function fetchJSON(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }

  function loadSystem() {
    return fetchJSON('system.json').then(function (data) {
      systemData = data;
      buildShopSidebar();
      buildBlogSidebar(data.posts || []);
      buildHomeShopGrid(data.shops || []);
      buildHomeBlogGrid(data.posts || []);
      return data;
    });
  }

  function loadShop(shopId) {
    if (shopCache[shopId]) return Promise.resolve(shopCache[shopId]);
    return fetchJSON('shops/' + shopId + '/info.json').then(function (data) {
      shopCache[shopId] = data;
      return data;
    });
  }

  function loadPost(postId) {
    if (postCache[postId]) return Promise.resolve(postCache[postId]);
    return fetchJSON('posts/' + postId + '/post.json').then(function (data) {
      postCache[postId] = data;
      return data;
    });
  }

  /* ============ SIDEBAR — SHOPS (by region) ============ */
  function buildShopSidebar() {
    if (!shopNavList || !systemData) return;
    var regions = systemData.regions || [];
    if (regions.length === 0) {
      shopNavList.innerHTML = '<li class="sidebar-empty">등록된 지역이 없습니다</li>';
      return;
    }

    var html = '';
    regions.forEach(function (region) {
      if (region.cities && region.cities.length > 0) {
        html += '<li class="sidebar-expandable">';
        html += '<a class="sidebar-link" href="#region/' + encodeURIComponent(region.name) + '" data-section="region/' + region.name + '">';
        html += '<svg class="ico"><use href="#i-map-pin"/></svg>';
        html += escapeHtml(region.name);
        html += '<svg class="chevron" width="14" height="14"><use href="#i-chevron-down"/></svg>';
        html += '</a>';
        html += '<ul class="sidebar-sub">';
        region.cities.forEach(function (city) {
          html += '<li><a class="sidebar-link" href="#region/' + encodeURIComponent(region.name) + '/' + encodeURIComponent(city) + '" data-section="region/' + region.name + '/' + city + '">';
          html += escapeHtml(city);
          html += '</a></li>';
        });
        html += '</ul></li>';
      } else {
        html += '<li><a class="sidebar-link" href="#region/' + encodeURIComponent(region.name) + '" data-section="region/' + region.name + '">';
        html += '<svg class="ico"><use href="#i-map-pin"/></svg>';
        html += escapeHtml(region.name);
        html += '</a></li>';
      }
    });
    shopNavList.innerHTML = html;
  }

  /* ============ SIDEBAR — BLOG POSTS ============ */
  function buildBlogSidebar(posts) {
    if (!blogNavList) return;
    if (posts.length === 0) {
      blogNavList.innerHTML = '<li class="sidebar-empty">등록된 글이 없습니다</li>';
      return;
    }
    var html = '';
    posts.forEach(function (post) {
      html += '<li><a class="sidebar-link" href="#post/' + escapeHtml(post.id) + '" data-section="post/' + escapeHtml(post.id) + '">';
      html += '<svg class="ico"><use href="#i-edit"/></svg>';
      html += escapeHtml(post.title);
      html += '</a></li>';
    });
    blogNavList.innerHTML = html;
  }

  /* ============ HOME — DYNAMIC GRIDS ============ */
  function buildHomeShopGrid(shops) {
    var grid = document.getElementById('home-shop-grid');
    if (!grid || shops.length === 0) return;
    var html = '';
    shops.slice(0, 6).forEach(function (shop) {
      html += '<a class="analysis-card" href="#shop/' + escapeHtml(shop.id) + '">';
      html += '<div class="analysis-card-num">';
      html += '<svg class="ico" style="width:20px;height:20px"><use href="#i-map-pin"/></svg>';
      html += '</div>';
      html += '<h3>' + escapeHtml(shop.name) + '</h3>';
      html += '<p>' + escapeHtml(shop.region + (shop.area ? ' ' + shop.area : '')) + '</p>';
      html += '</a>';
    });
    grid.innerHTML = html;
  }

  function buildHomeBlogGrid(posts) {
    var grid = document.getElementById('home-blog-grid');
    if (!grid || posts.length === 0) return;
    var html = '';
    posts.slice(0, 6).forEach(function (post) {
      html += '<a class="analysis-card" href="#post/' + escapeHtml(post.id) + '">';
      html += '<div class="analysis-card-num">';
      if (post.category) html += escapeHtml(post.category);
      else html += '<svg class="ico" style="width:20px;height:20px"><use href="#i-edit"/></svg>';
      html += '</div>';
      html += '<h3>' + escapeHtml(post.title) + '</h3>';
      html += '<p>' + escapeHtml(post.summary || post.date || '') + '</p>';
      html += '</a>';
    });
    grid.innerHTML = html;
  }

  /* ============ BLOCK RENDERERS ============ */
  function renderBlock(block) {
    switch (block.type) {
      case 'heading':  return '<h2 class="blk-heading">' + escapeHtml(block.value) + '</h2>';
      case 'text':     return '<p class="blk-text">' + escapeHtml(block.value) + '</p>';
      case 'note':     return '<div class="blk-note"><div class="blk-note-icon">i</div><p>' + escapeHtml(block.value) + '</p></div>';
      case 'kv':       return renderKV(block);
      case 'image':    return renderImage(block);
      default: return '';
    }
  }

  function renderKV(block) {
    var cols = block.columns || 1;
    var h = '';
    if (block.title) h += '<div class="blk-kv-title">' + escapeHtml(block.title) + '</div>';
    h += '<div class="blk-kv blk-kv--col' + cols + '">';
    (block.items || []).forEach(function (item) {
      h += '<div class="blk-kv-item">';
      h += '<dt>' + escapeHtml(item.label) + '</dt>';
      h += '<dd>' + escapeHtml(item.value) + '</dd>';
      h += '</div>';
    });
    h += '</div>';
    return h;
  }

  function renderImage(block) {
    var h = '<div class="blk-image">';
    h += '<img src="' + escapeHtml(block.src) + '" alt="' + escapeHtml(block.alt || '') + '" loading="lazy">';
    if (block.caption) h += '<p class="blk-image-caption">' + escapeHtml(block.caption) + '</p>';
    h += '</div>';
    return h;
  }

  /* ============ VIEWS ============ */
  function showHome() {
    if (homeHero) homeHero.style.display = '';
    homeSections.forEach(function (s) { s.style.display = ''; });
    if (detailView) detailView.style.display = 'none';
    highlightSidebar('home');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function hideHome() {
    if (homeHero) homeHero.style.display = 'none';
    homeSections.forEach(function (s) { s.style.display = 'none'; });
  }

  function showDetail(html) {
    hideHome();
    if (detailView) {
      detailView.innerHTML = html;
      detailView.style.display = '';
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  /* ============ SHOP DETAIL ============ */
  function renderShopDetail(shop) {
    var h = '';
    h += '<div class="report-header">';
    h += '<a class="report-back" href="#">← 홈으로</a>';
    h += '<div class="report-meta">';
    h += '<span class="tag">' + escapeHtml(shop.region) + '</span>';
    if (shop.area) h += '<span class="report-date">' + escapeHtml(shop.area) + '</span>';
    h += '</div>';
    h += '<h1 class="report-title">' + escapeHtml(shop.name) + '</h1>';
    if (shop.summary) h += '<p class="report-summary">' + escapeHtml(shop.summary) + '</p>';
    if (shop.url) {
      h += '<a class="report-url" href="' + escapeHtml(shop.url) + '" target="_blank" rel="noopener noreferrer">';
      h += '<svg class="ico"><use href="#i-link"/></svg>' + escapeHtml(shop.url);
      h += '</a>';
    }
    h += '</div>';

    h += '<div class="report-blocks">';
    if (shop.blocks && shop.blocks.length > 0) {
      shop.blocks.forEach(function (block) { h += renderBlock(block); });
    }
    h += '</div>';
    return h;
  }

  /* ============ BLOG POST DETAIL ============ */
  function renderPostDetail(post) {
    var h = '';
    h += '<div class="report-header">';
    h += '<a class="report-back" href="#">← 홈으로</a>';
    h += '<div class="report-meta">';
    h += '<span class="tag">꽃배달 가이드</span>';
    if (post.category) h += '<span class="report-date">' + escapeHtml(post.category) + '</span>';
    if (post.date) h += '<span class="report-date">' + escapeHtml(post.date) + '</span>';
    h += '</div>';
    h += '<h1 class="report-title">' + escapeHtml(post.title) + '</h1>';
    if (post.summary) h += '<p class="report-summary">' + escapeHtml(post.summary) + '</p>';
    h += '</div>';

    h += '<div class="report-blocks">';
    if (post.blocks && post.blocks.length > 0) {
      post.blocks.forEach(function (block) { h += renderBlock(block); });
    }
    h += '</div>';
    return h;
  }

  /* ============ REGION DETAIL ============ */
  function renderRegionDetail(regionName, cityName) {
    var displayName = cityName ? regionName + ' ' + cityName : regionName;
    var shops = (systemData.shops || []).filter(function (shop) {
      if (cityName) return shop.region === regionName && shop.city === cityName;
      return shop.region === regionName;
    });

    var h = '';
    h += '<div class="report-header">';
    h += '<a class="report-back" href="#">← 홈으로</a>';
    h += '<div class="report-meta"><span class="tag">지역</span></div>';
    h += '<h1 class="report-title">' + escapeHtml(displayName) + '</h1>';
    if (shops.length === 0) {
      h += '<p class="report-summary">' + escapeHtml(displayName) + ' 지역의 꽃배달 업체 정보를 준비 중입니다.</p>';
    } else {
      h += '<p class="report-summary">' + escapeHtml(displayName) + ' 지역 꽃배달 업체 ' + shops.length + '곳</p>';
    }
    h += '</div>';

    if (shops.length > 0) {
      h += '<div class="report-blocks">';
      shops.forEach(function (shop) {
        h += '<a class="analysis-card" href="#shop/' + escapeHtml(shop.id) + '" style="display:block;margin-bottom:var(--size-300)">';
        h += '<h3>' + escapeHtml(shop.name) + '</h3>';
        if (shop.summary) h += '<p>' + escapeHtml(shop.summary) + '</p>';
        h += '</a>';
      });
      h += '</div>';
    }
    return h;
  }

  /* ============ SIDEBAR HIGHLIGHT ============ */
  function highlightSidebar(id) {
    document.querySelectorAll('.sidebar-link').forEach(function (l) {
      l.classList.remove('is-active');
    });
    var link = document.querySelector('.sidebar-link[data-section="' + id + '"]');
    if (!link) return;
    link.classList.add('is-active');
    var sub = link.closest('.sidebar-sub');
    if (sub) {
      var exp = sub.closest('.sidebar-expandable');
      if (exp) exp.classList.add('is-open');
    }
    var group = link.closest('.sidebar-group');
    if (group && group.classList.contains('is-collapsed')) {
      group.classList.remove('is-collapsed');
    }
  }

  /* ============ ROUTING ============ */
  function route() {
    var rawHash = location.hash.replace(/^#\/?/, '').trim();
    var hash;
    try { hash = decodeURIComponent(rawHash); } catch (e) { hash = rawHash; }

    if (!hash) {
      showHome();
      return;
    }

    var parts = hash.split('/');

    if (parts[0] === 'region' && parts[1]) {
      highlightSidebar(hash);
      showDetail(renderRegionDetail(parts[1], parts[2] || null));
      return;
    }

    if (parts[0] === 'shop' && parts[1]) {
      highlightSidebar(hash);
      loadShop(parts[1]).then(function (shop) {
        showDetail(renderShopDetail(shop));
      }).catch(function () {
        showDetail('<div class="report-header"><a class="report-back" href="#">← 홈으로</a><h1 class="report-title">업체 정보를 불러올 수 없습니다</h1></div>');
      });
      return;
    }

    if (parts[0] === 'post' && parts[1]) {
      highlightSidebar(hash);
      loadPost(parts[1]).then(function (post) {
        showDetail(renderPostDetail(post));
      }).catch(function () {
        showDetail('<div class="report-header"><a class="report-back" href="#">← 홈으로</a><h1 class="report-title">글을 불러올 수 없습니다</h1></div>');
      });
      return;
    }

    showHome();
    highlightSidebar(hash || 'home');
  }

  /* ============ SIDEBAR INTERACTIONS ============ */
  document.addEventListener('click', function (e) {
    var groupTitle = e.target.closest('.sidebar-group-title');
    if (groupTitle && groupTitle.parentElement.classList.contains('sidebar-group')) {
      groupTitle.parentElement.classList.toggle('is-collapsed');
      return;
    }

    var link = e.target.closest('.sidebar-link');
    if (!link) return;

    var parent = link.parentElement;
    if (parent && parent.classList.contains('sidebar-expandable')) {
      var targetHash = link.getAttribute('href') || '';
      var currentHash = location.hash || '';
      if (targetHash === currentHash || '#' + targetHash === currentHash) {
        e.preventDefault();
        parent.classList.toggle('is-open');
        return;
      }
      parent.classList.add('is-open');
    }

    if (link.closest('.sidebar-sub')) {
      closeSidebarMobile();
    } else if (!parent || !parent.classList.contains('sidebar-expandable')) {
      closeSidebarMobile();
    }
  });

  /* Escape key handled in search section below */

  /* ============ SCROLL FADE-IN ============ */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.05 });

  document.querySelectorAll('.analysis-card').forEach(function (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = 'opacity 500ms cubic-bezier(0.2,0,0,1), transform 500ms cubic-bezier(0.2,0,0,1)';
    observer.observe(card);
  });

  /* ============ SEARCH ============ */
  var searchInput = document.getElementById('search-input');
  var searchResultsEl = document.getElementById('search-results');

  function getSearchableItems() {
    if (!systemData) return [];
    var items = [];
    (systemData.regions || []).forEach(function (region) {
      items.push({ type: 'region', name: region.name, parent: '', href: '#region/' + encodeURIComponent(region.name), icon: 'i-map-pin' });
      if (region.cities) {
        region.cities.forEach(function (city) {
          items.push({ type: 'city', name: city, parent: region.name, href: '#region/' + encodeURIComponent(region.name) + '/' + encodeURIComponent(city), icon: 'i-map-pin' });
        });
      }
    });
    (systemData.shops || []).forEach(function (shop) {
      items.push({ type: 'shop', name: shop.name, parent: shop.region || '', href: '#shop/' + shop.id, icon: 'i-store' });
    });
    (systemData.posts || []).forEach(function (post) {
      items.push({ type: 'post', name: post.title, parent: post.category || '', href: '#post/' + post.id, icon: 'i-edit' });
    });
    (systemData.categories || []).forEach(function (cat) {
      items.push({ type: 'category', name: cat.title, parent: cat.desc || '', href: '#category/' + cat.id, icon: 'i-flower' });
    });
    return items;
  }

  function performSearch(query) {
    if (!searchResultsEl) return;
    if (!query) {
      searchResultsEl.classList.remove('is-open');
      document.body.classList.remove('is-searching');
      return;
    }
    document.body.classList.add('is-searching');
    var items = getSearchableItems();
    var q = query.toLowerCase();
    var matched = items.filter(function (item) {
      return item.name.toLowerCase().indexOf(q) !== -1 ||
             item.parent.toLowerCase().indexOf(q) !== -1;
    });
    if (matched.length === 0) {
      searchResultsEl.innerHTML = '<div class="search-empty">검색 결과가 없습니다</div>';
      searchResultsEl.classList.add('is-open');
      return;
    }
    var typeLabels = { region: '지역', city: '도시', shop: '업체', post: '가이드', category: '카테고리' };
    var groups = {};
    matched.slice(0, 20).forEach(function (item) {
      if (!groups[item.type]) groups[item.type] = [];
      groups[item.type].push(item);
    });
    var html = '';
    Object.keys(groups).forEach(function (type) {
      html += '<div class="search-result-group">';
      html += '<div class="search-result-label">' + escapeHtml(typeLabels[type] || type) + '</div>';
      groups[type].forEach(function (item) {
        html += '<a class="search-result-item" href="' + item.href + '">';
        html += '<svg width="16" height="16"><use href="#' + item.icon + '"/></svg>';
        html += escapeHtml(item.name);
        if (item.parent) html += '<span class="search-result-meta">' + escapeHtml(item.parent) + '</span>';
        html += '</a>';
      });
      html += '</div>';
    });
    searchResultsEl.innerHTML = html;
    searchResultsEl.classList.add('is-open');
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () { performSearch(this.value.trim()); });
    searchInput.addEventListener('focus', function () { if (this.value.trim()) performSearch(this.value.trim()); });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.search-wrap')) searchResultsEl.classList.remove('is-open');
    });
    searchResultsEl.addEventListener('click', function (e) {
      if (e.target.closest('.search-result-item')) {
        searchResultsEl.classList.remove('is-open');
        document.body.classList.remove('is-searching');
        searchInput.value = '';
        closeSidebarMobile();
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (searchInput) { searchInput.focus(); searchInput.select(); }
    }
    if (e.key === 'Escape') {
      if (document.activeElement === searchInput) {
        searchResultsEl.classList.remove('is-open');
        searchInput.blur();
      } else {
        closeSidebar();
      }
    }
  });

  /* ============ INIT ============ */
  window.addEventListener('hashchange', route);

  function init() {
    loadSystem().then(function () {
      route();
    }).catch(function () {
      route();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
