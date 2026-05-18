document.addEventListener('DOMContentLoaded', () => {

    const cartItemsList = document.querySelector('.cart-items-list');

    if (cartItemsList) {
        
        // Quantity Increment / Decrement
        cartItemsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('qty-btn')) {
                const btn = e.target;
                const isPlus = btn.classList.contains('plus');
                const container = btn.closest('.quantity-selector');
                const input = container.querySelector('.qty-input');
                const itemId = btn.getAttribute('data-item-id');
                
                let val = parseInt(input.value, 10);
                const max = parseInt(input.max, 10) || 5;

                if (isPlus && val < max) {
                    val++;
                } else if (!isPlus && val > 1) {
                    val--;
                } else {
                    return; // No change
                }

                input.value = val;
                
                // In a real app, you would make an AJAX call here to update the cart in the database.
                // For this UI implementation, we'll simulate the update visually.
                updateCartTotals();
            }

            // Remove Item
            if (e.target.classList.contains('remove-item-btn')) {
                const btn = e.target;
                const itemRow = btn.closest('.cart-item');
                const itemId = btn.getAttribute('data-item-id');

                // Fade out animation
                itemRow.style.opacity = '0';
                setTimeout(() => {
                    itemRow.remove();
                    updateCartTotals();

                    // Check if empty
                    const remainingItems = document.querySelectorAll('.cart-item');
                    if(remainingItems.length === 0) {
                        location.reload(); // Reload to show empty state from backend
                    }
                }, 300);
            }
        });

    }

    function updateCartTotals() {
        const items = document.querySelectorAll('.cart-item');
        let newTotal = 0;

        items.forEach(item => {
            // Get base price from the mobile price element (assuming it's formatted as ₹X,XXX)
            // A more robust way is to store price in a data attribute
            const priceText = item.querySelector('.item-price-mobile').textContent.replace(/[^\d]/g, '');
            const basePrice = parseInt(priceText, 10);
            const qty = parseInt(item.querySelector('.qty-input').value, 10);
            
            const itemTotal = basePrice * qty;
            newTotal += itemTotal;

            // Update item total display
            const itemTotalDisplay = item.querySelector('.item-total-price');
            if(itemTotalDisplay) {
                itemTotalDisplay.textContent = itemTotal.toLocaleString();
            }
        });

        // Update summary displays
        const subtotalEl = document.getElementById('cartSubtotal');
        const totalEl = document.getElementById('cartTotal');

        if(subtotalEl) subtotalEl.textContent = '₹' + newTotal.toLocaleString();
        if(totalEl) totalEl.textContent = '₹' + newTotal.toLocaleString();
    }

});
