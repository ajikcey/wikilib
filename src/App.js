import React, {useState, useEffect} from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
    View,
    ScreenSpinner,
    AdaptivityProvider,
    AppRoot,
    Snackbar,
    Avatar,
    ModalRoot,
    ModalPage, ModalCard, ModalPageHeader, PanelHeaderClose, PanelHeaderSubmit, FormItem, Input
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import {isUndefined} from "@vkontakte/vkjs";
import {Icon24Error} from "@vkontakte/icons";

import './App.css';

import Home from './panels/Home';
import Intro from './panels/Intro';
import Landing from './panels/Landing';

import configData from "./config.json";
import Token from "./panels/Token";
import Pages from "./panels/Pages";
import About from "./panels/About";
import Page from "./panels/Page";

const App = () => {
    const [activePanel, setActivePanel] = useState(configData.routes.intro);
    const [activeModal, setActiveModal] = useState(null);
    const [user, setFetchedUser] = useState(null);
    const [popout, setPopout] = useState(<ScreenSpinner size='large'/>);
    const [userStatus, setUserStatus] = useState(null);
    const [cachedLastGroups, setCachedLastGroups] = useState([]);
    const [snackbar, setSnackbar] = useState(false);
    const [accessToken, setAccessToken] = useState(null);
    const [group, setGroup] = useState(null);
    const [page, setPage] = useState(null);

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

                await storageData.keys.forEach(({key, value}) => {
                    data[key] = value ? JSON.parse(value) : {};
                });

                setAccessToken(data[configData.storage_keys.access_token]);
                setUserStatus(data[configData.storage_keys.status]);
                setCachedLastGroups(Object.values(data[configData.storage_keys.last_groups]));

                if (data[configData.storage_keys.status].tokenReceived) {
                    setActivePanel(configData.routes.home);
                } else if (data[configData.storage_keys.status].hasSeenIntro) {
                    setActivePanel(configData.routes.token);
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

            setFetchedUser(user);
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
                    setAccessToken(data);

                    bridge.send('VKWebAppStorageSet', {
                        key: configData.storage_keys.access_token,
                        value: JSON.stringify(data)
                    });

                    userStatus.tokenReceived = true;

                    bridge.send('VKWebAppStorageSet', {
                        key: configData.storage_keys.status,
                        value: JSON.stringify(userStatus)
                    });

                    setActivePanel(configData.routes.home); // route after get token
                } else {
                    console.log(data);

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

    const closeModal = function () {
        setActiveModal(null); // null для скрытия
    }

    const submitModal = function () {
        setActiveModal(null);
    }

    const modal = (
        <ModalRoot activeModal={activeModal}>
            <ModalPage
                onClose={closeModal}
                id={configData.modals.renamePageModal}
                header={
                    <ModalPageHeader
                        left={<PanelHeaderClose onClick={closeModal}/>}
                        right={<PanelHeaderSubmit onClick={submitModal}/>}
                    >
                    </ModalPageHeader>
                }
            >
                <FormItem top="Название wiki-страницы">
                    <Input/>
                </FormItem>
            </ModalPage>
        </ModalRoot>
    );

    return (
        <AdaptivityProvider>
            <AppRoot>
                <View activePanel={activePanel} popout={popout} modal={modal}>
                    <Landing id={configData.routes.landing}/>
                    <About id={configData.routes.about} go={go} snackbarError={snackbar} accessToken={accessToken}/>
                    <Intro id={configData.routes.intro} go={go} snackbarError={snackbar} user={user}
                           setUserStatus={setUserStatus} userStatus={userStatus}/>
                    <Token id={configData.routes.token} fetchToken={fetchToken} snackbarError={snackbar}/>
                    <Home id={configData.routes.home} setGroup={setGroup} accessToken={accessToken}
                          snackbarError={snackbar} cachedLastGroups={cachedLastGroups} go={go}/>
                    <Pages id={configData.routes.pages} group={group} accessToken={accessToken}
                           snackbarError={snackbar} go={go} setPage={setPage}/>
                    <Page id={configData.routes.page} page={page} group={group} accessToken={accessToken}
                          snackbarError={snackbar} go={go} setActiveModal={setActiveModal}/>
                </View>
            </AppRoot>
        </AdaptivityProvider>
    );
}

export default App;