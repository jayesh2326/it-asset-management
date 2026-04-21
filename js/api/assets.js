// Get all assets
function getAssets() {
return supabaseClient
.from('assets')
.select('*')
.order('created_at', { ascending: false });
}

// Create asset
function createAsset(asset) {
return supabaseClient
.from('assets')
.insert([asset]);
}

// Delete asset
function removeAsset(id) {
return supabaseClient
.from('assets')
.delete()
.eq('id', id);
}
