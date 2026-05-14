


// ==================================================
// PRODUCT IMAGE STATE
// ==================================================

const addProductImages = {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null
};

// ==================================================
// FILE INPUT TRIGGER
// ==================================================

function triggerAddFileInput(id) {

    document
    .getElementById(`add-file-${id}`)
    .click();

}

// ==================================================
// HANDLE IMAGE UPLOAD
// ==================================================

function handleAddFile(e, id) {

    const file = e.target.files[0];

    if (file && file.type.startsWith('image/')) {

        const reader = new FileReader();

        reader.onload = (ev) => {

            const slot =
            document.getElementById(`add-slot-${id}`);

            slot.querySelector('.preview-img').src =
            ev.target.result;

            slot.classList.remove('empty');

            slot.classList.add('has-image');

            addProductImages[id] = file;

        };

        reader.readAsDataURL(file);

    }

}

// ==================================================
// REMOVE IMAGE
// ==================================================

function removeAddImage(id) {

    const slot =
    document.getElementById(`add-slot-${id}`);

    slot.querySelector('.preview-img').src = '';

    document.getElementById(`add-file-${id}`).value = '';

    slot.classList.remove('has-image');

    slot.classList.add('empty');

    addProductImages[id] = null;

}

// ==================================================
// OPEN/CLOSE ADD PRODUCT MODAL
// ==================================================

function openAddProductModal() {

    document
    .getElementById('addProductModal')
    .classList.add('active');

}

function closeAddProductModal() {

    document
    .getElementById('addProductModal')
    .classList.remove('active');

}

// ==================================================
// OPEN/CLOSE EDIT MODAL
// ==================================================

function openEditModal(
    id,
    name,
    price,
    category,
    status,
    images,
    variants
) {
    document.getElementById('productEditModal').classList.add('active');
    document.getElementById('quickEditForm').action = `/admin/edit-product/${id}`;
    document.getElementById('editProductName').value = name;
    document.getElementById('editProductPrice').value = price;
    document.getElementById('editProductCategory').value = category;
    document.getElementById('editProductStatus').value = status;

    // LOAD IMAGES
// LOAD IMAGES

const container =
document.getElementById('editImagesContainer');

container.innerHTML = '';

if(images && images.length > 0){

    images.forEach((image, index) => {

        container.innerHTML += `

            <div class="edit-img-slot has-image">

                <img
                    src="/uploads/products/${image}"
                    class="preview-img"
                >

                <div class="edit-img-actions">

                    <button
                        type="button"
                        class="mini-btn"
                        onclick="document.getElementById('edit-file-${index}').click()"
                    >
                        <i class="fas fa-pen"></i>
                    </button>

                </div>

                <input
                    type="file"
                    name="productImage"
                    id="edit-file-${index}"
                    hidden
                    accept="image/*"
                    onchange="handleEditImage(event, this)"
                >

            </div>

        `;

    });

}

function handleEditImage(event, input) {

    const file = event.target.files[0];

    if(file && file.type.startsWith('image/')) {

        const reader = new FileReader();

        reader.onload = function(e) {

            const slot =
            input.closest('.edit-img-slot');

            slot.querySelector('img').src =
            e.target.result;

        };

        reader.readAsDataURL(file);

    }

}
    // LOAD VARIANTS
    const varContainer = document.getElementById('editVariantContainer');
    varContainer.innerHTML = '';
    if (variants && variants.length > 0) {
        variants.forEach(v => {
            appendVariantRow('editVariantContainer', v.size, v.stock);
        });
    } else {
        appendVariantRow('editVariantContainer', '', '');
    }
}
function closeEditModal() {

    document
    .getElementById('productEditModal')
    .classList.remove('active');

}

// ==================================================
// CROPPER LOGIC
// ==================================================

let cropper = null;

let currentCropSlotId = null;

let currentCropTarget = 'add';

window.openCropper = function(slotId, target = 'add') {

    const modal =
    document.getElementById('cropModal');

    const imageElement =
    document.getElementById('cropperImage');

    const sourceSlot =
    document.getElementById(`${target}-slot-${slotId}`);

    if (
        !sourceSlot ||
        !sourceSlot.querySelector('.preview-img').src
    ) return;

    currentCropSlotId = slotId;

    currentCropTarget = target;

    imageElement.src =
    sourceSlot.querySelector('.preview-img').src;

    modal.classList.add('active');

    setTimeout(() => {

        if (cropper) cropper.destroy();

        cropper = new Cropper(imageElement, {

            aspectRatio: 1,

            viewMode: 2,

            autoCropArea: 0.9

        });

    }, 200);

};

// ==================================================
// CLOSE CROPPER
// ==================================================

function closeCropperModal() {

    document
    .getElementById('cropModal')
    .classList.remove('active');

    if (cropper) {

        setTimeout(() => {

            cropper.destroy();

            cropper = null;

        }, 300);

    }

}

// ==================================================
// CHANGE ASPECT RATIO
// ==================================================

function setAspectRatio(ratio, e) {

    if (!cropper) return;

    document
    .querySelectorAll('.aspect-btn')
    .forEach(btn => btn.classList.remove('active'));

    e.target.classList.add('active');

    cropper.setAspectRatio(ratio);

}

// ==================================================
// SAVE CROPPED IMAGE
// ==================================================

function saveCrop() {

    if (!cropper || !currentCropSlotId) return;

    const canvas = cropper.getCroppedCanvas({

        width: 800,

        height: 800

    });

    const dataUrl =
    canvas.toDataURL('image/jpeg', 0.9);

    const slot =
    document.getElementById(
        `${currentCropTarget}-slot-${currentCropSlotId}`
    );

    if (slot) {

        slot.querySelector('.preview-img').src =
        dataUrl;

    }

    closeCropperModal();

}

// ==================================================
// DYNAMIC VARIANT MANAGEMENT
// ==================================================

function addVariantRow(containerId) {
    appendVariantRow(containerId, '', '');
}

function appendVariantRow(containerId, size = '', stock = '') {
    const container = document.getElementById(containerId);
    const row = document.createElement('div');
    row.className = 'variant-row-sm mb-3';
    row.innerHTML = `
        <div class="d-flex gap-2 align-items-center">
            <div class="flex-1">
                <label class="mini-label">SIZE (US)</label>
                <input type="text" name="sizes" class="premium-input" placeholder="e.g. 10" value="${size}" required>
            </div>
            <div class="flex-1">
                <label class="mini-label">STOCK</label>
                <input type="number" name="stocks" class="premium-input" placeholder="0" min="0" value="${stock}" required>
            </div>
            <button type="button" class="btn-remove-variant" onclick="removeVariantRow(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(row);
}

function removeVariantRow(button) {
    const container = button.closest('.variants-list-sm');
    if (container.children.length > 1) {
        button.closest('.variant-row-sm').remove();
    } else {
        Swal.fire({
            icon: 'info',
            title: 'Minimum 1 variant required',
            background: '#1E1E1E',
            color: '#fff'
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {

    const pills =
    document.querySelectorAll('.filter-pills .pill');

    pills.forEach(pill => {

        pill.addEventListener('click', () => {

            pills.forEach(p =>
                p.classList.remove('active')
            );

            pill.classList.add('active');

        });

    });

});

// ==================================================
// MINIMUM 3 IMAGE VALIDATION
// ==================================================

document
.getElementById('addProductForm')
.addEventListener('submit', function(e){

    const uploadedImages =
    Object.values(addProductImages)
    .filter(img => img !== null);

    if(uploadedImages.length < 3){

        e.preventDefault();

        Swal.fire({

            icon: 'warning',

            title: 'Minimum 3 Images Required',

            text: 'Please upload at least 3 product images.',

            background: '#1E1E1E',

            color: '#fff',

            confirmButtonColor: '#FF5A36'

        });

    }

});
function handleSort(value){

    const url =
    new URL(window.location.href);

    url.searchParams.set('sort', value);

    window.location.href = url.toString();

}
