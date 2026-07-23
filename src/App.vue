<template>
  <div class="container">
    <h1>数 独</h1>
    <p class="subtitle">— 逻辑 · 专注 · 挑战 —</p>
  </div>
</template>

<script setup>
</script>

<style scoped>
.container {
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 28px;
  padding: 24px 28px 28px;
  box-shadow:
    0 25px 80px rgba(0,0,0,.35),
    0 4px 16px rgba(0,0,0,.15);
  border: 1px solid rgba(255,255,255,.08);
  text-align: center;
}

h1 {
  color: #1e293b;
  font-size: 1.7rem;
  font-weight: 800;
  letter-spacing: 5px;
  margin-bottom: 1px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  margin-bottom: 14px;
}
</style>
