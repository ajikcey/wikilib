import React, {useState} from 'react';

import {
    Avatar,
    Button,
    Div,
    FormStatus,
    Group,
    Panel,
    PanelHeader,
    PanelHeaderBack, Placeholder, Search, SimpleCell, Snackbar
} from '@vkontakte/vkui';
import {useRouter} from "@happysanta/router";
import {
    Icon24CheckCircleOutline,
    Icon24ErrorCircle,
    Icon28CopyOutline,
    Icon32SearchOutline
} from "@vkontakte/icons";
import bridge from "@vkontakte/vk-bridge";
import {fetchApp, fetchGroupsById, fetchUsers, resolveScreenName} from "../functions";
import {debounce} from "@vkontakte/vkui/dist/lib/utils";

const PanelResolveScreenName = ({id, strings, accessToken, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [resolvedObject, setResolvedObject] = useState(null);
    const [avatar, setAvatar] = useState(null);

    const router = useRouter();

    const copy = (e) => {
        e.preventDefault();

        bridge.send("VKWebAppCopyText", {text: resolvedObject.object_id}).then((data) => {
            if (data.result === true) {
                if (bridge.supports('VKWebAppTapticNotificationOccurred')) {
                    bridge.send('VKWebAppTapticNotificationOccurred', {type: 'success'}).then();
                }

                setSnackbar(<Snackbar
                    onClose={() => setSnackbar(null)}
                    before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
                >
                    {strings.copied_to_clipboard}
                </Snackbar>);
            }
        }).catch((e) => {
            console.log(e);
        });
    }

    const onChangeLink = debounce(async link => {
        setResolvedObject(null);
        setAvatar(null);
        if (!link) return;

        let matches_1 = link.match(/(?:https?:\/\/)?vk\.com\/([\w.]+)/i);
        if (!matches_1) {
            setSnackbar(null);
            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
            >
                {strings.invalid_link}
            </Snackbar>);
            return;
        }

        await resolveScreenName(accessToken.access_token, matches_1[1]).then((data) => {
            if (data.response && data.response.object_id) {
                setResolvedObject(data.response);

                switch (data.response.type) {
                    case 'user':
                        fetchUsers([data.response.object_id], accessToken.access_token).then((data) => {
                            if (data.response[0]) {
                                setAvatar(data.response[0].photo_100);
                            }
                        }).catch((e) => {
                            console.log(e);
                        });
                        break;
                    case 'group':
                        fetchGroupsById([data.response.object_id], accessToken.access_token).then((data) => {
                            if (data.response[0]) {
                                setAvatar(data.response[0].photo_100);
                            }
                        }).catch((e) => {
                            console.log(e);
                        });
                        break;
                    case 'application':
                    case 'vk_app':
                        fetchApp(data.response.object_id, accessToken.access_token).then((data) => {
                            if (data.response.items[0]) {
                                setAvatar(data.response.items[0].icon_150);
                            }
                        }).catch((e) => {
                            console.log(e);
                        });
                        break;
                    default:
                        break;
                }
            }
        }).catch((e) => {
            console.log(e);
        });

    }, 500);

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                before={<PanelHeaderBack onClick={() => router.popPage()}/>}
            >
                {strings.determine_id}
            </PanelHeader>
            <Group>
                <Div>
                    <FormStatus>
                        <div style={{marginBottom: 12}}>{strings.determine_id_descr}</div>
                        <Button
                            mode="secondary"
                            target="_blank"
                            href="https://vk.com/@wikilib-object-id"
                        >
                            {strings.read_more}
                        </Button>
                    </FormStatus>
                </Div>
                <Search
                    autoFocus
                    placeholder={strings.enter_link}
                    onChange={(e) => onChangeLink(e.currentTarget.value)}
                />
                {!resolvedObject && <Placeholder icon={<Icon32SearchOutline/>}>{strings.not_found}</Placeholder>}
                {resolvedObject &&
                    <SimpleCell
                        before={<Avatar size={48} src={avatar}/>}
                        after={<Icon28CopyOutline/>}
                        description={resolvedObject.type}
                        onClick={copy}
                    >
                        {resolvedObject.object_id}
                    </SimpleCell>
                }
            </Group>
            {snackbar}
        </Panel>
    )
}

export default PanelResolveScreenName;