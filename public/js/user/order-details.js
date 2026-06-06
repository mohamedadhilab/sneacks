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

async function cancelItem(orderId,itemId){


const result =
await Swal.fire({

    title:'Cancel Item',

    input:'text',

    inputPlaceholder:'Reason (optional)',

    showCancelButton:true,

    confirmButtonText:'Cancel Item'

});



if(!result.isConfirmed){

    return;

}



const response =
await fetch(

`/cancel-item/${orderId}/${itemId}`,

{

method:'PATCH',

headers:{

'Content-Type':'application/json'

},

body:JSON.stringify({

reason:result.value

})

}

);



const data =
await response.json();



if(data.success){


Swal.fire({

icon:'success',

title:'Cancelled',

text:data.message


}).then(()=>{


location.reload();


});


}else{


Swal.fire({

icon:'error',

title:'Failed',

text:data.message

});


}


}

async function returnItem(orderId,itemId){


const result = await Swal.fire({

    title:'Return Product',

    text:'Please enter your return reason',

    input:'textarea',

    inputPlaceholder:'Enter return reason...',

    inputValidator:(value)=>{

        if(!value){

            return 'Return reason is required';

        }

    },

    showCancelButton:true,

    confirmButtonText:'Return Item'

});



if(!result.isConfirmed){

    return;

}



const response = await fetch(

`/return-item/${orderId}/${itemId}`,

{

method:'PATCH',

headers:{

'Content-Type':'application/json'

},

body:JSON.stringify({

reason:result.value

})

}

);



const data = await response.json();



if(data.success){


Swal.fire({

icon:'success',

title:'Success',

text:data.message,

timer:1500,

showConfirmButton:false


}).then(()=>{


location.reload();


});


}else{


Swal.fire({

icon:'error',

title:'Failed',

text:data.message


});


}


}