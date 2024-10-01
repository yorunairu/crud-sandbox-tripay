const axios = require('axios');
const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
  const invoicesPath = path.join(process.cwd(), 'public/data/invoices.json');

  if (req.method === 'POST') {
    const { product } = req.body;

    const apiKey = 'DEV-kLqIybgYpiGzq1b9Hc3Nao42sNoM6QD5D8F5MrOZ';
    const privateKey = 'dflsR-5a84i-1VSh5-QwzzL-nSeSF';
    const merchant_code = 'T23062';
    const merchant_ref = product.reference;
    const amount = product.price;
    const expiry = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
    const signature = CryptoJS.HmacSHA256(merchant_code + merchant_ref + amount, privateKey).toString(CryptoJS.enc.Hex);

    const data = {
      method: 'BRIVA',
      merchant_ref,
      amount,
      customer_name: 'Nama Pelanggan',
      customer_email: 'emailpelanggan@domain.com',
      customer_phone: '081234567890',
      order_items: [
        {
          sku: product.sku,
          name: product.name,
          price: product.price,
          quantity: 1,
          product_url: 'https://tokokamu.com/product/' + product.sku,
          image_url: 'https://tokokamu.com/product/' + product.sku + '.jpg',
        },
      ],
      return_url: 'https://domainanda.com/redirect',
      expired_time: expiry,
      signature: signature,
    };

    try {
      const response = await axios.post('https://tripay.co.id/api-sandbox/transaction/create', data, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const invoiceData = response.data.data;

      let existingInvoices = [];
      if (fs.existsSync(invoicesPath)) {
        const fileContent = fs.readFileSync(invoicesPath, 'utf8');
        existingInvoices = JSON.parse(fileContent);
      }

      const nextId = existingInvoices.length ? Math.max(existingInvoices.map(inv => inv.id)) + 1 : 1;

      const newInvoice = {
        id: nextId,
        product_id: product.id,
        product_name: product.name,
        tripay_reference: invoiceData.reference,
        buyer_email: 'emailpelanggan@domain.com',
        buyer_phone: '081234567890',
        status: invoiceData.status,
        amount: invoiceData.amount,
        created_at: new Date().toISOString(),
        raw_response: JSON.stringify(invoiceData),
      };

      existingInvoices.push(newInvoice);
      fs.writeFileSync(invoicesPath, JSON.stringify(existingInvoices, null, 2));

      res.status(200).json({ success: true, invoice: newInvoice });
    } catch (error) {
      console.error('Error while processing the API request:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    const { id, deleteAll } = req.body;

    if (deleteAll) {
      fs.writeFileSync(invoicesPath, JSON.stringify([]));
      res.status(200).json({ success: true, message: 'All invoices deleted successfully' });
      return;
    }

    if (fs.existsSync(invoicesPath)) {
      const fileContent = fs.readFileSync(invoicesPath, 'utf8');
      let existingInvoices = JSON.parse(fileContent);

      const filteredInvoices = existingInvoices.filter(invoice => invoice.id !== id);

      fs.writeFileSync(invoicesPath, JSON.stringify(filteredInvoices, null, 2));

      res.status(200).json({ success: true, message: 'Invoice removed successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Invoices not found' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
