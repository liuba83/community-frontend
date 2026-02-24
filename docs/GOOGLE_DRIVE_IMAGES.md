# Google Drive Image Setup

## Problem

Google Drive URLs submitted via Google Form (`drive.google.com/open?id=...`) require:

1. Files to be publicly accessible
2. URL to be converted to a direct-embed format

## URL Conversion Fix

`src/utils/imageUrl.js` handles two Google Drive URL formats:

- `/file/d/FILE_ID/...` → `drive.google.com/uc?export=view&id=FILE_ID`
- `open?id=FILE_ID` → `drive.google.com/uc?export=view&id=FILE_ID`

## Making Files Publicly Accessible

### One-time bulk fix (Google Apps Script)

1. Go to [script.google.com](https://script.google.com) → **New project**
2. Paste the script below, replacing `YOUR_FOLDER_ID` with the ID from the folder's URL (the part after `/folders/`)
3. Click **Run** → authorize when prompted

```js
function makeFilesPublic() {
  var folderId = 'YOUR_FOLDER_ID';
  var folder = DriveApp.getFolderById(folderId);
  var files = folder.getFiles();

  while (files.hasNext()) {
    var file = files.next();
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    Logger.log('Made public: ' + file.getName());
  }
}
```

### Automate for future uploads

Add a time-driven trigger so new images are made public automatically:

1. In Apps Script → **Triggers** (clock icon on the left)
2. **Add Trigger** → select `makeFilesPublic`
3. Event source: **Time-driven** → Hour timer → **Every hour**

New images uploaded via Google Form will be made public within an hour automatically.
