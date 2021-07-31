import configData from "../config.json";
import {Icon24CheckCircleOutline} from "@vkontakte/icons";
import {Button, FormItem, FormLayout, Snackbar, Textarea, usePlatform, VKCOM} from "@vkontakte/vkui";
import React, {useState} from "react";
import {savePage} from "../functions";

/**
 * Форма редактирования wiki-страницы
 * @returns {JSX.Element}
 * @constructor
 */
const FromEditPage = (props) => {
    const [text, setText] = useState(props.content.source);
    const [textError, setTextError] = useState(null);

    const platform = usePlatform();

    /**
     * Применить данную версию wiki-страницы
     */
    const onSubmit = (e) => {
        e.preventDefault();

        if (textError) {
            return;
        }

        const result = {
            text: text.trim()
        };

        setText(result.text);
        if (!result.text) {
            setTextError({error_msg: 'Введите текст'});
            return;
        }

        savePage(props.content.page_id, props.group.id, props.accessToken.access_token, null, result.text).then(() => {

            props.setSnackbar(<Snackbar
                onClose={() => props.setSnackbar(null)}
                before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
            >{props.strings.saved}</Snackbar>);

            props.go(configData.routes.page);
        });
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
                    {props.content.version ? 'Применить данную версию' : props.strings.save}
                </Button>
            </FormItem>
        </FormLayout>
    );
}

export default FromEditPage;