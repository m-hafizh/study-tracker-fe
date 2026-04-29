import { toast } from "sonner";

export type MutationResult = {
  ok: boolean;
  offline?: boolean;
  error?: unknown;
};

const looksTechnicalErrorMessage = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("prisma") ||
    normalized.includes("connectorerror") ||
    normalized.includes("queryerror") ||
    normalized.includes("check constraint") ||
    normalized.includes("invalid `") ||
    normalized.includes("invocation")
  );
};

type MutationFeedbackMessages = {
  success: string;
  successOffline?: string;
  error: string;
};

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== "object") return fallback;

  const maybeError = error as { message?: string; response?: { data?: { message?: string } } };
  const candidate = maybeError.response?.data?.message ?? maybeError.message;

  if (!candidate) return fallback;
  if (looksTechnicalErrorMessage(candidate)) return fallback;

  return candidate;
};

export const notifyMutationResult = (
  result: MutationResult,
  messages: MutationFeedbackMessages
): boolean => {
  if (result.ok) {
    toast.success(result.offline && messages.successOffline ? messages.successOffline : messages.success);
    return true;
  }

  toast.error(getErrorMessage(result.error, messages.error));
  return false;
};
