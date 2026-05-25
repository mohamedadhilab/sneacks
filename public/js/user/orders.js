/**
 * SNEACKS - User Orders Page Interactions
 * Frontend search filtering and pagination helpers
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Search Order Cards Logic
    const searchInput = document.getElementById('orderSearchInput');
    const ordersList = document.getElementById('ordersList');
    
    if (searchInput && ordersList) {
        const orderCards = ordersList.getElementsByClassName('order-card');
        
        searchInput.addEventListener('input', (event) => {
            const query = event.target.value.toLowerCase().trim();
            let visibleCount = 0;
            
            Array.from(orderCards).forEach((card) => {
                const orderId = (card.getAttribute('data-order-id') || '').toLowerCase();
                const productName = (card.getAttribute('data-product-name') || '').toLowerCase();
                
                if (orderId.includes(query) || productName.includes(query)) {
                    card.style.display = 'flex';
                    // Subtle animate fade-in
                    card.style.opacity = '1';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                    card.style.opacity = '0';
                }
            });
            
            // Toggle Empty Search Result State
            let emptyState = document.getElementById('searchEmptyState');
            if (visibleCount === 0) {
                if (!emptyState) {
                    emptyState = document.createElement('div');
                    emptyState.id = 'searchEmptyState';
                    emptyState.className = 'orders-empty-state';
                    emptyState.style.marginTop = '2rem';
                    emptyState.innerHTML = `
                        <div class="empty-icon-box">
                            <i class="fas fa-search"></i>
                        </div>
                        <h2 class="empty-title">No matching orders</h2>
                        <p class="empty-subtitle">We couldn't find any orders matching "${event.target.value}". Try checking the spelling or search for another order.</p>
                    `;
                    ordersList.parentNode.insertBefore(emptyState, ordersList.nextSibling);
                }
                ordersList.style.display = 'none';
            } else {
                if (emptyState) {
                    emptyState.remove();
                }
                ordersList.style.display = 'flex';
            }
        });
    }

    // Pagination Interaction Simulator
    const paginationNumbers = document.querySelectorAll('.pagination-number');
    const prevPage = document.querySelector('.prev-page');
    const nextPage = document.querySelector('.next-page');

    if (paginationNumbers.length > 0) {
        paginationNumbers.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Toggle active class
                paginationNumbers.forEach(n => n.classList.remove('active'));
                btn.classList.add('active');

                // Toggle prev/next active classes based on indices
                if (index === 0) {
                    prevPage.classList.add('disabled');
                    nextPage.classList.remove('disabled');
                } else if (index === paginationNumbers.length - 1) {
                    nextPage.classList.add('disabled');
                    prevPage.classList.remove('disabled');
                } else {
                    prevPage.classList.remove('disabled');
                    nextPage.classList.remove('disabled');
                }
                
                // Scroll smoothly to top of orders content
                const contentArea = document.querySelector('.orders-content');
                if (contentArea) {
                    contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }
});
