import ProductList from "@/components/Admin/Products/ProductList";
import styles from "../admin.module.scss";

export default function ProductsPage() {
  return (
    <div>
      <header className={styles["admin-header"]}>
        <h1 className={styles["admin-header__title"]}>Products</h1>
      </header>

      <div className={styles["admin-content"]}>
        <ProductList />
      </div>
    </div>
  );
}
