<template>
  <div class="invoices-list">
    <div class="row">
      <div class="col-md-8">
        <div class="invoice-section">
          <h2>Invoices</h2>
          <ul class="invoice-grid">
            <li v-for="invoice in sortedInvoices" :key="invoice.id" class="invoice-card">
              <div class="invoice-details">
                <p><strong>Reference:</strong> {{ invoice.tripay_reference }}</p>
                <p><strong>Status:</strong> {{ invoice.status || 'UNPAID' }}</p>
                <p><strong>Buyer Email:</strong> {{ invoice.buyer_email }}</p>
                <p><strong>Buyer Phone:</strong> {{ invoice.buyer_phone }}</p>
                <p><strong>Amount:</strong> Rp {{ invoice.amount ? invoice.amount.toLocaleString() : '0' }}</p>
                <p><strong>Product:</strong> {{ invoice.product_name }}</p>
                <p><strong>Purchased At:</strong> {{ new Date(invoice.created_at).toLocaleString() }}</p>
                <a :href="'https://tripay.co.id/checkout/' + invoice.tripay_reference" target="_blank" class="btn btn-info">Checkout Link</a>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="col-md-4">
        <h2>Catatan</h2>
        <div class="custom-content card">
          <p>
            Mohon maaf saya menggunakan data json untuk store data agar lebih cepat dan deployable di vercel. Project ini versi simple tanpa styling, delete data, atau memanfaatkan api tripay lain seperti kalkulasi biaya. Kalau ada yang kurang terkait testnya bisa saya tambahkan disini.
          </p>
          <p>Whatsapp : <a href="wa.me/6285179918528">Lian / Yulianto Tri</a></p>
          <p>Github : <a href="https://github.com/yorunairu/crud-sandbox-tripay">Yoru Nairu</a></p>
          <p>Email : <a href="yorunairu@gmail.com">yorunairu@gmail.com</a></p>
          <small>untuk running dev, menggunakan vercel. karena saat npm run dev (local) atau di vercel prod deployment error CORS</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  name: 'InvoiceList',
  data() {
    return {
      invoices: [],
    };
  },
  created() {
    this.fetchInvoices();
  },
  computed: {
    sortedInvoices() {
      return [...this.invoices].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
  },
  methods: {
    async fetchInvoices() {
      try {
        const response = await axios.get('/data/invoices.json');
        this.invoices = response.data;
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    },
    async deleteAllInvoices() {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This will delete all invoices permanently!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete all!'
      });

      if (result.isConfirmed) {
        try {
          await axios.delete('/api/tripay/all');
          this.invoices = [];
          Swal.fire('Deleted!', 'All invoices have been deleted.', 'success');
        } catch (error) {
          console.error('Error deleting invoices:', error);
          Swal.fire('Error!', 'There was a problem deleting the invoices.', 'error');
        }
      }
    },
    addInvoice(newInvoice) {
      this.invoices.push(newInvoice);
    },
    async removeInvoice(id) {
      try {
        await axios.delete('/api/tripay', { data: { id } });
        this.invoices = this.invoices.filter(invoice => invoice.id !== id);
      } catch (error) {
        console.error('Error removing invoice:', error);
      }
    },
  },
};
</script>

<style scoped>
.invoices-list {
  margin: 20px auto;
  padding: 15px;
  background-color: #f4f4f4;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #333;
}

.invoice-section {
  margin-bottom: 20px;
}

ul.invoice-grid {
  list-style: none;
  padding: 0;
}

li.invoice-card {
  margin: 10px 0;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
  transition: box-shadow 0.3s ease;
}

li.invoice-card:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.invoice-details {
  margin-bottom: 10px;
}

.btn {
  margin-top: 10px;
}

.custom-content {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
</style>
