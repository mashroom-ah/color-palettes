// src/utils/colors.js
// Набор утилит: преобразования HSL<->HEX, RGB, генерация гармоний, контраст

export function clamp(v,a,b){ return Math.max(a,Math.min(b,v)) }

export function hexToRgb(hex){
  const h = hex.replace('#','')
  const bigint = parseInt(h,16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r,g,b }
}
export function hexToRgbString(hex){
  const {r,g,b}=hexToRgb(hex)
  return `rgb(${r}, ${g}, ${b})`
}
export function rgbToHex(r,g,b){
  // ensure integers
  const ri = Math.round(r), gi = Math.round(g), bi = Math.round(b)
  return '#'+[ri,gi,bi].map(x=> Number(x).toString(16).padStart(2,'0')).join('').toUpperCase()
}

// provide `toHex` alias so imports expecting this name work
export function toHex(input){
  // Accept different input types:
  // - if input is a hex string -> return uppercased hex
  // - if input is an object {r,g,b} -> convert
  // - if three numeric args are passed, caller may call toHex(r,g,b)
  if (typeof input === 'string') {
    if (input.startsWith('#')) return input.toUpperCase()
    // try to parse rgb(...) string
    const m = input.match(/rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/i)
    if (m) return rgbToHex(Number(m[1]), Number(m[2]), Number(m[3]))
    return input.toUpperCase()
  }
  if (typeof input === 'object' && input !== null && 'r' in input) {
    return rgbToHex(input.r, input.g, input.b)
  }
  // fallback: if called as toHex(r,g,b)
  if (arguments.length === 3) {
    return rgbToHex(arguments[0], arguments[1], arguments[2])
  }
  return '#000000'
}

// HSL helpers
export function hexToHsl(hex){
  const {r,g,b}=hexToRgb(hex)
  return rgbToHsl(r,g,b)
}
export function rgbToHsl(r,g,b){
  r/=255;g/=255;b/=255
  const max = Math.max(r,g,b), min = Math.min(r,g,b)
  let h=0,s=0,l=(max+min)/2
  if(max!==min){
    const d = max-min
    s = l > .5 ? d/(2-max-min) : d/(max+min)
    switch(max){
      case r: h = (g-b)/d + (g<b ? 6:0); break;
      case g: h = (b-r)/d + 2; break;
      case b: h = (r-g)/d + 4; break;
    }
    h *= 60
  }
  return { h: Math.round(h), s: Math.round(s*100), l: Math.round(l*100) }
}
export function hslToRgb(h,s,l){
  s/=100; l/=100
  function f(n){
    const k = (n + h/30) % 12
    const a = s * Math.min(l,1-l)
    return Math.round(255 * (l - a * Math.max(Math.min(k-3,9-k,1), -1)))
  }
  return { r: f(0), g: f(8), b: f(4) }
}
export function hslToHex(h,s,l){
  const {r,g,b}=hslToRgb(h,s,l)
  return rgbToHex(r,g,b)
}

// generate harmony palette based on base hex, type and count
export function generateHarmony(baseHex='#4e8cff', type='analogous', count=5){
  // base -> HSL
  const base = hexToHsl(baseHex)
  let angles=[]
  if(type==='random'){
    // sample random angles
    for(let i=0;i<count;i++) angles.push(Math.round(Math.random()*360))
    angles.sort((a,b)=>a-b)
    return angles.map(a=> hslToHex(a, base.s, clamp(base.l + (Math.random()*20-10),10,90)))
  }
  if(type==='monochrome'){
    // vary lightness
    const step = 30 / Math.max(1,count-1)
    const start = clamp(base.l - 15, 10, 90)
    const out=[]
    for(let i=0;i<count;i++){
      const l = clamp(start + i*step, 6, 95)
      out.push(hslToHex(base.h, base.s, l))
    }
    return out
  }
  if(type==='analogous'){
    // centered on base with +/- 30deg
    const spread = 30
    const step = (spread*2) / Math.max(1, count-1)
    const out=[]
    for(let i=0;i<count;i++){
      const angle = (base.h - spread) + i*step
      out.push(hslToHex((angle+360)%360, base.s, base.l))
    }
    return out
  }
  if(type==='triad'){
    // triad: base, +120, -120; for other slots interpolate
    const anchors = [base.h, (base.h+120)%360, (base.h+240)%360]
    const out=[]
    for(let i=0;i<count;i++){
      const h = anchors[i % anchors.length]
      const l = clamp(base.l + Math.floor((i/anchors.length)-1)*6, 10, 90)
      out.push(hslToHex(h, base.s, l))
    }
    return out
  }
  if(type==='complementary'){
    // split between base and base+180
    const comp = (base.h + 180) % 360
    const out=[]
    for(let i=0;i<count;i++){
      const t = i / Math.max(1,count-1)
      const h = (i < count/2) ? base.h : comp
      const l = clamp(base.l + (i%2? -8:8), 10, 90)
      out.push(hslToHex(h, base.s, l))
    }
    return out
  }
  // fallback: random-ish spread around base
  const res=[]
  for(let i=0;i<count;i++){ res.push(hslToHex((base.h + i*30)%360, base.s, clamp(base.l + (i%2?10:-10),10,90))) }
  return res
}

// contrast ratio per WCAG
function relLuminance({r,g,b}){
  const srgb = [r,g,b].map(v=> {
    const c = v/255
    return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4)
  })
  return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2]
}
export function contrastRatio(hexA, hexB){
  const a = relLuminance(hexToRgb(hexA))
  const b = relLuminance(hexToRgb(hexB))
  const L1 = Math.max(a,b), L2 = Math.min(a,b)
  return (L1 + 0.05) / (L2 + 0.05)
}
export function bestContrastText(bgHex){
  // return black or white depending which has best contrast
  const r = contrastRatio(bgHex, '#000000')
  const w = contrastRatio(bgHex, '#FFFFFF')
  return w >= r ? '#FFFFFF' : '#000000'
}
