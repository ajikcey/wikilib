import React, {Fragment, useEffect, useState} from 'react';

import {
    Avatar,
    Footer,
    Group,
    HorizontalScroll,
    InfoRow,
    Link,
    Panel,
    PanelHeader,
    PanelHeaderBack,
    PanelSpinner,
    Placeholder,
    Snackbar,
    Tabs,
    TabsItem,
    IconButton,
    SimpleCell,
    PanelHeaderContent,
    Spacing,
} from '@vkontakte/vkui';

import {
    Icon24CheckCircleOutline,
    Icon24Copy,
    Icon24MoreVertical,
    Icon24ServicesOutline, Icon24TextOutline,
    Icon24Write,
    Icon28CalendarOutline,
    Icon28ChainOutline,
    Icon28CopyOutline,
    Icon32SearchOutline,
} from "@vkontakte/icons";
import {
    calcLink,
    declOfNum, fetchHistory, fetchPage,
    fetchUsers,
    fetchVersion, handleError, nameAccess,
    timestampToDate
} from "../functions";
import IconPage from "../components/IconPage";
import bridge from "@vkontakte/vk-bridge";
import {useRouter} from "@happysanta/router";
import {
    MODAL_ACCESS_PAGE,
    MODAL_COPY_PAGE,
    MODAL_EDIT_PAGE,
    MODAL_RENAME_PAGE,
    POPOUT_MENU_WIDGET
} from "../index";

const PanelWiki = ({
                       id,
                       accessToken,
                       pageTitle,
                       group,
                       strings,
                       setModalData,
                       setPopoutData,
                       snackbarError
                   }) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [infoPage, setInfoPage] = useState(null);
    const [creator, setCreator] = useState(null);
    const [editor, setEditor] = useState(null);
    const [history, setHistory] = useState(null);
    const [tab, setTab] = useState('info');

    const router = useRouter();
    const menuWidgetTargetRef = React.useRef();

    useEffect(() => {
        getPageData().then();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getPageData = async () => {
        await fetchPage(pageTitle.id, pageTitle.group_id, 1, accessToken.access_token).then(data => {
            if (data.response) {
                fetchUsers([data.response.creator_id, data.response.editor_id], accessToken.access_token).then(data => {
                    if (data.response) {
                        setCreator(data.response[0]);

                        if (data.response[1]) {
                            setEditor(data.response[1]);
                        } else {
                            setEditor(data.response[0]); // creator_id == editor_id
                        }
                    } else {
                        handleError(strings, setSnackbar, router, {}, {
                            data: data,
                            default_error_msg: 'No response get users'
                        });
                    }
                }).catch(e => {
                    handleError(strings, setSnackbar, router, e, {
                        default_error_msg: 'Error get users'
                    });
                });

                setInfoPage(data.response);
            } else {
                setInfoPage({});

                handleError(strings, setSnackbar, router, {}, {
                    data: data,
                    default_error_msg: 'No response get page'
                });
            }
        }).catch(e => {
            setInfoPage({});

            handleError(strings, setSnackbar, router, e, {
                default_error_msg: 'Error get page'
            });
        });
    }

    const settingAccessPage = () => {
        setModalData({
            setSnackbar: setSnackbar,
            setInfoPage: setInfoPage,
            infoPage: infoPage,
        });
        router.pushModal(MODAL_ACCESS_PAGE);
    }

    const copy = (e) => {
        e.preventDefault();

        bridge.send("VKWebAppCopyText", {text: calcLink(pageTitle.id, pageTitle.group_id)}).then((data) => {
            if (data.result === true) {
                if (bridge.supports('VKWebAppTapticNotificationOccurred')) {
                    bridge.send('VKWebAppTapticNotificationOccurred', {type: 'success'}).then();
                }

                setSnackbar(<Snackbar
                    onClose={() => setSnackbar(null)}
                    before={<Icon24CheckCircleOutline fill='var(--vkui--color_accent_green)'/>}
                >
                    {strings.copied_to_clipboard}
                </Snackbar>);
            }
        }).catch(() => {
        });
    }

    const selectVersion = async function (item) {
        let system_error = null;

        await fetchVersion(item.id, pageTitle.group_id, accessToken.access_token).then(data => {
            if (data.response) {
                setModalData({
                    setSnackbar: setSnackbar,
                    getPageData: getPageData,
                    setTab: setTab,
                    version: data.response.id,
                    page_id: pageTitle.id,
                    title: data.response.title,
                    source: data.response.source,
                    edited: data.response.version_created,
                    creator_id: data.response.creator_id,
                    who_can_view: pageTitle.who_can_view,
                    who_can_edit: pageTitle.who_can_edit
                });
            } else {
                system_error = [{}, {
                    data: data,
                    default_error_msg: 'No response get version'
                }];
            }
        }).catch(e => {
            system_error = [e, {
                default_error_msg: 'Error get version'
            }];
        });

        if (system_error) {
            handleError(strings, setSnackbar, router, system_error[0], system_error[1]);
            return;
        }

        router.pushModal(MODAL_EDIT_PAGE);
    }

    const editPage = () => {
        setModalData({
            setSnackbar: setSnackbar,
            getPageData: getPageData,
            setTab: setTab,
            version: 0,
            page_id: infoPage.id,
            title: infoPage.title,
            source: infoPage.source,
            edited: infoPage.edited,
            creator_id: infoPage.creator_id,
            who_can_view: infoPage.who_can_view,
            who_can_edit: infoPage.who_can_edit
        });
        router.pushModal(MODAL_EDIT_PAGE);
    }

    const copyPage = () => {
        setModalData({
            group: group,
            title: infoPage.title,
            text: infoPage.source,
            setSnackbar: setSnackbar
        });
        router.pushModal(MODAL_COPY_PAGE);
    }

    const tabInfo = () => {
        setTab('info');
    }

    const tabHistory = () => {
        setTab('history');

        fetchHistory(pageTitle.id, pageTitle.group_id, accessToken.access_token).then(data => {
            if (data.response) {
                setHistory(data.response);
            } else {
                setHistory([]);

                handleError(strings, setSnackbar, router, {}, {
                    data: data,
                    default_error_msg: 'No response get history'
                });
            }
        }).catch(e => {
            setHistory([]);

            handleError(strings, setSnackbar, router, e, {
                default_error_msg: 'Error get history'
            });
        });
    }

    const openMenuWidget = () => {
        setPopoutData({
            toggleRef: menuWidgetTargetRef,
            infoPage: infoPage,
            setSnackbar: setSnackbar,
        });
        router.replacePopup(POPOUT_MENU_WIDGET);
    }

    const renamePage = () => {
        setModalData({
            setSnackbar: setSnackbar,
        });
        router.pushModal(MODAL_RENAME_PAGE);
    }

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                before={<PanelHeaderBack onClick={() => router.popPage()}/>}
            >
                <PanelHeaderContent
                    status={pageTitle.title}
                    before={<IconPage page={infoPage ?? pageTitle}/>}
                >
                    {strings.wiki_page}
                </PanelHeaderContent>
            </PanelHeader>

            <Group>
                <Tabs>
                    <HorizontalScroll>
                        <TabsItem
                            onClick={tabInfo}
                            selected={tab === 'info'}
                        >{strings.info}</TabsItem>
                        <TabsItem
                            onClick={tabHistory}
                            selected={tab === 'history'}
                        >{strings.change_history}</TabsItem>
                    </HorizontalScroll>
                </Tabs>

                <Spacing size={16}/>

                {(tab === 'info') &&
                <Fragment>
                    {(!infoPage) && <PanelSpinner/>}
                    {(infoPage && !infoPage.id) &&
                    <Placeholder icon={<Icon32SearchOutline/>}>{strings.information_not_found}</Placeholder>}
                    {(infoPage && infoPage.id) &&
                    <Fragment>
                        <SimpleCell
                            disabled
                            before={<Icon28ChainOutline width={32} height={32}/>}
                            after={<IconButton onClick={copy}><Icon28CopyOutline/></IconButton>}
                        >
                            <InfoRow header={strings.wiki_link}>
                                <Link
                                    href={calcLink(pageTitle.id, pageTitle.group_id, true)}
                                    target='_blank'
                                >
                                    {calcLink(pageTitle.id, pageTitle.group_id)}
                                </Link>
                            </InfoRow>
                        </SimpleCell>
                        <SimpleCell
                            href={'https://vk.com/id' + (creator ? creator.id : pageTitle.creator_id)}
                            target='_blank'
                            before={<Icon28CalendarOutline width={32} height={32}/>}
                            after={<Avatar size={32} src={creator && creator.photo_100}/>}
                        >
                            <InfoRow header={strings.date_created}>
                                {timestampToDate(infoPage.created)}
                            </InfoRow>
                        </SimpleCell>
                        <SimpleCell
                            href={'https://vk.com/id' + (editor ? editor.id : pageTitle.editor_id)}
                            target='_blank'
                            before={<Icon28CalendarOutline width={32} height={32}/>}
                            after={<Avatar size={32} src={editor && editor.photo_100}/>}
                        >
                            <InfoRow header={strings.last_modified}>
                                {timestampToDate(infoPage.edited)}
                            </InfoRow>
                        </SimpleCell>
                        <Spacing separator size={16}/>
                        <SimpleCell
                            indicator={nameAccess(infoPage.who_can_view, strings)}
                            onClick={settingAccessPage}
                        >
                            {strings.view}
                        </SimpleCell>
                        <SimpleCell
                            indicator={nameAccess(infoPage.who_can_edit, strings)}
                            onClick={settingAccessPage}
                        >
                            {strings.editing}
                        </SimpleCell>
                        <Spacing separator size={16}/>
                        <SimpleCell before={<Icon24Write/>} onClick={editPage}>{strings.edit}</SimpleCell>
                        <SimpleCell
                            before={<Icon24TextOutline/>}
                            onClick={renamePage}
                        >
                            {strings.rename}
                        </SimpleCell>
                        <SimpleCell before={<Icon24Copy/>} onClick={copyPage}>{strings.copy}</SimpleCell>
                        <SimpleCell
                            getRootRef={menuWidgetTargetRef}
                            onClick={openMenuWidget}
                            before={<Icon24ServicesOutline/>}
                            after={<Icon24MoreVertical/>}
                        >
                            {strings.widget}
                        </SimpleCell>
                    </Fragment>
                    }
                </Fragment>
                }

                {(tab === 'history') &&
                <Fragment>
                    {(!history) && <PanelSpinner/>}
                    {(history && history.length < 1) &&
                    <Placeholder icon={<Icon32SearchOutline/>}>{strings.no_records_found}</Placeholder>}
                    {(history && history.length > 0) &&
                    <Fragment>
                        {history.map((item) => {
                            return (
                                <SimpleCell
                                    badge={item.length}
                                    indicator={timestampToDate(item.date)}
                                    key={item.id}
                                    description={'v.' + item.id}
                                    onClick={() => {
                                        selectVersion(item).then();
                                    }}
                                >
                                    {item.editor_name}
                                </SimpleCell>
                            );
                        })}
                        <Footer>{history.length} {declOfNum(history.length, [
                                strings.record.toLowerCase(),
                                strings.two_records.toLowerCase(),
                                strings.some_records.toLowerCase()
                            ])}
                        </Footer>
                    </Fragment>
                    }
                </Fragment>
                }
            </Group>
            {snackbar}
        </Panel>
    )
}

export default PanelWiki;