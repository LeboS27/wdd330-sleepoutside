import { getLocalStorage, setLocalStorage, alertMessage } from "./utils.mjs";

function packageItems(items) {
  return items.map((item) => ({
    id: item.Id,
    name: item.Name,
    price: item.FinalPrice,
    quantity: 1,
  }));
}

function formDataToJSON(formElement) {
  const formData = new FormData(formElement);
  const convertedJSON = {};
  formData.forEach(function (value, key) {
    convertedJSON[key] = value;
  });
  return convertedJSON;
}

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
  }

  init() {
    this.list = getLocalStorage(this.key);
    this.calculateItemSubTotal();
  }

  calculateItemSubTotal() {
    if (!this.list || this.list.length === 0) {
      this.itemTotal = 0;
    } else {
      this.itemTotal = this.list.reduce((sum, item) => sum + item.FinalPrice, 0);
    }

    // Display item count and subtotal
    const itemCountEl = document.querySelector(`${this.outputSelector} #item-count`);
    const subtotalEl = document.querySelector(`${this.outputSelector} #subtotal`);
    if (itemCountEl) {
      itemCountEl.textContent = this.list ? this.list.length : 0;
    }
    if (subtotalEl) {
      subtotalEl.textContent = `$${this.itemTotal.toFixed(2)}`;
    }
  }

  calculateOrderTotal() {
    // Tax: 6% on subtotal
    this.tax = this.itemTotal * 0.06;
    // Shipping: $10 for first item + $2 for each additional
    const itemCount = this.list ? this.list.length : 0;
    if (itemCount === 0) {
      this.shipping = 0;
    } else {
      this.shipping = 10 + (itemCount - 1) * 2;
    }
    this.orderTotal = this.itemTotal + this.tax + this.shipping;

    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const output = document.querySelector(this.outputSelector);
    const tax = output.querySelector("#tax");
    const shipping = output.querySelector("#shipping");
    const orderTotal = output.querySelector("#order-total");

    if (tax) tax.textContent = `$${this.tax.toFixed(2)}`;
    if (shipping) shipping.textContent = `$${this.shipping.toFixed(2)}`;
    if (orderTotal) orderTotal.textContent = `$${this.orderTotal.toFixed(2)}`;
  }

  async checkout(form) {
    const formData = formDataToJSON(form);

    // Add calculated order fields
    formData.orderDate = new Date().toISOString();
    formData.orderTotal = this.orderTotal.toFixed(2);
    formData.tax = this.tax.toFixed(2);
    formData.shipping = this.shipping;
    formData.items = packageItems(this.list);

    try {
      // Dynamic import to avoid circular deps at top level
      const { default: ExternalServices } = await import("./ExternalServices.mjs");
      const services = new ExternalServices();
      await services.checkout(formData);

      // Success: clear cart and redirect
      setLocalStorage(this.key, []);
      window.location.assign("/checkout/success.html");
    } catch (err) {
      // Remove any existing alerts
      document.querySelectorAll(".alert").forEach((el) => el.remove());

      if (err.name === "servicesError") {
        const messages = err.message;
        if (Array.isArray(messages)) {
          messages.forEach((msg) => alertMessage(msg.message || JSON.stringify(msg)));
        } else {
          alertMessage(JSON.stringify(messages));
        }
      } else {
        alertMessage(err.message || "An error occurred during checkout.");
      }
    }
  }
}
