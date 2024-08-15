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

let searchEngines;
let storageKeys;
let pageActions;
let userAgents;
let additionalSearchEngineArray = [];
const hostPermissions = { origins: ['*://*/*'] };

const searcheEngineBingInputCheckboxId = 'searcheEngineBingInputCheckbox';
const searcheEngineDuckDuckGoInputCheckboxId = 'searcheEngineDuckDuckGoInputCheckbox';
const searcheEngineGoogleInputCheckboxId = 'searcheEngineGoogleInputCheckbox';
const searcheEngineYahooInputCheckboxId = 'searcheEngineYahooInputCheckbox';
const searcheEngineYahooJapanInputCheckboxId = 'searcheEngineYahooJapanInputCheckbox';
const searcheEngineAdditionalInputCheckboxId = 'searcheEngineAdditionalInputCheckbox';
const searcheEngineShouldAdditionalShowOnlyMainId = 'searcheEngineShouldAdditionalShowOnlyMainInputCheckbox';
const searcheEngineBingInputRadioId = 'searcheEngineBingInputRadio';
const searcheEngineDuckDuckGoInputRadioId = 'searcheEngineDuckDuckGoInputRadio';
const searcheEngineGoogleInputRadioId = 'searcheEngineGoogleInputRadio';
const searcheEngineYahooInputRadioId = 'searcheEngineYahooInputRadio';
const searcheEngineYahooJapanInputRadioId = 'searcheEngineYahooJapanInputRadio';
const searcheEngineAdditionalInputRadioId = 'searcheEngineAdditionalInputRadio';
const pageActionReloadId = 'pageActionReloadInputRadio';
const pageActionGoBackToHomeId = 'pageActionGoBackToHomeInputRadio';

const searcheEngineBingInputCheckbox = document.getElementById(searcheEngineBingInputCheckboxId);
const searcheEngineDuckDuckGoInputCheckbox = document.getElementById(searcheEngineDuckDuckGoInputCheckboxId);
const searcheEngineGoogleInputCheckbox = document.getElementById(searcheEngineGoogleInputCheckboxId);
const searcheEngineYahooInputCheckbox = document.getElementById(searcheEngineYahooInputCheckboxId);
const searcheEngineYahooJapanInputCheckbox = document.getElementById(searcheEngineYahooJapanInputCheckboxId);
const searcheEngineAdditionalInputCheckbox = document.getElementById(searcheEngineAdditionalInputCheckboxId);
const searcheEngineShouldAdditionalShowOnlyMainInputCheckbox = document.getElementById(searcheEngineShouldAdditionalShowOnlyMainId);
const searcheEngineBingInputRadio = document.getElementById(searcheEngineBingInputRadioId);
const searcheEngineDuckDuckGoInputRadio = document.getElementById(searcheEngineDuckDuckGoInputRadioId);
const searcheEngineGoogleInputRadio = document.getElementById(searcheEngineGoogleInputRadioId);
const searcheEngineYahooInputRadio = document.getElementById(searcheEngineYahooInputRadioId);
const searcheEngineYahooJapanInputRadio = document.getElementById(searcheEngineYahooJapanInputRadioId);
const searcheEngineAdditionalInputRadio = document.getElementById(searcheEngineAdditionalInputRadioId);
const searchEngineWhichIsWantedToBeAddedNameInputText = document.getElementById('searchEngineWhichIsWantedToBeAddedNameInputText');
const searchEngineWhichIsWantedToBeAddedUrlInputText = document.getElementById('searchEngineWhichIsWantedToBeAddedUrlInputText');
const searchEngineWhichIsWantedToBeAddedQueryInputText = document.getElementById('searchEngineWhichIsWantedToBeAddedQueryInputText');
const searchEngineWhichIsWantedToBeAddedMainCheckbox = document.getElementById('searchEngineWhichIsWantedToBeAddedMainCheckbox');
const addSearchEngineButton = document.getElementById('addSearchEngineButton');
const searchEngineWhichHasBeenAddedTableBody = document.getElementById('searchEngineWhichHasBeenAddedTableBody');
const additionalPermissionsHostCheckbox = document.getElementById('additional-permissions-host');
const userAgentDefaultRadio = document.getElementById('user-agent-default');
const userAgentFirefoxosRadio = document.getElementById('user-agent-firefoxos');
const userAgentAndroidRadio = document.getElementById('user-agent-android');
const userAgentIosRadio = document.getElementById('user-agent-ios');

main();

async function main() {
	await readValues();
	initDocuments();
	addEventListeners();
	checkPageAction();
	checkPermissions();
	checkSearchEngine();
	checkUserAgents();
	refreshAdditionalSearchEngine();
}

function addEventListeners() {
	document.options.searchEngineCheckbox.forEach(element => element.addEventListener('click', searchEngineCheckboxButtonOnClick));
	document.options.searchEngineRadio.forEach(element => element.addEventListener('click', searchEngineRadioButtonOnClick));
	document.options.searchEngineWhichIsWantedToBeAdded.forEach(element => element.addEventListener('click', searchEngineWhichIsWantedToBeAddedInputTextOnClick));
	document.options.pageAction.forEach(element => element.addEventListener('click', pageActionRadioButtonOnClick));
	addSearchEngineButton.addEventListener('click', addSearchEngineButtonOnClick);
	document.options.additionalPermissions.addEventListener('click', requestPermission);
	browser.permissions.onAdded.addListener(checkPermissions);
	browser.permissions.onRemoved.addListener(checkPermissions);
	document.options.userAgent.forEach(element => element.addEventListener('click', userAgentOnClick));
}

function addSearchEngineButtonOnClick() {
	let isAllValid = true;
	document.options.searchEngineWhichIsWantedToBeAdded.forEach(element => isAllValid = isInputTextValueValid(element) && isAllValid);

	if (isAllValid) {
		let isAlreadyAdded = false;
		const urlOfSearchEngine = `https://${searchEngineWhichIsWantedToBeAddedUrlInputText.value.replace(/^.*:\/+/, '').replace(/\/+$/, '')}`;
		const queryOfSearchEngine = `/${searchEngineWhichIsWantedToBeAddedQueryInputText.value.replace(/^\/+/, '')}`;

		for (const additionalSearchEngine of additionalSearchEngineArray) {
			isAlreadyAdded = additionalSearchEngine.name === searchEngineWhichIsWantedToBeAddedNameInputText.value &&
				additionalSearchEngine.url === urlOfSearchEngine &&
				additionalSearchEngine.query === queryOfSearchEngine;
			if (isAlreadyAdded) {
				break;
			}
		}

		if (isAlreadyAdded) {
			window.alert(browser.i18n.getMessage('thisSearchEngineHasAlreadyBeenAdded'));
			return;
		}

		let isMainSearchEngine = searchEngineWhichIsWantedToBeAddedMainCheckbox.checked;
		if (additionalSearchEngineArray.length === 0) {
			isMainSearchEngine = true;
		} else if (isMainSearchEngine) {
			for (const additionalSearchEngine of additionalSearchEngineArray) {
				additionalSearchEngine.isMain = false;
			}
		}

		additionalSearchEngineArray.push({
			name: searchEngineWhichIsWantedToBeAddedNameInputText.value,
			url: urlOfSearchEngine,
			query: queryOfSearchEngine,
			isMain: isMainSearchEngine
		});

		saveConfig({ [storageKeys.additionalSearchEngine]: additionalSearchEngineArray });
		document.options.searchEngineWhichIsWantedToBeAdded.forEach(element => element.value = '');
		searchEngineWhichIsWantedToBeAddedMainCheckbox.checked = false;
		refreshAdditionalSearchEngine();
	}
}

async function checkSearchEngine() {
	const item = await browser.storage.local.get();
	searcheEngineAdditionalInputCheckbox.checked = item[storageKeys.isAdditionalEnabled] ?? true;
	searcheEngineBingInputCheckbox.checked = item[storageKeys.isBingEnabled] ?? true;
	searcheEngineDuckDuckGoInputCheckbox.checked = item[storageKeys.isDuckDuckGoEnabled] ?? true;
	searcheEngineGoogleInputCheckbox.checked = item[storageKeys.isGoogleEnabled] ?? true;
	searcheEngineShouldAdditionalShowOnlyMainInputCheckbox.checked = item[storageKeys.shouldShowOnlyMainAdditional] ?? false;
	searcheEngineYahooInputCheckbox.checked = item[storageKeys.isYahooEnabled] ?? true;
	searcheEngineYahooJapanInputCheckbox.checked = item[storageKeys.isYahooJapanEnabled] ?? true;

	switch (item[storageKeys.searchEngineForShortcut]) {
		case searchEngines.additional.name:
			searcheEngineAdditionalInputRadio.checked = true;
			break;
		case searchEngines.bing.name:
			searcheEngineBingInputRadio.checked = true;
			break;
		case searchEngines.duckDuckGo.name:
			searcheEngineDuckDuckGoInputRadio.checked = true;
			break;
		case searchEngines.google.name:
			searcheEngineGoogleInputRadio.checked = true;
			break;
		case searchEngines.yahoo.name:
			searcheEngineYahooInputRadio.checked = true;
			break;
		case searchEngines.yahooJapan.name:
			searcheEngineYahooJapanInputRadio.checked = true;
			break;
		default:
			searcheEngineGoogleInputRadio.checked = true;
	}
}

async function checkPageAction() {
	const item = await browser.storage.local.get(storageKeys.pageAction);
	switch (item[storageKeys.pageAction]) {
		case pageActions.reload:
			document.getElementById(pageActionReloadId).checked = true;
			break;
		case pageActions.goBackToHome:
			document.getElementById(pageActionGoBackToHomeId).checked = true;
			break;
	}
}

async function checkPermissions() {
	additionalPermissionsHostCheckbox.checked = await browser.permissions.contains(hostPermissions);
	toggleUserAgentRadioDisabled(!additionalPermissionsHostCheckbox.checked);
}

async function checkUserAgents() {
	const item = await browser.storage.local.get(storageKeys.userAgent);
	switch (item[storageKeys.userAgent]) {
		case userAgents.android:
			userAgentAndroidRadio.checked = true;
			break;
		case userAgents.default:
			userAgentDefaultRadio.checked = true;
			break;
		case userAgents.firefoxOS:
			userAgentFirefoxosRadio.checked = true;
			break;
		case userAgents.iOS:
			userAgentIosRadio.checked = true;
			break;
	}
}

function initDocuments() {
	document.getElementsByTagName('html')[0].lang = browser.i18n.getUILanguage();
	document.title = browser.i18n.getMessage('optionsHTMLTitle');
	document.getElementById('searchEnginesToDisplayInContextMenuLegend').innerText = browser.i18n.getMessage('searchEnginesToDisplayInContextMenu');
	document.getElementById('searchEnginesToUseForShortcutLegend').innerText = browser.i18n.getMessage('searchEnginesToUseForShortcut');
	[...document.getElementsByClassName('bingLabel')].forEach(e => e.innerText = searchEngines.bing.name);
	[...document.getElementsByClassName('duckDuckGoLabel')].forEach(e => e.innerText = searchEngines.duckDuckGo.name);
	[...document.getElementsByClassName('googleLabel')].forEach(e => e.innerText = searchEngines.google.name);
	[...document.getElementsByClassName('yahooLabel')].forEach(e => e.innerText = searchEngines.yahoo.name);
	[...document.getElementsByClassName('yahooJapanLabel')].forEach(e => e.innerText = searchEngines.yahooJapan.name);
	[...document.getElementsByClassName('additionalSearchEngineLabel')].forEach(e => e.innerText = browser.i18n.getMessage('additionalSearchEngines'));
	document.getElementById('showOnlyMainAdditionalSearchEngineLabel').innerText = browser.i18n.getMessage('showOnlyMainAdditionalSearchEngine');
	document.getElementById('additionalSearchEngineDescriptionLegend').innerText = browser.i18n.getMessage('additionalSearchEngines');
	document.getElementById('additionalSearchEngineTableHeaderCell').innerText = browser.i18n.getMessage('nameOfSearchEngine');
	document.getElementById('additionalSearchEngineUrlTableHeaderCell').innerText = browser.i18n.getMessage('urlOfSearchEngine');
	document.getElementById('additionalSearchEngineQueryTableHeaderCell').innerText = browser.i18n.getMessage('queryOfSearchEngine');
	document.getElementById('additionalSearchEngineMainTableHeaderCell').innerText = browser.i18n.getMessage('main');
	document.getElementById('searchEngineWhichHasBeenAddedTableHeaderCell').innerText = browser.i18n.getMessage('searchEngineWhichHasBeenAdded');
	document.getElementById('searchEngineWhichIsWantedToBeAddedTableHeaderCell').innerText = browser.i18n.getMessage('searchEngineWhichIsWantedToBeAdded');
	document.getElementById('addSearchEngineButton').innerText = browser.i18n.getMessage('add');
	document.getElementById('additionalSearchEngineCautionDivision').innerText = browser.i18n.getMessage('additionalSearchEngineCaution');
	document.getElementById('pageActionLegend').innerText = browser.i18n.getMessage('behaviorOfPageAction');
	document.getElementById('pageActionReloadLabel').innerText = browser.i18n.getMessage('reload');
	document.getElementById('pageActionGoBackToHomeLabel').innerText = browser.i18n.getMessage('goBackToHome');
	document.getElementById('additionalPermissionsLegend').innerText = browser.i18n.getMessage('additionalPermissions');
	document.getElementById('hostLabel').innerText = browser.i18n.getMessage('host');
	document.getElementById('useragentLegend').innerText = browser.i18n.getMessage('useragent');
	document.getElementById('defaultLabel').innerText = browser.i18n.getMessage('default');
	document.getElementById('informationDivision').innerText = browser.i18n.getMessage('optionsUserAgentHTMLInformation');
	document.getElementById('cautionDivision').innerText = browser.i18n.getMessage('optionsUserAgentHTMLCaution');
}

function isInputTextValueValid(inputText) {
	if (inputText.value === '') {
		inputText.style.backgroundColor = 'red';
		return false;
	} else {
		inputText.style.backgroundColor = '';
		return true;
	}
}

function notifyRefreshing() {
	browser.runtime.sendMessage({ action: 'refresh' });
}

function pageActionRadioButtonOnClick(event) {
	switch (event.target.id) {
		case pageActionReloadId:
			saveConfig({ [storageKeys.pageAction]: pageActions.reload });
			break;
		case pageActionGoBackToHomeId:
			saveConfig({ [storageKeys.pageAction]: pageActions.goBackToHome });
			break;
	}

	checkPageAction();
}

async function readValues() {
	const keyFiles = ['PageActions.json', 'SearchEngines.json', 'StorageKeys.json', 'UserAgents.json'].map(keyFile => `/_values/${keyFile}`);
	pageActions = await (await fetch(keyFiles[0])).json();
	searchEngines = await (await fetch(keyFiles[1])).json();
	storageKeys = await (await fetch(keyFiles[2])).json();
	userAgents = await (await fetch(keyFiles[3])).json();
}

async function refreshAdditionalSearchEngine() {
	const item = await browser.storage.local.get();
	if (Object.keys(item).includes(storageKeys.additionalSearchEngine)) {
		additionalSearchEngineArray = item[storageKeys.additionalSearchEngine];
	}

	searchEngineWhichHasBeenAddedTableBody.textContent = '';
	for (const additionalSearchEngine of additionalSearchEngineArray) {
		const searchEngineWhichHasBeenAddedTableRow = document.createElement('tr');
		const searchEngineWhichHasBeenAddedNameTableData = document.createElement('td');
		const searchEngineWhichHasBeenAddedUrlTableData = document.createElement('td');
		const searchEngineWhichHasBeenAddedQueryTableData = document.createElement('td');
		const searchEngineWhichHasBeenAddedChooseMainRadioTableData = document.createElement('td');
		const searchEngineWhichHasBeenAddedChooseMainRadio = document.createElement('input');
		const searchEngineWhichHasBeenAddedDeleteButtonTableData = document.createElement('td');
		const searchEngineWhichHasBeenAddedDeleteButton = document.createElement('button');

		searchEngineWhichHasBeenAddedNameTableData.innerText = additionalSearchEngine.name;
		searchEngineWhichHasBeenAddedUrlTableData.innerText = additionalSearchEngine.url;
		searchEngineWhichHasBeenAddedQueryTableData.innerText = additionalSearchEngine.query;
		searchEngineWhichHasBeenAddedChooseMainRadio.checked = additionalSearchEngine.isMain;
		searchEngineWhichHasBeenAddedChooseMainRadio.type = 'radio';
		searchEngineWhichHasBeenAddedChooseMainRadio.addEventListener('change', searchEngineWhichHasBeenAddedChooseMainRadioOnChange);
		searchEngineWhichHasBeenAddedChooseMainRadioTableData.appendChild(searchEngineWhichHasBeenAddedChooseMainRadio);
		searchEngineWhichHasBeenAddedDeleteButton.innerText = browser.i18n.getMessage('delete');
		searchEngineWhichHasBeenAddedDeleteButton.type = 'button';
		searchEngineWhichHasBeenAddedDeleteButton.addEventListener('click', searchEngineWhichHasBeenAddedDeleteButtonOnClick);
		searchEngineWhichHasBeenAddedDeleteButtonTableData.appendChild(searchEngineWhichHasBeenAddedDeleteButton);

		searchEngineWhichHasBeenAddedTableRow.appendChild(searchEngineWhichHasBeenAddedNameTableData);
		searchEngineWhichHasBeenAddedTableRow.appendChild(searchEngineWhichHasBeenAddedUrlTableData);
		searchEngineWhichHasBeenAddedTableRow.appendChild(searchEngineWhichHasBeenAddedQueryTableData);
		searchEngineWhichHasBeenAddedTableRow.appendChild(searchEngineWhichHasBeenAddedChooseMainRadioTableData);
		searchEngineWhichHasBeenAddedTableRow.appendChild(searchEngineWhichHasBeenAddedDeleteButtonTableData);
		searchEngineWhichHasBeenAddedTableBody.appendChild(searchEngineWhichHasBeenAddedTableRow);
	}

	searcheEngineAdditionalInputRadio.disabled = additionalSearchEngineArray.length === 0;

	if (searcheEngineAdditionalInputRadio.disabled && item[storageKeys.searchEngineForShortcut] === searchEngines.additional.name) {
		await saveConfig({ [storageKeys.searchEngineForShortcut]: searchEngines.google.name });
		checkSearchEngine();
	}
}

async function requestPermission(event) {
	switch (event.originalTarget.id) {
		case additionalPermissionsHostCheckbox.id:
			if (additionalPermissionsHostCheckbox.checked) {
				const accepted = await browser.permissions.request(hostPermissions);
				additionalPermissionsHostCheckbox.checked = accepted;
				toggleUserAgentRadioDisabled(!accepted);
			} else {
				browser.permissions.remove(hostPermissions);
				toggleUserAgentRadioDisabled(true);
			}
		default:
	}
}

async function saveConfig(keys) {
	await browser.storage.local.set(keys);
	notifyRefreshing();
}

async function searchEngineCheckboxButtonOnClick(event) {
	switch (event.target.id) {
		case searcheEngineAdditionalInputCheckboxId:
			saveConfig({ [storageKeys.isAdditionalEnabled]: searcheEngineAdditionalInputCheckbox.checked });
			break;
		case searcheEngineBingInputCheckboxId:
			saveConfig({ [storageKeys.isBingEnabled]: searcheEngineBingInputCheckbox.checked });
			break;
		case searcheEngineDuckDuckGoInputCheckboxId:
			saveConfig({ [storageKeys.isDuckDuckGoEnabled]: searcheEngineDuckDuckGoInputCheckbox.checked });
			break;
		case searcheEngineGoogleInputCheckboxId:
			saveConfig({ [storageKeys.isGoogleEnabled]: searcheEngineGoogleInputCheckbox.checked });
			break;
		case searcheEngineShouldAdditionalShowOnlyMainId:
			saveConfig({ [storageKeys.shouldShowOnlyMainAdditional]: searcheEngineShouldAdditionalShowOnlyMainInputCheckbox.checked });
			break;
		case searcheEngineYahooInputCheckboxId:
			saveConfig({ [storageKeys.isYahooEnabled]: searcheEngineYahooInputCheckbox.checked });
			break;
		case searcheEngineYahooJapanInputCheckboxId:
			saveConfig({ [storageKeys.isYahooJapanEnabled]: searcheEngineYahooJapanInputCheckbox.checked });
			break;
	}

	checkSearchEngine();
}

function searchEngineRadioButtonOnClick(event) {
	switch (event.target.id) {
		case searcheEngineAdditionalInputRadioId:
			saveConfig({ [storageKeys.searchEngineForShortcut]: searchEngines.additional.name });
			break;
		case searcheEngineBingInputRadioId:
			saveConfig({ [storageKeys.searchEngineForShortcut]: searchEngines.bing.name });
			break;
		case searcheEngineDuckDuckGoInputRadioId:
			saveConfig({ [storageKeys.searchEngineForShortcut]: searchEngines.duckDuckGo.name });
			break;
		case searcheEngineGoogleInputRadioId:
			saveConfig({ [storageKeys.searchEngineForShortcut]: searchEngines.google.name });
			break;
		case searcheEngineYahooInputRadioId:
			saveConfig({ [storageKeys.searchEngineForShortcut]: searchEngines.yahoo.name });
			break;
		case searcheEngineYahooJapanInputRadioId:
			saveConfig({ [storageKeys.searchEngineForShortcut]: searchEngines.yahooJapan.name });
			break;
	}

	checkSearchEngine();
}

function searchEngineWhichIsWantedToBeAddedInputTextOnClick(event) {
	event.target.style.backgroundColor = '';
}

function searchEngineWhichHasBeenAddedChooseMainRadioOnChange(event) {
	const index = Array.from(searchEngineWhichHasBeenAddedTableBody.children).findIndex(e => e === event.target.parentElement.parentElement);
	for (let i = 0; i < additionalSearchEngineArray.length; i++) {
		additionalSearchEngineArray[i].isMain = i === index;
	}

	saveConfig({ [storageKeys.additionalSearchEngine]: additionalSearchEngineArray });
	refreshAdditionalSearchEngine();
}

function searchEngineWhichHasBeenAddedDeleteButtonOnClick(event) {
	const index = Array.from(searchEngineWhichHasBeenAddedTableBody.children).findIndex(e => e === event.target.parentElement.parentElement);
	const isAccepted = window.confirm(`${browser.i18n.getMessage('DoYouReallyWantToDelete')}\n${additionalSearchEngineArray[index].url}${additionalSearchEngineArray[index].query}`);

	if (isAccepted) {
		additionalSearchEngineArray.splice(index, 1);

		if (additionalSearchEngineArray.length !== 0 && additionalSearchEngineArray.filter(e => e.isMain).length === 0) {
			additionalSearchEngineArray[0].isMain = true;
		}

		saveConfig({ [storageKeys.additionalSearchEngine]: additionalSearchEngineArray });
		refreshAdditionalSearchEngine();
	}
}

function toggleUserAgentRadioDisabled(disabled) {
	document.options.userAgent.forEach(element => element.disabled = disabled);
}

function userAgentOnClick(event) {
	switch (event.target.id) {
		case userAgentAndroidRadio.id:
			saveConfig({ [storageKeys.userAgent]: userAgents.android });
			break;
		case userAgentDefaultRadio.id:
			saveConfig({ [storageKeys.userAgent]: userAgents.default });
			break;
		case userAgentFirefoxosRadio.id:
			saveConfig({ [storageKeys.userAgent]: userAgents.firefoxOS });
			break;
		case userAgentIosRadio.id:
			saveConfig({ [storageKeys.userAgent]: userAgents.iOS });
			break;
	}
}
