import React, {Fragment, useEffect, useState} from 'react';

import {
    Avatar, Cell, Footer,
    Group,
    Header, IconButton, Link, List,
    Panel,
    PanelHeader,
    PanelHeaderBack, PanelHeaderContent, PanelSpinner,
    Placeholder,
    Search,
    Snackbar, TooltipContainer
} from '@vkontakte/vkui';

import configData from "../config.json";
import bridge from "@vkontakte/vk-bridge";
import {
    Icon24Error,
    Icon24InfoCircleOutline, Icon28AddCircleFillBlue,
    Icon28Document,
    Icon32SearchOutline,
} from "@vkontakte/icons";

const Community = ({id, accessToken, community, go, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [wikiPages, setWikiPages] = useState(null);

    useEffect(() => {

        /**
         * Получение wiki-страниц сообщества
         * @returns {Promise<void>}
         */
        async function fetchWikiPages() {
            await bridge.send("VKWebAppCallAPIMethod", {
                method: "pages.getTitles",
                params: {
                    group_id: community.id,
                    v: "5.131",
                    access_token: accessToken.access_token
                }
            }).then(data => {
                if (data.response) {
                    setWikiPages(data.response.reverse()); // переворот массива, чтобы свежие изменения были вверху
                } else {
                    setSnackbar(<Snackbar
                        layout='vertical'
                        onClose={() => setSnackbar(null)}
                        before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic_red)'}}
                        ><Icon24Error fill='#fff' width='14' height='14'/></Avatar>}
                    >
                        Error get groups
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
                    {e.error_data ? e.error_data.error_reason.error_msg : 'Error get groups'}
                </Snackbar>);
            });
        }

        fetchWikiPages();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function ParseData(timestamp) {
        let date = new Date(timestamp * 1000);

        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        return ('0' + day).slice(-2) + "." + ('0' + month).slice(-2) + "." + year + " " +
            ('0' + hours).slice(-2) + ":" + ('0' + minutes).slice(-2) + ":" + ('0' + seconds).slice(-2);
    }

    /**
     * Выбор wiki-страницы для показа информации
     * @param item
     */
    const infoWikiPage = function (item) {
        console.log(item);
    }

    return (
        <Panel id={id} >
            <PanelHeader
                left={<PanelHeaderBack onClick={() => go(configData.routes.home)}/>}
            >
                <PanelHeaderContent
                    status={'Участников: ' + community.members_count }
                    before={<Avatar size={36} src={community.photo_200} />}
                >
                    {community.name}
                </PanelHeaderContent>
            </PanelHeader>
            <Group header={<Header mode="primary" indicator={wikiPages ? wikiPages.length : 0}
            >
                Wiki-страницы</Header>}>

                {(!wikiPages) && <PanelSpinner/>}
                {(wikiPages && wikiPages.length < 1) &&
                <Fragment>
                    <Placeholder
                        icon={<Icon32SearchOutline/>}
                    >
                        Не найдено
                    </Placeholder>
                </Fragment>
                }
                {(wikiPages && wikiPages.length > 0) &&
                <Fragment>
                    <Search/>
                    <List>
                        {wikiPages.map((item) => {
                            return (
                                <Cell key={item.id} before={<Icon28Document/>}
                                      description={'Изменено: ' + ParseData(item.edited)}
                                      // href={'https://vk.com/page-' + community.id + '_' + item.id + '?act=edit&section=edit'}
                                      // target='_blank' rel='noreferrer'
                                      onClick={()=>{infoWikiPage(item); return false;}}
                                      after={<IconButton
                                          onClick={()=>{infoWikiPage(item); return false;}}
                                      >
                                          <Icon24InfoCircleOutline/></IconButton>}
                                >
                                    {item.title}
                                </Cell>
                            );
                        })}
                    </List>
                    <Footer>{wikiPages.length} wiki-страниц</Footer>
                </Fragment>
                }
                <TooltipContainer fixed style={{position: 'fixed', bottom: 0, right: 0, padding: 20}}>
                    <Link fill='#fff'
                          href={'https://vk.com/pages?oid=-' + community.id + '&p=Title'}
                          target='_blank' rel='noreferrer'
                    >
                        <Icon28AddCircleFillBlue width={54} height={54}/></Link>
                </TooltipContainer>
            </Group>
            {snackbar}
        </Panel>
    )
}

export default Community;