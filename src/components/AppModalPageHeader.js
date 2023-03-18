import {
    ModalPageHeader,
    usePlatform,
    PanelHeaderClose,
    PanelHeaderSubmit, useAdaptivity, ViewWidth, Platform
} from '@vkontakte/vkui';
import {Fragment} from "react";

const AppModalPageHeader = (props) => {
    const platform = usePlatform();
    const {viewWidth} = useAdaptivity();
    const isMobile = viewWidth <= ViewWidth.MOBILE;

    return (
        <ModalPageHeader
            left={(
                <Fragment>
                    {(isMobile && platform === Platform.ANDROID) && <PanelHeaderClose onClick={props.onClose}/>}
                    {(platform === Platform.IOS) && <PanelHeaderSubmit form={props.onSubmitFormId} type='submit'/>}
                </Fragment>
            )}
            right={(
                <Fragment>
                    {(platform === Platform.ANDROID || platform === Platform.VKCOM) &&
                    <PanelHeaderSubmit form={props.onSubmitFormId} type='submit'/>}
                    {(platform === Platform.IOS) && <PanelHeaderClose onClick={props.onClose}/>}
                </Fragment>
            )}
        >
            {props.children}
        </ModalPageHeader>
    )
}

export default AppModalPageHeader;