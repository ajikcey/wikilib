import React, {Fragment} from 'react';

import {Group, Div, Panel, Button} from '@vkontakte/vkui';

import './Landing.css';
import {Icon48Services} from "@vkontakte/icons";

import configData from "../config.json";

const Landing = ({id}) => {
    return (
        <Panel id={id} centered={true}>

            <Fragment>
                <Group>
                    <Div className='User'>
                        <Icon48Services style={{color: 'var(--dynamic_blue)'}}/>

                        <h2>{configData.name}</h2>
                        <h3>Сервис, который хранит все wiki-страницы ВКонтакте в одном месте.</h3>

                        <Div>
                            <Button href={configData.url} mode='commerce' size='l'>
                                Открыть приложение
                            </Button>
                        </Div>
                        <Div>
                            <Button href={configData.community} mode='tertiary' size='l'>
                                Перейти в сообщество
                            </Button>
                        </Div>
                    </Div>
                </Group>
            </Fragment>
        </Panel>
    )
};

export default Landing;