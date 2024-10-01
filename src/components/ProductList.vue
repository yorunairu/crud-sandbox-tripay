<template>
  <div class="product-list">
    <h1 class="title">Product List</h1>
    <ul class="product-grid">
      <li v-for="product in products" :key="product.id" class="product-card">
        <img :src="product.image" alt="Product Image" class="product-image" />
        <div class="product-info">
          <h2 class="product-name">{{ product.name }}</h2>
          <p class="product-price">Rp {{ product.price.toLocaleString() }}</p>
        </div>
        <button class="buy-button" @click="buyProduct(product)">Beli</button>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  name: 'ProductList',
  data() {
    return {
      products: [],
    };
  },
  created() {
    this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      try {
        const response = await axios.get('/data/products.json');
        this.products = response.data;
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    },
    async buyProduct(product) {
      const { value: confirm } = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to buy ${product.name} for Rp ${product.price.toLocaleString()}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, buy it!',
      });

      if (confirm) {
        Swal.fire({
          title: 'Processing...',
          text: 'Please wait while we complete your purchase.',
          allowOutsideClick: false,
          showConfirmButton: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });

        const tripayUrl = '/api/tripay';
        try {
          const response = await axios.post(tripayUrl, { product });
          Swal.close();

          if (response.data.success) {
            Swal.fire({
              title: 'Success!',
              text: 'Your purchase was successful. Your invoice is ready.',
              icon: 'success',
              confirmButtonText: 'OK',
            });
          } else {
            Swal.fire({
              title: 'Error!',
              text: response.data.message || 'Transaction failed.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          }
        } catch (error) {
          alert(error);
          Swal.close();
          Swal.fire({
            title: 'Error!',
            text: 'An error occurred during the transaction. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      }
    },
  },
};
</script>

<style scoped>
.product-list {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  background-color: #f4f4f4;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  list-style: none;
  padding: 0;
}

.product-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.product-info {
  margin-bottom: 10px;
}

.product-name {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
}

.product-price {
  font-size: 1.25rem;
  color: #888;
}

.product-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.buy-button {
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.buy-button:hover {
  background-color: #45a049;
}
</style>
