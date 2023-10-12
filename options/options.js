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

const searcheEngineAdditionalId = 'searcheEngineAdditionalInputRadio';
const searcheEngineAskId = 'searcheEngineAskInputRadio';
const searcheEngineBingId = 'searcheEngineBingInputRadio';
const searcheEngineDuckDuckGoId = 'searcheEngineDuckDuckGoInputRadio';
const searcheEngineGoogleId = 'searcheEngineGoogleInputRadio';
const searcheEngineYahooId = 'searcheEngineYahooInputRadio';
const searcheEngineYahooJapanId = 'searcheEngineYahooJapanInputRadio';
const pageActionReloadId = 'pageActionReloadInputRadio';
const pageActionGoBackToHomeId = 'pageActionGoBackToHomeInputRadio';
const pageActionNavigateBackId = 'pageActionNavigateBackInputRadio';

const searcheEngineAskInputRadio = document.getElementById('searcheEngineAskInputRadio');
const searcheEngineAdditionalInputRadio = document.getElementById('searcheEngineAdditionalInputRadio');
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
	document.options.searchEngine.forEach(element => element.addEventListener('click', searchEngineRadioButtonOnClick));
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

function checkSearchEngine() {
	browser.storage.local.get(storageKeys.searchEngine).then(item => {
		if (Object.keys(item).includes(storageKeys.searchEngine)) {
			switch (item[storageKeys.searchEngine]) {
				case searchEngines.additional.name:
					document.getElementById(searcheEngineAdditionalId).checked = true;
					break;
				case searchEngines.ask.name:
					document.getElementById(searcheEngineAskId).checked = true;
					break;
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
		} else {
			document.getElementById(searcheEngineAskId).checked = true;
		}
	});
}

function checkPageAction() {
	browser.storage.local.get(storageKeys.pageAction).then(item => {
		switch (item[storageKeys.pageAction]) {
			case pageActions.reload:
				document.getElementById(pageActionReloadId).checked = true;
				break;
			case pageActions.goBackToHome:
				document.getElementById(pageActionGoBackToHomeId).checked = true;
				break;
			case pageActions.navigateBack:
				document.getElementById(pageActionNavigateBackId).checked = true;
				break;
		}
	});
}

async function checkPermissions() {
	additionalPermissionsHostCheckbox.checked = await browser.permissions.contains(hostPermissions);
	toggleHostControlledRadioDisabled(!additionalPermissionsHostCheckbox.checked);
}

function checkUserAgents() {
	browser.storage.local.get(storageKeys.userAgent).then(item => {
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
	});
}

function initDocuments() {
	document.getElementsByTagName('html')[0].lang = browser.i18n.getUILanguage();
	document.title = browser.i18n.getMessage('optionsHTMLTitle');
	document.getElementById('searchEnginesLegend').innerText = browser.i18n.getMessage('searchEngines');
	document.getElementById('askSearchEngineLabel').innerText = browser.i18n.getMessage('ask');
	document.getElementById('alwaysUseBingLabel').innerText = browser.i18n.getMessage('alwaysUseBing');
	document.getElementById('alwaysUseDuckDuckGoLabel').innerText = browser.i18n.getMessage('alwaysUseDuckDuckGo');
	document.getElementById('alwaysUseGoogleLabel').innerText = browser.i18n.getMessage('alwaysUseGoogle');
	document.getElementById('alwaysUseYahooLabel').innerText = browser.i18n.getMessage('alwaysUseYahoo');
	document.getElementById('alwaysUseYahooJapanLabel').innerText = browser.i18n.getMessage('alwaysUseYahooJapan');
	document.getElementById('alwaysUseAdditionalSearchEngineLabel').innerText = browser.i18n.getMessage('alwaysUseAdditionalSearchEngine');
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
	document.getElementById('pageActionNavigateBackLabel').innerText = browser.i18n.getMessage('navigateBack');
	document.getElementById('pageActionGoBackToHomeLabel').innerText = browser.i18n.getMessage('goBackToHome');
	document.getElementById('additionalPermissionsLegend').innerText = browser.i18n.getMessage('additionalPermissions');
	document.getElementById('hostLabel').innerText = browser.i18n.getMessage('host');
	document.getElementById('useragentLegend').innerText = browser.i18n.getMessage('useragent');
	document.getElementById('defaultLabel').innerText = browser.i18n.getMessage('default');
	document.getElementById('navigateBackInformationDivision').innerText = browser.i18n.getMessage('optionsHostHTMLInformation');
	document.getElementById('userAgentInformationDivision').innerText = browser.i18n.getMessage('optionsHostHTMLInformation');
	document.getElementById('cautionDivision').innerText = browser.i18n.getMessage('optionsHostHTMLCaution');
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
		case pageActionNavigateBackId:
			saveConfig({ [storageKeys.pageAction]: pageActions.navigateBack });
			break;
	}

	checkPageAction();
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

function refreshAdditionalSearchEngine() {
	browser.storage.local.get(storageKeys.additionalSearchEngine).then(item => {
		if (Object.keys(item).includes(storageKeys.additionalSearchEngine)) {
			additionalSearchEngineArray = item[storageKeys.additionalSearchEngine];
		}

		searcheEngineAdditionalInputRadio.disabled = additionalSearchEngineArray.length === 0;
		if (searcheEngineAdditionalInputRadio.disabled && searcheEngineAdditionalInputRadio.checked) {
			searcheEngineAskInputRadio.click();
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
	});
}

function requestPermission(event) {
	switch (event.originalTarget.id) {
		case additionalPermissionsHostCheckbox.id:
			if (additionalPermissionsHostCheckbox.checked) {
				browser.permissions.request(hostPermissions).then(accepted => {
					additionalPermissionsHostCheckbox.checked = accepted;
					toggleHostControlledRadioDisabled(!accepted);
				});
			} else {
				browser.permissions.remove(hostPermissions);
				toggleHostControlledRadioDisabled(true);
			}
		default:
	}
}

function saveConfig(keys) {
	browser.storage.local.set(keys).then(notifyRefreshing());
}

function searchEngineRadioButtonOnClick(event) {
	switch (event.target.id) {
		case searcheEngineAdditionalId:
			saveConfig({ [storageKeys.searchEngine]: searchEngines.additional.name });
			break;
		case searcheEngineAskId:
			saveConfig({ [storageKeys.searchEngine]: searchEngines.ask.name });
			break;
		case searcheEngineBingId:
			saveConfig({ [storageKeys.searchEngine]: searchEngines.bing.name });
			break;
		case searcheEngineDuckDuckGoId:
			saveConfig({ [storageKeys.searchEngine]: searchEngines.duckduckgo.name });
			break;
		case searcheEngineGoogleId:
			saveConfig({ [storageKeys.searchEngine]: searchEngines.google.name });
			break;
		case searcheEngineYahooId:
			saveConfig({ [storageKeys.searchEngine]: searchEngines.yahoo.name });
			break;
		case searcheEngineYahooJapanId:
			saveConfig({ [storageKeys.searchEngine]: searchEngines.yahooJapan.name });
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

function toggleHostControlledRadioDisabled(disabled) {
	document.options.userAgent.forEach(element => element.disabled = disabled);
	
	if (disabled && document.getElementById("pageActionNavigateBackInputRadio").checked)
	{
		document.getElementById("pageActionNavigateBackInputRadio").checked = false;
		document.getElementById("pageActionReloadInputRadio").checked = true;
	}
	document.getElementById("pageActionNavigateBackInputRadio").disabled = disabled;
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
