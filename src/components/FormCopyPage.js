import {Icon24CheckCircleOutline} from "@vkontakte/icons";
import {
    Button,
    FormItem,
    FormLayout,
    Input,
    NativeSelect, PanelSpinner,
    Snackbar, Spacing
} from "@vkontakte/vkui";
import React, {useEffect, useState} from "react";
import {fetchGroups, fetchPages, handleError, savePage} from "../functions";
import configData from "../config.json";

/**
 * Форма редактирования настроек доступа wiki-страницы
 * @returns {JSX.Element}
 * @constructor
 */
const FormEditAccess = (props) => {
    const [groupId, setGroupId] = useState(props.modalData.group_id);
    const [title, setTitle] = useState(props.modalData.title);
    const [titleError, setTitleError] = useState(null);

    let groups = props.groups;

    useEffect(() => {

        if (!groups) {
            moreGroups().then(() => {
            });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Показать еще сообщества
     * @returns {Promise<void>}
     */
    const moreGroups = async function () {
        fetchGroups(props.groupOffset, props.accessToken.access_token).then(data => {
            if (data.response) {
                if (!groups) groups = {};
                groups.count = data.response.count;
                groups.items = (groups.items || []).concat(data.response.items);

                props.setGroups(groups);
                props.setGroupOffset(props.groupOffset);
            } else {
                handleError(props.modalData.setSnackbar, props.go, {}, {
                    default_error_msg: 'No response get groups'
                });
            }
        }).catch(e => {
            handleError(props.modalData.setSnackbar, props.go, e, {
                default_error_msg: 'Error get groups'
            });
        });
    }

    /**
     * Копирование wiki-страницы
     * @param e
     */
    const onSubmit = async function (e) {
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

        savePage(null, groupId, props.accessToken.access_token, title, props.modalData.text).then(data => {
            if (data.response) {

                props.onCloseModal();
                props.modalData.setSnackbar(null);
                props.modalData.setSnackbar(<Snackbar
                    onClose={() => props.modalData.setSnackbar(null)}
                    before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
                >{props.strings.saved}</Snackbar>);
            } else {
                handleError(props.modalData.setSnackbar, props.go, {}, {
                    default_error_msg: 'No response save access'
                });
            }
        }).catch(e => {
            handleError(props.modalData.setSnackbar, props.go, e, {
                default_error_msg: 'Error save access'
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
                    {!groups && <PanelSpinner/>}
                    {groups && groups.items && groups.items.map((group) => {
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

export default FormEditAccess;