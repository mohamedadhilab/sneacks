document.addEventListener('DOMContentLoaded', () => {



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

                    

                    const card =
                        button.closest(
                            '.wishlist-item-wrapper'
                        );

                    card.style.opacity = '0';

                    setTimeout(() => {

                        card.remove();

                       

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