document.addEventListener('DOMContentLoaded', () => {

// const BASE_URL = 'https://grandhotel-proxy-hnllqgo16-timothy-mwaros-projects.vercel.app';
// //Website Intergration
// async function updateAvailabilityBanner() {
//   const response = await fetch(`${BASE_URL}/api/availability`);
//   const data = await response.json();
//   document.getElementById('availability-banner').innerText = data.map(room => `${room.remaining} ${room.roomType} Available`).join(' | ');
// }

// document.addEventListener('DOMContentLoaded', updateAvailabilityBanner);


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

  
  // Initialize intlTelInput on countryCode input
  const countryCodeInput = document.querySelector('#countryCode');
  if (!countryCodeInput) {
    console.error('Country code input not found');
    errorMessage.textContent = 'Country code field is missing. Please try again later.';
    errorMessage.style.display = 'block';
    return;
  }
  if (!window.intlTelInput) {
    console.error('intlTelInput not loaded');
    errorMessage.textContent = 'Phone number validation failed to load. Please try again later.';
    errorMessage.style.display = 'block';
    return;
  }
  const iti = window.intlTelInput(countryCodeInput, {
    initialCountry: 'auto',
    nationalMode: false, // Ensures full international format
    utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/25.3.1/js/utils.js', // Correct path
    separateDialCode: true // Shows dial code separately in dropdown
  });

  // Listen for country selection and update countryCode input
  iti.promise.then(() => {
    countryCodeInput.value = `+${iti.getSelectedCountryData().dialCode}`; // Set initial value
  });
  countryCodeInput.addEventListener('countrychange', () => {
    const selectedCountry = iti.getSelectedCountryData();
    countryCodeInput.value = `+${selectedCountry.dialCode}`; // Update on selection
    console.log('Country selected:', selectedCountry.dialCode);
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
    const phone = document.getElementById('phone').value.trim();//Same phone ID selected for testing
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


    // When submitting the form
    function getPhoneData() {
      const fullPhone = iti.getNumber(); // e.g., +254749382656
      const countryCode = iti.getSelectedCountryData().dialCode; // e.g., 254

      console.log("Full phone:", fullPhone);
      console.log("Country code:", countryCode);
       return { fullPhone, countryCode };
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

  console.log('Sending data to proxy:', data);
  
    fetch (`${BASE_URL}/api/book`, { // Update to Vercel URL for production
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
