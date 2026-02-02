export interface Clipping {
  bookName: string;
  author?: string;
  date: Date | null;
  location: string;
  content: string;
}

export interface ClippingParseError {
  block: string;
  reason: string;
  line?: number;
  absoluteLine?: number;
}

export interface ParseResult {
  clippings: Clipping[];
  errors: ClippingParseError[];
}

type ParseSuccess = { ok: true; data: Clipping };
type ParseFailure = { ok: false; error: ClippingParseError };

type ParseOutcome = ParseSuccess | ParseFailure;

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;

    reader.readAsText(file, 'utf-8');
  });
}

export function parseSingleClipping(block: string): ParseOutcome {
  const lines = block.split('\n').map((l) => l.trim());

  if (lines.length < 3) {
    return {
      ok: false,
      error: {
        block,
        reason: 'errors.notEnoughLines',
      },
    };
  }

  const titleMatch = lines[0].match(/^(.*?)(?:\s+\((.*?)\))?$/);
  const bookName = titleMatch?.[1]?.trim();
  const author = titleMatch?.[2]?.trim();

  if (!bookName) {
    return {
      ok: false,
      error: {
        block,
        reason: 'errors.missingBookName',
        line: 1,
      },
    };
  }

  const metaLine = lines[1];
  const locationMatch = metaLine.match(/Location ([\d-]+)/);
  const dateMatch = metaLine.match(/Added on (.+)$/);

  if (!locationMatch) {
    return {
      ok: false,
      error: {
        block,
        reason: 'errors.missingLocationMetadata',
        line: 2,
      },
    };
  }

  const content = lines.slice(3).join('\n').trim();

  if (!content) {
    return {
      ok: false,
      error: {
        block,
        reason: 'errors.emptyHighlight',
      },
    };
  }

  return {
    ok: true,
    data: {
      bookName,
      author,
      location: locationMatch[1],
      date: dateMatch ? new Date(dateMatch[1]) : null,
      content,
    },
  };
}

export function parseClippings(text: string): ParseResult {
  const result: ParseResult = {
    clippings: [],
    errors: [],
  };

  const lines = text.split('\n');

  let currentBlock: string[] = [];
  let blockStartLine = 1;

  function flushBlock() {
    if (currentBlock.length === 0) return;

    const blockText = currentBlock.join('\n');
    const outcome = parseSingleClipping(blockText);

    if (outcome.ok) {
      result.clippings.push(outcome.data);
    } else {
      const errorLine = outcome.error.line;

      result.errors.push({
        ...outcome.error,
        absoluteLine: errorLine ? blockStartLine + errorLine - 1 : blockStartLine,
      });
    }

    currentBlock = [];
  }

  lines.forEach((line, index) => {
    if (line.trim() === '==========') {
      flushBlock();
      blockStartLine = index + 2;
    } else {
      if (currentBlock.length === 0) {
        blockStartLine = index + 1;
      }
      currentBlock.push(line);
    }
  });

  flushBlock();

  return result;
}
