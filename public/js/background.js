chrome.action.onClicked.addListener(function (tab) {
    chrome.tabs.create(
        { url: chrome.runtime.getURL('index.html') },
        function (tab) {},
    );
});

const RB_DOWNLOAD_JSON_MENU = 'RB_DOWNLOAD_JSON_MENU';
const RB_OPEN_SETTINGS = 'RB_OPEN_SETTINGS';

const createContextMenu = () => {
    let alreadyInvoked = false;
    return () => {
        if (alreadyInvoked) return;
        const uniqueId= "NONE";//Math.floor(Math.random() * 9000000000) + 1000000000;;
        chrome.contextMenus.create({
            id: RB_DOWNLOAD_JSON_MENU + '_' + uniqueId,
            title: 'Download JSON',
            contexts: ['all'],
            type: 'normal',
            documentUrlPatterns: ['*://*/*'],
            // onclick: function (info, tab) {
            //     if (info.menuItemId.startsWith(RB_DOWNLOAD_JSON_MENU)) {
            //         return;
            //     }
            //     chrome.tabs.sendMessage(tab.id, { action: 'rb_download_json' });
            // },
        });

        chrome.contextMenus.create({
            id: RB_OPEN_SETTINGS + '_' + uniqueId,
            title: 'Settings',
            contexts: ['all'],
            type: 'normal',
            documentUrlPatterns: ['*://*/*'],
            // onclick: function (info, tab) {
            //     if (info.menuItemId !== RB_OPEN_SETTINGS) {
            //         return;
            //     }
            //     chrome.tabs.create({
            //         url: chrome.runtime.getURL('options.html'),
            //     });
            // },
        });
        alreadyInvoked = true;
    };
};

chrome.contextMenus.onClicked.addListener((info,tab)=>{
        if (info.menuItemId.startsWith(RB_DOWNLOAD_JSON_MENU)) {
            chrome.tabs.sendMessage(tab.id, { action: 'rb_download_json' });
        }else if (info.menuItemId.startsWith(RB_OPEN_SETTINGS)) {
            chrome.tabs.create({
                url: chrome.runtime.getURL('options.html'),
            });
        }
            
    }
)

const createContextMenuOnce = createContextMenu();

const dbName = 'rb-awesome-json-viewer-options';
const sendOptions = async () => {
    // let options = JSON.parse(window.localStorage.getItem(dbName));
    let options = await chrome.storage.local.get(dbName)
    options = JSON.parse(options[dbName]);
    if (!options) {
        options = {};
    }
    if(!options.theme){
        options.theme = 'default';
    }
    if(!options.css){
        options.css = '';
    }
    if(!options.collapsed){
        options.collapsed = 0;
    }
    (options.optionPageURL = chrome.runtime.getURL('options.html')),
        (options.optionIconURL = chrome.runtime.getURL(
            '/images/icons/gear.png',
        )),
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                const data = {
                    action: 'options_received',
                    options: options,
                };
                chrome.tabs.sendMessage(tab.id, data);
            });
        });
};


const initializePageScripts = (options)=>{
chrome.tabs.query({'active': true, 'lastFocusedWindow': true, 'currentWindow': true}, (tabs) =>{
    var tabID = tabs[0].id;
    chrome.scripting.executeScript({
        target : {tabId : tabID},
        func : (opts)=>{initOpts(opts)},
        args : [ options ],
        });
});  
}



chrome.runtime.onMessage.addListener((message) => {
    switch (message.action) {
        case 'give_me_options':
            sendOptions();
            createContextMenuOnce();
            break;
        case 'initialize_page_script':
            initializePageScripts(message.options);
            break;
        default:
            break;
    }
});




function initializePage(){

}
