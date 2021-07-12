import {ModalPageHeader, ANDROID, IOS, usePlatform, PanelHeaderClose, useAdaptivity, ViewWidth} from '@vkontakte/vkui';
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

    const {viewWidth} = useAdaptivity();
    const platform = usePlatform();
    const isMobile = viewWidth <= ViewWidth.MOBILE;

    return (
        <ModalPageHeader
            left={(
                <Fragment>
                    {(isMobile && platform === ANDROID) && <PanelHeaderClose onClick={props.onClose}/>}
                </Fragment>
            )}
            right={(
                <Fragment>
                    {platform === IOS && <PanelHeaderClose onClick={props.onSubmit}/>}
                </Fragment>
            )}
        >
            {props.children}
        </ModalPageHeader>
    )
}

export default AppModalPageHeader;