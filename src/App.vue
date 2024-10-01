<template>
  <div id="app">
    <ProductList @add-invoice="handleAddInvoice" />
    <InvoiceList ref="invoiceList" />
  </div>
</template>

<script>
import ProductList from './components/ProductList.vue';
import InvoiceList from './components/InvoiceList.vue';

export default {
  components: {
    ProductList,
    InvoiceList,
  },
  methods: {
    handleAddInvoice(newInvoice) {
      this.$refs.invoiceList.addInvoice(newInvoice);
    },
  },
};
</script>
