/*
    LiveG Search

    Copyright (C) LiveG. All Rights Reserved.

    https://search.liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

import * as $g from "https://opensource.liveg.tech/Adapt-UI/src/adaptui.js";
import * as astronaut from "https://opensource.liveg.tech/Adapt-UI/astronaut/astronaut.js";

import * as layout from "./layout.js";
import * as searchResults from "./searchresults.js";

export var SearchScreen = astronaut.component("SearchScreen", function(props, children) {
    var searchInput = Input({
        type: "search",
        value: props.query,
        styles: {
            "max-width": "40rem",
            "background-color": "var(--searchBackground)"
        }
    }) ();

    var screen = Screen (
        layout.GeneralNavigationBar() (),
        Section({
            styles: {
                "background-color": layout.getThemeData().background
            }
        }) (
            searchInput
        ),
        ...children
    );

    $g.sel("body").on("keydown", function(event) {
        if (screen.hasAttribute("hidden") || document.activeElement == searchInput.get()) {
            return;
        }

        if (event.key == "/") {
            searchInput.focus();
        
            var domElement = searchInput.get();

            domElement.selectionStart = searchInput.getValue().length;
            domElement.selectionEnd = searchInput.getValue().length;

            event.preventDefault();
        }
    });

    searchInput.on("keydown", function(event) {
        if (event.key == "Enter") {
            screen.emit("visitsearch", {query: searchInput.getValue()});
        }
    });

    return screen;
});

export var PageResultHeading = astronaut.component("PageResultHeading", function(props, children) {
    return Heading({
        level: 2,
        styles: {
            "font-size": "1.2em",
            "margin-bottom": "0",
            "overflow-wrap": "break-word"
        }
    }) (Link(props.url) (props.title));
});

export var PageResultUrl = astronaut.component("PageResultUrl", function(props, children) {
    return Paragraph({
        styles: {
            "margin-top": "0",
            "margin-bottom": "0.5em",
            "color": "var(--url)",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "white-space": "nowrap"
        }
    }) (props.url);
});

export var PageResultContainer = astronaut.component("PageResultContainer", function(props, children) {
    return Container({
        styles: {
            "margin-bottom": "1rem"
        }
    }) (
        PageResultHeading({title: props.result.title, url: props.result.url}) (),
        PageResultUrl({url: props.result.url}) (),
        Paragraph({
            styles: {
                "margin-top": "0.5em",
                "overflow-wrap": "break-word"
            }
        }) (props.result.description)
    );
});

export var InfoCardContainer = astronaut.component("InfoCardContainer", function(props, children) {
    return Card (
        Paragraph() (props.result.contents),
        PageResultHeading({title: props.result.title, url: props.result.url}) (),
        PageResultUrl({url: props.result.url}) ()
    );
});

export var SecondaryCardContainer = astronaut.component("SecondaryCardContainer", function(props, children) {
    return Card() (
        Heading() (props.result.title),
        Paragraph() (props.result.classification || ""),
        Paragraph() (props.result.contents),
        Link(props.result.url) (props.result.attribution)
    );
});

export var WebSearchScreen = astronaut.component("SearchScreen", function(props, children) {
    var resultsContainer = Container({
        classes: ["primary"],
        styles: {
            "flex-grow": "0",
            "width": "40rem",
            "max-width": "100%",
            "flex-basis": "unset"
        }
    }) (
        SkeletonLoader() (
            astronaut.repeat(6, Container({
                styles: {
                    "margin-bottom": "2rem"
                }
            }) (
                Paragraph({
                    styles: {
                        "width": "50%"
                    }
                }) (),
                astronaut.repeat(2, Paragraph() ())
            ))
        )
    );

    var secondaryResultsContainer = Container({
        classes: ["secondary"]
    }) ();

    searchResults.getWebResults(props.query).then(function(data) {
        resultsContainer.clear();

        data.forEach(function(result) {
            if (result instanceof searchResults.InfoCard) {
                resultsContainer.add(InfoCardContainer({result}) ());

                return;
            }

            if (result instanceof searchResults.SecondaryCard) {
                secondaryResultsContainer.add(SecondaryCardContainer({result}) ());

                return;
            }

            resultsContainer.add(PageResultContainer({result}) ());
        });
    });

    return SearchScreen(props) (
        Section (
            Container({
                classes: ["results"],
                attributes: {
                    "aui-stack": "horizontal reverse"
                },
                styles: {
                    "gap": "2rem"
                }
            }) (
                secondaryResultsContainer,
                resultsContainer
            )
        )
    );
});