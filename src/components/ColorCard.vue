<template>
  <div class="color-card" :style="{ background: color }" @click="onCardClick" role="button" :aria-label="formatted">
    <div class="info">
      <div class="hex" :title="formatted">{{ formatted }}</div>
      <div class="actions">
        <button class="btn copy" @click.stop="copy" title="Копировать">Copy</button>
        <button class="btn pin" @click.stop="togglePin" :aria-pressed="pinned" :title="pinned ? 'Открепить' : 'Закрепить'">
          {{ pinned ? 'Unpin' : 'Pin' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { hexToRgbString } from '../utils/colors'

export default {
  name: 'ColorCard',
  props: {
    color: { type: String, required: true },
    format: { type: String, default: 'HEX' },
    pinned: { type: Boolean, default: false }
  },
  emits: ['copy', 'toggle-pin', 'card-click'],
  setup(props, { emit }) {
    const formatted = computed(() =>
      props.format === 'HEX' ? props.color : hexToRgbString(props.color)
    )

    function copy() {
      const textToCopy = props.format === 'HEX' ? props.color : hexToRgbString(props.color)
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(textToCopy)
          .then(() => emit('copy', textToCopy))
          .catch(() => emit('copy', textToCopy))
      } else {
        emit('copy', textToCopy)
      }
    }
    function togglePin() { emit('toggle-pin') }
    function onCardClick() { emit('card-click') }

    return { formatted, copy, togglePin, onCardClick }
  }
}
</script>

<style scoped>
.color-card{
  width: 200px;
  height: 140px;
  border-radius: 12px;
  position:relative;
  overflow:hidden;
  cursor:pointer;
  transition: transform .18s ease, box-shadow .18s ease;
  display:flex;
  align-items:flex-end;
  justify-content:flex-start;
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 10px 26px rgba(15,23,42,0.06);
}
.color-card:hover{ transform: translateY(-6px) scale(1.01); box-shadow: 0 24px 46px rgba(15,23,42,0.10); }

.info{
  width:100%;
  padding:6px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:6px;
  background: linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.28));
}
.hex{
  font-weight:700;
  font-size:13px;
  padding:6px 8px;
  border-radius:8px;
  background: rgba(0,0,0,0.36);
  color:#fff;
  box-shadow: inset 0 -1px 0 rgba(0,0,0,0.12);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}
.actions{
  display:flex;
  gap:8px;
  align-items:center;
  flex-shrink: 0;
}

.btn{
  font-weight:700;
  font-size:12px;
  padding:6px 8px;
  border-radius:8px;
  border:none;
  cursor:pointer;
  transition: transform .12s ease, opacity .12s;
  white-space: nowrap;
  min-width: 44px;
  text-align: center;
}
.btn:active{ transform: translateY(1px) }
.copy{ 
  background: rgba(255,255,255,0.95); 
  color:#071033; 
  box-shadow: 0 6px 12px rgba(15,23,42,0.06); 
}
.pin{ 
  background: rgba(255,255,255,0.36); 
  color:#071033; 
  border:1px solid rgba(15,23,42,0.03); 
}

@media (max-width:720px){
  .color-card{
    width:48%;
    height:110px
  }
  .hex{
    max-width: 60px;
    font-size: 11px;
  }
  .btn{
    font-size: 11px;
    padding: 4px 6px;
    min-width: 40px;
  }
}

@media (max-width:480px){
  .color-card{
    width: 100%;
    height: 100px;
  }
  .hex{
    max-width: 70px;
  }
}
</style>