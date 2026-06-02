/**
 * SNEACKS - Admin Order Details Page Interactions
 * Clipboard copies, fulfillment state edits, and invoice print overrides
 */

document.addEventListener('DOMContentLoaded', () => {
   const dispatchBtn =
document.getElementById('dispatchApproveBtn');


if(dispatchBtn){


dispatchBtn.addEventListener('click', async(e)=>{


    e.preventDefault();



    const confirm =
    await Swal.fire({

        title:'Approve Dispatch?',

        text:'Move this order to Shipped status?',

        icon:'question',

        showCancelButton:true,

        confirmButtonText:'Yes, Approve Dispatch',

        confirmButtonColor:'#ff6b4a'

    });



    if(!confirm.isConfirmed){

        return;

    }



    const orderId =
    dispatchBtn.dataset.orderId;



    const response =
    await fetch(

        `/admin/update-order-status/${orderId}`,

        {

            method:'PATCH',


            headers:{

                'Content-Type':'application/json'

            },


            body:JSON.stringify({

                status:'Shipped'

            })

        }

    );



    const data =
    await response.json();



    if(data.success){


        Swal.fire({

            icon:'success',

            title:'Dispatch Approved',

            text:data.message,

            timer:1500,

            showConfirmButton:false

        })

        .then(()=>{

            location.reload();

        });



    }else{


        Swal.fire({

            icon:'error',

            title:'Failed',

            text:data.message

        });


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
           if (e.key === 'Escape' && modal.classList.contains('active')) {
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
function openStatusModalDirectly(){


    const modal =
    document.getElementById('statusModal');


    if(!modal){
        return;
    }


    modal.classList.add('active');


    const orderTitle =
    document.querySelector('.admin-order-id-title');


    const currentStatus =
    document.getElementById('headerStatusBadge');


    const orderTotal =
    document.querySelector('.grand-total-val');



    if(orderTitle){

        document.getElementById('modalOrderId').innerText =
        orderTitle.innerText.replace('ORDER ','');

    }



    if(orderTotal){

        document.getElementById('modalOrderTotal').innerText =
        orderTotal.innerText;

    }



    if(currentStatus){


        const status =
        currentStatus.innerText.trim();


        document.getElementById('modalCurrentStatus')
        .innerText = status;



        const select =
        document.getElementById('newStatusSelect');


        if(select){

            select.value = status;

        }

    }


}




async function handleStatusSubmit(event){

    event.preventDefault();

    try{

        const form =
            document.getElementById('statusUpdateForm');

        const orderId =
            form.dataset.orderId;

        const status =
            document.getElementById(
                'newStatusSelect'
            ).value;

        const response = await fetch(

            `/admin/update-order-status/${orderId}`,

            {

                method: 'PATCH',

                headers: {

                    'Content-Type': 'application/json'

                },

                body: JSON.stringify({

                    status

                })

            }

        );

        const data = await response.json();
if(data.success){


    closeStatusModal();


    setTimeout(()=>{


        Swal.fire({

            icon:'success',

            title:'Updated',

            text:data.message,

            timer:1500,

            showConfirmButton:false


        }).then(()=>{


            location.reload();


        });


    },300);


}else {


    closeStatusModal();


    setTimeout(()=>{


        Swal.fire({

            icon:'error',

            title:'Failed',

            text:data.message

        });


    },300);


}

    }

    catch(error){

        console.log(error);

        Swal.fire({

            icon: 'error',

            title: 'Error',

            text: 'Something went wrong'

        });

    }

}



function closeStatusModal(){

    document
        .getElementById('statusModal')
        .classList.remove('active');

}
