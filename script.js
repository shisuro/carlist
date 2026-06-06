document.addEventListener("DOMContentLoaded", () => {
    // In a real GitHub pages setup, this fetches the cars.json file next to index.html
    fetch('cars.json')
        .then(response => response.json())
        .then(data => {
            renderGallery(data);
        })
        .catch(error => console.error('Error loading car data:', error));
});

function renderGallery(cars) {
    const container = document.getElementById('gallery-container');
    
    // 1. Group cars by brand
    const groupedByBrand = cars.reduce((acc, car) => {
        if (!acc[car.brand]) acc[car.brand] = [];
        acc[car.brand].push(car);
        return acc;
    }, {});

    // 2. Iterate through brands and build sections
    for (const [brand, brandCars] of Object.entries(groupedByBrand)) {
        
        // Sort cars by year ascending
        brandCars.sort((a, b) => a.year - b.year);

        // Create manufacturer section
        const section = document.createElement('section');
        section.className = 'manufacturer-section';
        
        const title = document.createElement('h2');
        title.className = 'manufacturer-title';
        title.textContent = brand;
        section.appendChild(title);

        const carRow = document.createElement('div');
        carRow.className = 'car-row';

        // 3. Build individual car cards
        brandCars.forEach((car, index) => {
            const cardId = `${brand.replace(/\s+/g, '-')}-${index}`;
            const card = document.createElement('div');
            card.className = 'car-card';

            card.innerHTML = `
                <div class="car-header">${car.year} ${car.brand} ${car.model}</div>
                
                <div class="image-container" id="img-container-${cardId}">
                    <img src="${car.images[0]}" alt="${car.model}" id="img-${cardId}" data-current="0" data-images='${JSON.stringify(car.images)}'>
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
                    <div class="data-row"><span class="data-label">PWR</span><span class="data-value">${car.pwr}</span></div>
                    <div class="data-row"><span class="data-label">PI Rating</span><span class="data-value">${car.piRating}</span></div>
                </div>
            `;
            carRow.appendChild(card);
        });

        section.appendChild(carRow);
        container.appendChild(section);
    }
}

// Function to handle image cycling on button click
window.changeImage = function(cardId, direction) {
    const imgElement = document.getElementById(`img-${cardId}`);
    const images = JSON.parse(imgElement.getAttribute('data-images'));
    let currentIndex = parseInt(imgElement.getAttribute('data-current'));

    currentIndex += direction;

    // Loop around if out of bounds
    if (currentIndex >= images.length) {
        currentIndex = 0;
    } else if (currentIndex < 0) {
        currentIndex = images.length - 1;
    }

    imgElement.src = images[currentIndex];
    imgElement.setAttribute('data-current', currentIndex);
};