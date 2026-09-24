if(!customElements.get("collection-feature")){customElements.define("collection-feature",class CollectionFeature extends HTMLElement{constructor(){super();this.changeColors=this.changeColors.bind(this);this.resetColors=this.resetColors.bind(this)}
connectedCallback(){this._initProperties();this._attachEventListeners()}
_initProperties(){this.sectionId=this.dataset.sectionId;this.section=document.querySelector(`[data-section-id="${this.sectionId}"]`,);if(!this.section){console.error("Section not found");return}
this.items=this.section.querySelectorAll(".collection-feature__item")}
_attachEventListeners(){this.items.forEach((item)=>item.addEventListener("mouseover",()=>this.changeColors(item)),);this.items.forEach((item)=>item.addEventListener("mouseleave",this.resetColors),)}
changeColors(item){const color=item.dataset.hoverColor;const background=item.dataset.hoverBackground;this.section.style.color=color||"";this.section.style.background=background||""}
resetColors(){this.section.style.color="";this.section.style.background=""}
disconnectedCallback(){this.items.forEach((item)=>{item.removeEventListener("mouseover",this.changeColors);item.removeEventListener("mouseleave",this.resetColors)})}},)}