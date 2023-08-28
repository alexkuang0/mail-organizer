const PRIMARY_LABEL = 'relay';
const LABEL_SEPARATOR = '-';
const LEVEL_SEPARATOR = '.';
const TRIGGER_FREQUENCY_SECS = 5 * 60;

function labelMailsByAddress() {
  const afterTimestamp = Math.floor(Date.now() / 1000 - TRIGGER_FREQUENCY_SECS - 360);
  const targetThreads = GmailApp.search(`label:${PRIMARY_LABEL} after:${afterTimestamp}`);

  targetThreads.forEach(thread => {
    Logger.log(`[${getUTCTimeString()}] Subject: ${thread.getFirstMessageSubject()}`);

    const sentToAddr = thread.getMessages()[0].getTo();
    const labels = sentToAddr.split('@')[0].split(LABEL_SEPARATOR);

    labels.forEach(label => {
      const levels = label.split(LEVEL_SEPARATOR);
      const currLevels = [PRIMARY_LABEL];

      levels.forEach(level => {
        let currLength = currLevels.push(level);
        let fullLabelName = currLevels.join('/');
        let currLabel = getLabelOrCreate(fullLabelName);

        if (currLength === levels.length + 1) {
          thread.addLabel(currLabel);
          Logger.log(`[${getUTCTimeString()}] Added label: ${fullLabelName}`);
        }
      })
    })
  })
}

function deleteUnusedLabels() {
  GmailApp
    .getUserLabels()
    .filter(label => {
      let labelLevels = label.getName().split('/');
      return labelLevels.length > 1 && labelLevels[0] === PRIMARY_LABEL;
    })
    .forEach(label => {
      if (label.getThreads().length === 0) {
        GmailApp.deleteLabel(label);
        Logger.log(`[${getUTCTimeString()}] Deleted label: ${label.getName()}`)
      }
    });
}

// utils

function getLabelOrCreate(labelName) {
  return GmailApp.getUserLabelByName(labelName) || GmailApp.createLabel(labelName)
}

function getUTCTimeString() {
  return (new Date()).toUTCString()
}
