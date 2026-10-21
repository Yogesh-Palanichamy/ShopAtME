import Cart from "./components/Cart";
import { useEffect, useState } from "react";
import "./App.css";

const ITEMS_PER_PAGE = 12;

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cart
  const [cart, setCart] = useState([]);
  const [currentView, setCurrentView] = useState("home");

  // Search and filters
  const [search, setSearch] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(
          "https://dummyjson.com/products?limit=0"
        );

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Get unique categories from the loaded products
  const categories = [
    ...new Set(products.map((product) => product.category)),
  ].sort((a, b) => a.localeCompare(b));

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(search.toLowerCase().trim());

    const matchesLetter =
      selectedLetter === "ALL" ||
      product.title.toUpperCase().startsWith(selectedLetter);

    const matchesCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory;

    const matchesMinPrice =
      minPrice === "" || product.price >= Number(minPrice);

    const matchesMaxPrice =
      maxPrice === "" || product.price <= Number(maxPrice);

    return (
      matchesSearch &&
      matchesLetter &&
      matchesCategory &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOrder) {
      case "az":
        return a.title.localeCompare(b.title);

      case "za":
        return b.title.localeCompare(a.title);

      case "low-high":
        return a.price - b.price;

      case "high-low":
        return b.price - a.price;

      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(
    sortedProducts.length / ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage((page) =>
      Math.min(page, Math.max(1, totalPages))
    );
  }, [totalPages]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentProducts = sortedProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Add product to cart
  function addToCart(product) {
    setCart((previousCart) => {
      const existingItem = previousCart.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return previousCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previousCart, { ...product, quantity: 1 }];
    });
  }

  // Update cart quantity
  function updateQuantity(productId, quantity) {
    if (quantity < 1) return;

    setCart((previousCart) =>
      previousCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }

  // Remove product from cart
  function removeFromCart(productId) {
    setCart((previousCart) =>
      previousCart.filter((item) => item.id !== productId)
    );
  }

  // Reset all filters
  function resetFilters() {
    setSearch("");
    setSelectedLetter("ALL");
    setSelectedCategory("all");
    setSortOrder("default");
    setMinPrice("");
    setMaxPrice("");
    setCurrentPage(1);
  }

  // Loading and error states
  if (loading) {
    return <h2 className="message">Loading products...</h2>;
  }

  if (error) {
    return (
      <div className="message">
        <h2>Error: {error}</h2>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  // Cart page
  if (currentView === "cart") {
    return (
      <>
        <header className="navbar">
          <h1>ShopAtME</h1>
          <span>My Shopping Cart</span>
          <button
            className="header-cart-button"
            onClick={() => setCurrentView("home")}
          >
            Continue Shopping
          </button>
        </header>

        <Cart
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onBack={() => setCurrentView("home")}
        />
      </>
    );
  }

  // Main products page
  return (
    <div className="app">
      <header className="navbar">
        <h1 style={{ color: "blue" }}>ShopAtME</h1>
        <span>Discover your favourite products</span>

        <button
          className="header-cart-button"
          onClick={() => setCurrentView("cart")}
        >
          🛒 Cart (
          {cart.reduce((total, item) => total + item.quantity, 0)})
        </button>
      </header>

      <main className="container">
        <h2>All Products</h2>

        {/* Search and sorting */}
        <div className="toolbar">
          <input
            className="search-input"
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          <select
            className="sort-select"
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="default">Default order</option>
            <option value="az">Name: A to Z</option>
            <option value="za">Name: Z to A</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>

        {/* Category classification */}
        <section className="category-filter">
          <h3>Shop by Category</h3>

          <select
            className="sort-select category-select"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category
                  .split("-")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1)
                  )
                  .join(" ")}
              </option>
            ))}
          </select>
        </section>

<section className="price-filter">
  <h3>Filter by Price ($)</h3>
  <div className="price-radio-options">
    <label>
      <input
        type="radio"
        name="priceRange"
        checked={minPrice === "" && maxPrice === ""}
        onChange={() => {
          setMinPrice("");
          setMaxPrice("");
          setCurrentPage(1);
        }}
      />
      All Prices
    </label>

    <label>
      <input
        type="radio"
        name="priceRange"
        checked={minPrice === "0" && maxPrice === "99"}
        onChange={() => {
          setMinPrice("0");
          setMaxPrice("99");
          setCurrentPage(1);
        }}
      />
      $0 – $99
    </label>

    <label>
      <input
        type="radio"
        name="priceRange"
        checked={minPrice === "100" && maxPrice === "500"}
        onChange={() => {
          setMinPrice("100");
          setMaxPrice("500");
          setCurrentPage(1);
        }}
      />
      $100 – $500
    </label>

    <label>
      <input
        type="radio"
        name="priceRange"
        checked={minPrice === "501" && maxPrice === "1000"}
        onChange={() => {
          setMinPrice("501");
          setMaxPrice("1000");
          setCurrentPage(1);
        }}
      />
      $501 – $1,000
    </label>

    <label>
      <input
        type="radio"
        name="priceRange"
        checked={minPrice === "1001" && maxPrice === "5000"}
        onChange={() => {
          setMinPrice("1001");
          setMaxPrice("5000");
          setCurrentPage(1);
        }}
      />
      $1,001 – $5,000
    </label>

    <label>
      <input
        type="radio"
        name="priceRange"
        checked={minPrice === "5001" && maxPrice === "10000"}
        onChange={() => {
          setMinPrice("5001");
          setMaxPrice("10000");
          setCurrentPage(1);
        }}
      />
      $5,001 – $10,000
    </label>

    <label>
      <input
        type="radio"
        name="priceRange"
        checked={minPrice === "10001" && maxPrice === "999999"}
        onChange={() => {
          setMinPrice("10001");
          setMaxPrice("999999");
          setCurrentPage(1);
        }}
      />
      $10,001 and above
    </label>
  </div>

  <button className="reset-button" onClick={resetFilters}>
    Reset All
  </button>
</section>

        {/* Product count */}
        <p className="product-count">
          Showing{" "}
          {sortedProducts.length === 0 ? 0 : startIndex + 1}
          {"–"}
          {Math.min(
            startIndex + ITEMS_PER_PAGE,
            sortedProducts.length
          )}
          {" of "}
          {sortedProducts.length} products
        </p>

        {/* Product grid */}
        {currentProducts.length === 0 ? (
          <p className="message">
            No products found. Try changing your filters.
          </p>
        ) : (
          <div className="product-grid">
            {currentProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="product-image"
                />

                <div className="product-info">
                  <h3>{product.title}</h3>

                  <p className="category">
                    {product.category
                      .split("-")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </p>

                  <p className="rating">⭐ {product.rating}</p>

                  <p className="price">
                    ${product.price.toFixed(2)}
                  </p>

                  <button
                    className="cart-button"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="pagination" aria-label="Product pages">
            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) => page - 1)
              }
            >
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                key={page}
                className={
                  currentPage === page ? "active-page" : ""
                }
                aria-current={
                  currentPage === page ? "page" : undefined
                }
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => page + 1)
              }
            >
              Next
            </button>
          </nav>
        )}
      </main>
    </div>
  );
}

export default App;