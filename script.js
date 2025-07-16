// Smart search and filter functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('plant-search');
    const priceFilter = document.getElementById('price-filter');
    const categoryFilter = document.getElementById('category-filter');
    const plantCards = document.querySelectorAll('.plant-card');

    function filterPlants() {
        const searchTerm = searchInput.value.toLowerCase();
        const priceRange = priceFilter.value;
        const category = categoryFilter.value;

        plantCards.forEach(card => {
            const plantName = card.querySelector('h3').textContent.toLowerCase();
            const plantPrice = parseInt(card.dataset.price);
            const plantCategory = card.dataset.category;

            let showCard = true;

            // Search filter
            if (searchTerm && !plantName.includes(searchTerm)) {
                showCard = false;
            }

            // Price filter
            if (priceRange) {
                if (priceRange === 'low' && plantPrice >= 300) showCard = false;
                if (priceRange === 'medium' && (plantPrice < 300 || plantPrice > 500)) showCard = false;
                if (priceRange === 'high' && plantPrice <= 500) showCard = false;
            }

            // Category filter
            if (category && plantCategory !== category) {
                showCard = false;
            }

            card.style.display = showCard ? 'block' : 'none';
        });
    }

    // Event listeners
    searchInput.addEventListener('input', filterPlants);
    priceFilter.addEventListener('change', filterPlants);
    categoryFilter.addEventListener('change', filterPlants);
});