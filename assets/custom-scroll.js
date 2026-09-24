import Swiper from "./swiper-bundle.esm.browser.min.js";class CustomScroll extends HTMLElement{constructor(){super();this.init()}
init(){const swiper=new Swiper(this,{direction:"vertical",slidesPerView:"auto",freeMode:!0,grabCursor:!0,scrollbar:{el:this.querySelector(".swiper-scrollbar"),draggable:!0,},mousewheel:!0,})}}
customElements.define("custom-scroll",CustomScroll)