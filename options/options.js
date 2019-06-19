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

const searcheEngineAskId = 'searcheEngineAsk';
const searcheEngineBingId = 'searcheEngineBing';
const searcheEngineDuckDuckGoId = 'searcheEngineDuckDuckGo';
const searcheEngineGoogleId = 'searcheEngineGoogle';
const searcheEngineYahooId = 'searcheEngineYahoo';
const searcheEngineYahooJapanId = 'searcheEngineYahooJapan';
const pageActionReloadId = 'pageActionReload';
const pageActionGoBackToHomeId = 'pageActionGoBackToHome';

document.getElementsByTagName('html')[0].lang = browser.i18n.getUILanguage();
document.title = browser.i18n.getMessage('optionsHTMLTitle');
document.getElementById('searchEnginesLegend').innerText = browser.i18n.getMessage('searchEngines');
document.getElementById('askSearchEngineLabel').innerText = browser.i18n.getMessage('ask');
document.getElementById('alwaysUseBingLabel').innerText = browser.i18n.getMessage('alwaysUseBing');
document.getElementById('alwaysUseDuckDuckGoLabel').innerText = browser.i18n.getMessage('alwaysUseDuckDuckGo');
document.getElementById('alwaysUseGoogleLabel').innerText = browser.i18n.getMessage('alwaysUseGoogle');
document.getElementById('alwaysUseYahooLabel').innerText = browser.i18n.getMessage('alwaysUseYahoo');
document.getElementById('alwaysUseYahooJapanLabel').innerText = browser.i18n.getMessage('alwaysUseYahooJapan');
document.getElementById('pageActionLegend').innerText = browser.i18n.getMessage('behaviorOfPageAction');
document.getElementById('pageActionReloadLabel').innerText = browser.i18n.getMessage('reload');
document.getElementById('pageActionGoBackToHomeLabel').innerText = browser.i18n.getMessage('goBackToHome');

document.options.searchEngine.forEach((element) => {
	element.addEventListener('click', searchEngineRadioButtonOnClick);
});

document.options.pageAction.forEach((element) => {
	element.addEventListener('click', pageActionRadioButtonOnClick);
});

checkSearchEngine();
checkPageAction();

function searchEngineRadioButtonOnClick(event) {
	switch (event.target.id) {
		case searcheEngineAskId:
			browser.storage.local.set({ [storageKeys.searchEngine]: searchEngines.ask.name });
			break;
		case searcheEngineBingId:
			browser.storage.local.set({ [storageKeys.searchEngine]: searchEngines.bing.name });
			break;
		case searcheEngineDuckDuckGoId:
			browser.storage.local.set({ [storageKeys.searchEngine]: searchEngines.duckduckgo.name });
			break;
		case searcheEngineGoogleId:
			browser.storage.local.set({ [storageKeys.searchEngine]: searchEngines.google.name });
			break;
		case searcheEngineYahooId:
			browser.storage.local.set({ [storageKeys.searchEngine]: searchEngines.yahoo.name });
			break;
		case searcheEngineYahooJapanId:
			browser.storage.local.set({ [storageKeys.searchEngine]: searchEngines.yahooJapan.name });
			break;
	}

	checkSearchEngine();
}

function checkSearchEngine() {
	browser.storage.local.get(storageKeys.searchEngine).then((item) => {
		if (Object.keys(item).includes(storageKeys.searchEngine)) {
			switch (item[storageKeys.searchEngine]) {
				case searchEngines.bing.name:
					document.getElementById(searcheEngineBingId).checked = true;
					break;
				case searchEngines.duckduckgo.name:
					document.getElementById(searcheEngineDuckDuckGoId).checked = true;
					break;
				case searchEngines.google.name:
					document.getElementById(searcheEngineGoogleId).checked = true;
					break;
				case searchEngines.yahoo.name:
					document.getElementById(searcheEngineYahooId).checked = true;
					break;
				case searchEngines.yahooJapan.name:
					document.getElementById(searcheEngineYahooJapanId).checked = true;
					break;
			}
		}
	});
}

function pageActionRadioButtonOnClick(event) {
	switch (event.target.id) {
		case pageActionReloadId:
			browser.storage.local.set({ [storageKeys.pageAction]: pageActions.reload });
			break;
		case pageActionGoBackToHomeId:
			browser.storage.local.set({ [storageKeys.pageAction]: pageActions.goBackToHome });
			break;
	}

	checkPageAction();
}

function checkPageAction() {
	browser.storage.local.get(storageKeys.pageAction).then((item) => {
		switch (item[storageKeys.pageAction]) {
			case pageActions.reload:
				document.getElementById(pageActionReloadId).checked = true;
				break;
			case pageActions.goBackToHome:
				document.getElementById(pageActionGoBackToHomeId).checked = true;
				break;
		}
	});
}
