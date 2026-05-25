/**
 * SNEACKS - Admin Order Details Page Interactions
 * Clipboard copies, fulfillment state edits, and invoice print overrides
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Dispatch Approve action click simulator
    const dispatchBtn = document.getElementById('dispatchApproveBtn');
    if (dispatchBtn) {
        dispatchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Approve Dispatch?',
                    text: 'Confirming fulfillment will verify product allocation and signal the logistics crew for transit packaging.',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#ff6b4a', // Brand Orange
                    cancelButtonColor: '#2a2a2a',
                    confirmButtonText: 'Yes, Approve Dispatch',
                    cancelButtonText: 'Cancel',
                    background: '#1e1e1e',
                    color: '#ffffff'
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: 'Dispatch Approved',
                            text: 'Order status updated to "Shipped". Tracking codes have been dispatched to client email log.',
                            icon: 'success',
                            confirmButtonColor: '#00e5ff', // Cyan success glow
                            background: '#1e1e1e',
                            color: '#ffffff'
                        }).then(() => {
                            // Update badge states on DOM
                            const badge = document.getElementById('headerStatusBadge');
                            if (badge) {
                                badge.className = 'badge badge-shipped';
                                badge.innerHTML = '<span class="badge-dot"></span> Shipped';
                            }
                            dispatchBtn.style.display = 'none';
                        });
                    }
                });
            } else {
                if (confirm('Approve order for dispatch?')) {
                    alert('Order approved.');
                }
            }
        });
    }

    // Modal click-outside and ESC key closers
    const modal = document.getElementById('statusModal');
    if (modal) {
        // Click outside backdrop
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeStatusModal();
            }
        });

        // ESC key close listener
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                closeStatusModal();
            }
        });
    }
});

/**
 * Copy Transaction ID to Clipboard
 */
function copyTransactionId() {
    const trxId = document.getElementById('trxIdText');
    if (!trxId) return;
    
    const textToCopy = trxId.innerText.trim();
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                title: 'Copied to Clipboard',
                icon: 'success',
                background: '#1e1e1e',
                color: '#ffffff'
            });
        } else {
            alert('Transaction ID copied: ' + textToCopy);
        }
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

/**
 * Update Status Modal from details view
 */
function openStatusModalDirectly() {
    const modal = document.getElementById('statusModal');
    if (!modal) return;
    
    // Inject values dynamically
    const orderTitle = document.querySelector('.admin-order-id-title').innerText.replace('ORDER #', '');
    const currentStatus = document.getElementById('headerStatusBadge').innerText.trim();
    const orderTotal = document.querySelector('.grand-total-val').innerText.trim();
    
    document.getElementById('modalOrderId').innerText = '#' + orderTitle;
    document.getElementById('modalOrderTotal').innerText = orderTotal;
    
    const currentBadge = document.getElementById('modalCurrentStatus');
    currentBadge.innerText = currentStatus;
    
    // Set matching classes
    currentBadge.className = 'badge';
    let statusClass = 'badge-pending';
    const cleanStatus = currentStatus.toLowerCase();
    if (cleanStatus === 'processing') statusClass = 'badge-processing';
    else if (cleanStatus === 'shipped') statusClass = 'badge-shipped';
    else if (cleanStatus === 'delivered') statusClass = 'badge-delivered';
    else if (cleanStatus === 'cancelled') statusClass = 'badge-cancelled';
    else if (cleanStatus === 'returned') statusClass = 'badge-returned';
    currentBadge.classList.add(statusClass);
    
    // Pre-select dropdown value
    const select = document.getElementById('newStatusSelect');
    if (select) {
        select.value = currentStatus;
    }
    
    // Clear notes field
    const textarea = document.getElementById('adminNotes');
    if (textarea) {
        textarea.value = '';
    }
    
    // Open modal animation trigger
    modal.classList.add('open');
}

function closeStatusModal() {
    const modal = document.getElementById('statusModal');
    if (modal) {
        modal.classList.remove('open');
    }
}

function handleStatusSubmit(event) {
    event.preventDefault();
    const orderId = document.getElementById('modalOrderId').innerText.replace('#', '');
    const newStatus = document.getElementById('newStatusSelect').value;
    const notes = document.getElementById('adminNotes').value;
    
    // Mock save update logic
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Updating Status...',
            text: `Saving order #${orderId} status as "${newStatus}"`,
            icon: 'info',
            background: '#1e1e1e',
            color: '#ffffff',
            showConfirmButton: false,
            timer: 1200
        }).then(() => {
            Swal.fire({
                title: 'Order Updated',
                text: `Order #${orderId} has been updated to "${newStatus}".`,
                icon: 'success',
                confirmButtonColor: '#ff6b4a',
                background: '#1e1e1e',
                color: '#ffffff'
            }).then(() => {
                closeStatusModal();
                
                // Update badge states on details DOM
                const badge = document.getElementById('headerStatusBadge');
                if (badge) {
                    badge.className = 'badge';
                    let statusClass = 'badge-pending';
                    const cleanStatus = newStatus.toLowerCase();
                    if (cleanStatus === 'processing') statusClass = 'badge-processing';
                    else if (cleanStatus === 'shipped') statusClass = 'badge-shipped';
                    else if (cleanStatus === 'delivered') statusClass = 'badge-delivered';
                    else if (cleanStatus === 'cancelled') statusClass = 'badge-cancelled';
                    else if (cleanStatus === 'returned') statusClass = 'badge-returned';
                    
                    badge.classList.add(statusClass);
                    badge.innerHTML = `<span class="badge-dot"></span> ${newStatus}`;
                }
                
                // Toggle dispatch button visibility
                const dispatchBtn = document.getElementById('dispatchApproveBtn');
                if (dispatchBtn) {
                    if (newStatus.toLowerCase() === 'processing' || newStatus.toLowerCase() === 'pending') {
                        dispatchBtn.style.display = 'flex';
                    } else {
                        dispatchBtn.style.display = 'none';
                    }
                }
            });
        });
    } else {
        alert(`Order ${orderId} updated to ${newStatus}.`);
        closeStatusModal();
        window.location.reload();
    }
}
