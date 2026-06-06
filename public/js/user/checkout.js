
     let selectedCheckoutAddress = null;

document.addEventListener('DOMContentLoaded', () => {

    // Step Navigation
    const stepAddress = document.getElementById('stepAddress');
    const stepPayment = document.getElementById('stepPayment');
    
    const continueToPaymentBtn = document.getElementById('continueToPaymentBtn');
    const backToAddressBtn = document.getElementById('backToAddressBtn');

    const addressForm =
     document.getElementById('addressForm');


     const alreadySelected =
document.querySelector(
'input[name="selectedAddress"]:checked'
);


if(alreadySelected){

selectedCheckoutAddress =
alreadySelected.value;

}


   if (continueToPaymentBtn) {

continueToPaymentBtn.addEventListener(
'click',
async(e)=>{

e.preventDefault();


// EXISTING ADDRESS

const existingAddress =
document.querySelector(
'input[name="selectedAddress"]:checked'
);


if(existingAddress){

selectedCheckoutAddress =
existingAddress.value;

}


// NEW ADDRESS SAVE

else if(
addressForm &&
!addressForm.classList.contains('hidden')
){

if(!addressForm.checkValidity()){

addressForm.reportValidity();

return;

}


const formData =
Object.fromEntries(
new FormData(addressForm)
);


let data;

try {

const addressIdInput =
document.getElementById('addressId');


const editId =
addressIdInput
? addressIdInput.value
: '';


const url =
editId
? `/update-address/${editId}`
: '/add-address';


const method =
editId
? 'PUT'
: 'POST';


const res =
await fetch(url,{

method: method,

headers: {

'Content-Type':'application/json',

'Accept':'application/json'

},

body: JSON.stringify(formData)

});

data =
await res.json();


} catch(error) {

console.log(
'ADDRESS SAVE ERROR',
error
);


Swal.fire({

icon:'error',

text:'Address saving failed'

});


return;

}

if(!data.success){

Swal.fire({

icon:'error',

text:data.message

});

return;

}


Swal.fire({

toast:true,
position:'top-end',
icon:'success',
title:'Address saved',
timer:1000,
showConfirmButton:false

});


setTimeout(()=>{

window.location.href='/checkout';

},1000);


return;


}

else{


Swal.fire({

toast:true,

position:'top-end',

icon:'warning',

title:'Select address',

timer:1200,

showConfirmButton:false

});


return;


}


// OPEN PAYMENT

stepAddress
.querySelector('.step-content')
.classList.add('hidden');


stepPayment
.querySelector('.step-content')
.classList.remove('hidden');


stepPayment
.querySelector('.step-header')
.classList.remove('disabled');


stepPayment.scrollIntoView({

behavior:'smooth'

});


});


}

    if (backToAddressBtn) {
        backToAddressBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Hide Payment Step Content
            stepPayment.querySelector('.step-content').classList.add('hidden');
            stepPayment.querySelector('.step-header').classList.add('disabled');
            
            // Show Address Step Content
            stepAddress.querySelector('.step-content').classList.remove('hidden');
            stepAddress.querySelector('.step-header').classList.remove('disabled');
        });
    }

    // Address Selection Toggle
    const addressCards = document.querySelectorAll('.address-card');
    addressCards.forEach(card => {
       card.addEventListener('click', function() {

            addressCards.forEach(
            c => c.classList.remove('selected')
            );

            this.classList.add('selected');


            const radio =
            this.querySelector(
            'input[name="selectedAddress"]'
            );

            if(radio){

            radio.checked = true;

            selectedCheckoutAddress =
            radio.value;

            
            if(addressForm){

addressForm.classList.add('hidden');

}
            }

            });
    });

    // Add New Address Form Toggle
const addNewAddressBtn =
document.getElementById('addNewAddressBtn');
    
    if (addNewAddressBtn && addressForm) {
        addNewAddressBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addressForm.classList.remove('hidden');
            // Uncheck radios
            document.querySelectorAll(
            'input[name="selectedAddress"]'
            )
            .forEach(r => r.checked = false);


            addressCards.forEach(
            c => c.classList.remove('selected')
            );


            // ADD THIS
            selectedCheckoutAddress = null;
            document.getElementById('addressId').value = '';

            addressForm.reset();
        });
    }

    // Payment Selection Toggle
    const paymentCards = document.querySelectorAll('.payment-card');
    paymentCards.forEach(card => {
        card.addEventListener('click', function() {
            paymentCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Coupon Logic Placeholder
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    const couponInput = document.getElementById('couponInput');
    const couponMsg = document.getElementById('couponMsg');
    const discountRow = document.getElementById('discountRow');

if (
applyCouponBtn &&
couponMsg &&
discountRow
) {        applyCouponBtn.addEventListener('click', () => {
            const code = couponInput.value.trim();
            if (code === '') return;

            // Simulate AJAX call
            applyCouponBtn.disabled = true;
            applyCouponBtn.textContent = '...';

            setTimeout(() => {
                applyCouponBtn.disabled = false;
                applyCouponBtn.textContent = 'Apply';
                
                if (code.toUpperCase() === 'SNEACKS10') {
                    couponMsg.textContent = 'Coupon applied successfully!';
                    couponMsg.style.color = 'var(--color-success)';
                    discountRow.style.display = 'flex';
                    document.getElementById('discountAmount').textContent = '500'; // Dummy value
                    // Update final total logic goes here
                } else {
                    couponMsg.textContent = 'Invalid coupon code.';
                    couponMsg.style.color = 'var(--color-error)';
                    discountRow.style.display = 'none';
                }
            }, 500);
        });
    }


const placeOrderBtn =
    document.getElementById(
        'placeOrderBtn'
    );

if (placeOrderBtn) {

    placeOrderBtn.addEventListener(
        'click',
        async () => {

          const address = selectedCheckoutAddress;

            const paymentMethod =
                document.querySelector(
                    'input[name="paymentMethod"]:checked'
                );

            if (!address) {
                if (window.Toast) {
                    window.Toast.error('Please select a shipping address.');
                } else {
                    alert('Please select a shipping address.');
                }
                return;
            }

            if (!paymentMethod) {
                if (window.Toast) {
                    window.Toast.error('Please select a payment method.');
                } else {
                    alert('Please select a payment method.');
                }
                return;
            }

            const response =
                await fetch(

                    '/place-order',

                    {

                        method: 'POST',

                        headers: {

                            'Content-Type':
                                'application/json'

                        },

                        body: JSON.stringify({

                            addressId:
                            address,

                            paymentMethod:
                                paymentMethod.value

                        })

                    }

                );

            const data =
                await response.json();

            if (data.success) {

                window.location.href =

                    `/order-success/${data.orderId}`;

            }

            else {
                if (window.Toast) {
                    window.Toast.error(data.message || 'Failed to place order.');
                } else {
                    alert(data.message || 'Failed to place order.');
                }
            }

        }

    );

}
document.querySelectorAll('.editAddressBtn')
.forEach(btn=>{

btn.addEventListener('click',(e)=>{

e.preventDefault();

e.stopPropagation();

stepPayment
.querySelector('.step-content')
.classList.add('hidden');


stepPayment
.querySelector('.step-header')
.classList.add('disabled');


stepAddress
.querySelector('.step-content')
.classList.remove('hidden');


console.log('EDIT CLICKED');


addressForm.classList.remove('hidden');


// remove selected address while editing

document
.querySelectorAll('input[name="selectedAddress"]')
.forEach(r=>{

r.checked=false;

});


document
.querySelectorAll('.address-card')
.forEach(card=>{

card.classList.remove('selected');

});


selectedCheckoutAddress=null;


document.getElementById('addressId').value =
btn.dataset.id;


const names =
btn.dataset.name.split(' ');


addressForm.elements['first_name'].value =
names[0];


addressForm.elements['last_name'].value =
names.slice(1).join(' ');


addressForm.elements['address'].value =
btn.dataset.address;


addressForm.elements['city'].value =
btn.dataset.city;


addressForm.elements['state'].value =
btn.dataset.state;


addressForm.elements['pincode'].value =
btn.dataset.pincode;


addressForm.elements['phone_number'].value =
btn.dataset.phone;


window.scrollTo({

top: addressForm.offsetTop - 100,

behavior:'smooth'

});


});

});
});

