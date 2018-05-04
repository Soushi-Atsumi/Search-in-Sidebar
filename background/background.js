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

browser.contextMenus.create({
	contexts: ['selection'],
	id: 'bing',
	title: 'Bing'
});

//DuckDuckGo does not show a scrollbar correctly
browser.contextMenus.create({
	contexts: ['selection'],
	id: 'duckduckgo',
	title: 'DuckDuckGo'
});

browser.contextMenus.create({
	contexts: ['selection'],
	id: 'google',
	title: 'Google'
});

browser.contextMenus.create({
	contexts: ['selection'],
	id: 'yahoo',
	title: 'Yahoo!'
});

browser.contextMenus.create({
	contexts: ['selection'],
	id: 'yahoo-japan',
	title: 'Yahoo Japan'
});

browser.contextMenus.onClicked.addListener((info, tab) => {
	var searchEngine = '';
	switch (info.menuItemId) {
		case 'bing':
			searchEngine = 'https://www.bing.com/search?q=';
			break;
		case 'duckduckgo':
			searchEngine = 'https://duckduckgo.com/?q=';
			break;
		case 'google':
			searchEngine = 'https://www.google.com/search?q=';
			break;
		case 'yahoo':
			searchEngine = 'https://search.yahoo.com/search?p=';
			break;
		case 'yahoo-japan':
			searchEngine = 'https://search.yahoo.co.jp/search?p=';
			break;
	}

	browser.sidebarAction.setPanel({
		panel: `${searchEngine}${info.selectionText.trim()}`
	});

	browser.sidebarAction.open();
});
