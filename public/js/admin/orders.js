/**
 * SNEACKS - Admin Orders List Page Interactions
 * Modals, row updates, search, and tab switching animations
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Add mobile data label mappings for responsive cards conversion
    setupResponsiveTableLabels();

    // Table search filter
    const tableSearch = document.getElementById('tableSearch');
    const tableBody = document.querySelector('#adminOrdersTable tbody');
    
    if (tableSearch && tableBody) {
        const rows = tableBody.getElementsByTagName('tr');
        
        tableSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            Array.from(rows).forEach((row) => {
                const orderId = (row.getAttribute('data-order-id') || '').toLowerCase();
                const customerName = (row.getAttribute('data-customer-name') || '').toLowerCase();
                
                if (orderId.includes(query) || customerName.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Filter Tabs Toggle logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (tabBtns.length > 0) {
        tabBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.getAttribute('data-filter');
                const rows = document.querySelectorAll('#adminOrdersTable tbody tr');
                
                rows.forEach((row) => {
                    const rowStatus = row.getAttribute('data-status');
                    if (filter === 'all' || rowStatus === filter) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });
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

    // Export button click mock
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Export Records',
                    text: 'Do you want to export all orders to CSV format?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#ff6b4a', // Brand Orange
                    cancelButtonColor: '#2a2a2a',
                    confirmButtonText: 'Export CSV',
                    cancelButtonText: 'Cancel',
                    background: '#1e1e1e',
                    color: '#ffffff'
                }).then((res) => {
                    if (res.isConfirmed) {
                        Swal.fire({
                            title: 'Success',
                            text: 'Order records exported successfully.',
                            icon: 'success',
                            confirmButtonColor: '#00e5ff',
                            background: '#1e1e1e',
                            color: '#ffffff'
                        });
                    }
                });
            } else {
                alert('Order records exported.');
            }
        });
    }
});

/**
 * Maps TH column headers to TD data-label attributes for mobile card rendering conversion.
 */
function setupResponsiveTableLabels() {
    const table = document.getElementById('adminOrdersTable');
    if (!table) return;
    
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText);
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
            if (headers[index] && cell) {
                cell.setAttribute('data-label', headers[index].trim());
            }
        });
    });
}

/**
 * Status Update Modal Controllers
 */
function openStatusModal(
    mongoId,
    orderId,
    currentStatus,
    orderAmount
) {    const modal = document.getElementById('statusModal');
    if (!modal) return;

    const form =
document.getElementById('statusUpdateForm');

form.dataset.orderId = mongoId;
    
    // Inject values dynamically
    document.getElementById('modalOrderId').innerText = '#' + orderId;
    document.getElementById('modalOrderTotal').innerText = '₹' + parseFloat(orderAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    
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

async function handleStatusSubmit(event){


    event.preventDefault();



    const form =
    document.getElementById(
        'statusUpdateForm'
    );


    const orderId =
    form.dataset.orderId;



    const status =
    document.getElementById(
        'newStatusSelect'
    ).value;




    const response =
    await fetch(

        `/admin/update-order-status/${orderId}`,

        {

            method:'PATCH',

            headers:{

                'Content-Type':
                'application/json'

            },


            body:JSON.stringify({

                status

            })

        }

    );



    const data =
    await response.json();



    if(data.success){


    closeStatusModal();


    setTimeout(()=>{


        Swal.fire({

            icon:'success',

            title:'Updated',

            text:data.message,

            confirmButtonColor:'#ff6b4a'

        })

        .then(()=>{


            location.reload();


        });


    },300);



}else{


    closeStatusModal();


    setTimeout(()=>{


        Swal.fire({

            icon:'error',

            title:'Error',

            text:data.message,

            confirmButtonColor:'#ff6b4a'

        });


    },300);



}

}