<script setup lang="ts">
import { Highlight } from '@/types/highlight.ts';
import { Icons } from '@/constants/icons';
import BaseButton from './BaseButton.vue';
import { computed, ref } from 'vue';
import { copyToClipboard, formatAsDatetime } from '@/constants/utils';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';

const props = defineProps<{
  highlight: Highlight;
}>();

const emit = defineEmits<{
  (e: 'edit', highlight: Highlight): void;
  (e: 'delete', highlight: Highlight): void;
  (e: 'restore', highlight: Highlight): void;
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

const handleEdit = () => {
  emit('edit', props.highlight);
};

const handleDelete = () => {
  emit('delete', props.highlight);
};

const handleRestore = () => {
  emit('restore', props.highlight);
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
      <div class="inline-flex items-center gap-2" v-if="highlight.location">
        <Icon :icon="Icons.Location" class="text-lg"></Icon>
        <span class="font-semibold text-sm">{{ highlight.location }}</span>
      </div>
      <div class="inline-flex items-center gap-2" v-if="highlight.date">
        <Icon :icon="Icons.Calendar" class="text-lg"></Icon>
        <span class="font-semibold text-sm">{{ formatAsDatetime(highlight.date) }}</span>
      </div>
      <div class="card-actions justify-end mt-auto">
        <div class="join join-vertical md:join-horizontal">
          <BaseButton
            class="join-item btn-sm"
            :color="highlight.isDeleted ? 'btn-warning' : 'btn-error'"
            :icon="highlight.isDeleted ? Icons.Restore : Icons.Trash"
            @click="highlight.isDeleted ? handleRestore() : handleDelete()"
          ></BaseButton>
          <BaseButton
            class="join-item btn-sm"
            color="btn-info"
            :icon="Icons.Edit"
            @click="handleEdit"
          ></BaseButton>
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
