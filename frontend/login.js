const API_URL = 'http://localhost:3000/api';

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(err.error) });
        return response.json();
    })
    .then(data => {
        // Zapisujemy usera (z ID) do localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('Zalogowano pomyślnie!');
        window.location.href = 'index.html';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Błąd logowania: ' + error.message);
    });
});

document.getElementById('registerButton').addEventListener('click', function() {
    window.location.href = 'register.html';
});