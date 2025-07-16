//sidebar



  // Toggle data panel

let outsideClickListener;

function show() {
  const div = document.getElementById('div1');
  div.classList.toggle('show');

  if (div.classList.contains('show')) {
    if (!outsideClickListener) {
      outsideClickListener = function (event) {
        if (!div.contains(event.target)) {
          div.classList.remove('show');
          document.removeEventListener('click', outsideClickListener);
          outsideClickListener = null;
        }
      };

      setTimeout(() => {
        document.addEventListener('click', outsideClickListener);
      }, 0);
    }
  } else {
    if (outsideClickListener) {
      document.removeEventListener('click', outsideClickListener);
      outsideClickListener = null;
    }
  }
}




//Data details side 

let originalData = [];

document.addEventListener('DOMContentLoaded', function() {
  loadTableData();

  document.getElementById('coordFormat').addEventListener('change', updateTableFormat);
  document.getElementById('exportBtn').addEventListener('click', exportToExcel);
});

function loadTableData() {
  fetch('http://localhost:3000/data/display_data')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      originalData = data;
      renderTable(data, 'latlong');
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      const tableBody = document.querySelector('#data-table tbody');
      tableBody.innerHTML = `<tr><td colspan="3" style="color: red;">Error loading data: ${error.message}</td></tr>`;
    });
}

function renderTable(data, format) {
  const tableBody = document.querySelector('#data-table tbody');
  tableBody.innerHTML = '';

  data.forEach(item => {
    const row = document.createElement('tr');
    let latContent, longContent;

    switch (format) {
      case 'dms':
        latContent = decimalToDMS(item.lat, true);
        longContent = decimalToDMS(item.long, false);
        break;
      case 'utm':
        const utm = decimalToUTM(item.lat, item.long);
        latContent = `${utm.easting}E`;
        longContent = `${utm.northing}N`;
        break;
      default:
        latContent = item.lat;
        longContent = item.long;
    }

    row.innerHTML = `
      <td>${item.corner}</td>
      <td class="lat-cell">${latContent}</td>
      <td class="long-cell">${longContent}</td>
    `;
    tableBody.appendChild(row);
  });

  updateTableHeaders(format);
}

function updateTableHeaders(format) {
  const headers = document.querySelectorAll('#data-table th');
  if (format === 'utm') {
    headers[1].textContent = 'Easting';
    headers[2].textContent = 'Northing';
  } else {
    headers[1].textContent = 'Latitude';
    headers[2].textContent = 'Longitude';
  }
}

function updateTableFormat() {
  const format = document.getElementById('coordFormat').value;
  renderTable(originalData, format);
}

function decimalToDMS(decimal, isLat) {
  const direction = isLat ? (decimal >= 0 ? 'N' : 'S') : (decimal >= 0 ? 'E' : 'W');
  const absDecimal = Math.abs(decimal);
  const degrees = Math.floor(absDecimal);
  const minutesNotTruncated = (absDecimal - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);
  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

function decimalToUTM(lat, lng) {
  const zone = Math.floor((lng + 180) / 6) + 1;
  const easting = (lng - (-180 + (zone - 1) * 6)) * 111319.9;
  const northing = lat * 110574;
  return {
    zone: zone,
    easting: easting.toFixed(2),
    northing: northing.toFixed(2)
  };
}

function exportToExcel() {
  if (typeof XLSX === 'undefined') {
    alert('Please wait for the export library to load and try again.');
    return;
  }

  let filename = document.getElementById('excelFilename').value.trim() || 'coordinates_data';
  if (!filename.toLowerCase().endsWith('.xlsx')) {
    filename += '.xlsx';
  }

  const format = document.getElementById('coordFormat').value;
  let formatName;
  switch (format) {
    case 'dms':
      formatName = "COORDINATE FORMAT: DMS (Degrees, Minutes, Seconds)";
      break;
    case 'utm':
      formatName = "COORDINATE FORMAT: UTM (Universal Transverse Mercator)";
      break;
    default:
      formatName = "COORDINATE FORMAT: Decimal Degrees";
  }

  const headers = ['Corner'];
  if (format === 'utm') {
    headers.push('Easting', 'Northing');
  } else {
    headers.push('Latitude', 'Longitude');
  }

  const rows = Array.from(document.querySelectorAll('#data-table tbody tr')).map(row =>
    Array.from(row.cells).map(cell => cell.textContent)
  );

  const worksheetData = [
    [formatName],
    [],
    headers,
    ...rows
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push({
    s: { r: 0, c: 0 },
    e: { r: 0, c: headers.length - 1 }
  });

  worksheet['A1'].s = {
    font: { bold: true, sz: 14 },
    alignment: { horizontal: 'center' }
  };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Coordinates");
  XLSX.writeFile(workbook, filename);
}

if (typeof XLSX === 'undefined') {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
  document.head.appendChild(script);
}



// Initialize and draw map
const map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function abbreviateCorner(corner) {
  if (!corner) return '';
  const uppercaseLetters = corner.match(/[A-Z]/g);
  if (uppercaseLetters && uppercaseLetters.length > 1) {
    return uppercaseLetters.join('').slice(0, 2);
  } else if (corner.length > 2) {
    return corner.slice(0, 2).toUpperCase();
  }
  return corner.toUpperCase();
}

function createNumberIcon(label) {
  const text = abbreviateCorner(label);
  return L.divIcon({
    className: 'number-icon',
    html: `<div>${text}</div>`,  // ✅ Fixed: Use backticks for HTML string
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

let markers = [], polyline = null, areMarkersVisible = true;
const toggleBtn = document.getElementById('togglePointsBtn');
toggleBtn.addEventListener('click', e => {
  e.stopPropagation();
  areMarkersVisible = !areMarkersVisible;
  markers.forEach(m => {
    areMarkersVisible ? map.addLayer(m) : map.removeLayer(m);
  });
  toggleBtn.textContent = areMarkersVisible ? 'Hide Points' : 'Show Points';
});

fetch('http://localhost:3000/data/display_data')
  .then(res => res.json())
  .then(data => {
    const validData = data
      .map((coord, i) =>
        typeof coord.lat === 'number' && typeof coord.long === 'number'
          ? { latlng: [coord.lat, coord.long], corner: coord.corner || `Point ${i + 1}` }
          : null)
      .filter(Boolean);

    if (validData.length === 0) {
      const info = L.control({ position: 'topright' });
      info.onAdd = () => {
        const el = L.DomUtil.create('div');
        el.innerHTML = '<strong>No data to display!</strong>';
        el.style.background = 'white';
        el.style.padding = '8px';
        el.style.borderRadius = '4px';
        return el;
      };
      info.addTo(map);
      console.error("No valid coordinates.");
      return;
    }

    markers = validData.map(pt => {
      const marker = L.marker(pt.latlng, {
        icon: createNumberIcon(pt.corner),
        riseOnHover: true
      }).bindPopup(
        `<b>${pt.corner}</b><br>Lat: ${pt.latlng[0].toFixed(4)}<br>Long: ${pt.latlng[1].toFixed(4)}`
      ).addTo(map);

      marker.on('mouseover', () => marker.setZIndexOffset(1000));
      marker.on('mouseout', () => marker.setZIndexOffset(0));
      return marker;
    });

    if (validData.length >= 2) {
      polyline = L.polyline(validData.map(pt => pt.latlng), {
        color: 'blue', weight: 4, opacity: 0.7
      }).addTo(map);
      map.fitBounds(validData.map(pt => pt.latlng));
    }
  })
  .catch(err => console.error("Fetch error:", err));

map.on('click', e => {
  L.popup()
    .setLatLng(e.latlng)
    .setContent(`Lat: ${e.latlng.lat.toFixed(4)}<br>Long: ${e.latlng.lng.toFixed(4)}`)
    .openOn(map);
});

function printMap() {
  window.print();
}