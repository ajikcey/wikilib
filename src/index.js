import 'core-js/features/map';
import 'core-js/features/set';
import React from "react";
import ReactDOM from "react-dom";
import bridge from "@vkontakte/vk-bridge";
import App from "./App";
import TagManager from 'react-gtm-module';
import {Page, Router, RouterContext} from "@happysanta/router";
import configData from "./config.json";

export const PAGE_MAIN = '/';
export const PAGE_HOME = '/home';
export const PAGE_LANDING = '/landing';
export const PAGE_ABOUT = '/about';
export const PAGE_GROUP = '/group';
export const PAGE_WIKI = '/wiki';
export const PAGE_TOKEN = '/token';
export const PAGE_IMAGES = '/images';
export const PAGE_UNLOADED = '/unloaded';

export const PANEL_MAIN = 'panel_main';
export const PANEL_HOME = 'panel_home';
export const PANEL_LANDING = 'panel_landing';
export const PANEL_ABOUT = 'panel_about';
export const PANEL_GROUP = 'panel_group';
export const PANEL_WIKI = 'panel_wiki';
export const PANEL_TOKEN = 'panel_token';
export const PANEL_IMAGES = 'panel_images';
export const PANEL_UNLOADED = 'panel_unloaded';

export const MODAL_ADD_PAGE = 'modal_add_page';
export const MODAL_COPY_PAGE = 'modal_copy_page';
export const MODAL_EDIT_PAGE = 'modal_edit_page';
export const MODAL_RENAME_PAGE = 'modal_rename_page';
export const MODAL_ACCESS_PAGE = 'modal_access_page';
export const MODAL_SORT_PAGE = 'modal_sort_page';
export const MODAL_GROUP = 'modal_group';
export const MODAL_ERROR = 'modal_error';
export const MODAL_IMAGE = 'modal_image';

export const POPOUT_MENU_WIDGET = 'popout_menu_widget';

export const VIEW_MAIN = 'view_main';

export const ASC = "ASC";
export const DESC = "DESC";

export const STORAGE_LAST_GROUP = "last_groups";
export const STORAGE_STATUS = "status";
export const STORAGE_ACCESS_TOKEN = "access_token";
export const STORAGE_ACCESS_GROUP_TOKENS = "access_group_tokens";

const routes = {
    [PAGE_MAIN]: new Page(PANEL_MAIN, VIEW_MAIN),
    [PAGE_HOME]: new Page(PANEL_HOME, VIEW_MAIN),
    [PAGE_LANDING]: new Page(PANEL_LANDING, VIEW_MAIN),
    [PAGE_ABOUT]: new Page(PANEL_ABOUT, VIEW_MAIN),
    [PAGE_GROUP]: new Page(PANEL_GROUP, VIEW_MAIN),
    [PAGE_WIKI]: new Page(PANEL_WIKI, VIEW_MAIN),
    [PAGE_TOKEN]: new Page(PANEL_TOKEN, VIEW_MAIN),
    [PAGE_IMAGES]: new Page(PANEL_IMAGES, VIEW_MAIN),
    [PAGE_UNLOADED]: new Page(PANEL_UNLOADED, VIEW_MAIN),
};

const router = new Router(routes);
router.start();

bridge.send("VKWebAppInit").then((data) => {
    if (process.env.NODE_ENV === "development") {
        if (0) console.log("VKWebAppInit", data);
    }
});

if (bridge.supports('VKWebAppResizeWindow')) {
    bridge.send("VKWebAppResizeWindow", {
        "width": window.innerWidth,
        "height": Math.min(Math.max(window.screen.availHeight - 250, configData.window_min_height), configData.window_max_height)
    }).then();
}

bridge.subscribe(({detail: {type, data}}) => {
    if (process.env.NODE_ENV === "development") {
        // console.log('bridge', type, data);
    }

    const schemeAttribute = document.createAttribute('scheme');

    if (type === 'VKWebAppUpdateConfig') {
        schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
        document.body.attributes.setNamedItem(schemeAttribute);
    } else if (type === 'vk-connect') {
        if (typeof data === 'undefined') {
            schemeAttribute.value = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "space_gray" : "bright_light");
            document.body.attributes.setNamedItem(schemeAttribute);
            router.replacePage(PAGE_LANDING);
        }
    }
});

TagManager.initialize({
    gtmId: 'GTM-M6TRBHK'
});

ReactDOM.render(<RouterContext.Provider value={router}>
    <App/>
</RouterContext.Provider>, document.getElementById("root"));

if (process.env.NODE_ENV === "development") {
    import("./eruda").then(({default: eruda}) => {
        if (0) console.log("Eruda", eruda);
    });
}