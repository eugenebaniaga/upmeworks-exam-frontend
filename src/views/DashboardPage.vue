<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="logout" fill="clear">
            <ion-icon :icon="logOutOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card class="ion-padding ion-no-margin">
        <div class="wrapper-welcome">
          <ion-icon
            color="primary"
            size="large"
            :icon="personCircleOutline"
          ></ion-icon>
          <h4>Hi {{ authStore.user?.fullName }}</h4>
        </div>

        <div class="wrapper-stats-header">
          <div class="wrapper-stats">
            <p class="title">Php {{ totalRevenue.toFixed(2) }}</p>
            <p>REVENUE</p>
          </div>

          <div class="wrapper-stats">
            <p class="title">{{ totalProducts }}</p>
            <p>PRODUCTS</p>
          </div>

          <div class="wrapper-stats">
            <p class="title">{{ totalSales }}</p>
            <p>SALES</p>
          </div>
        </div>
      </ion-card>

      <div class="divider">
        TODAY
        <ion-label>{{ today }}</ion-label>
      </div>

      <div class="stats-grid">
        <ion-card class="stat-card">
          <ion-card-content>
            <div class="stat-content">
              <ion-icon :icon="trendingUpOutline" class="stat-icon" />
              <div class="stat-info">
                <h3>₱ {{ todayRevenue.toFixed(2) }}</h3>
                <p>Today's Revenue</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card class="stat-card profit-card">
          <ion-card-content>
            <div class="stat-content">
              <ion-icon :icon="analyticsOutline" class="stat-icon" />
              <div class="stat-info">
                <h3>₱ {{ todayProfit.toFixed(2) }}</h3>
                <p>Today's Profit</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <div class="divider">LOW IN STOCK</div>
      <div v-for="product in lowStockList">
        <ion-grid>
          <ion-row class="ion-align-items-center ion-justify-content-between">
            <ion-col>
              <ion-label>{{ product.name }}</ion-label>
            </ion-col>
            <ion-col class="ion-text-right" size="auto">
              <ion-label color="warning">{{ product.stockQuantity }}</ion-label>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
      <div class="wrapper-lowstock" v-if="!lowStockList.length">
        No Low Quantity Products
      </div>
    </ion-content>

    <ion-tab-bar slot="bottom">
      <ion-tab-button
        tab="dashboard"
        @click="$router.push('/dashboard')"
        class="tab-selected"
      >
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

      <ion-tab-button tab="reports" @click="$router.push('/reports')">
        <ion-icon :icon="barChartOutline" />
        <ion-label>Reports</ion-label>
      </ion-tab-button>
    </ion-tab-bar>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useProductsStore } from "@/stores/products";
import { useSalesStore } from "@/stores/sales";
import { reportsApi } from "@/services/api";
import { useRoute } from "vue-router";
import { format } from "date-fns";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
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
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const productsStore = useProductsStore();
const salesStore = useSalesStore();
const now = new Date();
const today = ref<any>(format(now, "MMM dd yyyy, EEE"));
const dashboardStats = ref<any>({});

const totalProducts = computed(() => productsStore.products.length);
const totalSales = computed(() => salesStore.sales.length);
const totalRevenue = computed(() =>
  salesStore.sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
);
const todayRevenue = computed(() => dashboardStats.value.todayRevenue || 0);
const todayProfit = computed(() => dashboardStats.value.todayProfit || 0);
const monthlyProfit = computed(() => dashboardStats.value.monthlyProfit || 0);
const lowStockList = computed(() => dashboardStats.value.lowStockList || []);
const logout = () => {
  authStore.logout();
  router.push("/login");
};

const fetchDashboardStats = async () => {
  try {
    const stats = await reportsApi.getDashboardStats();
    dashboardStats.value = stats;
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);

    dashboardStats.value = {
      todayRevenue: 0,
      todayProfit: 0,
      monthlyProfit: 0,
    };
  }
};

const reloadDashboard = async () => {
  await Promise.all([
    productsStore.fetchProducts(),
    salesStore.fetchSales(),
    fetchDashboardStats(),
  ]);
};

/*
DEBUG: CHECK KUNG NARECIEVE YUNG ROUTE
*/
watch(
  () => route.fullPath,
  async () => {
    if (route.path === "/dashboard") await reloadDashboard();
  },
);

onMounted(reloadDashboard);
</script>

<style scoped>
.wrapper-lowstock {
  color: var(--ion-color-medium);
}
.wrapper-welcome {
  display: flex;
  text-align: center;
  align-items: center;
  gap: 10px;
}
.wrapper-welcome p {
  padding: 0;
  margin: 0;
}

.wrapper-stats-header {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.wrapper-stats {
  margin: 0.5rem;
}

.wrapper-stats > .title {
  color: var(--ion-color-dark);
  font-size: 1rem;
  font-weight: bold;
}

.wrapper-stats p {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 0.7rem;
  font-weight: 300;
}

.divider {
  margin-top: 1rem;
  margin-bottom: 0.8rem;
  color: var(--ion-color-medium);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  margin: 0;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.profit-card {
  border-left: 4px solid var(--ion-color-success);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2.5rem;
  color: var(--ion-color-primary);
  opacity: 0.8;
}

.profit-card .stat-icon {
  color: var(--ion-color-success);
}

.stat-info h3 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--ion-color-dark);
  font-weight: 500;
}

.stat-info p {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 0.875rem;
  font-weight: 300;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .stat-icon {
    font-size: 2rem;
  }
}
</style>
