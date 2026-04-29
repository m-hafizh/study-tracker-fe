const rawBaseUrl = (import.meta.env.VITE_BASE_API_URL as string | undefined)?.trim() ?? '';
const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, '');

export const APIConfiguration = {
    baseURL: `${normalizedBaseUrl}/v1`,
    APIKey: (import.meta.env.VITE_PRIVATE_API_KEY as string | undefined)?.trim() ?? '',
};