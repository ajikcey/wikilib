import {Icon24ExternalLinkOutline} from "@vkontakte/icons";
import {
    Button,
    FormItem, FormLayout,
    usePlatform,
    VKCOM
} from "@vkontakte/vkui";
import React from "react";
import {useRouter} from "@happysanta/router";

const FromRenamePage = (props) => {
    const platform = usePlatform();
    const router = useRouter();

    return (
        <FormLayout>
            <FormItem
                style={{paddingTop: 30, paddingBottom: 0, paddingLeft: 0, paddingRight: 0}}
            >
                {(platform === VKCOM) &&
                    <Button
                        size="l"
                        href={'https://vk.com/' + props.group.screen_name + '?w=page-' + props.group.id + '_' + props.pageTitle.id + '/market'}
                        target='_blank' stretched={1}
                        after={<Icon24ExternalLinkOutline/>}
                    >
                        {props.strings.go}
                    </Button>
                }
                {(platform !== VKCOM) &&
                    <Button
                        mode="secondary"
                        size="l"
                        stretched={1}
                        onClick={() => router.popPage()}
                    >
                        {props.strings.close}
                    </Button>
                }
            </FormItem>
        </FormLayout>
    );
}

export default FromRenamePage;