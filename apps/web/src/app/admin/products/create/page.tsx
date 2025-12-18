import ProductForm from "@/components/Admin/Products/ProductForm";
import styles from "../../admin.module.scss";

export default function CreateProductPage() {
  return (
    <div>
      <header className={styles["admin-header"]}>
        <h1 className={styles["admin-header__title"]}>Create New Product</h1>
      </header>

      <div className={styles["admin-content"]}>
        <ProductForm />
      </div>
    </div>
  );
}
