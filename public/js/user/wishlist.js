document.addEventListener('DOMContentLoaded', () => {

    const wishlistToggles = document.querySelectorAll('.wishlist-toggle-btn');

    if (wishlistToggles.length > 0) {
        wishlistToggles.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const productId = this.getAttribute('data-id');
                const icon = this.querySelector('i');
                const isCurrentlyActive = this.classList.contains('active');
                
                // Toggle UI state immediately for responsiveness
                if (isCurrentlyActive) {
                    this.classList.remove('active');
                    icon.className = 'far fa-heart';
                    
                    // If on wishlist page, fade out and remove the item
                    const wrapper = this.closest('.wishlist-item-wrapper');
                    if(wrapper) {
                        wrapper.style.opacity = '0';
                        wrapper.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            wrapper.remove();
                            // Check if empty
                            const remaining = document.querySelectorAll('.wishlist-item-wrapper');
                            if(remaining.length === 0) {
                                location.reload(); // Reload to show empty state
                            }
                        }, 300);
                    }

                } else {
                    this.classList.add('active');
                    icon.className = 'fas fa-heart text-error';
                }

                // In a real app, make an AJAX call to add/remove from wishlist backend here
                // fetch(`/wishlist/toggle/${productId}`, { method: 'POST' }) ...
            });
        });
    }

});
