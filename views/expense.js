const expense=document.getElementById('expense');

expense.addEventListener('submit',async(e)=>{
    e.preventDefault();
    const amount=document.getElementById('amount');
    const description=document.getElementById('description');
    const category=document.getElementById('category');

    const expensedetails={
        amount:amount.value,
        description:description.value,
        category:category.value
    }
    try{

       /* let res=*/await axios.post(`http://localhost:4000/expense/addexpense`,expensedetails,{
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        });

        let res=await fetchExpensesFromBackend(1);
        showuserexpense(res.data.expenses);
        amount.value='';
        description.value='';
        category.value='';

    }catch(err){
        if(err.response.status===501){

            amount.value="";
            console.log(err)
        }
       else{
        console.log(err);
       } 
    }
})

//*******/
async function fetchExpensesFromBackend(pageNo) {
    console.log(pageNo)
    try {
        let rows = localStorage.getItem('rows');
        if(!rows) {
            rows = 5;
        }

        const response = await axios.get(`http://localhost:4000/expense/getexpense/?page=${pageNo}`, {
            headers: {
                'Authorization': localStorage.getItem('token'),
                'rows': rows
            }
        });

       
        return response;

    } catch (error) {
        console.log(error);
    }
}

//*******/

document.addEventListener("DOMContentLoaded", async () => {
    try {

       /* let response2 = await axios.get("http://localhost:4000/expense/getexpense",{
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        });*/
        let response2=await fetchExpensesFromBackend(1);
        let response = response2.data.expenses;
        // let length = response.length;
        // for (var i = 0; i < length; i++) {
            showuserexpense(response);
       // }
       
        addPagination(response2.data);
    }
    catch (err) {
        console.log(err);
    }
    checkforpremium();
})

function showuserexpense(user) {
    let item = document.getElementById('expense-items');
    item.innerHTML='';
    for(let i=0;i<user.length;i++){
        let amount=user[i].amount;
        let id=user[i].id;
    let fin = user[i].amount + "-" + user[i].description+"-"+user[i].category;
  //  let li = document.createElement('li');
   // li.appendChild(document.createTextNode(fin));
    // let deleteBtn = document.createElement('button');
    // deleteBtn.className = "btn btn-danger btn-sm float-right delete";
    // deleteBtn.textContent = 'Delete Expense';
   // li.appendChild(deleteBtn);
   // item.appendChild(li);
   item.innerHTML+=`<li id='${user[i].id}' value='${user[i].amount}'>${fin}<button class="delete">Delete Expense</button></li> `
    // let deleteBtn=document.querySelector('.delete');
    // deleteBtn.onclick=removeItem;
}
}
let item = document.getElementById('expense-items');
item.addEventListener('click',removeItem);

async function removeItem(e){
    // e.preventDefault();
    if(e.target.classList.contains('delete')){
    let id=e.target.parentElement.id;
    let amount=e.target.parentElement.value;

    await axios.delete(`http://localhost:4000/expense/deleteexpense/${id}/${amount}`,{
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        });
        let item = document.getElementById('expense-items');
    item.removeChild(document.getElementById(`${id}`));
    }
    // window.location.reload();
}
document.getElementById('razorbutton').onclick= async(e)=>{
    try{

        let response = await axios.post(`http://localhost:4000/user/purchasepremium`, {}, {
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        });
        var options = {
            "key": response.data.key_id, // Enter the Key ID generated from the Dashboard
            // "name": "Test Company",
            "order_id": response.data.order.id, // For one time payment
            // "prefill": {
            //     "name": "Test User",
            //     "email": "test.user@example.com",
            //     "contact": "7003442036"
            //     },
            // "theme": {
            //     "color": "#3399cc"
            //     },
            // This handler function will handle the success payment
            "handler": async function (response) {
                console.log(response);
                try{
              await  axios.post(`http://localhost:4000/user/purchasepremium/update-transaction-status`,
                    {
                        order_id: options.order_id,
                        payment_id: response.razorpay_payment_id,
                    }, 
                    {   
                        headers: {"Authorization" : localStorage.getItem('token')} 
                    })
                    
                        alert('You are a Premium User Now');
                        checkforpremium();
                 } catch(err)  {
                        alert('Something went wrong. Try Again!!!');
                    }
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();
        e.preventDefault();

        rzp.on('payment.failed', function (response){
            console.log(response);
    
            alert(response.error.code);
            alert(response.error.description);
            alert(response.error.source);
            alert(response.error.step);
            alert(response.error.reason);
            alert(response.error.metadata.order_id);
            alert(response.error.metadata.payment_id);
        });
        
    }catch(err){
        console.log(err);
    }

}

   


async function checkforpremium(){
        try{
    let res=await axios.get("http://localhost:4000/user/checkmembership",{
        headers: {
            'Authorization': localStorage.getItem('token')
        }
    });
    if(res.status===200){
        document.getElementById('razorbutton').style.display="none";
        document.getElementById('primeuser').innerHTML="You are Prime User!";
        document.getElementById("leaderboard_btn").style.display="block";
        document.getElementById("download_btn").style.display="block";
    }
    else if(res.status===202){
        document.getElementById('primeuser').innerHTML='';
    }
}catch(err){
    console.log(err);
    alert("something error occured");
    }
}
    

let leaderboard_btn=document.getElementById("leaderboard_btn");
    
    leaderboard_btn.onclick=async function addLeaderboard() {
    try {
        document.getElementById('leaderboard-div').style.display = "block";
        const response = await axios.get(`http://localhost:4000/expense/get-leaderboard`, {
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        });
        
        const leaderboard = document.getElementById('leaderboard');
       
        leaderboard.innerHTML = '';
        console.log(response.data);
        response.data.forEach(user => {
        
    
            leaderboard.innerHTML+=`
                <li id="${user.id}">${user.name}-${user.totalExpense}<button>View Details</button></li>
            `;
        });
    } catch (error) {
        console.log('hello',error);
    }
}


   async function download(){
    try{
   let response=await axios.get(`http://localhost:4000/expense/download`, 
        { 
            headers: {"Authorization" : localStorage.getItem('token')} 
        }
    )
    
     if(response.status === 201){
            //the bcakend is essentially sending a download link
            //  which if we open in browser, the file would download
            var a = document.createElement("a");
            a.href = response.data.fileUrl;
            a.download = 'myexpense.csv';
            a.click();
        } else {
            throw new Error(response.data.message)
        }

    
}catch(err)  {
        logErrorToUser(err);  
    };
}


//********/

function addPagination(response) {
    const paginationDiv = document.querySelector('.pagination');
    paginationDiv.innerHTML = '';

    // if(response.previousPage!==1 && response.currentPage!==1){
    //     paginationDiv.innerHTML += `
    //         <button>${1}</button>
    //     `;
    //     paginationDiv.innerHTML += '<<';
    // }

    if(response.hasPreviousPage) {
        paginationDiv.innerHTML += `
            <button>${response.previousPage}</button>
        `;
    }

    paginationDiv.innerHTML += `
        <button class="active">${response.currentPage}</button>
    `;

    if(response.hasNextPage) {
        paginationDiv.innerHTML += `
            <button>${response.nextPage}</button>
        `;
    }

    // if(response.currentPage !== response.lastPage && response.nextPage!==response.lastPage) {
    //     paginationDiv.innerHTML += '>>';
    //     paginationDiv.innerHTML += `
    //         <button>${response.lastPage}</button>
    //     `;
    // }
}

//*******/


document.querySelector('.pagination').onclick = async (e) => {
    e.preventDefault();

    const page = Number(e.target.innerHTML);

    const response = await fetchExpensesFromBackend(page);
    console.log(response);
    
    const expenses = response.data.expenses;

    showuserexpense(expenses);

    addPagination(response.data);
}

document.getElementById('row-selector').onchange = (e) => {
    
    e.preventDefault();
    
    localStorage.setItem('rows', e.target.value);

    window.location.reload();
}

//********/