import configData from "../config.json";
import {Icon24CheckCircleOutline} from "@vkontakte/icons";
import {Button, FormItem, FormLayout, Input, Snackbar} from "@vkontakte/vkui";
import React, {useState} from "react";
import {fetchPage, handleError, savePage} from "../functions";

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

        if (result.title.length > configData.max_length_title) {
            setTitleError({error_msg: props.strings.too_long_title});
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

        savePage(null, props.group.id, props.accessToken.access_token, result.title, "").then(data => {

            props.setSnackbar(<Snackbar
                onClose={() => props.setSnackbar(null)}
                before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
            >{props.strings.saved}</Snackbar>);

            fetchPage(data.response, props.group.id, 0, props.accessToken.access_token).then(data => {
                if (data.response) {
                    props.setPageTitle(data.response);
                    props.onCloseModal();
                    props.go(configData.routes.page);
                } else {
                    handleError(props.strings, props.setSnackbar, props.go, {}, {
                        data: data,
                        default_error_msg: 'No response get page'
                    });
                }
            }).catch(e => {
                handleError(props.strings, props.setSnackbar, props.go, e, {
                    default_error_msg: 'Error get page'
                });
            });
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