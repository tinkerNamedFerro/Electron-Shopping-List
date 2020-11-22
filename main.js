const electron = require ('electron');
const url = require('url');
const path = require('path');
const { allowedNodeEnvironmentFlags } = require('process');


const {app, BrowserWindow, Menu, ipcMain} = electron;

// SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;
// Listen for app to be ready
app.on('ready', function(){
    mainWindow = new BrowserWindow({
        webPreferences: {nodeIntegration: true}
    });
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    //Quit app when closed
    mainWindow.on('closed', function() {
        app.quit();
    })

    //Build menu from mainMenuTemplate
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //insert menu
    Menu.setApplicationMenu(mainMenu);
})

//Handle create add window
function createAddWindow() {
    addWindow = new BrowserWindow({
        width:300,
        height:200,
        title:'Add Shopping List Item',
        webPreferences: {nodeIntegration: true}
    });
    // Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Garbage collection handle 
    mainWindow.on('closed', function() {
        addWindow = null;
    });

    
}

//Catch item:add
ipcMain.on('item:add', function(e, item) {
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
})


// Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu:[
            {
                label: 'Add Item',
                click(){
                    createAddWindow();
                }
        
            },
            {
                label: 'Clear Items',
                click() {
                    mainWindow.webContents.send('item:clear', '');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// if mac push object

if (process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

//add developer tools item if not in production
if (process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu:[
            {
                label: 'Toggle Dev Tools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) { // focusedWindow is a variable the window which clicked
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role:"reload"
            }
        ]
            
    });
}