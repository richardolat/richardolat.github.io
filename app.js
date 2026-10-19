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

  // Aketi This Week
  var recaps = (data.recaps || []).slice().sort(byDate);
  function postUrl(id) { return "https://www.facebook.com/100002063623600/posts/" + id; }
  var twc = document.getElementById("tw-count");
  if (twc) twc.textContent = recaps.length;
  var feat = ["3857921550953261", "4125803340831746", "5010096245735780"];
  var tf = document.getElementById("tw-featured");
  if (tf) tf.innerHTML = feat.map(function (id) {
    var r = recaps.filter(function (x) { return x.post === id; })[0] || {};
    return '<figure class="tw-card"><div class="tw-embed"><iframe data-src="https://www.facebook.com/plugins/post.php?href=' + encodeURIComponent(postUrl(id)) + '&show_text=true" width="500" height="640" scrolling="no" frameborder="0" loading="lazy" allowfullscreen allow="clipboard-write; encrypted-media; picture-in-picture; web-share" title="Aketi This Week, ' + esc(fmt(r.date)) + '"></iframe></div>' +
      '<figcaption><time>' + fmt(r.date) + '</time></figcaption></figure>';
  }).join("");
  if (tf) [].forEach.call(tf.querySelectorAll("iframe[data-src]"), function (f) {
    var w = Math.min(500, Math.max(250, Math.floor(f.parentElement.clientWidth || 350)));
    f.src = f.getAttribute("data-src") + "&width=" + w;
    f.removeAttribute("data-src");
  });
  var ta = document.getElementById("tw-archive");
  if (ta) {
    var years = {};
    recaps.forEach(function (r) { var y = r.date.slice(0, 4); (years[y] = years[y] || []).push(r); });
    ta.innerHTML = Object.keys(years).sort().reverse().map(function (y) {
      return '<div class="tw-year"><h4>' + y + '</h4><ul>' + years[y].map(function (r) {
        return '<li><a href="' + postUrl(r.post) + '" target="_blank" rel="noopener">' + fmt(r.date, true) + '</a></li>';
      }).join("") + '</ul></div>';
    }).join("");
  }

  // Videos
  var vcats = [
    { id: "projects", label: "Projects", intro: "Roads, bridges, water and the people who use them." },
    { id: "people", label: "People", intro: "Empowerment, enterprise and social programmes." },
    { id: "governance", label: "Governance", intro: "Policy, security, the council and the regional stage." },
    { id: "record", label: "On the Record", intro: "Television interviews and answers to rumour, on camera." },
    { id: "milestones", label: "Milestones", intro: "Honours, court victories and celebrations." },
    { id: "campaign", label: "Campaign 2020", intro: "The re-election campaign he spoke for as spokesperson." },
    { id: "onair", label: "On Air", intro: "Media Parley on Adaba 88.9 FM, Akure: the state-sponsored programme he presented as Special Assistant on New Media." }
  ];
  var vids = data.videos || [];
  var radio = (data.radio || []).slice().sort(byDate);
  var vt = document.getElementById("video-tabs"), vl = document.getElementById("video-list"), vi = document.getElementById("video-intro"), vm = document.getElementById("video-more");
  var cur = "projects", shown = 6;
  function items(c) { return c === "onair" ? radio : vids.filter(function (v) { return v.cat === c; }); }
  function fbCard(v) {
    var src = "https://www.facebook.com/plugins/video.php?href=" + encodeURIComponent("https://www.facebook.com/olatunde.rechard/videos/" + v.fb + "/") + "&show_text=false";
    return '<figure class="video"><div class="frame"><iframe data-src="' + src + '" title="' + esc(v.title) + '" loading="lazy" scrolling="no" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe></div>' +
      '<figcaption><h3>' + esc(v.title) + '</h3><p class="meta"><a href="https://www.facebook.com/olatunde.rechard/videos/' + v.fb + '/" target="_blank" rel="noopener">Watch on Facebook</a></p></figcaption></figure>';
  }
  function radioCard(r) {
    return '<figure class="video"><div class="frame"><video controls preload="none" playsinline poster="' + esc(r.poster) + '"><source src="' + esc(r.video) + '" type="video/mp4"></video></div>' +
      '<figcaption><p class="meta"><span class="tag light">' + esc(r.station) + '</span>' + (r.date ? '<time>' + fmt(r.date) + '</time>' : '') + '</p>' +
      '<h3>' + esc(r.title) + '</h3><p>' + esc(r.summary) + '</p></figcaption></figure>';
  }
  function sizeFrames(root) {
    [].forEach.call(root.querySelectorAll("iframe[data-src]"), function (f) {
      var w = Math.max(220, Math.floor(f.parentElement.clientWidth || 320));
      var h = Math.round(w * 9 / 16);
      f.src = f.getAttribute("data-src") + "&width=" + w + "&height=" + h;
      f.removeAttribute("data-src");
    });
  }
  function renderVideos() {
    var list = items(cur);
    vl.innerHTML = list.slice(0, shown).map(cur === "onair" ? radioCard : fbCard).join("");
    sizeFrames(vl);
    vm.hidden = list.length <= shown;
    vi.textContent = vcats.filter(function (c) { return c.id === cur; })[0].intro;
    [].forEach.call(vt.children, function (b) { b.classList.toggle("on", b.dataset.cat === cur); b.setAttribute("aria-selected", b.dataset.cat === cur); });
  }
  if (vt) {
    vt.innerHTML = vcats.map(function (c) {
      return '<button type="button" role="tab" data-cat="' + c.id + '">' + esc(c.label) + '<span class="count">' + items(c.id).length + '</span></button>';
    }).join("");
    vt.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      cur = b.dataset.cat; shown = 6; renderVideos();
    });
    vm.addEventListener("click", function () { shown += 6; renderVideos(); });
    renderVideos();
  }
})();
