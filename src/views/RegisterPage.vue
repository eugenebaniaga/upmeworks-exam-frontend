<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="register-container">
        <div class="register-header">
          <h1>Simply POS</h1>
          <p>Create your account</p>
        </div>

        <form @submit.prevent="handleRegister" class="register-form">
          <ion-item>
            <ion-label position="stacked">Full Name</ion-label>
            <ion-input
              v-model="fullName"
              type="text"
              required
              placeholder="Enter your full name"
            />
          </ion-item>

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

          <!-- <ion-item> // NO ROLE FOR NOW

            <ion-label position="stacked">Role</ion-label>
            <ion-select v-model="role" placeholder="Select role">
              <ion-select-option value="ADMIN">Admin</ion-select-option>
              <ion-select-option value="CASHIER">Cashier</ion-select-option>
            </ion-select>
          </ion-item> -->

          <ion-button
            expand="block"
            type="submit"
            :disabled="loading"
            class="register-button"
          >
            <ion-spinner v-if="loading" name="crescent" />
            <span v-else>Register</span>
          </ion-button>

          <p class="login-link">
            Already have an account?
            <ion-button fill="clear" @click="$router.push('/login')">
              Sign in here
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
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSpinner,
  alertController,
} from "@ionic/vue";

const router = useRouter();
const authStore = useAuthStore();

const fullName = ref("");
const email = ref("");
const password = ref("");
const role = ref<"ADMIN" | "CASHIER">("ADMIN"); //default to admin
const loading = ref(false);

const handleRegister = async () => {
  loading.value = true;

  const result = await authStore.register(
    email.value,
    password.value,
    fullName.value,
    role.value,
  );

  if (result.success) {
    router.push("/dashboard");
  } else {
    const alert = await alertController.create({
      header: "Registration Failed",
      message: result.error,
      buttons: ["OK"],
    });
    await alert.present();
  }

  loading.value = false;
};
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem 0;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-header h1 {
  color: var(--ion-color-primary);
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 300;
}

.register-header p {
  color: var(--ion-color-medium);
  font-size: 1.1rem;
  font-weight: 300;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.register-button {
  margin-top: 1rem;
  height: 50px;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
}

.login-link {
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  color: var(--ion-color-medium);
  margin: 0;
}
</style>
