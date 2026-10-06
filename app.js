(function () {
  var data = window.PORTFOLIO || { statements: [], stories: [], radio: [] };

  function byDate(a, b) { return (b.date || "").localeCompare(a.date || ""); }
  function fmt(d) {
    if (!d) return "";
    var p = d.split("-");
    var dt = new Date(Date.UTC(+p[0], (+p[1] || 1) - 1, +p[2] || 1));
    var opts = p.length === 3 ? { day: "numeric", month: "long", year: "numeric" } : { month: "long", year: "numeric" };
    return dt.toLocaleDateString("en-GB", Object.assign({ timeZone: "UTC" }, opts));
  }
  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Dateline
  var now = new Date();
  document.getElementById("today").textContent = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  document.getElementById("year").textContent = now.getFullYear();

  // Statements
  var statements = data.statements.slice().sort(byDate);
  document.querySelector("#stat-statements strong").textContent = statements.length;
  var list = document.getElementById("statements-list");

  function renderStatements(tag) {
    list.innerHTML = statements
      .filter(function (s) { return !tag || s.tag === tag; })
      .map(function (s, i) {
        return '<article class="card' + (i === 0 && !tag ? " feature" : "") + '">' +
          '<p class="meta"><span class="tag">' + esc(s.tag) + '</span><time datetime="' + esc(s.date) + '">' + fmt(s.date) + '</time></p>' +
          '<h3><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + '</a></h3>' +
          '<p>' + esc(s.summary) + '</p>' +
          '<p class="source">' + esc(s.outlet) + ' <span aria-hidden="true">&rarr;</span></p>' +
          '</article>';
      }).join("");
  }

  var tags = [];
  statements.forEach(function (s) { if (s.tag && tags.indexOf(s.tag) < 0) tags.push(s.tag); });
  var filters = document.getElementById("filters");
  filters.innerHTML = ['<button type="button" class="on" data-tag="">All</button>']
    .concat(tags.map(function (t) { return '<button type="button" data-tag="' + esc(t) + '">' + esc(t) + '</button>'; })).join("");
  filters.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    filters.querySelectorAll("button").forEach(function (x) { x.classList.toggle("on", x === b); });
    renderStatements(b.getAttribute("data-tag"));
  });
  renderStatements("");

  // Stories
  document.getElementById("stories-list").innerHTML = data.stories.slice().sort(byDate).map(function (s) {
    return '<li><time datetime="' + esc(s.date) + '">' + fmt(s.date) + '</time>' +
      '<div><h3><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + '</a></h3>' +
      '<p>' + esc(s.summary) + ' <span class="source">' + esc(s.outlet) + '</span></p></div></li>';
  }).join("");

  // Radio
  document.getElementById("radio-list").innerHTML = data.radio.slice().sort(byDate).map(function (r) {
    var media = r.youtube
      ? '<div class="frame"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(r.youtube) + '" title="' + esc(r.title) + '" allowfullscreen loading="lazy"></iframe></div>'
      : '<div class="frame"><video controls preload="none" playsinline poster="' + esc(r.poster) + '"><source src="' + esc(r.video) + '" type="video/mp4"></video></div>';
    return '<figure class="video">' + media +
      '<figcaption><p class="meta"><span class="tag light">' + esc(r.station) + '</span>' + (r.date ? '<time>' + fmt(r.date) + '</time>' : '') + '</p>' +
      '<h3>' + esc(r.title) + '</h3><p>' + esc(r.summary) + '</p></figcaption></figure>';
  }).join("");
})();
