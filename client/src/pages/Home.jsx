import ProductCard from "../components/ProductCard";
import products from "../data/products";

function Home() {
  return (
    <div className="products-container">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}

export default Home;