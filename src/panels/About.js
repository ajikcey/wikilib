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
    PanelSpinner, Title, Text, InfoRow, UsersStack
} from '@vkontakte/vkui';

import configData from "../config.json";
import bridge from "@vkontakte/vk-bridge";
import {Icon12Verified, Icon24ErrorCircle} from "@vkontakte/icons";
import {cutDeclNum} from "../functions";

const About = ({id, go, snackbarError, accessToken}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [app, setApp] = useState(null);

    useEffect(() => {
        /**
         * Получение сообществ пользователя
         * @returns {Promise<void>}
         */
        async function fetchApp() {

            await bridge.send("VKWebAppCallAPIMethod", {
                method: "apps.get",
                params: {
                    app_id: configData.app_id,
                    return_friends: 1,
                    fields: ['photo_100', 'members_count'].join(','),
                    extended: 1,
                    v: "5.131",
                    access_token: accessToken.access_token
                }
            }).then(data => {
                if (data.response) {
                    setApp(data.response);
                } else {
                    console.log(data);
                }
            }).catch(e => {
                console.log(e);

                setSnackbar(<Snackbar
                    onClose={() => setSnackbar(null)}
                    before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
                >
                    Error get group
                </Snackbar>);
            });
        }

        fetchApp().then(() => {
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderBack onClick={() => go(configData.routes.home)}/>}
            >
            </PanelHeader>

            {(!app) && <PanelSpinner/>}
            {(app) &&
            <Fragment>
                <Group>
                    <Div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                    }}>
                        <Avatar mode="app" size={86} src={app.items[0].icon_150}/>
                        <Title
                            style={{marginBottom: 0, marginTop: 5}} level="2"
                            weight="medium"
                        >
                            {app.items[0].title}
                        </Title>
                        <Text
                            style={{
                                color: 'var(--text_secondary)'
                            }}
                        >
                            {cutDeclNum(app.items[0].members_count, ['участник', 'участника', 'участников'])}
                        </Text>
                        {(app.profiles.length > 0) &&
                        <Fragment>
                            <UsersStack
                                style={{
                                    marginTop: 20,
                                }}
                                photos={
                                    app.profiles.map(function (item) {
                                        return item.photo_100
                                    })
                                }
                                size="m"
                                layout="vertical"
                            >
                                {app.profiles[0].first_name}
                                {(app.profiles.length > 1) && <Fragment>, {app.profiles[1].first_name}</Fragment>}
                                {(app.profiles.length > 2) && <Fragment>, {app.profiles[2].first_name}</Fragment>}
                                {(app.profiles.length > 3) && <Fragment>
                                    &nbsp;
                                    и ещё {cutDeclNum(app.profiles.length - 3, ['друг', 'друга', 'друзей'])}
                                </Fragment>
                                }
                                {app.profiles.length === 1 ? ' использует' : ' используют'} это приложение
                            </UsersStack>
                        </Fragment>
                        }
                    </Div>
                </Group>
                <Group>
                    <Header mode='secondary'>О приложении</Header>
                    <Div>
                        {app.items[0].description}
                    </Div>
                </Group>
                <Group>
                    <Header mode='secondary'>Разработчик</Header>
                    <CellButton
                        before={<Avatar size={48} src={app.groups[0].photo_100}/>}
                        badge={app.groups[0].verified ? <Icon12Verified/> : null}
                        href={'https://vk.com/' + app.groups[0].screen_name} target='_blank'
                        description={cutDeclNum(app.groups[0].members_count, ['подписчик', 'подписчика', 'подписчиков'])}
                    >
                        {app.groups[0].name}
                    </CellButton>
                </Group>
                <Group>
                    <Header mode='secondary'>Техническая информация</Header>
                    <Div>
                        <InfoRow header="App ID">
                            {app.items[0].id}
                        </InfoRow>
                    </Div>
                </Group>
            </Fragment>
            }
            {snackbar}
        </Panel>
    )
}

export default About;