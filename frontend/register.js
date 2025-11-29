const API_URL = 'http://localhost:3000/api';

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    
    if (password !== confirmPassword) {
        alert('Hasła nie są takie same.');
        return;
    }
    
    const newUser = { email, password, firstName, lastName };
    
    fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
    })
    .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(err.error) });
        return response.json();
    })
    .then(data => {
        alert('Rejestracja zakończona sukcesem! Możesz się teraz zalogować.');
        window.location.href = 'login.html';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Błąd rejestracji: ' + error.message);
    });
});