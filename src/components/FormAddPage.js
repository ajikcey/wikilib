import configData from "../config.json";
import {Icon24CheckCircleOutline} from "@vkontakte/icons";
import {Button, FormItem, FormLayout, Input, Snackbar} from "@vkontakte/vkui";
import React, {useState} from "react";
import {savePage} from "../functions";

/**
 * Форма создания wiki-страницы
 * @returns {JSX.Element}
 * @constructor
 */
const FormAddPage = (props) => {
    const [title, setTitle] = useState("");
    const [titleError, setTitleError] = useState(null);

    /**
     * Применить данную версию wiki-страницы
     */
    const onSubmit = (e) => {
        e.preventDefault();

        if (titleError) {
            return;
        }

        const result = {
            title: title.trim()
        };
        setTitle(result.title);

        if (!result.title) {
            setTitleError({error_msg: props.strings.enter_title});
            return;
        }

        let page_exists = false;
        props.pages.forEach((value) => {
            if (value.title === result.title) page_exists = true;
        });

        if (page_exists) {
            setTitleError({error_msg: props.strings.page_exists});
            return;
        }

        savePage(null, props.group.id, props.accessToken.access_token, result.title, "").then(() => {

            props.setSnackbar(<Snackbar
                onClose={() => props.setSnackbar(null)}
                before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
            >{props.strings.saved}</Snackbar>);

            props.onCloseModal();
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
            setTitleError({error_msg: props.strings.enter_title});
        } else {
            setTitleError(null);
        }
    }

    return (
        <FormLayout onSubmit={onSubmit}>
            <FormItem
                top={props.strings.page_title}
                style={{paddingLeft: 0, paddingRight: 0}}
                status={titleError ? 'error' : ''}
                bottom={titleError && titleError.error_msg ? titleError.error_msg : ''}
            >
                <Input
                    name='title'
                    autoFocus={true}
                    placeholder=''
                    onChange={onChangeTitle}
                    value={title}
                />
            </FormItem>
            <Button type='submit' size="l" mode="primary" stretched>
                {props.strings.create}
            </Button>
        </FormLayout>
    );
}

export default FormAddPage;