import configData from "../../config.json";
import {Button, Caption, FormItem, FormLayout, Input, Link, NativeSelect, SliderSwitch} from "@vkontakte/vkui";
import React, {useState} from "react";
import {fetchPage, fetchPages, handleError, savePage} from "../../functions";
import {useRouter} from "@happysanta/router";
import {PAGE_WIKI} from "../../index";
import {Icon16HelpOutline} from "@vkontakte/icons";

const FormAddPage = (props) => {
    const [title, setTitle] = useState("");
    const [type, setType] = useState(0);
    const [widgetType, setWidgetType] = useState(0);
    const [titleError, setTitleError] = useState(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const TYPE_EMPTY_PAGE = 0;
    const TYPE_WIDGET = 1;

    const onSubmit = async (e) => {
        e.preventDefault();
        let system_error = null;
        let page_text = "";

        if (titleError) return;

        const result = {
            title: title.trim()
        };
        setTitle(result.title);

        if (!result.title) {
            setTitleError({error_msg: props.strings.enter_title});
            return;
        }

        if (loading) return;
        setLoading(true);

        let page_exists = false;
        await fetchPages(props.group.id, props.accessToken.access_token).then(data => {
            if (data.response) {
                data.response.forEach((value) => {
                    if (value.title === result.title) page_exists = true;
                });
            } else {
                system_error = [{}, {
                    data: data,
                    default_error_msg: 'No response get pages'
                }];
            }
        }).catch(e => {
            system_error = [e, {
                default_error_msg: 'Error get pages'
            }];
        });

        if (system_error) {
            handleError(props.strings, props.modalData.setSnackbar, router, system_error[0], system_error[1]);
            setLoading(false);
            router.popPage();
            return;
        }

        if (page_exists) {
            setLoading(false);
            setTitleError({error_msg: props.strings.page_exists});
            return;
        }

        if (type === TYPE_WIDGET) {
            if (configData.widget_types[widgetType]) {
                page_text = configData.widget_types[widgetType].key + "\n" + configData.widget_types[widgetType].template;
            } else {
                setLoading(false);
                setTitleError({error_msg: props.strings.page_exists});
                return;
            }
        }

        await savePage(null, props.group.id, props.accessToken.access_token, result.title, page_text).then(async data => {
            if (data.response) {
                await fetchPage(data.response, props.group.id, 0, props.accessToken.access_token).then(data => {
                    if (data.response) {
                        props.setPageTitle(data.response);
                    } else {
                        system_error = [{}, {
                            data: data,
                            default_error_msg: 'No response get page'
                        }];
                    }
                }).catch(e => {
                    system_error = [e, {
                        default_error_msg: 'Error get page'
                    }];
                });
            } else {
                system_error = [{}, {
                    default_error_msg: 'No response save page'
                }];
            }
        }).catch(e => {
            system_error = [e, {
                default_error_msg: 'Error save page'
            }];
        });

        if (system_error) {
            handleError(props.strings, props.modalData.setSnackbar, router, system_error[0], system_error[1]);
            setLoading(false);
            router.popPage();
            return;
        }

        router.replacePage(PAGE_WIKI);
    }

    const onChangeTitle = (e) => {
        setTitle(e.currentTarget.value);

        if (!e.currentTarget.value) {
            setTitleError({error_msg: props.strings.enter_title});
        } else {
            setTitleError(null);
        }
    }

    const onChangeType = (value) => {
        setType(+value);
    }

    const onChangeWidgetType = (e) => {
        setWidgetType(+e.currentTarget.value);
    }

    return (
        <FormLayout onSubmit={onSubmit}>
            <FormItem
                top={props.strings.page_title}
                style={{paddingLeft: 0, paddingRight: 0, paddingBottom: 0}}
                status={titleError ? 'error' : ''}
                bottom={
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <Caption>{titleError && titleError.error_msg ? titleError.error_msg : ''}</Caption>
                        <Caption>{title.length + '/' + configData.max_length_title}</Caption>
                    </div>
                }
            >
                <Input
                    autoFocus={true}
                    onChange={onChangeTitle}
                    value={title}
                    maxLength={configData.max_length_title}
                />
            </FormItem>
            <FormItem
                style={{paddingLeft: 0, paddingRight: 0, paddingBottom: 0}}
                status={titleError ? 'error' : ''}
            >
                <SliderSwitch
                    activeValue={0}
                    onSwitch={onChangeType}
                    options={[
                        {
                            name: props.strings.empty_page,
                            value: TYPE_EMPTY_PAGE,
                        },
                        {
                            name: props.strings.widget,
                            value: TYPE_WIDGET,
                        },
                    ]}
                />
            </FormItem>
            <FormItem
                top={
                    <div>
                        {props.strings.widget_type}
                        <Link href="https://vk.com/dev/objects/appWidget" target="_blank"><Icon16HelpOutline/></Link>
                    </div>
                }
                status={titleError ? 'error' : ''}
                style={{paddingLeft: 0, paddingRight: 0}}
            >
                <NativeSelect
                    onChange={onChangeWidgetType}
                    disabled={type !== TYPE_WIDGET}
                >
                    {configData.widget_types.map((item, key) => {
                        return (
                            <option key={key} value={key}>{item.name}</option>
                        );
                    })}
                </NativeSelect>
            </FormItem>
            <Button
                loading={loading}
                type='submit'
                size="l"
                mode="primary"
                stretched
            >
                {props.strings.create}
            </Button>
        </FormLayout>
    );
}

export default FormAddPage;