<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { Book } from '../../electron/db/types/book.ts';
import { Highlight } from '../../electron/db/types/highlight.ts';
import { Icons } from '@/constants/icons.ts';
import BaseButton from '@/components/BaseButton.vue';
import { Icon } from '@iconify/vue';

const { t } = useI18n();
const isRestoring = ref(false);
const errorMessage = ref('');
const entityRestored = ref(false);

const props = defineProps<{
  id?: number;
  type: 'BOOK' | 'HIGHLIGHT';
  entity: Book | Highlight;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const handleClose = () => {
  emit('close');
};

const restoreEntity = async () => {
  isRestoring.value = true;
  type RestoreApi = {
    restore: (id: number) => Promise<boolean>;
  };

  const apiMap: Record<'BOOK' | 'HIGHLIGHT', RestoreApi> = {
    BOOK: window.api.books,
    HIGHLIGHT: window.api.highlights,
  };

  try {
    const id = Number(props.id);
    const targetApi = apiMap[props.type];

    await targetApi.restore(id);

    entityRestored.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1200));
    window.location.reload();
  } catch (error: any) {
    const isBook = props.type === 'BOOK';
    const message = error?.message ?? String(error);
    const translationKey = isBook ? 'errors.bookRestoreFailed' : 'errors.highlightRestoreFailed';

    errorMessage.value = t(translationKey, { error: message });
  }
};
</script>
<template>
  <div class="flex flex-col items-center">
    <h1 class="text-center font-light text-lg" v-if="!entityRestored">
      {{
        type === 'BOOK'
          ? t('library.bookRestorationAlert')
          : t('highlights.highlightRestorationAlert')
      }}
    </h1>

    <div
      class="flex flex-col items-start"
      v-if="type === 'BOOK' && errorMessage === '' && !entityRestored"
    >
      <div class="inline-flex items-center gap-2 mt-4">
        <Icon :icon="Icons.Book" class="text-lg"></Icon>
        <span class="font-semibold">{{ (entity as Book)?.title }}</span>
      </div>
      <div class="inline-flex items-center gap-2 mt-4" v-if="(entity as Book)?.author">
        <Icon :icon="Icons.Author" class="text-lg"></Icon>
        <span class="font-semibold">{{ (entity as Book)?.author }}</span>
      </div>
    </div>

    <div
      class="flex flex-col items-start"
      v-if="type === 'HIGHLIGHT' && errorMessage === '' && !entityRestored"
    >
      <div class="inline-flex items-center gap-2 mt-4">
        <Icon :icon="Icons.Book" class="text-lg"></Icon>
        <span class="font-semibold">{{ (entity as Highlight)?.content }}</span>
      </div>
    </div>

    <div v-if="entityRestored" class="flex flex-col items-center">
      <Icon :icon="Icons.CircleCheck" class="text-success text-[100px]"></Icon>
      <span class="font-light text-2xl">{{
        type === 'BOOK' ? t('library.bookRestored') : t('highlights.highlightRestored')
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
        :disabled="isRestoring"
      />
      <BaseButton
        class="join-item"
        color="btn-primary"
        :label="t('common.restore')"
        @click="restoreEntity"
        :disabled="isRestoring || errorMessage !== ''"
      />
    </div>
  </div>
</template>
