<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Book } from 'electron/db/types/book';
import { useI18n } from 'vue-i18n';
import BookCard from '@/components/BookCard.vue';
import { Icon } from '@iconify/vue';
import { Icons } from '@/constants/icons';

const { t } = useI18n();
const books = ref<Book[]>([]);
const isLoading = ref(true);

const loadBooks = async () => {
  try {
    const data = await window.api.books.list();
    books.value = data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => loadBooks());
</script>
<template>
  <div class="p-4 m-4">
    <h1 class="text-3xl font-semibold">{{ t('library.myBooks') }}</h1>
    <div class="divider"></div>
    <div
      class="grid md:grid-cols-3 xl:grid-cols-6 grid-cols-1 gap-4 items-strech"
      v-if="books.length"
    >
      <div v-for="book in books">
        <BookCard :book="book"></BookCard>
      </div>
    </div>
    <div v-else class="flex flex-col items-center">
      <Icon :icon="Icons.BookAlert" class="text-[200px] text-error"></Icon>
      <h1 class="font-light text-2xl text-center max-w-lg">{{ t('library.emptyBooksTable') }}</h1>
    </div>
  </div>
</template>
