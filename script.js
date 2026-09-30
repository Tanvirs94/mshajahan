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

/* ---------- Weather (viewer's location) ---------- */
(function () {
  var el = document.getElementById('weather');
  if (!el) return;
  var codes = {
    0: ['☀️', 'Clear'], 1: ['🌤️', 'Mostly clear'], 2: ['⛅', 'Partly cloudy'], 3: ['☁️', 'Overcast'],
    45: ['🌫️', 'Fog'], 48: ['🌫️', 'Fog'], 51: ['🌦️', 'Light drizzle'], 53: ['🌦️', 'Drizzle'], 55: ['🌧️', 'Heavy drizzle'],
    61: ['🌧️', 'Light rain'], 63: ['🌧️', 'Rain'], 65: ['🌧️', 'Heavy rain'], 71: ['🌨️', 'Light snow'], 73: ['❄️', 'Snow'],
    75: ['❄️', 'Heavy snow'], 77: ['❄️', 'Snow grains'], 80: ['🌦️', 'Showers'], 81: ['🌧️', 'Showers'], 82: ['⛈️', 'Heavy showers'],
    85: ['🌨️', 'Snow showers'], 86: ['🌨️', 'Snow showers'], 95: ['⛈️', 'Thunderstorm'], 96: ['⛈️', 'Thunderstorm'], 99: ['⛈️', 'Thunderstorm']
  };
  function render(icon, temp, label, place) {
    el.innerHTML = '<span class="ico">' + icon + '</span><div><strong>' + temp + '</strong> · ' + label +
      '<small>' + (place || 'Your location') + '</small></div>';
  }
  function fetchWeather(lat, lon, place) {
    var us = /^en-US/i.test(navigator.language);
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
      '&current=temperature_2m,weather_code&temperature_unit=' + (us ? 'fahrenheit' : 'celsius');
    fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      var c = codes[d.current.weather_code] || ['🌡️', 'Current'];
      render(c[0], Math.round(d.current.temperature_2m) + (us ? '°F' : '°C'), c[1], place);
      if (!place) {
        fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + lat + '&longitude=' + lon + '&localityLanguage=en')
          .then(function (r) { return r.json(); }).then(function (g) {
            var p = [g.city || g.locality, g.principalSubdivision].filter(Boolean).join(', ');
            if (p) render(c[0], Math.round(d.current.temperature_2m) + (us ? '°F' : '°C'), c[1], p);
          }).catch(function () {});
      }
    }).catch(function () { el.textContent = 'Weather unavailable'; });
  }
  function byIP() {
    fetch('https://ipwho.is/').then(function (r) { return r.json(); }).then(function (g) {
      if (g.success === false) throw 0;
      fetchWeather(g.latitude, g.longitude, [g.city, g.region].filter(Boolean).join(', '));
    }).catch(function () { el.textContent = 'Weather unavailable'; });
  }
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (p) { fetchWeather(p.coords.latitude, p.coords.longitude); },
      byIP, { timeout: 6000, maximumAge: 600000 });
  } else byIP();
})();
