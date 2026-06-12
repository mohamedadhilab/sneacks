async function approveReturn(orderId,itemId){


const confirm =
await Swal.fire({

title:'Approve Return?',

text:'Product stock will be restored',

icon:'question',

showCancelButton:true,

confirmButtonColor:'#ff6b35',

confirmButtonText:'Approve'

});


if(!confirm.isConfirmed){

return;

}



const response =
await fetch(

`/admin/approve-return/${orderId}/${itemId}`,

{

method:'PATCH'

}

);



const data =
await response.json();



if(data.success){


Swal.fire({

icon:'success',

title:'Return Approved',

timer:1500,

showConfirmButton:false


})
.then(()=>{

location.reload();

});


}else{


Swal.fire({

icon:'error',

title:'Failed'

});


}



}

async function rejectReturn(orderId,itemId){


const confirm =
await Swal.fire({

title:'Reject Return?',

text:'Customer return request will be rejected',

icon:'warning',

showCancelButton:true,

confirmButtonText:'Reject',

confirmButtonColor:'#e74c3c'

});



if(!confirm.isConfirmed){

return;

}



const response =
await fetch(

`/admin/reject-return/${orderId}/${itemId}`,

{

method:'PATCH'

}

);



const data =
await response.json();



if(data.success){


Swal.fire({

icon:'success',

title:'Rejected',

text:data.message,

timer:1500,

showConfirmButton:false

})
.then(()=>{


location.reload();


});


}else{


Swal.fire({

icon:'error',

title:'Failed'

});


}


}