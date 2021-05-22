let WindowManager = require('./window-manager');
let PathUtils = require('../utils/path-utils');
let Store = require('electron-store');
let path = require('path');
let fs = require('fs');
let { ipcRenderer } = require('electron');

const config = new Store();

const documentsPath = ipcRenderer.sendSync('get-path', 'documents');

const HTML = {
    STYLE: '',
    BTN: '<div id="cssMgrBtn" class="button buttonR bigShadowT" onmouseenter="playTick()" style="display:block;width:300px;text-align:center;padding:15px;font-size:23px;pointer-events:all;padding-bottom:22px;margin-left:-5px;margin-top:5px">CSS Manager</div>'
};

class CssManager {
	constructor() {
		this.managerWin = new WindowManager('cssMgrBtn');
	}

	openPopup() {
		let resultHTML = '';
		const cssDirConfig = config.get('customSassDir', '');
		const cssDir = isValidPath(cssDirConfig) ? cssDirConfig : path.join(documentsPath, 'idkr/css');
		fs.readdirSync(cssDir).forEach((e) => {
			resultHTML += `- ${e} <label class='switch'><input type='checkbox' onclick='_clientUtil.setCSSVal("customCss__${e}", this.checked)' ${config.get('customCss__' + e, false) ? 'checked' : ''}><span class='slider'></span></label><br><br>`;
		});

		this.managerWin.setContent(resultHTML);
		this.managerWin.toggle();
	}
}

module.exports = CssManager;
