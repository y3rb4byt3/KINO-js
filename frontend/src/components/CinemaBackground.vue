<template>
  <div class="login-bg">
    <div class="light red"></div>
    <div class="light amber"></div>

    <div class="lines">
      <span class="line red top"></span>
      <span class="line amber middle"></span>
      <span class="line red bottom"></span>
    </div>

    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* Główny kontener tła */
.login-bg {
  min-height: 85vh; /* Dopasowane do wysokości widoku */
  width: 100%;
  position: relative;
  overflow: hidden;
  
  /* Ciemny, głęboki gradient (Slate 950 -> Slate 900) */
  background: linear-gradient(135deg, #020617, #0f172a, #020617);
  
  /* Centrowanie zawartości */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px; /* Opcjonalnie, jeśli chcesz zaokrąglone rogi całego wrappera */
}

/* --- ŚWIATŁA (BLUR) --- */
.light {
  position: absolute;
  width: 24rem;
  height: 24rem;
  border-radius: 50%;
  filter: blur(80px); /* Bardzo mocne rozmycie */
  z-index: 1;
  opacity: 0.6;
}

.light.red {
  top: -10%;
  left: 20%;
  background: rgba(220, 38, 38, 0.2); /* Czerwień */
}

.light.amber {
  bottom: -10%;
  right: 20%;
  background: rgba(245, 158, 11, 0.15); /* Złoty/Bursztynowy */
}

/* --- LINIE --- */
.lines {
  position: absolute;
  inset: 0;
  opacity: 0.1; /* Bardzo delikatne */
  z-index: 1;
  pointer-events: none;
}

.line {
  position: absolute;
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent, currentColor, transparent);
}

.line.red { color: #dc2626; }
.line.amber { color: #f59e0b; }

.line.top { top: 25%; }
.line.middle { top: 50%; }
.line.bottom { top: 75%; }

/* --- KONTENER NA TREŚĆ (SLOT) --- */
.content {
  position: relative;
  z-index: 10; /* Musi być nad światłami */
  width: 100%;
  max-width: 450px;
  padding: 0 1.5rem;
}
</style>