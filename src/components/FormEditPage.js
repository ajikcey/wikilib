import configData from "../config.json";
import {Icon24CheckCircleOutline} from "@vkontakte/icons";
import {Button, FormItem, FormLayout, Input, Snackbar, Textarea, usePlatform, VKCOM} from "@vkontakte/vkui";
import React, {useState} from "react";
import {savePage} from "../functions";

/**
 * Форма редактирования wiki-страницы
 * @returns {JSX.Element}
 * @constructor
 */
const FromEditPage = (props) => {
    const [title, setTitle] = useState(props.content.title);
    const [text, setText] = useState(props.content.source);
    const [titleError, setTitleError] = useState(null);
    const [textError, setTextError] = useState(null);

    const platform = usePlatform();

    /**
     * Применить данную версию wiki-страницы
     */
    const onSubmit = (e) => {
        e.preventDefault();

        if (titleError || textError) {
            return;
        }

        const result = {
            title: title.trim(),
            text: text.trim()
        };

        setTitle(result.title);
        setText(result.text);

        if (!result.title) {
            setTitleError({error_msg: 'Введите название'});
            return;
        }

        if (!result.text) {
            setTextError({error_msg: 'Введите текст'});
            return;
        }

        savePage(props.content.page_id, props.group.id, props.accessToken.access_token, result.title, result.text).then(() => {

            props.setSnackbar(<Snackbar
                onClose={() => props.setSnackbar(null)}
                before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
            >
                Сохранено
            </Snackbar>);

            props.go(configData.routes.page);
        });
    }

    /**
     * Изменение названия
     * @param e
     */
    const onChangeTitle = (e) => {
        setTitle(e.currentTarget.value);

        if (!e.currentTarget.value) {
            setTitleError({error_msg: 'Введите название'});
        } else {
            setTitleError(null);
        }
    }

    /**
     * Изменение текста
     * @param e
     */
    const onChangeText = (e) => {
        setText(e.currentTarget.value);

        if (!e.currentTarget.value) {
            setTextError({error_msg: 'Введите текст'});
        } else {
            setTextError(null);
        }
    }

    return (
        <FormLayout onSubmit={onSubmit}>
            <FormItem
                top="Название"
                status={titleError ? 'error' : ''}
                bottom={titleError && titleError.error_msg ? titleError.error_msg : ''}
            >
                <Input
                    name='title'
                    placeholder="Введите название"
                    onChange={onChangeTitle}
                    value={title}
                    readOnly
                />
            </FormItem>
            <FormItem
                top="Текст"
                status={textError ? 'error' : ''}
                bottom={textError && textError.error_msg ? textError.error_msg : ''}
            >
                <Textarea
                    rows={20}
                    name='text'
                    placeholder="Введите текст"
                    onChange={onChangeText}
                    value={text}
                />
            </FormItem>
            <FormItem style={{textAlign: 'right'}}>
                <Button
                    size="l"
                    stretched={platform !== VKCOM}
                >
                    {props.content.version ? 'Применить данную версию' : 'Сохранить'}
                </Button>
            </FormItem>
        </FormLayout>
    );
}

export default FromEditPage;