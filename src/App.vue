<template>
  <div id="app">
    <header class="app-header">
      <div>
        <h1>Генератор цветовых палитр</h1>
        <div class="subtitle">Vue 3 • Практика 27–28</div>
      </div>
      <nav class="nav">
        <router-link to="/">Генератор</router-link>
        <router-link to="/saved">Сохранённые</router-link>
      </nav>
    </header>

    <main class="main section">
      <router-view />
    </main>
  </div>
</template>

<script>
export default { name: 'App' }
</script>