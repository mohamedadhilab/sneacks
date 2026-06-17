document.addEventListener('DOMContentLoaded', () => {



    const cartButtons =
    document.querySelectorAll(
        '.wishlist-cart-btn'
    );

    const removeButtons =
document.querySelectorAll(
'.wishlist-remove-btn'
);



removeButtons.forEach(button=>{


button.addEventListener('click',async()=>{


const productId =
button.dataset.productId;



const response =
await fetch('/remove-wishlist-item',{

method:'DELETE',

headers:{

'Content-Type':'application/json'

},

body:JSON.stringify({

productId

})

});



const data =
await response.json();


if(data.success){


const card =
button.closest(
'.wishlist-item-wrapper'
);


card.remove();


 
// UPDATE WISHLIST BADGE

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




Swal.fire({

icon:'success',

title:data.message,

timer:1000,

showConfirmButton:false

});


}else{


Swal.fire({

icon:'error',

text:data.message


});


}


});


});


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
    const wishlistBadge =
    document.getElementById(
    'wishlistCountBadge'
    );


    if(wishlistBadge){


    let count =
    Number(wishlistBadge.innerText) - 1;


    wishlistBadge.innerText =
    count;


    if(count <= 0){

    wishlistBadge.style.display =
    'none';

    }


    }



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