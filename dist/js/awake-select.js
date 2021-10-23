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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhd2FrZS1zZWxlY3QuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBGaW5hbCBjbGFzcyBmb3IgY3VzdG9tIHNlbGVjdFxuICovXG5cbmNsYXNzIEF3YWtlU2VsZWN0IHtcbiAgY29uc3RydWN0b3IgKCBlbGVtZW50LCBvcHRpb25zICkge1xuICAgIHRoaXMuJHNlbGVjdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIGVsZW1lbnQgKTtcbiAgICB0aGlzLiRvcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLiRvcHRpb25zLnBvc2l0aW9uID0gdGhpcy4kb3B0aW9ucy5wb3NpdGlvbiA/PyAnYXV0byc7XG4gICAgdGhpcy4kbmV3U2VsZWN0ID0gbnVsbDtcbiAgICB0aGlzLiRzZWFyY2hJbnB1dCA9IG51bGw7XG5cbiAgICBpZiAoIHRoaXMuJHNlbGVjdCAmJiB0aGlzLiRzZWxlY3QucXVlcnlTZWxlY3RvckFsbCggJ29wdGlvbicgKS5sZW5ndGggPiAwICkge1xuICAgICAgdGhpcy4jcmVuZGVyKCk7XG4gICAgICB0aGlzLiNhc3NpZ24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvciggYFRoZXJlIGlzIG5vIGVsZW1lbnQgbGlrZSAkeyBlbGVtZW50IH0gb3Igb3B0aW9uIGxlbmd0aCBlcXVhbHMgdG8gMGAgKTtcbiAgICB9XG4gIH1cblxuICAjZ2V0VGVtcGxhdGUgPSAoICRlbCwgJGRlZmF1bHRWYWx1ZSwgJG9wdGlvbnMgKSA9PiB7XG4gICAgY29uc3Qgc2VsZWN0X29wdGlvbnMgPSBbIC4uLiRlbC5xdWVyeVNlbGVjdG9yQWxsKCAnb3B0aW9uJyApIF0ubWFwKCAoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgIHJldHVybiBgXG4gICAgIDxsaSBjbGFzcz1cImF3LXNlbGVjdF9fZHJvcGRvd24tLWl0ZW0gJHsgJGRlZmF1bHRWYWx1ZS50b0xvd2VyQ2FzZSgpLnRyaW0oKSA9PT0gaXRlbS50ZXh0Q29udGVudC50b0xvd2VyQ2FzZSgpLnRyaW0oKSA/ICdjaG9zZW4nIDogJycgfVwiIGRhdGEtdHlwZT1cIm9wdGlvblwiIGRhdGEtdmFsdWU9XCIkeyBpdGVtLnZhbHVlIH1cIj5cbiAgICAgICAgJHsgaXRlbS50ZXh0Q29udGVudCB9XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiYXctc2VsZWN0X19kcm9wZG93bi0taXRlbS1jdXN0b21Db250ZW50XCIgc3R5bGU9XCJwb2ludGVyLWV2ZW50czogbm9uZVwiPiR7ICRvcHRpb25zLmN1c3RvbU9wdGlvbnNUZXh0Py5sZW5ndGggPiAwID8gKCRvcHRpb25zLmN1c3RvbU9wdGlvbnNUZXh0W2luZGV4XSA/PyAnJykgOiAnJyB9PC9zcGFuPlxuICAgIDwvbGk+XG4gICAgYDtcbiAgICB9ICk7XG5cbiAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJhdy1zZWxlY3RfX3NpbmdsZSAkeyRvcHRpb25zLnBvc2l0aW9uID8/ICcnfVwiIGRhdGEtdHlwZT1cInNpbmdsZVwiIHJvbGU9XCJidXR0b25cIj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJhdy1zZWxlY3RfX3NpbmdsZS0tdGV4dFwiIHN0eWxlPVwicG9pbnRlci1ldmVudHM6IG5vbmVcIiBkYXRhLXR5cGU9XCJ0ZXh0XCI+JHsgJGRlZmF1bHRWYWx1ZSA/PyAnQ2hvb3NlIGFuIG9wdGlvbicgfTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJhdy1zZWxlY3RfX3NpbmdsZS0tYXJyb3dcIiBzdHlsZT1cInBvaW50ZXItZXZlbnRzOiBub25lXCIgZGF0YS10eXBlPVwiYXJyb3dcIj48L3NwYW4+XG4gICAgPC9kaXY+XG4gICAgPHVsIGNsYXNzPVwiYXctc2VsZWN0X19kcm9wZG93biAkeyRvcHRpb25zLnBvc2l0aW9uID8/ICcnfVwiIGFyaWEtZXhwYW5kZWQ9XCJmYWxzZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIHN0eWxlPVwiJHsgJG9wdGlvbnMucG9zaXRpb24gPT09ICd0b3AnID8gJ3RvcDogXCIxMDAlXCI7JyA6ICcnIH0gJHsgJG9wdGlvbnMucG9zaXRpb24gPT09ICdib3R0b20nID8gJ2JvdHRvbTogXCIxMDAlXCI7JyA6ICcnIH1cIj5cbiAgICAgICAgJHsgJG9wdGlvbnMuc2VhcmNoID8gYDxpbnB1dCBjbGFzcz1cImF3LXNlbGVjdF9fZHJvcGRvd24tLWlucHV0XCIgdHlwZT0ndGV4dCcgZGF0YS1zZWFyY2ggcGxhY2Vob2xkZXI9XCIkeyAkb3B0aW9ucy5wbGFjZWhvbGRlcl90ZXh0ID8/ICdUeXBlIHlvdXIgdGV4dC4uLicgfVwiPmAgOiAnJyB9XG4gICAgICAgICR7IHNlbGVjdF9vcHRpb25zLmpvaW4oICcnICkgfVxuICAgIDwvdWw+XG4gIGA7XG4gIH07XG5cbiAgLyoqXG4gICAqIFByaXZhdGUgbWV0aG9kIHRvIHJlbmRlciBhbGwgZWxlbWVudHMgaW4gcGFnZVxuICAgKi9cblxuICAjcmVuZGVyICgpIHtcbiAgICB0aGlzLiRzZWxlY3Quc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBsZXQgZGVmYXVsdFZhbHVlO1xuXG4gICAgaWYgKCB0aGlzLiRzZWxlY3QudmFsdWUgKSB7XG4gICAgICBjb25zdCBvcHRpb24gPSBbIC4uLnRoaXMuJHNlbGVjdC5xdWVyeVNlbGVjdG9yQWxsKCAnb3B0aW9uJyApIF0uZmluZCggaXRlbSA9PiBpdGVtLnZhbHVlLnRvTG93ZXJDYXNlKCkudHJpbSgpID09PSB0aGlzLiRzZWxlY3QudmFsdWUudG9Mb3dlckNhc2UoKS50cmltKCkgKTtcbiAgICAgIGRlZmF1bHRWYWx1ZSA9IG9wdGlvbi50ZXh0Q29udGVudDtcbiAgICB9XG5cbiAgICB0aGlzLiRuZXdTZWxlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuICAgIHRoaXMuJG5ld1NlbGVjdC5jbGFzc0xpc3QuYWRkKCAnYXctc2VsZWN0JyApO1xuICAgIHRoaXMuJG5ld1NlbGVjdC5pbm5lckhUTUwgPSB0aGlzLiNnZXRUZW1wbGF0ZSggdGhpcy4kc2VsZWN0LCB0aGlzLiRvcHRpb25zLmRlZmF1bHRWYWx1ZSA/PyBkZWZhdWx0VmFsdWUsIHRoaXMuJG9wdGlvbnMgKTtcbiAgICB0aGlzLiRzZWxlY3QucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoIHRoaXMuJG5ld1NlbGVjdCwgdGhpcy4kc2VsZWN0Lm5leHRTaWJsaW5nICk7XG4gICAgdGhpcy4kc2VhcmNoSW5wdXQgPSB0aGlzLiRuZXdTZWxlY3QucXVlcnlTZWxlY3RvciggJ2lucHV0W2RhdGEtc2VhcmNoXScgKSA/PyBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFByaXZhdGUgbWV0aG9kIHRvIGFzc2lnbiBhbGwgb2YgaGFuZGxlcnNcbiAgICovXG5cbiAgI2Fzc2lnbiAoKSB7XG4gICAgdGhpcy5jbGlja0hhbmRsZXIgPSB0aGlzLmNsaWNrSGFuZGxlci5iaW5kKCB0aGlzICk7XG4gICAgdGhpcy5zZWFyY2hJbnB1dEhhbmRsZXIgPSB0aGlzLnNlYXJjaElucHV0SGFuZGxlci5iaW5kKCB0aGlzICk7XG4gICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVyID0gdGhpcy5jbGlja091dHNpZGVIYW5kbGVyLmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLmRyb3Bkb3duUG9zaXRpb25SZXNpemVIYW5kbGVyID0gdGhpcy5kcm9wZG93blBvc2l0aW9uUmVzaXplSGFuZGxlci5iaW5kKCB0aGlzIClcbiAgICB0aGlzLiRuZXdTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgdGhpcy5jbGlja0hhbmRsZXIgKTtcblxuICAgIGlmICh0aGlzLiRvcHRpb25zLnBvc2l0aW9uID09PSAnYXV0bycpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLmRyb3Bkb3duUG9zaXRpb25SZXNpemVIYW5kbGVyKTtcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMuJHNlYXJjaElucHV0ICkge1xuICAgICAgdGhpcy4kc2VhcmNoSW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ2lucHV0JywgdGhpcy5zZWFyY2hJbnB1dEhhbmRsZXIgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGVsZW1lbnQgcG9zaXRpb24gZGVwZW5kcyBvZiBwYWdlIG9mZnNldFxuICAgKiBAcGFyYW0gZWxlbVxuICAgKiBAcmV0dXJucyB7e3RvcDogbnVtYmVyLCBib3R0b206IG51bWJlcn19XG4gICAqL1xuXG4gIGdldEVsZW1lbnRQb3NpdGlvbkNvb3JkcyhlbGVtKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdG9wOiBlbGVtZW50LnRvcCArIHBhZ2VZT2Zmc2V0LFxuICAgICAgYm90dG9tOiBwYWdlWU9mZnNldCArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgLSBlbGVtZW50LnRvcCAsXG4gICAgfTtcblxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92aW5nIHNlYXJjaCB2YWx1ZSBhbmQgc2hvd2luZyBhbGwgb3B0aW9uc1xuICAgKi9cblxuICByZW1vdmVTZWFyY2hWYWx1ZSAoKSB7XG4gICAgaWYgKCB0aGlzLiRvcHRpb25zLnNlYXJjaCAmJiB0aGlzLiRzZWFyY2hJbnB1dCApIHtcbiAgICAgIHRoaXMuJHNlYXJjaElucHV0LnZhbHVlID0gJyc7XG4gICAgICB0aGlzLiRuZXdTZWxlY3QucXVlcnlTZWxlY3RvckFsbCggJ2xpW2RhdGEtdHlwZT1cIm9wdGlvblwiXScgKS5mb3JFYWNoKCBpdGVtID0+IGl0ZW0uc3R5bGUuZGlzcGxheSA9ICdibG9jaycgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkaW5nIGNsYXNzZXMgZm9yIGRyb3Bkb3duIGFuZCBzaW5nbGUgdGV4dCBlbGVtZW50XG4gICAqL1xuXG4gIGFkZGluZ0NsYXNzRm9yRHJvcGRvd25Qb3NpdGlvbigpIHtcbiAgICBjb25zdCBkcm9wZG93biA9IHRoaXMuJG5ld1NlbGVjdC5xdWVyeVNlbGVjdG9yKCAnLmF3LXNlbGVjdF9fZHJvcGRvd24nICk7XG4gICAgY29uc3Qgc2luZ2xlID0gdGhpcy4kbmV3U2VsZWN0LnF1ZXJ5U2VsZWN0b3IoICcuYXctc2VsZWN0X19zaW5nbGUnICk7XG5cbiAgICBjb25zdCBwb3NpdGlvbkNsYXNzID0gdGhpcy5nZXREcm9wZG93blBvc2l0aW9uKCk7XG5cbiAgICBpZiAocG9zaXRpb25DbGFzcykge1xuICAgICAgZHJvcGRvd24uY2xhc3NMaXN0LnJlbW92ZSgnYm90dG9tLXBvc2l0aW9uJywgJ3RvcC1wb3NpdGlvbicpXG4gICAgICBzaW5nbGUuY2xhc3NMaXN0LnJlbW92ZSgnYm90dG9tLXBvc2l0aW9uJywgJ3RvcC1wb3NpdGlvbicpXG4gICAgICBkcm9wZG93bi5jbGFzc0xpc3QuYWRkKHBvc2l0aW9uQ2xhc3MpO1xuICAgICAgc2luZ2xlLmNsYXNzTGlzdC5hZGQocG9zaXRpb25DbGFzcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlIHNlbGVjdCBpZiBjbGlja2VkIG91dHNpZGUgb2YgaXRcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuXG4gIGNsaWNrT3V0c2lkZUhhbmRsZXIgKCBldmVudCApIHtcbiAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgIGlmICggIXRhcmdldC5jbG9zZXN0KCAnLmF3LXNlbGVjdCcgKSApIHtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgIHRoaXMucmVtb3ZlU2VhcmNoVmFsdWUoKTtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdjbGljaycsIHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlciApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDbGljayBoYW5kbGVyIGZvciBvcGVuaW5nIGFuZCBjbG9zaW5nIGRyb3Bkb3duLCBjaG9vc2luZyBvcHRpb25cbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuXG4gIGNsaWNrSGFuZGxlciAoIGV2ZW50ICkge1xuICAgIGNvbnN0IHsgdHlwZSB9ID0gZXZlbnQudGFyZ2V0LmRhdGFzZXQ7XG5cblxuICAgIGlmICggdHlwZSA9PT0gJ3NpbmdsZScpIHtcbiAgICAgIHRoaXMudG9nZ2xlKCk7XG5cbiAgICAgIGlmICh0aGlzLiRvcHRpb25zLnBvc2l0aW9uID09PSAnYXV0bycpIHtcbiAgICAgICAgdGhpcy5hZGRpbmdDbGFzc0ZvckRyb3Bkb3duUG9zaXRpb24oKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIHR5cGUgPT09ICdvcHRpb24nKSB7XG4gICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgdGFyZ2V0LnBhcmVudE5vZGUucXVlcnlTZWxlY3RvckFsbCggJy5hdy1zZWxlY3RfX2Ryb3Bkb3duLS1pdGVtJyApLmZvckVhY2goIGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QucmVtb3ZlKCAnY2hvc2VuJyApICk7XG4gICAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZCggJ2Nob3NlbicgKTtcbiAgICAgIHRoaXMuJHNlbGVjdC52YWx1ZSA9IGV2ZW50LnRhcmdldC5kYXRhc2V0LnZhbHVlO1xuICAgICAgdGhpcy4kbmV3U2VsZWN0LnF1ZXJ5U2VsZWN0b3IoICcuYXctc2VsZWN0X19zaW5nbGUtLXRleHQnICkudGV4dENvbnRlbnQgPSB0YXJnZXQuY2hpbGROb2Rlc1swXS50ZXh0Q29udGVudDtcbiAgICAgIHRoaXMucmVtb3ZlU2VhcmNoVmFsdWUoKTtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VhcmNoIGlucHV0IGhhbmRsZXIgdGhhdCBmaWx0ZXJzIGFsbCB2YWx1ZXMgYW5kIHNob3dpbmcgbWF0Y2hlc1xuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG5cbiAgc2VhcmNoSW5wdXRIYW5kbGVyICggZXZlbnQgKSB7XG4gICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICBsZXQgdmFsdWUgPSB0YXJnZXQudmFsdWU7XG4gICAgY29uc3Qgc2VsZWN0SXRlbXMgPSB0aGlzLiRuZXdTZWxlY3QucXVlcnlTZWxlY3RvckFsbCggJy5hdy1zZWxlY3RfX2Ryb3Bkb3duLS1pdGVtJyApO1xuXG4gICAgaWYgKCBzZWxlY3RJdGVtcyApIHtcbiAgICAgIGNvbnN0IGZpbHRlcmVkSXRlbXMgPSBbIC4uLnNlbGVjdEl0ZW1zIF0uZmlsdGVyKCBpdGVtID0+IHtcbiAgICAgICAgaWYgKCBpdGVtLnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoIHZhbHVlLnRvTG93ZXJDYXNlKCkudHJpbSgpICkgKSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH1cbiAgICAgIH0gKTtcblxuICAgICAgaWYgKCB2YWx1ZS5sZW5ndGggPiAwICkge1xuICAgICAgICBzZWxlY3RJdGVtcy5mb3JFYWNoKCAoIGVsLCBpICkgPT4ge1xuICAgICAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIH0gKTtcblxuICAgICAgICBmaWx0ZXJlZEl0ZW1zLmZvckVhY2goICggaXRlbSApID0+IHtcbiAgICAgICAgICBpdGVtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICB9ICk7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGVjdEl0ZW1zLmZvckVhY2goICggZWwsIGkgKSA9PiB7XG4gICAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzaXplIGhhbmRsZXIgYW5kIGNoYW5naW5nIGNsYXNzZXMgb2YgZHJvcGRvd24gYW5kIHNpbmdsZSBlbGVtZW50IHRleHQgcG9zaXRpb25cbiAgICovXG5cbiAgZHJvcGRvd25Qb3NpdGlvblJlc2l6ZUhhbmRsZXIoKSB7XG4gICAgaWYgKHRoaXMuJG9wdGlvbnMucG9zaXRpb24gPT09ICdhdXRvJykge1xuICAgICAgdGhpcy5hZGRpbmdDbGFzc0ZvckRyb3Bkb3duUG9zaXRpb24oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHN0YXR1cyBvZiBkcm9wZG93biAob3BlbiBvciBjbG9zZSlcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuXG4gIGdldCBpc09wZW4gKCkge1xuICAgIHJldHVybiB0aGlzLiRuZXdTZWxlY3QuY2xhc3NMaXN0LmNvbnRhaW5zKCAnb3BlbicgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGUgY2xhc3MgZm9yIGRyb3Bkb3duLCBzZXQgYW5kIHJlbW92ZSBjbGlja091dHNpZGVIYW5kbGVyIGluIGRvY3VtZW50XG4gICAqL1xuXG4gIHRvZ2dsZSAoKSB7XG4gICAgaWYgKCB0aGlzLmlzT3BlbiApIHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdjbGljaycsIHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlciApO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub3BlbigpO1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgdGhpcy5jbGlja091dHNpZGVIYW5kbGVyICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjbGFzcyBmb3IgcG9zaXRpb24gb2YgZHJvcGRvd24gZWxlbWVudCBkZXBlbmRzIG9mIHBhZ2Ugb2Zmc2V0XG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuXG4gIGdldERyb3Bkb3duUG9zaXRpb24oKSB7XG4gICAgY29uc3QgZHJvcGRvd25IZWlnaHQgPSB0aGlzLiRuZXdTZWxlY3QucXVlcnlTZWxlY3RvcignLmF3LXNlbGVjdF9fZHJvcGRvd24nKS5jbGllbnRIZWlnaHQ7XG4gICAgY29uc3QgYm90dG9tUG9zID0gdGhpcy5nZXRFbGVtZW50UG9zaXRpb25Db29yZHModGhpcy4kbmV3U2VsZWN0KS5ib3R0b207XG4gICAgY29uc3QgdG9wUG9zID0gdGhpcy5nZXRFbGVtZW50UG9zaXRpb25Db29yZHModGhpcy4kbmV3U2VsZWN0KS50b3A7XG4gICAgbGV0IGNsYXNzZXM7XG5cbiAgICBpZiAoZHJvcGRvd25IZWlnaHQgPiBib3R0b21Qb3MpIHtcbiAgICAgIGNsYXNzZXMgPSAnYm90dG9tLXBvc2l0aW9uJztcbiAgICB9XG5cbiAgICBpZiAoZHJvcGRvd25IZWlnaHQgPiB0b3BQb3MpIHtcbiAgICAgIGNsYXNzZXMgPSAndG9wLXBvc2l0aW9uJztcbiAgICB9XG5cbiAgICByZXR1cm4gY2xhc3NlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVuIGRyb3Bkb3duXG4gICAqL1xuXG4gIG9wZW4gKCkge1xuICAgIGNvbnN0IGRyb3Bkb3duID0gdGhpcy4kbmV3U2VsZWN0LnF1ZXJ5U2VsZWN0b3IoICcuYXctc2VsZWN0X19kcm9wZG93bicgKTtcbiAgICBjb25zdCBhd1NlbGVjdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCAnLmF3LXNlbGVjdCcgKTtcblxuICAgIGlmIChhd1NlbGVjdHMpIHtcbiAgICAgIGF3U2VsZWN0cy5mb3JFYWNoKCBpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSggJ29wZW4nICkgKVxuICAgIH1cblxuICAgIHRoaXMuJG5ld1NlbGVjdC5jbGFzc0xpc3QuYWRkKCAnb3BlbicgKTtcbiAgICBkcm9wZG93bi5zZXRBdHRyaWJ1dGUoICdhcmlhLWV4cGFuZGVkJywgJ3RydWUnICk7XG4gICAgZHJvcGRvd24uc2V0QXR0cmlidXRlKCAnYXJpYS1oaWRkZW4nLCAnZmFsc2UnICk7XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2UgZHJvcGRvd25cbiAgICovXG5cbiAgY2xvc2UgKCkge1xuICAgIGNvbnN0IGRyb3Bkb3duID0gdGhpcy4kbmV3U2VsZWN0LnF1ZXJ5U2VsZWN0b3IoICcuYXctc2VsZWN0X19kcm9wZG93bicgKTtcbiAgICB0aGlzLiRuZXdTZWxlY3QuY2xhc3NMaXN0LnJlbW92ZSggJ29wZW4nICk7XG4gICAgdGhpcy4kbmV3U2VsZWN0LnF1ZXJ5U2VsZWN0b3IoICcuYXctc2VsZWN0X19kcm9wZG93bicgKS5zZXRBdHRyaWJ1dGUoICdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyApO1xuICAgIGRyb3Bkb3duLnNldEF0dHJpYnV0ZSggJ2FyaWEtaGlkZGVuJywgJ3RydWUnICk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveSBzZWxlY3RcbiAgICovXG5cbiAgZGVzdHJveSAoKSB7XG4gICAgdGhpcy4kbmV3U2VsZWN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdjbGljaycsIHRoaXMuY2xpY2tIYW5kbGVyICk7XG4gICAgdGhpcy4kbmV3U2VsZWN0LnJlbW92ZSgpO1xuICAgIHRoaXMuJHNlbGVjdC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgfVxufVxuIl0sImZpbGUiOiJhd2FrZS1zZWxlY3QuanMifQ==
