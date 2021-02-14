/*
 * Search in Sidebar - More useful searching extension than Built-in features.
 * Copyright (c) 2018 Soushi Atsumi. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * This Source Code Form is "Incompatible With Secondary Licenses", as
 * defined by the Mozilla Public License, v. 2.0.
 */
'use strict';

var xmlHttpRequest = new XMLHttpRequest();
xmlHttpRequest.open('GET', browser.extension.getURL('/_values/PageActions.json'), false);
xmlHttpRequest.send();
const pageActions = JSON.parse(xmlHttpRequest.responseText);
xmlHttpRequest.open('GET', browser.extension.getURL('/_values/SearchEngines.json'), false);
xmlHttpRequest.send();
const searchEngines = JSON.parse(xmlHttpRequest.responseText);
xmlHttpRequest.open('GET', browser.extension.getURL('/_values/StorageKeys.json'), false);
xmlHttpRequest.send();
const storageKeys = JSON.parse(xmlHttpRequest.responseText);

document.getElementsByTagName('html')[0].lang = browser.i18n.getUILanguage();
document.title = browser.i18n.getMessage('sidebarHTMLTitle');

browser.storage.local.get([storageKeys.pageAction, storageKeys.searchEngine]).then((item) => {
	if (item === undefined) {
		window.location = browser.extension.getURL('index.html');
	} else if (item[storageKeys.pageAction] === pageActions.goBackToHome) {
		switch (item[storageKeys.searchEngine]) {
			case searchEngines.bing.name:
				window.location = searchEngines.bing.url;
				break;
			case searchEngines.duckduckgo.name:
				window.location = searchEngines.duckduckgo.url;
				break;
			case searchEngines.google.name:
				window.location = searchEngines.google.url;
				break;
			case searchEngines.yahoo.name:
				window.location = searchEngines.yahoo.url;
				break;
			case searchEngines.yahooJapan.name:
				window.location = searchEngines.yahooJapan.url;
				break;
			default:
				window.location = browser.extension.getURL('index.html');
		}
	} else {
		window.location = browser.extension.getURL('index.html');
	}
}).catch(() => {
	window.location = browser.extension.getURL('index.html');
});
