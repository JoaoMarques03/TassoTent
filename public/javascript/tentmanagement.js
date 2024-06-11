window.addEventListener('load', () => {
  populateTentTable();
  const updateAllPasswordsBtn = document.getElementById('updateAllPasswordsBtn');
  updateAllPasswordsBtn.addEventListener('click', updateAllPasswords);
});

async function populateTentTable() {
  try {
    const response = await fetch('/allTents');
    if (response.ok) {
      const data = await response.json();
      const tentTableBody = document.querySelector('#tentTable tbody');
      tentTableBody.innerHTML = '';
      
      const tentIds = Object.keys(data.tents);
      tentIds.sort((a, b) => {
        const idA = parseInt(a.match(/\d+/)[0]);
        const idB = parseInt(b.match(/\d+/)[0]);
        return idA - idB;
      });
      
      tentIds.forEach(tentId => {
        const tent = data.tents[tentId];
        const row = `
          <tr>
            <td>${tent.username}</td>
            <td id="password-${tentId}">${tent.password}</td>
            <td><button class="generate-password-btn" data-key="${tentId}">Generate Password</button></td>
          </tr>
        `;
        tentTableBody.innerHTML += row;
      });
      
      addGeneratePasswordEventListeners();
    } else {
      console.error('Failed to fetch tent data:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching tent data:', error);
  }
}

async function updateTentPassword(tentId) {
  try {
    const response = await fetch('/updateTentPassword', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tentId })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Tent password updated successfully:', tentId);
      return data.newPassword;
    } else {
      console.error('Failed to update tent password:', response.statusText);
    }
  } catch (error) {
    console.error('Error updating tent password:', error);
  }
}

async function addGeneratePasswordEventListeners() {
  const generatePasswordButtons = document.querySelectorAll('.generate-password-btn');
  generatePasswordButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();

      const tentId = button.dataset.key;
      const passwordCell = document.getElementById(`password-${tentId}`);

      const newPassword = await updateTentPassword(tentId);

      passwordCell.textContent = newPassword;
    });
  });
}

async function updateAllPasswords() {
  try {
    const response = await fetch('/updateAllPasswords', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('All tent passwords updated successfully');
      populateTentTable();
    } else {
      console.error('Failed to update all tent passwords:', response.statusText);
    }
  } catch (error) {
    console.error('Error updating all tent passwords:', error);
  }
}

// Event listener for logout button
document.querySelector('.nav-btn:last-of-type').addEventListener('click', async () => {
  try {
      const response = await fetch('/logout', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
      });

      if (response.ok) {
          console.log('Logged out successfully');
          // Redirect to home page or login page
          window.location.href = 'start.html'; // Redirect to start.html after logout
      } else {
          console.error('Failed to log out:', response.statusText);
      }
  } catch (error) {
      console.error('Error logging out:', error);
  }
});