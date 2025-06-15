document.addEventListener('DOMContentLoaded', ()=>{

  /* Preloader
//    */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    
      preloader.remove();
    };
  

    function lazyLoadImages() {
        const images = document.querySelectorAll('.slow-load'); 
    
        const observer = new IntersectionObserver((entries, observer) => {
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const realSrc = img.getAttribute('data-src'); // Get the actual image source
                    img.setAttribute('src', realSrc); // Set the actual image source
                    // img.onload = () => {
                    //     img.classList.add('loaded'); // Optional: Fade-in effect after image is loaded
                    // };
                    observer.unobserve(img); // Stop observing once the image is loaded
                }
            }
        }, { threshold: 0.1 }); // Trigger when 10% of the image is visible
    
        for (let i = 0; i < images.length; i++) {
            observer.observe(images[i]); // Start observing each image
        }
    }
    
    // Initialize lazy loading
    lazyLoadImages();

});


