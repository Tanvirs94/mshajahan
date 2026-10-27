/* ---------- Rotating background images ---------- */
(function () {
  var ids = [1015, 1018, 1039, 1043, 1036, 1016];
  var bg = document.querySelector('.bg');
  if (!bg) return;
  var slides = ids.map(function (id) {
    var d = document.createElement('div');
    d.className = 'slide';
    d.dataset.src = 'https://picsum.photos/id/' + id + '/1920/1080';
    bg.appendChild(d);
    return d;
  });
  function load(i) {
    var s = slides[i];
    if (s.dataset.loaded) return Promise.resolve();
    return new Promise(function (res) {
      var img = new Image();
      img.onload = img.onerror = function () { s.style.backgroundImage = 'url(' + s.dataset.src + ')'; s.dataset.loaded = 1; res(); };
      img.src = s.dataset.src;
    });
  }
  var cur = -1;
  function show(i) {
    load(i).then(function () {
      if (cur >= 0) slides[cur].classList.remove('on');
      slides[i].classList.add('on');
      cur = i;
      load((i + 1) % slides.length);
    });
  }
  show(Math.floor(Math.random() * slides.length));
  setInterval(function () { show((cur + 1) % slides.length); }, 8000);
})();
