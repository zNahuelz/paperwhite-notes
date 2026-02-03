<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { Book } from 'electron/db/types/book';
import { useI18n } from 'vue-i18n';
import BookCard from '@/components/BookCard.vue';
import { Icon } from '@iconify/vue';
import { Icons } from '@/constants/icons';
import BaseButton from '@/components/BaseButton.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseModal from '@/components/BaseModal.vue';
import EditBookForm from '@/forms/EditBookForm.vue';
import BaseLoading from '@/components/BaseLoading.vue';
import DeleteEntityForm from '@/forms/DeleteEntityForm.vue';

const { t } = useI18n();
const books = ref<Book[]>([]);
const isLoading = ref(true);
const search = ref('');
const showEditModal = ref(false);
const selectedBook = ref<Book | undefined>(undefined);
const errorMessage = ref('');
const showDeleteModal = ref(false);

const includeDeleted = ref(false);

const loadBooks = async () => {
  try {
    isLoading.value = true;
    const data = await window.api.books.list(includeDeleted.value);
    books.value = data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error: any) {
    const message = typeof error?.message === 'string' ? error.message : String(error);

    errorMessage.value = t('errors.loadBooksFailed', { error: message });
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

const closeEditForm = () => {
  showEditModal.value = false;
  selectedBook.value = undefined;
};

const openDeleteModal = (book: Book) => {
  selectedBook.value = book;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  selectedBook.value = undefined;
};

watch(
  () => includeDeleted.value,
  async () => {
    await loadBooks();
  },
  { immediate: true }
);
</script>
<template>
  <div class="p-4 m-4">
    <h1 class="text-3xl font-semibold">{{ t('library.myBooks') }}</h1>
    <div class="divider"></div>
    <div
      v-if="!isLoading && errorMessage !== '' && books.length <= 0"
      class="flex flex-col items-center"
    >
      <Icon :icon="Icons.Alert" class="text-[200px] text-error"></Icon>
      <h1 class="font-light text-2xl text-center max-w-lg">{{ errorMessage }}</h1>
    </div>
    <div v-if="isLoading">
      <BaseLoading :message="t('library.loadingBooks')" />
    </div>
    <div class="flex flex-col items-end mb-5" v-if="books.length > 0 && !isLoading">
      <div class="inline-flex items-center gap-2">
        <BaseInput :placeholder="`${t('common.search')}...`" v-model="search"></BaseInput>
        <BaseButton
          :icon="Icons.Refresh"
          :title="t('common.reset').toUpperCase()"
          class="join-item"
          @click="search = ''"
        ></BaseButton>
        <!-- TODO: Modify css or change input type. -->
        <label class="toggle toggle-xl text-base-content">
          <input type="checkbox" v-model="includeDeleted" />
          <Icon :icon="Icons.BookCheck" aria-label="enabled"></Icon>
          <Icon :icon="Icons.BookDashed" aria-label="disabled"></Icon>
        </label>
      </div>
    </div>
    <div
      class="grid md:grid-cols-3 xl:grid-cols-6 grid-cols-1 gap-4 items-stretch"
      v-if="books.length > 0 && !isLoading"
    >
      <div v-for="book in filteredBooks" :key="book.id">
        <BookCard
          :book="book"
          :key="book.id"
          @edit="openEditForm"
          @delete="openDeleteModal"
        ></BookCard>
      </div>
    </div>
    <div v-if="books.length <= 0 && !isLoading" class="flex flex-col items-center">
      <Icon :icon="Icons.BookAlert" class="text-[200px] text-error"></Icon>
      <h1 class="font-light text-2xl text-center max-w-lg">{{ t('library.emptyBooksTable') }}</h1>
    </div>

    <!-- Edit Book Modal -->
    <BaseModal
      :open="showEditModal"
      :title="t('library.editBook')"
      @close="closeEditForm"
      :disableClose="true"
      width="max-w-2xl"
    >
      <div class="p-4 overflow-y-auto">
        <EditBookForm
          @close="closeEditForm"
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
    <!-- Delete Book Modal -->
    <BaseModal
      :open="showDeleteModal"
      :title="t('library.deleteBook')"
      @close="closeDeleteModal"
      :disableClose="true"
      width="max-w-lg"
    >
      <DeleteEntityForm
        type="BOOK"
        :entity="selectedBook!!"
        :id="selectedBook?.id!!"
        @close="closeDeleteModal"
      ></DeleteEntityForm>
    </BaseModal>
  </div>
</template>
