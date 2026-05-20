document.addEventListener('DOMContentLoaded', () => {

    const minusBtns =
        document.querySelectorAll('.qty-btn.minus');

    const plusBtns =
        document.querySelectorAll('.qty-btn.plus');

    minusBtns.forEach(button => {

        button.addEventListener('click', () => {

            const itemId =
                button.dataset.itemId;

            updateQuantity(
                itemId,
                'decrease'
            );

        });

    });

    plusBtns.forEach(button => {

        button.addEventListener('click', () => {

            const itemId =
                button.dataset.itemId;

            updateQuantity(
                itemId,
                'increase'
            );

        });

    });
    // =====================================================
// REMOVE BUTTONS
// =====================================================

const removeBtns =
    document.querySelectorAll(
        '.remove-item-btn'
    );

removeBtns.forEach(button => {

    button.addEventListener('click', () => {

        const itemId =
            button.dataset.itemId;

        removeCartItem(itemId);

    });

});

});

// =====================================================
// UPDATE QUANTITY
// =====================================================

async function updateQuantity(
    itemId,
    action
) {

    try {

        const response = await fetch(

            '/update-cart-quantity',

            {

                method: 'PATCH',

                headers: {

                    'Content-Type':
                        'application/json'

                },

                body: JSON.stringify({

                    itemId,
                    action

                })

            }

        );

        const data =
            await response.json();

        if (!data.success) {

            Swal.fire({

                icon: 'warning',

                title: 'Oops',

                text: data.message,

                confirmButtonColor: '#111'

            });

            return;

        }

        // =================================================
        // ELEMENTS
        // =================================================

        const minusBtn =
            document.querySelector(
                `.qty-btn.minus[data-item-id="${itemId}"]`
            );

        const cartItem =
            minusBtn.closest('.cart-item');

        const qtyInput =
            cartItem.querySelector('.qty-input');

        const totalPrice =
            cartItem.querySelector(
                '.item-total-price'
            );

        // =================================================
        // UPDATE UI
        // =================================================

        qtyInput.value =
            data.quantity;

        totalPrice.innerText =
            data.itemTotal.toLocaleString();

        document.getElementById(
            'cartSubtotal'
        ).innerText =
            `₹${data.cartTotal.toLocaleString()}`;

        document.getElementById(
            'cartTotal'
        ).innerText =
            `₹${data.cartTotal.toLocaleString()}`;

    }

    catch (error) {

        console.log(error);

        Swal.fire({

            icon: 'error',

            title: 'Error',

            text: 'Something went wrong',

            confirmButtonColor: '#111'

        });

    }

}
// =====================================================
// REMOVE CART ITEM
// =====================================================

async function removeCartItem(itemId) {

    try {

        const response = await fetch(

            '/remove-cart-item',

            {

                method: 'DELETE',

                headers: {

                    'Content-Type':
                        'application/json'

                },

                body: JSON.stringify({

                    itemId

                })

            }

        );

        const data =
            await response.json();

        // =============================================
        // FAILED
        // =============================================

        if (!data.success) {

            Swal.fire({

                icon: 'error',

                title: 'Oops',

                text: data.message,

                confirmButtonColor: '#111'

            });

            return;

        }

        // =============================================
        // REMOVE UI
        // =============================================

        const removeBtn =
            document.querySelector(
                `.remove-item-btn[data-item-id="${itemId}"]`
            );

        const cartItem =
            removeBtn.closest('.cart-item');

        cartItem.style.opacity = '0';

     setTimeout(() => {

    cartItem.remove();

    // =========================================
    // RECALCULATE TOTAL
    // =========================================

    let newTotal = 0;

    document
        .querySelectorAll('.cart-item')
        .forEach(item => {

            const itemTotal =
                Number(

                    item.querySelector(
                        '.item-total-price'
                    )
                    .innerText
                    .replace(/,/g, '')

                );

            newTotal += itemTotal;

        });

    // =========================================
    // UPDATE TOTAL UI
    // =========================================

    document.getElementById(
        'cartSubtotal'
    ).innerText =
        `₹${newTotal.toLocaleString()}`;

    document.getElementById(
        'cartTotal'
    ).innerText =
        `₹${newTotal.toLocaleString()}`;

    // =========================================
    // EMPTY CART
    // =========================================

    const remainingItems =
        document.querySelectorAll(
            '.cart-item'
        );

    if (remainingItems.length === 0) {

        location.reload();

    }

}, 300);

        // =============================================
        // SUCCESS
        // =============================================

        Swal.fire({

            icon: 'success',

            title: 'Removed',

            text: data.message,

            timer: 1200,

            showConfirmButton: false

        });

    }

    catch (error) {

        console.log(error);

        Swal.fire({

            icon: 'error',

            title: 'Error',

            text: 'Something went wrong',

            confirmButtonColor: '#111'

        });

    }

}
