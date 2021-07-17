import React, {useEffect, useState} from 'react';

import {
    Avatar,
    Button, CellButton,
    FormItem, FormLayout,
    Group, InfoRow, Input, Link,
    Panel, PanelHeader, PanelHeaderBack, PanelHeaderContent, SimpleCell, Snackbar, Text, Textarea, usePlatform, VKCOM
} from '@vkontakte/vkui';

import {
    Icon24CheckCircleOutline, Icon24ExternalLinkOutline,
    Icon36CalendarOutline,
} from "@vkontakte/icons";
import configData from "../config.json";
import {fetchUsers, handleError, savePage, timestampToDate} from "../functions";
import IconPage from "../components/IconPage";

const Version = ({id, accessToken, content, group, go, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [creator, setCreator] = useState({});
    const [title, setTitle] = useState(content.title);
    const [text, setText] = useState(content.source);
    const [formError, setFormError] = useState({});

    const platform = usePlatform();

    useEffect(() => {

        fetchUsers([content.creator_id], accessToken.access_token).then(data => {
            if (data.response) {
                setCreator(data.response[0]);
            } else {
                handleError(setSnackbar, go, {}, {
                    data: data,
                    default_error_msg: 'No response get users'
                });
            }
        }).catch(e => {
            handleError(setSnackbar, go, e, {
                default_error_msg: 'Error get users'
            });
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Применить данную версию wiki-страницы
     */
    const onSubmitVersion = (e) => {
        e.preventDefault();

        if (formError.title || formError.text) {
            return;
        }

        setTitle(title.trim());
        setText(text.trim());

        if (!title.trim()) {
            setFormError({title: 'Введите название'});
            return;
        }

        if (!text.trim()) {
            setFormError({text: 'Введите текст'});
            return;
        }

        savePage(content.page_id, group.id, accessToken.access_token, title, text).then(() => {

            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
            >
                Сохранено
            </Snackbar>);

            go(configData.routes.page);
        });
    }

    /**
     * Изменение названия
     * @param e
     */
    const onChangeTitle = (e) => {
        setTitle(e.currentTarget.value);

        if (!e.currentTarget.value) {
            setFormError({title: 'Введите название'});
        } else {
            setFormError({title: null});
        }
    }

    /**
     * Изменение текста
     * @param e
     */
    const onChangeText = (e) => {
        setText(e.currentTarget.value);

        if (!e.currentTarget.value) {
            setFormError({text: 'Введите текст'});
        } else {
            setFormError({text: null});
        }
    }

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderBack onClick={() => go(configData.routes.page)}/>}
            >
                <PanelHeaderContent
                    status={(content.version ? 'v.' + content.version : 'текущая версия')}
                    before={<IconPage page={content}/>}
                >
                    {content.title}
                </PanelHeaderContent>
            </PanelHeader>

            <Group>
                <SimpleCell
                    before={<Icon36CalendarOutline/>}
                    after={<Link
                        href={'https://vk.com/id' + content.creator_id} target='_blank'
                    >
                        <Avatar size={32} src={creator.photo_200}/></Link>}
                >
                    <InfoRow header="Версия сохранена">
                        {timestampToDate(content.edited)}
                    </InfoRow>
                </SimpleCell>

                <CellButton
                    before={<Icon24ExternalLinkOutline/>}
                    href={'https://vk.com/page-' + group.id + '_' + content.page_id + '?act=edit&section=edit' + (content.version ? '&hid=' + content.version : '')}
                    target='_blank' rel='noreferrer'
                >
                    Открыть редактор ВК</CellButton>

                <FormLayout onSubmit={onSubmitVersion}>
                    <FormItem
                        top="Название"
                        status={formError.title ? 'error' : ''}
                        bottom={formError.title ? formError.title : ''}
                    >
                        <Input
                            name='title'
                            placeholder="Введите название"
                            onChange={onChangeTitle}
                            value={title}
                            readOnly
                        />
                    </FormItem>
                    <FormItem
                        top="Текст"
                        style={{position: 'relative'}}
                        status={formError.text ? 'error' : ''}
                        bottom={formError.text ? formError.text : ''}
                    >
                        <Textarea
                            rows={20}
                            name='text'
                            placeholder="Введите текст"
                            onChange={onChangeText}
                            value={text}
                        />
                        <Text style={{
                            position: 'absolute',
                            right: 25,
                            bottom: 14,
                            zIndex: 1,
                            color: 'var(--text_secondary)'
                        }}>{text.length}</Text>
                    </FormItem>
                    <FormItem style={{textAlign: 'right'}}>
                        <Button
                            size="l"
                            stretched={platform !== VKCOM}
                        >
                            {content.version ? 'Применить данную версию' : 'Сохранить'}
                        </Button>
                    </FormItem>
                </FormLayout>
            </Group>
            {snackbar}
        </Panel>
    )
}

export default Version;