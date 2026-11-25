(function () {
  'use strict';
  var config = window.MINDSTORY_CONFIG || {};
  var svgNS = 'http://www.w3.org/2000/svg';

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function icon(name) {
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    var use = document.createElementNS(svgNS, 'use');
    use.setAttribute('href', '#icon-' + name);
    svg.appendChild(use);
    return svg;
  }

  function renderServices() {
    var grid = document.getElementById('service-grid');
    if (!grid || !Array.isArray(config.services) || !config.services.length) return;
    var fragment = document.createDocumentFragment();
    config.services.forEach(function (service) {
      var url;
      try { url = new URL(service.link); } catch (e) { return; }
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return;
      var tone = ['navy', 'teal', 'clay'].includes(service.tone) ? service.tone : 'navy';
      var iconName = ['book', 'create', 'news', 'growth', 'people'].includes(service.icon) ? service.icon : 'book';
      var card = element('a', 'service-card tone-' + tone);
      card.href = url.href;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.setAttribute('aria-label', service.title + ' — ' + service.subtitle + ', 새 창에서 열기');
      var top = element('div', 'service-top');
      var badge = element('span', 'service-icon');
      badge.appendChild(icon(iconName));
      top.append(badge, element('span', 'service-tag', service.tag));
      var bottom = element('div', 'service-bottom');
      bottom.append(element('span', '', service.domain || url.hostname), element('span', 'service-link-label', '사이트 열기'));
      card.append(top, element('h3', '', service.title), element('p', 'service-subtitle', service.subtitle), element('p', 'service-description', service.description), bottom);
      fragment.appendChild(card);
    });
    if (fragment.childNodes.length) grid.replaceChildren(fragment);
  }
  renderServices();

  var phone = typeof config.phone === 'string' ? config.phone : '062-959-9535';
  var email = typeof config.email === 'string' ? config.email : 'sanj2100@naver.com';
  document.querySelectorAll('[data-phone]').forEach(function (node) { node.textContent = phone; });
  document.querySelectorAll('[data-email]').forEach(function (node) { node.textContent = email; });
  document.querySelectorAll('[data-phone-link]').forEach(function (node) { node.href = 'tel:' + phone.replace(/[^+0-9]/g, ''); });
  document.querySelectorAll('[data-email-link]').forEach(function (node) { node.href = 'mailto:' + email + '?subject=' + encodeURIComponent(node.dataset.subject || '마인드스토리 교육 문의'); });
  document.querySelectorAll('[data-year]').forEach(function (node) { node.textContent = new Date().getFullYear(); });

  var menuToggle = document.querySelector('.menu-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  function setMenu(open, returnFocus) {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    menuToggle.querySelector('use').setAttribute('href', open ? '#icon-close' : '#icon-menu');
    mobileNav.hidden = !open;
    if (returnFocus) menuToggle.focus();
  }
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () { setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'); });
    mobileNav.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !mobileNav.hidden) setMenu(false, true); });
    document.addEventListener('click', function (event) { if (!mobileNav.hidden && !event.target.closest('.header')) setMenu(false); });
    window.matchMedia('(min-width: 651px)').addEventListener('change', function (event) { if (event.matches) setMenu(false); });
  }

  var header = document.querySelector('.header');
  function updateHeader() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 16); }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
  if ('IntersectionObserver' in window) {
    var navLinks = Array.from(document.querySelectorAll('.desktop-nav a'));
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) navLinks.forEach(function (link) { link.classList.toggle('is-active', link.hash === '#' + entry.target.id); });
      });
    }, { rootMargin: '-20% 0px -50% 0px', threshold: 0 });
    document.querySelectorAll('main section[id]').forEach(function (section) { observer.observe(section); });
  }

  var toast = document.getElementById('toast');
  var toastTimer;
  function showToast(message) {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = window.setTimeout(function () { toast.classList.remove('is-visible'); }, 3500);
  }
  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(textarea);
    textarea.select();
    var copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  }
  document.querySelectorAll('[data-copy]').forEach(function (button) {
    button.addEventListener('click', async function () {
      var isPhone = button.dataset.copy === 'phone';
      var value = isPhone ? phone : email;
      var success = false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(value);
          success = true;
        } else success = fallbackCopy(value);
      } catch (e) {
        try { success = fallbackCopy(value); } catch (ignored) { success = false; }
      }
      button.focus();
      showToast(success ? (isPhone ? '전화번호를 복사했습니다.' : '이메일 주소를 복사했습니다.') : '복사할 수 없습니다. 표시된 내용을 선택해 복사해 주세요.');
    });
  });
})();
