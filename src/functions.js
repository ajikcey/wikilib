import bridge from "@vkontakte/vk-bridge";

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
    format = format.replace(/Y/, year);
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
 * Копирование строки в буфер обмена
 * @param str
 */
export function copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

/**
 * Сохраняет текст wiki-страницы
 * @param page_id
 * @param group_id
 * @param user_id
 * @param access_token
 * @param title
 * @param text
 * @returns {Promise}
 */
export function savePage(page_id, group_id, user_id, access_token, title, text) {
    return bridge.send("VKWebAppCallAPIMethod", {
        method: "pages.save",
        params: {
            page_id: page_id,
            group_id: group_id,
            user_id: user_id,
            text: text,
            title: title,
            v: "5.131",
            access_token: access_token
        }
    });
}