document.addEventListener('DOMContentLoaded', () => {
  const checkInOutEl = document.getElementById('checkInOut');
  const roomTypeEl = document.getElementById('roomType');
  const banner = document.getElementById('availability-banner');
  const loadingIndicator = document.getElementById('loading-indicator');
  const apiUrl = 'https://grandhotel-proxy-hnllqgo16-timothy-mwaros-projects.vercel.app/api/availability';

  // Initialize Flatpickr
  const flatpickrInstance = flatpickr(checkInOutEl, {
    mode: 'range',
    dateFormat: 'Y-m-d',
    minDate: 'today',
    disable: [],
    onChange(selectedDates) {
      if (selectedDates.length === 2) {
        checkAvailability(selectedDates[0], selectedDates[1]);
      }
    },
    onOpen: updateDisabledDates
  });

  // Default banner message on page load
  showBanner('Select a room type to see availability.', 'info');

  // Event listener for room type change
  roomTypeEl.addEventListener('change', () => {
    if (roomTypeEl.value) {
      updateDisabledDates();
      updateBanner();
    } else {
      flatpickrInstance.set('disable', []);
      showBanner('Select a room type to see availability.', 'info');
    }
  });

  async function updateDisabledDates() {
    if (!roomTypeEl.value) return;

    setLoadingState(true);
    try {
      const response = await fetch(`${apiUrl}?roomType=${roomTypeEl.value}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const roomData = data.find(room => room.roomType === roomTypeEl.value);

      if (!roomData) {
        showBanner(`No data found for ${roomTypeEl.value}.`, 'danger');
        flatpickrInstance.set('disable', []);
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
            effectiveAvailable += 1; // Override adds one room
          }
        });

        let bookedInRange = 0;
        roomData.checkInDates.forEach((start, i) => {
          const bookedStart = new Date(start);
          const bookedEnd = new Date(roomData.checkOutDates[i]);
          if (d >= bookedStart && d <= bookedEnd) {
            bookedInRange += 1;
          }
        });

        if (effectiveAvailable - bookedInRange === 0) {
          disableRanges.push({ from: d.toISOString().split('T')[0], to: d.toISOString().split('T')[0] });
        }
      }

      flatpickrInstance.set('disable', disableRanges);
      showBanner(
        roomData.remaining > 0
          ? `${roomData.remaining} ${roomData.roomType} available.`
          : `No ${roomData.roomType} available.`,
        roomData.remaining > 0 ? 'success' : 'danger'
      );
    } catch (error) {
      console.error('Error in updateDisabledDates:', error);
      showBanner('Failed to load availability. Please try again.', 'danger');
      flatpickrInstance.set('disable', []);
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
      const response = await fetch(`${apiUrl}?roomType=${roomTypeEl.value}&checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}`);
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
      const response = await fetch(`${apiUrl}?roomType=${roomTypeEl.value}`);
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
    checkInOutEl.disabled = isLoading;
    loadingIndicator.classList.toggle('d-none', !isLoading);
  }
});