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
xmlHttpRequest.open('GET', browser.extension.getURL('/_values/SearchEngines.json'), false);
xmlHttpRequest.send();
const searchEngines = JSON.parse(xmlHttpRequest.responseText);
xmlHttpRequest.open('GET', browser.extension.getURL('/_values/StorageKeys.json'), false);
xmlHttpRequest.send();
const storageKeys = JSON.parse(xmlHttpRequest.responseText);

const askRadioId = 'searcheEngineAsk';
const bingRadioId = 'searcheEngineBing';
const duckduckgoRadioId = 'searcheEngineDuckDuckGo';
const googleRadioId = 'searcheEngineGoogle';
const yahooRadioId = 'searcheEngineYahoo';
const yahooJapanRadioId = 'searcheEngineYahooJapan';

document.getElementsByTagName('html')[0].lang = browser.i18n.getUILanguage();
document.title = browser.i18n.getMessage('optionsHTMLTitle');
document.getElementById('SearchEngines').innerText = browser.i18n.getMessage('searchEngines');
document.getElementById('askSearchEngineLabel').innerText = browser.i18n.getMessage('ask');
document.getElementById('alwaysUseBingLabel').innerText = browser.i18n.getMessage('alwaysUseBing');
document.getElementById('alwaysUseDuckDuckGoLabel').innerText = browser.i18n.getMessage('alwaysUseDuckDuckGo');
document.getElementById('alwaysUseGoogleLabel').innerText = browser.i18n.getMessage('alwaysUseGoogle');
document.getElementById('alwaysUseYahooLabel').innerText = browser.i18n.getMessage('alwaysUseYahoo');
document.getElementById('alwaysUseYahooJapanLabel').innerText = browser.i18n.getMessage('alwaysUseYahooJapan');

document.options.searchEngine.forEach((element) => {
	element.addEventListener('click', searchEngineOnClick);
});

checkSearchEngine();

function searchEngineOnClick(event) {
	switch (event.target.id) {
		case askRadioId:
			browser.storage.local.set({ [storageKeys.searchEngine]: searchEngines.ask.name });
			break;
		case bingRadioId:
			browser.storage.local.set({ [storageKeys.searchEngine]: searchEngines.bing.name });
			break;
		case duckduckgoRadioId:
			browser.storage.local.set({ [storageKeys.searchEngine]: searchEngines.duckduckgo.name });
			break;
		case googleRadioId:
			browser.storage.local.set({ [storageKeys.searchEngine]: searchEngines.google.name});
			break;
		case yahooRadioId:
			browser.storage.local.set({ [storageKeys.searchEngine]: searchEngines.yahoo.name});
			break;
		case yahooJapanRadioId:
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
					document.getElementById(bingRadioId).checked = true;
					break;
				case searchEngines.duckduckgo.name:
					document.getElementById(duckduckgoRadioId).checked = true;
					break;
				case searchEngines.google.name:
					document.getElementById(googleRadioId).checked = true;
					break;
				case searchEngines.yahoo.name:
					document.getElementById(yahooRadioId).checked = true;
					break;
				case searchEngines.yahooJapan.name:
					document.getElementById(yahooJapanRadioId).checked = true;
					break;
			}
		}
	});
}
