document.addEventListener('alpine:init', () => {
  // Data produk unggulan
  Alpine.data('products', () => ({
    items: [
      { id: 1, name: 'Robusta Gayo', img: '1.jpg', price: 20000 },
      { id: 2, name: 'Arabica Blend', img: '2.jpg', price: 25000 },
      { id: 3, name: 'Primo Passo', img: '3.jpg', price: 30000 },
      { id: 4, name: 'Aceh Gayo', img: '4.jpg', price: 35000 },
      { id: 5, name: 'Sumatra Mandheling', img: '5.jpg', price: 40000 },
    ],
  }));

  // Store keranjang belanja
  Alpine.store('cart', {
    items: [],
    total: 0,
    quantity: 0,

    add(newItem) {
      const cartItem = this.items.find((item) => item.id === newItem.id);

      if (!cartItem) {
        this.items.push({
          ...newItem,
          quantity: 1,
          total: newItem.price,
        });
      } else {
        cartItem.quantity++;
        cartItem.total = cartItem.price * cartItem.quantity;
      }

      this.recalculate();
    },

    remove(id) {
      const cartItem = this.items.find((item) => item.id === id);
      if (!cartItem) return;

      if (cartItem.quantity > 1) {
        cartItem.quantity--;
        cartItem.total = cartItem.price * cartItem.quantity;
      } else {
        this.items = this.items.filter((item) => item.id !== id);
      }

      this.recalculate();
    },

    recalculate() {
      this.quantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
      this.total = this.items.reduce((sum, item) => sum + item.total, 0);
    },
  });
});

// Format Rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number || 0);
};

// Checkout langsung ke WhatsApp (tanpa Midtrans / PHP)
document.addEventListener('DOMContentLoaded', () => {
  const checkoutForm = document.querySelector('#checkout-form');
  const checkoutButton = document.querySelector('#checkout-button');

  if (checkoutButton) {
    checkoutButton.classList.remove('disabled');
    checkoutButton.disabled = false;
  }

  if (!checkoutForm) return;

  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(checkoutForm);
    const data = Object.fromEntries(formData);

    let items = [];
    try {
      items = JSON.parse(data.items || '[]');
    } catch (_) {
      items = [];
    }

    const total = Number(data.total || 0);

    const daftarPesanan = items
      .map((item, idx) => {
        const itemTotal = Number(item.total || Number(item.price || 0) * Number(item.quantity || 1));
        return `${idx + 1}. ${item.name} (${item.quantity}x) - ${rupiah(itemTotal)}`;
      })
      .join('\n');

    const pesan =
      `Halo *Kopi Kenangan Senja*, saya mau pesan:\n\n` +
      `*Data Pembeli:*\n` +
      `Nama: ${data.name}\n` +
      `Email: ${data.email}\n` +
      `No. HP: ${data.phone}\n\n` +
      `*Detail Pesanan:*\n` +
      `${daftarPesanan || '-'}\n\n` +
      `*Total Pembayaran: ${rupiah(total)}*`;

    const nomorWA = '6288905682258';
    const urlWA = `https://wa.me/${nomorWA}?text=${encodeURIComponent(pesan)}`;

    window.open(urlWA, '_blank');
  });
});
