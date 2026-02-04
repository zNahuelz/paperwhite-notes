<script setup lang="ts">
import { Book } from 'electron/db/types/book';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { ref, computed, watch } from 'vue';
import { Highlight } from 'electron/db/types/highlight';
import BaseLoading from '@/components/BaseLoading.vue';
import HighlightCard from '@/components/HighlightCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import { Icons } from '@/constants/icons';
import BaseModal from '@/components/BaseModal.vue';
import EditHighlightForm from '@/forms/EditHighlightForm.vue';
import { Icon } from '@iconify/vue';
import DeleteEntityForm from '@/forms/DeleteEntityForm.vue';
import RestoreEntityForm from '@/forms/RestoreEntityForm.vue';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = route.params.id as string;

const isLoading = ref(true);
const book = ref<Book | undefined>(undefined);
const highlights = ref<Highlight[]>([]);
const search = ref('');
const showEditModal = ref(false);
const selectedHighlight = ref<Highlight | undefined>(undefined);
const errorMessage = ref('');
const showDeleteModal = ref(false);
const showRestoreModal = ref(false);

const includeDeleted = ref(false);

const loadBookDetails = async () => {
  try {
    book.value = await window.api.books.get(Number(id));
    highlights.value = await window.api.highlights.byBook(Number(id), includeDeleted.value);
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error: any) {
    const message = typeof error?.message === 'string' ? error.message : String(error);

    errorMessage.value = t('errors.loadHighlightsFailed', { error: message });
  } finally {
    isLoading.value = false;
  }
};

const filteredHighlights = computed(() => {
  if (!search.value.trim()) return highlights.value;

  const q = search.value.toLowerCase();

  return highlights.value.filter((h) => h.content.toLowerCase().includes(q));
});

const openEditForm = (highlight: Highlight) => {
  selectedHighlight.value = highlight;
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedHighlight.value = undefined;
};

const openDeleteModal = (highlight: Highlight) => {
  selectedHighlight.value = highlight;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  selectedHighlight.value = undefined;
  showDeleteModal.value = false;
};

const openRestoreModal = (highlight: Highlight) => {
  selectedHighlight.value = highlight;
  showRestoreModal.value = true;
};

const closeRestoreModal = () => {
  selectedHighlight.value = undefined;
  showRestoreModal.value = false;
};

watch(
  () => includeDeleted.value,
  async () => {
    await loadBookDetails();
  },
  { immediate: true }
);
</script>
<template>
  <div class="p-4 m-4">
    <h1 class="text-3xl font-semibold">{{ `${t('highlights.highlights')} - ${book?.title}` }}</h1>
    <div class="flex flex-col items-start mt-2">
      <h1 v-if="book?.author !== ''" class="font-light text-xl">
        {{ `${t('common.author')}: ${book?.author}` }}
      </h1>
      <h1 v-if="book?.description !== ''" class="font-light text-lg">
        {{ `${t('common.description')}: ${book?.description}` }}
      </h1>
    </div>
    <div class="divider"></div>
    <div
      v-if="!isLoading && errorMessage !== '' && highlights.length <= 0"
      class="flex flex-col items-center"
    >
      <Icon :icon="Icons.Alert" class="text-[200px] text-error"></Icon>
      <h1 class="font-light text-2xl text-center max-w-lg">{{ errorMessage }}</h1>
    </div>
    <div v-if="isLoading">
      <BaseLoading :message="t('highlights.loadingHighlights')"></BaseLoading>
    </div>
    <div v-if="!isLoading" class="flex flex-col items-end mb-5">
      <div class="inline-flex items-center gap-2">
        <BaseInput
          :placeholder="`${t('common.search')}...`"
          v-model="search"
          :disabled="highlights.length <= 0"
        ></BaseInput>
        <div class="join md:join-horizontal join-vertical">
          <BaseButton
            :icon="Icons.Refresh"
            :title="t('common.reset').toUpperCase()"
            class="join-item"
            @click="search = ''"
            :disabled="highlights.length <= 0"
          ></BaseButton>
          <BaseButton
            :icon="Icons.ArrowLeft"
            :title="t('common.goBack').toUpperCase()"
            class="join-item"
            color="btn-neutral"
            @click="() => router.push({ name: 'library' })"
          ></BaseButton>
        </div>
        <input
          type="checkbox"
          class="checkbox checkbox-primary checkbox-xl"
          v-model="includeDeleted"
          :title="t('common.entitiesVisibility').toUpperCase()"
        />
        <Icon :icon="!includeDeleted ? Icons.BookCheck : Icons.BookDashed" class="text-xl"></Icon>
      </div>
    </div>
    <div
      v-if="highlights.length > 0 && !isLoading"
      class="grid md:grid-cols-2 grid-cols-1 gap-4 items-stretch"
    >
      <div v-for="quote in filteredHighlights" :key="quote.id">
        <HighlightCard
          :highlight="quote"
          :key="quote.id"
          @edit="openEditForm"
          @delete="openDeleteModal"
          @restore="openRestoreModal"
        ></HighlightCard>
      </div>
    </div>
    <!-- Edit Highlight Modal -->
    <BaseModal
      :open="showEditModal"
      :title="t('highlights.editHighlight')"
      @close="closeEditModal"
      :disableClose="true"
      width="max-w-2xl"
    >
      <div class="p-4 overflow-y-auto">
        <EditHighlightForm
          @close="closeEditModal"
          :highlightId="selectedHighlight?.id!"
          :initialValues="{
            content: selectedHighlight?.content!,
          }"
        >
        </EditHighlightForm>
      </div>
    </BaseModal>
    <!-- Delete Highlight Modal -->
    <BaseModal
      :open="showDeleteModal"
      :title="t('highlights.deleteHighlight')"
      @close="closeDeleteModal"
      :disableClose="true"
      width="max-w-lg"
    >
      <DeleteEntityForm
        type="HIGHLIGHT"
        :entity="selectedHighlight!!"
        :id="selectedHighlight?.id!!"
        @close="closeDeleteModal"
      ></DeleteEntityForm>
    </BaseModal>
    <!-- Restore Highlight Modal -->
    <BaseModal
      :open="showRestoreModal"
      :title="t('highlights.restoreHighlight')"
      @close="closeRestoreModal"
      :disableClose="true"
      width="max-w-lg"
    >
      <RestoreEntityForm
        type="HIGHLIGHT"
        :entity="selectedHighlight!!"
        :id="selectedHighlight?.id!!"
        @close="closeRestoreModal"
      ></RestoreEntityForm>
    </BaseModal>
  </div>
</template>
