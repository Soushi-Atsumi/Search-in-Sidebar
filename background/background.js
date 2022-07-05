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
xmlHttpRequest.open('GET', browser.runtime.getURL('/_values/PageActions.json'), false);
xmlHttpRequest.send();
const pageActions = JSON.parse(xmlHttpRequest.responseText);
xmlHttpRequest.open('GET', browser.runtime.getURL('/_values/SearchEngines.json'), false);
xmlHttpRequest.send();
const searchEngines = JSON.parse(xmlHttpRequest.responseText);
xmlHttpRequest.open('GET', browser.runtime.getURL('/_values/StorageKeys.json'), false);
xmlHttpRequest.send();
const storageKeys = JSON.parse(xmlHttpRequest.responseText);

const tutorialMenuItemId = 'tutorial';
const bingMenuItemId = 'bing';
const duckduckgoMenuItemId = 'duckduckgo';
const googleMenuItemId = 'google';
const mainAdditionalSearchEngineMenuItemId = 'mainAdditionalSearchEngine';
const yahooMenuItemId = 'yahoo';
const yahooJapanMenuItemId = 'yahooJapan';

const additionalSearchEngine = {
	all: [],
	get main() { return this.all.filter(e => e.isMain)[0]; }
}

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
		case mainAdditionalSearchEngineMenuItemId:
			searchEngine = additionalSearchEngine.main.url;
			searchEngineQuery = additionalSearchEngine.main.query;
			break;
		case yahooMenuItemId:
			searchEngine = searchEngines.yahoo.url;
			searchEngineQuery = searchEngines.yahoo.query;
			break;
		case yahooJapanMenuItemId:
			searchEngine = searchEngines.yahooJapan.url;
			searchEngineQuery = searchEngines.yahooJapan.query;
			break;
		default:
			searchEngine = additionalSearchEngine.all[info.menuItemId].url;
			searchEngineQuery = additionalSearchEngine.all[info.menuItemId].query;
	}

	browser.sidebarAction.setPanel({
		panel: `${searchEngine}${searchEngineQuery}${info.selectionText.trim()}`
	});

	browser.sidebarAction.open();
});

browser.contextMenus.onShown.addListener(function (info, tab) {
	browser.contextMenus.removeAll();
	browser.storage.local.get([storageKeys.additionalSearchEngine, storageKeys.searchEngine]).then((item) => {
		if (Object.keys(item).includes(storageKeys.additionalSearchEngine)) {
			additionalSearchEngine.all = item[storageKeys.additionalSearchEngine];
		}
		createContextMenus(item[storageKeys.searchEngine] === undefined ? searchEngines.ask.name : item[storageKeys.searchEngine]);
	});
});

browser.browserAction.onClicked.addListener((tab) => {
	browser.sidebarAction.getPanel({}).then((sidebarUrl) => {
		browser.storage.local.get([storageKeys.pageAction, storageKeys.searchEngine]).then((item) => {
			if (item !== undefined && sidebarUrl !== browser.runtime.getURL('sidebar/sidebar.html') && item[storageKeys.pageAction] === pageActions.goBackToHome) {
				let panelUrl;

				switch (item[storageKeys.searchEngine]) {
					case searchEngines.additional.name:
						panelUrl = additionalSearchEngine.main.url;
						break;
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
						panelUrl = browser.runtime.getURL('index.html');
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
			title: searchEngines.bing.name
		});
	}

	if (searchEngine === searchEngines.ask.name || searchEngine === searchEngines.duckduckgo.name) {
		browser.contextMenus.create({
			contexts: ['selection'],
			id: duckduckgoMenuItemId,
			title: searchEngines.duckduckgo.name
		});
	}

	if (searchEngine === searchEngines.ask.name || searchEngine === searchEngines.google.name) {
		browser.contextMenus.create({
			contexts: ['selection'],
			id: googleMenuItemId,
			title: searchEngines.google.name
		});
	}

	if (searchEngine === searchEngines.ask.name || searchEngine === searchEngines.yahoo.name) {
		browser.contextMenus.create({
			contexts: ['selection'],
			id: yahooMenuItemId,
			title: searchEngines.yahoo.name
		});
	}

	if (searchEngine === searchEngines.ask.name || searchEngine === searchEngines.yahooJapan.name) {
		browser.contextMenus.create({
			contexts: ['selection'],
			id: yahooJapanMenuItemId,
			title: searchEngines.yahooJapan.name
		});
	}

	if (searchEngine === searchEngines.ask.name) {
		for (let i in additionalSearchEngine.all) {
			browser.contextMenus.create({
				contexts: ['selection'],
				id: i,
				title: additionalSearchEngine.all[i].name
			});
		}
	}

	if (searchEngine === searchEngines.additional.name) {
		browser.contextMenus.create({
			contexts: ['selection'],
			id: mainAdditionalSearchEngineMenuItemId,
			title: additionalSearchEngine.main.name
		});
	}

	browser.contextMenus.refresh();
}

browser.commands.onCommand.addListener(command => {
        if (command === 'open_and_search') {
            let tabId = browser.tabs.query({ currentWindow: true, active: true }).id;
            browser.tabs.executeScript(tabId, {
                code: 'window.getSelection().toString().trim();',
            }).then(text => {
                let selectedText = text[0].trim();

                if (selectedText.length !== 0) {
                    browser.storage.local.get([storageKeys.additionalSearchEngine, storageKeys.searchEngine]).then((item) => {
                        let searchEngine = '';
                        let searchEngineQuery = '';
                        if (Object.keys(item).includes(storageKeys.additionalSearchEngine)) {
                            additionalSearchEngine.all = item[storageKeys.additionalSearchEngine];
                        }

                        if (item[storageKeys.searchEngine] === undefined || item[storageKeys.searchEngine] === searchEngines.ask.name) {
                            searchEngine = searchEngines.google.url;
                            searchEngineQuery = searchEngines.google.query;
                        } else if (item[storageKeys.searchEngine] === searchEngines.additional.name) {
                            searchEngine = additionalSearchEngine.main.url;
                            searchEngineQuery = additionalSearchEngine.main.query;
                        } else {
                            const key = Object.keys(searchEngines).filter(key => searchEngines[key].name === item[storageKeys.searchEngine]);
                            searchEngine = searchEngines[key].url;
                            searchEngineQuery = searchEngines[key].query;
                        }

                        browser.sidebarAction.setPanel({
                            panel: `${searchEngine}${searchEngineQuery}${selectedText}`
                        });
                    });
                }
            }, error => {
                console.error(error);
                browser.sidebarAction.setPanel({
                    panel: browser.runtime.getURL('error/permission_error.html')
                });
            });
            browser.sidebarAction.open();
        }
    });
