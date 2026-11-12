import sys

file_path = "apps/android_app/app/src/main/assets/leaflet/map.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add beamMode variable and window.setBeamMode function
target1 = """    // Continuous 360-degree angle unwrap tracker to eliminate jitter and 359/1 spin
    var cumulativeHdg = 0;
    var lastRawHdg = null;

    function applySmoothHeading(rawHdg) {
      if (typeof rawHdg !== 'number' || isNaN(rawHdg)) return;
      if (lastRawHdg === null) {
        lastRawHdg = rawHdg;
        cumulativeHdg = rawHdg;
      } else {
        var delta = (rawHdg - lastRawHdg + 540) % 360 - 180;
        cumulativeHdg += delta;
        lastRawHdg = rawHdg;
      }
      var beam = document.getElementById('directionBeam');
      if (beam) {
        beam.style.transform = 'rotate(' + cumulativeHdg + 'deg)';
      }
    }"""

replacement1 = """    // Direction beam alignment mode: 'forward' (default: locked to North/top of phone) or 'compass'
    var beamMode = 'forward';

    // Continuous 360-degree angle unwrap tracker to eliminate jitter and 359/1 spin
    var cumulativeHdg = 0;
    var lastRawHdg = null;

    window.setBeamMode = function(mode) {
      beamMode = mode;
      var beam = document.getElementById('directionBeam');
      if (beam) {
        if (beamMode === 'forward') {
          beam.style.transform = 'rotate(0deg)';
        } else {
          beam.style.transform = 'rotate(' + cumulativeHdg + 'deg)';
        }
      }
      console.log("RAMS: setBeamMode switched to " + beamMode);
    };

    function applySmoothHeading(rawHdg) {
      if (typeof rawHdg !== 'number' || isNaN(rawHdg)) return;
      if (lastRawHdg === null) {
        lastRawHdg = rawHdg;
        cumulativeHdg = rawHdg;
      } else {
        var delta = (rawHdg - lastRawHdg + 540) % 360 - 180;
        cumulativeHdg += delta;
        lastRawHdg = rawHdg;
      }
      var beam = document.getElementById('directionBeam');
      if (beam) {
        if (beamMode === 'forward') {
          beam.style.transform = 'rotate(0deg)';
        } else {
          beam.style.transform = 'rotate(' + cumulativeHdg + 'deg)';
        }
      }
    }"""

if target1 in content:
    content = content.replace(target1, replacement1)
    print("Replaced applySmoothHeading and added setBeamMode.")
else:
    print("Could not find target1 in map.html")
    sys.exit(1)

# 2. Update createUserIcon to use beamMode
target2 = """    function createUserIcon(hdg) {
      var beamSvg = '<svg class="direction-beam-container" id="directionBeam" viewBox="0 0 160 160" style="transform: rotate(' + hdg + 'deg);">' +"""

replacement2 = """    function createUserIcon(hdg) {
      var initRot = (beamMode === 'forward') ? 0 : hdg;
      var beamSvg = '<svg class="direction-beam-container" id="directionBeam" viewBox="0 0 160 160" style="transform: rotate(' + initRot + 'deg);">' +"""

if target2 in content:
    content = content.replace(target2, replacement2)
    print("Updated createUserIcon.")
else:
    print("Could not find target2 in map.html")
    sys.exit(1)

# 3. Update dynamic road-geometry enhancement in setDestinationPinAndRoute
target3 = """      // Dynamic road-geometry enhancement: if coarse route received, query OSRM directly in WebView for pixel-perfect road curvature
      if (points.length <= 5 && navigator.onLine && typeof fetch === 'function') {
        var osrmClientUrl = "https://router.project-osrm.org/route/v1/driving/" + currentLon.toFixed(6) + "," + currentLat.toFixed(6) + ";" + destLon.toFixed(6) + "," + destLat.toFixed(6) + "?overview=full&geometries=geojson";
        fetch(osrmClientUrl, { headers: { 'Accept': 'application/json' } })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (data && data.routes && data.routes.length > 0) {
              var coords = data.routes[0].geometry.coordinates;
              var highResRoadPoints = coords.map(function(c) { return [c[1], c[0]]; });
              if (highResRoadPoints.length > 0 && routePolyline && routeGlowLine) {
                routeGlowLine.setLatLngs(highResRoadPoints);
                routePolyline.setLatLngs(highResRoadPoints);
                var g = new L.featureGroup([userMarker, destinationMarker, routePolyline]);
                map.fitBounds(g.getBounds().pad(0.22), { animate: true, duration: 0.8 });
                console.log("RAMS: Leaflet upgraded route to " + highResRoadPoints.length + " high-res road coordinates.");
              }
            }
          })
          .catch(function(err) {
            console.warn("Client OSRM upgrade skipped: " + err);
          });
      }"""

replacement3 = """      // Dynamic road-geometry enhancement: query OSRM directly in WebView for pixel-perfect road curvature
      if (points.length < 35 && typeof fetch === 'function') {
        var osrmClientUrl = "https://router.project-osrm.org/route/v1/driving/" + currentLon.toFixed(6) + "," + currentLat.toFixed(6) + ";" + destLon.toFixed(6) + "," + destLat.toFixed(6) + "?overview=full&geometries=geojson";
        var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
        var timeoutId = controller ? setTimeout(function() { controller.abort(); }, 8000) : null;
        var fetchOpts = { headers: { 'Accept': 'application/json' } };
        if (controller) fetchOpts.signal = controller.signal;

        fetch(osrmClientUrl, fetchOpts)
          .then(function(res) { 
            if (timeoutId) clearTimeout(timeoutId);
            return res.json(); 
          })
          .then(function(data) {
            if (data && data.routes && data.routes.length > 0) {
              var coords = data.routes[0].geometry.coordinates;
              var highResRoadPoints = coords.map(function(c) { return [c[1], c[0]]; });
              if (highResRoadPoints.length > 0 && routePolyline && routeGlowLine) {
                routeGlowLine.setLatLngs(highResRoadPoints);
                routePolyline.setLatLngs(highResRoadPoints);
                var g = new L.featureGroup([userMarker, destinationMarker, routePolyline]);
                map.fitBounds(g.getBounds().pad(0.22), { animate: true, duration: 0.8 });
                console.log("RAMS: Leaflet upgraded route to " + highResRoadPoints.length + " high-res road coordinates.");
              }
            }
          })
          .catch(function(err) {
            console.warn("Client OSRM upgrade skipped: " + err);
          });
      }"""

if target3 in content:
    content = content.replace(target3, replacement3)
    print("Updated dynamic road-geometry enhancement.")
else:
    print("Could not find target3 in map.html")
    sys.exit(1)

with open(file_path, "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print("Updated map.html successfully.")

