import React, {useState, useEffect} from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
    View,
    ScreenSpinner,
    AdaptivityProvider,
    AppRoot,
    Snackbar,
    ModalRoot,
    ModalPage,
    FormItem,
    Input,
    Button,
    Group,
    ConfigProvider,
    withAdaptivity,
    SplitLayout,
    SplitCol,
    ModalCard,
    Select,
    NativeSelect
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import {isUndefined} from "@vkontakte/vkjs";
import {Icon24ErrorCircle} from "@vkontakte/icons";

import './App.css';

import Home from './panels/Home';
import Intro from './panels/Intro';
import Landing from './panels/Landing';

import configData from "./config.json";
import Token from "./panels/Token";
import Pages from "./panels/Pages";
import About from "./panels/About";
import Page from "./panels/Page";
import AppModalPageHeader from "./components/AppModalPageHeader";

const App = withAdaptivity(() => {
    const [activePanel, setActivePanel] = useState(configData.routes.intro);
    const [activeModal, setActiveModal] = useState(null);
    const [user, setUser] = useState(null);
    const [popout, setPopout] = useState(<ScreenSpinner size='large'/>);
    const [userStatus, setUserStatus] = useState(null);
    const [lastGroupIds, setLastGroupIds] = useState([]);
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
                setLastGroupIds(Object.values(data[configData.storage_keys.last_groups]));
                setUserStatus(data[configData.storage_keys.status]);

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
                    before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
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
                        before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
                    >
                        Empty token
                    </Snackbar>);
                }
            } catch (e) {
                console.log(e);

                setSnackbar(<Snackbar
                    layout='vertical'
                    onClose={() => setSnackbar(null)}
                    before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
                >
                    Error with sending data to Storage
                </Snackbar>);
            }
        }).catch(e => {
            console.log(e);

            setSnackbar(<Snackbar
                layout='vertical'
                onClose={() => setSnackbar(null)}
                before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
            >
                Error get token
            </Snackbar>);
        });
    }

    const onCloseModal = function () {
        setActiveModal(null); // null для скрытия
    }

    const onSubmitModal = function () {
        setActiveModal(null); // null для скрытия
    }

    const modal = (
        <ModalRoot
            activeModal={activeModal}
            onClose={onCloseModal}
        >
            <ModalPage
                id='ModalPage123'
                onClose={onCloseModal}
                header={<AppModalPageHeader
                    onClose={onCloseModal}
                    onSubmit={onSubmitModal}
                >
                    Название
                </AppModalPageHeader>
                }
            >
                <Group>
                    <FormItem top="Название wiki-страницы">
                        <Input defaultValue=""/>
                    </FormItem>
                </Group>
            </ModalPage>

            <ModalCard
                id={configData.modals.renamePage}
                onClose={onCloseModal}
                header="Название"
                actions={
                    <Button size="l" mode="primary" onClick={onSubmitModal}>
                        Сохранить
                    </Button>
                }
            >
                <Input defaultValue=""/>
            </ModalCard>

            <ModalCard
                id={configData.modals.settingPageView}
                onClose={onCloseModal}
                header="Просмотр страницы"
                actions={
                    <Button size="l" mode="primary" onClick={onSubmitModal}>
                        Сохранить
                    </Button>
                }
            >
                <FormItem top="Выберите">
                    <NativeSelect>
                        <option value={configData.wiki_access.all}>Все</option>
                        <option value={configData.wiki_access.member}>Участники</option>
                        <option value={configData.wiki_access.staff}>Руководители</option>
                    </NativeSelect>
                </FormItem>
            </ModalCard>

            <ModalCard
                id={configData.modals.settingPageEdit}
                onClose={onCloseModal}
                header="Редактирование страницы"
                actions={
                    <Button size="l" mode="primary" onClick={onSubmitModal}>
                        Сохранить
                    </Button>
                }
            >
                <FormItem top="Выберите">
                    <NativeSelect>
                        <option value={configData.wiki_access.all}>Все</option>
                        <option value={configData.wiki_access.member}>Участники</option>
                        <option value={configData.wiki_access.staff}>Руководители</option>
                    </NativeSelect>
                </FormItem>
            </ModalCard>
        </ModalRoot>
    );

    return (
        <ConfigProvider>
            <AdaptivityProvider>
                <AppRoot>
                    <SplitLayout popout={popout} modal={modal}>
                        <SplitCol>
                            <View activePanel={activePanel}>
                                <Landing id={configData.routes.landing}/>
                                <About id={configData.routes.about} go={go} snackbarError={snackbar}
                                       accessToken={accessToken}/>
                                <Intro id={configData.routes.intro} go={go} snackbarError={snackbar} user={user}
                                       setUserStatus={setUserStatus} userStatus={userStatus}/>
                                <Token id={configData.routes.token} fetchToken={fetchToken} snackbarError={snackbar}/>
                                <Home id={configData.routes.home} setGroup={setGroup} accessToken={accessToken}
                                      snackbarError={snackbar} lastGroupIds={lastGroupIds}
                                      setLastGroupIds={setLastGroupIds}
                                      go={go}/>
                                <Pages id={configData.routes.pages} group={group} accessToken={accessToken}
                                       snackbarError={snackbar} go={go} setPage={setPage}/>
                                <Page id={configData.routes.page} page={page} group={group} user={user}
                                      accessToken={accessToken}
                                      snackbarError={snackbar} go={go} setActiveModal={setActiveModal}/>
                            </View>
                        </SplitCol>
                    </SplitLayout>
                </AppRoot>
            </AdaptivityProvider>
        </ConfigProvider>
    );
}, {viewWidth: true});

export default App;