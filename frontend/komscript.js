// Funkcja do odczytywania wartości ciasteczka
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Funkcja do wyświetlania nazwy filmu
function displayMovieTitle() {
    const movieTitle = decodeURIComponent(getCookie('movieTitle'));
    if (movieTitle) {
        document.getElementById('filmTitle').textContent = movieTitle;
    } else {
        document.getElementById('filmTitle').textContent = 'Brak nazwy filmu w ciasteczkach.';
    }
}

function displayMovieComments() {
    const movieTitle = decodeURIComponent(getCookie('movieTitle'));
    if (!movieTitle) return;

    fetch('http://localhost:3000/comments')
        .then(response => response.json())
        .then(data => {
            const filteredComments = data.filter(comment => comment.film === movieTitle);
            const commentsList = document.getElementById('commentsList');
            commentsList.innerHTML = ''; // Wyczyść listę komentarzy

            filteredComments.forEach(comment => {
                const commentContainer = document.createElement('div');
                commentContainer.classList.add('comment-container');

                const commentHeader = document.createElement('div');
                commentHeader.classList.add('comment-header');

                const commentAuthor = document.createElement('div');
                commentAuthor.classList.add('comment-author');
                commentAuthor.textContent = comment.author;

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Usuń';
                deleteButton.classList.add('delete-button');
                deleteButton.addEventListener('click', () => {
                    console.log(`Próba usunięcia komentarza o ID: ${comment.id}`);
                    fetch(`http://localhost:3000/comments/${comment.id}`, {
                        method: 'DELETE'
                    })
                    .then(response => {
                        console.log('Response status:', response.status);
                        if (response.ok) {
                            alert('Komentarz został usunięty!');
                            displayMovieComments(); // Odśwież listę komentarzy
                        } else {
                            alert('Nie udało się usunąć komentarza.');
                            response.text().then(text => console.error('Response not ok:', response, text)); // Logowanie szczegółów błędu
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Wystąpił błąd podczas usuwania komentarza.');
                    });
                });

                commentHeader.appendChild(commentAuthor);
                commentHeader.appendChild(deleteButton);

                const commentContent = document.createElement('div');
                commentContent.classList.add('comment-content');
                commentContent.textContent = comment.content;

                commentContainer.appendChild(commentHeader);
                commentContainer.appendChild(commentContent);

                commentsList.appendChild(commentContainer);
            });
        })
        .catch(error => console.error('Error:', error));
}

// Funkcja do dodawania nowego komentarza
function addComment(event) {
    event.preventDefault();

    const movieTitle = decodeURIComponent(getCookie('movieTitle'));
    const author = document.getElementById('author').value;
    const content = document.getElementById('content').value;

    const newComment = {
        // Użyjemy prostego mechanizmu losowych liczb do generowania unikalnych identyfikatorów
        id: Date.now().toString(),
        film: movieTitle,
        content: content,
        author: author
    };

    fetch('http://localhost:3000/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newComment)
    })
    .then(response => response.json())
    .then(data => {
        alert('Dodano komentarz!');
        displayMovieComments(); // Odśwież listę komentarzy
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Nie dodano komentarza.');
    });
}



// Wywołaj funkcje po załadowaniu strony
window.onload = function() {
    displayMovieTitle();
    displayMovieComments();

    // Dodanie nasłuchiwania na formularz dodawania komentarzy
    document.getElementById('commentForm').addEventListener('submit', addComment);
};

