const signup=document.getElementById('signup');

signup.addEventListener('submit',async(e)=>{
    e.preventDefault();
    const name=document.getElementById('name');
    const email=document.getElementById('email');
    const password=document.getElementById('password');
    try{
        let res=await axios.post(`http://localhost:4000/user/signup`, 
        {
            name: name.value, 
            email: email.value, 
            password: password.value
        });
        if(res.status===200){
            name.value='';
            email.value='';
            password.value='';
            document.getElementById('user-exist').innerHTML='new user added';
            window.location.href='login.html';
        }

    }
    catch(err){
        console.log(err.message);
        if(err.response.status===400){
            alert('user already exists!')
        }
        document.getElementById('user-exist').innerHTML=err.message;
    }
})