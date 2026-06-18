// ===============================
// COUPON MODAL
// ===============================

function openCouponModal(){


    const modal =
    document.getElementById('couponModal');


    if(modal){


        modal.style.display = 'flex';


    }


}



function closeCouponModal(){


    const modal =
    document.getElementById('couponModal');


    if(modal){


        modal.style.display = 'none';


    }


}



// close modal when clicking outside

document.addEventListener(
'click',
function(e){


    const modal =
    document.getElementById('couponModal');


    if(

        modal &&

        e.target === modal

    ){


        closeCouponModal();


    }


}

);



// ===============================
// DELETE CONFIRMATION
// ===============================

function confirmDeleteCoupon(event,url){


    event.preventDefault();


    Swal.fire({


        title:'Delete Coupon?',


        text:'This coupon will be removed',


        icon:'warning',


        showCancelButton:true,


        confirmButtonText:'Yes Delete',


        cancelButtonText:'Cancel'


    }).then((result)=>{


        if(result.isConfirmed){


            window.location.href = url;


        }


    });


}
// ===============================
// EDIT COUPON MODAL
// ===============================


function openEditCouponModal(

event,
id,
code,
type,
value,
minimum,
maximum,
expiry,
limit

){


event.preventDefault();


document.getElementById('editCouponForm').action =

'/admin/edit-coupon/' + id;




document.getElementById('editCouponCode').value =
code;



document.getElementById('editDiscountType').value =
type;



document.getElementById('editDiscountValue').value =
value;



document.getElementById('editMinimumAmount').value =
minimum;



document.getElementById('editMaximumDiscount').value =
maximum;



document.getElementById('editExpiryDate').value =
expiry;



document.getElementById('editUsageLimit').value =
limit;



document.getElementById('editCouponModal').style.display =
'flex';


}




function closeEditCouponModal(){


document.getElementById('editCouponModal').style.display =
'none';


}