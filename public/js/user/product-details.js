document.addEventListener('DOMContentLoaded', () => {

    // =====================================================
    // ELEMENTS
    // =====================================================

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

    // =====================================================
    // VARIABLES
    // =====================================================

    let currentMaxStock = 0;

    // =====================================================
    // THUMBNAIL IMAGE SWITCH
    // =====================================================

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

    // =====================================================
    // SIZE SELECTOR
    // =====================================================

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

                // =================================================
                // STOCK MESSAGE
                // =================================================

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

    // =====================================================
    // DEFAULT BUTTON STATE
    // =====================================================

    if (addToCartBtn) {

        addToCartBtn.disabled = true;

        addToCartBtn.textContent =
            'Select a Size';

    }

    // =====================================================
    // QUANTITY DECREASE
    // =====================================================

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

    // =====================================================
    // QUANTITY INCREASE
    // =====================================================

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
    // =====================================================
// PROFESSIONAL IMAGE ZOOM
// =====================================================

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
// ======================================================
// ADD TO CART
// ======================================================

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

                // ======================================================
                // VALIDATION
                // ======================================================

                if (!size) {

Swal.fire({

    icon: 'warning',

    title: 'Select Size',

    text: 'Please select a size',

    confirmButtonColor: '#111'

});
                    return;
                }

                // ======================================================
                // BUTTON LOADING
                // ======================================================

                addToCartBtn.disabled = true;

                addToCartBtn.innerText =
                    'Adding...';

                // ======================================================
                // API CALL
                // ======================================================

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
     

                // ======================================================
                // SUCCESS
                // ======================================================

                if (data.success) {

Swal.fire({

    icon: 'success',

    title: 'Success',

    text: data.message,

    confirmButtonColor: '#111'

});
                    addToCartBtn.innerText =
                        'Added to Cart';

                } else {

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
// =====================================================
// ADD TO WISHLIST
// =====================================================

const wishlistBtn =
    document.getElementById(
        'wishlistBtn'
    );

if (wishlistBtn) {

    wishlistBtn.addEventListener(
        'click',
        async () => {

            try {

                const productId =
                    wishlistBtn.dataset.productId;

                // =====================================
                // API CALL
                // =====================================

                const response = await fetch(

                    '/add-to-wishlist',

                    {

                        method: 'POST',

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
                // =====================================
                // SUCCESS
                // =====================================

                if (data.success) {

                    wishlistBtn.innerHTML =
                        '<i class="fas fa-heart"></i>';

                    Swal.fire({

                        icon: 'success',

                        title: 'Success',

                        text: data.message,

                        timer: 1500,

                        showConfirmButton: false

                    });

                }

                // =====================================
                // FAILED
                // =====================================

                else {

                    Swal.fire({

                        icon: 'warning',

                        title: 'Oops',

                        text: data.message,

                        confirmButtonColor: '#111'

                    });

                }

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

    );

}