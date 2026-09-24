(() => {
  if (customElements.get('exit-offer-popup')) return;

  class KairaliExitOffer extends HTMLElement {
    connectedCallback() {
      this.dialog = this.querySelector('dialog');
      if (!this.dialog) return;

      const params = new URLSearchParams(window.location.search);
      this.preview = params.get('exit_offer_preview') === '1' || window.Shopify?.designMode === true;
      this.enabled = this.dataset.enabled === 'true' || this.preview;
      this.storeKey = `kairali_exit_offer_${this.dataset.store || window.location.host}_v1`;
      this.success = Boolean(this.querySelector('[data-exit-offer-success]'));
      this.opened = false;
      this.startedAt = Date.now();

      if (!this.enabled && !this.success) return;
      if (this.shouldSkipPage()) return;

      this.hidden = false;
      this.bindControls();

      if (this.success || this.querySelector('.kairali-exit-offer__error') || this.preview) {
        this.show(this.success ? 'conversion' : 'preview');
        if (this.success) this.remember('converted', Number(this.dataset.convertedDays || 30));
        return;
      }

      if (this.isSuppressed()) return;
      this.bindTriggers();
    }

    shouldSkipPage() {
      return /^(\/cart|\/checkout|\/checkouts|\/account|\/challenge)(\/|$)/.test(window.location.pathname);
    }

    storage() {
      try {
        const preferencesAllowed = window.Shopify?.customerPrivacy?.preferencesProcessingAllowed?.() === true;
        return preferencesAllowed ? window.localStorage : window.sessionStorage;
      } catch (_error) {
        return window.sessionStorage;
      }
    }

    readState() {
      try {
        return JSON.parse(this.storage().getItem(this.storeKey) || '{}');
      } catch (_error) {
        return {};
      }
    }

    isSuppressed() {
      const state = this.readState();
      return Number(state.until || 0) > Date.now();
    }

    remember(reason, days) {
      try {
        this.storage().setItem(this.storeKey, JSON.stringify({
          reason,
          until: Date.now() + days * 86400000
        }));
      } catch (_error) {
        // The one-session guard below still prevents repeated interruptions.
      }
    }

    bindTriggers() {
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        this.exitHandler = (event) => {
          if (event.relatedTarget === null && event.clientY <= 10 && Date.now() - this.startedAt >= 8000) {
            this.show('exit_intent');
          }
        };
        document.addEventListener('mouseout', this.exitHandler);
        return;
      }

      const delay = Number(this.dataset.mobileDelay || 45) * 1000;
      const threshold = Number(this.dataset.mobileScroll || 65);
      this.mobileReady = false;
      this.mobileTimer = window.setTimeout(() => {
        this.mobileReady = true;
        this.tryMobileShow(threshold);
      }, delay);
      this.scrollHandler = () => this.tryMobileShow(threshold);
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
    }

    tryMobileShow(threshold) {
      if (!this.mobileReady || this.opened) return;
      const available = document.documentElement.scrollHeight - window.innerHeight;
      const percent = available > 0 ? (window.scrollY / available) * 100 : 0;
      if (percent >= threshold) this.show('engaged_mobile');
    }

    hasCompetingModal() {
      return Array.from(document.querySelectorAll('dialog[open], [aria-modal="true"]'))
        .some((element) => {
          if (element === this.dialog || this.contains(element)) return false;
          if (element.matches('dialog')) return element.open;
          if (element.getAttribute('aria-hidden') === 'true') return false;

          const style = window.getComputedStyle(element);
          if (style.display === 'none' || style.visibility === 'hidden' || element.getClientRects().length === 0) return false;

          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.bottom > 0 && rect.left < window.innerWidth && rect.top < window.innerHeight;
        });
    }

    show(trigger) {
      if (this.opened || this.hasCompetingModal()) return;
      this.opened = true;
      this.cleanupTriggers();
      this.push('exit_offer_impression', { trigger });

      document.documentElement.classList.add('kairali-exit-offer-open');

      if (typeof this.dialog.showModal === 'function') this.dialog.showModal();
      else this.dialog.setAttribute('open', '');

      window.requestAnimationFrame(() => {
        const focusTarget = this.querySelector('input[type="email"], [data-exit-offer-copy], [data-exit-offer-close]');
        focusTarget?.focus();
      });
    }

    close(reason = 'dismiss') {
      if (!this.dialog.open) return;
      this.push('exit_offer_dismiss', { reason });
      if (!this.success) this.remember('dismissed', Number(this.dataset.dismissDays || 7));
      this.dialog.close();
      document.documentElement.classList.remove('kairali-exit-offer-open');
    }

    bindControls() {
      this.querySelector('[data-exit-offer-close]')?.addEventListener('click', () => this.close('close_button'));
      this.dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        this.close('escape');
      });
      this.dialog.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        this.close('escape');
      });
      this.dialog.addEventListener('click', (event) => {
        if (event.target === this.dialog) this.close('backdrop');
      });
      this.querySelector('form')?.addEventListener('submit', () => {
        this.push('exit_offer_submit', { offer: 'SAVE5' });
      });
      this.querySelector('[data-exit-offer-support]')?.addEventListener('click', () => {
        this.push('exit_offer_support_click', {});
      });
      this.querySelector('[data-exit-offer-shop]')?.addEventListener('click', () => {
        this.push('exit_offer_shop_click', { offer: 'SAVE5' });
      });
      this.querySelector('[data-exit-offer-copy]')?.addEventListener('click', (event) => this.copyCode(event.currentTarget));
    }

    async copyCode(button) {
      const code = this.querySelector('[data-exit-offer-code]')?.textContent.trim();
      if (!code) return;

      try {
        await navigator.clipboard.writeText(code);
      } catch (_error) {
        const range = document.createRange();
        range.selectNodeContents(this.querySelector('[data-exit-offer-code]'));
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('copy');
        selection.removeAllRanges();
      }

      button.textContent = 'Copied';
      this.push('exit_offer_code_copy', { offer: code });
    }

    push(event, details) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event,
        exitOfferStore: this.dataset.store || window.location.host,
        exitOfferVariant: 'native_v1',
        ...details
      });
    }

    cleanupTriggers() {
      if (this.exitHandler) document.removeEventListener('mouseout', this.exitHandler);
      if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler);
      if (this.mobileTimer) window.clearTimeout(this.mobileTimer);
    }

    disconnectedCallback() {
      this.cleanupTriggers();
      document.documentElement.classList.remove('kairali-exit-offer-open');
    }
  }

  customElements.define('exit-offer-popup', KairaliExitOffer);
})();
