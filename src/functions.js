import bridge from "@vkontakte/vk-bridge";
import configData from "./config.json";
import {ANDROID, IOS, Snackbar, VKCOM} from "@vkontakte/vkui";
import {Icon24ErrorCircle} from "@vkontakte/icons";
import LocalizedStrings from "react-localization";
import en from "./languages/en.json";
import ru from "./languages/ru.json";

/**
 * Склонение слов в зависимости от числового значения
 * Пример: declOfNum(1, ['минута', 'минуты', 'минут']);
 * @param n integer
 * @param text_forms array of 3 string
 * @returns string
 */
export function declOfNum(n, text_forms) {
    n = Math.abs(n) % 100;
    let n1 = n % 10;
    if (n > 10 && n < 20) {
        return text_forms[2];
    }
    if (n1 > 1 && n1 < 5) {
        return text_forms[1];
    }
    if (n1 === 1) {
        return text_forms[0];
    }
    return text_forms[2];
}

/**
 * Преобразование timestamp в дату в формате 01.01.2021 01:02:03
 * @param timestamp
 * @param format
 * @returns {string}
 */
export function timestampToDate(timestamp, format = 'd.m.Y H:i') {
    let date = new Date(timestamp * 1000);

    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    format = format.replace(/d/, ('0' + day).slice(-2));
    format = format.replace(/m/, ('0' + month).slice(-2));
    format = format.replace(/Y/, '' + year);
    format = format.replace(/H/, ('0' + hours).slice(-2));
    format = format.replace(/i/, ('0' + minutes).slice(-2));
    format = format.replace(/s/, ('0' + seconds).slice(-2));

    return format;
}

/**
 * Сокращение числа с добавлением символов K или M, если число больше 1000 или 1000000 соответственно
 * Примеры: "123", "45,3К", "23,4М"
 * @param n
 * @returns {string}
 */
export function cutNum(n) {
    if (n >= 1000000) {
        return (Math.floor(n / 100000) / 10).toLocaleString('ru-RU') + 'M';
    } else if (n >= 1000) {
        return (Math.floor(n / 100) / 10).toLocaleString('ru-RU') + 'K';
    } else {
        return n + '';
    }
}

/**
 * Сокращение числа со склонением слов
 * @param n
 * @param text_forms
 * @returns {string}
 */
export function cutDeclNum(n, text_forms) {
    if (n >= 1000) {
        return cutNum(n) + ' ' + text_forms[2];
    }
    return n + ' ' + declOfNum(n, text_forms);
}

/**
 * Сохранение wiki-страницы
 * @param page_id
 * @param group_id
 * @param access_token
 * @param title
 * @param text
 * @returns {Promise}
 */
export function savePage(page_id, group_id, access_token, title, text) {
    let params = {
        group_id: group_id,
        text: text,
        title: title,
        v: configData.vk_api_version,
        access_token: access_token
    };

    if (page_id) params.page_id = page_id;

    return bridge.send("VKWebAppCallAPIMethod", {
        method: "pages.save",
        params: params
    });
}

/**
 * Получение информации о wiki-странице
 * @returns {Promise}
 */
export function fetchVersion(version_id, group_id, access_token) {
    return bridge.send("VKWebAppCallAPIMethod", {
        method: "pages.getVersion",
        params: {
            version_id: version_id,
            group_id: group_id,
            v: configData.vk_api_version,
            access_token: access_token
        }
    });
}

/**
 * Получение данных пользователей
 * @param user_ids
 * @param access_token
 * @returns {Promise}
 */
export function fetchUsers(user_ids, access_token) {
    return bridge.send("VKWebAppCallAPIMethod", {
        method: "users.get",
        params: {
            user_ids: user_ids.join(','),
            fields: ['photo_100'].join(','),
            v: configData.vk_api_version,
            access_token: access_token
        }
    });
}

/**
 * Обработка ошибок
 * @param strings
 * @param setSnackbar
 * @param go
 * @param e
 * @param options
 */
export function handleError(strings, setSnackbar, go, e, options) {
    let error_msg = options.default_error_msg;

    if (e) {
        console.log(e);
    }

    if (options.data) {
        console.log(options.data);
    }

    if (bridge.supports('VKWebAppTapticNotificationOccurred')) {
        bridge.send('VKWebAppTapticNotificationOccurred', {type: 'error'}).then();
    }

    if (e.error_data) {
        if (e.error_data.error_reason) {
            if (typeof e.error_data.error_reason === 'object') {
                if (e.error_data.error_reason.error_code === 5) {
                    go(configData.routes.token);
                    return;
                } else if (e.error_data.error_reason.error_code === 6) {
                    error_msg = strings.too_many_requests_per_second;
                } else if (e.error_data.error_reason.error_code === 15) {
                    error_msg = strings.access_denied;
                } else if (e.error_data.error_reason.error_code === 119) {
                    error_msg = strings.invalid_title;
                } else if (e.error_data.error_reason.error_code === 140) {
                    error_msg = strings.page_not_found;
                } else if (e.error_data.error_reason.error_code === 141) {
                    error_msg = strings.no_access_to_page;
                } else {
                    error_msg = e.error_data.error_reason.error_msg + ' (1-' + e.error_data.error_reason.error_code + ')';
                }
            } else {
                if (e.error_data.error_code === 1) {
                    error_msg = strings.network_error;
                } else if (e.error_data.error_code === 3) {
                    error_msg = strings.connection_lost;
                } else if (e.error_data.error_code === 4) {
                    error_msg = strings.user_denied;
                } else {
                    error_msg =  e.error_data.error_reason + ' (2-' + e.error_data.error_code + ')'; // бывает строкой
                }
            }
        } else if (e.error_data.error_code) {
            if (e.error_data.error_code === 5) {
                go(configData.routes.token);
                return;
            } else if (e.error_data.error_code === 6) {
                error_msg = strings.too_many_requests_per_second;
            } else if (e.error_data.error_code === 15) {
                error_msg = strings.access_denied;
            } else if (e.error_data.error_code === 119) {
                error_msg = strings.invalid_title;
            } else if (e.error_data.error_code === 140) {
                error_msg = strings.page_not_found;
            } else if (e.error_data.error_code === 141) {
                error_msg = strings.no_access_to_page;
            } else if (e.error_data.error_code === -1020) {
                error_msg = strings.network_error;
            } else {
                error_msg = e.error_data.error_msg + ' (3-' + e.error_data.error_code + ')';
            }
        }
    }

    if (setSnackbar) {
        setSnackbar(<Snackbar
            onClose={() => setSnackbar(null)}
            before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
        >
            {error_msg || JSON.stringify(e)}
        </Snackbar>);
    }
}

/**
 * Получение сообществ пользователя
 * @param offset
 * @param access_token
 * @returns {Promise}
 */
export function fetchGroups(offset, access_token) {
    return bridge.send("VKWebAppCallAPIMethod", {
        method: "groups.get",
        params: {
            extended: 1,
            fields: ['members_count', 'verified'].join(','),
            filter: 'moder',
            offset: offset,
            count: 1000,
            v: configData.vk_api_version,
            access_token: access_token
        }
    });
}

/**
 * Получение определенных сообществ
 * @param group_ids
 * @param access_token
 * @returns {Promise}
 */
export function fetchGroupsById(group_ids, access_token) {
    return bridge.send("VKWebAppCallAPIMethod", {
        method: "groups.getById",
        params: {
            group_ids: group_ids.join(','),
            fields: ['members_count', 'verified'].join(','),
            v: configData.vk_api_version,
            access_token: access_token
        }
    });
}

/**
 * Получение wiki-страниц сообщества
 * @param group_id
 * @param access_token
 * @returns {Promise}
 */
export function fetchPages(group_id, access_token) {
    return bridge.send("VKWebAppCallAPIMethod", {
        method: "pages.getTitles",
        params: {
            group_id: group_id,
            v: configData.vk_api_version,
            access_token: access_token
        }
    });
}

/**
 * Получение информации о wiki-странице
 * @param page_id
 * @param group_id
 * @param need_source
 * @param access_token
 * @returns {Promise}
 */
export function fetchPage(page_id, group_id, need_source, access_token) {
    return bridge.send("VKWebAppCallAPIMethod", {
        method: "pages.get",
        params: {
            page_id: page_id,
            owner_id: ('-' + group_id),
            need_source: need_source,
            v: configData.vk_api_version,
            access_token: access_token
        }
    });
}

/**
 * Получение списка версий wiki-страницы
 * @param page_id
 * @param group_id
 * @param access_token
 * @returns {Promise}
 */
export function fetchHistory(page_id, group_id, access_token) {
    return bridge.send("VKWebAppCallAPIMethod", {
        method: "pages.getHistory",
        params: {
            page_id: page_id,
            group_id: group_id,
            v: configData.vk_api_version,
            access_token: access_token
        }
    });
}

/**
 * Получение информации о приложении
 * @param access_token
 * @returns {Promise}
 */
export function fetchApp(access_token) {
    return bridge.send("VKWebAppCallAPIMethod", {
        method: "apps.get",
        params: {
            app_id: configData.app_id,
            return_friends: 1,
            fields: ['photo_100', 'members_count'].join(','),
            extended: 1,
            v: configData.vk_api_version,
            access_token: access_token
        }
    });
}

/**
 * Определение платформы (VKCOM, IOS, ANDROID)
 * @param params
 * @returns {Platform.VKCOM|Platform.IOS|Platform.ANDROID}
 */
export function definePlatform(params) {
    return (['desktop_web'].indexOf(params.vk_platform) > -1 ? VKCOM :
        (['mobile_ipad', 'mobile_iphone', 'mobile_iphone_messenger'].indexOf(params.vk_platform) > -1 ? IOS : ANDROID));
}

/**
 * Localized Strings
 * @returns {LocalizedStrings}
 */
export function getStrings() {
    return new LocalizedStrings({
        en: en,
        ru: ru,
    })
}

/**
 * Название уровня доступа
 * @param key
 * @param strings
 * @returns {string}
 */
export function nameAccess(key, strings) {
    switch (key) {
        case configData.wiki_access.staff:
            return strings.only_staff;
        case configData.wiki_access.member:
            return strings.only_member;
        case configData.wiki_access.all:
            return strings.all_users;
        default:
            return "";
    }
}

/**
 * Возвращает регулярное выражение с экранированными не-буквенно-цифрового символа
 * @param str
 * @returns {RegExp}
 */
export function regexpSearch(str) {
    return new RegExp(str.trim().replace(/(?=\W)/g, '\\'), "i");
}

/**
 * Получение ссылки на wiki-страницу
 * @param page_id
 * @param group_id
 * @param protocol
 * @returns {string}
 */
export function calcLink(page_id, group_id, protocol = false) {
    return (protocol ? 'https://' : '') + 'vk.com/page-' + group_id + '_' + page_id;
}