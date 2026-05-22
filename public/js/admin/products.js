


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
            slot.querySelector('.preview-img').style.display =
            'block';

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
    slot.querySelector('.preview-img').style.display =
   'none';

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
    description,
    brand,
    price,
    category,
    status,
    images,
    variants
) {

    document
    .getElementById('productEditModal')
    .classList.add('active');

    document
    .getElementById('quickEditForm')
    .action = `/admin/edit-product/${id}`;

    document
    .getElementById('editProductName')
    .value = name;

    document
    .getElementById('editProductDescription')
    .value = description;

    document
    .getElementById('editProductBrand')
    .value = brand;

    document
    .getElementById('editProductPrice')
    .value = price;

    document
    .getElementById('editProductCategory')
    .value = category;

    document
    .getElementById('editProductStatus')
    .value = status;


    // =========================
    // SAFE PARSE DATA
    // =========================

    if(typeof images === 'string'){

        images = JSON.parse(images || '[]');

    }
    document.getElementById(
    'existingImagesInput'
).value = JSON.stringify(images);
document.getElementById(
    'replacedIndexesInput'
).value = '[]';

    if(typeof variants === 'string'){

        variants = JSON.parse(variants || '[]');

    }

    // =========================
    // LOAD IMAGES
    // =========================

    const container =
    document.getElementById(
        'editImagesContainer'
    );

    container.innerHTML = '';

    // ALWAYS SHOW 5 SLOTS

    for(let i = 0; i < 5; i++){

       const image =
        images[i] ? images[i] : null;
        container.innerHTML += `

        <div
            class="edit-img-slot ${image ? 'has-image' : 'empty'}"
            id="edit-slot-${i}"
            onclick="document.getElementById('edit-file-${i}').click()"
        >

     ${
    image
    ?

    `<img
        src="/uploads/products/${image}"
        class="preview-img"
    >`

    :

    `
    <img
        class="preview-img"
        style="display:none;"
    >

    <div class="slot-content">

        <i class="fas fa-plus"></i>

    </div>
    `
}

            <div class="edit-img-actions">

                <button
                    type="button"
                    class="mini-btn"
onclick="event.stopPropagation(); openCropper(${i}, 'edit')"
data-slot="${i}"                >
                    <i class="fas fa-crop"></i>
                </button>

                <button
                    type="button"
                    class="mini-btn remove"
                    onclick="event.stopPropagation(); removeEditImage(${i})"
                >
                    <i class="fas fa-trash"></i>
                </button>

            </div>

            <input
                type="file"
                name="productImage"
                id="edit-file-${i}"
                hidden
                accept="image/*"
                onchange="handleEditImage(event, ${i})"
            >

        </div>

        `;

    }

    // =========================
    // LOAD VARIANTS
    // =========================

    const varContainer =
    document.getElementById(
        'editVariantContainer'
    );

    varContainer.innerHTML = '';

    if(variants && variants.length > 0){

        variants.forEach(v => {

            appendVariantRow(
                'editVariantContainer',
                v.size,
                v.stock
            );

        });

    }

    else {

        appendVariantRow(
            'editVariantContainer',
            '',
            ''
        );

    }

}
function closeEditModal() {

    document
    .getElementById('productEditModal')
    .classList.remove('active');

}
function handleEditImage(event, index){

    const file = event.target.files[0];
    let replacedIndexes = JSON.parse(
    document.getElementById(
        'replacedIndexesInput'
    ).value || '[]'
);


if(!replacedIndexes.includes(index)){

    replacedIndexes.push(index);

}

document.getElementById(
    'replacedIndexesInput'
).value =
JSON.stringify(replacedIndexes);

    if(file && file.type.startsWith('image/')){

        const reader = new FileReader();
  



        reader.onload = function(e){

            const slot =
            document.getElementById(
                `edit-slot-${index}`
            );

            

const previewImg =
slot.querySelector('.preview-img');

previewImg.src = e.target.result;

previewImg.style.display = 'block';

const slotContent =
slot.querySelector('.slot-content');

if(slotContent){

    slotContent.remove();

}

            slot.classList.remove('empty');

            slot.classList.add('has-image');

        };

        reader.readAsDataURL(file);

    }
}
   function removeEditImage(index){

    const slot =
    document.getElementById(
        `edit-slot-${index}`
    );

    // REMOVE FILE INPUT VALUE

    const input =
    document.getElementById(
        `edit-file-${index}`
    );

    if(input){

        input.value = '';

    }

    // REMOVE FROM HIDDEN ARRAY

    let existingImages = JSON.parse(

        document.getElementById(
            'existingImagesInput'
        ).value || '[]'

    );

    existingImages[index] = null;

    document.getElementById(
        'existingImagesInput'
    ).value =
    JSON.stringify(existingImages);

    // RESET SLOT

    slot.classList.remove('has-image');

    slot.classList.add('empty');

    slot.innerHTML = `

        <img
    class="preview-img"
    style="display:none;"
>

<div class="slot-content">

    <i class="fas fa-plus"></i>

</div>

<div class="edit-img-actions">

    <button
        type="button"
        class="mini-btn"
        onclick="event.stopPropagation(); openCropper(${index}, 'edit')"
    >
        <i class="fas fa-crop"></i>
    </button>

    <button
        type="button"
        class="mini-btn remove"
        onclick="event.stopPropagation(); removeEditImage(${index})"
    >
        <i class="fas fa-trash"></i>
    </button>

</div>

<input
    type="file"
    name="productImage"
    id="edit-file-${index}"
    hidden
    accept="image/*"
    onchange="handleEditImage(event, ${index})"
>

    `;

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

function saveCrop(){

    if(!cropper || currentCropSlotId === null) return;

    const canvas = cropper.getCroppedCanvas({

        width: 800,

        height: 800,

        imageSmoothingEnabled: true,

        imageSmoothingQuality: 'high'

    });

    canvas.toBlob((blob) => {

        const croppedFile = new File(

            [blob],

            `cropped-${Date.now()}.jpg`,

            {

                type: 'image/jpeg',

                lastModified: Date.now()

            }

        );

        const dataTransfer = new DataTransfer();

        dataTransfer.items.add(croppedFile);

        let input;

        if(currentCropTarget === 'add'){

            input =
            document.getElementById(
                `add-file-${currentCropSlotId}`
            );

        } else {

            input =
            document.getElementById(
                `edit-file-${currentCropSlotId}`
            );

        }

        input.files = dataTransfer.files;

        const dataUrl =
        canvas.toDataURL('image/jpeg', 0.9);

        let slot;

        if(currentCropTarget === 'add'){

            slot =
            document.getElementById(
                `add-slot-${currentCropSlotId}`
            );

        } else {

            slot =
            document.getElementById(
                `edit-slot-${currentCropSlotId}`
            );

        }

        const previewImage =
slot.querySelector('.preview-img');

if(previewImage){

    previewImage.src = dataUrl;

}

        closeCropperModal();

    }, 'image/jpeg', 0.9);

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
// ==========================================
// SWEET ALERT DELETE
// ==========================================

function confirmDelete(event, url){

    event.preventDefault();

    Swal.fire({

        title: 'Move product to trash?',

        text: 'You can restore it later from trash.',

        icon: 'warning',

        showCancelButton: true,

        confirmButtonColor: '#ff6b3d',

        cancelButtonColor: '#2a2a2a',

        confirmButtonText: 'Yes, Move',

        background: '#161616',

        color: '#ffffff'

    }).then((result) => {

        if(result.isConfirmed){

            window.location.href = url;

        }

    });

}
function confirmRestore(event, url){

    event.preventDefault();

    Swal.fire({

        title: 'Restore product?',

        icon: 'question',

        showCancelButton: true,

        confirmButtonColor: '#ff6b3d',

        cancelButtonColor: '#2a2a2a',

        confirmButtonText: 'Restore',

        background: '#161616',

        color: '#ffffff'

    }).then((result) => {

        if(result.isConfirmed){

            window.location.href = url;

        }

    });

}
function confirmPermanentDelete(event, url){

    event.preventDefault();

    Swal.fire({

        title: 'Delete permanently?',

        text: 'This action cannot be undone.',

        icon: 'error',

        showCancelButton: true,

        confirmButtonColor: '#ff3b30',

        cancelButtonColor: '#2a2a2a',

        confirmButtonText: 'Delete Forever',

        background: '#161616',

        color: '#ffffff'

    }).then((result) => {

        if(result.isConfirmed){

            window.location.href = url;

        }

    });

}
