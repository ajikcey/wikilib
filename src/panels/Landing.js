import React, {Fragment} from 'react';
import {Group, Div, Panel, Button} from '@vkontakte/vkui';
import {Icon48Services} from "@vkontakte/icons";

import configData from "../config.json";

const Landing = ({id, strings}) => {
    return (
        <Panel id={id} centered={true}>
            <Fragment>
                <Group>
                    <Div style={{textAlign: 'center'}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <Icon48Services style={{color: 'var(--dynamic_blue)'}}/>
                        </div>

                        <h2>{configData.name}</h2>
                        <h3>{strings.app_desc}</h3>

                        <Div>
                            <Button href={'https://vk.com/app' + configData.app_id} mode='commerce' size='l'>
                                {strings.open_app}
                            </Button>
                        </Div>
                    </Div>
                </Group>
            </Fragment>
        </Panel>
    )
};

export default Landing;