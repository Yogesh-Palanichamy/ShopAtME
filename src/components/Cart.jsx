
import "./Cart.css";

function Cart({ cart, onUpdateQuantity, onRemove, onBack }) {
  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <main className="cart-container">
      <button className="back-button" onClick={onBack}>
        ← Continue Shopping
      </button>

      <h2>My Shopping Cart</h2>
      <p>{totalItems} item(s) in your cart</p>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <h3>Your cart is empty 🛒</h3>
          <p>Add some products from the Home page.</p>
          <button onClick={onBack}>Shop Now</button>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-items">
            {cart.map((item) => (
              <article className="cart-item" key={item.id}>
                <img src={item.thumbnail} alt={item.title} />

                <div className="cart-item-info">
                  <h3>{item.title}</h3>
                  <p>${item.price.toFixed(2)} each</p>

                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      aria-label={`Decrease ${item.title} quantity`}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity + 1)
                      }
                      aria-label={`Increase ${item.title} quantity`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="remove-button"
                    onClick={() => onRemove(item.id)}
                  >
                    Remove
                  </button>
                </div>

                <strong>
                  ${(item.price * item.quantity).toFixed(2)}
                </strong>
              </article>
            ))}
          </section>

          <aside className="cart-summary">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>Total items</span>
              <span>{totalItems}</span>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>

            <div className="summary-row total-row">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>

            <button
              className="checkout-button"
              onClick={() =>
                alert("Checkout will be added in a future step!")
              }
            >
              Proceed to Checkout
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Cart;
