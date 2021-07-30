import configData from "../config.json";
import {Icon24CheckCircleOutline} from "@vkontakte/icons";
import {Button, FormItem, FormLayout, Radio, Snackbar} from "@vkontakte/vkui";
import React, {useState} from "react";
import {handleError} from "../functions";
import bridge from "@vkontakte/vk-bridge";

/**
 * Форма редактирования настроек доступа wiki-страницы
 * @returns {JSX.Element}
 * @constructor
 */
const FormEditAccess = (props) => {
    const [who_can_view, setWho_can_view] = useState(props.pageTitle.who_can_view);
    const [who_can_edit, setWho_can_edit] = useState(props.pageTitle.who_can_edit);

    /**
     * Сохранение настроек доступа к wiki-странице
     * @param e
     */
    const onSubmit = function (e) {
        e.preventDefault();

        bridge.send("VKWebAppCallAPIMethod", {
            method: "pages.saveAccess",
            params: {
                page_id: props.pageTitle.id,
                group_id: props.pageTitle.group_id,
                view: who_can_view,
                edit: who_can_edit,
                v: configData.vk_api_version,
                access_token: props.accessToken.access_token
            }
        }).then(data => {
            if (data.response) {
                // hot update
                let pageTitle = props.pageTitle;

                pageTitle.who_can_view = who_can_view;
                pageTitle.who_can_edit = who_can_edit;
                props.setPageTitle(pageTitle);

                props.onCloseModal();
                props.modalData.setSnackbar(null);
                props.modalData.setSnackbar(<Snackbar
                    onClose={() => props.modalData.setSnackbar(null)}
                    before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
                >
                    Сохранено
                </Snackbar>);
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

    const onChangeWho_can_view = function (e) {
        setWho_can_view(+e.currentTarget.value);
    };

    const onChangeWho_can_edit = function (e) {
        setWho_can_edit(+e.currentTarget.value);
    };

    return (
        <FormLayout onSubmit={onSubmit}>
            <FormItem top="Кто может просматривать эту страницу?">
                <Radio
                    name="who_can_view"
                    value={configData.wiki_access.all}
                    checked={who_can_view === configData.wiki_access.all}
                    onChange={onChangeWho_can_view}
                >
                    Все</Radio>
                <Radio
                    name="who_can_view"
                    value={configData.wiki_access.member}
                    checked={who_can_view === configData.wiki_access.member}
                    onChange={onChangeWho_can_view}
                >
                    Только участники</Radio>
                <Radio
                    name="who_can_view"
                    value={configData.wiki_access.staff}
                    checked={who_can_view === configData.wiki_access.staff}
                    onChange={onChangeWho_can_view}
                >
                    Только руководители</Radio>
            </FormItem>
            <FormItem top="Кто может редактировать эту страницу?">
                <Radio
                    name="who_can_edit"
                    value={configData.wiki_access.all}
                    checked={who_can_edit === configData.wiki_access.all}
                    onChange={onChangeWho_can_edit}
                    disabled={props.group && props.group.is_closed > 0}
                >
                    Все</Radio>
                <Radio
                    name="who_can_edit"
                    value={configData.wiki_access.member}
                    checked={who_can_edit === configData.wiki_access.member}
                    onChange={onChangeWho_can_edit}
                >
                    Только участники</Radio>
                <Radio
                    name="who_can_edit"
                    value={configData.wiki_access.staff}
                    checked={who_can_edit === configData.wiki_access.staff}
                    onChange={onChangeWho_can_edit}
                >
                    Только руководители</Radio>
            </FormItem>
            <Button size="l" mode="primary" stretched>
                Сохранить
            </Button>
        </FormLayout>
    );
}

export default FormEditAccess;