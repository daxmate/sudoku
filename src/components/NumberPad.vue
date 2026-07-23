<template>
  <div class="num-grid">
    <button v-for="n in 9" :key="n">
      {{ n }}
    </button>
  </div>
</template>

<style scoped>
.num-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.num-grid button {
  width: 100%;
  aspect-ratio: 1;
  border: none;
  border-radius: 6px;
  background: var(--color-numpad-bg);
  color: var(--color-numpad-text);
  font-size: 1.3rem;
  font-weight: 400;
  cursor: pointer;
  transition: all .12s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,.06);
  font-family: 'Inter', sans-serif;
}

.num-grid button:hover {
  background: var(--color-numpad-hover-bg);
  color: var(--color-numpad-hover-text);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(99,102,241,.2);
}

.num-grid button:active {
  transform: translateY(0);
}
</style>
