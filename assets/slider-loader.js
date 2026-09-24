(() => {
  const loaderScript = document.currentScript ?? document.querySelector('script[data-slider-module-src]');
  const sliderModuleUrl = loaderScript?.dataset.sliderModuleSrc;

  if (!sliderModuleUrl) return;

  let sliderModulePromise;
  let sliderObserver;

  const loadSliderModule = () => {
    if (sliderModulePromise) return sliderModulePromise;

    document.documentElement.dataset.kairaliSliderLoader = 'loading';
    sliderObserver?.disconnect();
    window.removeEventListener('scroll', loadIfSliderIsNearViewport);
    sliderModulePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = sliderModuleUrl;
      script.onload = () => {
        document.documentElement.dataset.kairaliSliderLoader = 'loaded';
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return sliderModulePromise;
  };

  const observeSliders = () => {
    const sliders = document.querySelectorAll('slideshow-section');
    if (!sliders.length) return;

    loadIfSliderIsNearViewport();

    if ('IntersectionObserver' in window && !sliderModulePromise) {
      sliderObserver ??= new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) loadSliderModule();
        },
        { rootMargin: '600px -20px 600px 0px' }
      );
      sliders.forEach((slider) => sliderObserver.observe(slider));
    }
  };

  function loadIfSliderIsNearViewport() {
    const threshold = window.innerHeight + 600;
    const sliderIsNearViewport = Array.from(document.querySelectorAll('slideshow-section')).some((slider) => {
      const bounds = slider.getBoundingClientRect();
      return bounds.bottom >= -600
        && bounds.top <= threshold
        && bounds.right > 0
        && bounds.left < document.documentElement.clientWidth;
    });

    document.documentElement.dataset.kairaliSliderLoader = sliderIsNearViewport ? 'near' : 'waiting';
    if (sliderIsNearViewport) loadSliderModule();
  }

  const loadForSliderInteraction = (event) => {
    if (event.target.closest?.('slideshow-section')) loadSliderModule();
  };

  document.addEventListener('pointerdown', loadForSliderInteraction, { capture: true, passive: true });
  document.addEventListener('focusin', loadForSliderInteraction, true);
  window.addEventListener('scroll', loadIfSliderIsNearViewport, { passive: true });
  document.addEventListener('shopify:section:load', observeSliders);
  document.documentElement.dataset.kairaliSliderLoader = 'ready';

  observeSliders();
})();
