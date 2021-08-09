import {
    Button,
    FormItem,
    FormLayout,
    Input,
    NativeSelect, PanelSpinner,
    Spacing
} from "@vkontakte/vkui";
import React, {useState} from "react";
import {fetchGroupsById, fetchPage, fetchPages, handleError, savePage} from "../functions";
import configData from "../config.json";

/**
 * Форма копирования wiki-страницы
 * @returns {JSX.Element}
 * @constructor
 */
const FormCopyPage = (props) => {
    const [groupId, setGroupId] = useState(props.modalData.group_id);
    const [title, setTitle] = useState(props.modalData.title);
    const [titleError, setTitleError] = useState(null);

    /**
     * Копирование wiki-страницы
     * @param e
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

        if (result.title.length > configData.max_length_title) {
            setTitleError({error_msg: props.strings.too_long_title});
            return;
        }

        let page_exists = false;
        await fetchPages(groupId, props.accessToken.access_token).then(data => {
            if (data.response) {
                data.response.forEach((value) => {
                    if (value.title === result.title) page_exists = true;
                });
            }
        });

        if (page_exists) {
            setTitleError({error_msg: props.strings.page_exists});
            return;
        }

        savePage(null, groupId, props.accessToken.access_token, title, props.modalData.text).then(async data => {
            if (data.response) {

                if (groupId !== props.modalData.group_id) {
                    await fetchGroupsById([groupId], props.accessToken.access_token).then(data => {
                        if (data.response) {
                            props.setGroup(data.response[0]);
                        } else {
                            handleError(props.strings, props.setSnackbar, props.go, {}, {
                                default_error_msg: 'No response get groups by id'
                            });
                        }
                    }).catch(e => {
                        handleError(props.strings, props.setSnackbar, props.go, e, {
                            default_error_msg: 'Error get groups by id'
                        });
                    });
                }

                await fetchPage(data.response, groupId, 0, props.accessToken.access_token).then(data => {
                    if (data.response) {
                        props.setPageTitle(data.response);
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

                props.onCloseModal();
                props.go(configData.routes.page);
            } else {
                handleError(props.strings, props.modalData.setSnackbar, props.go, {}, {
                    default_error_msg: 'No response save page'
                });
            }
        }).catch(e => {
            handleError(props.strings, props.modalData.setSnackbar, props.go, e, {
                default_error_msg: 'Error save page'
            });
        });
    };

    const onChangeTitle = (e) => {
        setTitle(e.currentTarget.value);

        if (!e.currentTarget.value) {
            setTitleError({error_msg: props.strings.enter_title});
        } else {
            setTitleError(null);
        }
    };

    const onChangeGroup = (e) => {
        setGroupId(+e.target.value);
    };

    return (
        <FormLayout onSubmit={onSubmit}>
            <FormItem
                top={props.strings.community}
                style={{paddingLeft: 0, paddingRight: 0}}>
                <NativeSelect
                    onChange={onChangeGroup}
                    defaultValue={groupId}
                >
                    {!props.groups && <PanelSpinner/>}
                    {props.groups && props.groups.items && props.groups.items.map((group) => {
                        return (
                            <option
                                value={group.id}
                            >
                                {group.name}
                            </option>
                        );
                    })}
                </NativeSelect>
            </FormItem>
            <FormItem
                top={props.strings.page_title}
                status={titleError ? 'error' : ''}
                bottom={titleError && titleError.error_msg ? titleError.error_msg : ''}
                style={{paddingLeft: 0, paddingRight: 0}}
            >
                <Input
                    onChange={onChangeTitle}
                    value={title}
                />
            </FormItem>

            <Spacing size={16}/>

            <Button type='submit' size="l" mode="primary" stretched>
                {props.strings.copy}
            </Button>
        </FormLayout>
    );
}

export default FormCopyPage;