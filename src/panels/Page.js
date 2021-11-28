import React, {Fragment, useEffect, useState} from 'react';

import {
    Avatar,
    CellButton,
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
    usePlatform,
    ActionSheet,
    ActionSheetItem, IOS
} from '@vkontakte/vkui';

import {
    Icon24Attachments,
    Icon24CheckCircleOutline,
    Icon24Copy, Icon24Download,
    Icon24ErrorCircle,
    Icon24HelpOutline,
    Icon24InfoCircleOutline,
    Icon24MoreVertical,
    Icon24ServicesOutline, Icon24TextOutline,
    Icon24Write,
    Icon28CalendarOutline,
    Icon28ChainOutline,
    Icon28CopyOutline,
    Icon28DeleteOutline,
    Icon28DeleteOutlineAndroid,
    Icon32SearchOutline,
} from "@vkontakte/icons";
import configData from "../config.json";
import {
    AddToCommunity,
    calcLink,
    declOfNum, fetchHistory, fetchPage,
    fetchUsers,
    fetchVersion, handleError, nameAccess, ShowError,
    timestampToDate
} from "../functions";
import IconPage from "../components/IconPage";
import bridge from "@vkontakte/vk-bridge";

const Page = ({
                  id,
                  accessToken,
                  pageTitle,
                  go,
                  group,
                  strings,
                  setModalData,
                  setActiveModal,
                  setPopout,
                  snackbarError
              }) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [infoPage, setInfoPage] = useState(null);
    const [creator, setCreator] = useState(null);
    const [editor, setEditor] = useState(null);
    const [history, setHistory] = useState(null);
    const [tab, setTab] = useState('info');

    const platform = usePlatform();
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
                        handleError(strings, setSnackbar, go, {}, {
                            data: data,
                            default_error_msg: 'No response get users'
                        });
                    }
                }).catch(e => {
                    handleError(strings, setSnackbar, go, e, {
                        default_error_msg: 'Error get users'
                    });
                });

                setInfoPage(data.response);
            } else {
                setInfoPage({});

                handleError(strings, setSnackbar, go, {}, {
                    data: data,
                    default_error_msg: 'No response get page'
                });
            }
        }).catch(e => {
            setInfoPage({});

            handleError(strings, setSnackbar, go, e, {
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
        setActiveModal(configData.modals.accessPage);
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
                    before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
                >
                    {strings.copied_to_clipboard}
                </Snackbar>);
            }
        }).catch(() => {});
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
            handleError(strings, setSnackbar, go, system_error[0], system_error[1]);
            return;
        }

        setActiveModal(configData.modals.editPage);
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
        setActiveModal(configData.modals.editPage);
    }

    const copyPage = () => {
        setModalData({
            group: group,
            title: infoPage.title,
            text: infoPage.source,
            setSnackbar: setSnackbar
        });
        setActiveModal(configData.modals.copyPage);
    }

    const handleErrorWidget = (e) => {
        console.log(e);

        if (e.error_data.error_code === 2) {
            setSnackbar(null);
            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
            >
                {strings.error_widget_code}
            </Snackbar>);
        } else if (e.error_data.error_reason === "security error" ||
            e.error_data.error_reason === "Invalid params") {
            setSnackbar(null);
            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Icon24InfoCircleOutline fill='var(--dynamic_blue)'/>}
                action={strings.install}
                onActionClick={() => AddToCommunity(setModalData, setActiveModal)}
            >
                {strings.need_install_app}
            </Snackbar>);
        } else if (e.error_data.error_reason === "User denied") {
            // отменена установка виджета
        } else {
            ShowError(e, setModalData, setActiveModal);
        }
    }

    const installWidget = () => {
        if (!infoPage) return false;
        let widgetData = {
            group_id: group.id
        };
        let widgetArr = infoPage.source.split('\n');

        widgetData.type = widgetArr.shift().trim();
        if (!widgetData.type || !configData.widget_types[widgetData.type]) {
            setSnackbar(null);
            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
            >
                {strings.invalid_widget_type}
            </Snackbar>);
            return false;
        }

        widgetData.code = widgetArr.join('\n')
            .replace(/\s+/gm, " ")
            .replace(/\[\[(video[^\]]+)]]/gm, "https://vk.com/$1") // replace video links
            .replace(/\[(https:\/\/[^\]]+)]/gm, "$1"); // replace links

        bridge.send("VKWebAppShowCommunityWidgetPreviewBox", widgetData).then(() => {
            setSnackbar(null);
            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
                action={<Link target="_blank" href={`https://vk.com/club${group.id}`}>{strings.open_community}</Link>}
            >
                {strings.saved}
            </Snackbar>);
        }).catch(handleErrorWidget);
    }

    const deleteWidget = () => {
        bridge.send("VKWebAppShowCommunityWidgetPreviewBox", {
            "group_id": group.id,
            "type": "text",
            "code": "return false;"
        }).then(() => {
            setSnackbar(null);
            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
                action={<Link target="_blank" href={`https://vk.com/club${group.id}`}>{strings.open_community}</Link>}
            >
                {strings.saved}
            </Snackbar>);
        }).catch(handleErrorWidget);
    }

    const back = () => {
        go(configData.routes.pages);
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

                handleError(strings, setSnackbar, go, {}, {
                    data: data,
                    default_error_msg: 'No response get history'
                });
            }
        }).catch(e => {
            setHistory([]);

            handleError(strings, setSnackbar, go, e, {
                default_error_msg: 'Error get history'
            });
        });
    }

    const onClosePopout = () => setPopout(null);

    const openMenuWidget = () => setPopout(
        <ActionSheet
            onClose={onClosePopout}
            iosCloseItem={<ActionSheetItem autoclose mode="cancel">Отменить</ActionSheetItem>}
            toggleRef={menuWidgetTargetRef}
            popupDirection="top"
        >
            <ActionSheetItem
                autoclose
                before={<Icon24Download/>}
                onClick={installWidget}
            >
                {strings.install_widget}
            </ActionSheetItem>
            <ActionSheetItem
                autoclose
                before={<Icon24Attachments/>}
                onClick={() => go(configData.routes.images)}
            >
                {strings.images}
            </ActionSheetItem>
            <ActionSheetItem
                autoclose
                before={<Icon24HelpOutline/>}
                href='https://vk.com/@wikilib-rabota-s-vidzhetami'
                target='_blank'
            >
                {strings.help}
            </ActionSheetItem>
            <ActionSheetItem
                autoclose
                before={platform === IOS ? <Icon28DeleteOutline/> : <Icon28DeleteOutlineAndroid/>}
                mode="destructive"
                onClick={deleteWidget}
            >
                {strings.delete_widget}
            </ActionSheetItem>
        </ActionSheet>
    );

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderBack onClick={back}/>}
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
                        <CellButton before={<Icon24Write/>} onClick={editPage}>{strings.edit}</CellButton>
                        <CellButton
                            before={<Icon24TextOutline/>}
                            onClick={() => setActiveModal(configData.modals.renamePage)}
                        >
                            {strings.rename}
                        </CellButton>
                        <CellButton before={<Icon24Copy/>} onClick={copyPage}>{strings.copy}</CellButton>
                        <CellButton
                            getRootRef={menuWidgetTargetRef}
                            onClick={openMenuWidget}
                            before={<Icon24ServicesOutline/>}
                            after={<Icon24MoreVertical/>}
                        >
                            {strings.widget}
                        </CellButton>
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
                        <Footer>
                            {history.length}
                            {declOfNum(history.length, [
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

export default Page;