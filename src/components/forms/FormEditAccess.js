import configData from "../../config.json";
import {Icon24CheckCircleOutline} from "@vkontakte/icons";
import {Button, FormItem, FormLayout, Radio, Snackbar} from "@vkontakte/vkui";
import React, {useState} from "react";
import {handleError, nameAccess} from "../../functions";
import bridge from "@vkontakte/vk-bridge";
import {useRouter} from "@happysanta/router";

const FormEditAccess = (props) => {
    const [who_can_view, setWho_can_view] = useState(props.modalData.infoPage.who_can_view);
    const [who_can_edit, setWho_can_edit] = useState(props.modalData.infoPage.who_can_edit);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const onSubmit = async function (e) {
        let system_error = null;

        e.preventDefault();

        if (loading) return;
        setLoading(true);

        await bridge.send("VKWebAppCallAPIMethod", {
            method: "pages.saveAccess",
            params: {
                page_id: props.modalData.infoPage.id,
                group_id: props.modalData.infoPage.group_id,
                view: who_can_view,
                edit: who_can_edit,
                v: configData.vk_api_version,
                access_token: props.accessToken.access_token
            }
        }).then(data => {
            if (data.response) {
                let infoPage = props.modalData.infoPage;

                infoPage.who_can_view = who_can_view;
                infoPage.who_can_edit = who_can_edit;
                props.modalData.setInfoPage(infoPage);
            } else {
                system_error= [{}, {
                    default_error_msg: 'No response save access'
                }];
            }
        }).catch(e => {
            system_error= [e, {
                default_error_msg: 'Error save access'
            }];
        });

        if (system_error) {
            handleError(props.strings, props.modalData.setSnackbar, router, system_error[0], system_error[1]);
            setLoading(false);
            router.popPage();
            return;
        }

        router.popPage();
        props.modalData.setSnackbar(null);
        props.modalData.setSnackbar(<Snackbar
            onClose={() => props.modalData.setSnackbar(null)}
            before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
        >{props.strings.saved}</Snackbar>);
    };

    const onChangeWho_can_view = function (e) {
        setWho_can_view(+e.currentTarget.value);
    };

    const onChangeWho_can_edit = function (e) {
        setWho_can_edit(+e.currentTarget.value);
    };

    return (
        <FormLayout onSubmit={onSubmit}>
            <FormItem
                style={{paddingLeft: 0, paddingRight: 0}}
                top={props.strings.who_can_view}
            >
                <Radio
                    name="who_can_view"
                    value={configData.wiki_access.all}
                    checked={who_can_view === configData.wiki_access.all}
                    onChange={onChangeWho_can_view}
                >{nameAccess(configData.wiki_access.all, props.strings)}</Radio>
                <Radio
                    name="who_can_view"
                    value={configData.wiki_access.member}
                    checked={who_can_view === configData.wiki_access.member}
                    onChange={onChangeWho_can_view}
                >{nameAccess(configData.wiki_access.member, props.strings)}</Radio>
                <Radio
                    name="who_can_view"
                    value={configData.wiki_access.staff}
                    checked={who_can_view === configData.wiki_access.staff}
                    onChange={onChangeWho_can_view}
                >{nameAccess(configData.wiki_access.staff, props.strings)}</Radio>
            </FormItem>
            <FormItem
                style={{paddingLeft: 0, paddingRight: 0}}
                top={props.strings.who_can_edit}
            >
                <Radio
                    name="who_can_edit"
                    value={configData.wiki_access.member}
                    checked={who_can_edit === configData.wiki_access.member}
                    onChange={onChangeWho_can_edit}
                >{nameAccess(configData.wiki_access.member, props.strings)}</Radio>
                <Radio
                    name="who_can_edit"
                    value={configData.wiki_access.staff}
                    checked={who_can_edit === configData.wiki_access.staff}
                    onChange={onChangeWho_can_edit}
                >{nameAccess(configData.wiki_access.staff, props.strings)}</Radio>
            </FormItem>
            <Button
                loading={loading}
                type='submit'
                size="l"
                mode="primary"
                stretched
            >{props.strings.save}</Button>
        </FormLayout>
    );
}

export default FormEditAccess;