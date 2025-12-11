import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8101/api';

export interface ReviewResponse {
    id: number;
    pr_url: string;
    status: 'pending' | 'completed' | 'failed';
    result: string | null;
    created_at: string;
}

export const api = axios.create({
    baseURL: API_URL,
});

export const createReview = async (prUrl: string) => {
    const response = await api.post<ReviewResponse>('/reviews', { pr_url: prUrl });
    return response.data;
}

export const listReviews = async () => {
    const response = await api.get<ReviewResponse[]>('/reviews');
    return response.data;
}

export const getReview = async (id: number) => {
    const response = await api.get<ReviewResponse>(`/reviews/${id}`);
    return response.data;
}

export const deleteReview = async (id: number) => {
    await api.delete(`/reviews/${id}`);
}

export interface Config {
    GITCODE_ACCESS_TOKEN: string;
    GITHUB_ACCESS_TOKEN: string;
    AI_PROVIDER: string;
    OPENAI_API_KEY: string;
    OPENAI_MODEL_NAME: string;
    OPENAI_BASE_URL: string;
    VOLC_API_KEY: string;
    VOLC_MODEL: string;
    VOLC_BASE_URL: string;
    SYSTEM_PROMPT: string;
    GITCODE_API_URL: string;
    GITHUB_API_URL: string;
}

export const getConfig = async () => {
    const response = await api.get<Config>('/config');
    return response.data;
}

export const updateConfig = async (config: Partial<Config>) => {
    const response = await api.patch<{ message: string, config: Partial<Config> }>('/config', config);
    return response.data;
}
