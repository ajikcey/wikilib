import {
    Avatar,
    Button, Caption, CustomSelectOption,
    FormItem,
    FormLayout,
    Input,
    Select,
    Spacing
} from "@vkontakte/vkui";
import React, {useEffect, useState} from "react";
import {cutDeclNum, fetchGroups, fetchGroupsById, fetchPage, fetchPages, handleError, savePage} from "../../functions";
import configData from "../../config.json";
import {PAGE_GROUP} from "../../index";
import {useRouter} from "@happysanta/router";

const FormCopyPage = (props) => {
    const [groupId, setGroupId] = useState(props.modalData.group.id);
    const [title, setTitle] = useState(props.modalData.title);
    const [titleError, setTitleError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState({items: [props.modalData.group], count: 1});

    const router = useRouter();

    const onSubmit = async (e) => {
        let system_error = null;

        e.preventDefault();

        if (titleError) {
            return;
        }

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
        await fetchPages(groupId, props.accessToken.access_token).then(data => {
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

        await savePage(null, groupId, props.accessToken.access_token, title, props.modalData.text).then(async data => {
            if (data.response) {

                if (groupId !== props.modalData.group.id) {
                    await fetchGroupsById([groupId], props.accessToken.access_token).then(data => {
                        if (data.response) {
                            props.setGroup(data.response[0]);
                        } else {
                            system_error = [{}, {
                                default_error_msg: 'No response get groups by id'
                            }];
                        }
                    }).catch(e => {
                        system_error = [e, {
                            default_error_msg: 'Error get groups by id'
                        }];
                    });

                    if (system_error) {
                        handleError(props.strings, props.modalData.setSnackbar, router, system_error[0], system_error[1]);
                        setLoading(false);
                        router.popPage();
                        return;
                    }
                }

                await fetchPage(data.response, groupId, 0, props.accessToken.access_token).then(data => {
                    if (data.response) {
                        // success
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

        router.replacePage(PAGE_GROUP);
    };

    const onChangeTitle = (e) => {
        setTitle(e.currentTarget.value);

        if (!e.currentTarget.value) {
            setTitleError({error_msg: props.strings.enter_title});
        } else {
            setTitleError(null);
        }
    };

    const onChangeGroup = (e) => {
        setTitleError(null);
        setGroupId(+e.target.value);
    };

    useEffect(() => {
        fetchGroups(0, props.accessToken.access_token).then(data => {
            if (data.response) {
                setGroups(data.response);
            }
        }).catch();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <FormLayout onSubmit={onSubmit}>
            <FormItem
                top={props.strings.page_title}
                status={titleError ? 'error' : ''}
                bottom={
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <Caption>{titleError && titleError.error_msg ? titleError.error_msg : ''}</Caption>
                        <Caption>{title.length + '/' + configData.max_length_title}</Caption>
                    </div>
                }
                style={{paddingLeft: 0, paddingRight: 0, paddingBottom: 0}}
            >
                <Input
                    onChange={onChangeTitle}
                    value={title}
                    autoFocus={true}
                    maxLength={configData.max_length_title}
                />
            </FormItem>
            <FormItem
                top={props.strings.community}
                style={{paddingLeft: 0, paddingRight: 0, paddingBottom: 0}}>
                <Select
                    onChange={onChangeGroup}
                    defaultValue={props.modalData.group.id}
                    options={groups && groups.items && groups.items.map((group) => ({
                        value: group.id,
                        label: group.name,
                        avatar: group.photo_100,
                        description: cutDeclNum(group.members_count, [
                            props.strings.member.toLowerCase(),
                            props.strings.two_members.toLowerCase(),
                            props.strings.some_members.toLowerCase()
                        ]),
                    }))}
                    renderOption={({option, ...restProps}) => (
                        <CustomSelectOption
                            {...restProps}
                            before={<Avatar size={32} src={option.avatar}/>}
                            description={option.description}
                        />
                    )}
                />
            </FormItem>

            <Spacing size={16}/>

            <Button
                loading={loading}
                type='submit'
                size="l"
                mode="primary"
                stretched
            >{props.strings.copy}</Button>
        </FormLayout>
    );
}

export default FormCopyPage;