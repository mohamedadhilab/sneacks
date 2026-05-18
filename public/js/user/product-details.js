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

});