<script setup lang="ts">
import BaseFileInput from '@/components/BaseFileInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import {
  Clipping,
  ClippingParseError,
  parseClippings,
  ParseResult,
  readFileAsText,
} from '@/features/parser';
import BaseLoading from '@/components/BaseLoading.vue';
import BaseModal from '@/components/BaseModal.vue';
const { t } = useI18n();
const file = ref<File | null>(null);
const isLoading = ref(false);
const showResultsModal = ref(false);
//TODO: Wip....!
const clippings = ref<Clipping[]>([]);
const errors = ref<ClippingParseError[]>([]);
const parseResult = ref<ParseResult | null>();
const savedBooks = ref(0);

const processFile = async () => {
  if (!file.value) return;
  isLoading.value = true;
  clippings.value = [];
  errors.value = [];
  try {
    const text = await readFileAsText(file.value);
    parseResult.value = parseClippings(text);
    clippings.value = parseResult.value.clippings;
    errors.value = parseResult.value.errors;
    await storeBooks();
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false;
    showResultsModal.value = true;
  }
};

const storeBooks = async () => {
  for (const e of clippings.value) {
    const book = await window.api.books.byTitle(e.bookName);

    if (!book) {
      savedBooks.value += 1;
      await window.api.books.create({
        title: e.bookName,
        description: '',
        author: e.author ?? null,
      });
    }
  }
};

const handleResultModal = () => {
  clippings.value = [];
  file.value = null;
  errors.value = [];
  parseResult.value = null;
  savedBooks.value = 0;
  showResultsModal.value = false;
};
</script>
<template>
  <div class="p-4 m-4">
    <h1 class="text-3xl font-semibold">{{ t('home.home') }}</h1>
    <div class="divider"></div>
    <div class="flex flex-col items-center">
      <div class="w-80 space-y-2" v-if="!isLoading">
        <BaseFileInput accept=".txt" v-model="file" width="w-full"></BaseFileInput>
        <BaseButton :label="t('common.continue')" width="w-full" @click="processFile"></BaseButton>
      </div>
      <div class="w-full" v-if="isLoading">
        <BaseLoading :message="`${t('home.processingFile')}...`"></BaseLoading>
      </div>
    </div>
  </div>

  <BaseModal
    :open="showResultsModal"
    :title="t('home.jobResult')"
    @close="showResultsModal = false"
    :disableClose="true"
    width="max-w-lg"
  >
    <div>
      <h1 class="font-light text-lg">
        {{
          t('home.highlightsFound', parseResult?.clippings?.length, {
            count: parseResult?.clippings.length,
          })
        }}
      </h1>
      <h1 class="font-light text-lg">
        {{
          t('home.errorsFound', parseResult?.errors?.length, {
            count: parseResult?.errors.length,
          })
        }}
      </h1>
      <h1 class="font-light text-lg" v-if="savedBooks <= 0">
        {{ t('home.noNewBooksSaved') }}
      </h1>
      <h1 class="font-light text-lg" v-else>
        {{
          t('home.savedBooks', savedBooks, {
            count: savedBooks,
          })
        }}
      </h1>
    </div>

    <template #footer>
      <div class="flex flex-col items-end">
        <div class="join md:join-horizontal join-vertical">
          <BaseButton
            v-if="parseResult?.errors.length"
            class="join-item"
            :label="t('home.viewErrors')"
            color="btn-error"
          ></BaseButton>
          <BaseButton
            class="join-item"
            :label="t('common.continue')"
            @click="handleResultModal"
          ></BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
