
window.addEventListener("message", (event) => {
  if (event.data === 'fullscreen') {
    document.body.requestFullscreen();
  }
});
