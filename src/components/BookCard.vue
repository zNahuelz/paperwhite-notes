<script setup lang="ts">
import { Book } from 'electron/db/types/book';
import { Icons } from '@/constants/icons';
import { Icon } from '@iconify/vue';
import BaseButton from './BaseButton.vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { toFileUrl } from '@/constants/utils.ts';
import defaultCover from '@/assets/images/default-cover.png';
import errorCover from '@/assets/images/error-cover.png';

const props = defineProps<{
  book: Book;
}>();

const emit = defineEmits<{
  (e: 'edit', book: Book): void;
}>();

const { t } = useI18n();
const router = useRouter();

const handleEdit = () => {
  emit('edit', props.book);
};

const coverSrc = (cover?: string) => {
  return cover ? toFileUrl(cover) : defaultCover;
};
</script>
<template>
  <div class="card bg-base-100 shadow-lg border border-primary/50 h-full">
    <figure class="md:max-h-60 lg:max-h-80">
      <img
        :src="coverSrc(book.cover)"
        @error="($event.target as HTMLImageElement).src = errorCover"
        alt="Book Cover"
        class="w-full"
        @dragstart.prevent
        @contextmenu.prevent
      />
    </figure>
    <div class="card-body flex flex-col">
      <h2 class="card-title uppercase">{{ book.title }}</h2>
      <span class="inline-flex items-center gap-2 capitalize"
        ><Icon :icon="Icons.Author" class="text-2xl"></Icon
        >{{ book.author ?? t('library.unknownAuthor') }}</span
      >
      <span class="inline-flex items-center gap-2"
        ><Icon :icon="Icons.Quote" class="text-2xl"></Icon>{{ book.highlightsAmount }}</span
      >
      <div class="card-actions justify-center mt-auto">
        <div class="join join-vertical md:join-horizontal">
          <BaseButton class="join-item" :icon="Icons.Trash" color="btn-error"></BaseButton>
          <BaseButton
            class="join-item"
            :icon="Icons.Edit"
            color="btn-info"
            @click="handleEdit"
          ></BaseButton>
          <BaseButton
            class="join-item"
            :icon="Icons.MoreHorizontal"
            @click="() => router.push({ name: 'book-highlights', params: { id: book.id } })"
          ></BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
