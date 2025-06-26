<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Point of Sale</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="clearCart" :disabled="cart.length === 0">
            <ion-icon :icon="trashOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="pos-layout">
        <!-- Products Section -->
        <div class="products-panel">
          <div class="panel-header">
            <h3>Products ({{ filteredProducts.length }})</h3>
            <ion-searchbar
              v-model="searchTerm"
              placeholder="Search products..."
              @ionInput="filterProducts"
              class="compact-search"
            />
          </div>

          <div v-if="loading" class="loading-container">
            <ion-spinner name="crescent" />
            <p>Loading products...</p>
          </div>

          <div v-else-if="error" class="error-container">
            <ion-icon size="large" :icon="alertCircleOutline" />
            <p>{{ error }}</p>
            <ion-button @click="refreshProducts" fill="outline">
              <ion-icon :icon="refreshOutline" slot="start" />
              Retry
            </ion-button>
          </div>

          <div
            v-else-if="filteredProducts.length === 0"
            class="empty-container"
          >
            <ion-icon size="large" :icon="cubeOutline" />
            <p>No products available</p>
            <ion-button
              class="ion-no-margin"
              size="small"
              @click="$router.push('/products')"
            >
              <ion-icon :icon="addOutline" slot="start" />
              Add Products
            </ion-button>
          </div>

          <div v-else class="products-grid">
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              class="product-card"
              @click="addToCart(product)"
              :class="{ 'out-of-stock': product.stockQuantity === 0 }"
            >
              <span class="product-price"
                >₱{{
                  (product.sellingPrice || product.price || 0).toFixed(2)
                }}</span
              >
              <div class="product-header">
                <h4>{{ product.name }}</h4>
              </div>

              <div class="product-details">
                <span class="stock-info"
                  >Stock: {{ product.stockQuantity }}</span
                >
                <!--    <span class="profit-info" v-if="getProfitPerUnit(product) > 0">
                  +₱{{ getProfitPerUnit(product).toFixed(2) }}
                </span> -->
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Section -->
        <div class="cart-panel">
          <div class="panel-header">
            <h3>Cart ({{ cart.length }})</h3>
          </div>
          <div v-if="cart.length === 0" class="empty-cart">
            <ion-icon :icon="cartOutline" />
            <p>Add products to cart</p>
          </div>

          <div v-else class="cart-content">
            <div class="cart-items">
              <div
                v-for="item in cart"
                :key="item.product.id"
                class="cart-item"
              >
                <ion-row class="ion-justify-content-between">
                  <ion-column>
                    <div class="quantity-section">
                      <div class="quantity-controls">
                        <ion-button
                          size="small"
                          @click="
                            updateQuantity(item.product.id, item.quantity - 1)
                          "
                        >
                          <ion-icon :icon="removeOutline" />
                        </ion-button>

                        <span class="quantity">{{ item.quantity }}</span>

                        <ion-button
                          size="small"
                          @click="
                            updateQuantity(item.product.id, item.quantity + 1)
                          "
                          :disabled="
                            item.quantity >= item.product.stockQuantity
                          "
                        >
                          <ion-icon :icon="addOutline" />
                        </ion-button>
                      </div>

                      <div class="item-total">
                        ₱{{
                          (
                            (item.product.sellingPrice ||
                              item.product.price ||
                              0) * item.quantity
                          ).toFixed(2)
                        }}
                      </div>
                    </div>
                  </ion-column>
                  <ion-column>
                    <div class="item-details">
                      <h4>{{ item.product.name }}</h4>
                      <p>
                        ₱{{
                          (
                            item.product.sellingPrice ||
                            item.product.price ||
                            0
                          ).toFixed(2)
                        }}
                        each
                      </p>
                    </div>
                  </ion-column>
                  <ion-column>
                    <ion-button
                      size="small"
                      fill="outline"
                      color="danger"
                      @click="removeFromCart(item.product.id)"
                      class="remove-btn"
                    >
                      <ion-icon size="large" :icon="closeOutline" />
                    </ion-button>
                  </ion-column>
                </ion-row>
              </div>
            </div>

            <div class="cart-summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>₱{{ cartTotal.toFixed(2) }}</span>
              </div>
              <div class="summary-row profit-row">
                <span>Profit:</span>
                <span class="profit-amount">+₱{{ cartProfit.toFixed(2) }}</span>
              </div>
              <div class="summary-row total-row">
                <span>Total:</span>
                <span class="total-amount">₱{{ cartTotal.toFixed(2) }}</span>
              </div>

              <ion-button
                expand="block"
                @click="openPaymentModal"
                :disabled="cart.length === 0"
                class="checkout-btn"
              >
                Process Payment
              </ion-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Modal -->
      <ion-modal :is-open="isPaymentModalOpen" @didDismiss="closePaymentModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Process Payment</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closePaymentModal">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <div class="payment-summary">
            <h3>Order Summary</h3>
            <div
              v-for="item in cart"
              :key="item.product.id"
              class="summary-item"
            >
              <span>{{ item.product.name }} x{{ item.quantity }}</span>
              <span
                >₱{{
                  (
                    (item.product.sellingPrice || item.product.price || 0) *
                    item.quantity
                  ).toFixed(2)
                }}</span
              >
            </div>
            <div class="summary-profit">
              <span>Total Profit:</span>
              <span class="profit-amount">₱{{ cartProfit.toFixed(2) }}</span>
            </div>
            <div class="summary-total">
              <strong>Total: ₱{{ cartTotal.toFixed(2) }}</strong>
            </div>
          </div>

          <form @submit.prevent="processSale" class="payment-form">
            <ion-item>
              <ion-label position="stacked">Cash Received</ion-label>
              <ion-input
                v-model="cashReceived"
                type="number"
                step="0.01"
                :min="cartTotal"
                required
                placeholder="Enter amount received"
              />
            </ion-item>

            <div v-if="cashReceived >= cartTotal" class="change-display">
              <h4>Change: ₱{{ (cashReceived - cartTotal).toFixed(2) }}</h4>
            </div>

            <ion-button
              expand="block"
              type="submit"
              :disabled="processing || cashReceived < cartTotal"
              class="process-button"
            >
              <ion-spinner v-if="processing" name="crescent" />
              <span v-else>Complete Sale</span>
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

      <ion-tab-button tab="products" @click="$router.push('/products')">
        <ion-icon :icon="cubeOutline" />
        <ion-label>Products</ion-label>
      </ion-tab-button>

      <ion-tab-button
        tab="pos"
        @click="$router.push('/pos')"
        class="tab-selected"
      >
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
import { useSalesStore } from "@/stores/sales";
import { useAuthStore } from "@/stores/auth";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonSpinner,
  IonModal,
  IonItem,
  IonLabel,
  IonInput,
  IonTabBar,
  IonTabButton,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  alertController,
  toastController,
} from "@ionic/vue";
import {
  closeOutline,
  addOutline,
  alertCircleOutline,
  refreshOutline,
  cubeOutline,
  createOutline,
  trashOutline,
  gridOutline,
  barChartOutline,
  cardOutline,
  cartOutline,
  removeOutline,
} from "ionicons/icons";

const authStore = useAuthStore();
const productsStore = useProductsStore();
const salesStore = useSalesStore();

const searchTerm = ref("");
const isPaymentModalOpen = ref(false);
const cashReceived = ref(0);
const processing = ref(false);

const loading = computed(() => productsStore.loading);
const error = computed(() => productsStore.error);
const cart = computed(() => salesStore.cart);
const cartTotal = computed(() => salesStore.getCartTotal());

const cartProfit = computed(() => {
  return cart.value.reduce((total, item) => {
    const profit = getProfitPerUnit(item.product) * item.quantity;
    return total + profit;
  }, 0);
});

const filteredProducts = computed(() => {
  const activeProducts = productsStore.products.filter((p) => p.isActive);

  if (!searchTerm.value) return activeProducts;

  return activeProducts.filter(
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

const filterProducts = () => {
  // Filtering is handled by computed property
};

const refreshProducts = async () => {
  console.log("Refreshing products...");
  await productsStore.fetchProducts();
};

const addToCart = (product: Product) => {
  if (product.stockQuantity === 0) {
    showToast("Product is out of stock", "warning");
    return;
  }

  salesStore.addToCart(product, 1);
  showToast(`${product.name} added to cart`, "success");
};

const updateQuantity = (productId: string, quantity: number) => {
  salesStore.updateCartQuantity(productId, quantity);
};

const removeFromCart = (productId: string) => {
  salesStore.removeFromCart(productId);
};

const clearCart = async () => {
  const alert = await alertController.create({
    header: "Clear Cart",
    message: "Are you sure you want to clear the cart?",
    buttons: [
      {
        text: "Cancel",
        role: "cancel",
      },
      {
        text: "Clear",
        role: "destructive",
        handler: () => {
          salesStore.clearCart();
          showToast("Cart cleared", "success");
        },
      },
    ],
  });
  await alert.present();
};

const openPaymentModal = () => {
  cashReceived.value = cartTotal.value;
  isPaymentModalOpen.value = true;
};

const closePaymentModal = () => {
  isPaymentModalOpen.value = false;
  cashReceived.value = 0;
};

const processSale = async () => {
  processing.value = true;

  const result = await salesStore.processSale(cashReceived.value);

  if (result.success) {
    const toast = await toastController.create({
      message: `Sale completed! Change:₱${(cashReceived.value - cartTotal.value).toFixed(2)} | Profit: ₱${cartProfit.value.toFixed(2)}`,
      duration: 4000,
      color: "success",
    });
    await toast.present();

    closePaymentModal();
    await productsStore.fetchProducts(); // Refresh products to update stock
  } else {
    const alert = await alertController.create({
      header: "Sale Failed",
      message: result.error,
      buttons: ["OK"],
    });
    await alert.present();
  }

  processing.value = false;
};

const showToast = async (message: string, color: string) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color,
  });
  await toast.present();
};

onMounted(async () => {
  console.log("POS Page mounted");
  console.log("Auth state:", {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    token: !!authStore.token,
  });

  if (!authStore.isAuthenticated) {
    console.warn("User not authenticated, redirecting to login");
    return;
  }

  await refreshProducts();
});
</script>

<style scoped>
.pos-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: calc(100vh - 120px);
  gap: 1px;
  background: var(--ion-color-step-150);
}

.products-panel,
.cart-panel {
  background: var(--ion-background-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 1rem;
  border-bottom: 1px solid var(--ion-color-step-150);
  background: var(--ion-color-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--ion-color-dark);
}

.compact-search {
  flex: 1;
  margin-left: 1rem;
  --background: var(--ion-color-step-50);
  --border-radius: 8px;
  --box-shadow: none;
  --padding-start: 12px;
  --padding-end: 12px;
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 2rem;
  text-align: center;
  color: var(--ion-color-medium);
}

.loading-container ion-spinner,
.error-container {
  color: var(--ion-color-danger);
}

.error-container ion-icon {
  color: var(--ion-color-danger);
}

.products-grid {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
  align-content: start;
}

.product-card {
  background: var(--ion-color-light);
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--ion-color-step-150);
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-card:hover {
  background: var(--ion-color-primary-tint);
  border-color: var(--ion-color-primary);
  transform: translateY(-1px);
}

.product-card.out-of-stock {
  opacity: 0.5;
  cursor: not-allowed;
}

.product-card.out-of-stock:hover {
  background: var(--ion-color-light);
  border-color: var(--ion-color-step-150);
  transform: none;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.product-header h4 {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ion-color-dark);
  line-height: 1.2;
  flex: 1;
}

.product-price {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ion-color-primary);
}

.product-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.stock-info {
  color: var(--ion-color-medium);
  font-weight: 300;
}

.profit-info {
  color: var(--ion-color-success);
  font-weight: 500;
}

.cart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem;
  background: var(--ion-color-light);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border: 1px solid var(--ion-color-step-150);
}

.item-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--ion-color-dark);
}

.item-details p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  font-weight: 300;
}

.quantity-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.quantity-controls ion-button {
  --padding-start: 4px;
  --padding-end: 4px;
  --padding-top: 4px;
  --padding-bottom: 4px;
  width: 28px;
  height: 28px;
}

.quantity {
  min-width: 2rem;
  text-align: center;
  font-weight: 500;
  font-size: 0.9rem;
}

.item-total {
  font-weight: 600;
  color: var(--ion-color-primary);
  font-size: 0.9rem;
  text-align: center;
}

.remove-btn {
  --padding-start: 4px;
  --padding-end: 4px;
  --padding-top: 4px;
  --padding-bottom: 4px;
  width: 28px;
  height: 28px;
}

.empty-cart {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--ion-color-medium);
  padding: 2rem;
}

.empty-cart ion-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.cart-summary {
  padding: 1rem;
  border-top: 1px solid var(--ion-color-step-150);
  background: var(--ion-color-step-50);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.profit-row {
  color: var(--ion-color-success);
  font-weight: 500;
}

.total-row {
  font-size: 1.1rem;
  font-weight: 600;
  border-top: 1px solid var(--ion-color-step-150);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

.total-amount {
  color: var(--ion-color-primary);
}

.profit-amount {
  color: var(--ion-color-success);
}

.checkout-btn {
  margin-top: 1rem;
  height: 44px;
  font-weight: 500;
}

.payment-summary {
  background: var(--ion-color-light);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.payment-summary h3 {
  margin: 0 0 1rem 0;
  color: var(--ion-color-dark);
  font-weight: 500;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: var(--ion-color-dark);
  font-weight: 300;
}

.summary-profit {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: var(--ion-color-success);
  font-weight: 500;
}

.summary-total {
  border-top: 1px solid var(--ion-color-step-150);
  padding-top: 0.5rem;
  margin-top: 1rem;
  font-size: 1.2rem;
  color: var(--ion-color-primary);
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.change-display {
  background: var(--ion-color-success-tint);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.change-display h4 {
  margin: 0;
  color: var(--ion-color-success-shade);
  font-weight: 500;
}

.process-button {
  height: 50px;
  margin-top: 1rem;
  font-weight: 500;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .pos-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    height: calc(100vh - 120px);
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  .cart-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    text-align: center;
  }

  .quantity-section {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .panel-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  .compact-search {
    margin-left: 0;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
  }
}
</style>
