<script setup lang="ts">
import { Book } from '../../electron/db/types/book.ts';
import { Highlight } from '../../electron/db/types/highlight.ts';
import { Icons } from '@/constants/icons.ts';
import { Icon } from '@iconify/vue';
import BaseButton from '@/components/BaseButton.vue';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';

const { t } = useI18n();
const showConfirmation = ref(false);
const deletionType = ref<'soft' | 'hard'>('soft');
const isDeleting = ref(false);
const errorMessage = ref('');
const entityDeleted = ref(false);

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

const handleDeletion = (type: 'soft' | 'hard') => {
  showConfirmation.value = true;
  deletionType.value = type;
};

const deleteEntity = async () => {
  type DeleteFn = (id: number) => Promise<boolean>;

  const apiMap: Record<string, { softDelete: DeleteFn; hardDelete: DeleteFn }> = {
    BOOK: window.api.books,
    HIGHLIGHT: window.api.highlights,
  };

  const targetApi = apiMap[props.type];
  const method = deletionType.value === 'soft' ? 'softDelete' : 'hardDelete';

  try {
    const id = Number(props.id);

    await targetApi[method](id);

    entityDeleted.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1200));
    window.location.reload();
  } catch (error: any) {
    const isBook = props.type === 'BOOK';
    const message = error?.message ?? String(error);
    const translationKey = isBook ? 'errors.bookDeleteFailed' : 'errors.highlightDeleteFailed';

    errorMessage.value = t(translationKey, { error: message });
  }
};
</script>
<template>
  <div class="flex flex-col items-center">
    <h1 class="text-center font-light text-lg" v-if="!entityDeleted">
      {{
        type === 'BOOK' ? t('library.bookDeletionAlert') : t('highlights.highlightDeletionAlert')
      }}
    </h1>

    <div
      class="flex flex-col items-start"
      v-if="type === 'BOOK' && errorMessage === '' && !entityDeleted"
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
      v-if="type === 'HIGHLIGHT' && errorMessage === '' && !entityDeleted"
    >
      <div class="inline-flex items-center gap-2 mt-4">
        <Icon :icon="Icons.Book" class="text-lg"></Icon>
        <span class="font-semibold">{{ (entity as Highlight)?.content }}</span>
      </div>
    </div>

    <div v-if="entityDeleted" class="flex flex-col items-center">
      <Icon :icon="Icons.CircleCheck" class="text-success text-[100px]"></Icon>
      <span class="font-light text-2xl">{{
        type === 'BOOK' ? t('library.bookDeleted') : t('highlights.highlightDeleted')
      }}</span>
    </div>

    <div v-if="errorMessage !== ''" class="flex flex-col items-center">
      <Icon :icon="Icons.Alert" class="text-error text-[100px]"></Icon>
      <span class="font-light text-2xl">{{ errorMessage }}</span>
    </div>

    <div class="join join-vertical md:join-horizontal mt-4" v-if="!showConfirmation">
      <BaseButton
        class="join-item"
        color="btn-secondary"
        :label="t('common.cancel')"
        @click="handleClose"
        :disabled="isDeleting"
      />
      <BaseButton
        class="join-item"
        color="btn-error"
        :label="t('common.deletePermanently')"
        @click="handleDeletion('hard')"
      />
      <BaseButton
        class="join-item"
        color="btn-primary"
        :label="t('common.delete')"
        @click="handleDeletion('soft')"
      />
    </div>
    <div
      class="join join-vertical md:join-horizontal mt-4"
      v-if="showConfirmation && !entityDeleted"
    >
      <BaseButton
        class="join-item"
        color="btn-secondary"
        :label="t('common.cancel')"
        @click="handleClose"
        :disabled="isDeleting"
      />
      <BaseButton
        class="join-item"
        color="btn-primary"
        :label="t('common.confirm')"
        @click="deleteEntity"
        :disabled="isDeleting || errorMessage !== ''"
      />
    </div>
  </div>
</template>
