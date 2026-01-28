<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useTheme } from '@/composables/useTheme';

const { isDark, toggleTheme } = useTheme();

const router = useRouter();
const sidebarOpen = ref(true);

const sections = [
  { id: 'home', label: 'Home', icon: 'lucide:home', route: '/' },
  { id: 'library', label: 'Library', icon: 'lucide:library-big', route: '/library' },
  { id: 'settings', label: 'Settings', icon: 'lucide:settings', route: '/settings' },
  { id: 'about', label: 'About', icon: 'lucide:user', route: '/about' },
];

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const navigateTo = (route: string) => {
  router.push(route);
};

const isRouteActive = (route: string) => {
  return router.currentRoute.value.path === route;
};
//TODO: Fix dark mode and change bg-base colors.
//Move strings to locales file.
//Routes too...
</script>

<template>
  <div class="min-h-screen bg-base-100 flex">
    <aside
      class="fixed top-0 right-0 h-full bg-base-300 shadow-2xl transition-all duration-300 ease-in-out z-40"
      :class="sidebarOpen ? 'w-64 md:w-72' : 'w-20'"
    >
      <div class="flex flex-col h-full p-4">
        <button
          @click="toggleSidebar"
          class="flex justify-center items-center p-3 mb-6 rounded-lg hover:bg-primary/50 transition-colors w-full"
        >
          <Icon
            icon="lucide:chevron-left"
            class="w-7 h-7 text-secondary hover:text-base-content"
            v-if="!sidebarOpen"
          ></Icon>
          <Icon
            icon="lucide:chevron-right"
            class="w-7 h-7 text-secondary hover:text-base-content"
            v-else
          ></Icon>
        </button>

        <nav class="flex-1 space-y-2">
          <button
            v-for="section in sections"
            :key="section.id"
            @click="navigateTo(section.route)"
            class="w-full flex items-center py-3 rounded-lg transition-all duration-200"
            :class="[
              sidebarOpen ? 'justify-start px-4 text-left' : 'justify-center px-0',
              isRouteActive(section.route)
                ? 'bg-primary text-primary-content shadow-md'
                : 'text-secondary hover:bg-primary/50',
            ]"
            :title="!sidebarOpen ? section.label : ''"
          >
            <Icon :icon="section.icon" class="text-2xl shrink-0"></Icon>
            <span v-if="sidebarOpen" class="font-medium ml-4">{{ section.label }}</span>
          </button>
          <button
            @click="toggleTheme"
            class="w-full flex items-center py-3 rounded-lg transition-all duration-200 hover:bg-primary/50"
            :class="[sidebarOpen ? 'justify-start px-4 text-left' : 'justify-center px-0']"
          >
            <Icon :icon="isDark ? 'lucide:sun' : 'lucide:moon'" class="text-2xl shrink-0" />
            <span v-if="sidebarOpen" class="font-medium ml-4">Switch Theme</span>
          </button>
        </nav>

        <div v-if="sidebarOpen" class="mt-8 pt-6 border-t border-base-200">
          <p class="text-xs text-base-content/60 text-center"><3</p>
        </div>
      </div>
    </aside>

    <main
      class="transition-all duration-300 ease-in-out flex-1"
      :class="sidebarOpen ? 'mr-0 md:mr-72' : 'mr-0 md:mr-20'"
    >
      <router-view />
    </main>
  </div>
</template>
