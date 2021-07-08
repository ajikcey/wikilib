import React, {Fragment, useEffect, useState} from 'react';

import {
    Avatar, Cell,
    Group,
    Header, List,
    Panel,
    PanelHeader,
    PanelHeaderBack,
    Placeholder,
    Search,
    Snackbar
} from '@vkontakte/vkui';

import configData from "../config.json";
import bridge from "@vkontakte/vk-bridge";
import {
    Icon24Error,
    Icon24ExternalLinkOutline,
    Icon28Document,
    Icon32SearchOutline,
} from "@vkontakte/icons";

const Community = ({id, accessToken, community, go, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [wikiPages, setWikiPages] = useState([]);

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

    return (
        <Panel id={id}>
            <PanelHeader
                left={<PanelHeaderBack onClick={() => go(configData.routes.home)}/>}
            >
                {configData.name}
            </PanelHeader>
            <Group header={<Header mode="primary" indicator={wikiPages.length}>Wiki-страницы</Header>}>
                <Search/>
                <List>
                    {(wikiPages.length < 1) &&
                    <Fragment>
                        <Placeholder
                            icon={<Icon32SearchOutline/>}
                        >
                            Wiki-страниц не найдено
                        </Placeholder>
                    </Fragment>
                    }
                    {(wikiPages.length > 0) &&
                    <Fragment>
                        {wikiPages.map((item) => {
                            return (
                                <Cell key={item.id} before={<Icon28Document/>}
                                      description={'Изменено: ' + ParseData(item.edited)}
                                      after={<a
                                          style={{color: 'var(--dynamic_blue)'}}
                                          href={'https://vk.com/page-' + community.id + '_' + item.id + '?act=edit&section=edit'}
                                          target='_blank'
                                      >
                                          <Icon24ExternalLinkOutline/></a>}
                                >
                                    {item.title}
                                </Cell>
                            );
                        })}
                    </Fragment>
                    }
                </List>
            </Group>
            {snackbar}
        </Panel>
)
}

export default Community;