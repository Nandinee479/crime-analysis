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
  auth: {
    login:    (d) => ipcRenderer.invoke('auth:login', d),
    register: (d) => ipcRenderer.invoke('auth:register', d)
  },
  dashboard: {
    getStats: () => ipcRenderer.invoke('dashboard:getStats')
  },
  heatmap: {
    getData: () => ipcRenderer.invoke('heatmap:getData')
  },
  crimeRisk: {
    search: (q) => ipcRenderer.invoke('crime-risk:search', q)
  },
  crimeProgress: {
    getAll:  ()  => ipcRenderer.invoke('crime-progress:getAll'),
    getLog:  (id) => ipcRenderer.invoke('crime-progress:getLog', id),
    update:  (d)  => ipcRenderer.invoke('crime-progress:update', d)
  }
})
