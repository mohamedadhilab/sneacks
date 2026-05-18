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
// ======================================================
// SORT DROPDOWN
// ======================================================

const sortSelect = document.getElementById('sortSelect');

if (sortSelect) {

    sortSelect.addEventListener('change', function () {

        const url = new URL(window.location.href);

        url.searchParams.set('sort', this.value);

        window.location.href = url.toString();

    });

}
// ======================================================
// SAVE SCROLL POSITION
// ======================================================

window.addEventListener('beforeunload', () => {

    sessionStorage.setItem(
        'shopScrollPosition',
        window.scrollY
    );

});

// ======================================================
// RESTORE SCROLL POSITION
// ======================================================

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
