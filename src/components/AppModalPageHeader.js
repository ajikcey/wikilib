import {ModalPageHeader, ANDROID, IOS, usePlatform, VKCOM, PanelHeaderButton} from '@vkontakte/vkui';
import {Icon24Cancel, Icon24Done} from "@vkontakte/icons";
import {Fragment} from "react";

const AppModalPageHeader = (props) => {

    const platform = usePlatform();

    return (
        <ModalPageHeader
            left={(
                <Fragment>
                    {(platform === ANDROID || platform === VKCOM) &&
                    <PanelHeaderButton onClick={props.onClose}><Icon24Cancel/></PanelHeaderButton>}
                </Fragment>
            )}
            right={(
                <Fragment>
                    {(platform === ANDROID || platform === VKCOM) &&
                    <PanelHeaderButton onClick={props.onSubmit}><Icon24Done/></PanelHeaderButton>}
                    {platform === IOS && <PanelHeaderButton onClick={props.onSubmit}>Готово</PanelHeaderButton>}
                </Fragment>
            )}
        >
            {props.children}
        </ModalPageHeader>
    )
}

export default AppModalPageHeader;