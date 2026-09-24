(() => {
  const DESKTOP_QUERY = '(min-width: 1200px)';
  const ITEM_OPEN_CLASS = 'dropdown-opened';
  const BODY_OPEN_CLASS = 'dropdown-open-desk';
  const initialized = new WeakSet();

  const isDesktopMenu = (menu) =>
    window.matchMedia(DESKTOP_QUERY).matches
    && document.querySelector('page-header')?.dataset.alwaysMobileMenu !== 'true'
    && !document.body.classList.contains('mobile-nav');

  const submenuLinks = (item) =>
    item.querySelectorAll('a[data-menu-level="2"], a[data-menu-level="3"]');

  const labelWishlistLinks = (root = document) => {
    root.querySelectorAll('a.th_wlc_position_relative[href*="/apps/wishlist"]').forEach((link) => {
      if (!link.hasAttribute('aria-label')) link.setAttribute('aria-label', 'Wishlist');
    });
  };

  const labelHextomAttributionLinks = (root = document) => {
    const links = root.querySelectorAll('.hextom__spm__widget__detail a[href^="https://hextom.com"]');
    links.forEach((link) => {
      link.setAttribute('aria-label', 'Powered by Hextom (opens in a new tab)');
      link.setAttribute('rel', 'noopener noreferrer');
      link.querySelectorAll('img').forEach((image) => image.setAttribute('alt', ''));
    });
    return links.length;
  };

  const syncHextomWidgetAccessibility = (root = document) => {
    root.querySelectorAll('.hextom__spm__widget__contents').forEach((contents) => {
      const widget = contents.closest('.hextom__spm__widget');
      const widgetStyle = widget ? window.getComputedStyle(widget) : null;
      const contentsStyle = window.getComputedStyle(contents);
      const isHidden = widgetStyle?.opacity === '0'
        || widgetStyle?.pointerEvents === 'none'
        || contentsStyle.opacity === '0'
        || contentsStyle.pointerEvents === 'none';

      contents.toggleAttribute('inert', isHidden);
      if (isHidden) contents.setAttribute('aria-hidden', 'true');
      else contents.removeAttribute('aria-hidden');
    });
  };

  const syncItemState = (item) => {
    const parentLink = item.querySelector(':scope > a[data-menu-level="1"]');
    if (!parentLink) return;
    parentLink.setAttribute('aria-expanded', String(item.classList.contains(ITEM_OPEN_CLASS)));
  };

  const closeItem = (item) => {
    item.classList.remove(ITEM_OPEN_CLASS, 'submenu--left');
    submenuLinks(item).forEach((link) => link.setAttribute('tabindex', '-1'));
    syncItemState(item);
  };

  const syncBodyState = (menu) => {
    document.body.classList.toggle(
      BODY_OPEN_CLASS,
      Boolean(menu.querySelector(`.${ITEM_OPEN_CLASS}`)),
    );
  };

  const openItem = (menu, item, focusFirst = false) => {
    if (!isDesktopMenu(menu)) return;
    menu.querySelectorAll('.wt-page-nav-mega__item--parent').forEach((other) => {
      if (other !== item) closeItem(other);
    });
    item.classList.add(ITEM_OPEN_CLASS);
    item.classList.toggle('submenu--left', item.getBoundingClientRect().x > window.innerWidth / 2);
    submenuLinks(item).forEach((link) => link.setAttribute('tabindex', '0'));
    syncItemState(item);
    syncBodyState(menu);
    if (focusFirst) item.querySelector('a[data-menu-level="2"]')?.focus();
  };

  const initializeMenu = (menu) => {
    if (initialized.has(menu)) return;
    initialized.add(menu);

    const items = menu.querySelectorAll('.wt-page-nav-mega__item--parent');
    items.forEach((item, index) => {
      const parentLink = item.querySelector(':scope > a[data-menu-level="1"]');
      const wrapper = parentLink?.nextElementSibling;
      if (!parentLink || !wrapper) return;

      const wrapperId = wrapper.id || `KairaliDesktopSubmenu-${index + 1}`;
      wrapper.id = wrapperId;
      parentLink.setAttribute('aria-haspopup', 'true');
      parentLink.setAttribute('aria-controls', wrapperId);
      syncItemState(item);

      const observer = new MutationObserver(() => syncItemState(item));
      observer.observe(item, { attributes: true, attributeFilter: ['class'] });
    });

    // The theme opens every submenu merely because its level-one link receives
    // focus. Stop only that focus event; pointer hover remains unchanged.
    menu.addEventListener('focusin', (event) => {
      const parentLink = event.target.closest?.('a[data-menu-level="1"]');
      if (parentLink?.closest('mega-menu-section') === menu && isDesktopMenu(menu)) {
        event.stopPropagation();
      }
    }, true);

    menu.addEventListener('keydown', (event) => {
      if (!isDesktopMenu(menu)) return;
      const parentLink = event.target.closest?.('a[data-menu-level="1"]');
      const item = event.target.closest?.('.wt-page-nav-mega__item--parent');
      if (!item) return;

      if (parentLink && event.key === 'ArrowDown') {
        event.preventDefault();
        openItem(menu, item, true);
        return;
      }

      if (event.key === 'Escape' && item.classList.contains(ITEM_OPEN_CLASS)) {
        event.preventDefault();
        closeItem(item);
        syncBodyState(menu);
        item.querySelector(':scope > a[data-menu-level="1"]')?.focus();
      }
    });
  };

  const observedHextomWidgets = new WeakSet();
  const pendingHextomWidgets = new WeakSet();

  const scheduleHextomWidgetSync = (widget) => {
    if (pendingHextomWidgets.has(widget)) return;
    pendingHextomWidgets.add(widget);
    window.requestAnimationFrame(() => {
      pendingHextomWidgets.delete(widget);
      labelHextomAttributionLinks(widget);
      syncHextomWidgetAccessibility(widget);
    });
  };

  const observeHextomWidgets = (root = document) => {
    root.querySelectorAll('.hextom__spm__widget').forEach((widget) => {
      if (observedHextomWidgets.has(widget)) return;
      observedHextomWidgets.add(widget);
      scheduleHextomWidgetSync(widget);
      new MutationObserver(() => scheduleHextomWidgetSync(widget)).observe(widget, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['class', 'style'],
      });
    });
  };

  let injectedContentSyncQueued = false;
  const scheduleInjectedContentSync = () => {
    if (injectedContentSyncQueued) return;
    injectedContentSyncQueued = true;
    window.requestAnimationFrame(() => {
      injectedContentSyncQueued = false;
      labelWishlistLinks();
      labelHextomAttributionLinks();
      observeHextomWidgets();
    });
  };

  const initialize = () => {
    document.querySelectorAll('mega-menu-section').forEach(initializeMenu);
    labelWishlistLinks();
    labelHextomAttributionLinks();
    observeHextomWidgets();

    const injectedContentObserver = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.addedNodes.length > 0)) {
        scheduleInjectedContentSync();
      }
    });
    injectedContentObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
    window.setTimeout(() => injectedContentObserver.disconnect(), 15000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();

(() => {
  const applyEasySellTheme = (root = document) => {
    root.querySelectorAll('#easysell-modal .es-checkout-btn, #easysell-modal .es-cta-btn').forEach((button) => {
      button.style.setProperty('background', '#151515', 'important');
      button.style.setProperty('background-color', '#151515', 'important');
      button.style.setProperty('color', '#ffffff', 'important');
      button.style.setProperty('border-radius', '8px', 'important');
      button.style.setProperty('font-family', 'var(--font-base), Inter, Arial, sans-serif', 'important');
      button.style.setProperty('font-size', '16px', 'important');
      button.style.setProperty('font-weight', '700', 'important');
      button.style.setProperty('letter-spacing', '0.02em', 'important');
      button.style.setProperty('box-shadow', 'none', 'important');
    });
  };

  const initializeEasySellTheme = () => {
    applyEasySellTheme();
    const bootstrapObserver = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.addedNodes.length)) applyEasySellTheme();
    });
    bootstrapObserver.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => bootstrapObserver.disconnect(), 15000);

    document.addEventListener('click', (event) => {
      if (event.target.closest?.('.es-popup-button-product, .es-popup-button-drawer')) {
        window.setTimeout(applyEasySellTheme, 100);
      }
    }, true);
    document.addEventListener('shopify:section:load', () => applyEasySellTheme());
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEasySellTheme, { once: true });
  } else {
    initializeEasySellTheme();
  }
})();
