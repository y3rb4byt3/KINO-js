# KINO-js - Cinema Application

Aplikacja webowa symulująca działanie strony internetowego kina. Użytkownicy mogą przeglądać repertuar, filtrować filmy oraz dokonywać rezerwacji miejsc na wybrane seanse.

## Zespół

- **Julia Żukowska** - Lider zespołu, architektura, layout główny
- **Krzysztof Carewicz** - Moduł autoryzacji
- **Mateusz Mąka** - Moduł repertuaru
- **Rafał Ciereszko** - Moduł rezerwacji
- **Maciej Olędzki** - Moduł profilu + Backend

## Backend API Documentation

### Instalacja i uruchomienie

```bash
# Instalacja zależności
npm install

# Uruchomienie serwera (tryb produkcyjny)
npm start

# Uruchomienie serwera z automatycznym przeładowaniem (tryb deweloperski)
npm run dev
```

Serwer będzie dostępny pod adresem: `http://localhost:3000`

## Endpointy API

### Movies (Filmy)

#### GET /api/movies
Pobiera listę wszystkich filmów.

**Query Parameters:**
- `genre` (opcjonalny) - filtruje filmy po gatunku

**Przykład:**
```bash
GET http://localhost:3000/api/movies
GET http://localhost:3000/api/movies?genre=Sci-Fi
```

**Odpowiedź:**
```json
[
  {
    "id": 1,
    "title": "Dune: Part Two",
    "description": "Paul Atreides unites with Chani...",
    "duration": 166,
    "genre": ["Sci-Fi", "Adventure"],
    "director": "Denis Villeneuve",
    "cast": ["Timothée Chalamet", "Zendaya"],
    "posterUrl": "https://...",
    "trailerUrl": "https://...",
    "rating": "PG-13",
    "releaseDate": "2024-03-01"
  }
]
```

#### GET /api/movies/:id
Pobiera szczegóły konkretnego filmu.

**Przykład:**
```bash
GET http://localhost:3000/api/movies/1
```

---

### Showtimes (Seanse)

#### GET /api/showtimes
Pobiera listę wszystkich seansów.

**Query Parameters:**
- `movieId` (opcjonalny) - filtruje seanse po ID filmu
- `date` (opcjonalny) - filtruje seanse po dacie (format: YYYY-MM-DD)

**Przykład:**
```bash
GET http://localhost:3000/api/showtimes
GET http://localhost:3000/api/showtimes?movieId=1
GET http://localhost:3000/api/showtimes?date=2025-11-14
GET http://localhost:3000/api/showtimes?movieId=1&date=2025-11-14
```

**Odpowiedź:**
```json
[
  {
    "id": 1,
    "movieId": 1,
    "date": "2025-11-14",
    "time": "14:00",
    "hall": 1,
    "availableSeats": 95,
    "totalSeats": 100,
    "price": 25.00,
    "seatsLayout": {
      "rows": 10,
      "seatsPerRow": 10,
      "occupiedSeats": ["A1", "A2", "B5"]
    }
  }
]
```

#### GET /api/showtimes/:id
Pobiera szczegóły konkretnego seansu.

#### GET /api/showtimes/movie/:movieId
Pobiera wszystkie seanse dla danego filmu wraz ze szczegółami filmu.

**Przykład:**
```bash
GET http://localhost:3000/api/showtimes/movie/1
```

---

### Users (Użytkownicy)

#### POST /api/users/register
Rejestruje nowego użytkownika.

**Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Jan",
  "lastName": "Kowalski"
}
```

**Odpowiedź (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 3,
    "email": "user@example.com",
    "firstName": "Jan",
    "lastName": "Kowalski",
    "createdAt": "2025-11-14T12:00:00Z"
  }
}
```

**Błędy:**
- `400` - Brakujące pola lub nieprawidłowy email
- `409` - Użytkownik z tym emailem już istnieje

#### POST /api/users/login
Logowanie użytkownika.

**Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Odpowiedź (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "Jan",
    "lastName": "Kowalski",
    "createdAt": "2025-11-01T10:00:00Z"
  }
}
```

**Błędy:**
- `400` - Brakujące email lub hasło
- `401` - Nieprawidłowy email lub hasło

#### GET /api/users/:id
Pobiera dane użytkownika.

---

### Reservations (Rezerwacje)

#### GET /api/reservations
Pobiera listę wszystkich rezerwacji.

**Query Parameters:**
- `userId` (opcjonalny) - filtruje rezerwacje po ID użytkownika

**Przykład:**
```bash
GET http://localhost:3000/api/reservations?userId=1
```

**Odpowiedź:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "showtimeId": 2,
    "seats": ["A1", "A2"],
    "totalPrice": 60.00,
    "status": "confirmed",
    "createdAt": "2025-11-13T14:20:00Z"
  }
]
```

#### GET /api/reservations/:id
Pobiera szczegóły konkretnej rezerwacji.

#### POST /api/reservations
Tworzy nową rezerwację.

**Body (JSON):**
```json
{
  "userId": 1,
  "showtimeId": 1,
  "seats": ["C5", "C6"]
}
```

**Odpowiedź (201 Created):**
```json
{
  "message": "Reservation created successfully",
  "reservation": {
    "id": 3,
    "userId": 1,
    "showtimeId": 1,
    "seats": ["C5", "C6"],
    "totalPrice": 50.00,
    "status": "confirmed",
    "createdAt": "2025-11-14T15:30:00Z"
  }
}
```

**Błędy:**
- `400` - Nieprawidłowe dane wejściowe lub nieprawidłowy format miejsca
- `404` - Nie znaleziono użytkownika lub seansu
- `409` - Wybrane miejsca są już zajęte

**Format miejsc:** Miejsca są oznaczane jako kombinacja litery (A-J) i numeru (1-10), np. "A1", "B5", "J10"

#### DELETE /api/reservations/:id
Anuluje rezerwację i zwalnia miejsca.

**Przykład:**
```bash
DELETE http://localhost:3000/api/reservations/1
```

**Odpowiedź (200 OK):**
```json
{
  "message": "Reservation cancelled successfully",
  "reservation": {
    "id": 1,
    "userId": 1,
    "showtimeId": 2,
    "seats": ["A1", "A2"],
    "totalPrice": 60.00,
    "status": "confirmed"
  }
}
```

---

## Testowanie w Postman

### 1. Konfiguracja środowiska

Utwórz nowe środowisko w Postman:
- Nazwa: `KINO-js Local`
- Zmienna: `base_url` = `http://localhost:3000`

### 2. Przykładowe scenariusze testowe

#### Scenariusz 1: Przeglądanie repertuaru
1. **GET** `{{base_url}}/api/movies` - Pobierz listę filmów
2. **GET** `{{base_url}}/api/movies/1` - Pobierz szczegóły filmu
3. **GET** `{{base_url}}/api/showtimes?movieId=1&date=2025-11-14` - Pobierz seanse dla filmu

#### Scenariusz 2: Rejestracja i logowanie
1. **POST** `{{base_url}}/api/users/register`
   ```json
   {
     "email": "newuser@example.com",
     "password": "test123",
     "firstName": "Anna",
     "lastName": "Nowak"
   }
   ```

2. **POST** `{{base_url}}/api/users/login`
   ```json
   {
     "email": "newuser@example.com",
     "password": "test123"
   }
   ```

#### Scenariusz 3: Rezerwacja miejsc
1. **GET** `{{base_url}}/api/showtimes/1` - Sprawdź dostępność miejsc
2. **POST** `{{base_url}}/api/reservations`
   ```json
   {
     "userId": 1,
     "showtimeId": 1,
     "seats": ["E5", "E6"]
   }
   ```
3. **GET** `{{base_url}}/api/reservations?userId=1` - Sprawdź swoje rezerwacje
4. **GET** `{{base_url}}/api/showtimes/1` - Sprawdź czy miejsca są zajęte

#### Scenariusz 4: Anulowanie rezerwacji
1. **DELETE** `{{base_url}}/api/reservations/3` - Anuluj rezerwację
2. **GET** `{{base_url}}/api/showtimes/1` - Sprawdź czy miejsca zostały zwolnione

### 3. Testowanie błędów

Przetestuj również obsługę błędów:
- Rejestracja z istniejącym emailem (409)
- Logowanie z błędnym hasłem (401)
- Rezerwacja zajętych miejsc (409)
- Rezerwacja nieprawidłowych miejsc, np. "Z99" (400)
- Pobieranie nieistniejącego filmu (404)

---

## Struktura projektu

```
KINO-js/
├── server/
│   ├── data/
│   │   ├── movies.json         # Dane filmów
│   │   ├── showtimes.json      # Dane seansów
│   │   ├── users.json          # Dane użytkowników
│   │   └── reservations.json   # Dane rezerwacji
│   ├── routes/
│   │   ├── movies.js           # Endpointy filmów
│   │   ├── showtimes.js        # Endpointy seansów
│   │   ├── users.js            # Endpointy użytkowników
│   │   └── reservations.js     # Endpointy rezerwacji
│   └── server.js               # Główny plik serwera
├── .env                        # Zmienne środowiskowe
├── .gitignore
├── package.json
└── README.md
```

## Dane testowe

W pliku `server/data/users.json` znajdują się przykładowi użytkownicy:
- Email: `test@example.com`, Hasło: `password123`
- Email: `admin@kino.pl`, Hasło: `admin123`

## Uwagi techniczne

- **Bezpieczeństwo**: W wersji MVP hasła są przechowywane w postaci jawnej. W wersji produkcyjnej należy używać hashowania (np. bcrypt).
- **Baza danych**: Aktualnie dane są przechowywane w plikach JSON. W przyszłości można zintegrować z prawdziwą bazą danych (MongoDB, PostgreSQL).
- **Walidacja**: Podstawowa walidacja jest zaimplementowana. Można ją rozszerzyć o biblioteki jak Joi lub express-validator.
- **Autoryzacja**: Brak tokenów JWT. W następnej iteracji warto dodać proper authentication z tokenami.

## Następne kroki (poza MVP)

1. Dodanie autentykacji JWT
2. Integracja z prawdziwą bazą danych
3. Hashowanie haseł (bcrypt)
4. System płatności
5. Powiadomienia email
6. Panel administracyjny
7. Obsługa zdjęć/plakatów (upload)

---

## Licencja

ISC
