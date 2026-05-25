/**
 * SNEACKS - User Order Details Page Interactions
 * Frontend cancellation, return prompts, and invoice download simulations
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Download Invoice trigger (using window print styled layouts)
    const downloadInvoiceBtn = document.getElementById('downloadInvoiceBtn');
    if (downloadInvoiceBtn) {
        downloadInvoiceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.print();
        });
    }
});

// Modal triggers using sweetalert2 already loaded in the EJS
function triggerCancelItem(itemId, itemName) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Cancel Item?',
            text: `Are you sure you want to cancel "${itemName}" from this order? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d9534f', // Red matching var(--color-error)
            cancelButtonColor: '#a89f91',
            confirmButtonText: 'Yes, Cancel Item',
            cancelButtonText: 'Keep Item',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Item Cancelled',
                    text: `"${itemName}" has been successfully cancelled from your order.`,
                    icon: 'success',
                    confirmButtonColor: '#6b7a45'
                }).then(() => {
                    // Simulating DOM state update
                    const card = document.querySelector(`[data-item-id="${itemId}"]`);
                    if (card) {
                        card.classList.add('item-muted');
                        const statusTag = card.querySelector('.prod-status-inline');
                        if (statusTag) {
                            statusTag.className = 'prod-status-inline status-cancelled';
                            statusTag.innerText = 'Cancelled';
                        }
                        const actionArea = card.querySelector('.prod-actions');
                        if (actionArea) {
                            actionArea.innerHTML = '<span class="badge-cancelled-tag">Cancelled</span>';
                        }
                    }
                });
            }
        });
    } else {
        // Fallback standard confirm
        if (confirm(`Are you sure you want to cancel "${itemName}"?`)) {
            alert(`"${itemName}" cancelled.`);
            window.location.reload();
        }
    }
}

function triggerReturnItem(itemId, itemName) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Request Return?',
            text: `Please select a reason for returning "${itemName}":`,
            input: 'select',
            inputOptions: {
                'size-mismatch': 'Size Mismatch / Fit issue',
                'defective': 'Product Defect / Faulty item',
                'not-as-expected': 'Not as expected / Changed mind',
                'wrong-item': 'Received incorrect item'
            },
            inputPlaceholder: 'Select a reason',
            showCancelButton: true,
            confirmButtonColor: '#2c2c1e', // Dark text primary
            cancelButtonColor: '#a89f91',
            confirmButtonText: 'Submit Return Request',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            inputValidator: (value) => {
                return new Promise((resolve) => {
                    if (value) {
                        resolve();
                    } else {
                        resolve('You need to select a reason for return');
                    }
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Return Requested',
                    text: `Your return request for "${itemName}" has been submitted. Our concierge team will review it shortly.`,
                    icon: 'success',
                    confirmButtonColor: '#6b7a45'
                }).then(() => {
                    // Update UI state
                    const card = document.querySelector(`[data-item-id="${itemId}"]`);
                    if (card) {
                        const statusTag = card.querySelector('.prod-status-inline');
                        if (statusTag) {
                            statusTag.className = 'prod-status-inline status-returned';
                            statusTag.innerText = 'Return Requested';
                        }
                        const actionArea = card.querySelector('.prod-actions');
                        if (actionArea) {
                            actionArea.innerHTML = '<span class="badge-cancelled-tag">Return Requested</span>';
                        }
                    }
                });
            }
        });
    } else {
        if (confirm(`Request return for "${itemName}"?`)) {
            alert('Return request submitted.');
        }
    }
}

function triggerWriteReview(productId, productName) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: `Review "${productName}"`,
            html: `
                <div class="swal-review-form">
                    <div class="swal-stars mb-3" style="display: flex; justify-content: center; gap: 0.5rem; font-size: 1.5rem; color: #ffca28; cursor: pointer;">
                        <i class="far fa-star swal-star" data-rating="1"></i>
                        <i class="far fa-star swal-star" data-rating="2"></i>
                        <i class="far fa-star swal-star" data-rating="3"></i>
                        <i class="far fa-star swal-star" data-rating="4"></i>
                        <i class="far fa-star swal-star" data-rating="5"></i>
                    </div>
                    <input type="text" id="reviewTitle" class="swal2-input m-0 w-100" style="font-size: 0.9rem;" placeholder="Review Summary (e.g. Beautiful leather!)">
                    <textarea id="reviewBody" class="swal2-textarea m-0 mt-3 w-100" style="font-size: 0.9rem; height: 80px;" placeholder="Share your experience..."></textarea>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#6b7a45', // Olive green
            cancelButtonColor: '#a89f91',
            confirmButtonText: 'Submit Review',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            didOpen: () => {
                // Interactive star rating inside modal
                const stars = Swal.getHtmlContainer().querySelectorAll('.swal-star');
                let rating = 0;
                stars.forEach((star, index) => {
                    star.addEventListener('click', () => {
                        rating = index + 1;
                        stars.forEach((s, idx) => {
                            if (idx < rating) {
                                s.classList.remove('far');
                                s.classList.add('fas');
                            } else {
                                s.classList.remove('fas');
                                s.classList.add('far');
                            }
                        });
                    });
                });
            },
            preConfirm: () => {
                const title = document.getElementById('reviewTitle').value;
                const body = document.getElementById('reviewBody').value;
                if (!title || !body) {
                    Swal.showValidationMessage('Please write both a title and review content');
                }
                return { title, body };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Thank You!',
                    text: 'Your review has been successfully submitted and helps the atelier.',
                    icon: 'success',
                    confirmButtonColor: '#6b7a45'
                });
            }
        });
    } else {
        const reviewText = prompt(`Write your review for "${productName}":`);
        if (reviewText) {
            alert('Review submitted.');
        }
    }
}
