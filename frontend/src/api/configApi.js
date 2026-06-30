import axiosClient from './axiosClient';

const configApi = {
    getAllConfigs: () => {
        return axiosClient.get('/config');
    },

    updateConfig: (configKey, configValue) => {
        return axiosClient.put(`/config/${configKey}`, { configValue });
    }
};

export default configApi;
