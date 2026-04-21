function renderAssets(assets) {
let html = '';

if (!assets || assets.length === 0) {
html = `<tr><td colspan="5">No assets found</td></tr>`;
} else {
assets.forEach(asset => {
const status = asset.status || 'in_stock';

```
  html += `
    <tr>
      <td>${asset.asset_tag}</td>
      <td>${asset.name}</td>
      <td>${asset.category}</td>
      <td>
        <span class="status ${status}">
          ${status}
        </span>
      </td>
      <td>
        <button onclick="handleDelete('${asset.id}')">Delete</button>
      </td>
    </tr>
  `;
});
```

}

$('#assetTable').html(html);
}
