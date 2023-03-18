import {Icon24CheckCircleOutline, Icon24Copy, Icon24ExternalLinkOutline} from "@vkontakte/icons";
import {
    Button,
    FormItem, FormLayout, Platform, Snackbar,
    usePlatform
} from "@vkontakte/vkui";
import React from "react";
import bridge from "@vkontakte/vk-bridge";
import {useRouter} from "@happysanta/router";

const FromRenamePage = (props) => {
    const platform = usePlatform();
    const router = useRouter();
    const ext_link = 'https://vk.com/' + props.group.screen_name + '?w=page-' + props.group.id + '_' + props.pageTitle.id + '/market';

    const copy = (e) => {
        e.preventDefault();

        bridge.send("VKWebAppCopyText", {text: ext_link}).then((data) => {
            if (data.result === true) {
                if (bridge.supports('VKWebAppTapticNotificationOccurred')) {
                    bridge.send('VKWebAppTapticNotificationOccurred', {type: 'success'}).then();
                }

                router.popPage();

                props.modalData.setSnackbar(<Snackbar
                    onClose={() => props.modalData.setSnackbar(null)}
                    before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
                >
                    {props.strings.copied_to_clipboard}
                </Snackbar>);
            }
        }).catch((e) => {
            console.log(e);
        });
    }

    return (
        <FormLayout>
            <FormItem
                style={{paddingTop: 30, paddingBottom: 0, paddingLeft: 0, paddingRight: 0}}
            >
                {(platform === Platform.VKCOM) &&
                    <Button
                        size="l"
                        href={ext_link}
                        target='_blank' stretched={1}
                        before={<Icon24ExternalLinkOutline/>}
                    >
                        {props.strings.go}
                    </Button>
                }
                {(platform !== Platform.VKCOM) &&
                    <Button
                        mode="secondary"
                        size="l"
                        stretched={1}
                        onClick={copy}
                        before={<Icon24Copy/>}
                    >
                        {props.strings.copy_link}
                    </Button>
                }
            </FormItem>
        </FormLayout>
    );
}

export default FromRenamePage;