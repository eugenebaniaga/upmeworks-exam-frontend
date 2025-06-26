<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Reports</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="reports-container">
        <!-- Date Range Selector -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Report Filters</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label position="stacked">Report Type</ion-label>
              <ion-select v-model="reportType" @ionChange="loadReport">
                <ion-select-option value="daily">Daily Sales</ion-select-option>
                <ion-select-option value="monthly"
                  >Monthly Sales</ion-select-option
                >
                <ion-select-option value="products"
                  >Product Performance</ion-select-option
                >
              </ion-select>
            </ion-item>

            <ion-item v-if="reportType === 'daily'">
              <ion-label position="stacked">Date</ion-label>
              <ion-datetime
                v-model="selectedDate"
                presentation="date"
                @ionChange="loadReport"
              />
            </ion-item>

            <div v-if="reportType === 'monthly'" class="month-selector">
              <ion-item>
                <ion-label position="stacked">Year</ion-label>
                <ion-select v-model="selectedYear" @ionChange="loadReport">
                  <ion-select-option
                    v-for="year in availableYears"
                    :key="year"
                    :value="year"
                  >
                    {{ year }}
                  </ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Month</ion-label>
                <ion-select v-model="selectedMonth" @ionChange="loadReport">
                  <ion-select-option
                    v-for="(month, index) in months"
                    :key="index"
                    :value="index + 1"
                  >
                    {{ month }}
                  </ion-select-option>
                </ion-select>
              </ion-item>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <ion-spinner name="crescent" />
          <p>Loading report...</p>
        </div>

        <!-- Report Content -->
        <div v-else-if="reportData" class="report-content">
          <!-- Daily/Monthly Sales Report -->
          <div v-if="reportType === 'daily' || reportType === 'monthly'">
            <ion-card>
              <ion-card-header>
                <ion-card-title>
                  {{ reportType === "daily" ? "Daily" : "Monthly" }} Sales
                  Summary
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div class="summary-stats">
                  <div class="stat-item">
                    <h3>{{ reportData.totalSales || 0 }}</h3>
                    <p>Total Sales</p>
                  </div>
                  <div class="stat-item">
                    <h3>₱{{ (reportData.totalRevenue || 0).toFixed(2) }}</h3>
                    <p>Total Revenue</p>
                  </div>
                  <div class="stat-item profit-stat">
                    <h3>₱{{ (reportData.totalProfit || 0).toFixed(2) }}</h3>
                    <p>Total Profit</p>
                  </div>
                  <div class="stat-item">
                    <h3>{{ reportData.totalItems || 0 }}</h3>
                    <p>Items Sold</p>
                  </div>
                  <div class="stat-item">
                    <h3>₱{{ (reportData.averageSale || 0).toFixed(2) }}</h3>
                    <p>Average Sale</p>
                  </div>
                  <div class="stat-item profit-stat">
                    <h3>{{ getProfitMargin().toFixed(1) }}%</h3>
                    <p>Profit Margin</p>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>

            <!-- Recent Sales -->
            <ion-card v-if="reportData.sales && reportData.sales.length > 0">
              <ion-card-header>
                <ion-card-title>Recent Sales</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div class="sales-list">
                  <div
                    v-for="sale in reportData.sales.slice(0, 10)"
                    :key="sale.id"
                    class="sale-item"
                  >
                    <div class="sale-info">
                      <h4>Sale #{{ sale.id.substring(0, 8) }}</h4>
                      <p>{{ formatDate(sale.createdAt) }}</p>
                    </div>
                    <div class="sale-amounts">
                      <div class="sale-amount">
                        <strong>₱{{ sale.totalAmount.toFixed(2) }}</strong>
                        <span class="amount-label">Revenue</span>
                      </div>
                      <div class="sale-profit">
                        <strong
                          >₱{{ calculateSaleProfit(sale).toFixed(2) }}</strong
                        >
                        <span class="amount-label">Profit</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </div>

          <!-- Product Performance Report -->
          <div v-if="reportType === 'products'">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Product Performance</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div
                  v-if="reportData.products && reportData.products.length > 0"
                  class="products-report"
                >
                  <div
                    v-for="product in reportData.products"
                    :key="product.id"
                    class="product-report-item"
                  >
                    <div class="product-info">
                      <h4>{{ product.name }}</h4>
                      <p>SKU: {{ product.sku }}</p>
                      <div class="product-pricing">
                        <span class="cost-price"
                          >Cost: ₱{{
                            (product.costPrice || 0).toFixed(2)
                          }}</span
                        >
                        <span class="selling-price"
                          >Selling: ₱{{
                            (
                              product.sellingPrice ||
                              product.price ||
                              0
                            ).toFixed(2)
                          }}</span
                        >
                        <span
                          class="profit-per-unit"
                          :class="{
                            positive: getProductProfit(product) > 0,
                            negative: getProductProfit(product) < 0,
                          }"
                        >
                          Profit/Unit: ₱{{
                            getProductProfit(product).toFixed(2)
                          }}
                        </span>
                      </div>
                    </div>
                    <div class="product-stats">
                      <div class="stat">
                        <span class="stat-value">{{
                          product.totalSold || 0
                        }}</span>
                        <span class="stat-label">Sold</span>
                      </div>
                      <!--BUG WHEN YOU CHANGE THE SELLING PRICE-->
                      <!-- <div class="stat">
                        <span class="stat-value"
                          >₱{{ (product.totalRevenue || 0).toFixed(2) }}</span
                        >
                        <span class="stat-label">Revenue</span>
                      </div>
                      <div class="stat profit-stat">
                        <span class="stat-value"
                          >₱{{ (product.totalProfit || 0).toFixed(2) }}</span
                        >
                        <span class="stat-label">Profit</span>
                      </div> -->
                      <div class="stat">
                        <span class="stat-value">{{
                          product.stockQuantity
                        }}</span>
                        <span class="stat-label">Stock</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="no-data">
                  <p>No product data available</p>
                </div>
              </ion-card-content>
            </ion-card>
          </div>
        </div>

        <!-- No Data State -->
        <div v-else class="no-data-container">
          <ion-icon :icon="barChartOutline" />
          <h3>No Data Available</h3>
          <p>Select a report type and date range to view data</p>
        </div>
      </div>
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

      <ion-tab-button tab="pos" @click="$router.push('/pos')">
        <ion-icon :icon="cardOutline" />
        <ion-label>POS</ion-label>
      </ion-tab-button>

      <ion-tab-button
        tab="reports"
        @click="$router.push('/reports')"
        class="tab-selected"
      >
        <ion-icon :icon="barChartOutline" />
        <ion-label>Reports</ion-label>
      </ion-tab-button>
    </ion-tab-bar>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { reportsApi } from "@/services/api";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonSpinner,
  IonIcon,
  IonTabBar,
  IonTabButton,
} from "@ionic/vue";
import {
  logOutOutline,
  barChartOutline,
  cardOutline,
  cubeOutline,
  gridOutline,
  personCircleOutline,
  flashOutline,
  trendingUpOutline,
  analyticsOutline,
} from "ionicons/icons";
import { format } from "date-fns";

const reportType = ref("products");
const selectedDate = ref(new Date().toISOString());
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);
const loading = ref(false);
const reportData = ref<any>(null);

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear() + 1;
  const years = [];
  for (let i = currentYear; i >= currentYear - 6; i--) {
    years.push(i);
  }
  return years;
});

const getProfitMargin = () => {
  if (
    !reportData.value ||
    !reportData.value.totalRevenue ||
    reportData.value.totalRevenue === 0
  ) {
    return 0;
  }
  return (
    ((reportData.value.totalProfit || 0) / reportData.value.totalRevenue) * 100
  );
};

const getProductProfit = (product: any) => {
  const costPrice = product.costPrice || 0;
  const sellingPrice = product.sellingPrice || product.price || 0;
  return sellingPrice - costPrice;
};

const calculateSaleProfit = (sale: any) => {
  if (!sale.items) return 0;

  return sale.items.reduce((total: number, item: any) => {
    const product = item.product;
    if (product && product.costPrice) {
      const profitPerUnit = item.unitPrice - product.costPrice;
      return total + profitPerUnit * item.quantity;
    }
    return total;
  }, 0);
};

const loadReport = async () => {
  loading.value = true;
  reportData.value = null;

  try {
    let data;

    switch (reportType.value) {
      case "daily":
        const dateStr = new Date(selectedDate.value)
          .toISOString()
          .split("T")[0];
        data = await reportsApi.getDailyReport(dateStr);
        break;

      case "monthly":
        data = await reportsApi.getMonthlyReport(
          selectedYear.value,
          selectedMonth.value,
        );
        break;

      case "products":
        data = await reportsApi.getProductReport();
        break;
    }

    reportData.value = data;
  } catch (error) {
    console.error("Failed to load report:", error);
    // For demo purposes lang, create mock data
    reportData.value = createMockData();
  } finally {
    loading.value = false;
  }
};

//TODO: delete this mamaya
const createMockData = () => {
  if (reportType.value === "products") {
    return {
      products: [
        {
          id: "1",
          name: "Sample Product 1",
          sku: "SP001",
          costPrice: 10.0,
          sellingPrice: 15.99,
          totalSold: 25,
          totalRevenue: 399.75,
          totalProfit: 149.75,
          stockQuantity: 75,
        },
        {
          id: "2",
          name: "Sample Product 2",
          sku: "SP002",
          costPrice: 20.0,
          sellingPrice: 30.0,
          totalSold: 15,
          totalRevenue: 450.0,
          totalProfit: 150.0,
          stockQuantity: 30,
        },
      ],
    };
  } else {
    return {
      totalSales: 12,
      totalRevenue: 1250.5,
      totalProfit: 375.15,
      totalItems: 45,
      averageSale: 104.21,
      sales: [
        {
          id: "sale-001",
          totalAmount: 125.5,
          createdAt: new Date().toISOString(),
          items: [
            {
              product: { costPrice: 10.0 },
              unitPrice: 15.99,
              quantity: 2,
            },
          ],
        },
        {
          id: "sale-002",
          totalAmount: 89.25,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          items: [
            {
              product: { costPrice: 15.0 },
              unitPrice: 25.0,
              quantity: 1,
            },
          ],
        },
      ],
    };
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

onMounted(() => {
  loadReport();
});
</script>

<style scoped>
.reports-container {
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  color: var(--ion-color-medium);
}

.loading-container ion-spinner {
  margin-bottom: 1rem;
}

.month-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.stat-item.profit-stat {
  border-left: 4px solid var(--ion-color-success);
}

.stat-item h3 {
  margin: 0 0 0.5rem 0;
  color: var(--ion-color-primary);
  font-size: 1.8rem;
  font-weight: 500;
}

.profit-stat h3 {
  color: var(--ion-color-success);
}

.stat-item p {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
  font-weight: 300;
}

.sales-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sale-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.sale-info h4 {
  margin: 0 0 0.25rem 0;
  color: var(--ion-color-dark);
  font-weight: 500;
}

.sale-info p {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
  font-weight: 300;
}

.sale-amounts {
  display: flex;
  gap: 1rem;
  text-align: right;
}

.sale-amount,
.sale-profit {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.sale-amount strong {
  color: var(--ion-color-primary);
  font-size: 1.1rem;
}

.sale-profit strong {
  color: var(--ion-color-success);
  font-size: 1.1rem;
}

.amount-label {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  font-weight: 300;
}

.products-report {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-report-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.product-info h4 {
  margin: 0 0 0.25rem 0;
  color: var(--ion-color-dark);
  font-weight: 500;
}

.product-info p {
  margin: 0 0 0.5rem 0;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
  font-weight: 300;
}

.product-pricing {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cost-price,
.selling-price,
.profit-per-unit {
  font-size: 0.85rem;
  font-weight: 400;
}

.cost-price {
  color: var(--ion-color-warning);
}

.selling-price {
  color: var(--ion-color-primary);
}

.profit-per-unit.positive {
  color: var(--ion-color-success);
}

.profit-per-unit.negative {
  color: var(--ion-color-danger);
}

.product-stats {
  display: flex;
  gap: 2rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--ion-color-primary);
}

.profit-stat .stat-value {
  color: var(--ion-color-success);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  margin-top: 0.25rem;
  font-weight: 300;
}

.no-data-container {
  text-align: center;
  padding: 3rem;
  color: var(--ion-color-medium);
}

.no-data-container ion-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-data-container h3 {
  color: var(--ion-color-dark);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--ion-color-medium);
}

@media (max-width: 768px) {
  .month-selector {
    grid-template-columns: 1fr;
  }

  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .product-report-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .product-stats {
    align-self: stretch;
    justify-content: space-around;
  }

  .sale-amounts {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
