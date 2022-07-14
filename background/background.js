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

let pageActions;
let searchEngines;
let storageKeys;
let pageActionOptions;
let searchEngineOptions;

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
};

main();

async function main() {
	await readKeys();
	await readOptions();

	browser.runtime.onMessage.addListener((message, _, sendResponse) => readOptions());

	browser.contextMenus.onClicked.addListener((info, tab) => {
		let searchEngine = '';
		let searchEngineQuery = '';
		let selectionText = info.selectionText?.trim() ?? '';

		switch (info.menuItemId) {
			case tutorialMenuItemId:
				searchEngine = browser.runtime.getURL('index.html');
				selectionText = '';
				break;
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

		browser.sidebarAction.setPanel({ panel: `${searchEngine}${searchEngineQuery}${selectionText}` });
		browser.sidebarAction.open();
	});

	browser.browserAction.onClicked.addListener((tab) => {
		if (pageActionOptions?.[storageKeys.pageAction] === pageActions.goBackToHome) {
			let panelUrl;

			switch (searchEngineOptions[storageKeys.searchEngine]) {
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

			browser.sidebarAction.setPanel({ panel: panelUrl });
		}

		browser.sidebarAction.open();
	});

	browser.commands.onCommand.addListener(command => {
		if (command === 'open_and_search') {
			let tabId = browser.tabs.query({ currentWindow: true, active: true }).id;
			browser.tabs.executeScript(tabId, { code: 'window.getSelection().toString().trim();', }).then(text => {
				let selectedText = text[0].trim();

				if (selectedText.length !== 0) {
					let searchEngine = '';
					let searchEngineQuery = '';

					if (searchEngineOptions[storageKeys.searchEngine] === undefined || searchEngineOptions[storageKeys.searchEngine] === searchEngines.ask.name) {
						searchEngine = searchEngines.google.url;
						searchEngineQuery = searchEngines.google.query;
					} else if (searchEngineOptions[storageKeys.searchEngine] === searchEngines.additional.name) {
						searchEngine = additionalSearchEngine.main.url;
						searchEngineQuery = additionalSearchEngine.main.query;
					} else {
						const key = Object.keys(searchEngines).filter(key => searchEngines[key].name === searchEngineOptions[storageKeys.searchEngine]);
						searchEngine = searchEngines[key].url;
						searchEngineQuery = searchEngines[key].query;
					}

					browser.sidebarAction.setPanel({
						panel: `${searchEngine}${searchEngineQuery}${selectedText}`
					});
				}
			}, error => {
				console.error(error);
				browser.sidebarAction.setPanel({ panel: browser.runtime.getURL('error/permission_error.html') });
			});

			browser.sidebarAction.open();
		}
	});
}

function createContextMenus(searchEngine) {
	browser.contextMenus.create({
		contexts: ['browser_action'],
		icons: { "1536": "icons/icon-1536.png" },
		id: tutorialMenuItemId,
		title: browser.i18n.getMessage("tutorial")
	});

	if (searchEngine === searchEngines.ask.name || searchEngine === searchEngines.bing.name) {
		browser.contextMenus.create({
			contexts: ['selection'],
			icons: { "16": `${searchEngines.bing.url}/favicon.ico` },
			id: bingMenuItemId,
			title: searchEngines.bing.name
		});
	}

	if (searchEngine === searchEngines.ask.name || searchEngine === searchEngines.duckduckgo.name) {
		browser.contextMenus.create({
			contexts: ['selection'],
			icons: { "16": `${searchEngines.duckduckgo.url}/favicon.ico` },
			id: duckduckgoMenuItemId,
			title: searchEngines.duckduckgo.name
		});
	}

	if (searchEngine === searchEngines.ask.name || searchEngine === searchEngines.google.name) {
		browser.contextMenus.create({
			contexts: ['selection'],
			icons: { "16": `${searchEngines.google.url}/favicon.ico` },
			id: googleMenuItemId,
			title: searchEngines.google.name
		});
	}

	if (searchEngine === searchEngines.ask.name || searchEngine === searchEngines.yahoo.name) {
		browser.contextMenus.create({
			contexts: ['selection'],
			icons: { "16": `${searchEngines.yahoo.url}/favicon.ico` },
			id: yahooMenuItemId,
			title: searchEngines.yahoo.name
		});
	}

	if (searchEngine === searchEngines.ask.name || searchEngine === searchEngines.yahooJapan.name) {
		browser.contextMenus.create({
			contexts: ['selection'],
			icons: { "16": `${searchEngines.yahooJapan.url}/favicon.ico` },
			id: yahooJapanMenuItemId,
			title: searchEngines.yahooJapan.name
		});
	}

	if (searchEngine === searchEngines.ask.name) {
		for (let i in additionalSearchEngine.all) {
			browser.contextMenus.create({
				contexts: ['selection'],
				icons: { "16": `${new URL(additionalSearchEngine.all[i].url).origin}/favicon.ico` },
				id: i,
				title: additionalSearchEngine.all[i].name
			});
		}
	}

	if (searchEngine === searchEngines.additional.name) {
		browser.contextMenus.create({
			contexts: ['selection'],
			icons: { "16": `${new URL(additionalSearchEngine.main.url).origin}/favicon.ico` },
			id: mainAdditionalSearchEngineMenuItemId,
			title: additionalSearchEngine.main.name
		});
	}

	browser.contextMenus.refresh();
}

async function readKeys() {
	return Promise.all([fetch(browser.runtime.getURL('/_values/PageActions.json')), fetch(browser.runtime.getURL('/_values/SearchEngines.json')), fetch(browser.runtime.getURL('/_values/StorageKeys.json'))]).then(values => {
		return Promise.all(values.map(value => value.text()));
	}).then(values => {
		pageActions = JSON.parse(values[0]);
		searchEngines = JSON.parse(values[1]);
		storageKeys = JSON.parse(values[2]);
	});
}

async function readOptions() {
	searchEngineOptions = await browser.storage.local.get([storageKeys.additionalSearchEngine, storageKeys.searchEngine]);
	pageActionOptions = await browser.storage.local.get([storageKeys.pageAction]);

	if (Object.keys(searchEngineOptions).includes(storageKeys.additionalSearchEngine)) {
		additionalSearchEngine.all = searchEngineOptions[storageKeys.additionalSearchEngine];
	}

	await browser.contextMenus.removeAll();
	createContextMenus(searchEngineOptions[storageKeys.searchEngine] ?? searchEngines.ask.name);
}
