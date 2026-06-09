document.addEventListener('DOMContentLoaded', () => {



    const cartButtons =
    document.querySelectorAll(
        '.wishlist-cart-btn'
    );


    cartButtons.forEach(button=>{


    button.addEventListener(
    'click',
    async()=>{


    const productId =
    button.dataset.productId;


    const card =
    button.closest(
    '.wishlist-item-wrapper'
    );


    const size =
    card.querySelector(
    '.wishlist-size-select'
    ).value;



    if(!size){


    Swal.fire({

    icon:'warning',

    title:'Select size first'

    });


    return;


    }



    const response =
    await fetch('/add-to-cart',{


    method:'POST',


    headers:{

    'Content-Type':'application/json'

    },


    body:JSON.stringify({


    productId:productId,


    selectedSize:size,


    quantity:1


    })


    });



    const data =
    await response.json();



    if(!data.success){


    Swal.fire({

    icon:'error',

    text:data.message

    });


    return;

    }




    // update cart badge

    const badge =
    document.getElementById(
    'cartCountBadge'
    );


    if(badge){


    badge.innerText =
    data.cartCount;


    badge.style.display =
    'flex';


    }



    // remove wishlist card

    card.remove();



    Swal.fire({


    icon:'success',


    title:'Added to cart',


    timer:1000,


    showConfirmButton:false


    });



    }


    );


    });

});