import {
    Button, Caption,
    FormItem,
    FormLayout,
    Input,
    NativeSelect, ScreenSpinner,
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

        props.setPopout(<ScreenSpinner size='large'/>);

        let page_exists = false;
        await fetchPages(groupId, props.accessToken.access_token).then(data => {
            if (data.response) {
                data.response.forEach((value) => {
                    if (value.title === result.title) page_exists = true;
                });
            } else {
                props.setPopout(null);
                props.onCloseModal();
                handleError(props.strings, props.modalData.setSnackbar, props.go, {}, {
                    data: data,
                    default_error_msg: 'No response get pages'
                });
            }
        }).catch(e => {
            props.setPopout(null);
            props.onCloseModal();
            handleError(props.strings, props.modalData.setSnackbar, props.go, e, {
                default_error_msg: 'Error get pages'
            });
        });

        if (page_exists) {
            props.setPopout(null);
            setTitleError({error_msg: props.strings.page_exists});
            return;
        }

        await savePage(null, groupId, props.accessToken.access_token, title, props.modalData.text).then(async data => {
            if (data.response) {

                if (groupId !== props.modalData.group_id) {
                    await fetchGroupsById([groupId], props.accessToken.access_token).then(data => {
                        if (data.response) {
                            props.setGroup(data.response[0]);
                        } else {
                            handleError(props.strings, props.modalData.setSnackbar, props.go, {}, {
                                default_error_msg: 'No response get groups by id'
                            });
                        }
                    }).catch(e => {
                        handleError(props.strings, props.modalData.setSnackbar, props.go, e, {
                            default_error_msg: 'Error get groups by id'
                        });
                    });
                }

                await fetchPage(data.response, groupId, 0, props.accessToken.access_token).then(data => {
                    if (data.response) {
                        props.onCloseModal();
                        props.go(configData.routes.pages);
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

        props.setPopout(null);
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
        setTitleError(null);
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
                    {props.groups && props.groups.items && props.groups.items.map((group, index) => {
                        return (
                            <option
                                key={index}
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
                bottom={
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <Caption>{titleError && titleError.error_msg ? titleError.error_msg : ''}</Caption>
                        <Caption>{title.length + '/' + configData.max_length_title}</Caption>
                    </div>
                }
                style={{paddingLeft: 0, paddingRight: 0}}
            >
                <Input
                    onChange={onChangeTitle}
                    value={title}
                    autoFocus={true}
                    maxLength={configData.max_length_title}
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