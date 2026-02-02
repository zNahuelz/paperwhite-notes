<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Book } from 'electron/db/types/book';
import { useI18n } from 'vue-i18n';
import BookCard from '@/components/BookCard.vue';
import { Icon } from '@iconify/vue';
import { Icons } from '@/constants/icons';
import BaseButton from '@/components/BaseButton.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseModal from '@/components/BaseModal.vue';
import EditBookForm from '@/forms/EditBookForm.vue';

const { t } = useI18n();
const books = ref<Book[]>([]);
const isLoading = ref(true);
const search = ref('');
const showEditModal = ref(false);
const selectedBook = ref<Book | undefined>(undefined);

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

const filteredBooks = computed(() => {
  if (!search.value.trim()) return books.value;

  const q = search.value.toLowerCase();

  return books.value.filter((b) => b.title.toLowerCase().includes(q));
});

const openEditForm = (book: Book) => {
  selectedBook.value = book;
  showEditModal.value = true;
};

const handleBookEdit = async (data: Book) => {
  console.log(data);
};

onMounted(() => loadBooks());
</script>
<template>
  <div class="p-4 m-4">
    <h1 class="text-3xl font-semibold">{{ t('library.myBooks') }}</h1>
    <div class="divider"></div>
    <div class="flex flex-col items-end mb-5" v-if="books.length > 0">
      <div class="inline-flex items-center gap-2">
        <BaseInput :placeholder="`${t('common.search')}...`" v-model="search"></BaseInput>
        <div class="join md:join-horizontal join-vertical">
          <BaseButton
            :icon="Icons.Refresh"
            :title="t('common.reset').toUpperCase()"
            class="join-item"
            @click="search = ''"
          ></BaseButton>
        </div>
      </div>
    </div>
    <div
      class="grid md:grid-cols-3 xl:grid-cols-6 grid-cols-1 gap-4 items-stretch"
      v-if="books.length"
    >
      <div v-for="book in filteredBooks" :key="book.id">
        <BookCard :book="book" :key="book.id" @edit="openEditForm"></BookCard>
      </div>
    </div>
    <div v-else class="flex flex-col items-center">
      <Icon :icon="Icons.BookAlert" class="text-[200px] text-error"></Icon>
      <h1 class="font-light text-2xl text-center max-w-lg">{{ t('library.emptyBooksTable') }}</h1>
    </div>

    <!-- Edit Book Modal -->
    <BaseModal
      :open="showEditModal"
      :title="t('library.editBook')"
      @close="
        () => {
          showEditModal = false;
          selectedBook = undefined;
        }
      "
      :disableClose="true"
      width="max-w-2xl"
    >
      <div class="p-4 overflow-y-auto">
        <EditBookForm
          @close="
            () => {
              showEditModal = false;
              selectedBook = undefined;
            }
          "
          :bookId="selectedBook?.id!"
          :initialValues="{
            title: selectedBook?.title!,
            description: selectedBook?.description ?? '',
            author: selectedBook?.author ?? '',
            cover: selectedBook?.cover ?? undefined,
          }"
        >
        </EditBookForm>
      </div>
    </BaseModal>
  </div>
</template>
