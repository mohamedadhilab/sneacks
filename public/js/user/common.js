/**
 * SNEACKS Common User JavaScript
 */

function confirmLogout() {
  Swal.fire({
    title: 'Logout?',
    text: 'You will need to login again.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#556B2F',
    cancelButtonColor: '#A89F91',
    confirmButtonText: 'Yes, Logout',
    cancelButtonText: 'Stay Here',
    reverseButtons: true,
    background: '#F6F1E9',
    color: '#2B2B2B'
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = '/logout';
    }
  });
}
