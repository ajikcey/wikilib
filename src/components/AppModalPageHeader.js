import {
    ModalPageHeader,
    ANDROID,
    IOS,
    usePlatform,
    PanelHeaderClose,
    PanelHeaderSubmit, VKCOM
} from '@vkontakte/vkui';
import {Fragment} from "react";

/*
Требования по расположению кнопок:
- На Android слева может быть PanelHeaderClose.
- На iOS справа должна быть кнопка закрытия. Это может быть либо PanelHeaderButton с иконкой <Icon24Dismiss />, либо PanelHeaderClose или PanelHeaderSubmit.
- Если произойдёт навигация вперёд внутри модального окна, то слева в шапке останется только кнопка назад.
- Также на Android могут быть какие-то дополнительные кнопки-иконки справа, а на iOS – слева.
*/

/**
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const AppModalPageHeader = (props) => {
    const platform = usePlatform();

    return (
        <ModalPageHeader
            left={(
                <Fragment>
                    {(platform === ANDROID) && <PanelHeaderClose onClick={props.onClose}/>}
                    {(platform === IOS) && <PanelHeaderSubmit onClick={props.onSubmit}/>}
                </Fragment>
            )}
            right={(
                <Fragment>
                    {(platform === ANDROID || platform === VKCOM) && <PanelHeaderSubmit onClick={props.onSubmit}/>}
                    {(platform === IOS) && <PanelHeaderClose onClick={props.onClose}/>}
                </Fragment>
            )}
        >
            {props.children}
        </ModalPageHeader>
    )
}

export default AppModalPageHeader;