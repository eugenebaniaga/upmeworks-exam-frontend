<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Products</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openAddProductModal">
            <ion-icon :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>

      <div class="products-container">
        <ion-searchbar
          v-model="searchTerm"
          placeholder="Search products..."
          @ionInput="filterProducts"
        />

        <div v-if="loading" class="loading-container">
          <ion-spinner name="crescent" />
        </div>

        <div v-else-if="filteredProducts.length === 0" class="empty-state">
          <ion-icon :icon="cubeOutline" />
          <h3>No products found</h3>
          <p>Add your product to get started</p>
          <ion-button @click="openAddProductModal">Add Product</ion-button>
        </div>

        <div v-else class="products-grid">
          <ion-card
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-card"
          >
            <ion-card-content>
              <div class="product-header">
                <h3>{{ product.name }}</h3>
                <ion-badge :color="product.isActive ? 'success' : 'danger'">
                  {{ product.isActive ? "Active" : "Inactive" }}
                </ion-badge>
              </div>

              <p class="product-description">{{ product.description }}</p>

              <div class="product-details">
                <div class="detail-item">
                  <span class="label">Cost Price:</span>
                  <span class="value"
                    >₱{{ product.costPrice?.toFixed(2) || "0.00" }}</span
                  >
                </div>
                <div class="detail-item">
                  <span class="label">Selling Price:</span>
                  <span class="value"
                    >₱{{
                      product.sellingPrice?.toFixed(2) ||
                      product.price?.toFixed(2) ||
                      "0.00"
                    }}</span
                  >
                </div>
                <div class="detail-item">
                  <span class="label">Profit/Unit:</span>
                  <span
                    class="value profit"
                    :class="{
                      positive: getProfitPerUnit(product) > 0,
                      negative: getProfitPerUnit(product) < 0,
                    }"
                  >
                    ₱{{ getProfitPerUnit(product).toFixed(2) }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">Stock:</span>
                  <span
                    class="value"
                    :class="{ 'low-stock': product.stockQuantity < 10 }"
                  >
                    {{ product.stockQuantity }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">SKU:</span>
                  <span class="value">{{ product.sku }}</span>
                </div>
              </div>

              <div class="product-actions">
                <ion-button
                  size="small"
                  fill="outline"
                  @click="editProduct(product)"
                >
                  <ion-icon :icon="createOutline" slot="icon-only" />
                </ion-button>
                <ion-button
                  size="small"
                  fill="outline"
                  color="danger"
                  @click="confirmDelete(product)"
                >
                  <ion-icon :icon="trashOutline" slot="icon-only" />
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <!-- Add/Edit Product Modal -->
      <ion-modal :is-open="isModalOpen" @didDismiss="closeModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{
              editingProduct ? "Edit Product" : "Add Product"
            }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeModal">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <form @submit.prevent="saveProduct">
            <ion-item>
              <ion-label position="stacked">Product Name</ion-label>
              <ion-input v-model="productForm.name" required />
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Description</ion-label>
              <ion-textarea v-model="productForm.description" />
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Cost Price</ion-label>
              <ion-input
                v-model="productForm.costPrice"
                type="number"
                step="0.01"
                required
              />
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Selling Price</ion-label>
              <ion-input
                v-model="productForm.sellingPrice"
                type="number"
                step="0.01"
                required
              />
            </ion-item>

            <div
              v-if="productForm.costPrice && productForm.sellingPrice"
              class="profit-preview"
            >
              <div class="profit-info">
                <span>Profit per unit: </span>
                <span
                  class="profit-amount"
                  :class="{
                    positive: getFormProfit() > 0,
                    negative: getFormProfit() < 0,
                  }"
                >
                  ₱{{ getFormProfit().toFixed(2) }}
                </span>
              </div>
            </div>

            <ion-item>
              <ion-label position="stacked">Stock Quantity</ion-label>
              <ion-input
                v-model="productForm.stockQuantity"
                type="number"
                required
              />
            </ion-item>

            <ion-item>
              <ion-label position="stacked">SKU</ion-label>
              <ion-input v-model="productForm.sku" required />
            </ion-item>

            <ion-item>
              <ion-checkbox v-model="productForm.isActive" />
              <ion-label class="ion-margin-start">Active</ion-label>
            </ion-item>

            <ion-button
              expand="block"
              type="submit"
              :disabled="saving"
              class="save-button"
            >
              <ion-spinner v-if="saving" name="crescent" />
              <span v-else
                >{{ editingProduct ? "Update" : "Add" }} Product</span
              >
            </ion-button>
          </form>
        </ion-content>
      </ion-modal>
    </ion-content>

    <ion-tab-bar slot="bottom">
      <ion-tab-button tab="dashboard" @click="$router.push('/dashboard')">
        <ion-icon :icon="gridOutline" />
        <ion-label>Dashboard</ion-label>
      </ion-tab-button>

      <ion-tab-button
        tab="products"
        @click="$router.push('/products')"
        class="tab-selected"
      >
        <ion-icon :icon="cubeOutline" />
        <ion-label>Products</ion-label>
      </ion-tab-button>

      <ion-tab-button tab="pos" @click="$router.push('/pos')">
        <ion-icon :icon="cardOutline" />
        <ion-label>POS</ion-label>
      </ion-tab-button>

      <ion-tab-button tab="reports" @click="$router.push('/reports')">
        <ion-icon :icon="barChartOutline" />
        <ion-label>Reports</ion-label>
      </ion-tab-button>
    </ion-tab-bar>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useProductsStore, type Product } from "@/stores/products";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonBadge,
  IonModal,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonCheckbox,
  IonTabBar,
  IonTabButton,
  alertController,
  toastController,
} from "@ionic/vue";
import {
  addOutline,
  cubeOutline,
  createOutline,
  trashOutline,
  gridOutline,
  barChartOutline,
  cardOutline,
} from "ionicons/icons";

const productsStore = useProductsStore();

const searchTerm = ref("");
const isModalOpen = ref(false);
const editingProduct = ref<Product | null>(null);
const saving = ref(false);

const productForm = ref({
  name: "",
  description: "",
  costPrice: 0,
  sellingPrice: 0,
  stockQuantity: 0,
  sku: "",
  isActive: true,
});

const loading = computed(() => productsStore.loading);
const filteredProducts = computed(() => {
  if (!searchTerm.value) return productsStore.products;

  return productsStore.products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.value.toLowerCase()),
  );
});

const getProfitPerUnit = (product: Product) => {
  const costPrice = product.costPrice || 0;
  const sellingPrice = product.sellingPrice || product.price || 0;
  return sellingPrice - costPrice;
};

const getFormProfit = () => {
  return (
    (productForm.value.sellingPrice || 0) - (productForm.value.costPrice || 0)
  );
};

const filterProducts = () => {
  // Filtering is handled by computed property
};

const handleRefresh = async (event: any) => {
  await productsStore.fetchProducts();
  event.target.complete();
};

const openAddProductModal = () => {
  editingProduct.value = null;
  productForm.value = {
    name: "",
    description: "",
    costPrice: 0,
    sellingPrice: 0,
    stockQuantity: 0,
    sku: "",
    isActive: true,
  };
  isModalOpen.value = true;
};

const editProduct = (product: Product) => {
  editingProduct.value = product;
  productForm.value = {
    name: product.name,
    description: product.description,
    costPrice: product.costPrice || 0,
    sellingPrice: product.sellingPrice || product.price || 0,
    stockQuantity: product.stockQuantity,
    sku: product.sku,
    isActive: product.isActive,
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  editingProduct.value = null;
};

const saveProduct = async () => {
  saving.value = true;

  let result;
  if (editingProduct.value) {
    result = await productsStore.updateProduct(
      editingProduct.value.id,
      productForm.value,
    );
  } else {
    result = await productsStore.addProduct(productForm.value);
  }

  if (result.success) {
    const toast = await toastController.create({
      message: `Product ${editingProduct.value ? "updated" : "added"} successfully`,
      duration: 2000,
      color: "success",
    });
    await toast.present();
    closeModal();
  } else {
    const alert = await alertController.create({
      header: "Error",
      message: result.error,
      buttons: ["OK"],
    });
    await alert.present();
  }

  saving.value = false;
};

const confirmDelete = async (product: Product) => {
  const alert = await alertController.create({
    header: "Confirm Delete",
    message: `Are you sure you want to delete "${product.name}"? This will affect your profit analysis.`,
    buttons: [
      {
        text: "Cancel",
        role: "cancel",
      },
      {
        text: "Delete",
        role: "destructive",
        handler: () => deleteProduct(product.id),
      },
    ],
  });
  await alert.present();
};

const deleteProduct = async (id: string) => {
  const result = await productsStore.deleteProduct(id);

  if (result.success) {
    const toast = await toastController.create({
      message: "Product deleted successfully",
      duration: 2000,
      color: "success",
    });
    await toast.present();
  } else {
    const alert = await alertController.create({
      header: "Error",
      message: result.error,
      buttons: ["OK"],
    });
    await alert.present();
  }
};

onMounted(() => {
  productsStore.fetchProducts();
});
</script>

<style scoped>
.products-container {
  padding: 1rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state ion-icon {
  font-size: 4rem;
  color: var(--ion-color-medium);
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--ion-color-dark);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.empty-state p {
  color: var(--ion-color-medium);
  margin-bottom: 2rem;
  font-weight: 300;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.product-card {
  margin: 0;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.product-header h3 {
  margin: 0;
  color: var(--ion-color-dark);
  font-weight: 500;
}

.product-description {
  color: var(--ion-color-medium);
  margin-bottom: 1rem;
  font-size: 0.9rem;
  font-weight: 300;
}

.product-details {
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.label {
  color: var(--ion-color-medium);
  font-size: 0.9rem;
  font-weight: 300;
}

.value {
  font-weight: 500;
  color: var(--ion-color-dark);
}

.profit.positive {
  color: var(--ion-color-success);
}

.profit.negative {
  color: var(--ion-color-danger);
}

.low-stock {
  color: var(--ion-color-danger);
}

.product-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.profit-preview {
  background: var(--ion-color-light);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.profit-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profit-amount {
  font-weight: 600;
  font-size: 1.1rem;
}

.profit-amount.positive {
  color: var(--ion-color-success);
}

.profit-amount.negative {
  color: var(--ion-color-danger);
}

.save-button {
  margin-top: 2rem;
}
</style>
