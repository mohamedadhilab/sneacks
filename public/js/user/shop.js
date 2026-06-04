document.addEventListener('DOMContentLoaded', () => {
    
    // Mobile Filter Drawer Logic
    const filterBtn = document.getElementById('mobileFilterBtn');
    const closeFilterBtn = document.getElementById('closeFilterBtn');
    const sidebar = document.getElementById('shopSidebar');
    const overlay = document.getElementById('sidebarOverlay');

    function toggleFilters() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }

    if (filterBtn) {
        filterBtn.addEventListener('click', toggleFilters);
    }

    if (closeFilterBtn) {
        closeFilterBtn.addEventListener('click', toggleFilters);
    }

    if (overlay) {
        overlay.addEventListener('click', toggleFilters);
    }

    // Auto-submit form when sort changes
    const sortSelect = document.getElementById('sortSelect');
    const filterForm = document.getElementById('filterForm');

    if (sortSelect && filterForm) {
        sortSelect.addEventListener('change', () => {
            // Check if sort input exists in form, if not add it
            let sortInput = filterForm.querySelector('input[name="sort"]');
            if (!sortInput) {
                sortInput = document.createElement('input');
                sortInput.type = 'hidden';
                sortInput.name = 'sort';
                filterForm.appendChild(sortInput);
            }
            sortInput.value = sortSelect.value;
            filterForm.submit();
        });
        
        // Set initial sort value from URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const sortParam = urlParams.get('sort');
        if (sortParam) {
            sortSelect.value = sortParam;
        }
    }
});


const sortSelect = document.getElementById('sortSelect');

if (sortSelect) {

    sortSelect.addEventListener('change', function () {

        const url = new URL(window.location.href);

        url.searchParams.set('sort', this.value);

        window.location.href = url.toString();

    });

}


window.addEventListener('beforeunload', () => {

    sessionStorage.setItem(
        'shopScrollPosition',
        window.scrollY
    );

});



window.addEventListener('load', () => {

    const scrollPosition =
        sessionStorage.getItem('shopScrollPosition');

    if (scrollPosition) {

        window.scrollTo({

            top: parseInt(scrollPosition),

            behavior: 'instant'

        });

    }

});

async function toggleWishlist(productId, button){


    const isActive =
        button.classList.contains('active');


    const url = isActive
        ? '/remove-wishlist-item'
        : '/add-to-wishlist';


    const method = isActive
        ? 'DELETE'
        : 'POST';


    try {


        const response =
            await fetch(
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

                toast:true,

                position:'top-end',

                icon:'warning',

                title:'Please login first',

                timer:1500,

                showConfirmButton:false

            });


            setTimeout(()=>{

                window.location.href =
                    '/login';

            },1500);


            return;

        }



        if(data.success){


            const icon =
                button.querySelector('i');



            if(isActive){


                button.classList.remove(
                    'active'
                );


                icon.className =
                    'far fa-heart';


            }


            else {


                button.classList.add(
                    'active'
                );


                icon.className =
                    'fas fa-heart text-error';

            }




            Swal.fire({

                toast:true,

                position:'top-end',

                icon:'success',

                title:data.message,

                timer:1200,

                showConfirmButton:false

            });


        }


    }


    catch(error){

        console.log(error);

    }


}
