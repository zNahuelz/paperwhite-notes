import { ref, computed, onMounted } from 'vue';

type Theme = 'paperwhite' | 'paperblack';

const theme = ref<Theme>('paperwhite');

export function useTheme() {
  const isDark = computed(() => theme.value === 'paperblack');

  function applyTheme(t: Theme) {
    theme.value = t;
    document.documentElement.setAttribute('data-theme', t);
  }

  function toggleTheme() {
    applyTheme(isDark.value ? 'paperwhite' : 'paperblack');
  }

  onMounted(() => {
    applyTheme(theme.value);
  });

  return {
    theme,
    isDark,
    toggleTheme,
    applyTheme,
  };
}
