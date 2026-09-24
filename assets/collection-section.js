class CollectionSection extends HTMLElement {
  constructor() {
    super();

    this.pageOverlayClass = "page-overlay";
    this.activeOverlayBodyClass = `${this.pageOverlayClass}-on`;
    this.classDrawerActive = "wt-filter--drawer-open";
    this.breakpoint = 1200;
    this.isDrawer = this.dataset.filterPosition === "drawer";

    this.drawer = () => this.querySelector(".wt-filter");
    this.getCloseButton = () => this.querySelector(".wt-filter__close");
    this.getTrigger = () => this.querySelector(".collection__filter-trigger");
    this.isOpen = () =>
      document.body.classList.contains(this.activeOverlayBodyClass);
    this.sectionsTriggers = () =>
      this.drawer()?.querySelectorAll(".wt-collapse__trigger") ?? [];
    this.toggleDrawerElements = () => {
      const drawer = this.drawer();
      const selector = drawer?.dataset.toggleTabindex;
      return drawer && selector ? drawer.querySelectorAll(selector) : [];
    };

    this.handleBodyClick = this.handleBodyClick.bind(this);
    this.handleClickCapture = this.handleClickCapture.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleResize = this.handleResize.bind(this);

    this.overlay = null;
    this.pendingKeyboardClickTarget = null;
    this.pendingKeyboardClickTimer = null;
    this.currentDrawerMode = this.isDrawerMode();
    this.init();
  }

  init() {
    this.createOverlay();
    this.updateTabindexes(this.isOpen(), false);
    document.body.addEventListener("click", this.handleBodyClick);
    this.addEventListener("click", this.handleClickCapture, true);
    this.addEventListener("keydown", this.handleKeydown);
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  }

  disconnectedCallback() {
    document.body.removeEventListener("click", this.handleBodyClick);
    this.removeEventListener("click", this.handleClickCapture, true);
    this.removeEventListener("keydown", this.handleKeydown);
    window.removeEventListener("resize", this.handleResize);
    if (this.pendingKeyboardClickTimer) {
      window.clearTimeout(this.pendingKeyboardClickTimer);
    }
  }

  isDrawerMode() {
    return this.isDrawer || window.innerWidth <= this.breakpoint;
  }

  handleBodyClick(event) {
    if (!(event.target instanceof Element)) return;

    const action = event.target.closest(
      ".wt-filter__close, .page-overlay, .collection__filter-trigger",
    );
    if (!action) return;

    const isOverlay = action.classList.contains(this.pageOverlayClass);
    if ((isOverlay && this.isOpen()) || (!isOverlay && this.contains(action))) {
      this.toggleDrawer(event);
    }
  }

  handleClickCapture(event) {
    if (!this.pendingKeyboardClickTarget || event.detail !== 0) return;
    if (!(event.target instanceof Element)) return;

    const target = event.target.closest(
      ".collection__filter-trigger, .wt-collapse__trigger",
    );
    if (target !== this.pendingKeyboardClickTarget) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    this.clearPendingKeyboardClick();
  }

  suppressNextSyntheticClick(target) {
    this.clearPendingKeyboardClick();
    this.pendingKeyboardClickTarget = target;
    this.pendingKeyboardClickTimer = window.setTimeout(
      () => this.clearPendingKeyboardClick(),
      350,
    );
  }

  clearPendingKeyboardClick() {
    if (this.pendingKeyboardClickTimer) {
      window.clearTimeout(this.pendingKeyboardClickTimer);
    }
    this.pendingKeyboardClickTimer = null;
    this.pendingKeyboardClickTarget = null;
  }

  handleKeydown(event) {
    const isEscape =
      event.key === "Escape" || event.keyCode === 27 || event.code === "Escape";
    if (isEscape && this.isOpen()) {
      this.toggleDrawer(event);
      return;
    }

    const isActivation =
      event.key === "Enter" ||
      event.key === " " ||
      event.key === "Spacebar" ||
      event.code === "Space";

    if (isActivation && event.target instanceof Element) {
      const drawerTrigger = event.target.closest(".collection__filter-trigger");
      if (drawerTrigger && this.contains(drawerTrigger)) {
        if (this.currentDrawerMode) {
          this.toggleDrawer(event);
          this.suppressNextSyntheticClick(drawerTrigger);
        }
        return;
      }

      const sectionTrigger = event.target.closest(".wt-collapse__trigger");
      if (sectionTrigger && this.drawer()?.contains(sectionTrigger)) {
        event.preventDefault();
        sectionTrigger.click();
        this.suppressNextSyntheticClick(sectionTrigger);
        return;
      }
    }

    const isTab =
      event.key === "Tab" || event.keyCode === 9 || event.code === "Tab";
    if (!isTab || !this.isOpen() || !this.currentDrawerMode) return;

    const { first, last } = this.getFocusableElements();
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  }

  handleResize() {
    const isDrawerMode = this.isDrawerMode();
    if (isDrawerMode === this.currentDrawerMode) return;

    const wasOpen = this.isOpen();
    this.currentDrawerMode = isDrawerMode;

    if (isDrawerMode) {
      if (!wasOpen) {
        this.drawer()?.classList.remove(this.classDrawerActive);
        document.body.classList.remove(this.activeOverlayBodyClass);
      }
      this.updateTabindexes(this.isOpen(), false);
      return;
    }

    if (wasOpen) this.restorePagePosition();
    this.drawer()?.classList.add(this.classDrawerActive);
    document.body.classList.remove(this.activeOverlayBodyClass);
    this.updateTabindexes(true, false);
  }

  temporaryHideFocusVisible() {
    document.body.classList.add("no-focus-visible");
  }

  getFocusableElements() {
    const selector =
      "button, [href], input:not([type='hidden']), select, [tabindex]";
    const elements = Array.from(this.drawer()?.querySelectorAll(selector) ?? []).filter(
      (element) =>
        !element.hasAttribute("disabled") &&
        element.tabIndex >= 0 &&
        element.offsetParent !== null,
    );

    return {
      focusableElements: elements,
      first: elements[0],
      last: elements[elements.length - 1],
    };
  }

  updateDrawerAccessibility(isOpen) {
    const drawer = this.drawer();
    const trigger = this.getTrigger();
    if (!drawer) return;

    if (this.currentDrawerMode) {
      drawer.toggleAttribute("inert", !isOpen);
      drawer.setAttribute("aria-hidden", String(!isOpen));
      trigger?.setAttribute("aria-expanded", String(isOpen));
      return;
    }

    drawer.removeAttribute("inert");
    drawer.removeAttribute("aria-hidden");
    trigger?.setAttribute("aria-expanded", "true");
  }

  updateTabindexes(isOpen, moveFocus = false) {
    if (this.currentDrawerMode) {
      if (isOpen) {
        this.updateDrawerAccessibility(true);
        setTabindex(this.sectionsTriggers(), "0");
        setTabindex(this.toggleDrawerElements(), "0");
        if (moveFocus) {
          this.getCloseButton()?.focus();
          this.temporaryHideFocusVisible();
        }
      } else {
        this.closeAllCollapsibleSections();
        setTabindex(this.sectionsTriggers(), "-1");
        setTabindex(this.toggleDrawerElements(), "-1");
        this.updateDrawerAccessibility(false);
        if (moveFocus) {
          this.getTrigger()?.focus();
          this.temporaryHideFocusVisible();
        }
      }
      return;
    }

    this.updateDrawerAccessibility(true);
    setTabindex(this.sectionsTriggers(), "0");
    setTabindex(this.toggleDrawerElements(), "0");
  }

  restorePagePosition() {
    const storedTop = Number.parseInt(document.body.style.top, 10);
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    if (Number.isFinite(storedTop)) window.scrollTo(0, -storedTop);
  }

  toggleDrawer(event) {
    if (event) event.preventDefault();
    if (!this.currentDrawerMode) return;

    const opening = !this.isOpen();
    if (opening) {
      document.body.style.top = `${-document.documentElement.scrollTop}px`;
      document.body.style.left = "0px";
    } else {
      this.restorePagePosition();
      this.closeAllCollapsibleSections();
    }

    this.drawer()?.classList.toggle(this.classDrawerActive, opening);
    document.body.classList.toggle(this.activeOverlayBodyClass, opening);
    this.updateTabindexes(opening, true);
  }

  closeAllCollapsibleSections() {
    const openSections =
      this.drawer()?.querySelectorAll('[data-open="true"]') ?? [];
    openSections.forEach((section) => {
      const trigger = section.querySelector(".wt-collapse__trigger");
      if (!trigger) return;

      trigger.classList.remove("wt-collapse__trigger--active");
      section.dataset.open = "false";
      setTabindex(section.querySelectorAll('[tabindex="0"]'), "-1");
    });
  }

  createOverlay() {
    this.overlay = document.querySelector(`.${this.pageOverlayClass}`);
    if (this.overlay) return;

    this.overlay = document.createElement("div");
    this.overlay.classList.add(this.pageOverlayClass);
    document.body.appendChild(this.overlay);
  }
}

customElements.define("collection-section", CollectionSection);
