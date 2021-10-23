# awake-select-plugin
This is custom select plugin

USAGE

Add script and css from dist folder. Awake-select.js before your main script file.
In your main js file: 

// Usage example, where #selector is selector for DOM element
const select = new AwakeSelect('#selector', {

})

OPTIONS:
{
  position: string, // default 'auto', variants: ['top', 'bottom', 'auto]
  search: boolean, // default false
  placeholder_text: string, //default "Type your text..."
  customOptionsText: array, // default empty, add your own content after option text
}

METHODS:

open() - open select dropdown,
close() - close select dropdown,
destroy() - destroy select and show default select

GET METHOD: 
isOpen() - get status of dropdown (is it open or close) - return boolean


