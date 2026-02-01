import { Icons } from '@/constants/icons';
import HomeView from '@/views/HomeView.vue';
import LibraryView from '@/views/LibraryView.vue';
import SettingsView from '@/views/SettingsView.vue';
import HighlightsView from '@/views/HighlightsView.vue';

export const AppRoutes = [
  {
    path: '/',
    name: 'home',
    labelKey: 'routes.home',
    icon: Icons.Home,
    component: HomeView,
    visibleOnSidebar: true,
  },
  {
    path: '/library',
    name: 'library',
    labelKey: 'routes.library',
    icon: Icons.Library,
    component: LibraryView,
    visibleOnSidebar: true,
  },
  {
    path: '/book/:id/highlights',
    name: 'book-highlights',
    labelKey: 'routes.bookHighlights',
    icon: Icons.Library,
    component: HighlightsView,
    visibleOnsidebar: false,
  },
  {
    path: '/settings',
    name: 'settings',
    labelKey: 'routes.settings',
    icon: Icons.Settings,
    component: SettingsView,
    visibleOnSidebar: true,
  },
];
