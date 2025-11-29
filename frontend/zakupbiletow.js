const API_URL = 'http://localhost:3000/api';
let currentShowtime = null;

// Sprawdzenie autoryzacji
const user = JSON.parse(localStorage.getItem('user'));
if (!user || !user.id) {
    alert("Musisz być zalogowany, aby kupić bilet!");
    window.location.href = 'login.html';
}

const movieId = localStorage.getItem('selectedMovieId');
const movieTitle = localStorage.getItem('selectedMovieTitle');

if (movieTitle) {
    document.getElementById('movieTitle').textContent = movieTitle;
} else {
    window.location.href = 'index.html';
}

// 1. Pobieranie seansów
async function loadShowtimes() {
    try {
        const response = await fetch(`${API_URL}/showtimes?movieId=${movieId}`);
        const showtimes = await response.json();
        
        const container = document.getElementById('showtime-selection-container');
        const seatsContainer = document.querySelector('.seats-container');
        
        container.innerHTML = '<h3>Wybierz godzinę seansu:</h3>';
        
        if (showtimes.length === 0) {
            container.innerHTML += '<p>Przepraszamy, brak zaplanowanych seansów dla tego filmu.</p>';
            seatsContainer.style.display = 'none';
        } else {
            showtimes.forEach(showtime => {
                const btn = document.createElement('button');
                btn.textContent = `${showtime.date} | ${showtime.time} (${showtime.price} PLN)`;
                // Style inline dla prostoty
                btn.style.margin = '5px';
                btn.style.padding = '10px 15px';
                btn.style.cursor = 'pointer';
                btn.style.backgroundColor = '#007bff';
                btn.style.color = 'white';
                btn.style.border = 'none';
                btn.style.borderRadius = '5px';
                
                btn.onclick = () => selectShowtime(showtime, btn);
                container.appendChild(btn);
            });
        }
    } catch (error) {
        console.error("Błąd pobierania seansów:", error);
    }
}

// 2. Wybór godziny i generowanie miejsc
function selectShowtime(showtime, btnElement) {
    currentShowtime = showtime;
    
    // Reset wizualny przycisków
    const allBtns = document.querySelectorAll('#showtime-selection-container button');
    allBtns.forEach(b => b.style.backgroundColor = '#007bff');
    btnElement.style.backgroundColor = '#0056b3';

    const seatsContainer = document.querySelector('.seats-container');
    seatsContainer.innerHTML = '';
    seatsContainer.style.display = 'grid';
    document.getElementById('buyTicketBtn').style.display = 'inline-block';

    // Generowanie siatki A1-J10
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
    rows.forEach(row => {
        for (let i = 1; i <= 10; i++) {
            const seatLabel = `${row}${i}`;
            const isOccupied = showtime.seatsLayout.occupiedSeats.includes(seatLabel);
            
            const seatDiv = document.createElement('div');
            seatDiv.className = 'seat';
            seatDiv.dataset.seat = seatLabel;
            
            // Wnętrze fotela
            seatDiv.innerHTML = `
                <div style="
                    width: 40px; height: 40px; 
                    background: ${isOccupied ? '#c0392b' : '#2ecc71'}; 
                    margin: 2px; display: flex; 
                    align-items: center; justify-content: center;
                    border-radius: 5px; font-size: 12px; color: white; font-weight: bold;
                ">
                   ${seatLabel}
                </div>
            `;

            if (isOccupied) {
                seatDiv.classList.add('occupied');
            } else {
                seatDiv.style.cursor = 'pointer';
                seatDiv.addEventListener('click', function() {
                    this.classList.toggle('selected');
                    const innerDiv = this.querySelector('div');
                    if (this.classList.contains('selected')) {
                        innerDiv.style.backgroundColor = '#f1c40f'; // Wybrany (żółty)
                        innerDiv.style.color = 'black';
                    } else {
                        innerDiv.style.backgroundColor = '#2ecc71'; // Wolny (zielony)
                        innerDiv.style.color = 'white';
                    }
                    updateBuyButtonState();
                });
            }
            seatsContainer.appendChild(seatDiv);
        }
    });
    updateBuyButtonState();
}

function updateBuyButtonState() {
    const selectedSeats = document.querySelectorAll('.seat.selected');
    const buyTicketBtn = document.getElementById('buyTicketBtn');
    
    if (selectedSeats.length > 0) {
        buyTicketBtn.removeAttribute('disabled');
        const totalPrice = selectedSeats.length * currentShowtime.price;
        buyTicketBtn.value = `Zapłać i zarezerwuj (${totalPrice} PLN)`;
    } else {
        buyTicketBtn.setAttribute('disabled', 'disabled');
        buyTicketBtn.value = 'Wybierz miejsca';
    }
}

// 3. Wysyłanie formularza
document.getElementById('reservationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const selectedElements = document.querySelectorAll('.seat.selected');
    const seatsList = Array.from(selectedElements).map(el => el.dataset.seat);
    
    const payload = {
        userId: user.id,
        showtimeId: currentShowtime.id,
        seats: seatsList
    };

    try {
        const response = await fetch(`${API_URL}/reservations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            alert("Sukces! Bilety zostały zarezerwowane.");
            window.location.href = 'index.html';
        } else {
            alert("Błąd rezerwacji: " + (result.error || "Coś poszło nie tak"));
        }
    } catch (err) {
        console.error(err);
        alert("Błąd połączenia z serwerem");
    }
});

// Start
loadShowtimes();