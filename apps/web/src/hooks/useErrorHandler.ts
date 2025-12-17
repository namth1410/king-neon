"use client";

import { useToast } from "@/components/Toast";
import { useTranslation } from "@/i18n/client";
import { ErrorCode } from "@king-neon/shared";

export interface ApiError {
  code: ErrorCode | string;
  message: string;
  statusCode?: number;
}

export function useErrorHandler() {
  const { error } = useToast();
  const { t } = useTranslation("common");

  const handleError = (err: unknown) => {
    console.error("Handled Error:", err);

    let message = t("errors.INTERNAL_SERVER_ERROR");
    let code: string | undefined;

    if (typeof err === "object" && err !== null) {
      const apiError = err as ApiError;

      // If we have a specific code, try to translate it
      if (apiError.code) {
        code = apiError.code;
        // Check if translation exists for this code, if not fall back to server message or default
        const translationKey = `errors.${apiError.code}`;
        const translatedMessage = t(translationKey);

        // If translation returns key (meaning no translation found) and we have a server message, use server message
        if (translatedMessage === translationKey && apiError.message) {
          message = apiError.message;
        } else if (translatedMessage !== translationKey) {
          message = translatedMessage;
        }
      } else if (apiError.message) {
        message = apiError.message;
      }
    } else if (typeof err === "string") {
      message = err;
    }

    error(message, {
      duration: 5000,
      dismissible: true,
    });

    return { message, code };
  };

  return { handleError };
}
