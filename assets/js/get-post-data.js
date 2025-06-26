document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('booking-form');
  const loading = document.querySelector('.loading');
  const errorMessage = document.querySelector('.error-message');
  const sentMessage = document.querySelector('.sent-message');

  // Notification helper function
  function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.remove('hidden', 'success', 'error');
    notification.classList.add(type, 'visible');
    setTimeout(() => {
      notification.classList.remove('visible');
      notification.classList.add('hidden');
    }, 10000);
  }

  //Select 2 Country coodes
  $(document).ready(function() {
    $('#countryCode').select2({
      placeholder: "Search for your country",
      allowClear: true
    });
  });


  form.addEventListener('submit', (event) => {
    event.preventDefault();
    loading.style.display = 'none';
    errorMessage.style.display = 'none';
    sentMessage.style.display = 'none';

    const roomType = document.getElementById('roomType').value.trim();
    const checkIn = document.getElementById('checkIn').value.trim();
    const checkOut = document.getElementById('checkOut').value.trim();
    const adults = document.getElementById('adults').value.trim();
    const children = document.getElementById('children').value.trim();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const countryCode = document.getElementById('countryCode').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const fullPhone = countryCode && phone ? `${countryCode}${phone}` : '';

    console.log('Country code:', countryCode);
    console.log('Phone:', phone);
    console.log('Full phone:', fullPhone);

    const phoneRegex = /^[0-9]{9,10}$/;
    if (!phoneRegex.test(phone)) {
      errorMessage.textContent = 'Please enter a valid phone number (9-10 digits).';
      errorMessage.style.display = 'block';
      showNotification('Invalid phone number!', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errorMessage.textContent = 'Please enter a valid email address!';
      errorMessage.style.display = 'block';
      showNotification('Invalid email address!', 'error');
      return;
    }

    if (!roomType || !checkIn || !checkOut || !adults || !name || !email || !countryCode || !phone) {
      errorMessage.textContent = 'Please fill all required fields!';
      errorMessage.style.display = 'block';
      showNotification('Missing required fields!', 'error');
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      errorMessage.textContent = 'Check-out date must be after check-in!';
      errorMessage.style.display = 'block';
      showNotification('Invalid date range!', 'error');
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for comparison
    if (new Date(checkIn) < today) {
      errorMessage.textContent = 'Check-in date cannot be in the past!';
      errorMessage.style.display = 'block';
      showNotification('Invalid check-in date!', 'error');
      return;
    }

    const data = {
      roomType,
      checkIn,
      checkOut,
      adults,
      children: children || '0',
      name,
      email,
      phoneNumber: fullPhone, // e.g., +254749382656
      countryCode: countryCode.replace('+', '') // e.g., 254
    };

    loading.style.display = 'block';

    // Send data to Google Apps Script
    // Use http://localhost:3001/api/book for local testing


    fetch('https://grandhotel-proxy.vercel.app/api/book ', { // Update to Vercel URL for production
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
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
          sentMessage.textContent = result.message;
          sentMessage.style.display = 'block';
          form.reset();
          showNotification(
            'Thanks for booking with The Grand Hotel! We’ll send a confirmation email soon.',
            'success'
          );
        } else {
          throw new Error(result.message || 'Unknown error');
        }
      })
      .catch(error => {
        loading.style.display = 'none';
        errorMessage.textContent = `Error: ${error.message}`;
        errorMessage.style.display = 'block';
        showNotification(`Booking failed: ${error.message}`, 'error');
        console.error('Fetch error:', error);
      });
  });
});