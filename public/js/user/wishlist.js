document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // REMOVE BUTTONS
    // =========================================

    const removeButtons =
        document.querySelectorAll(
            '.wishlist-remove-btn'
        );

    removeButtons.forEach(button => {

        button.addEventListener(
            'click',
            async () => {

                try {

                    const productId =
                        button.dataset.productId;

                    // =========================
                    // API CALL
                    // =========================

                    const response = await fetch(

                        '/remove-wishlist-item',

                        {

                            method: 'DELETE',

                            headers: {

                                'Content-Type':
                                    'application/json'

                            },

                            body: JSON.stringify({

                                productId

                            })

                        }

                    );

                    const data =
                        await response.json();

                    // =========================
                    // FAILED
                    // =========================

                    if (!data.success) {

                        Swal.fire({

                            icon: 'error',

                            title: 'Oops',

                            text: data.message,

                            confirmButtonColor:
                                '#111'

                        });

                        return;

                    }

                    // =========================
                    // REMOVE CARD
                    // =========================

                    const card =
                        button.closest(
                            '.wishlist-item-wrapper'
                        );

                    card.style.opacity = '0';

                    setTimeout(() => {

                        card.remove();

                        // =====================
                        // EMPTY CHECK
                        // =====================

                        const remainingItems =
                            document.querySelectorAll(
                                '.wishlist-item-wrapper'
                            );

                        if (
                            remainingItems.length === 0
                        ) {

                            location.reload();

                        }

                    }, 300);

                    // =========================
                    // SUCCESS
                    // =========================

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

                        text:
                            'Something went wrong',

                        confirmButtonColor:
                            '#111'

                    });

                }

            }

        );

    });

});