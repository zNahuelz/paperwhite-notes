import { ref, computed, onMounted } from 'vue';

type Theme = 'paperwhite' | 'paperblack';

const STORAGE_KEY = 'appTheme';

const theme = ref<Theme>('paperwhite');

export function useTheme() {
  const isDark = computed(() => theme.value === 'paperblack');

  function applyTheme(t: Theme) {
    theme.value = t;
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem(STORAGE_KEY, t);
  }

  function toggleTheme() {
    applyTheme(isDark.value ? 'paperwhite' : 'paperblack');
  }

  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    applyTheme(saved ?? theme.value);
  });

  return {
    theme,
    isDark,
    toggleTheme,
    applyTheme,
  };
}
