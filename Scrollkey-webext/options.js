function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    scrollkey_scrollvalue: document.querySelector("#scrollkey_scrollvalue").value
  });
  browser.storage.local.set({
    scrollkey_scrollvalue_shift: document.querySelector("#scrollkey_scrollvalue_shift").value
  });
  browser.storage.local.set({
    scrollkey_scrollvalue_alt: document.querySelector("#scrollkey_scrollvalue_alt").value
  });
  browser.storage.local.set({
    scrollkey_horizontal_scroll: document.querySelector("#scrollkey_horizontal_scroll").checked
  });
  browser.storage.local.set({
    scrollkey_horizontal_scroll_shift: document.querySelector("#scrollkey_horizontal_scroll_shift").checked
  });
  browser.storage.local.set({
    scrollkey_horizontal_scroll_alt: document.querySelector("#scrollkey_horizontal_scroll_alt").checked
  });
  browser.storage.local.set({
    scrollkey_scroll_pagedown_pageup: document.querySelector("#scrollkey_scroll_pagedown_pageup").checked
  });
}

function restoreOptions() {

  function setScrollValue(result) {
    document.querySelector("#scrollkey_scrollvalue").value = value(result) || 400;
  }
  
  function setScrollValueShift(result) {
	document.querySelector("#scrollkey_scrollvalue_shift").value = value(result) || 400;
  }
  
  function setScrollValueAlt(result) {
	document.querySelector("#scrollkey_scrollvalue_alt").value = value(result) || 400;
  }
  
  function setHorizontalScroll(result) {
    document.querySelector("#scrollkey_horizontal_scroll").checked = value(result) || false;
  }
  
  function setHorizontalScrollShift(result) {
	document.querySelector("#scrollkey_horizontal_scroll_shift").checked = value(result) || false;
  }
  
  function setHorizontalScrollAlt(result) {
	document.querySelector("#scrollkey_horizontal_scroll_alt").checked = value(result) || false;
  }
  
  function setScrollPageDownPageUp(result){
  	document.querySelector("#scrollkey_scroll_pagedown_pageup").checked = value(result) || false;
  }

  function onError(error) {
    console.log('Error: ${error}');
  }

  function value(result){
	for(var key in result) {
	  if(result.hasOwnProperty(key)) {
        return result[key];
	  }
	}
	return undefined;
  }
  
  var getting1 = browser.storage.local.get("scrollkey_scrollvalue");
  getting1.then(setScrollValue, onError);
  
  var getting2 = browser.storage.local.get("scrollkey_scrollvalue_shift");
  getting2.then(setScrollValueShift, onError);
  
  var getting3 = browser.storage.local.get("scrollkey_scrollvalue_alt");
  getting3.then(setScrollValueAlt, onError);
  
  var getting4 = browser.storage.local.get("scrollkey_horizontal_scroll");
  getting4.then(setHorizontalScroll, onError);
  
  var getting5 = browser.storage.local.get("scrollkey_horizontal_scroll_shift");
  getting5.then(setHorizontalScrollShift, onError);
  
  var getting6 = browser.storage.local.get("scrollkey_horizontal_scroll_alt");
  getting6.then(setHorizontalScrollAlt, onError);
  
  var getting7 = browser.storage.local.get("scrollkey_scroll_pagedown_pageup");
  getting7.then(setScrollPageDownPageUp, onError);
}

function i18n() {
  document.querySelector("#scrollvalue").innerHTML = browser.i18n.getMessage("scrollvalue"); // "Scrollwaarde";
  document.querySelector("#pagedownpageup").innerHTML = browser.i18n.getMessage("pagedownpageup"); // "PageDown en PageUp scrollen de waarde zoals hierboven aangegeven";
  document.querySelector("#horizontalscroll").innerHTML = browser.i18n.getMessage("horizontalscroll"); // "Gebruik de sneltoets hierboven voor horizontaal scrollen";
  document.querySelector("#scrollvalueshift").innerHTML = browser.i18n.getMessage("scrollvalueshift"); // "Scrollwaarde (Shift)";
  document.querySelector("#horizontalscrollshift").innerHTML = browser.i18n.getMessage("horizontalscroll"); // "Gebruik de sneltoets hierboven voor horizontaal scrollen";
  document.querySelector("#scrollvaluealt").innerHTML = browser.i18n.getMessage("scrollvaluealt"); // "Scrollwaarde (Alt)";
  document.querySelector("#horizontalscrollalt").innerHTML = browser.i18n.getMessage("horizontalscroll"); // "Gebruik de sneltoets hierboven voor horizontaal scrollen";
  document.querySelector("#savepreferences").innerHTML = browser.i18n.getMessage("savepreferences"); // "Voorkeuren opslaan";
}

function init(){
	restoreOptions();
	i18n();
}

document.addEventListener("DOMContentLoaded", init);
document.querySelector("form").addEventListener("submit", saveOptions);
