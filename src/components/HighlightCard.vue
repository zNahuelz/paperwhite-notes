<script setup lang="ts">
import { Highlight } from 'electron/db/types/highlight';
import { Icons } from '@/constants/icons';
import BaseButton from './BaseButton.vue';
import { computed, ref } from 'vue';
import { copyToClipboard } from '@/constants/utils';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  highlight: Highlight;
}>();

const { t } = useI18n();
const copyStatus = ref('WAITING');

const copy = async (highlight: Highlight) => {
  try {
    await copyToClipboard(highlight.content);
    copyStatus.value = 'SUCCESS';
    setTimeout(() => {
      copyStatus.value = 'WAITING';
    }, 1200);
  } catch {
    copyStatus.value = 'FAILED';
  }
};

const handleIcon = computed(() =>
  copyStatus.value === 'SUCCESS'
    ? Icons.CopyCheck
    : copyStatus.value === 'FAILED'
      ? Icons.CopyFailed
      : Icons.Copy
);
</script>
<template>
  <div class="card bg-base-100 shadow-lg border border-primary/50 h-full">
    <div class="card-body flex flex-col">
      <p class="card-content text-lg font-light">{{ highlight.content }}</p>
      <div class="card-actions justify-end mt-auto">
        <div class="join join-vertical md:join-horizontal">
          <BaseButton class="join-item btn-sm" color="btn-error" :icon="Icons.Trash"></BaseButton>
          <BaseButton class="join-item btn-sm" color="btn-info" :icon="Icons.Edit"></BaseButton>
          <BaseButton
            class="join-item btn-sm"
            :icon="handleIcon"
            @click="copy(highlight)"
            :title="t('common.copy').toUpperCase()"
          ></BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
