(() => {
  const buttonSelector = '.es-popup-button-product, .es-popup-button-drawer';
  const boundButtons = new WeakSet();
  const observedProductInfo = new WeakSet();
  let queued = false;

  const isVisible = (element) => {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none'
      && style.visibility !== 'hidden'
      && element.getBoundingClientRect().width > 0
      && element.getBoundingClientRect().height > 0;
  };

  const focusOpenForm = () => {
    const form = Array.from(document.querySelectorAll('#es-form, .es-form')).find(isVisible);
    const firstControl = form?.querySelector('select:not([disabled]), input:not([type="hidden"]):not([disabled]), button:not([disabled])');
    firstControl?.focus();
  };

  const enhanceButton = (button) => {
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    button.setAttribute('aria-haspopup', 'dialog');

    const label = button.textContent.trim();
    if (label) button.setAttribute('aria-label', label);

    if (boundButtons.has(button)) return;
    boundButtons.add(button);

    button.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      button.click();
      window.setTimeout(focusOpenForm, 100);
    });
  };

  const observeProductInfo = (productInfo) => {
    if (!productInfo || observedProductInfo.has(productInfo)) return;
    observedProductInfo.add(productInfo);
    new MutationObserver(scheduleReconcile).observe(productInfo, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'style', 'hidden', 'disabled', 'aria-disabled'],
    });
  };

  const reconcile = () => {
    queued = false;
    document.querySelectorAll(buttonSelector).forEach(enhanceButton);

    const candidateButton = document.querySelector('.wt-product__info .es-popup-button-product');
    const candidateBlock = candidateButton?.closest('.shopify-app-block') || null;
    const candidateProductInfo = candidateButton?.closest('.wt-product__info') || null;
    observeProductInfo(candidateProductInfo);
    const appIsActive = Boolean(candidateButton && (isVisible(candidateButton) || candidateBlock?.classList.contains('kairali-easysell-unavailable')));
    const productButton = appIsActive ? candidateButton : null;
    const productInfo = productButton ? candidateProductInfo : null;

    document.querySelectorAll('.wt-product__info.kairali-easysell-ready').forEach((element) => {
      if (element !== productInfo) element.classList.remove('kairali-easysell-ready');
    });

    const nativeBuyButton = productInfo?.querySelector('[data-block-id="buy_buttons"] button[name="add"]');
    const canBuy = Boolean(nativeBuyButton && !nativeBuyButton.disabled && nativeBuyButton.getAttribute('aria-disabled') !== 'true');
    const appBlock = productButton?.closest('.shopify-app-block') || null;

    productInfo?.classList.toggle('kairali-easysell-ready', canBuy);
    appBlock?.classList.toggle('kairali-easysell-unavailable', !canBuy);
    document.body?.classList.toggle('kairali-easysell-ready', Boolean(productInfo && canBuy));
    document.body?.classList.toggle('kairali-easysell-unavailable', Boolean(productInfo && !canBuy));
  };

  const scheduleReconcile = () => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(reconcile);
  };

  const bootstrapObserver = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.addedNodes.length > 0)) scheduleReconcile();
  });
  bootstrapObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
  window.setTimeout(() => bootstrapObserver.disconnect(), 15000);

  window.addEventListener('pageshow', scheduleReconcile);
  document.addEventListener('shopify:section:load', scheduleReconcile);
  document.addEventListener('change', (event) => {
    if (event.target.closest?.('.wt-product__info')) scheduleReconcile();
  });
  scheduleReconcile();
})();
