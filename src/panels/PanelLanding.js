import React, {Fragment} from 'react';
import {Group, Div, Panel, Footer, Button} from '@vkontakte/vkui';
import {Icon48Services} from "@vkontakte/icons";

import configData from "../config.json";
import package_json from "../../package.json";

const PanelLanding = ({id, strings}) => {
    return (
        <Panel id={id} centered={true}>
            <Fragment>
                <Group>
                    <Div style={{textAlign: 'center'}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <Icon48Services style={{color: 'var(--vkui--color_icon_accent)'}}/>
                        </div>
                        <h2>{configData.name}</h2>
                        <p>{strings.app_desc}</p>
                        <Div>
                            <Button href={'https://vk.com/app' + configData.app_id} mode='primary' size='l'>
                                {strings.open_app}
                            </Button>
                        </Div>
                    </Div>
                </Group>
                <Footer>v. {package_json.version}</Footer>
            </Fragment>
        </Panel>
    )
};

export default PanelLanding;