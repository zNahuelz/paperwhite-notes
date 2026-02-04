<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import BaseSelect from '@/components/BaseSelect.vue';
import { useI18n } from 'vue-i18n';
import { languageOptions } from '@/i18n';
import BaseInput from '@/components/BaseInput.vue';
import BaseModal from '@/components/BaseModal.vue';
import CleanCoversForm from '@/forms/CleanCoversForm.vue';
import BaseButton from '@/components/BaseButton.vue';

const { t, locale } = useI18n();
const dbPath = ref('');
const coversPath = ref('');
const showCoverCleanupModal = ref(false);

watch(locale, (lang) => {
  localStorage.setItem('appLang', lang);
});

const openDbFolder = async () => {
  await window.electron.openDatabaseFolder();
};

const openCoversFolder = async () => {
  await window.electron.openCoversFolder();
};

onMounted(async () => {
  dbPath.value = await window.electron.getDatabasePath();
  coversPath.value = await window.electron.getCoversPath();
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
      <BaseInput
        :modelValue="dbPath"
        class="hover:font-bold hover:text-info"
        readOnly
        width="w-full"
        :show-label="true"
        :fieldset-label="t('settings.dbPath')"
        @dblclick.stop="openDbFolder"
        :title="t('settings.openExplorer').toUpperCase()"
      ></BaseInput>
      <BaseInput
        :modelValue="coversPath"
        class="hover:font-bold hover:text-info"
        readOnly
        width="w-full"
        :show-label="true"
        :fieldset-label="t('settings.coversPath')"
        @dblclick.stop="openCoversFolder"
        :title="t('settings.openExplorer').toUpperCase()"
      ></BaseInput>

      <fieldset class="fieldset">
        <legend class="fieldset-legend text-transparent">.</legend>
        <BaseButton
          :label="t('common.cleanCovers')"
          :disabled="showCoverCleanupModal"
          @click="showCoverCleanupModal = true"
        ></BaseButton>
      </fieldset>
    </div>
    <!-- Clean Book Covers Modal -->
    <BaseModal
      :open="showCoverCleanupModal"
      :title="t('settings.unusedCoversCleanup')"
      @close="showCoverCleanupModal = false"
      :disableClose="true"
      width="max-w-lg"
    >
      <CleanCoversForm @close="showCoverCleanupModal = false"></CleanCoversForm>
    </BaseModal>
  </div>
</template>
