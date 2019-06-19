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

const tutorialMenuItemId = 'tutorial';
const bingMenuItemId = 'bing';
const duckduckgoMenuItemId = 'duckduckgo';
const googleMenuItemId = 'google';
const yahooMenuItemId = 'yahoo';
const yahooJapanMenuItemId = 'yahooJapan';

browser.contextMenus.onClicked.addListener((info, tab) => {
	let searchEngine = '';
	let searchEngineQuery = '';

	switch (info.menuItemId) {
		case bingMenuItemId:
			searchEngine = searchEngines.bing.url;
			searchEngineQuery = searchEngines.bing.query;
			break;
		case duckduckgoMenuItemId:
			searchEngine = searchEngines.duckduckgo.url;
			searchEngineQuery = searchEngines.duckduckgo.query;
			break;
		case googleMenuItemId:
			searchEngine = searchEngines.google.url;
			searchEngineQuery = searchEngines.google.query;
			break;
		case yahooMenuItemId:
			searchEngine = searchEngines.yahoo.url;
			searchEngineQuery = searchEngines.yahoo.query;
			break;
		case yahooJapanMenuItemId:
			searchEngine = searchEngines.yahooJapan.url;
			searchEngineQuery = searchEngines.yahooJapan.query;
			break;
	}

	browser.sidebarAction.setPanel({
		panel: `${searchEngine}${searchEngineQuery}${info.selectionText.trim()}`
	});

	browser.sidebarAction.open();
});

browser.contextMenus.onShown.addListener(function (info, tab) {
	browser.contextMenus.removeAll();
	browser.storage.local.get(storageKeys.searchEngine).then((item) => {
		createContextMenus(item[storageKeys.searchEngine] === undefined ? searchEngines.ask.name : item[storageKeys.searchEngine]);
	});
});

browser.browserAction.onClicked.addListener((tab) => {
	browser.sidebarAction.getPanel({}).then((sidebarUrl) => {
		browser.storage.local.get([storageKeys.pageAction, storageKeys.searchEngine]).then((item) => {
			if (item !== undefined && sidebarUrl !== browser.extension.getURL(`sidebar/sidebar.html`) && item[storageKeys.pageAction] === pageActions.goBackToHome) {
				let panelUrl;

				switch (item[storageKeys.searchEngine]) {
					case searchEngines.bing.name:
						panelUrl = searchEngines.bing.url;
						break;
					case searchEngines.duckduckgo.name:
						panelUrl = searchEngines.duckduckgo.url;
						break;
					case searchEngines.google.name:
						panelUrl = searchEngines.google.url;
						break;
					case searchEngines.yahoo.name:
						panelUrl = searchEngines.yahoo.url;
						break;
					case searchEngines.yahooJapan.name:
						panelUrl = searchEngines.yahooJapan.url;
						break;
					default:
						panelUrl = browser.extension.getURL("index.html");
				}

				browser.sidebarAction.setPanel({
					panel: panelUrl
				});
			}
		});
	});

	browser.sidebarAction.open();
});

function createContextMenus(searchEngine) {
	if (searchEngine === searchEngines.ask.name || searchEngine === searchEngines.bing.name) {
		browser.contextMenus.create({
			contexts: ['selection'],
			id: bingMenuItemId,
			title: browser.i18n.getMessage("searchInBing")
		});
	}

	if (searchEngine === searchEngines.ask.name || searchEngine === searchEngines.duckduckgo.name) {
		browser.contextMenus.create({
			contexts: ['selection'],
			id: duckduckgoMenuItemId,
			title: browser.i18n.getMessage("searchInDuckDuckgo")
		});
	}

	if (searchEngine === searchEngines.ask.name || searchEngine === searchEngines.google.name) {
		browser.contextMenus.create({
			contexts: ['selection'],
			id: googleMenuItemId,
			title: browser.i18n.getMessage("searchInGoogle")
		});
	}

	if (searchEngine === searchEngines.ask.name || searchEngine === searchEngines.yahoo.name) {
		browser.contextMenus.create({
			contexts: ['selection'],
			id: yahooMenuItemId,
			title: browser.i18n.getMessage("searchInYahoo!")
		});
	}

	if (searchEngine === searchEngines.ask.name || searchEngine === searchEngines.yahooJapan.name) {
		browser.contextMenus.create({
			contexts: ['selection'],
			id: yahooJapanMenuItemId,
			title: browser.i18n.getMessage("searchInYahooJapan")
		});
	}

	browser.contextMenus.refresh();
}
