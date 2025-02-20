'use strict';

let AccountManager = require('../modules/account-manager');
let CssManager = require('../modules/css-manager');
let settingsWindow = null;

Object.assign(window._clientUtil, {
	searchMatches: entry => {
		let query = settingsWindow.settingSearch.toLowerCase() || '';
		return (entry.name.toLowerCase() || '').includes(query) || (entry.cat.toLowerCase() || '').includes(query);
	},
	genCSettingsHTML: options => {
		switch (options.type) {
			case 'checkbox': return `<label class='switch'><input type='checkbox' onclick='_clientUtil.setCSetting("${options.id}", this.checked)'${options.val ? ' checked' : ''}><span class='slider'></span></label>`;
			case 'slider': return `<input type='number' class='sliderVal' id='c_slid_input_${options.id}' min='${options.min}' max='${options.max}' value='${options.val}' onkeypress='_clientUtil.delaySetCSetting("${options.id}", this)' style='border-width:0px'/><div class='slidecontainer'><input type='range' id='c_slid_${options.id}' min='${options.min}' max='${options.max}' step='${options.step}' value='${options.val}' class='sliderM' oninput='_clientUtil.setCSetting("${options.id}", this.value)'></div>`;
			case 'select': return `<select onchange='_clientUtil.setCSetting("${options.id}", this.value)' class='inputGrey2'>${Object.entries(options.options).map(entry => `<option value='${entry[0]}'${entry[0] == options.val ? ' selected' : ''}>${entry[1]}</option>`).join('')}</select>`;
			case 'button': return `<button id=${options.id} class='settingsBtn' onclick='${options.click}' style='width:auto;'>${options.name}</button>`;
			default: return `<input type='${options.type}' name='${options.id}' id='c_slid_${options.id}' ${options.type == 'color' ? 'style="float:right;margin-top:5px;"' : `class='inputGrey2' ${options.placeholder ? `placeholder='${options.placeholder}'` : ''}`} value='${options.val.replace(/'/g, '')}' oninput='_clientUtil.setCSetting("${options.id}", this.value)'/>`;
		}
	},
	openCSS: () => {
		cssManager.openPopup();
	}
});

// Workaround to avoid getting client popup
window.OffCliV = true;

let accountManager = new AccountManager(window, document, localStorage);
let cssManager = new CssManager();

document.addEventListener('DOMContentLoaded', () => {
	let windowsObserver = new MutationObserver(() => {
		windowsObserver.disconnect();
		window._clientUtil.events.emit('game-load');
	});
	windowsObserver.observe(document.getElementById('instructions'), { childList: true });

	accountManager.injectStyles();
	cssManager.injectStyles();

	// const gameCSS = Object.assign(document.createElement('link'), {
	// 	rel: 'stylesheet', href: 'idkr-swap:' + path.join(__dirname, '../css/game.css')
	// })
	// document.head.appendChild(gameCSS)
});

window._clientUtil.events.on('game-load', () => {
	window.closeClient = close;
	settingsWindow = window.windows[0];

	// Patch getSettings to fix custom tab bug + settings not displaying issue
	let origGetSettings = settingsWindow.getSettings;
	settingsWindow.getSettings = (...args) => origGetSettings.call(settingsWindow, ...args).replace(/^<\/div>/, '') + settingsWindow.getCSettings();

	let clientTabIndex = settingsWindow.tabs.push({ name: 'idkr', categories: [] });
	settingsWindow.getCSettings = () => {
		if (clientTabIndex != settingsWindow.tabIndex + 1 && !settingsWindow.settingSearch) {
			return '';
		}
		let tempHTML = '';
		let previousCategory = null;
		Object.values(window._clientUtil.settings).forEach(entry => {
			if (settingsWindow.settingSearch && !window._clientUtil.searchMatches(entry) || entry.hide) {
				return;
			}
			if (previousCategory != entry.cat) {
				if (previousCategory) {
					tempHTML += '</div>';
				}
				previousCategory = entry.cat;
				tempHTML += `<div class='setHed' id='setHed_${btoa(entry.cat)}' onclick='window.windows[0].collapseFolder(this)'><span class='material-icons plusOrMinus'>keyboard_arrow_down</span> ${entry.cat}</div><div id='setBod_${btoa(entry.cat)}'>`;
			}
			tempHTML += `<div class='settName'${entry.needsRestart ? ' title="Requires Restart"' : ''}${entry.hide ? ` id='c_${entry.id}_div' style='display: none'` : ''}>${entry.name}${entry.needsRestart ? ' <span style="color: #eb5656">*</span>' : ''} ${entry.html()}</div>`;
		});
		return tempHTML ? tempHTML + '</div>' : '';
	};
});
