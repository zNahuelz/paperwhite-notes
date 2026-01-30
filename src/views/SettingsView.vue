<script setup lang="ts">
import { watch } from 'vue';
import BaseSelect from '@/components/BaseSelect.vue';
import { useI18n } from 'vue-i18n';
import { languageOptions } from '@/i18n';
const { t, locale } = useI18n();

watch(locale, (lang) => {
  localStorage.setItem('appLang', lang);
});
</script>
<template>
  <div class="p-4 m-4">
    <h1 class="text-3xl font-semibold">{{ t('routes.settings') }}</h1>
    <div class="divider"></div>
    <div class="grid md:grid-cols-2 grid-cols-1 gap-3">
      <BaseSelect
        v-model="locale"
        :options="languageOptions"
        :fieldset-label="t('settings.appLanguage')"
        :show-label="true"
      ></BaseSelect>
    </div>
  </div>
</template>
