document.addEventListener('alpine:init', () => {
  Alpine.data('products', () => ({
    items: [
      { id: 1, name: 'Robusta Brazil', img: '1.jpg', price: 20000 },
      { id: 2, name: 'Arabica Blend', img: '2.jpg', price: 25000 },
      { id: 3, name: 'Primo Paso', img: '3.jpg', price: 30000 },
      { id: 4, name: 'Aceh Gayo', img: '4.jpg', price: 35000 },
      { id: 5, name: 'Sumatra Mandheling', img: '5.jpg', price: 40000 },
    ],
  }));

  Alpine.store('cart', {
    items: [],
    total: 0,
    quantity: 0,

    add(newItem) {
      const cartItem = this.items.find((item) => item.id === newItem.id);

      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        this.items = this.items.map((item) => {
          if (item.id !== newItem.id) {
            return item;
          } else {
            item.quantity++;
            item.total = item.price * item.quantity;
            this.quantity++;
            this.total += item.price;
            return item;
          }
        });
      }
    },

    remove(id) {
      const cartItem = this.items.find((item) => item.id === id);

      if (cartItem.quantity > 1) {
        this.items = this.items.map((item) => {
          if (item.id !== id) {
            return item;
          } else {
            item.quantity--;
            item.total = item.price * item.quantity;
            this.quantity--;
            this.total -= item.price;
            return item;
          }
        });
      } else if (cartItem.quantity === 1) {
        this.items = this.items.filter((item) => item.id !== id);
        this.quantity--;
        this.total -= cartItem.price;
      }
    },
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const checkoutButton = document.querySelector('#checkout-button');
  const form = document.querySelector('#checkout-form');

  if (checkoutButton) {
    checkoutButton.disabled = true;
  }

  const validateForm = () => {
    if (!form || !checkoutButton) return;
    for (let i = 0; i < form.elements.length; i++) {
      const el = form.elements[i];
      if (el.type === 'hidden' || el.tagName === 'BUTTON') continue;
      if (el.value.trim().length === 0) {
        checkoutButton.classList.add('disabled');
        checkoutButton.disabled = true;
        return;
      }
    }
    checkoutButton.classList.remove('disabled');
    checkoutButton.disabled = false;
  };

  if (form && checkoutButton) {
    form.addEventListener('keyup', validateForm);
    form.addEventListener('input', validateForm);

    const handleCheckout = (e) => {
      e.preventDefault();
      validateForm();
      if (checkoutButton.disabled) return;

      const formData = new FormData(form);
      const data = new URLSearchParams(formData);
      const objData = Object.fromEntries(data);

      const message = formatMessage(objData);
      window.open('https://wa.me/6288905682258?text=' + encodeURIComponent(message), '_blank');
    };

    checkoutButton.addEventListener('click', handleCheckout);
    form.addEventListener('submit', handleCheckout);
  }
});

// Format pesan WhatsApp otomatis sesuai produk yang dibeli
const formatMessage = (obj) => {
  const parsedItems = JSON.parse(obj.items || '[]');
  const daftarProduk = parsedItems
    .map((item) => `- ${item.name} (${item.quantity} x ${rupiah(item.price)} = ${rupiah(item.total)})`)
    .join('\n');

  return `Halo, saya mau beli produk di Kedai Kopi:
${daftarProduk}

Total: ${rupiah(obj.total)}

Data Pembeli:
Nama: ${obj.name}
Email: ${obj.email}
No HP: ${obj.phone}`;
};

// Konversi ke Rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(number) || 0);
};
