<template>
  <div class="saved section">
    <h2>Сохранённые палитры</h2>
    <div v-if="saved.length === 0" class="empty small-muted">Пока нет сохранённых палитр.</div>
    <div class="saved-grid">
      <div v-for="p in saved" :key="p.id" class="saved-card">
        <div class="preview" :style="{ background: toGradient(p.colors) }"></div>
        <div class="meta">
          <h3 class="name">{{ p.name }}</h3>
          <div class="colors">
            <span v-for="c in p.colors" :key="c" class="dot" :style="{ background: c }" :title="c"></span>
          </div>
          <div class="buttons">
            <button @click="load(p)" class="btn">Загрузить</button>
            <button @click="remove(p.id)" class="btn ghost">Удалить</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
const STORAGE_KEY = 'palettes_v1'
export default {
  name: 'SavedPalettesView',
  setup() {
    const saved = ref([])
    
    function loadSaved() {
      const raw = localStorage.getItem(STORAGE_KEY)
      saved.value = raw ? JSON.parse(raw) : []
    }
    
    onMounted(()=> {
      loadSaved()
    })
    
    const toGradient = (colors) => `linear-gradient(90deg, ${colors.join(',')})`
    
    const remove = (id) => {
      saved.value = saved.value.filter(p=>p.id!==id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved.value))
    }
    
    const load = (p) => {
      window.dispatchEvent(new CustomEvent('load-palette', { detail: p }))
      alert('Палитра "' + p.name + '" загружена в генератор!')
    }
    
    return { saved, remove, toGradient, load }
  }
}
</script>

<style scoped>
.saved-grid{
  display:flex;
  flex-direction:column;
  gap:12px
}
.saved-card{
  display:flex;
  border:1px solid rgba(15,23,42,0.04);
  border-radius:10px;
  overflow:hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.saved-card:hover{
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(15,23,42,0.08);
}
.preview{
  width:140px;
  height:100px;
  flex-shrink: 0;
}
.meta{
  padding:12px;
  flex:1;
  display:flex;
  flex-direction:column;
  gap:8px
}
.name{
  margin:0;
  font-size:16px;
  font-weight: 600;
}
.colors{
  display:flex;
  gap:6px;
  flex-wrap: wrap;
}
.dot{
  width:22px;
  height:22px;
  border-radius:4px;
  border:1px solid rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.2s ease;
}
.dot:hover{
  transform: scale(1.1);
}
.buttons{
  display:flex;
  gap:8px;
  margin-top: auto;
}
.btn{
  padding:8px 10px;
  border-radius:8px;
  border:none;
  cursor:pointer;
  font-weight:700;
  font-size: 13px;
  transition: all 0.2s ease;
}
.btn:hover{
  opacity: 0.9;
}
.btn.ghost{
  background:transparent;
  border:1px solid rgba(15,23,42,0.1);
}
.btn.ghost:hover{
  background: rgba(15,23,42,0.05);
}
.empty{
  padding:20px;
  color:var(--muted);
  text-align: center;
}

@media (max-width: 600px) {
  .saved-card{
    flex-direction: column;
  }
  .preview{
    width: 100%;
    height: 80px;
  }
}
</style>