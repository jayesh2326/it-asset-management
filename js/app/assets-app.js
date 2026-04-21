$(document).ready(function () {

// Initial load
loadAssets();

// Add asset form submit
$('#addAssetForm').submit(function (e) {
e.preventDefault();

```
const asset = {
  asset_tag: $('#asset_tag').val(),
  name: $('#name').val(),
  category: $('#category').val(),
  brand: $('#brand').val(),
  model: $('#model').val(),
  serial_number: $('#serial_number').val(),
  status: 'in_stock'
};

createAsset(asset).then(res => {
  if (res.error) {
    alert('Error adding asset');
    console.error(res.error);
    return;
  }

  $('#addAssetForm')[0].reset();
  loadAssets();
});
```

});

});

// Load assets
function loadAssets() {
getAssets().then(res => {
if (res.error) {
console.error(res.error);
return;
}

```
renderAssets(res.data);
```

});
}

// Delete handler
function handleDelete(id) {
if (!confirm('Are you sure you want to delete this asset?')) return;

removeAsset(id).then(res => {
if (res.error) {
alert('Error deleting asset');
console.error(res.error);
return;
}

```
loadAssets();
```

});
}
