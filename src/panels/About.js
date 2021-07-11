import React, {Fragment, useEffect, useState} from 'react';

import {
    Group,
    Panel,
    PanelHeader,
    Div,
    PanelHeaderBack,
    Header,
    Avatar,
    CellButton,
    Snackbar,
    PanelSpinner
} from '@vkontakte/vkui';

import configData from "../config.json";
import bridge from "@vkontakte/vk-bridge";
import {Icon12Verified, Icon24ErrorCircle} from "@vkontakte/icons";
import {cutDeclNum} from "../functions";

const About = ({id, go, snackbarError, accessToken}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [appCommunity, setAppCommunity] = useState(null);

    useEffect(() => {
        /**
         * Получение сообществ пользователя
         * @returns {Promise<void>}
         */
        async function fetchAppCommunity() {

            await bridge.send("VKWebAppCallAPIMethod", {
                method: "groups.getById",
                params: {
                    group_ids: configData.community.id,
                    fields: ['members_count', 'verified'].join(','),
                    v: "5.131",
                    access_token: accessToken.access_token
                }
            }).then(data => {
                if (data.response) {
                    setAppCommunity(data.response[0]);
                } else {
                    console.log(data);
                }
            }).catch(e => {
                console.log(e);

                setSnackbar(<Snackbar
                    layout='vertical'
                    onClose={() => setSnackbar(null)}
                    before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
                >
                    Error get group
                </Snackbar>);
            });
        }

        fetchAppCommunity();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Panel id={id}>
            <Fragment>
                <PanelHeader
                    left={<PanelHeaderBack onClick={() => go(configData.routes.home)}/>}
                >
                    О приложении
                </PanelHeader>

                <Group>
                    <Div>
                        Приложение, с помощью которого можно посмотреть wiki-страницы во всех своих сообществах
                        ВКонтакте.
                    </Div>

                    {(!appCommunity) && <PanelSpinner/>}
                    {(appCommunity) &&
                    <Fragment>
                        <Header mode='secondary'>Разработчик</Header>
                        <CellButton
                            before={<Avatar size={48} src={appCommunity.photo_200}/>}
                            badge={appCommunity.verified ? <Icon12Verified/> : null}
                            description={cutDeclNum(appCommunity.members_count, ['подписчик', 'подписчика', 'подписчиков'])}
                            href={'https://vk.com/' + appCommunity.screen_name} target='_blank'
                        >
                            {appCommunity.name}
                        </CellButton>
                    </Fragment>
                    }
                </Group>
            </Fragment>
            {snackbar}
        </Panel>
    )
}

export default About;