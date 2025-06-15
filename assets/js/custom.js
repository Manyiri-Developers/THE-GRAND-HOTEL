/*
Template Name: Grand Hotel
Author: Manyiri Developers
Inspired by: BootstrapMade and Dribbble
Photos by: Pexels
License: manyiridevs.xyz
One growing team. Many Digital talents.
*/


document.addEventListener('DOMContentLoaded', () => {
  const roomsSwiper = new Swiper('.mySwiper', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    coverflowEffect: {
      rotate: 30, // Reduced for subtler effect
      stretch: 0,
      depth: 150, // Increased depth for better 3D effect
      modifier: 1,
      slideShadows: true,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
     navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
     autoplay: {
    delay: 4000, // Time between slides (in milliseconds)
    disableOnInteraction: false,
     },
    loop: true, // Enables continuous scrolling
    breakpoints: {
      // Mobile adjustments
         300: {
        slidesPerView: 1, // Single slide on small screens
        coverflowEffect: {
          rotate: 0, // Disable rotation for mobile
          depth: 0, // Flatten for simplicity
        },
      },
      200: {
        slidesPerView: 1, // Single slide on small screens
        coverflowEffect: {
          rotate: 0, // Disable rotation for mobile
          depth: 0, // Flatten for simplicity
        },
      },
       565: {
        slidesPerView: 2, // Single slide on small screens
        coverflowEffect: {
          rotate: 0, // Disable rotation for mobile
          depth: 0, // Flatten for simplicity
        },
      },

      767: {
        slidesPerView: 'auto',
        coverflowEffect: {
          rotate: 20,
          depth: 100,
        },
      },
    },
  });
  const facilitiesSwiper = new Swiper('.facilitiesSwiper', {
    effect: 'cards',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    autoplay: {
    delay: 4000, // Time between slides (in milliseconds)
    disableOnInteraction: false,
     },
    loop: true,
    breakpoints: {
      480: {
        slidesPerView: 1,
      },
      767: {
        slidesPerView: 2,
      },
      991: {
        slidesPerView: 'auto',
      },
    },
  });
  const diningSwiper = new Swiper('.diningSwiper', {
    slidesPerView: 3,
    spaceBetween: 30,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    loop: true,
      autoplay: {
    delay: 4000, // Time between slides (in milliseconds)
    disableOnInteraction: false,
     },
    breakpoints: {
      767: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      200: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
    },
  });
});


