
document.addEventListener('DOMContentLoaded', () => {
  const checkInEl = document.getElementById('checkIn');
  const checkOutEl = document.getElementById('checkOut');
  const roomTypeEl = document.getElementById('roomType');
  const banner = document.getElementById('availability-banner');
  const loadingIndicator = document.getElementById('loading-indicator');
  const form = document.getElementById('booking-form');
  const errorMessage = document.querySelector('.error-message');
  const sentMessage = document.querySelector('.sent-message');
  const loadingMessage = document.querySelector('.loading');
  const apiUrl = 'https://grandhotel-proxy-hnllqgo16-timothy-mwaros-projects.vercel.app/api/availability';
  const bookingUrl = 'https://grandhotel-proxy-hnllqgo16-timothy-mwaros-projects.vercel.app/api/book';

  const checkInPicker = flatpickr(checkInEl, {
    dateFormat: 'Y-m-d',
    minDate: 'today',
    disable: [],
    onChange(selectedDates) {
      if (selectedDates.length > 0) {
        checkOutPicker.set('minDate', selectedDates[0]);
        if (checkOutEl.value) {
          checkAvailability(new Date(checkInEl.value), new Date(checkOutEl.value));
        }
      }
    },
    onOpen: updateDisabledDates
  });

  const checkOutPicker = flatpickr(checkOutEl, {
    dateFormat: 'Y-m-d',
    minDate: 'today',
    disable: [],
    onChange(selectedDates) {
      if (selectedDates.length > 0 && checkInEl.value) {
        checkAvailability(new Date(checkInEl.value), new Date(checkOutEl.value));
      }
    },
    onOpen: updateDisabledDates
  });

  showBanner('Select a room type to see availability.', 'info');

  roomTypeEl.addEventListener('change', () => {
    if (roomTypeEl.value) {
      updateDisabledDates();
      updateBanner();
    } else {
      checkInPicker.set('disable', []);
      checkOutPicker.set('disable', []);
      showBanner('Select a room type to see availability.', 'info');
    }
  });

  async function updateDisabledDates() {
    if (!roomTypeEl.value) return;

    setLoadingState(true);
    try {
      const response = await fetch(`${apiUrl}?roomType=${encodeURIComponent(roomTypeEl.value)}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const roomData = data.find(room => room.roomType === roomTypeEl.value);

      if (!roomData) {
        showBanner(`No data found for ${roomTypeEl.value}.`, 'danger');
        checkInPicker.set('disable', []);
        checkOutPicker.set('disable', []);
        return;
      }

      const disableRanges = [];
      const today = new Date();
      const endDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

      for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
        let effectiveAvailable = roomData.availableForWeb;
        roomData.overrideRanges.forEach(range => {
          const rangeStart = new Date(range.start);
          const rangeEnd = new Date(range.end);
          if (d >= rangeStart && d <= rangeEnd) {
            effectiveAvailable += 1;
          }
        });

        let bookedInRange = 0;
        roomData.checkInDates.forEach((start, i) => {
          if (!start || !roomData.checkOutDates[i] || start === '' || roomData.checkOutDates[i] === '') return;
          const bookedStart = new Date(start);
          const bookedEnd = new Date(roomData.checkOutDates[i]);
          if (d >= bookedStart && d <= bookedEnd) {
            bookedInRange += 1;
          }
        });

        if (effectiveAvailable - bookedInRange <= 0) {
          disableRanges.push({ from: d.toISOString().split('T')[0], to: d.toISOString().split('T')[0] });
        }
      }

      checkInPicker.set('disable', disableRanges);
      checkOutPicker.set('disable', disableRanges);
      showBanner(
        roomData.remaining > 0
          ? `${roomData.remaining} ${roomData.roomType} available.`
          : `No ${roomData.roomType} available.`,
        roomData.remaining > 0 ? 'success' : 'danger'
      );
    } catch (error) {
      console.error('Error in updateDisabledDates:', error);
      showBanner('Failed to load availability. Please try again.', 'danger');
      checkInPicker.set('disable', []);
      checkOutPicker.set('disable', []);
    } finally {
      setLoadingState(false);
    }
  }

  async function checkAvailability(checkIn, checkOut) {
    if (!roomTypeEl.value) {
      showBanner('Please select a room type.', 'warning');
      return;
    }

    setLoadingState(true);
    try {
      const response = await fetch(`${apiUrl}?roomType=${encodeURIComponent(roomTypeEl.value)}&checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const roomData = data.find(room => room.roomType === roomTypeEl.value);

      if (!roomData) {
        showBanner(`No data found for ${roomTypeEl.value}.`, 'danger');
        return;
      }

      showBanner(
        roomData.remainingInRange > 0
          ? `${roomData.remainingInRange} ${roomData.roomType} available for selected dates.`
          : `No ${roomData.roomType} available for selected dates.`,
        roomData.remainingInRange > 0 ? 'success' : 'danger'
      );
    } catch (error) {
      console.error('Error in checkAvailability:', error);
      showBanner('Failed to check availability. Please try again.', 'danger');
    } finally {
      setLoadingState(false);
    }
  }

  async function updateBanner() {
    if (!roomTypeEl.value) return;

    setLoadingState(true);
    try {
      const response = await fetch(`${apiUrl}?roomType=${encodeURIComponent(roomTypeEl.value)}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const roomData = data.find(room => room.roomType === roomTypeEl.value);

      if (!roomData) {
        showBanner(`No data found for ${roomTypeEl.value}.`, 'danger');
        return;
      }

      const fullyBookedMonths = [];
      const today = new Date();
      const endDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

      for (let m = new Date(today); m <= endDate; m.setMonth(m.getMonth() + 1)) {
        const monthStart = new Date(m.getFullYear(), m.getMonth(), 1);
        const monthEnd = new Date(m.getFullYear(), m.getMonth() + 1, 0);
        let isFullyBooked = true;

        for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
          let effectiveAvailable = roomData.availableForWeb;
          roomData.overrideRanges.forEach(range => {
            const rangeStart = new Date(range.start);
            const rangeEnd = new Date(range.end);
            if (d >= rangeStart && d <= rangeEnd) {
              effectiveAvailable += 1;
            }
          });

          let bookedInRange = 0;
          roomData.checkInDates.forEach((start, i) => {
            if (!start || !roomData.checkOutDates[i] || start === '' || roomData.checkOutDates[i] === '') return;
            const bookedStart = new Date(start);
            const bookedEnd = new Date(roomData.checkOutDates[i]);
            if (d >= bookedStart && d <= bookedEnd) {
              bookedInRange += 1;
            }
          });

          if (effectiveAvailable - bookedInRange > 0) {
            isFullyBooked = false;
            break;
          }
        }

        if (isFullyBooked) {
          const monthName = m.toLocaleString('default', { month: 'long', year: 'numeric' });
          fullyBookedMonths.push(monthName);
        }
      }

      showBanner(
        fullyBookedMonths.length > 0
          ? `${roomData.roomType} booked for ${fullyBookedMonths.join(', ')}.`
          : `${roomData.remaining} ${roomData.roomType} available.`,
        fullyBookedMonths.length > 0 ? 'danger' : 'success'
      );
    } catch (error) {
      console.error('Error in updateBanner:', error);
      showBanner('Failed to load availability. Please try again.', 'danger');
    } finally {
      setLoadingState(false);
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';
    sentMessage.style.display = 'none';
    loadingMessage.style.display = 'block';

    const formData = {
      room_type: roomTypeEl.value,
      check_in: checkInEl.value,
      check_out: checkOutEl.value,
      adults: document.getElementById('adults').value,
      children: document.getElementById('children').value,
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      country_code: document.getElementById('countryCode').value,
      phone: document.getElementById('phone').value
    };

    setLoadingState(true);
    try {
      const response = await fetch(`${apiUrl}?roomType=${encodeURIComponent(roomTypeEl.value)}&checkIn=${new Date(checkInEl.value).toISOString()}&checkOut=${new Date(checkOutEl.value).toISOString()}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const roomData = data.find(room => room.roomType === roomTypeEl.value);

      if (!roomData || roomData.remainingInRange <= 0) {
        errorMessage.innerText = `No ${roomTypeEl.value} available for selected dates.`;
        errorMessage.style.display = 'block';
        loadingMessage.style.display = 'none';
        setLoadingState(false);
        return;
      }

      const bookingResponse = await fetch(bookingUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!bookingResponse.ok) throw new Error(`Booking failed! Status: ${bookingResponse.status}`);
      const result = await bookingResponse.json();

      if (result.status === 'success') {
        sentMessage.style.display = 'block';
        form.reset();
        checkInPicker.clear();
        checkOutPicker.clear();
        // Clear Vercel KV cache
        await fetch(`${apiUrl}?roomType=${encodeURIComponent(roomTypeEl.value)}`, { cache: 'no-store' });
        updateDisabledDates();
        updateBanner();
      } else {
        errorMessage.innerText = result.message || 'Booking failed. Please try again.';
        errorMessage.style.display = 'block';
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      errorMessage.innerText = 'Failed to submit booking. Please try again.';
      errorMessage.style.display = 'block';
    } finally {
      loadingMessage.style.display = 'none';
      setLoadingState(false);
    }
  });

  function showBanner(message, type = 'info') {
    banner.innerText = message;
    banner.className = `alert alert-${type} text-center mt-3`;
    banner.classList.remove('d-none');
    setTimeout(() => {
      banner.classList.add('d-none');
    }, 10000);
  }

  function setLoadingState(isLoading) {
    roomTypeEl.disabled = isLoading;
    checkInEl.disabled = isLoading;
    checkOutEl.disabled = isLoading;
    document.querySelector('.btn-submit').disabled = isLoading;
    loadingIndicator.classList.toggle('d-none', !isLoading);
  }
});
