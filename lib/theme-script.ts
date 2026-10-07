// Runs inline in <head> before first paint so the page never flashes the wrong theme.
// A saved choice wins; otherwise follow the OS setting; otherwise light.
export const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})();`;
