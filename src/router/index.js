import { createRouter, createWebHistory } from 'vue-router'
import GeneratorView from '../views/GeneratorView.vue'
import SavedPalettesView from '../views/SavedPalettesView.vue'

const routes = [
  { path: '/', name: 'Generator', component: GeneratorView },
  { path: '/saved', name: 'Saved', component: SavedPalettesView },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
