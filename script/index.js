const sidebar = document.getElementById('sidebar');
const insertedDataKeys = new Set(); // To track inserted data uniquely

function toggleSidebar() {
  sidebar.classList.toggle('collapsed');
}

function createDataKey(data) {
  // Create a unique key based on the relevant data fields
  return `${data.corner}|${data.long}|${data.lat}`;
}

async function fetchData() {
  try {
    const response = await fetch('http://localhost:3000/data/display_data');
    if (response.ok) {
      const data = await response.json();
      data.forEach(item => {
        const key = createDataKey(item);
        insertedDataKeys.add(key); // Add existing data keys to the set
        appendToTable(item);
      });
    } else {
      alert('Failed to fetch data.');
    }
  } catch (error) {
    alert('Error fetching data: ' + error.message);
  }
}

document.getElementById('dataForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = {
    corner: formData.get('corner'),
    long: parseFloat(formData.get('long')),
    lat: parseFloat(formData.get('lat'))
  };

  const key = createDataKey(data);
  if (insertedDataKeys.has(key)) {
    alert('Data already inserted.');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const result = await response.json();
      data.id = result.id;

      const successModal = document.getElementById('successModal');
      const modalInstance = bootstrap.Modal.getOrCreateInstance(successModal);
      modalInstance.show();

      insertedDataKeys.add(key); // Add new data key after successful insert
      appendToTable(data);
      this.reset();
    } else if (response.status === 409) {
      // Optional: If backend returns 409 Conflict for duplicates
      alert('Data already inserted.');
    } else {
      alert('Submission failed.');
    }
  } catch (error) {
    alert('Server error: ' + error.message);
  }
});

function appendToTable(data) {
  const table = document.getElementById('coordinatesTable');

  // Remove "No data" row if present
  if (table.querySelector('td[colspan]')) {
    table.innerHTML = '';
  }

  const row = document.createElement('tr');
  row.innerHTML = `<td>${data.id}</td><td>${data.corner}</td><td>${data.long}</td><td>${data.lat}</td>`;
  table.appendChild(row);
}

window.addEventListener('load', fetchData);

// After modal closes, focus a safe element outside the modal
document.getElementById('successModal').addEventListener('hidden.bs.modal', () => {
  const safeFocus = document.getElementById('searchInput');
  if (safeFocus) safeFocus.focus();
});
