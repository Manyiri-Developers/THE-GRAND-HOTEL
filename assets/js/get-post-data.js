document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('booking-form'); // Match form ID
  const loading = document.querySelector('.loading');
  const errorMessage = document.querySelector('.error-message');
  const sentMessage = document.querySelector('.sent-message');

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default submission

    // Clear previous feedback
    loading.style.display = 'none';
    errorMessage.style.display = 'none';
    sentMessage.style.display = 'none';

    // Collect form data
    const roomType = document.getElementById('roomType').value.trim();
    const checkIn = document.getElementById('checkIn').value.trim(); // Fixed ID
    const checkOut = document.getElementById('checkOut').value.trim(); // Fixed ID
    const adults = document.getElementById('adults').value.trim();
    const children = document.getElementById('children').value.trim();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim(); // Fixed ID

    // Validate form fields (children is optional)
    if (!roomType || !checkIn || !checkOut || !adults || !name || !email || !phone) {
      errorMessage.textContent = 'Please fill all required fields!';
      errorMessage.style.display = 'block';
      return;
    }

    // Prepare data object (match Apps Script expectations)
            const data = {
        roomType,
        checkIn,
        checkOut,
        adults,
      children: children || '0', // Default to '0' if empty
        children: children || '0', 
        name,
        email,
        phoneNumber: phone // No comma here
        };
    

    // Show loading state
    loading.style.display = 'block';

    // Send data to Google Apps Script
    fetch('https://script.google.com/macros/s/AKfycbzcQekTyfXAW1eLdG4qpBSariP0h5o_1O3WJkPmy_Y/exec', { // Use /exec for production
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(result => {
        loading.style.display = 'none';
        if (result.status === 'success') {
          sentMessage.textContent = result.message; // "Booking recorded successfully!"
          sentMessage.style.display = 'block';
          form.reset(); // Clear form
        } else {
          throw new Error(result.message || 'Unknown error');
        }
      })
      .catch(error => {
        loading.style.display = 'none';
        errorMessage.textContent = `Error: ${error.message}`;
        errorMessage.style.display = 'block';
        console.error('Fetch error:', error);
      });
  });
});