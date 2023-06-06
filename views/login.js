let login=document.getElementById('login');

const email = document.getElementById('email');
const password = document.getElementById('password');
// const forgotBtn = document.getElementById('fgt-btn');

login.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const res = await axios.post(`http://localhost:4000/user/login`, 
            {
                email: email.value, 
                password: password.value
            }
        );
        console.log('LOGIN RESPONSE: ', res);
        if(res.status === 200) {
            //clearError();
            email.value = '';
            password.value = '';
            confirm('User logged in successfully!');
            
            localStorage.setItem('token', res.data.token);
    
            window.location.href = 'expense.html';
        }
        
    } catch (error) {
        console.log(error);
        if(error.response.status === 401) {
           // alert('Password is incorrect!');
            logErrorToUser(error);
        }
        if(error.response.status === 400) {
            // alert('Password is incorrect!');
            logErrorToUser(error);
        }
        if(error.response.status === 404) {
            // alert('Password is incorrect!');
           logErrorToUser(error);
        }
        if(error.response.status === 500) {
           // alert('Password is incorrect!');
            logErrorToUser(error);
        }
        if(error.response.status === 501) {
          //  alert('Password is incorrect!');
            logErrorToUser(error);
        }
        if(error.response.status === 502) {
           alert('502 error');
            // logErrorToUser(error);
        }
    }
});

function logErrorToUser(error) {
    const err = document.getElementById('login-error');
    err.innerHTML = error.response.data.message;
};

// function clearError() {
//     const err = document.getElementById('error-text');
//     err.innerHTML = '';
// };

// forgotBtn.onclick = async (e) => {
//      window.location.href = 'forgot.html';
//     }