import { createRouter, createWebHashHistory } from 'vue-router';
import { AppRoutes } from './routes';
const router = createRouter({
  history: createWebHashHistory(), //import.meta.env.BASE_URL
  routes: AppRoutes.map((r) => ({
    path: r.path,
    name: r.name,
    component: r.component,
  })),
});

export default router;
