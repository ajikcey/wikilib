import {
    ActionSheetItem, ActionSheet, Snackbar, Link, usePlatform, Platform
} from '@vkontakte/vkui';
import React from "react";
import {
    Icon24Attachments, Icon24CheckCircleOutline, Icon24ClockOutline,
    Icon24Download, Icon24ErrorCircle,
    Icon24HelpOutline, Icon24InfoCircleOutline,
    Icon28DeleteOutline,
    Icon28DeleteOutlineAndroid, Icon28HashtagOutline
} from "@vkontakte/icons";
import {PAGE_IMAGES, PAGE_RESOLVE_SCREEN_NAME, PAGE_TIME, POPOUT_SCREEN_SPINNER} from "../../index";
import configData from "../../config.json";
import bridge from "@vkontakte/vk-bridge";
import {AddToCommunity, ShowError} from "../../functions";
import {useRouter} from "@happysanta/router";

const PopoutMenuWidget = (props) => {
    const router = useRouter();
    const platform = usePlatform();

    const installWidget = () => {
        if (!props.popoutData.infoPage) return false;
        let widgetData = {
            group_id: props.group.id
        };
        let widgetArr = props.popoutData.infoPage.source.split('\n');

        widgetData.type = widgetArr.shift().trim();
        if (!configData.widget_types.find(obj => {
            return obj.key === widgetData.type
        })) {
            props.popoutData.setSnackbar(null);
            props.popoutData.setSnackbar(<Snackbar
                onClose={() => props.popoutData.setSnackbar(null)}
                before={<Icon24ErrorCircle fill='var(--vkui--color_accent_red)'/>}
            >
                {props.strings.invalid_widget_type}
            </Snackbar>);
            return false;
        }

        widgetData.code = widgetArr.join('\n')
            .replace(/\s+/gm, " ")
            .replace(/\[\[(video[^\]]+)]]/gm, "https://vk.com/$1") // replace video links
            .replace(/\[(https:\/\/[^\]]+)]/gm, "$1"); // replace links

        bridge.send("VKWebAppShowCommunityWidgetPreviewBox", widgetData).then(() => {
            router.replacePopup(POPOUT_SCREEN_SPINNER);

            setTimeout(() => {
                router.replacePopup(null);

                props.popoutData.setSnackbar(null);
                props.popoutData.setSnackbar(<Snackbar
                    onClose={() => props.popoutData.setSnackbar(null)}
                    before={<Icon24CheckCircleOutline fill='var(--vkui--color_accent_green)'/>}
                    action={<Link target="_blank"
                                  href={`https://vk.com/club${props.group.id}`}>{props.strings.open_community}</Link>}
                >
                    {props.strings.saved}
                </Snackbar>);
            }, configData.widget_update_timeout);
        }).catch(handleErrorWidget);
    }

    const deleteWidget = () => {
        bridge.send("VKWebAppShowCommunityWidgetPreviewBox", {
            "group_id": props.group.id,
            "type": "text",
            "code": "return false;"
        }).then(() => {
            router.replacePopup(POPOUT_SCREEN_SPINNER);

            setTimeout(() => {
                router.replacePopup(null);

                props.popoutData.setSnackbar(null);
                props.popoutData.setSnackbar(<Snackbar
                    onClose={() => props.popoutData.setSnackbar(null)}
                    before={<Icon24CheckCircleOutline fill='var(--vkui--color_accent_green)'/>}
                    action={<Link target="_blank"
                                  href={`https://vk.com/club${props.group.id}`}>{props.strings.open_community}</Link>}
                >
                    {props.strings.saved}
                </Snackbar>);
            }, configData.widget_update_timeout);
        }).catch(handleErrorWidget);
    }

    const handleErrorWidget = (e) => {
        console.log(e);

        if (e.error_data.error_code === 2) {
            props.popoutData.setSnackbar(null);
            props.popoutData.setSnackbar(<Snackbar
                onClose={() => props.popoutData.setSnackbar(null)}
                before={<Icon24ErrorCircle fill='var(--vkui--color_accent_red)'/>}
            >
                {props.strings.error_widget_code}
            </Snackbar>);
        } else if (e.error_data.error_reason === "security error") {
            props.popoutData.setSnackbar(null);
            props.popoutData.setSnackbar(<Snackbar
                onClose={() => props.popoutData.setSnackbar(null)}
                before={<Icon24InfoCircleOutline fill='var(--vkui--color_icon_accent)'/>}
                action={props.strings.install}
                onActionClick={() => AddToCommunity(props.setModalData, router)}
            >
                {props.strings.need_install_app}
            </Snackbar>);
        } else if (e.error_data.error_reason === "Invalid params") {
            props.popoutData.setSnackbar(null);
            props.popoutData.setSnackbar(<Snackbar
                onClose={() => props.popoutData.setSnackbar(null)}
                before={<Icon24InfoCircleOutline fill='var(--vkui--color_icon_accent)'/>}
                action={props.strings.install}
                onActionClick={() => AddToCommunity(props.setModalData, router)}
            >
                {props.strings.widget_invalid_params}
            </Snackbar>);
        } else if (e.error_data.error_reason === "User denied") {
            // отменена установка виджета
        } else {
            ShowError(e, props.setModalData, router);
        }
    }

    return (
        <ActionSheet
            onClose={() => router.replacePopup(null)}
            iosCloseItem={<ActionSheetItem autoclose mode="cancel">{props.strings.cancel}</ActionSheetItem>}
            toggleRef={props.popoutData.toggleRef}
            popupDirection="top"
        >
            <ActionSheetItem
                autoclose
                before={<Icon24Download/>}
                onClick={installWidget}
            >
                {props.strings.install_widget}
            </ActionSheetItem>
            <ActionSheetItem
                autoclose
                before={<Icon24Attachments/>}
                onClick={() => router.pushPage(PAGE_IMAGES)}
            >
                {props.strings.images}
            </ActionSheetItem>
            <ActionSheetItem
                autoclose
                before={<Icon24ClockOutline/>}
                onClick={() => router.pushPage(PAGE_TIME)}
            >
                {props.strings.unix_time}
            </ActionSheetItem>
            <ActionSheetItem
                autoclose
                before={<Icon28HashtagOutline width={24} height={24}/>}
                onClick={() => router.pushPage(PAGE_RESOLVE_SCREEN_NAME)}
            >
                {props.strings.determine_id}
            </ActionSheetItem>
            <ActionSheetItem
                autoclose
                before={<Icon24HelpOutline/>}
                href='https://vk.com/@wikilib-rabota-s-vidzhetami'
                target='_blank'
            >
                {props.strings.help}
            </ActionSheetItem>
            <ActionSheetItem
                autoclose
                before={platform === Platform.IOS ? <Icon28DeleteOutline width={24} height={24}/> :
                    <Icon28DeleteOutlineAndroid width={24} height={24}/>}
                mode="destructive"
                onClick={deleteWidget}
            >
                {props.strings.delete_widget}
            </ActionSheetItem>
        </ActionSheet>
    )
}

export default PopoutMenuWidget;