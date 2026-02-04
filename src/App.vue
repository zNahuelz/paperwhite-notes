<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useTheme } from '@/composables/useTheme';
import { AppRoutes } from './router/routes';
import { useI18n } from 'vue-i18n';
import { Icons } from '@/constants/icons.ts';

const { isDark, toggleTheme } = useTheme();
const { t } = useI18n();
const router = useRouter();
const sidebarOpen = ref(true);

const routes = AppRoutes.filter((r) => r.visibleOnSidebar).map((r) => ({
  id: r.name,
  labelKey: r.labelKey,
  icon: r.icon,
  path: r.path,
}));

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const navigateTo = (route: string) => {
  router.push(route);
};

const isRouteActive = (route: string) => {
  return router.currentRoute.value.path === route;
};

watch(sidebarOpen, (val) => {
  localStorage.setItem('sidebarStatus', val.toString());
});

const openGitHub = () => {
  window.electron.openExternalUrl('https://github.com/zNahuelz');
};

onMounted(() => {
  sidebarOpen.value = localStorage.getItem('sidebarStatus') === 'true';
});
</script>

<template>
  <div class="min-h-screen bg-base-300 flex">
    <aside
      class="fixed top-0 right-0 h-full bg-base-100 shadow-2xl transition-all duration-300 ease-in-out z-40"
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
            :class="[isDark ? 'text-secondary-content' : '']"
            v-if="!sidebarOpen"
          ></Icon>
          <Icon
            icon="lucide:chevron-right"
            class="w-7 h-7 text-secondary hover:text-base-content"
            :class="[isDark ? 'text-secondary-content' : '']"
            v-else
          ></Icon>
        </button>

        <nav class="flex-1 space-y-2">
          <button
            v-for="route in routes"
            :key="route.id"
            @click="navigateTo(route.path)"
            class="w-full flex items-center py-3 rounded-lg transition-all duration-200"
            :class="[
              sidebarOpen ? 'justify-start px-4 text-left' : 'justify-center px-0',
              isRouteActive(route.path)
                ? 'bg-primary text-primary-content shadow-md'
                : `text-secondary ${isDark ? 'text-secondary-content' : ''} hover:bg-primary/50`,
            ]"
            :title="!sidebarOpen ? t(route.labelKey) : ''"
          >
            <Icon :icon="route.icon" class="text-2xl shrink-0"></Icon>
            <span v-if="sidebarOpen" class="font-medium ml-4">{{ t(route.labelKey) }}</span>
          </button>
          <button
            @click="toggleTheme"
            class="w-full flex items-center py-3 rounded-lg transition-all duration-200 hover:bg-primary/50"
            :class="[sidebarOpen ? 'justify-start px-4 text-left' : 'justify-center px-0']"
          >
            <Icon :icon="isDark ? Icons.Sun : Icons.Moon" class="text-2xl shrink-0" />
            <span v-if="sidebarOpen" class="font-medium ml-4">{{ t('common.switchTheme') }}</span>
          </button>
        </nav>

        <div
          v-if="sidebarOpen"
          class="mt-8 pt-6 border-t border-base-300"
          :class="[isDark ? 'border-white/70' : '']"
        >
          <p
            class="text-xs text-base-content/60 text-center hover:font-bold hover:text-success"
            @click="openGitHub"
          >
            Dev. GitHub <3
          </p>
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
