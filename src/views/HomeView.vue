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
import { Icons } from '@/constants/icons.ts';
import { Icon } from '@iconify/vue';
import appLogo from '@/assets/images/logo-transparent.png';

const { t } = useI18n();
const file = ref<File | null>(null);
const isLoading = ref(false);
const showResultsModal = ref(false);
const showErrorsModal = ref(false);
const showHelpModal = ref(false);

const clippings = ref<Clipping[]>([]);
const errors = ref<ClippingParseError[]>([]);
const parseResult = ref<ParseResult | null>();
const savedBooks = ref(0);
const savedHighlights = ref(0);
const errorMessage = ref('');

const processFile = async () => {
  if (!file.value) return;
  isLoading.value = true;
  clippings.value = [];
  errors.value = [];
  errorMessage.value = '';
  try {
    const text = await readFileAsText(file.value);
    parseResult.value = parseClippings(text);
    clippings.value = parseResult.value.clippings;
    errors.value = parseResult.value.errors;
    await storeBooks().then(async () => await storeHighlights());
    isLoading.value = false;
    showResultsModal.value = true;
  } catch (error: any) {
    errorMessage.value = error?.message ?? String(error);
    isLoading.value = false;
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
        author: e.author ?? undefined,
      });
    }
  }
};

const storeHighlights = async () => {
  if (!clippings.value.length) return;

  const seen = new Set<string>();
  for (const c of clippings.value) {
    const key = `${c.bookName}::${c.content.trim()}`;

    if (seen.has(key)) continue;
    seen.add(key);
    await storeHighlightIfNotExists(c);
  }
};

const storeHighlightIfNotExists = async (c: Clipping) => {
  const book = await window.api.books.byTitle(c.bookName);

  if (!book) return;

  const exists = await window.api.highlights.exists(book.id, c.content.trim());
  if (exists) return;
  await window.api.highlights.create({
    bookId: book.id,
    date: c.date,
    location: c.location,
    content: c.content,
  });
  savedHighlights.value += 1;
};

const openErrorModal = () => {
  showResultsModal.value = false;
  showErrorsModal.value = true;
};

const handleCloseModal = () => {
  clippings.value = [];
  file.value = null;
  errors.value = [];
  errorMessage.value = '';
  parseResult.value = null;
  savedBooks.value = 0;
  showResultsModal.value = false;
  showErrorsModal.value = false;
};

const blockLines = (block: string) => {
  return block
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => line.length > 0);
};
</script>
<template>
  <div class="p-4 m-4">
    <h1 class="text-3xl font-semibold">{{ t('home.home') }}</h1>
    <div class="divider"></div>
    <div class="flex flex-col items-center">
      <div class="space-y-2" v-if="!isLoading">
        <div class="w-80 space-y-2">
          <img :src="appLogo" alt="App Logo" @dragstart.prevent @contextmenu.prevent />
          <BaseFileInput accept=".txt" v-model="file" width="w-full"></BaseFileInput>
          <BaseButton
            :label="t('common.continue')"
            width="w-full"
            @click="processFile"
          ></BaseButton>
          <BaseButton
            :label="t('common.needHelp')"
            width="w-full"
            color="btn-secondary"
            @click="showHelpModal = true"
          ></BaseButton>
        </div>
      </div>
      <div class="w-full" v-if="isLoading">
        <BaseLoading :message="`${t('home.processingFile')}...`"></BaseLoading>
      </div>
      <p v-if="errorMessage != ''" class="font-semibold text-error pt-4 w-75">
        {{ t('errors.parsingError', { error: errorMessage }) }}
      </p>
    </div>
  </div>

  <!-- Results Modal -->
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
          t('home.highlightsFound', {
            count: parseResult?.clippings.length,
          })
        }}
      </h1>
      <h1 class="font-light text-lg">
        {{
          t('home.errorsFound', {
            count: parseResult?.errors.length,
          })
        }}
      </h1>
      <h1 class="font-light text-lg" v-if="savedBooks <= 0">
        {{ t('home.noNewBooksSaved') }}
      </h1>
      <h1 class="font-light text-lg" v-else>
        {{
          t('home.savedBooks', {
            count: savedBooks,
          })
        }}
      </h1>
      <h1 class="font-light text-lg" v-if="savedHighlights <= 0">
        {{ t('home.noNewHighlightsSaved') }}
      </h1>
      <h1 class="font-light text-lg" v-else>
        {{
          t('home.savedHighlights', {
            count: savedHighlights,
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
            @click="openErrorModal"
          ></BaseButton>
          <BaseButton
            class="join-item"
            :label="t('common.continue')"
            @click="handleCloseModal"
          ></BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
  <!-- Results Modal -->

  <!-- Errors Modal -->
  <BaseModal
    :open="showErrorsModal"
    :title="t('home.jobErrors')"
    @close="handleCloseModal"
    :disableClose="false"
    width="max-w-5xl"
  >
    <div class="grid md:grid-cols-1 grid-cols-1 gap-2 overflow-y-auto max-h-[400px]">
      <div v-for="(error, index) in errors" :key="index">
        <div class="collapse collapse-arrow bg-base-100 border-base-300 border">
          <input type="checkbox" />
          <div class="collapse-title font-semibold whitespace-pre-line">
            {{ t('home.errorDescription', { id: index + 1, line: error.absoluteLine }) }}
          </div>
          <div class="collapse-content">
            <div class="inline-flex items-center space-x-2">
              <Icon :icon="Icons.Alert" class="text-md text-error"></Icon>
              <span class="font-semibold text-md"
                >{{ t(error.reason)
                }}<span v-if="error.line"> ({{ t('common.line') }}: {{ error.line }})</span></span
              >
            </div>
            <div class="mockup-code w-full my-2" v-if="error.line">
              <pre
                v-for="(blockLine, index) in blockLines(error.block)"
                :key="index"
                :data-prefix="index + 1"
                :class="[index + 1 === error.line ? 'bg-warning' : '']"
              >
                <code>{{blockLine}}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
  <!-- Errors Modal -->

  <!-- Help Modal -->
  <BaseModal
    :open="showHelpModal"
    :title="t('home.userGuide')"
    @close="showHelpModal = false"
    :disableClose="false"
    width="max-w-xl"
  >
    <div>
      <ul class="list-decimal list-inside font-light text-md mb-2 space-y-2">
        <li>{{ t('userGuide.stepOne') }}</li>
        <li>{{ t('userGuide.stepTwo') }}</li>
        <li>{{ t('userGuide.stepThree') }}</li>
        <li>{{ t('userGuide.stepFour') }}</li>
      </ul>
      <p class="text-center font-semibold">{{ t('userGuide.info') }}</p>
    </div>
  </BaseModal>
  <!-- Help Modal -->
</template>
