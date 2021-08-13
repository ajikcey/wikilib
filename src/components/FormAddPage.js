import configData from "../config.json";
import {Button, FormItem, FormLayout, Input} from "@vkontakte/vkui";
import React, {useState} from "react";
import {fetchPage, fetchPages, handleError, savePage} from "../functions";

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
    const onSubmit = async (e) => {
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
        await fetchPages(props.group.id, props.accessToken.access_token).then(data => {
            if (data.response) {
                data.response.forEach((value) => {
                    if (value.title === result.title) page_exists = true;
                });
            } else {
                props.onCloseModal();
                handleError(props.strings, props.modalData.setSnackbar, props.go, {}, {
                    data: data,
                    default_error_msg: 'No response get pages'
                });
            }
        }).catch(e => {
            props.onCloseModal();
            handleError(props.strings, props.modalData.setSnackbar, props.go, e, {
                default_error_msg: 'Error get pages'
            });
        });

        if (page_exists) {
            setTitleError({error_msg: props.strings.page_exists});
            return;
        }

        savePage(null, props.group.id, props.accessToken.access_token, result.title, "").then(async data => {
            if (data.response) {

                await fetchPage(data.response, props.group.id, 0, props.accessToken.access_token).then(data => {
                    if (data.response) {
                        props.setPageTitle(data.response);
                    } else {
                        handleError(props.strings, props.modalData.setSnackbar, props.go, {}, {
                            data: data,
                            default_error_msg: 'No response get page'
                        });
                    }
                }).catch(e => {
                    handleError(props.strings, props.modalData.setSnackbar, props.go, e, {
                        default_error_msg: 'Error get page'
                    });
                });

                props.onCloseModal();
                props.go(configData.routes.page);
            } else {
                props.onCloseModal();
                handleError(props.strings, props.modalData.setSnackbar, props.go, {}, {
                    default_error_msg: 'No response save page'
                });
            }
        }).catch(e => {
            props.onCloseModal();
            handleError(props.strings, props.modalData.setSnackbar, props.go, e, {
                default_error_msg: 'Error save page'
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
                bottom={
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <div>{titleError && titleError.error_msg ? titleError.error_msg : ''}</div>
                        <div>
                            {title.length + ' / ' + configData.max_length_title}
                        </div>
                    </div>
                }
            >
                <Input
                    autoFocus={true}
                    onChange={onChangeTitle}
                    value={title}
                    maxLength={configData.max_length_title}
                />
            </FormItem>
            <Button type='submit' size="l" mode="primary" stretched>
                {props.strings.create}
            </Button>
        </FormLayout>
    );
}

export default FormAddPage;