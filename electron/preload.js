const { contextBridge, ipcRenderer } = require('electron')

const crud = (channel) => ({
  getAll:  ()    => ipcRenderer.invoke(`${channel}:getAll`),
  create:  (d)   => ipcRenderer.invoke(`${channel}:create`, d),
  update:  (d)   => ipcRenderer.invoke(`${channel}:update`, d),
  delete:  (id)  => ipcRenderer.invoke(`${channel}:delete`, id)
})

contextBridge.exposeInMainWorld('api', {
  crimeType:    crud('crime-type'),
  location:     crud('location'),
  suspect:      crud('suspect'),
  crime:        crud('crime'),
  crimeSuspect: crud('crime-suspect'),
  victim:       crud('victim'),
  dashboard: {
    getStats: () => ipcRenderer.invoke('dashboard:getStats')
  }
})
