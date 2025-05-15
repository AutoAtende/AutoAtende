import React, { createContext, useState, useContext } from "react";
import api from "../../services/api";

let cachedSettings = [];

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState([]);

    const getCachedByKey = (key) => {
        if (settings?.length) {
            return settings.find((setting) => setting.key === key);
        }
        if (!cachedSettings.length) {
            return null;
        }
        for (let cached of cachedSettings) {
            if (cached.key === key) {
                return cached;
            }
        }
    };

    const getCachedSetting = async (key) => {
        if (settings?.length) {
            return settings.find((setting) => setting.key === key);
        }
        if (!cachedSettings.length) {
            cachedSettings = await getAll();
        }
        return getCachedByKey(key);
    };

    const getAll = async (params) => {
        const { data } = await api.request({
            url: '/settings',
            method: 'GET',
            params
        });
        return data;
    };

    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: `/settings/${data.key}`,
            method: 'PUT',
            data
        });

        let found = false;
        for (let cached of cachedSettings) {
            if (cached.key === data.key) {
                cached.value = data.value;
                found = true;
                break;
            }
        }
        if (!found) {
            cachedSettings.push(data);
        }
        return responseData;
    };

    const getPublicSetting = async (key) => {
        const { data } = await api.request({
            url: `/public-settings/${key}`,
            method: 'GET'
        });
        return data;
    };

    const getAllPublicSetting = async () => {
        const { data } = await api.request({
            url: `/public-settings`,
            method: 'GET'
        });
        return data;
    };

    const updateWebhook = async (data) => {
        await api.request({
            url: `/queueIntegration/create_or_update`,
            method: 'POST',
            data
        })
    }
    const deleteWebhookByparamName = async (paramName) => {
        await api.request({
            url: `/queueIntegration/deleteWebhookByparamName`,
            method: 'POST',
            data: {
                paramName
            }
        })
    }
    const getWebhook = async (paramName) => {
        const { data } = await api.request({
            url: `/queueIntegration/getWebhook`,
            method: 'POST',
            data: {
                paramName
            }
        })
        return data
    }

    return (
        <SettingsContext.Provider
            value={{
                getAll,
                getPublicSetting,
                getAllPublicSetting,
                update,
                getCachedSetting,
                setSettings,
                settings,
                updateWebhook,
                deleteWebhookByparamName,
                getWebhook
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

const useSettings = () => {
    return useContext(SettingsContext);
};

export default useSettings;