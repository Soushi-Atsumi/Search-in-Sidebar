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
let userAgents;
let currentSettings;

const optionsMenuItemId = 'options';
const tutorialMenuItemId = 'tutorial';
const bingMenuItemId = 'bing';
const duckDuckGoMenuItemId = 'duckDuckGo';
const googleMenuItemId = 'google';
const mainAdditionalSearchEngineMenuItemId = 'mainAdditionalSearchEngine';
const yahooMenuItemId = 'yahoo';
const yahooJapanMenuItemId = 'yahooJapan';
const hostPermissions = { origins: ['*://*/*'] };
let optionsUrl;

const additionalSearchEngine = {
	all: [],
	get main() { return this.all.filter(e => e.isMain)[0]; }
};

let autoSearchSetTimeoutID = 0;

main();

async function main() {
	optionsUrl = (await browser.management.getSelf()).optionsUrl;
	await readValues();
	await readOptions();

	browser.storage.local.onChanged.addListener(async changes => {
		await readOptions();
		if (Object.keys(changes).some(element => element === storageKeys.isAutoSearchEnabled || element ===  storageKeys.autoSearchIntervalValue)) {
			stopAutoSearch();
			startAutoSearch();
		}
	});
	browser.contextMenus.onClicked.addListener((info, _) => {
		let searchEngine = '';
		let searchEngineQuery = '';
		let shouldAdditionalSearchEngineUseExtendedQuery = false;
		let selectionText = info.selectionText?.trim() ?? '';

		switch (info.menuItemId) {
			case tutorialMenuItemId:
				searchEngine = browser.runtime.getURL('index.html');
				selectionText = '';
				break;
			case optionsMenuItemId:
				searchEngine = optionsUrl;
				selectionText = '';
				break;
			case bingMenuItemId:
				searchEngine = searchEngines.bing.url;
				searchEngineQuery = searchEngines.bing.query;
				break;
			case duckDuckGoMenuItemId:
				searchEngine = searchEngines.duckDuckGo.url;
				searchEngineQuery = searchEngines.duckDuckGo.query;
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
				shouldAdditionalSearchEngineUseExtendedQuery = additionalSearchEngine.all[info.menuItemId].isExtendedQuery ?? false;
		}

		const panelUrl = shouldAdditionalSearchEngineUseExtendedQuery ? `${searchEngine}${searchEngineQuery.replaceAll('{q}', selectionText)}` : `${searchEngine}${searchEngineQuery}${selectionText}`;
		browser.sidebarAction.setPanel({ panel: panelUrl });
		browser.sidebarAction.open();
	});

	browser.browserAction.onClicked.addListener(() => {
		if (currentSettings[storageKeys.pageAction] === pageActions.goBackToHome) {
			let panelUrl;

			if ((currentSettings[storageKeys.isAdditionalEnabled] ?? true) && additionalSearchEngine.all.length !== 0) {
				panelUrl = additionalSearchEngine.main.url;
			} else if (currentSettings[storageKeys.isBingEnabled] ?? true) {
				panelUrl = searchEngines.bing.url;
			} else if (currentSettings[storageKeys.isDuckDuckGoEnabled] ?? true) {
				panelUrl = searchEngines.duckDuckGo.url;
			} else if (currentSettings[storageKeys.isGoogleEnabled] ?? true) {
				panelUrl = searchEngines.google.url;
			} else if (currentSettings[storageKeys.isYahooEnabled] ?? true) {
				panelUrl = searchEngines.yahoo.url;
			} else if (currentSettings[storageKeys.isYahooJapanEnabled] ?? true) {
				panelUrl = searchEngines.yahooJapan.url;
			} else {
				panelUrl = browser.runtime.getURL('index.html');
			}

			browser.sidebarAction.setPanel({ panel: panelUrl });
		}

		browser.sidebarAction.open();
	});

	browser.commands.onCommand.addListener(async (name, _) => {
		if (name === 'open_and_search') {
			browser.sidebarAction.open();
			const selectedText = (await browser.tabs.executeScript({ code: 'window.getSelection().toString().trim();', }))[0]?.trim() ?? '';

			if (selectedText.length !== 0) {
				let searchEngine = '';
				let searchEngineQuery = '';
				let shouldAdditionalSearchEngineUseExtendedQuery = false;

				if (currentSettings[storageKeys.searchEngineForShortcut] === undefined) {
					searchEngine = searchEngines.google.url;
					searchEngineQuery = searchEngines.google.query;
				} else if (currentSettings[storageKeys.searchEngineForShortcut] === searchEngines.additional.name) {
					searchEngine = additionalSearchEngine.main.url;
					searchEngineQuery = additionalSearchEngine.main.query;
					shouldAdditionalSearchEngineUseExtendedQuery = additionalSearchEngine.main.isExtendedQuery ?? false;
				} else {
					const key = Object.keys(searchEngines).filter(key => searchEngines[key].name === currentSettings[storageKeys.searchEngineForShortcut]);
					searchEngine = searchEngines[key].url;
					searchEngineQuery = searchEngines[key].query;
				}

				const panelUrl = shouldAdditionalSearchEngineUseExtendedQuery ? `${searchEngine}${searchEngineQuery.replaceAll('{q}', selectedText)}` : `${searchEngine}${searchEngineQuery}${selectedText}`;
				browser.sidebarAction.setPanel({ panel: panelUrl });
			}
		}
	});

	const filter = { tabId: -1, urls: ['*://*/*'] };
	const extraInfoSpec = ['blocking', 'requestHeaders'];
	const onBeforeSendHeadersListener = details => {
		details.requestHeaders.filter(requestHeader => requestHeader.name.toLowerCase() === 'user-agent').forEach(element => {
			switch (currentSettings[storageKeys.userAgent]) {
				case userAgents.android:
					element.value = element.value.replace(/\(.+?;/, '(Android;');
					break;
				case userAgents.firefoxOS:
					element.value = element.value.replace(/\(.+?;/, '(Mobile;');
					break;
				case userAgents.iOS:
					element.value = element.value.replace(/\(.+?;/, '(iPhone;');
					break;
			}
		});

		return { requestHeaders: details.requestHeaders };
	};
	const permissionsOnAddedListener = permissions => {
		if (hostPermissions.origins.every(origin => permissions.origins.includes(origin))) {
			browser.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeadersListener, filter, extraInfoSpec);
			startAutoSearch();
		}
	};
	const permissionsOnRemovedListener = permissions => {
		if (hostPermissions.origins.every(origin => permissions.origins.includes(origin))) {
			browser.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeadersListener);
			stopAutoSearch();
		}
	};
	browser.permissions.onAdded.addListener(permissionsOnAddedListener);
	browser.permissions.onRemoved.addListener(permissionsOnRemovedListener);

	currentSettings = await browser.storage.local.get();

	if (await browser.permissions.contains(hostPermissions)) {
		browser.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeadersListener, filter, extraInfoSpec);
		startAutoSearch();
	}

	return createContextMenus();
}

async function createContextMenus() {
	const manifest = await (await fetch('manifest.json')).json();

	browser.contextMenus.create({
		contexts: ['browser_action'],
		icons: manifest.icons,
		id: tutorialMenuItemId,
		title: browser.i18n.getMessage("openTutorial")
	});

	browser.contextMenus.create({
		contexts: ['browser_action'],
		icons: manifest.icons,
		id: optionsMenuItemId,
		title: browser.i18n.getMessage('openOptions')
	});

	if (currentSettings[storageKeys.isBingEnabled] ?? true) {
		browser.contextMenus.create({
			contexts: ['selection'],
			icons: { "16": `${searchEngines.bing.url}/favicon.ico` },
			id: bingMenuItemId,
			title: searchEngines.bing.name
		});
	}

	if (currentSettings[storageKeys.isDuckDuckGoEnabled] ?? true) {
		browser.contextMenus.create({
			contexts: ['selection'],
			icons: { "16": `${searchEngines.duckDuckGo.url}/favicon.ico` },
			id: duckDuckGoMenuItemId,
			title: searchEngines.duckDuckGo.name
		});
	}

	if (currentSettings[storageKeys.isGoogleEnabled] ?? true) {
		browser.contextMenus.create({
			contexts: ['selection'],
			icons: { "16": `${searchEngines.google.url}/favicon.ico` },
			id: googleMenuItemId,
			title: searchEngines.google.name
		});
	}

	if (currentSettings[storageKeys.isYahooEnabled] ?? true) {
		browser.contextMenus.create({
			contexts: ['selection'],
			icons: { "16": `${searchEngines.yahoo.url}/favicon.ico` },
			id: yahooMenuItemId,
			title: searchEngines.yahoo.name
		});
	}

	if (currentSettings[storageKeys.isYahooJapanEnabled] ?? true) {
		browser.contextMenus.create({
			contexts: ['selection'],
			icons: { "16": `${searchEngines.yahooJapan.url}/favicon.ico` },
			id: yahooJapanMenuItemId,
			title: searchEngines.yahooJapan.name
		});
	}

	if ((currentSettings[storageKeys.isAdditionalEnabled] ?? true) && additionalSearchEngine.all.length !== 0) {
		if (currentSettings[storageKeys.shouldShowOnlyMainAdditional] ?? false) {
			browser.contextMenus.create({
				contexts: ['selection'],
				icons: { "16": `${new URL(additionalSearchEngine.main.url).origin}/favicon.ico` },
				id: mainAdditionalSearchEngineMenuItemId,
				title: additionalSearchEngine.main.name
			});
		} else {
			for (const i in additionalSearchEngine.all) {
				browser.contextMenus.create({
					contexts: ['selection'],
					icons: { "16": `${new URL(additionalSearchEngine.all[i].url).origin}/favicon.ico` },
					id: i,
					title: additionalSearchEngine.all[i].name
				});
			}
		}
	}

	browser.contextMenus.refresh();
}

async function readOptions() {
	currentSettings = await browser.storage.local.get();

	if (Object.keys(currentSettings).includes(storageKeys.additionalSearchEngine)) {
		additionalSearchEngine.all = currentSettings[storageKeys.additionalSearchEngine];
	} else {
		additionalSearchEngine.all = [];
	}

	await browser.contextMenus.removeAll();
	createContextMenus();
}

async function readValues() {
	const keyFiles = ['PageActions.json', 'SearchEngines.json', 'StorageKeys.json', 'UserAgents.json'].map(keyFile => `/_values/${keyFile}`);
	let index = 0;
	pageActions = await (await fetch(keyFiles[index++])).json();
	searchEngines = await (await fetch(keyFiles[index++])).json();
	storageKeys = await (await fetch(keyFiles[index++])).json();
	userAgents = await (await fetch(keyFiles[index++])).json();
}

async function startAutoSearch() {
	if (!(currentSettings[storageKeys.isAutoSearchEnabled] ?? false) || !await browser.permissions.contains(hostPermissions) || autoSearchSetTimeoutID !== 0) {
		return;
	}

	autoSearchSetTimeoutID = setTimeout(async () => {
		const selectedText = (await browser.tabs.executeScript({ code: 'window.getSelection().toString().trim();', }))[0]?.trim() ?? '';
		if (selectedText.length !== 0) {
			let searchEngine = '';
			let searchEngineQuery = '';
			let shouldAdditionalSearchEngineUseExtendedQuery = false;

			if (currentSettings[storageKeys.searchEngineForShortcut] === undefined) {
				searchEngine = searchEngines.google.url;
				searchEngineQuery = searchEngines.google.query;
			} else if (currentSettings[storageKeys.searchEngineForShortcut] === searchEngines.additional.name) {
				searchEngine = additionalSearchEngine.main.url;
				searchEngineQuery = additionalSearchEngine.main.query;
				shouldAdditionalSearchEngineUseExtendedQuery = additionalSearchEngine.main.isExtendedQuery ?? false;
			} else {
				const key = Object.keys(searchEngines).filter(key => searchEngines[key].name === currentSettings[storageKeys.searchEngineForShortcut]);
				searchEngine = searchEngines[key].url;
				searchEngineQuery = searchEngines[key].query;
			}

			const panelUrl = shouldAdditionalSearchEngineUseExtendedQuery ? `${searchEngine}${searchEngineQuery.replaceAll('{q}', selectedText)}` : `${searchEngine}${searchEngineQuery}${selectedText}`;
			browser.sidebarAction.setPanel({ panel: panelUrl });
		}
		autoSearchSetTimeoutID = 0;
		startAutoSearch();
	}, (currentSettings[storageKeys.autoSearchIntervalValue] ?? 1) * 1000);
}

function stopAutoSearch() {
	clearTimeout(autoSearchSetTimeoutID);
	autoSearchSetTimeoutID = 0;
}
