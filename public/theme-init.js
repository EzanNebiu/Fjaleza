// Applies the saved theme before the first paint so there is no light/dark flash.
// Mirrors useSettings() in src/hooks/useSettings.ts.
(function () {
  function read() {
    try {
      return JSON.parse(localStorage.getItem('fjaleza:settings:v2') || '{}') || {};
    } catch {
      return {}; // storage blocked: use the system theme
    }
  }
  var s = read();
  var theme = s.theme || 'system';
  var dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  var root = document.documentElement;
  root.dataset.theme = dark ? 'dark' : 'light';
  root.dataset.cb = s.colorBlind ? 'on' : 'off';
  root.dataset.motion = s.reducedMotion === 'on' ? 'reduce' : 'system';
})();
