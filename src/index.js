import 'core-js/features/map';
import 'core-js/features/set';
import React from "react";
import ReactDOM from "react-dom";
import bridge from "@vkontakte/vk-bridge";
import App from "./App";

// Init VK  Mini App
bridge.send("VKWebAppInit").then((data) => {
});
bridge.subscribe(({detail: {type, data}}) => {
    const schemeAttribute = document.createAttribute('scheme');

    if (type === 'VKWebAppUpdateConfig') {
        // определение цветовой схемы для приложения
        schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
        document.body.attributes.setNamedItem(schemeAttribute);
    } else if (type === 'vk-connect') {
        if (typeof data === 'undefined') {
            // определение цветовой схемы вне приложения
            schemeAttribute.value = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "space_gray" : "bright_light");
            document.body.attributes.setNamedItem(schemeAttribute);
        }
    }
});

ReactDOM.render(<App/>, document.getElementById("root"));

if (process.env.NODE_ENV === "development") {
    import("./eruda").then(({default: eruda}) => {
    }); //runtime download
}