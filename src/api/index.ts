import axios from 'axios';
import { APIConfiguration } from '@/configs/api.config';
import { readStoredSession, writeStoredSession, clearStoredSession } from '@/features/auth/session';
import { refreshAccessToken } from '@/api/auth';

type RetriableRequestConfig = {
    _retry?: boolean;
    headers?: Record<string, string>;
};

export const customAxios = axios.create({
    baseURL: APIConfiguration.baseURL,
    headers: {
        'Content-Type': 'application/json',
        ...(APIConfiguration.APIKey ? { 'API-Key': APIConfiguration.APIKey } : {}),
    }
});

customAxios.interceptors.request.use((config) => {
    const session = readStoredSession();

    if (session?.accessToken) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>).Authorization = `Bearer ${session.accessToken}`;
    }

    return config;
});

customAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error?.response?.status;
        const originalRequest = error?.config as RetriableRequestConfig | undefined;

        if (status !== 401 || !originalRequest || originalRequest._retry) {
            return Promise.reject(error);
        }

        const currentSession = readStoredSession();
        if (!currentSession?.refreshToken) {
            clearStoredSession();
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const refreshed = await refreshAccessToken({
                refreshToken: currentSession.refreshToken,
            });

            writeStoredSession({
                accessToken: refreshed.accessToken,
                refreshToken: refreshed.refreshToken,
                expiresAt: refreshed.expiresAt,
            });

            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;

            return customAxios(originalRequest);
        } catch (refreshError) {
            clearStoredSession();
            return Promise.reject(refreshError);
        }
    }
);