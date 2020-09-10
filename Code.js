function onOpen () {
  SpreadsheetApp.getUi().createMenu(
    'Roster Tool'
    )
  .addItem('Activate','activate')
  .addToUi();
}

function activate () {
  SpreadsheetApp.getUi()
  .alert('Tool activated! Hopefully you gave me all the permissions I need! If you have any questions, reach out to Tom or use the source...');
}
