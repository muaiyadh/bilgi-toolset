// ==UserScript==
// @name         Bilgi Learn display as "List"
// @version      0.2
// @description  Displays courses as List instead of default Cards format
// @author       MuaiyadH
// @match        https://learn.bilgi.edu.tr/my/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Source: https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
    function waitForElm(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    resolve(document.querySelector(selector));
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }
    let listButtonCSS = ''; // The List button CSS selector that's used to actually change
    let firstCourseCSS = ''; // Used as an indicator that the page has fully loaded
    waitForElm('ul.dropdown-menu-right > li:nth-child(2) > a:nth-child(1)').then((elem) => {
        waitForElm('div.slick-list:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > figure:nth-child(1) > figcaption:nth-child(3)').then((elem2) => {
            elem.click();
            console.log('Hi');
        });
    });
})();
