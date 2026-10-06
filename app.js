(function () {
  var data = window.PORTFOLIO || {};
  function byDate(a, b) { return (b.date || "").localeCompare(a.date || ""); }
  function fmt(d, short) {
    if (!d) return "";
    var p = d.split("-");
    var dt = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
    return dt.toLocaleDateString("en-GB", short ? { day: "numeric", month: "short", timeZone: "UTC" } : { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  }
  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var now = new Date();
  document.getElementById("today").textContent = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  document.getElementById("year").textContent = now.getFullYear();

  // Statements by role
  var roles = data.roles || [];
  var total = roles.reduce(function (n, r) { return n + r.items.length; }, 0);
  document.querySelector("#stat-statements strong").textContent = total;
  var tabs = document.getElementById("role-tabs");
  var list = document.getElementById("statements-list");
  var intro = document.getElementById("role-intro");

  function showRole(id) {
    var r = roles.filter(function (x) { return x.id === id; })[0] || roles[0];
    tabs.querySelectorAll("button").forEach(function (b) {
      var on = b.getAttribute("data-id") === r.id;
      b.classList.toggle("on", on); b.setAttribute("aria-selected", on);
    });
    intro.innerHTML = '<p class="period">' + esc(r.period) + '</p><p class="sig">Signed: <em>' + esc(r.signature) + '</em></p>';
    var items = r.items.slice().sort(byDate), year = "", html = "";
    items.forEach(function (s) {
      var y = s.date.slice(0, 4);
      if (y !== year) { year = y; html += '<li class="yr"><span>' + y + '</span></li>'; }
      html += '<li><time datetime="' + esc(s.date) + '">' + fmt(s.date, true) + '</time>' +
        '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + '</a></li>';
    });
    list.innerHTML = html;
    try { history.replaceState(null, "", "#statements-" + r.id); } catch (e) {}
  }
  tabs.innerHTML = roles.map(function (r) {
    return '<button type="button" role="tab" data-id="' + r.id + '">' + esc(r.label) + ' <span class="count">' + r.items.length + '</span></button>';
  }).join("");
  tabs.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (b) showRole(b.getAttribute("data-id"));
  });
  var m = location.hash.match(/^#statements-(\w+)/);
  showRole(m ? m[1] : roles[0] && roles[0].id);

  // Milestones
  document.getElementById("milestones-list").innerHTML = (data.milestones || []).slice().sort(function (a, b) { return a.date.localeCompare(b.date); }).map(function (s) {
    return '<article class="ms"><time>' + fmt(s.date) + '</time><h3><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + '</a></h3><p>' + esc(s.note) + '</p></article>';
  }).join("");

  // Writings
  document.getElementById("writings-list").innerHTML = (data.writings || []).slice().sort(byDate).map(function (s) {
    return '<li><time datetime="' + esc(s.date) + '">' + fmt(s.date) + '</time><div><h3><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + '</a></h3><p class="source">' + esc(s.outlet) + '</p></div></li>';
  }).join("");

  // Stories
  document.getElementById("stories-list").innerHTML = (data.stories || []).slice().sort(byDate).map(function (s) {
    return '<li><time datetime="' + esc(s.date) + '">' + fmt(s.date) + '</time>' +
      '<div><h3><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + '</a></h3>' +
      '<p>' + esc(s.summary) + ' <span class="source">' + esc(s.outlet) + '</span></p></div></li>';
  }).join("");

  // Radio
  document.getElementById("radio-list").innerHTML = (data.radio || []).slice().sort(byDate).map(function (r) {
    var media = r.youtube
      ? '<div class="frame"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(r.youtube) + '" title="' + esc(r.title) + '" allowfullscreen loading="lazy"></iframe></div>'
      : '<div class="frame"><video controls preload="none" playsinline poster="' + esc(r.poster) + '"><source src="' + esc(r.video) + '" type="video/mp4"></video></div>';
    return '<figure class="video">' + media +
      '<figcaption><p class="meta"><span class="tag light">' + esc(r.station) + '</span>' + (r.date ? '<time>' + fmt(r.date) + '</time>' : '') + '</p>' +
      '<h3>' + esc(r.title) + '</h3><p>' + esc(r.summary) + '</p></figcaption></figure>';
  }).join("");
})();
