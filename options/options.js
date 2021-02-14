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

const searcheEngineAdditionalId = 'searcheEngineAdditionalInputRadio';
const searcheEngineAskId = 'searcheEngineAskInputRadio';
const searcheEngineBingId = 'searcheEngineBingInputRadio';
const searcheEngineDuckDuckGoId = 'searcheEngineDuckDuckGoInputRadio';
const searcheEngineGoogleId = 'searcheEngineGoogleInputRadio';
const searcheEngineYahooId = 'searcheEngineYahooInputRadio';
const searcheEngineYahooJapanId = 'searcheEngineYahooJapanInputRadio';
const pageActionReloadId = 'pageActionReloadInputRadio';
const pageActionGoBackToHomeId = 'pageActionGoBackToHomeInputRadio';

const searcheEngineAskInputRadio = document.getElementById('searcheEngineAskInputRadio');
const searcheEngineAdditionalInputRadio = document.getElementById('searcheEngineAdditionalInputRadio');
const searchEngineWhichIsWantedToBeAddedNameInputText = document.getElementById('searchEngineWhichIsWantedToBeAddedNameInputText');
const searchEngineWhichIsWantedToBeAddedUrlInputText = document.getElementById('searchEngineWhichIsWantedToBeAddedUrlInputText');
const searchEngineWhichIsWantedToBeAddedQueryInputText = document.getElementById('searchEngineWhichIsWantedToBeAddedQueryInputText');
const searchEngineWhichIsWantedToBeAddedMainCheckbox = document.getElementById('searchEngineWhichIsWantedToBeAddedMainCheckbox');
const addSearchEngineButton = document.getElementById('addSearchEngineButton');
const searchEngineWhichHasBeenAddedTableBody = document.getElementById('searchEngineWhichHasBeenAddedTableBody');

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
document.getElementById('pageActionGoBackToHomeLabel').innerText = browser.i18n.getMessage('goBackToHome');

document.options.searchEngine.forEach((element) => {
	element.addEventListener('click', searchEngineRadioButtonOnClick);
});

document.options.searchEngineWhichIsWantedToBeAdded.forEach((element) => {
	element.addEventListener('click', searchEngineWhichIsWantedToBeAddedInputTextOnClick);
});

document.options.pageAction.forEach((element) => {
	element.addEventListener('click', pageActionRadioButtonOnClick);
});

addSearchEngineButton.addEventListener('click', addSearchEngineButtonOnClick);

checkSearchEngine();
checkPageAction();
var additionalSearchEngineArray = [];
refreshAdditionalSearchEngine();

function searchEngineRadioButtonOnClick(event) {
	switch (event.target.id) {
		case searcheEngineAdditionalId:
			browser.storage.local.set({ [storageKeys.searchEngine]: searchEngines.additional.name });
			break;
		case searcheEngineAskId:
			browser.storage.local.set({ [storageKeys.searchEngine]: searchEngines.ask.name });
			break;
		case searcheEngineBingId:
			browser.storage.local.set({ [storageKeys.searchEngine]: searchEngines.bing.name });
			break;
		case searcheEngineDuckDuckGoId:
			browser.storage.local.set({ [storageKeys.searchEngine]: searchEngines.duckduckgo.name });
			break;
		case searcheEngineGoogleId:
			browser.storage.local.set({ [storageKeys.searchEngine]: searchEngines.google.name });
			break;
		case searcheEngineYahooId:
			browser.storage.local.set({ [storageKeys.searchEngine]: searchEngines.yahoo.name });
			break;
		case searcheEngineYahooJapanId:
			browser.storage.local.set({ [storageKeys.searchEngine]: searchEngines.yahooJapan.name });
			break;
	}

	checkSearchEngine();
}

function checkSearchEngine() {
	browser.storage.local.get(storageKeys.searchEngine).then((item) => {
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

function refreshAdditionalSearchEngine() {
	browser.storage.local.get(storageKeys.additionalSearchEngine).then((item) => {
		if (Object.keys(item).includes(storageKeys.additionalSearchEngine)) {
			additionalSearchEngineArray = item[storageKeys.additionalSearchEngine];
		}

		searcheEngineAdditionalInputRadio.disabled = additionalSearchEngineArray.length === 0;
		if (searcheEngineAdditionalInputRadio.disabled && searcheEngineAdditionalInputRadio.checked) {
			searcheEngineAskInputRadio.click();
		}

		searchEngineWhichHasBeenAddedTableBody.textContent = '';
		for (let additionalSearchEngine of additionalSearchEngineArray) {
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
			searchEngineWhichHasBeenAddedChooseMainRadio.type = 'radio'
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

function searchEngineWhichIsWantedToBeAddedInputTextOnClick(event) {
	event.target.style.backgroundColor = '';
}

function addSearchEngineButtonOnClick() {
	let isAllValid = true;
	document.options.searchEngineWhichIsWantedToBeAdded.forEach((element) => {
		isAllValid = isInputTextValueValid(element) && isAllValid;
	});

	if (isAllValid) {
		let isAlreadyAdded = false;
		const urlOfSearchEngine = `https://${searchEngineWhichIsWantedToBeAddedUrlInputText.value.replace(/^.*:\/+/, '').replace(/\/+$/, '')}`;
		const queryOfSearchEngine = `/${searchEngineWhichIsWantedToBeAddedQueryInputText.value.replace(/^\/+/, '')}`;

		for (let additionalSearchEngine of additionalSearchEngineArray) {
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
			for (let additionalSearchEngine of additionalSearchEngineArray) {
				additionalSearchEngine.isMain = false;
			}
		}

		additionalSearchEngineArray.push({
			name: searchEngineWhichIsWantedToBeAddedNameInputText.value,
			url: urlOfSearchEngine,
			query: queryOfSearchEngine,
			isMain: isMainSearchEngine
		});
		browser.storage.local.set({
			[storageKeys.additionalSearchEngine]: additionalSearchEngineArray
		});

		document.options.searchEngineWhichIsWantedToBeAdded.forEach((element) => {
			element.value = '';
		});
		searchEngineWhichIsWantedToBeAddedMainCheckbox.checked = false;
		refreshAdditionalSearchEngine();
	}
}

function searchEngineWhichHasBeenAddedChooseMainRadioOnChange(event) {
	const index = Array.from(searchEngineWhichHasBeenAddedTableBody.children).findIndex(e => e === event.target.parentElement.parentElement);
	for (let i = 0; i < additionalSearchEngineArray.length; i++) {
		additionalSearchEngineArray[i].isMain = i === index;
	}

	browser.storage.local.set({
		[storageKeys.additionalSearchEngine]: additionalSearchEngineArray
	});

	refreshAdditionalSearchEngine()
}

function searchEngineWhichHasBeenAddedDeleteButtonOnClick(event) {
	const index = Array.from(searchEngineWhichHasBeenAddedTableBody.children).findIndex(e => e === event.target.parentElement.parentElement);
	let isAccepted = window.confirm(`${browser.i18n.getMessage('DoYouReallyWantToDelete')}\n${additionalSearchEngineArray[index].url}${additionalSearchEngineArray[index].query}`);

	if (isAccepted) {
		additionalSearchEngineArray.splice(index, 1);

		if (additionalSearchEngineArray.length !== 0 && additionalSearchEngineArray.filter(e => e.isMain).length === 0) {
			additionalSearchEngineArray[0].isMain = true;
		}

		browser.storage.local.set({
			[storageKeys.additionalSearchEngine]: additionalSearchEngineArray
		});

		refreshAdditionalSearchEngine();
	}
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
			browser.storage.local.set({ [storageKeys.pageAction]: pageActions.reload });
			break;
		case pageActionGoBackToHomeId:
			browser.storage.local.set({ [storageKeys.pageAction]: pageActions.goBackToHome });
			break;
	}

	checkPageAction();
}

function checkPageAction() {
	browser.storage.local.get(storageKeys.pageAction).then((item) => {
		switch (item[storageKeys.pageAction]) {
			case pageActions.reload:
				document.getElementById(pageActionReloadId).checked = true;
				break;
			case pageActions.goBackToHome:
				document.getElementById(pageActionGoBackToHomeId).checked = true;
				break;
		}
	});
}
