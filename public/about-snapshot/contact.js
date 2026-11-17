document.addEventListener("submit", (event) => {
  event.preventDefault();
  window.parent.postMessage("revelcy:contact", window.location.origin);
});
