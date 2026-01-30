import { Icons } from '@/constants/icons';
import HomeView from '@/views/HomeView.vue';
import LibraryView from '@/views/LibraryView.vue';
import SettingsView from '@/views/SettingsView.vue';

export const AppRoutes = [
  { path: '/', name: 'home', labelKey: 'routes.home', icon: Icons.Home, component: HomeView },
  {
    path: '/library',
    name: 'library',
    labelKey: 'routes.library',
    icon: Icons.Library,
    component: LibraryView,
  },
  {
    path: '/settings',
    name: 'settings',
    labelKey: 'routes.settings',
    icon: Icons.Settings,
    component: SettingsView,
  },
];
