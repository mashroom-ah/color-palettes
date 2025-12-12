<template>
  <div class="panel">
    <div class="row">
      <label>Базовый цвет</label>
      <input type="color" v-model="localBase" />
    </div>

    <div class="row">
      <label>Тип палитры</label>
      <select v-model="localType">
        <option value="random">Случайная</option>
        <option value="analogous">Аналогичная</option>
        <option value="monochrome">Монохромная</option>
        <option value="triad">Триада</option>
        <option value="complementary">Комплементарная</option>
      </select>
    </div>

    <div class="row cols">
      <div>
        <label>Кол-во</label>
        <select v-model.number="localCount">
          <option :value="3">3</option>
          <option :value="5">5</option>
          <option :value="7">7</option>
        </select>
      </div>

      <div>
        <label>Формат</label>
        <select v-model="localFormat">
          <option>HEX</option>
          <option>RGB</option>
        </select>
      </div>
    </div>

    <div class="row">
      <div class="row-actions">
        <button class="btn primary" @click="onRandomClick">Случайная</button>
        <button class="btn" @click="$emit('toggle-bg')">{{ darkBg ? 'Тёмный' : 'Светлый' }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'ControlsPanel',
  props: {
    count: { type: Number, default: 5 },
    format: { type: String, default: 'HEX' },
    baseColor: { type: String, default: '#4e8cff' },
    paletteType: { type: String, default: 'analogous' },
    darkBg: { type: Boolean, default: false }
  },
  emits: ['update:count','update:format','update:baseColor','update:paletteType','toggle-bg','random'],
  setup(props, { emit }){
    const localCount = ref(props.count)
    const localFormat = ref(props.format)
    const localBase = ref(props.baseColor)
    const localType = ref(props.paletteType)

    watch(localCount, v=> emit('update:count', v))
    watch(localFormat, v=> emit('update:format', v))
    watch(localBase, v=> emit('update:baseColor', v))
    watch(localType, v=> emit('update:paletteType', v))

    function randomHex(){
      return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase()
    }

    function onRandomClick(){
      const hex = randomHex()
      // Обновляем локальный input (чтобы он показал новый цвет)
      localBase.value = hex
      // Эмитим событие с новым цветом в payload
      emit('random', hex)
    }

    return { localCount, localFormat, localBase, localType, onRandomClick }
  }
}
</script>

<style scoped>
.panel{
  width:260px;
  display:flex;
  flex-direction:column;
  gap:12px;
  padding:12px;
  border-radius:12px;
  background:linear-gradient(180deg,rgba(255,255,255,0.9),#fff);
  border:1px solid rgba(15,23,42,0.03);
}

.row{
  display:flex;
  flex-direction:column;
}

/* подписи */
.row label{
  font-size:13px;
  color:var(--muted);
  font-weight:600;
  margin-bottom:6px;
  padding:6px;
}

input[type=color]{
  height:44px;
  width:100%;
  border-radius:8px;
  border:1px solid rgba(15,23,42,0.04);
}

.cols select{
  margin-top:4px;
}

select{
  padding:8px;
  border-radius:8px;
  border:1px solid rgba(15,23,42,0.06);
}

/* форма в две колонки */
.cols{
  display:flex;
  gap:12px;
}

.row-actions{
  display:flex;
  gap:8px;
}

.btn{
  padding:8px 12px;
  border-radius:10px;
  border:none;
  background:#f3f4f6;
  font-weight:700;
  cursor:pointer;
}

.btn.primary{
  background:linear-gradient(90deg,var(--accent),var(--accent-2));
  color:white;
  box-shadow:0 8px 20px rgba(78,140,255,0.12);
}
</style>
