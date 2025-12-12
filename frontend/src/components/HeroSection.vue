<template>
  <section class="hero-section">
    <div class="hero-content">
      <h1>Witaj w <span class="brand-text">kinoVERSE</span></h1>
      <p>Odkryj magię kina w najwyższej jakości. Rezerwuj bilety online.</p>
      <a href="#repertuar" class="cta-button">Sprawdź Repertuar</a>
    </div>
    <div class="hero-gradient"></div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  height: 60vh;
  background-image: url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  padding: 20px;
}

.hero-content h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 10px;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
  color: white;
}

.brand-text { color: #fbbf24; }

.hero-content p {
  font-size: 1.2rem;
  color: #cbd5e1;
  margin-bottom: 30px;
  text-shadow: 0 2px 5px rgba(0,0,0,0.8);
}

.cta-button {
  display: inline-block;
  background: #dc2626;
  color: white;
  padding: 12px 30px;
  border-radius: 50px;
  font-weight: bold;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: transform 0.2s, background 0.2s;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
  text-decoration: none;
}

.cta-button:hover {
  transform: translateY(-3px);
  background: #b91c1c;
}

.hero-gradient {
  position: absolute; bottom: 0; left: 0; width: 100%; height: 150px;
  background: linear-gradient(to top, #020617, transparent);
  z-index: 1;
}

@media (max-width: 768px) {
  .hero-content h1 { font-size: 2.5rem; }
}
</style>