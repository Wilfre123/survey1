const insertedDataKeys = new Set();

function createDataKey(data) {
  return `${data.corner || ''}|${data.long}|${data.lat}`;
}

function appendToTable(data) {
  const tbody = document.getElementById('coordinatesTable');
  if (tbody.querySelector('td[colspan]')) {
    tbody.innerHTML = '';
  }

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${data.corner || ''}</td>
    <td>${data.long}</td>
    <td>${data.lat}</td>
    <td>
      
     <a href="/delete/${data.id}" class="btn btn-danger btn-sm delete-link">
  <i class="bi bi-trash"></i> Delete
</a>
    </td>
  `;
  tbody.appendChild(tr);

  tr.querySelector('.delete-btn').addEventListener('click', async () => {
    const id = tr.querySelector('.delete-btn').getAttribute('data-id');
    try {
      const resp = await fetch(`http://localhost:3000/data/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        tr.remove();
        insertedDataKeys.delete(createDataKey(data));
        if (!tbody.children.length) {
          tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No data</td></tr>';
        }
      } else {
        alert('Failed to delete item.');
      }
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  });
}

async function fetchData() {
  try {
    const resp = await fetch('http://localhost:3000/data/display_data');
    if (resp.ok) {
      const data = await resp.json();
      data.forEach(item => {
        const key = createDataKey(item);
        insertedDataKeys.add(key);
        appendToTable(item);
      });
    }
  } catch (err) {
    alert('Error fetching data: ' + err.message);
  }
}

document.getElementById('coordinatesForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = {
    long: parseFloat(formData.get('long')),
    lat: parseFloat(formData.get('lat')),
    corner: formData.get('corner') || ''
  };

  const key = createDataKey(data);
  if (insertedDataKeys.has(key)) {
    alert('Data already inserted.');
    return;
  }

  try {
    const resp = await fetch('http://localhost:3000/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (resp.ok) {
      const result = await resp.json();
      const successModal = document.getElementById('successModal');
      const modalInstance = bootstrap.Modal.getOrCreateInstance(successModal);
      modalInstance.show();

      insertedDataKeys.add(key);
      appendToTable(result);
      this.reset();
    } else if (resp.status === 409) {
      alert('Data already inserted.');
    } else {
      alert('Submission failed.');
    }
  } catch (err) {
    alert('Server error: ' + err.message);
  }
});

window.addEventListener('load', fetchData);


// shift div1 and div 2 

function toggleDivs() {
  const div1 = document.getElementById("div1");
  const div2 = document.getElementById("div2");

  const div1Display = window.getComputedStyle(div1).display;

  if (div1Display === "block") {
    div1.style.display = "none";
    div2.style.display = "block";
  } else {
    div1.style.display = "block";
    div2.style.display = "none";
  }
}


// script insert table in index.html

 const table = document.getElementById('editableTable');
  const tbody = table.querySelector('tbody');
  let selectedCell = null;

  tbody.addEventListener('focusin', e => {
    if (e.target.tagName === 'TD' && e.target.isContentEditable) {
      selectedCell = e.target;
    }
  });

  tbody.addEventListener('paste', (event) => {
    if (!selectedCell) return;

    event.preventDefault();
    const pasteData = (event.clipboardData || window.clipboardData).getData('text');
    const rows = pasteData.trim().split(/\r\n|\n|\r/).map(row => row.split('\t'));

    const startRow = selectedCell.parentElement.rowIndex - 1;
    const startCol = selectedCell.cellIndex;

    while (tbody.rows.length < startRow + rows.length) {
      const newRow = tbody.insertRow();
      for (let i = 0; i < table.rows[0].cells.length; i++) {
        const newCell = newRow.insertCell();
        newCell.contentEditable = "true";
        newCell.setAttribute('aria-label', table.tHead.rows[0].cells[i].textContent);
      }
    }

    rows.forEach((rowData, rowIndex) => {
      const row = tbody.rows[startRow + rowIndex];
      while (row.cells.length < startCol + rowData.length) {
        const newCell = row.insertCell();
        newCell.contentEditable = "true";
        newCell.setAttribute('aria-label', 'Extra column');
      }

      rowData.forEach((cellData, colIndex) => {
        row.cells[startCol + colIndex].textContent = cellData;
      });
    });
  });

  document.getElementById('submitBtn').addEventListener('click', () => {
    const data = [];
    for (let r = 0; r < tbody.rows.length; r++) {
      const row = tbody.rows[r];
      const rowData = [];
      for (let c = 0; c < row.cells.length; c++) {
        rowData.push(row.cells[c].textContent.trim());
      }
      data.push(rowData);
    }

    fetch('http://localhost:3000/data/more_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
      alert('Data submitted successfully!');
      console.log(result);
    })
    .catch(error => {
      alert('Error submitting data');
      console.error(error);
    });
  });