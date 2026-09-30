import { installSettingsPanel } from '../../src/ui/SettingsPanel';
installSettingsPanel();
(window as any).settingsSpaceCh141={
  root:document.querySelector<HTMLElement>('#mememe-settings'),
  trigger:document.querySelector<HTMLButtonElement>('.settings-trigger'),
  panel:document.querySelector<HTMLElement>('.settings-panel'),
  spaceSeen:false,
};
document.addEventListener('keydown',(event)=>{
  if(event.code==='Space'||event.key===' ') (window as any).settingsSpaceCh141.spaceSeen=true;
});
