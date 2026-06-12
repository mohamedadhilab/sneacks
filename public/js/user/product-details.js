document.addEventListener('DOMContentLoaded', () => {



    const mainImage =
        document.getElementById('mainImage');

    const thumbnails =
        document.querySelectorAll('.thumbnail');

    const sizeBtns =
        document.querySelectorAll('.size-btn');

    const selectedSizeInput =
        document.getElementById('selectedSizeInput');

    const addToCartBtn =
        document.getElementById('addToCartBtn');

    const stockStatus =
        document.getElementById('stockStatus');

    const qtyInput =
        document.getElementById('qtyInput');

    const btnMinus =
        document.querySelector('.qty-btn.minus');

    const btnPlus =
        document.querySelector('.qty-btn.plus');



    let currentMaxStock = 0;



    if (mainImage && thumbnails.length > 0) {

        thumbnails.forEach(thumbnail => {

            thumbnail.addEventListener('click', () => {

                // CHANGE MAIN IMAGE

                const imageSrc =
                    thumbnail.dataset.src;

                mainImage.src = imageSrc;

                // REMOVE ACTIVE CLASS

                thumbnails.forEach(item => {

                    item.classList.remove('active');

                });

                // ADD ACTIVE CLASS

                thumbnail.classList.add('active');

            });

        });

    }



    const totalStockElement =
    document.querySelector('.out-stock-banner');

if(totalStockElement){

    addToCartBtn.disabled = true;

}
    if (sizeBtns.length > 0) {

        sizeBtns.forEach(button => {

            button.addEventListener('click', (e) => {

                e.preventDefault();

                // DON'T ALLOW OUT OF STOCK

                if (
                    button.classList.contains('out-of-stock')
                ) {
                    return;
                }

                // REMOVE ACTIVE FROM ALL

                sizeBtns.forEach(btn => {

                    btn.classList.remove('active');

                });

                // ADD ACTIVE TO CURRENT

                button.classList.add('active');

                // GET VALUES

                const size =
                    button.dataset.size;

                const stock =
                    Number(button.dataset.stock);

                // UPDATE VARIABLES

                currentMaxStock = stock;

                // UPDATE HIDDEN INPUT

                selectedSizeInput.value = size;

                // RESET QUANTITY

                qtyInput.value = 1;

                // LIMIT MAX QUANTITY

                qtyInput.max = Math.min(stock, 5);


                if (stock <= 0) {

                    stockStatus.textContent =
                        'Out of stock';

                    stockStatus.style.color =
                        '#d11a2a';

                    addToCartBtn.disabled = true;

                    addToCartBtn.textContent =
                        'Out of Stock';

                }

                else if (stock <= 3) {

                    stockStatus.textContent =
                        `Only ${stock} left in stock`;

                    stockStatus.style.color =
                        '#b7791f';

                    addToCartBtn.disabled = false;

                    addToCartBtn.textContent =
                        'Add to Cart';

                }

                else {

                    stockStatus.textContent =
                        `${stock} items available`;

                    stockStatus.style.color =
                        'var(--color-text-secondary)';

                    addToCartBtn.disabled = false;

                    addToCartBtn.textContent =
                        'Add to Cart';

                }

            });

        });

    }

    if (addToCartBtn) {

        addToCartBtn.disabled = true;

        addToCartBtn.textContent =
            'Select a Size';

    }

  

    if (btnMinus && qtyInput) {

        btnMinus.addEventListener('click', () => {

            let currentQty =
                Number(qtyInput.value);

            if (currentQty > 1) {

                qtyInput.value =
                    currentQty - 1;

            }

        });

    }


    if (btnPlus && qtyInput) {

        btnPlus.addEventListener('click', () => {

            let currentQty =
                Number(qtyInput.value);

            let maxAllowed =
                Math.min(currentMaxStock, 5);

            if (currentQty < maxAllowed) {

                qtyInput.value =
                    currentQty + 1;

            }

        });

    }
  

const zoomContainer = document.querySelector('.zoom-container');
const zoomLens = document.getElementById('zoomLens');
const zoomResult = document.getElementById('zoomResult');

if (zoomContainer && mainImage && zoomLens && zoomResult) {

    // Helper to check if side zoom should run (desktop only)
    const isDesktop = () => window.innerWidth > 992;

    zoomContainer.addEventListener('mouseenter', () => {
        if (!isDesktop()) return;
        
        // Ensure result pane shows the currently active image
        zoomResult.style.backgroundImage = `url('${mainImage.src}')`;
    });

    zoomContainer.addEventListener('mousemove', (e) => {
        if (!isDesktop()) return;
        
        const rect = zoomContainer.getBoundingClientRect();
        
        // Cursor position relative to container
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        
        // Lens dimensions
        const lensWidth = zoomLens.offsetWidth;
        const lensHeight = zoomLens.offsetHeight;
        
        // Calculate bounds so lens stays inside the image
        const minX = lensWidth / 2;
        const minY = lensHeight / 2;
        const maxX = rect.width - minX;
        const maxY = rect.height - minY;
        
        if (x < minX) x = minX;
        if (x > maxX) x = maxX;
        if (y < minY) y = minY;
        if (y > maxY) y = maxY;
        
        // Position the lens perfectly centered on the cursor
        const lensX = x - minX;
        const lensY = y - minY;
        zoomLens.style.left = `${lensX}px`;
        zoomLens.style.top = `${lensY}px`;
        
        // Calculate the magnification ratio
        const cx = zoomResult.offsetWidth / lensWidth;
        const cy = zoomResult.offsetHeight / lensHeight;
        
        // Apply the zoom effect to the side pane
        zoomResult.style.backgroundSize = `${rect.width * cx}px ${rect.height * cy}px`;
        zoomResult.style.backgroundPosition = `-${lensX * cx}px -${lensY * cy}px`;
    });

}
    

});


const addToCartForm =
    document.getElementById('addToCartForm');

if (addToCartForm) {

    addToCartForm.addEventListener(
        'submit',
        async function (e) {

            e.preventDefault();

            try {

                const productId =
                    document.querySelector(
                        'input[name="productId"]'
                    ).value;

                const size =
                    document.getElementById(
                        'selectedSizeInput'
                    ).value;

                const quantity =
                    document.getElementById(
                        'qtyInput'
                    ).value;



                if (!size) {

Swal.fire({

    icon: 'warning',

    title: 'Select Size',

    text: 'Please select a size',

    confirmButtonColor: '#111'

});
                    return;
                }



                addToCartBtn.disabled = true;

                addToCartBtn.innerText =
                    'Adding...';

             

                const response = await fetch(
                    '/add-to-cart',
                    {

                        method: 'POST',

                        headers: {

                            'Content-Type':
                                'application/json'

                        },

                        body: JSON.stringify({

                    productId,

                    quantity,

                    selectedSize: size

                })

                    }
                );

              let data;

                try {

                    data = await response.json();

                } catch {

                    Swal.fire({

                        icon: 'warning',

                        title: 'Login Required',

                        text: 'Please login first',

                        confirmButtonColor: '#111'

                    }).then(() => {

                        window.location.href = '/login';

                    });

                    return;

                }
                    



                if (data.success) {


                    const badge =
                        document.getElementById(
                            'cartCountBadge'
                        );


                    if (badge) {


                        badge.innerText =
                            data.cartCount;


                        badge.style.display =
                            'flex';


                    }



                    Swal.fire({

                        icon: 'success',

                        title: 'Success',

                        text: data.message,

                        confirmButtonColor: '#111'

                    });



                    addToCartBtn.innerText =
                        'Added to Cart';


                }else {

                Swal.fire({

                    icon: 'error',

                    title: 'Oops...',

                    text: data.message,

                    confirmButtonColor: '#111'

                });
                    addToCartBtn.disabled = false;

                    addToCartBtn.innerText =
                        'Add to Cart';

                }

            } catch (error) {

                console.log(error);

            Swal.fire({

                icon: 'error',

                title: 'Error',

                text: 'Something went wrong',

                confirmButtonColor: '#111'

            });

                            addToCartBtn.disabled = false;

                            addToCartBtn.innerText =
                                'Add to Cart';

                        }

                    }
                );

            }

const wishlistBtn =
    document.getElementById('wishlistBtn');


if (wishlistBtn) {

    wishlistBtn.addEventListener(
        'click',
        async () => {

            try {

                const productId =
                    wishlistBtn.dataset.productId;


                const isActive =
                    wishlistBtn.classList.contains('active');


                const url = isActive
                    ? '/remove-wishlist-item'
                    : '/add-to-wishlist';


                const method = isActive
                    ? 'DELETE'
                    : 'POST';


                const response = await fetch(
                    url,
                    {

                        method,

                        headers: {

                            'Content-Type':
                                'application/json'

                        },

                        body: JSON.stringify({

                            productId

                        })

                    }
                );


                let data;


                try {

                    data = await response.json();

                }

                catch {

                    Swal.fire({

                        toast: true,

                        position: 'top-end',

                        icon: 'warning',

                        title: 'Please login first',

                        showConfirmButton: false,

                        timer: 1500

                    });


                    setTimeout(() => {

                        window.location.href =
                            '/login';

                    },1500);


                    return;

                }



                if (data.success) {
                    const wishlistBadge =
                    document.getElementById(
                    'wishlistCountBadge'
                    );


                    if(wishlistBadge){


                    wishlistBadge.innerText =
                    data.wishlistCount;



                    if(data.wishlistCount > 0){


                    wishlistBadge.style.display =
                    'flex';


                    }else{


                    wishlistBadge.style.display =
                    'none';


                    }


                    }
                                    


                    wishlistBtn.classList.toggle(
                        'active'
                    );


                    if (
                        wishlistBtn.classList.contains('active')
                    ) {

                        wishlistBtn.innerHTML =
                            '<i class="fas fa-heart"></i>';

                    }

                    else {

                        wishlistBtn.innerHTML =
                            '<i class="far fa-heart"></i>';

                    }



                    Swal.fire({

                        toast: true,

                        position: 'top-end',

                        icon: 'success',

                        title: data.message,

                        showConfirmButton: false,

                        timer: 1500,

                        timerProgressBar: true

                    });

                }


                else {


                    Swal.fire({

                        toast: true,

                        position: 'top-end',

                        icon: 'warning',

                        title: data.message,

                        showConfirmButton: false,

                        timer: 1500,

                        timerProgressBar: true

                    });

                }


            }


            catch(error){


                console.log(error);


                Swal.fire({

                    toast: true,

                    position: 'top-end',

                    icon: 'error',

                    title: 'Something went wrong',

                    showConfirmButton:false,

                    timer:1500

                });


            }

        }

    );

}