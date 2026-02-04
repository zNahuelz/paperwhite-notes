<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import BaseButton from '@/components/BaseButton.vue';
import { Icon } from '@iconify/vue';
import { Icons } from '@/constants/icons.ts';

const { t } = useI18n();
const isCleaning = ref(false);
const errorMessage = ref('');
const cleanupCompleted = ref(false);
const cleanupResult = ref(0);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const handleClose = () => {
  emit('close');
};

const cleanUnusedCovers = async () => {
  try {
    isCleaning.value = true;
    cleanupResult.value = await window.electron.cleanupCovers();
    cleanupCompleted.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    window.location.reload();
  } catch (error: any) {
    const message = error?.message ?? String(error);
    errorMessage.value = t('settings.coverCleanupFailed', { error: message });
  }
};
</script>
<template>
  <div class="flex flex-col items-center">
    <h1 class="text-center font-light text-lg" v-if="!cleanupCompleted && cleanupResult == 0">
      {{ t('settings.cleanUnusedCoversAlert') }}
    </h1>

    <div v-if="cleanupCompleted" class="flex flex-col items-center">
      <Icon :icon="Icons.CircleCheck" class="text-success text-[100px]"></Icon>
      <span class="font-light text-2xl text-center">{{
        t('settings.coverCleanupCompleted', { count: cleanupResult })
      }}</span>
    </div>

    <div v-if="errorMessage !== ''" class="flex flex-col items-center">
      <Icon :icon="Icons.Alert" class="text-error text-[100px]"></Icon>
      <span class="font-light text-2xl">{{ errorMessage }}</span>
    </div>

    <div class="join join-vertical md:join-horizontal mt-4">
      <BaseButton
        class="join-item"
        color="btn-secondary"
        :label="t('common.cancel')"
        @click="handleClose"
        :disabled="isCleaning"
      />
      <BaseButton
        class="join-item"
        color="btn-primary"
        :label="t('common.confirm')"
        @click="cleanUnusedCovers"
        :disabled="isCleaning || errorMessage !== ''"
      />
    </div>
  </div>
</template>
