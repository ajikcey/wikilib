import React, {useState, useEffect} from 'react';
import bridge from '@vkontakte/vk-bridge';
import {View, ScreenSpinner, AdaptivityProvider, AppRoot, Snackbar, Avatar} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import {isUndefined} from "@vkontakte/vkjs";
import {Icon24Error} from "@vkontakte/icons";

import Home from './panels/Home';
import Intro from './panels/Intro';
import Landing from './panels/Landing';

import configData from "./config.json";
import Token from "./panels/Token";
import Community from "./panels/Community";

const App = () => {
    const [activePanel, setActivePanel] = useState(configData.routes.intro);
    const [fetchedUser, setUser] = useState(null);
    const [popout, setPopout] = useState(<ScreenSpinner size='large'/>);
    const [userStatus, setUserStatus] = useState(false);
    const [snackbar, setSnackbar] = useState(false);
    const [accessToken, setAccessToken] = useState(null);
    const [community, setCommunity] = useState(null);

    useEffect(() => {
        bridge.subscribe(({detail: {type, data}}) => {

            if (type === 'VKWebAppUpdateConfig') {
                const schemeAttribute = document.createAttribute('scheme');
                schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
                document.body.attributes.setNamedItem(schemeAttribute);

            } else if (type === 'vk-connect') {
                if (isUndefined(data)) {
                    setPopout(null);
                    setActivePanel(configData.routes.landing);
                }
            }
        });

        async function fetchData() {
            const user = await bridge.send('VKWebAppGetUserInfo');
            const data = {};

            try {
                const storageData = await bridge.send('VKWebAppStorageGet', {
                    keys: Object.values(configData.storage_keys)
                });

                if (process.env.NODE_ENV === "development") {
                    console.log("storageData", storageData);
                }

                await storageData.keys.forEach(({key, value}) => {
                    data[key] = value ? JSON.parse(value) : {};

                    switch (key) {
                        case configData.storage_keys.status:
                            setUserStatus(data[key]);
                            break;
                        case configData.storage_keys.access_token:
                            setAccessToken(data[key]);
                            break;
                        default:
                            break;
                    }
                });

                // route after get token
                if (data[configData.storage_keys.status].tokenReceived) {
                    setActivePanel(configData.routes.home);
                } else if (data[configData.storage_keys.status].hasSeenIntro) {
                    setActivePanel(configData.routes.token);
                } else {
                    setUserStatus(false);
                }
            } catch (e) {
                console.log(e);

                setSnackbar(<Snackbar
                    layout='vertical'
                    onClose={() => setSnackbar(null)}
                    before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic_red)'}}
                    ><Icon24Error fill='#fff' width='14' height='14'/></Avatar>}
                >
                    Error get data from Storage
                </Snackbar>);
            }

            setUser(user);
            setPopout(null);
        }

        fetchData();
    }, []);

    /**
     * Переход на другую панель
     * @param panel
     */
    const go = panel => {
        setActivePanel(panel);
    };

    /**
     * Получение токена пользователя
     * @returns {Promise<void>}
     */
    const fetchToken = async function () {
        await bridge.send('VKWebAppGetAuthToken', {
            app_id: configData.app_id,
            scope: ['groups', 'pages'].join(',')
        }).then(data => {
            try {
                if (data.access_token) {
                    bridge.send('VKWebAppStorageSet', {
                        key: configData.storage_keys.access_token,
                        value: JSON.stringify(data)
                    });

                    bridge.send('VKWebAppStorageSet', {
                        key: configData.storage_keys.status,
                        value: JSON.stringify({tokenReceived: true})
                    });

                    setAccessToken(data);
                    setActivePanel(configData.routes.home); // route after get token
                } else {
                    setSnackbar(<Snackbar
                        layout='vertical'
                        onClose={() => setSnackbar(null)}
                        before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic_red)'}}
                        ><Icon24Error fill='#fff' width='14' height='14'/></Avatar>}
                    >
                        Empty token
                    </Snackbar>);
                }
            } catch (e) {
                console.log(e);

                setSnackbar(<Snackbar
                    layout='vertical'
                    onClose={() => setSnackbar(null)}
                    before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic_red)'}}
                    ><Icon24Error fill='#fff' width='14' height='14'/></Avatar>}
                >
                    Error with sending data to Storage
                </Snackbar>);
            }
        }).catch(e => {
            console.log(e);

            setSnackbar(<Snackbar
                layout='vertical'
                onClose={() => setSnackbar(null)}
                before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic_red)'}}
                ><Icon24Error fill='#fff' width='14' height='14'/></Avatar>}
            >
                Error get token
            </Snackbar>);
        });
    }

    return (
        <AdaptivityProvider>
            <AppRoot>
                <View activePanel={activePanel} popout={popout}>
                    <Landing id={configData.routes.landing}/>
                    <Intro id={configData.routes.intro} go={go} snackbarError={snackbar} fetchedUser={fetchedUser}
                           userStatus={userStatus}/>
                    <Token id={configData.routes.token} fetchToken={fetchToken} snackbarError={snackbar}/>
                    <Home id={configData.routes.home} setCommunity={setCommunity} accessToken={accessToken} snackbarError={snackbar} go={go}/>
                    <Community id={configData.routes.community} community={community} accessToken={accessToken} snackbarError={snackbar} go={go}/>
                </View>
            </AppRoot>
        </AdaptivityProvider>
    );
}

export default App;