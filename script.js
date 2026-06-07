document.addEventListener("DOMContentLoaded", () => {
    fetch('cars.json')
        .then(response => response.json())
        .then(data => {
            renderGallery(data);
        })
        .catch(error => console.error('Error loading car data:', error));
});

// small helper to escape text for use in HTML attributes
function escapeAttr(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function renderGallery(cars) {
    const container = document.getElementById('gallery-container');
    
    // group cars by brand
    const groupedByBrand = cars.reduce((acc, car) => {
        if (!acc[car.brand]) acc[car.brand] = [];
        acc[car.brand].push(car);
        return acc;
    }, {});

    // iterate through brands and build sections
    for (const [brand, brandCars] of Object.entries(groupedByBrand)) {
        
        // sort cars by year descending
        brandCars.sort((a, b) => b.year - a.year);

        // create manufacturer section
        const section = document.createElement('section');
        section.className = 'manufacturer-section';
        
        const title = document.createElement('h2');
        title.className = 'manufacturer-title';
        title.textContent = brand;
        section.appendChild(title);

        const carRow = document.createElement('div');
        carRow.className = 'car-row';

        // build individual car cards
        brandCars.forEach((car, index) => {
            const cardId = `${brand.replace(/\s+/g, '-')}-${index}`;
            const card = document.createElement('div');
            card.className = 'car-card';
            // build small appearance icons
            let appearanceHtml = '';
            if (car.appearance && car.appearance.length) {
                appearanceHtml = '<div class="appearance-row">' +
                    car.appearance.map(icon => `<img src="${icon}" alt="" class="appearance-icon">`).join('') +
                    '</div>';
            }

            // build header with optional tooltip
            let headerHtml = '';
            if (car.alternative) {
                headerHtml = `<div class="car-header has-tooltip" title="${escapeAttr(car.alternative)}">${car.year} ${car.brand} ${car.model}</div>`;
            } else {
                headerHtml = `<div class="car-header">${car.year} ${car.brand} ${car.model}</div>`;
            }

            card.innerHTML = `
                ${headerHtml}
                
                <div class="image-container" id="img-container-${cardId}">
                    <img src="${car.images[0]}" alt="${car.model}" id="img-${cardId}" data-current="0" data-images='${JSON.stringify(car.images)}' onclick="openImageViewer('${cardId}')" style="cursor:pointer;">
                    <button class="carousel-btn prev-btn" onclick="changeImage('${cardId}', -1)">&#10094;</button>
                    <button class="carousel-btn next-btn" onclick="changeImage('${cardId}', 1)">&#10095;</button>
                </div>

                <div class="data-section">
                    <div class="section-title">Production Info</div>
                    <div class="prod-info-row">
                        <img src="${car.logo}" alt="${car.brand} Logo" class="brand-logo">
                        <div class="prod-details">
                            <div>${car.brand}</div>
                            <div>${car.year} ${car.type}</div>
                                <div>${car.country}</div>
                                ${appearanceHtml}
                        </div>
                    </div>
                </div>

                <div class="data-section">
                    <div class="section-title">Engine and Power</div>
                    <div class="data-row"><span class="data-label">Engine</span><span class="data-value">${car.engine}</span></div>
                    <div class="data-row"><span class="data-label">Power</span><span class="data-value">${car.power}</span></div>
                    <div class="data-row"><span class="data-label">Torque</span><span class="data-value">${car.torque}</span></div>
                </div>

                <div class="data-section">
                    <div class="section-title">Drivetrain and Weight</div>
                    <div class="data-row"><span class="data-label">Layout</span><span class="data-value">${car.layout}</span></div>
                    <div class="data-row"><span class="data-label">Drivetrain</span><span class="data-value">${car.drivetrain}</span></div>
                    <div class="data-row"><span class="data-label">Gearbox</span><span class="data-value">${car.gearbox}</span></div>
                    <div class="data-row"><span class="data-label">Weight</span><span class="data-value">${car.weight}</span></div>
                    <div class="data-row"><span class="data-label">Balance</span><span class="data-value">${car.balance}</span></div>
                </div>

                <div class="data-section">
                    <div class="section-title">Performance</div>
                    <div class="data-row"><span class="data-label">Top Speed</span><span class="data-value">${car.topSpeed}</span></div>
                    <div class="data-row"><span class="data-label">Power-to-Weight Ratio</span><span class="data-value">${car.pwr}</span></div>
                    <div class="data-row"><span class="data-label">Performance Index</span><span class="data-value">${car.pi}</span></div>
                </div>
            `;
            carRow.appendChild(card);
        });

        section.appendChild(carRow);
        container.appendChild(section);
    }
}

// function to handle image cycling on button click
window.changeImage = function(cardId, direction) {
    const imgElement = document.getElementById(`img-${cardId}`);
    const images = JSON.parse(imgElement.getAttribute('data-images'));
    let currentIndex = parseInt(imgElement.getAttribute('data-current'));

    currentIndex += direction;

    // loop around if out of bounds
    if (currentIndex >= images.length) {
        currentIndex = 0;
    } else if (currentIndex < 0) {
        currentIndex = images.length - 1;
    }

    imgElement.src = images[currentIndex];
    imgElement.setAttribute('data-current', currentIndex);
};

// in-site image viewer
(function(){
    let viewerState = null; // { images: [], index: 0 }

    function createViewerElements(){
        if (document.getElementById('viewer-overlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'viewer-overlay';
        overlay.innerHTML = `
            <div id="viewer-box">
                <button id="viewer-close" aria-label="Close">&times;</button>
                <button id="viewer-prev" class="viewer-nav" aria-label="Previous">&#10094;</button>
                <div id="viewer-media-wrap"><img id="viewer-img" src="" alt=""></div>
                <button id="viewer-next" class="viewer-nav" aria-label="Next">&#10095;</button>
                <div id="viewer-caption"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeViewer(); });
        document.getElementById('viewer-close').addEventListener('click', closeViewer);
        document.getElementById('viewer-prev').addEventListener('click', () => changeViewerImage(-1));
        document.getElementById('viewer-next').addEventListener('click', () => changeViewerImage(1));
    }

    function openViewer(images, startIndex = 0){
        createViewerElements();
        viewerState = { images: images.slice(), index: startIndex };
        showViewerImage(startIndex);
        const overlay = document.getElementById('viewer-overlay');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function showViewerImage(idx){
        if (!viewerState) return;
        const images = viewerState.images;
        const len = images.length;
        idx = ((idx % len) + len) % len;
        viewerState.index = idx;
        const img = document.getElementById('viewer-img');
        const cap = document.getElementById('viewer-caption');
        img.src = images[idx];
        // derive a filename to display
        try {
            const u = new URL(images[idx], location.href);
            cap.textContent = u.pathname.split('/').pop();
        } catch (e) {
            cap.textContent = images[idx];
        }
    }

    function changeViewerImage(direction){
        if (!viewerState) return;
        showViewerImage(viewerState.index + (direction || 0));
    }

    function closeViewer(){
        const overlay = document.getElementById('viewer-overlay');
        if (overlay) overlay.classList.remove('open');
        viewerState = null;
        document.body.style.overflow = '';
    }

    // exposed helper to open viewer from a card id
    window.openImageViewer = function(cardId){
        const imgEl = document.getElementById(`img-${cardId}`);
        if (!imgEl) return;
        const images = JSON.parse(imgEl.getAttribute('data-images') || '[]');
        const current = parseInt(imgEl.getAttribute('data-current')) || 0;
        if (!images.length) return;
        openViewer(images, current);
    };

    // keyboard navigation
    document.addEventListener('keydown', (e) => {
        const overlay = document.getElementById('viewer-overlay');
        if (!overlay || !overlay.classList.contains('open')) return;
        if (e.key === 'Escape') closeViewer();
        if (e.key === 'ArrowLeft') changeViewerImage(-1);
        if (e.key === 'ArrowRight') changeViewerImage(1);
    });
})();
