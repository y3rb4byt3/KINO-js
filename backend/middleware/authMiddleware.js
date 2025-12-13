const jwt = require('jsonwebtoken');
const JWT_SECRET = 'TWOJ_SUPER_TAJNY_KLUCZ_KINO_XYZ'; 

// Implementacja ze slajdu 17 
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (token == null) return res.sendStatus(401); // Brak tokena

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Token nieprawidłowy lub wygasł
        req.user = user; // Zapisujemy dane użytkownika z tokena do req
        next(); // Przechodzimy dalej
    });
}

// Implementacja ze slajdu 28 
function requireRole(role) {
    return (req, res, next) => {
        // Najpierw musi zadziałać authenticateToken, żeby req.user istniał
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ error: `Wymagana rola: ${role}` });
        }
        next();
    }
}

module.exports = { authenticateToken, requireRole };