import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import test from '../views/test.vue';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/about', name: 'about', component: test },
  ],
});

export default router;
