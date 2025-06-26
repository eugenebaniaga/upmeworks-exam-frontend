<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="login-container">
        <div class="login-header">
          <h1>Simply POS</h1>
          <p>Sign in to your account</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <ion-item>
            <ion-label position="stacked">Email</ion-label>
            <ion-input
              v-model="email"
              type="email"
              required
              placeholder="Enter your email"
            />
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Password</ion-label>
            <ion-input
              v-model="password"
              type="password"
              required
              placeholder="Enter your password"
            />
          </ion-item>

          <ion-button
            expand="block"
            type="submit"
            :disabled="loading"
            class="login-button"
          >
            <ion-spinner v-if="loading" name="crescent" />
            <span v-else>Sign In</span>
          </ion-button>

          <p class="register-link">
            Don't have an account?
            <ion-button fill="clear" @click="$router.push('/register')">
              Register here
            </ion-button>
          </p>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  IonPage,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSpinner,
  alertController,
} from "@ionic/vue";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;

  const result = await authStore.login(email.value, password.value);

  if (result.success) {
    router.push("/dashboard");
  } else {
    const alert = await alertController.create({
      header: "Login Failed",
      message: result.error,
      buttons: ["OK"],
    });
    await alert.present();
  }

  loading.value = false;
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem 0;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: var(--ion-color-primary);
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 300;
}

.login-header p {
  color: var(--ion-color-medium);
  font-size: 1.1rem;
  font-weight: 300;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-button {
  margin-top: 1rem;
  height: 50px;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
}

.register-link {
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  color: var(--ion-color-medium);
  margin: 0;
}
</style>
