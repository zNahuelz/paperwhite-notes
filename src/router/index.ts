import { createRouter, createWebHistory } from 'vue-router';
import { AppRoutes } from './routes';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: AppRoutes.map((r) => ({
    path: r.path,
    name: r.name,
    component: r.component,
  })),
});

export default router;
