export function renderFeaturedSlider(container, items, apiClient) {
    if (!container || !items || items.length === 0) return;

    // Clear the container
    container.innerHTML = '';

    // Main wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'featured-slider';

    const leftArrow = document.createElement('div');
    leftArrow.className = 'arrow left-arrow';
    leftArrow.innerHTML = `
    <button type="button" is="paper-icon-button-light" data-ripple="false" data-direction="left" title="Previous" class="emby-scrollbuttons-button paper-icon-button-light">
        <span class="material-icons chevron_left" aria-hidden="true"></span>
    </button>
`;
    leftArrow.style.zIndex = 10;

    const rightArrow = document.createElement('div');
    rightArrow.className = 'arrow right-arrow';
    rightArrow.innerHTML = `
    <button type="button" is="paper-icon-button-light" data-ripple="false" data-direction="right" title="Next" class="emby-scrollbuttons-button paper-icon-button-light">
        <span class="material-icons chevron_right" aria-hidden="true"></span>
    </button>
`;
    rightArrow.style.zIndex = 10;

    // We'll store slides in an array to switch visibility
    let slideIndex = 0;
    const slides = [];

    // Helpers: create a single slide
    function createSlide(item) {
        const slide = document.createElement('div');
        slide.className = 'slide';

        // Logo check: if item has a logo, show the logo; else fallback to text
        const hasLogo = item.ImageTags && item.ImageTags.Logo;
        const logoUrl = hasLogo ? apiClient.getImageUrl(item.Id, { type: 'Logo', quality: 100 }) : null;

        // Main backdrop image
        const img = document.createElement('img');
        img.src = apiClient.getImageUrl(item.Id, { type: 'Backdrop', quality: 100 }) || '';
        img.alt = item.Name || 'Featured Item';
        img.className = 'featured-backdrop';

        // Info container
        const info = document.createElement('div');
        info.className = 'featured-info';

        // Logo container
        const logoContainer = document.createElement('div');
        logoContainer.className = 'featured-logo-container';

        // Either display logo or text
        if (logoUrl) {
            const logoImg = document.createElement('img');
            const logoImgBlur = document.createElement('img');
            logoImg.src = logoUrl;
            logoImg.alt = item.Name || 'Title';
            logoImg.className = 'featured-logo';

            // Check brightness and append class
            // checkImageAndAppendClass(logoImg, logoUrl);

            logoImgBlur.src = logoUrl;
            logoImgBlur.alt = item.Name || 'Title';
            logoImgBlur.className = 'featured-logo-blur';

            logoContainer.appendChild(logoImg);
            logoContainer.appendChild(logoImgBlur);
        } else {
            const title = document.createElement('h3');
            title.textContent = item.Name || '';
            logoContainer.appendChild(title);
        }

        slide.appendChild(logoContainer);

        // All Information
        // const slideType = item.Type === 'Series' ? 'TV Show' : 'Movie';
        const imdbRating = typeof item.CommunityRating === 'number' ? `${item.CommunityRating.toFixed(1)} ⭐` : 'N/A ⭐';
        const tomatoRating = typeof item.CriticRating === 'number' ? `${item.CriticRating}%` : 'N/A';
        const maturity = item.OfficialRating || 'N/A';
        let plot = item.Overview || 'No overview available';
        plot = truncateText(plot, 360);

        const details = document.createElement('div');
        details.className = 'ratings';

        let tomatoLogo = '';
        if (item.CriticRating >= 60) {
            tomatoLogo = '<img class="tomato-positive-logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Rotten_Tomatoes_positive_audience.svg/1920px-Rotten_Tomatoes_positive_audience.svg.png" style="width: 15px; height: 17px;">';
        } else if (item.CriticRating < 60) {
            tomatoLogo = '<img class="tomato-critic-logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Rotten_Tomatoes_rotten.svg/1024px-Rotten_Tomatoes_rotten.svg.png" alt="Rotten Tomato" style="width: 15px; height: 15px;">';
        } else {
            tomatoLogo = '<img class="tomato-critic-logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Rotten_Tomatoes_rotten.svg/1024px-Rotten_Tomatoes_rotten.svg.png" alt="Rotten Tomato" style="width: 15px; height: 15px;">';
        }

        details.innerHTML = `
            <div class="imdb-rating">
                <img class="imdb-logo" src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg" alt="IMDb Logo" style="width: 30px; height: 30px;">    
                ${imdbRating}
            </div>
            <div class="tomato-rating">
                ${tomatoLogo}
                ${tomatoRating}
            </div>
            <div class="age-rating">${maturity}</div>
        `;
        info.appendChild(details);

        const plotContainer = document.createElement('div');
        plotContainer.className = 'plot';
        plotContainer.innerHTML = plot;
        info.appendChild(plotContainer);

        slide.appendChild(img);
        const gradientOverlay = document.createElement('div');
        gradientOverlay.className = 'gradient-overlay';
        slide.appendChild(gradientOverlay);
        slide.appendChild(info);

        return slide;
    }

    // // Helpers: check image brightness and append class
    // function checkImageAndAppendClass(imgElement, logoUrl) {
    //     // calculateImageBrightness(logoUrl, (brightness) => {
    //     //     // Threshold for classifying as dark or light
    //     //     console.log('Brightness:', brightness, 'Logo URL:', logoUrl);
    //     //     const brightnessThreshold = 40; // Midpoint on 0-255 scale
    //     //     if (brightness < brightnessThreshold) {
    //     //         imgElement.classList.add('dark-logo');
    //     //     } else {
    //     //         imgElement.classList.add('light-logo');
    //     //     }
    //     // });

    //     isItDark(logoUrl, function(darkornot) {
    //         if (darkornot) {
    //             imgElement.classList.add('dark-logo');
    //         } else {
    //             imgElement.classList.add('light-logo');
    //         }
    //     });
    // }

    // // Helpers: Is it dark?
    // function isItDark(imageSrc, callback) {
    //     const fuzzy = 0.1;
    //     const img = new Image();
    //     // const img = document.createElement('img');
    //     img.crossOrigin = 'Anonymous';
    //     img.src = imageSrc;
    //     img.style.display = 'none';
    //     document.body.appendChild(img);

    //     img.onload = function() {
    //         // create canvas
    //         const canvas = document.createElement('canvas');
    //         canvas.width = img.width;
    //         canvas.height = img.height;

    //         const ctx = canvas.getContext('2d');
    //         ctx.drawImage(this, 0, 0);

    //         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    //         const data = imageData.data;
    //         let r;
    //         let g;
    //         let b;
    //         let maxRGB;
    //         let light = 0;
    //         let dark = 0;

    //         for (let x = 0, len = data.length; x < len; x += 4) {
    //             r = data[x];
    //             g = data[x + 1];
    //             b = data[x + 2];

    //             maxRGB = Math.max(Math.max(r, g), b);
    //             if (maxRGB < 200) {
    //                 dark++;
    //             } else {
    //                 light++;
    //             }
    //         }

    //         const dlDiff = ((light - dark) / (img.width * img.height));
    //         if (dlDiff + fuzzy < 0) {
    //             callback(true);
    //         } else {
    //             callback(false);
    //         }
    //     };
    // }

    // // Helpers: calculate image brightness
    // function calculateImageBrightness(imageUrl, callback) {
    //     const img = new Image();
    //     img.crossOrigin = 'Anonymous'; // Handle cross-origin issues
    //     img.src = imageUrl;
    //     img.onload = function () {
    //         const canvas = document.createElement('canvas');
    //         const ctx = canvas.getContext('2d');
    //         canvas.width = img.width;
    //         canvas.height = img.height;

    //         // Draw image onto canvas
    //         ctx.drawImage(img, 0, 0);

    //         // Get pixel data
    //         const imageData = ctx.getImageData(0, 0, img.width, img.height);
    //         const data = imageData.data;

    //         let r;
    //         let g;
    //         let b;
    //         let avg;
    //         let colorSum = 0;

    //         // Sum up brightness values
    //         for (let i = 0; i < data.length; i += 4) {
    //             r = data[i];
    //             g = data[i + 1];
    //             b = data[i + 2];
    //             // Perceived brightness calculation
    //             avg = (r * 299 + g * 587 + b * 114) / 1000;
    //             colorSum += avg;
    //         }

    //         // Average brightness
    //         const brightness = colorSum / (img.width * img.height);

    //         callback(brightness);
    //     };
    // }

    // Helpers: truncate text
    function truncateText(text, maxLength) {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    }

    // Create slides, but initially hide them
    items.forEach((item, i) => {
        const slide = createSlide(item);
        slide.style.display = 'none';
        wrapper.appendChild(slide);
        slides.push(slide);

        // Preload up to 3 images beyond the current index
        if (i <= 3) {
            const preloadImg = new Image();
            preloadImg.src = apiClient.getImageUrl(item.Id, { type: 'Backdrop' }) || '';
        }
    });

    // Show a specific slide by index
    function showSlide(index) {
        slides.forEach((s, i) => {
            s.style.display = i === index ? 'block' : 'none';
        });
        // Preload up to 3 next images
        for (let preloadIndex = index + 1; preloadIndex <= index + 3; preloadIndex++) {
            if (preloadIndex < slides.length) {
                const item = items[preloadIndex];
                const preloadImg = new Image();
                preloadImg.src = apiClient.getImageUrl(item.Id, { type: 'Backdrop' }) || '';
            }
        }
    }

    // Arrow events
    leftArrow.addEventListener('click', () => {
        slideIndex = (slideIndex + slides.length - 1) % slides.length;
        showSlide(slideIndex);
    });

    rightArrow.addEventListener('click', () => {
        slideIndex = (slideIndex + 1) % slides.length;
        showSlide(slideIndex);
    });

    // Basic touch/swipe support
    let startX = 0;
    wrapper.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
    });
    wrapper.addEventListener('touchend', e => {
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                // Swipe left -> next slide
                slideIndex = (slideIndex + 1) % slides.length;
            } else {
                // Swipe right -> prev slide
                slideIndex = (slideIndex + slides.length - 1) % slides.length;
            }
            showSlide(slideIndex);
        }
    });

    // Append everything and show the first slide
    container.appendChild(wrapper);
    wrapper.appendChild(leftArrow);
    wrapper.appendChild(rightArrow);
    if (slides.length > 0) showSlide(slideIndex);
}
