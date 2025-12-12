<script setup>
// Nie potrzebujemy tu skomplikowanej logiki, to tylko widok
</script>

<template>
  <div class="pricing-page">
    <div class="content-container">
      
      <div class="page-header">
        <h1>Cennik Biletów</h1>
        <p>Wybierz najlepszą opcję dla siebie i ciesz się seansem</p>
      </div>

      <div class="pricing-grid">
        
        <div class="pricing-card">
          <div class="card-header">
            <h2>Filmy 2D</h2>
            <span class="icon">🎬</span>
          </div>
          <div class="card-body">
            <table>
              <tbody>
                <tr>
                  <td>Normalny</td>
                  <td class="price">30 PLN</td>
                </tr>
                <tr>
                  <td>Ulgowy</td>
                  <td class="price">25 PLN</td>
                </tr>
                <tr>
                  <td>Senior</td>
                  <td class="price">22 PLN</td>
                </tr>
                <tr>
                  <td>Rodzinny (min. 3 os.)</td>
                  <td class="price">20 PLN <span class="small">/os.</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="pricing-card highlight">
          <div class="card-header">
            <h2>Filmy 3D</h2>
            <span class="icon">👓</span>
          </div>
          <div class="card-body">
            <table>
              <tbody>
                <tr>
                  <td>Normalny 3D</td>
                  <td class="price">35 PLN</td>
                </tr>
                <tr>
                  <td>Ulgowy 3D</td>
                  <td class="price">30 PLN</td>
                </tr>
                <tr>
                  <td>Okulary 3D</td>
                  <td class="price">5 PLN</td>
                </tr>
                <tr>
                  <td>Maratony Filmowe</td>
                  <td class="price">50 PLN</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="promo-card">
        <div class="promo-content">
          <h3>🔥 Super Wtorki</h3>
          <p>W każdy wtorek wszystkie bilety na filmy 2D i 3D w super cenie!</p>
        </div>
        <div class="promo-price">
            Tylko <span>19 PLN</span>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Kontener strony */
.pricing-page {
  /* Dzięki temu strona wypełnia widok, ale ma marginesy */
  padding: 40px 20px;
  min-height: 80vh;
}

.content-container {
  max-width: 1100px;
  margin: 0 auto;
}

/* Nagłówek strony */
.page-header {
  text-align: center;
  margin-bottom: 50px;
}

.page-header h1 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 10px;
  background: linear-gradient(to right, #ffffff, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-header p {
  color: #94a3b8;
  font-size: 16px;
}

/* Siatka kart (Grid) */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

/* Pojedyncza Karta */
.pricing-card {
  background-color: #1e293b; /* Slate 800 */
  border: 1px solid #334155;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.pricing-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  border-color: #475569;
}

/* Wyróżniona karta (np. 3D) */
.pricing-card.highlight {
  background: linear-gradient(to bottom right, #1e293b, #0f172a);
  border-color: #dc2626; /* Czerwona ramka */
  box-shadow: 0 0 15px rgba(220, 38, 38, 0.15);
}

/* Nagłówek Karty */
.card-header {
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid #334155;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  color: #fbbf24; /* Amber 400 - Złoty */
}

.card-header .icon {
  font-size: 24px;
}

/* Treść karty (Tabela) */
.card-body {
  padding: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

td {
  padding: 12px 0;
  color: #cbd5e1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 15px;
}

tr:last-child td {
  border-bottom: none;
}

.price {
  text-align: right;
  font-weight: 700;
  color: white;
  font-size: 16px;
}

.price .small {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 400;
}

/* Karta Promocji (Banner na dole) */
.promo-card {
  background: linear-gradient(to right, #dc2626, #991b1b);
  border-radius: 16px;
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3);
  flex-wrap: wrap;
  gap: 20px;
}

.promo-content h3 {
  margin: 0 0 5px 0;
  font-size: 24px;
  font-weight: 700;
}

.promo-content p {
  margin: 0;
  opacity: 0.9;
}

.promo-price {
  background-color: rgba(0, 0, 0, 0.2);
  padding: 10px 20px;
  border-radius: 12px;
  text-align: center;
  font-weight: 500;
}

.promo-price span {
  display: block;
  font-size: 28px;
  font-weight: 800;
  color: #fbbf24; /* Złoty */
}

/* Responsywność */
@media (max-width: 600px) {
  .promo-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>