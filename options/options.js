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

const searchEngineBingInputCheckboxId = 'searchEngineBingInputCheckbox';
const searchEngineDuckDuckGoInputCheckboxId = 'searchEngineDuckDuckGoInputCheckbox';
const searchEngineGoogleInputCheckboxId = 'searchEngineGoogleInputCheckbox';
const searchEngineYahooInputCheckboxId = 'searchEngineYahooInputCheckbox';
const searchEngineYahooJapanInputCheckboxId = 'searchEngineYahooJapanInputCheckbox';
const searchEngineAdditionalInputCheckboxId = 'searchEngineAdditionalInputCheckbox';
const searchEngineShouldAdditionalShowOnlyMainId = 'searchEngineShouldAdditionalShowOnlyMainInputCheckbox';
const searchEngineBingInputRadioId = 'searchEngineBingInputRadio';
const searchEngineDuckDuckGoInputRadioId = 'searchEngineDuckDuckGoInputRadio';
const searchEngineGoogleInputRadioId = 'searchEngineGoogleInputRadio';
const searchEngineYahooInputRadioId = 'searchEngineYahooInputRadio';
const searchEngineYahooJapanInputRadioId = 'searchEngineYahooJapanInputRadio';
const searchEngineAdditionalInputRadioId = 'searchEngineAdditionalInputRadio';
const pageActionReloadId = 'pageActionReloadInputRadio';
const pageActionGoBackToHomeId = 'pageActionGoBackToHomeInputRadio';

const searchEngineBingInputCheckbox = document.getElementById(searchEngineBingInputCheckboxId);
const searchEngineDuckDuckGoInputCheckbox = document.getElementById(searchEngineDuckDuckGoInputCheckboxId);
const searchEngineGoogleInputCheckbox = document.getElementById(searchEngineGoogleInputCheckboxId);
const searchEngineYahooInputCheckbox = document.getElementById(searchEngineYahooInputCheckboxId);
const searchEngineYahooJapanInputCheckbox = document.getElementById(searchEngineYahooJapanInputCheckboxId);
const searchEngineAdditionalInputCheckbox = document.getElementById(searchEngineAdditionalInputCheckboxId);
const searchEngineShouldAdditionalShowOnlyMainInputCheckbox = document.getElementById(searchEngineShouldAdditionalShowOnlyMainId);
const searchEngineBingInputRadio = document.getElementById(searchEngineBingInputRadioId);
const searchEngineDuckDuckGoInputRadio = document.getElementById(searchEngineDuckDuckGoInputRadioId);
const searchEngineGoogleInputRadio = document.getElementById(searchEngineGoogleInputRadioId);
const searchEngineYahooInputRadio = document.getElementById(searchEngineYahooInputRadioId);
const searchEngineYahooJapanInputRadio = document.getElementById(searchEngineYahooJapanInputRadioId);
const searchEngineAdditionalInputRadio = document.getElementById(searchEngineAdditionalInputRadioId);
const searchEngineWhichIsWantedToBeAddedNameInputText = document.getElementById('searchEngineWhichIsWantedToBeAddedNameInputText');
const searchEngineWhichIsWantedToBeAddedUrlInputText = document.getElementById('searchEngineWhichIsWantedToBeAddedUrlInputText');
const searchEngineWhichIsWantedToBeAddedQueryInputText = document.getElementById('searchEngineWhichIsWantedToBeAddedQueryInputText');
const searchEngineWhichIsWantedToBeAddedExtendedQueryCheckbox = document.getElementById('searchEngineWhichIsWantedToBeAddedExtendedQueryCheckbox');
const searchEngineWhichIsWantedToBeAddedMainCheckbox = document.getElementById('searchEngineWhichIsWantedToBeAddedMainCheckbox');
const addSearchEngineButton = document.getElementById('addSearchEngineButton');
const searchEngineWhichHasBeenAddedTableBody = document.getElementById('searchEngineWhichHasBeenAddedTableBody');
const additionalPermissionsHostCheckbox = document.getElementById('additionalPermissionsHostCheckbox');
const userAgentDefaultRadio = document.getElementById('userAgentDefaultRadio');
const userAgentFirefoxosRadio = document.getElementById('userAgentFirefoxosRadio');
const userAgentAndroidRadio = document.getElementById('userAgentAndroidRadio');
const userAgentIosRadio = document.getElementById('userAgentIosRadio');
const autoSearchEnabledCheckbox = document.getElementById('autoSearchEnabledCheckbox');
const autoSearchIntervalRange = document.getElementById('autoSearchIntervalRange');
const autoSearchIntervalRangeValueLabel = document.getElementById('autoSearchIntervalRangeValueLabel');

main();

async function main() {
	await readValues();
	initDocuments();
	addEventListeners();
	checkPageAction();
	checkPermissions();
	checkSearchEngine();
	checkUserAgents();
	checkAutoSearch();
	refreshAdditionalSearchEngine();
}

function addEventListeners() {
	document.options.searchEngineCheckbox.forEach(element => element.addEventListener('click', searchEngineCheckboxButtonOnClick));
	document.options.searchEngineRadio.forEach(element => element.addEventListener('click', searchEngineRadioButtonOnClick));
	document.options.searchEngineWhichIsWantedToBeAdded.forEach(element => element.addEventListener('click', searchEngineWhichIsWantedToBeAddedInputTextOnClick));
	document.options.pageAction.forEach(element => element.addEventListener('click', pageActionRadioButtonOnClick));
	searchEngineWhichIsWantedToBeAddedExtendedQueryCheckbox.addEventListener('input', searchEngineWhichIsWantedToBeAddedExtendedQueryCheckboxOnChange);
	addSearchEngineButton.addEventListener('click', addSearchEngineButtonOnClick);
	document.options.additionalPermissions.addEventListener('click', requestPermission);
	browser.permissions.onAdded.addListener(checkPermissions);
	browser.permissions.onRemoved.addListener(checkPermissions);
	document.options.userAgent.forEach(element => element.addEventListener('click', userAgentOnClick));
	autoSearchEnabledCheckbox.addEventListener('input', autoSearchEnabledCheckboxOnInput);
	autoSearchIntervalRange.addEventListener('input', autoSearchIntervalRangeOnInput);
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
			isExtendedQuery: searchEngineWhichIsWantedToBeAddedExtendedQueryCheckbox.checked,
			isMain: isMainSearchEngine
		});

		saveConfig({ [storageKeys.additionalSearchEngine]: additionalSearchEngineArray });
		document.options.searchEngineWhichIsWantedToBeAdded.forEach(element => element.value = '');
		searchEngineWhichIsWantedToBeAddedQueryInputText.placeholder = '/search?q=';
		searchEngineWhichIsWantedToBeAddedExtendedQueryCheckbox.checked = false;
		searchEngineWhichIsWantedToBeAddedMainCheckbox.checked = false;
		refreshAdditionalSearchEngine();
	}
}

async function autoSearchEnabledCheckboxOnInput(event) {
	await saveConfig({ [storageKeys.isAutoSearchEnabled]: event.target.checked });
}

async function autoSearchIntervalRangeOnInput(event) {
	autoSearchIntervalRangeValueLabel.textContent = event.target.value;
	await saveConfig({ [storageKeys.autoSearchIntervalValue]: event.target.value });
}

async function checkAutoSearch() {
	const item = await browser.storage.local.get();
	autoSearchEnabledCheckbox.checked = item[storageKeys.isAutoSearchEnabled] ?? false;
	autoSearchIntervalRange.value = item[storageKeys.autoSearchIntervalValue] ?? 1;
	autoSearchIntervalRangeValueLabel.textContent = item[storageKeys.autoSearchIntervalValue] ?? 1;
}

async function checkSearchEngine() {
	const item = await browser.storage.local.get();
	searchEngineAdditionalInputCheckbox.checked = item[storageKeys.isAdditionalEnabled] ?? true;
	searchEngineBingInputCheckbox.checked = item[storageKeys.isBingEnabled] ?? true;
	searchEngineDuckDuckGoInputCheckbox.checked = item[storageKeys.isDuckDuckGoEnabled] ?? true;
	searchEngineGoogleInputCheckbox.checked = item[storageKeys.isGoogleEnabled] ?? true;
	searchEngineShouldAdditionalShowOnlyMainInputCheckbox.checked = item[storageKeys.shouldShowOnlyMainAdditional] ?? false;
	searchEngineYahooInputCheckbox.checked = item[storageKeys.isYahooEnabled] ?? true;
	searchEngineYahooJapanInputCheckbox.checked = item[storageKeys.isYahooJapanEnabled] ?? true;

	switch (item[storageKeys.searchEngineForShortcut]) {
		case searchEngines.additional.name:
			searchEngineAdditionalInputRadio.checked = true;
			break;
		case searchEngines.bing.name:
			searchEngineBingInputRadio.checked = true;
			break;
		case searchEngines.duckDuckGo.name:
			searchEngineDuckDuckGoInputRadio.checked = true;
			break;
		case searchEngines.google.name:
			searchEngineGoogleInputRadio.checked = true;
			break;
		case searchEngines.yahoo.name:
			searchEngineYahooInputRadio.checked = true;
			break;
		case searchEngines.yahooJapan.name:
			searchEngineYahooJapanInputRadio.checked = true;
			break;
		default:
			searchEngineGoogleInputRadio.checked = true;
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
	toggleAutoSearchInputDisabled(!additionalPermissionsHostCheckbox.checked);
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
	document.getElementById('searchEnginesToDisplayInContextMenuLegend').textContent = browser.i18n.getMessage('searchEnginesToDisplayInContextMenu');
	document.getElementById('searchEnginesToUseForShortcutLegend').textContent = browser.i18n.getMessage('searchEnginesToUseForShortcut');
	[...document.getElementsByClassName('bingLabel')].forEach(e => e.textContent = searchEngines.bing.name);
	[...document.getElementsByClassName('duckDuckGoLabel')].forEach(e => e.textContent = searchEngines.duckDuckGo.name);
	[...document.getElementsByClassName('googleLabel')].forEach(e => e.textContent = searchEngines.google.name);
	[...document.getElementsByClassName('yahooLabel')].forEach(e => e.textContent = searchEngines.yahoo.name);
	[...document.getElementsByClassName('yahooJapanLabel')].forEach(e => e.textContent = searchEngines.yahooJapan.name);
	[...document.getElementsByClassName('additionalSearchEngineLabel')].forEach(e => e.textContent = browser.i18n.getMessage('additionalSearchEngines'));
	document.getElementById('showOnlyMainAdditionalSearchEngineLabel').textContent = browser.i18n.getMessage('showOnlyMainAdditionalSearchEngine');
	document.getElementById('additionalSearchEngineDescriptionLegend').textContent = browser.i18n.getMessage('additionalSearchEngines');
	document.getElementById('additionalSearchEngineTableHeaderCell').textContent = browser.i18n.getMessage('name');
	document.getElementById('additionalSearchEngineUrlTableHeaderCell').textContent = 'URL';
	document.getElementById('additionalSearchEngineQueryTableHeaderCell').textContent = browser.i18n.getMessage('query');
	document.getElementById('additionalSearchEngineExtendedQueryTableHeaderCell').textContent = browser.i18n.getMessage('extendedQuery');
	document.getElementById('additionalSearchEngineMainTableHeaderCell').textContent = browser.i18n.getMessage('main');
	document.getElementById('searchEngineWhichHasBeenAddedTableHeaderCell').textContent = browser.i18n.getMessage('searchEngineWhichHasBeenAdded');
	document.getElementById('searchEngineWhichIsWantedToBeAddedTableHeaderCell').textContent = browser.i18n.getMessage('searchEngineWhichIsWantedToBeAdded');
	document.getElementById('addSearchEngineButton').textContent = browser.i18n.getMessage('add');
	document.getElementById('additionalSearchEngineInformationDivision').textContent = browser.i18n.getMessage('additionalSearchEngineInformation');
	document.getElementById('additionalSearchEngineCautionDivision').textContent = browser.i18n.getMessage('additionalSearchEngineCaution');
	document.getElementById('pageActionLegend').textContent = browser.i18n.getMessage('behaviorOfPageAction');
	document.getElementById('pageActionReloadLabel').textContent = browser.i18n.getMessage('reload');
	document.getElementById('pageActionGoBackToHomeLabel').textContent = browser.i18n.getMessage('goBackToHome');
	document.getElementById('additionalPermissionsLegend').textContent = browser.i18n.getMessage('additionalPermissions');
	document.getElementById('hostLabel').textContent = browser.i18n.getMessage('host');
	document.getElementById('useragentLegend').textContent = browser.i18n.getMessage('useragent');
	document.getElementById('defaultLabel').textContent = browser.i18n.getMessage('default');
	document.getElementById('useragentInformationDivision').textContent = browser.i18n.getMessage('thisFeatureRequiresHostPermission');
	document.getElementById('useragentCautionDivision').textContent = browser.i18n.getMessage('optionsUserAgentHTMLCaution');
	document.getElementById('autoSearchLegend').textContent = browser.i18n.getMessage('autoSearch');
	document.getElementById('autoSearchEnabledCheckboxLabel').textContent = browser.i18n.getMessage('enabled');
	document.getElementById('autoSearchIntervalRangeLabel').textContent = browser.i18n.getMessage('checkInterval');
	document.getElementById('autoSearchInformationDivision').textContent = browser.i18n.getMessage('thisFeatureRequiresHostPermission');
	document.getElementById('autoSearchInformationDivision2').textContent = browser.i18n.getMessage('autoSearchInformation2');
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
	let index = 0;
	pageActions = await (await fetch(keyFiles[index++])).json();
	searchEngines = await (await fetch(keyFiles[index++])).json();
	storageKeys = await (await fetch(keyFiles[index++])).json();
	userAgents = await (await fetch(keyFiles[index++])).json();
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
		const searchEngineWhichHasBeenAddedToggleExtendedQueryCheckboxTableData = document.createElement('td');
		const searchEngineWhichHasBeenAddedToggleExtendedQueryCheckbox = document.createElement('input');
		const searchEngineWhichHasBeenAddedChooseMainRadioTableData = document.createElement('td');
		const searchEngineWhichHasBeenAddedChooseMainRadio = document.createElement('input');
		const searchEngineWhichHasBeenAddedDeleteButtonTableData = document.createElement('td');
		const searchEngineWhichHasBeenAddedDeleteButton = document.createElement('button');

		searchEngineWhichHasBeenAddedNameTableData.textContent = additionalSearchEngine.name;
		searchEngineWhichHasBeenAddedUrlTableData.textContent = additionalSearchEngine.url;
		searchEngineWhichHasBeenAddedQueryTableData.textContent = additionalSearchEngine.query;
		searchEngineWhichHasBeenAddedToggleExtendedQueryCheckbox.checked = additionalSearchEngine.isExtendedQuery ?? false;
		searchEngineWhichHasBeenAddedToggleExtendedQueryCheckbox.type = 'checkbox';
		searchEngineWhichHasBeenAddedToggleExtendedQueryCheckbox.addEventListener('input', searchEngineWhichHasBeenAddedToggleExtendedQueryCheckboxOnChange);
		searchEngineWhichHasBeenAddedToggleExtendedQueryCheckboxTableData.appendChild(searchEngineWhichHasBeenAddedToggleExtendedQueryCheckbox);
		searchEngineWhichHasBeenAddedChooseMainRadio.checked = additionalSearchEngine.isMain;
		searchEngineWhichHasBeenAddedChooseMainRadio.type = 'radio';
		searchEngineWhichHasBeenAddedChooseMainRadio.addEventListener('input', searchEngineWhichHasBeenAddedChooseMainRadioOnChange);
		searchEngineWhichHasBeenAddedChooseMainRadioTableData.appendChild(searchEngineWhichHasBeenAddedChooseMainRadio);
		searchEngineWhichHasBeenAddedDeleteButton.textContent = browser.i18n.getMessage('delete');
		searchEngineWhichHasBeenAddedDeleteButton.type = 'button';
		searchEngineWhichHasBeenAddedDeleteButton.addEventListener('click', searchEngineWhichHasBeenAddedDeleteButtonOnClick);
		searchEngineWhichHasBeenAddedDeleteButtonTableData.appendChild(searchEngineWhichHasBeenAddedDeleteButton);

		searchEngineWhichHasBeenAddedTableRow.appendChild(searchEngineWhichHasBeenAddedNameTableData);
		searchEngineWhichHasBeenAddedTableRow.appendChild(searchEngineWhichHasBeenAddedUrlTableData);
		searchEngineWhichHasBeenAddedTableRow.appendChild(searchEngineWhichHasBeenAddedQueryTableData);
		searchEngineWhichHasBeenAddedTableRow.appendChild(searchEngineWhichHasBeenAddedToggleExtendedQueryCheckboxTableData);
		searchEngineWhichHasBeenAddedTableRow.appendChild(searchEngineWhichHasBeenAddedChooseMainRadioTableData);
		searchEngineWhichHasBeenAddedTableRow.appendChild(searchEngineWhichHasBeenAddedDeleteButtonTableData);
		searchEngineWhichHasBeenAddedTableBody.appendChild(searchEngineWhichHasBeenAddedTableRow);
	}

	searchEngineAdditionalInputRadio.disabled = additionalSearchEngineArray.length === 0;

	if (searchEngineAdditionalInputRadio.disabled && item[storageKeys.searchEngineForShortcut] === searchEngines.additional.name) {
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
				toggleAutoSearchInputDisabled(!accepted);
			} else {
				browser.permissions.remove(hostPermissions);
				toggleUserAgentRadioDisabled(true);
				toggleAutoSearchInputDisabled(true);
			}
			break;
		default:
	}
}

async function saveConfig(keys) {
	await browser.storage.local.set(keys);
}

async function searchEngineCheckboxButtonOnClick(event) {
	switch (event.target.id) {
		case searchEngineAdditionalInputCheckboxId:
			saveConfig({ [storageKeys.isAdditionalEnabled]: searchEngineAdditionalInputCheckbox.checked });
			break;
		case searchEngineBingInputCheckboxId:
			saveConfig({ [storageKeys.isBingEnabled]: searchEngineBingInputCheckbox.checked });
			break;
		case searchEngineDuckDuckGoInputCheckboxId:
			saveConfig({ [storageKeys.isDuckDuckGoEnabled]: searchEngineDuckDuckGoInputCheckbox.checked });
			break;
		case searchEngineGoogleInputCheckboxId:
			saveConfig({ [storageKeys.isGoogleEnabled]: searchEngineGoogleInputCheckbox.checked });
			break;
		case searchEngineShouldAdditionalShowOnlyMainId:
			saveConfig({ [storageKeys.shouldShowOnlyMainAdditional]: searchEngineShouldAdditionalShowOnlyMainInputCheckbox.checked });
			break;
		case searchEngineYahooInputCheckboxId:
			saveConfig({ [storageKeys.isYahooEnabled]: searchEngineYahooInputCheckbox.checked });
			break;
		case searchEngineYahooJapanInputCheckboxId:
			saveConfig({ [storageKeys.isYahooJapanEnabled]: searchEngineYahooJapanInputCheckbox.checked });
			break;
	}

	checkSearchEngine();
}

function searchEngineRadioButtonOnClick(event) {
	switch (event.target.id) {
		case searchEngineAdditionalInputRadioId:
			saveConfig({ [storageKeys.searchEngineForShortcut]: searchEngines.additional.name });
			break;
		case searchEngineBingInputRadioId:
			saveConfig({ [storageKeys.searchEngineForShortcut]: searchEngines.bing.name });
			break;
		case searchEngineDuckDuckGoInputRadioId:
			saveConfig({ [storageKeys.searchEngineForShortcut]: searchEngines.duckDuckGo.name });
			break;
		case searchEngineGoogleInputRadioId:
			saveConfig({ [storageKeys.searchEngineForShortcut]: searchEngines.google.name });
			break;
		case searchEngineYahooInputRadioId:
			saveConfig({ [storageKeys.searchEngineForShortcut]: searchEngines.yahoo.name });
			break;
		case searchEngineYahooJapanInputRadioId:
			saveConfig({ [storageKeys.searchEngineForShortcut]: searchEngines.yahooJapan.name });
			break;
	}

	checkSearchEngine();
}

function searchEngineWhichIsWantedToBeAddedExtendedQueryCheckboxOnChange(event) {
	searchEngineWhichIsWantedToBeAddedQueryInputText.placeholder = event.target.checked ? '/search/{q}' : '/search?q=';
}

function searchEngineWhichIsWantedToBeAddedInputTextOnClick(event) {
	event.target.style.backgroundColor = '';
}

function searchEngineWhichHasBeenAddedToggleExtendedQueryCheckboxOnChange(event) {
	const index = Array.from(searchEngineWhichHasBeenAddedTableBody.children).findIndex(e => e === event.target.parentElement.parentElement);
	additionalSearchEngineArray[index].isExtendedQuery = event.target.checked;
	saveConfig({ [storageKeys.additionalSearchEngine]: additionalSearchEngineArray });
	refreshAdditionalSearchEngine();
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

function toggleAutoSearchInputDisabled(disabled) {
	document.options.autoSearch.forEach(element => element.disabled = disabled);
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
