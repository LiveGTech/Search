/*
    LiveG Search

    Copyright (C) LiveG. All Rights Reserved.

    https://search.liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

import * as astronaut from "https://opensource.liveg.tech/Adapt-UI/astronaut/astronaut.js";

export var HomeScreen = astronaut.component("HomeScreen", function(props, children) {
    return Screen (
        NavigationBar({
            styles: {
                "position": "static"
            }
        }) (
            Link() (
                Image("https://liveg.tech/logo.png") ()
            ),
            Link({attributes: {"aui-selected": true}}) (_("search"))
        ),
        Page({
            shown: true,
            styles: {
                "display": "flex",
                "flex-direction": "column",
                "justify-content": "center",
                "min-height": "calc(100% - 9rem)",
                "margin": "0"
            }
        }) (
            Section({
                styles: {
                    "min-height": "20rem"
                }
            }) (
                Container({
                    styles: {
                        "max-width": "40rem"
                    }
                }) (
                    Input({type: "search", placeholder: _("searchInput_placeholder")}) ()
                )
            )
        ),
        Footer({
            styles: {
                "min-height": "4rem",
                "padding-top": "1.3rem",
                "padding-bottom": "1.3rem"
            }
        }) (
            Text("Hi")
        )
    );
});