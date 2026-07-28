const AI_ACTION_BLOCK = /\[ACTION[\s\S]*?(?:\[\/ACTION\]|$)/g;
const ASK_ACCOUNT_TAG = /\[ASK_ACCOUNT:([^\]]*)\]/;
const SHOW_CHART_TAG = /\[SHOW_CHART:([^\]]*)\]/;
const PRESENTATION_CONTROL_TAG =
  /\[(?:ASK_ACCOUNT|SHOW_CHART)(?::[^\]]*)?(?:\]|$)/g;

export interface ParsedAiResponse {
  markdown: string;
  accountOptions: string[];
  chartType: string | null;
}

export function stripAiActionBlocks(text: string): string {
  return text
    .replace(AI_ACTION_BLOCK, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function parseAiResponse(text: string): ParsedAiResponse {
  const withoutActions = stripAiActionBlocks(text);
  const accountMatch = withoutActions.match(ASK_ACCOUNT_TAG);
  const chartMatch = withoutActions.match(SHOW_CHART_TAG);

  return {
    markdown: withoutActions
      .replace(PRESENTATION_CONTROL_TAG, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
    accountOptions: accountMatch
      ? accountMatch[1]
          .split(",")
          .map((option) => option.trim())
          .filter(Boolean)
      : [],
    chartType: chartMatch?.[1]?.trim() || null,
  };
}

export function aiResponseToPlainText(text: string): string {
  const { markdown } = parseAiResponse(text);

  return markdown
    .replace(/```(?:[a-z0-9_-]+)?\s*([\s\S]*?)```/gi, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^\s*[-+*]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*[-:| ]{3,}\s*$/gm, "")
    .replace(/\[(?:x| )\]\s*/gi, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s*\|\s*/g, ", ")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, ", ")
    .replace(/\s{2,}/g, " ")
    .replace(/(?:\.\s*){2,}/g, ". ")
    .trim();
}
