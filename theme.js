// Picks the design draft before first paint: ?design=… wins, then the last choice, then A.
(function () {
  var DESIGNS = ["toraya", "teamlab", "hobonichi"];
  var KEY = "ssaju-design";

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function store(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  var fromUrl = new URLSearchParams(location.search).get("design");
  var current = DESIGNS.indexOf(fromUrl) >= 0 ? fromUrl : DESIGNS.indexOf(stored()) >= 0 ? stored() : DESIGNS[0];

  function apply(name) {
    current = name;
    document.documentElement.dataset.design = name;
    document.getElementById("theme-css").href = "themes/" + name + ".css";
    document.querySelectorAll(".switcher [data-design]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.design === name));
    });
  }

  apply(current);

  document.addEventListener("DOMContentLoaded", function () {
    apply(current);
    document.querySelectorAll(".switcher [data-design]").forEach(function (b) {
      b.addEventListener("click", function () {
        apply(b.dataset.design);
        store(b.dataset.design);
        var url = new URL(location.href);
        url.searchParams.set("design", b.dataset.design);
        history.replaceState(null, "", url);
      });
    });
  });
})();
