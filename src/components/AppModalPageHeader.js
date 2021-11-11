import {
    ModalPageHeader,
    ANDROID,
    IOS,
    usePlatform,
    PanelHeaderClose,
    PanelHeaderSubmit, VKCOM, useAdaptivity, ViewWidth
} from '@vkontakte/vkui';
import {Fragment} from "react";

/**
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const AppModalPageHeader = (props) => {
    const platform = usePlatform();
    const {viewWidth} = useAdaptivity();
    const isMobile = viewWidth <= ViewWidth.MOBILE;

    return (
        <ModalPageHeader
            left={(
                <Fragment>
                    {(isMobile && platform === ANDROID) && <PanelHeaderClose onClick={props.onClose}/>}
                    {(platform === IOS) && <PanelHeaderSubmit form={props.onSubmitFormId} type='submit'/>}
                </Fragment>
            )}
            right={(
                <Fragment>
                    {(platform === ANDROID || platform === VKCOM) &&
                    <PanelHeaderSubmit form={props.onSubmitFormId} type='submit'/>}
                    {(platform === IOS) && <PanelHeaderClose onClick={props.onClose}/>}
                </Fragment>
            )}
        >
            {props.children}
        </ModalPageHeader>
    )
}

export default AppModalPageHeader;