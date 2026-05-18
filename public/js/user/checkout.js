document.addEventListener('DOMContentLoaded', () => {

    // Step Navigation
    const stepAddress = document.getElementById('stepAddress');
    const stepPayment = document.getElementById('stepPayment');
    
    const continueToPaymentBtn = document.getElementById('continueToPaymentBtn');
    const backToAddressBtn = document.getElementById('backToAddressBtn');

    if (continueToPaymentBtn) {
        continueToPaymentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Validate address selection/form here in real app
            
            // Hide Address Step Content
            stepAddress.querySelector('.step-content').classList.add('hidden');
            stepAddress.querySelector('.step-header').classList.add('disabled');
            
            // Show Payment Step Content
            stepPayment.querySelector('.step-content').classList.remove('hidden');
            stepPayment.querySelector('.step-header').classList.remove('disabled');
            
            // Scroll to payment
            stepPayment.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            addressCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Add New Address Form Toggle
    const addNewAddressBtn = document.getElementById('addNewAddressBtn');
    const addressForm = document.getElementById('addressForm');
    
    if (addNewAddressBtn && addressForm) {
        addNewAddressBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addressForm.classList.remove('hidden');
            // Uncheck radios
            document.querySelectorAll('input[name="selectedAddress"]').forEach(r => r.checked = false);
            addressCards.forEach(c => c.classList.remove('selected'));
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

    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', () => {
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

});
