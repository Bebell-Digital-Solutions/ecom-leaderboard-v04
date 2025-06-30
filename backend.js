// Security check: Redirect non-admins immediately.
if (sessionStorage.getItem('isAdmin') !== 'true') {
    alert('Access Denied: You must be an administrator to view this page.');
    window.location.href = 'index.html';
}

// Admin Panel Logic for eCOMLeaderboard 2025

class BackendManager {
    constructor() {
        // This will be assigned the global dataStore instance from app.js
        this.dataStore = null; 
        this.tableContent = document.getElementById('adminTableContent');
        this.modal = document.getElementById('editStoreModal');
        this.editForm = document.getElementById('editStoreForm');
    }

    initialize() {
        // Use the global dataStore initialized in app.js
        this.dataStore = window.dataStore;
        if (!this.dataStore) {
            console.error("DataStore not found. Make sure app.js is loaded first.");
            return;
        }

        this.renderTable();
        this.editForm.addEventListener('submit', (e) => this.handleSave(e));
    }

    renderTable() {
        const stores = this.dataStore.getAllStores();
        this.tableContent.innerHTML = ''; // Clear existing content

        if (stores.length === 0) {
            this.tableContent.innerHTML = '<div class="admin-table-row" style="text-align: center; grid-column: 1 / -1;">No stores found.</div>';
            return;
        }

        stores.forEach(store => {
            const row = document.createElement('div');
            row.className = 'admin-table-row';
            row.innerHTML = `
                <div>${store.name}</div>
                <div>${store.email}</div>
                <div><a href="${store.url}" target="_blank" rel="noopener noreferrer">${this.formatUrl(store.url)}</a></div>
                <div>${new Date(store.createdAt).toLocaleDateString()}</div>
                <div class="admin-actions">
                    <button class="btn-icon btn-edit" onclick="backendManager.handleEdit('${store.id}')">
                        <i data-lucide="edit"></i> Edit
                    </button>
                    <button class="btn-icon btn-delete" onclick="backendManager.handleDelete('${store.id}')">
                        <i data-lucide="trash-2"></i> Delete
                    </button>
                </div>
            `;
            this.tableContent.appendChild(row);
        });
        
        lucide.createIcons();
    }

    handleEdit(storeId) {
        const store = this.dataStore.getStoreById(storeId);
        if (store) {
            document.getElementById('editStoreId').value = store.id;
            document.getElementById('editStoreName').value = store.name;
            document.getElementById('editStoreUrl').value = store.url;
            document.getElementById('editStoreEmail').value = store.email;
            this.modal.style.display = 'flex';
        }
    }

    handleSave(event) {
        event.preventDefault();
        const storeId = document.getElementById('editStoreId').value;
        const updatedData = {
            name: document.getElementById('editStoreName').value,
            url: document.getElementById('editStoreUrl').value,
            email: document.getElementById('editStoreEmail').value,
        };
        this.dataStore.updateStore(storeId, updatedData);
        this.closeEditModal();
        this.renderTable();
    }
    
    handleDelete(storeId) {
        const store = this.dataStore.getStoreById(storeId);
        if (!store) return;

        const confirmation = confirm(`Are you sure you want to delete the store "${store.name}"? This action cannot be undone.`);
        if (confirmation) {
            this.dataStore.deleteStore(storeId);
            this.renderTable();
        }
    }

    closeEditModal() {
        this.modal.style.display = 'none';
        this.editForm.reset();
    }
    
    formatUrl(url) {
        if (!url) return '';
        return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }
}

// --- GLOBAL FUNCTIONS for HTML onclick ---
// Placed here to be available to the HTML
function closeEditModal() {
    if (window.backendManager) {
        window.backendManager.closeEditModal();
    }
}

// `logout` is defined in app.js, which is now loaded first.

document.addEventListener('dataStoreReady', () => {
    // This script runs after app.js, so the global dataStore is available.
    window.backendManager = new BackendManager();
    window.backendManager.initialize();
});