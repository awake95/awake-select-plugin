/**
 * Final class for custom select
 */

class AwakeSelect {
  constructor ( element, options ) {
    this.$select = document.querySelector( element );
    this.$options = options;
    this.$options.position = this.$options.position ?? 'auto';
    this.$newSelect = null;
    this.$searchInput = null;

    if ( this.$select && this.$select.querySelectorAll( 'option' ).length > 0 ) {
      this.#render();
      this.#assign();
    } else {
      console.error( `There is no element like ${ element } or option length equals to 0` );
    }
  }

  #getTemplate = ( $el, $defaultValue, $options ) => {
    const select_options = [ ...$el.querySelectorAll( 'option' ) ].map( (item, index) => {
      return `
     <li class="aw-select__dropdown--item ${ $defaultValue.toLowerCase().trim() === item.textContent.toLowerCase().trim() ? 'chosen' : '' }" data-type="option" data-value="${ item.value }">
        ${ item.textContent }
        <span class="aw-select__dropdown--item-customContent" style="pointer-events: none">${ $options.customOptionsText?.length > 0 ? ($options.customOptionsText[index] ?? '') : '' }</span>
    </li>
    `;
    } );

    return `<div class="aw-select__single ${$options.position ?? ''}" data-type="single" role="button">
        <span class="aw-select__single--text" style="pointer-events: none" data-type="text">${ $defaultValue ?? 'Choose an option' }</span>
        <span class="aw-select__single--arrow" style="pointer-events: none" data-type="arrow"></span>
    </div>
    <ul class="aw-select__dropdown ${$options.position ?? ''}" aria-expanded="false" aria-hidden="true" style="${ $options.position === 'top' ? 'top: "100%";' : '' } ${ $options.position === 'bottom' ? 'bottom: "100%";' : '' }">
        ${ $options.search ? `<input class="aw-select__dropdown--input" type='text' data-search placeholder="${ $options.placeholder_text ?? 'Type your text...' }">` : '' }
        ${ select_options.join( '' ) }
    </ul>
  `;
  };

  /**
   * Private method to render all elements in page
   */

  #render () {
    this.$select.style.display = 'none';
    let defaultValue;

    if ( this.$select.value ) {
      const option = [ ...this.$select.querySelectorAll( 'option' ) ].find( item => item.value.toLowerCase().trim() === this.$select.value.toLowerCase().trim() );
      defaultValue = option.textContent;
    }

    this.$newSelect = document.createElement( 'div' );
    this.$newSelect.classList.add( 'aw-select' );
    this.$newSelect.innerHTML = this.#getTemplate( this.$select, this.$options.defaultValue ?? defaultValue, this.$options );
    this.$select.parentNode.insertBefore( this.$newSelect, this.$select.nextSibling );
    this.$searchInput = this.$newSelect.querySelector( 'input[data-search]' ) ?? null;
  }

  /**
   * Private method to assign all of handlers
   */

  #assign () {
    this.clickHandler = this.clickHandler.bind( this );
    this.searchInputHandler = this.searchInputHandler.bind( this );
    this.clickOutsideHandler = this.clickOutsideHandler.bind( this );
    this.dropdownPositionResizeHandler = this.dropdownPositionResizeHandler.bind( this )
    this.$newSelect.addEventListener( 'click', this.clickHandler );

    if (this.$options.position === 'auto') {
      window.addEventListener('resize', this.dropdownPositionResizeHandler);
    }

    if ( this.$searchInput ) {
      this.$searchInput.addEventListener( 'input', this.searchInputHandler );
    }
  }

  /**
   * Get element position depends of page offset
   * @param elem
   * @returns {{top: number, bottom: number}}
   */

  getElementPositionCoords(elem) {
    const element = elem.getBoundingClientRect();

    return {
      top: element.top + pageYOffset,
      bottom: pageYOffset + document.documentElement.clientHeight - element.top ,
    };

  }

  /**
   * Removing search value and showing all options
   */

  removeSearchValue () {
    if ( this.$options.search && this.$searchInput ) {
      this.$searchInput.value = '';
      this.$newSelect.querySelectorAll( 'li[data-type="option"]' ).forEach( item => item.style.display = 'block' );
    }
  }

  /**
   * Adding classes for dropdown and single text element
   */

  addingClassForDropdownPosition() {
    const dropdown = this.$newSelect.querySelector( '.aw-select__dropdown' );
    const single = this.$newSelect.querySelector( '.aw-select__single' );

    const positionClass = this.getDropdownPosition();

    if (positionClass) {
      dropdown.classList.remove('bottom-position', 'top-position')
      single.classList.remove('bottom-position', 'top-position')
      dropdown.classList.add(positionClass);
      single.classList.add(positionClass);
    }
  }

  /**
   * Close select if clicked outside of it
   * @param event
   */

  clickOutsideHandler ( event ) {
    let target = event.target;
    if ( !target.closest( '.aw-select' ) ) {
      this.close();
      this.removeSearchValue();
      document.removeEventListener( 'click', this.clickOutsideHandler );
    }
  }

  /**
   * Click handler for opening and closing dropdown, choosing option
   * @param event
   */

  clickHandler ( event ) {
    const { type } = event.target.dataset;


    if ( type === 'single') {
      this.toggle();

      if (this.$options.position === 'auto') {
        this.addingClassForDropdownPosition();
      }
    }

    if ( type === 'option') {
      let target = event.target;
      target.parentNode.querySelectorAll( '.aw-select__dropdown--item' ).forEach( item => item.classList.remove( 'chosen' ) );
      target.classList.add( 'chosen' );
      this.$select.value = event.target.dataset.value;
      this.$newSelect.querySelector( '.aw-select__single--text' ).textContent = target.childNodes[0].textContent;
      this.removeSearchValue();
      this.close();
    }
  }

  /**
   * Search input handler that filters all values and showing matches
   * @param event
   */

  searchInputHandler ( event ) {
    let target = event.target;
    let value = target.value;
    const selectItems = this.$newSelect.querySelectorAll( '.aw-select__dropdown--item' );

    if ( selectItems ) {
      const filteredItems = [ ...selectItems ].filter( item => {
        if ( item.textContent.toLowerCase().includes( value.toLowerCase().trim() ) ) {
          return item;
        }
      } );

      if ( value.length > 0 ) {
        selectItems.forEach( ( el, i ) => {
          el.style.display = 'none';
        } );

        filteredItems.forEach( ( item ) => {
          item.style.display = 'block';
        } );

      } else {
        selectItems.forEach( ( el, i ) => {
          el.style.display = 'block';
        } );
      }
    }
  }

  /**
   * Resize handler and changing classes of dropdown and single element text position
   */

  dropdownPositionResizeHandler() {
    if (this.$options.position === 'auto') {
      this.addingClassForDropdownPosition();
    }
  }

  /**
   * Get status of dropdown (open or close)
   * @returns {boolean}
   */

  get isOpen () {
    return this.$newSelect.classList.contains( 'open' );
  }

  /**
   * Toggle class for dropdown, set and remove clickOutsideHandler in document
   */

  toggle () {
    if ( this.isOpen ) {
      document.removeEventListener( 'click', this.clickOutsideHandler );
      this.close();

    } else {
      this.open();
      document.addEventListener( 'click', this.clickOutsideHandler );
    }
  }

  /**
   * Get class for position of dropdown element depends of page offset
   * @returns {string}
   */

  getDropdownPosition() {
    const dropdownHeight = this.$newSelect.querySelector('.aw-select__dropdown').clientHeight;
    const bottomPos = this.getElementPositionCoords(this.$newSelect).bottom;
    const topPos = this.getElementPositionCoords(this.$newSelect).top;
    let classes;

    if (dropdownHeight > bottomPos) {
      classes = 'bottom-position';
    }

    if (dropdownHeight > topPos) {
      classes = 'top-position';
    }

    return classes;
  }

  /**
   * Open dropdown
   */

  open () {
    const dropdown = this.$newSelect.querySelector( '.aw-select__dropdown' );
    const awSelects = document.querySelectorAll( '.aw-select' );

    if (awSelects) {
      awSelects.forEach( item => item.classList.remove( 'open' ) )
    }

    this.$newSelect.classList.add( 'open' );
    dropdown.setAttribute( 'aria-expanded', 'true' );
    dropdown.setAttribute( 'aria-hidden', 'false' );
  }

  /**
   * Close dropdown
   */

  close () {
    const dropdown = this.$newSelect.querySelector( '.aw-select__dropdown' );
    this.$newSelect.classList.remove( 'open' );
    this.$newSelect.querySelector( '.aw-select__dropdown' ).setAttribute( 'aria-expanded', 'false' );
    dropdown.setAttribute( 'aria-hidden', 'true' );
  }

  /**
   * Destroy select
   */

  destroy () {
    this.$newSelect.removeEventListener( 'click', this.clickHandler );
    this.$newSelect.remove();
    this.$select.style.display = 'block';
  }
}
