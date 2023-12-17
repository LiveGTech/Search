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

export const REFINEMENT_WEIGHTINGS = {
    quickLookups: {
        keywordWeighting: 0.1,
        referenceWeighting: 0.5,
        intersectionWeighting: 0.8,
        titleWeighting: 0.9
    },
    popularPages: {
        keywordWeighting: 0.2,
        referenceWeighting: 0.9,
        titleWeighting: 0.7,
        intersectionWeighting: 0.5
    },
    inDepth: {
        keywordWeighting: 0.7,
        referenceWeighting: 0.3,
        titleWeighting: 0.5,
        intersectionWeighting: 0.8
    },
    precisePhrases: {
        keywordWeighting: 0.3,
        referenceWeighting: 0.2,
        titleWeighting: 0.9,
        intersectionWeighting: 0.8
    }
};

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

    var secondaryResultsContainer = Container() ();

    var refinementInput = SelectionInput({value: "quickLookups"}) (
        Object.keys(REFINEMENT_WEIGHTINGS).map((option) => SelectionInputOption({value: option}) (_(`advancedSearchOptions_refineFor_${option}`)))
    );

    var keywordWeightingSlider = RangeSliderInput({min: 0, max: 1, step: 0.01, value: 0.1}) ();
    var referenceWeightingSlider = RangeSliderInput({min: 0, max: 1, step: 0.01, value: 0.5}) ();
    var titleWeightingSlider = RangeSliderInput({min: 0, max: 1, step: 0.01, value: 0.9}) ();
    var intersectionWeightingSlider = RangeSliderInput({min: 0, max: 1, step: 0.01, value: 0.8}) ();
    var recentlyUpdatedResults = false;
    var willUpdateResultsSoon = false;

    var intersectionWeightingContainer = Label (
        Text(_("advancedSearchOptions_intersectionWeighting")),
        intersectionWeightingSlider
    );

    function updateResults() {
        var weightings = {
            keywordWeighting: keywordWeightingSlider.getValue(),
            referenceWeighting: referenceWeightingSlider.getValue(),
            titleWeighting: titleWeightingSlider.getValue(),
            intersectionWeighting: intersectionWeightingSlider.getValue()
        };
 
        searchResults.getWebResults(props.query, weightings).then(function(data) {
            resultsContainer.clear();
            secondaryResultsContainer.clear();
    
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
    }

    [keywordWeightingSlider, referenceWeightingSlider, titleWeightingSlider, intersectionWeightingSlider].forEach(function(slider) {
        slider.on("change", function() {
            refinementInput.setValue("");

            if (recentlyUpdatedResults) {
                if (willUpdateResultsSoon) {
                    return;
                }

                willUpdateResultsSoon = true;

                setTimeout(function() {
                    updateResults();

                    recentlyUpdatedResults = false;
                    willUpdateResultsSoon = false;
                }, 2_000);

                return;
            }

            updateResults();

            recentlyUpdatedResults = true;
        });
    });

    refinementInput.on("change", function() {
        if (refinementInput.getValue() == "") {
            return;
        }

        var weightings = REFINEMENT_WEIGHTINGS[refinementInput.getValue()];

        keywordWeightingSlider.setValue(weightings.keywordWeighting);
        referenceWeightingSlider.setValue(weightings.referenceWeighting);
        titleWeightingSlider.setValue(weightings.titleWeighting);
        intersectionWeightingSlider.setValue(weightings.intersectionWeighting);

        updateResults();
    });

    if (props.query.trim().split(/\s+/).length == 1) {
        intersectionWeightingContainer.hide();
    }

    updateResults();

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
                Container({
                    classes: ["secondary"]
                }) (
                    secondaryResultsContainer,
                    Container({
                        classes: ["advancedSearchOptions"]
                    }) (
                        Accordion() (
                            Text(_("advancedSearchOptions_title")),
                            Label (
                                Text(_("advancedSearchOptions_refineFor")),
                                refinementInput
                            ),
                            Label (
                                Text(_("advancedSearchOptions_keywordWeighting")),
                                keywordWeightingSlider
                            ),
                            Label (
                                Text(_("advancedSearchOptions_referenceWeighting")),
                                referenceWeightingSlider
                            ),
                            Label (
                                Text(_("advancedSearchOptions_titleWeighting")),
                                titleWeightingSlider
                            ),
                            intersectionWeightingContainer
                        )
                    )
                ),
                resultsContainer
            )
        )
    );
});