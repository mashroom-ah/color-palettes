<template>
  <section class="generator">
    <div class="controls-row">
      <ControlsPanel
        v-model:count="count"
        v-model:format="format"
        v-model:baseColor="baseColor"
        v-model:paletteType="paletteType"
        :darkBg="darkBg"
        @toggle-bg="darkBg = !darkBg"
        @random="onRandom"
      />
      <div class="actions">
        <button class="btn primary" @click="generate">Сгенерировать</button>
        <button class="btn" @click="savePalette">Сохранить</button>
        <label class="small-muted"><input type="checkbox" v-model="pinMode"> Режим закрепления (клик закрепляет)</label>
      </div>
    </div>

    <div class="preview-area" :class="{ dark: darkBg }">
      <div class="palette-row">
        <ColorCard
          v-for="(c, idx) in displayColors"
          :key="idx"
          :color="c"
          :format="format"
          :pinned="!!pinned[idx]"
          @copy="notifyCopy"
          @toggle-pin="togglePin(idx)"
          @card-click="onColorClick(idx)"
        />
      </div>

      <div class="mockup">
        <h2 :style="{ color: displayColors[0] }">Заголовок — превью</h2>
        <button
          :style="{ background: displayColors[1], color: contrastText(displayColors[1]) }"
          class="mock-btn"
        >
          Кнопка
        </button>
        <div class="card" :style="{ background: displayColors[2], color: contrastText(displayColors[2]) }">
          Карточка
        </div>
      </div>

      <div class="analysis">
        <h3>Анализ контрастности</h3>
        <ul>
          <li v-for="(pair, i) in pairs" :key="i">
            {{ pair.a }} ↔ {{ pair.b }} — ratio: {{ pair.ratio.toFixed(2) }} — {{ pair.level }}
          </li>
        </ul>
      </div>
    </div>

    <div class="footer-actions">
      <label>Формат: {{ format }}</label>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </section>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import ControlsPanel from './ControlsPanel.vue'
import ColorCard from './ColorCard.vue'
import { generateHarmony, contrastRatio, bestContrastText } from '../utils/colors'

const STORAGE_KEY = 'current_palette_v1'

export default {
  name: 'PaletteGenerator',
  components: { ControlsPanel, ColorCard },
  setup() {
    const count = ref(5)
    const format = ref('HEX')
    const baseColor = ref('#4e8cff')
    const paletteType = ref('analogous')
    const darkBg = ref(false)
    const pinMode = ref(false)

    const palette = ref([])
    const pinned = ref({})
    const toast = ref('')

    function notify(msg){ toast.value = msg; setTimeout(()=> toast.value = '', 1400) }

    const displayColors = computed(()=> {
      const out=[]
      for(let i=0;i<count.value;i++) out.push(palette.value[i] ?? baseColor.value)
      return out
    })

    function generate(){
      const newColors = generateHarmony(baseColor.value, paletteType.value, count.value)
      for(let i=0;i<count.value;i++){
        if(pinned.value[i]) newColors[i] = palette.value[i] ?? newColors[i]
      }
      palette.value = newColors
      ensurePinnedLength()
      saveCurrent()
    }

    function onRandom(hex){
      if (typeof hex === 'string' && hex.match(/^#?[0-9A-Fa-f]{6}$/)) {
        const hh = hex.startsWith('#') ? hex.toUpperCase() : ('#' + hex.toUpperCase())
        baseColor.value = hh
      } else {
        const rnd = '#' + Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,'0').toUpperCase()
        baseColor.value = rnd
      }
      generate()
    }

    function saveCurrent() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          colors: palette.value,
          count: count.value,
          base: baseColor.value,
          type: paletteType.value
        })
      )
    }

    function savePalette() {
      const name = prompt('Название палитры:')
      if (!name) return
      const raw = localStorage.getItem('palettes_v1')
      const arr = raw ? JSON.parse(raw) : []
      arr.unshift({ id: Date.now(), name, colors: displayColors.value })
      localStorage.setItem('palettes_v1', JSON.stringify(arr))
      notify('Палитра сохранена')
    }

    function notifyCopy(hex) {
      notify('Скопировано: ' + hex)
    }

    function togglePin(i) {
      pinned.value[i] = !pinned.value[i]
      notify(pinned.value[i] ? 'Закреплено' : 'Откреплено')
    }

    function onColorClick(i) {
      if (pinMode.value) {
        togglePin(i)
      }
    }

    const pairs = computed(() => {
      const out = []
      const colors = displayColors.value
      for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
          const ratio = contrastRatio(colors[i], colors[j])
          let level = 'insufficient'
          if (ratio >= 7) level = 'AAA'
          else if (ratio >= 4.5) level = 'AA'
          else if (ratio >= 3) level = 'AA Large'
          out.push({ a: colors[i], b: colors[j], ratio, level })
        }
      }
      return out
    })

    function contrastText(hex) {
      return bestContrastText(hex)
    }

    function ensurePinnedLength() {
      Object.keys(pinned.value).forEach((k) => {
        const idx = Number(k)
        if (idx >= count.value) delete pinned.value[k]
      })
    }

    function loadPalette(paletteData) {
      if (!paletteData?.colors?.length) return
      
      palette.value = [...paletteData.colors]
      
      while (palette.value.length < count.value) {
        palette.value.push(baseColor.value)
      }
      
      pinned.value = {}
      
      notify('Палитра загружена')
      saveCurrent()
    }

    watch(count, (n) => {
      if (!Array.isArray(palette.value)) palette.value = []
      while (palette.value.length < n) palette.value.push(baseColor.value)
      if (palette.value.length > n) palette.value = palette.value.slice(0, n)
      ensurePinnedLength()
      saveCurrent()
    })

    watch(baseColor, () => {
      saveCurrent()
    })

    onMounted(() => {
      const raw = localStorage.getItem(STORAGE_KEY)

      if (raw) {
        try {
          const obj = JSON.parse(raw)
          palette.value = Array.isArray(obj.colors) ? obj.colors.slice() : generateHarmony(baseColor.value, 'random', count.value)
          baseColor.value = obj.base || baseColor.value
          paletteType.value = obj.type || paletteType.value
        } catch {
          palette.value = generateHarmony(baseColor.value, 'random', count.value)
        }
      } else {
        palette.value = generateHarmony(baseColor.value, 'random', count.value)
      }

      if (!Array.isArray(palette.value)) palette.value = []
      while (palette.value.length < count.value) palette.value.push(baseColor.value)

      const handleLoadPalette = (event) => {
        loadPalette(event.detail)
      }
      
      window.addEventListener('load-palette', handleLoadPalette)
    })

    return {
      count,
      format,
      baseColor,
      paletteType,
      darkBg,
      pinMode,
      palette,
      pinned,
      generate,
      notifyCopy,
      togglePin,
      onColorClick,
      displayColors,
      pairs,
      contrastText,
      toast,
      savePalette
    }
  }
}
</script>

<style scoped>
.generator { display:flex;flex-direction:column;gap:18px }
.controls-row{display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap}
.actions{display:flex;flex-direction:column;gap:10px;min-width:140px}
.btn{padding:10px 14px;border-radius:10px;border:none;cursor:pointer;font-weight:700}
.btn.primary{background:linear-gradient(90deg,#4e8cff,#7c5cff);color:white;box-shadow:0 10px 20px rgba(78,140,255,0.12)}
.preview-area{padding:20px;border-radius:14px;background:linear-gradient(180deg,#fff,#fbfdff);border:1px solid rgba(15,23,42,0.03);box-shadow:0 8px 22px rgba(15,23,42,0.04)}
.preview-area.dark{background:#0b1220;color:#e6eefb}
.palette-row{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:18px}
.mockup{display:flex;gap:20px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
.mockup h2{margin:0;font-size:22px;font-weight:700;letter-spacing:-0.2px}
.mockup .mock-btn{padding:12px 16px;border-radius:12px;border:none;font-weight:700;box-shadow:0 10px 22px rgba(15,23,42,0.06);cursor:pointer;transition:transform .12s ease}
.mockup .card{padding:16px;border-radius:12px;min-width:240px;box-shadow:0 8px 18px rgba(15,23,42,0.04)}
.analysis{margin-top:12px}
.footer-actions{display:flex;align-items:center;gap:12px;margin-top:4px}
.toast{position:fixed;right:18px;bottom:18px;background:rgba(15,23,42,0.9);color:#fff;padding:10px 14px;border-radius:12px;box-shadow:0 8px 20px rgba(15,23,42,0.12)}
@media (max-width:720px){
  .controls-row{flex-direction:column}
  .palette-row{justify-content:center}
  .mockup{flex-direction:column;align-items:flex-start}
  .mockup .card{min-width:100%}
  .color-card{width:48%;height:110px}
}
</style>