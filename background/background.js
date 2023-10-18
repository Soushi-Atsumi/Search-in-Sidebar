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
let lastRequestTime;
let currentPage;
let previousPages = [];
let navigatingViaSearchInSidebar = true;

const tutorialMenuItemId = 'tutorial';
const bingMenuItemId = 'bing';
const duckduckgoMenuItemId = 'duckduckgo';
const googleMenuItemId = 'google';
const mainAdditionalSearchEngineMenuItemId = 'mainAdditionalSearchEngine';
const yahooMenuItemId = 'yahoo';
const yahooJapanMenuItemId = 'yahooJapan';
const hostPermissions = { origins: ['*://*/*'] };
const backNavigatableUrls = { urls: ['*://*/*'], types: ['main_frame'], tabId: -1 };

const additionalSearchEngine = {
	all: [],
	get main() { return this.all.filter(e => e.isMain)[0]; }
};

main();

async function main() {
	await readValues();
	await readOptions();

	browser.runtime.onMessage.addListener(readOptions);
	browser.contextMenus.onClicked.addListener((info, _) => {
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

		// Clear history and global vars when making a new search from the context menu (= when starting a new session).
		previousPages = [`${searchEngine}${searchEngineQuery}${selectionText}`];
		currentPage = "";
		lastRequestTime = 0;
		navigatingViaSearchInSidebar = true;
	});

	browser.webRequest.onBeforeSendHeaders.addListener(savePreviousPage, backNavigatableUrls);
	function savePreviousPage(details) {
		// Web requests that aren't made in the side bar don't need to be saved; they don't have anything to do
		// with Search in Sidebar.
		browser.sidebarAction.isOpen({}).then(isOpen => {
			if (!isOpen) {
				return;
			}});
		
		// When a web request is made in the side bar by an extension, we compare the web request's origin against the
		// local GUID of Search in Sidebar. If there's no match, the request is coming from a different extension which
		// means it doesn't need to be saved. It also means Search in Sidebar is not being used, which means we can keep
		// ignoring requests until it is in use again (which is why this is a global var).
		if (details.originUrl.includes("moz-extension") && details.originUrl !== browser.runtime.getURL('')) {
			navigatingViaSearchInSidebar = false;
		}
		// When a web request is made with an originUrl that is equal to Search in Sidebar's currentPage, it means 
		// the user has navigated somewhere from currentPage. This is only possible in Search in Sidebar itself (or in 
		// the extremely rare case a user had the *exact* same page open in another extension and navigated from there).
		// We can thus safely assume Search in Sidebar is in use again when this happens.
		else if (details.originUrl === currentPage)
		{
			navigatingViaSearchInSidebar = true;
		}

		// Only save Search in Sidebar's web requests, not requests made via other extensions.
		if (!navigatingViaSearchInSidebar) {
			return;
		}

		// We can't take the first web request here like we do for previousPages below as that might lead to getting
		// stranded at the start of a redirect. This value always needs to be up to date with the newest request.
		currentPage = details.url;
		
			// Disallow saving Search in Sidebar's internal originUrl as it causes issues and is pointless.
		if (!details.originUrl.includes("moz-extension") &&
			// Guard against websites sending multiple web requests per navigation by only allowing the first one in 
			// 700ms to be saved, which avoids duplicate entries in previousPages.
			details.timeStamp - lastRequestTime > 700) {
			previousPages.push(details.originUrl);
			lastRequestTime = details.timeStamp;
		}
	}

	browser.browserAction.onClicked.addListener(() => {
		if (currentSettings[storageKeys.pageAction] === pageActions.goBackToHome) {
			let panelUrl;

			switch (currentSettings[storageKeys.searchEngine]) {
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

		if (currentSettings[storageKeys.pageAction] === pageActions.navigateBack) {
			browser.sidebarAction.isOpen({}).then(isOpen => {
				// When Search in Sidebar is opened and there are items in the page history, navigate to previous page.
				if (isOpen && previousPages.length > 0) {
					browser.sidebarAction.setPanel({ panel: previousPages.pop() });
				// When Search in Sidebar is opened but there aren't any items left in the page history to go back to,
				// do nothing.
				} else if (isOpen) {
					return;
				// When Search in Sidebar is closed, continue the session by opening the page last displayed before.
				} else {
					browser.sidebarAction.setPanel({ panel: currentPage });
				}
			});
		}

		browser.sidebarAction.open();
	});

	browser.commands.onCommand.addListener(command => {
		if (command === 'open_and_search') {
			const tabId = browser.tabs.query({ currentWindow: true, active: true }).id;
			browser.tabs.executeScript(tabId, { code: 'window.getSelection().toString().trim();', }).then(text => {
				const selectedText = text[0].trim();

				if (selectedText.length !== 0) {
					let searchEngine = '';
					let searchEngineQuery = '';

					if (currentSettings[storageKeys.searchEngine] === undefined || currentSettings[storageKeys.searchEngine] === searchEngines.ask.name) {
						searchEngine = searchEngines.google.url;
						searchEngineQuery = searchEngines.google.query;
					} else if (currentSettings[storageKeys.searchEngine] === searchEngines.additional.name) {
						searchEngine = additionalSearchEngine.main.url;
						searchEngineQuery = additionalSearchEngine.main.query;
					} else {
						const key = Object.keys(searchEngines).filter(key => searchEngines[key].name === currentSettings[storageKeys.searchEngine]);
						searchEngine = searchEngines[key].url;
						searchEngineQuery = searchEngines[key].query;
					}

					browser.sidebarAction.setPanel({
						panel: `${searchEngine}${searchEngineQuery}${selectedText}`
					});
				}
			});

			browser.sidebarAction.open();
		}
	});
	browser.storage.local.get().then(item => {
		currentSettings = item;
		return createContextMenus();
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
		}
	};
	const permissionsOnRemovedListener = permissions => {
		if (hostPermissions.origins.every(origin => permissions.origins.includes(origin))) {
			browser.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeadersListener);
		}
	};
	browser.permissions.onAdded.addListener(permissionsOnAddedListener);
	browser.permissions.onRemoved.addListener(permissionsOnRemovedListener);


	if (await browser.permissions.contains(hostPermissions)) {
		browser.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeadersListener, filter, extraInfoSpec);
	}
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
		for (const i in additionalSearchEngine.all) {
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

async function readOptions() {
	currentSettings = await browser.storage.local.get();

	// Issue#5
	// I can remove this code after all users update to the latest version.
	if (currentSettings[storageKeys.additionalSearchEngine] !== undefined) {
		browser.storage.local.set({ 'AdditionalSearchEngine': currentSettings[storageKeys.additionalSearchEngine] });
	}

	if (Object.keys(currentSettings).includes(storageKeys.additionalSearchEngine)) {
		additionalSearchEngine.all = currentSettings[storageKeys.additionalSearchEngine];
	}

	await browser.contextMenus.removeAll();
	createContextMenus(currentSettings[storageKeys.searchEngine] ?? searchEngines.ask.name);
}

async function readValues() {
	const keyFiles = ['PageActions.json', 'SearchEngines.json', 'StorageKeys.json', 'UserAgents.json'].map(keyFile => `/_values/${keyFile}`);
	return Promise.all(keyFiles.map(keyFile => fetch(keyFile))).then(values => {
		return Promise.all(values.map(value => value.text()));
	}).then(values => {
		pageActions = JSON.parse(values[0]);
		searchEngines = JSON.parse(values[1]);
		storageKeys = JSON.parse(values[2]);
		userAgents = JSON.parse(values[3]);
	});
}
