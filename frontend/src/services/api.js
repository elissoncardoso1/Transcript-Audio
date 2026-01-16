import axios from 'axios';

const API_Base_URL = 'http://localhost:8080';

// Configure axios to send credentials (cookies) with requests
axios.defaults.withCredentials = true;

export const api = {
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('audio_file', file);
        const response = await axios.post(`${API_Base_URL}/upload`, formData);
        return response.data;
    },

    uploadBatch: async (files, sessionName) => {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('audio_files', files[i]);
        }
        formData.append('session_name', sessionName || '');
        const response = await axios.post(`${API_Base_URL}/upload_batch`, formData);
        return response.data;
    },

    transcribe: async (language, model) => {
        const response = await axios.post(`${API_Base_URL}/transcribe`, { language, model });
        return response.data;
    },

    transcribeBatch: async (batchId, language, model) => {
        const response = await axios.post(`${API_Base_URL}/transcribe_batch`, { batch_id: batchId, language, model });
        return response.data;
    },

    getTranscriptionStatus: async () => {
        const response = await axios.get(`${API_Base_URL}/transcription_status`);
        return response.data;
    },

    getBatchStatus: async (batchId) => {
        const response = await axios.get(`${API_Base_URL}/batch_status/${batchId}`);
        return response.data;
    },

    listModels: async () => {
        const response = await axios.get(`${API_Base_URL}/models`);
        return response.data;
    },

    getStorageInfo: async () => {
        const response = await axios.get(`${API_Base_URL}/storage_info`);
        return response.data;
    },

    clearUploads: async () => {
        const response = await axios.post(`${API_Base_URL}/clear_uploads`);
        return response.data;
    },

    getHistory: async () => {
        const response = await axios.get(`${API_Base_URL}/history`);
        return response.data;
    },

    clearHistory: async () => {
        const response = await axios.post(`${API_Base_URL}/clear_history`);
        return response.data;
    }
};
