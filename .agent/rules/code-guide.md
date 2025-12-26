---
trigger: always_on
---

# Coding Rules for AI Agents - King Neon Project

> **Mục đích:** Tài liệu này chứa các quy tắc bắt buộc mà AI Agent phải tuân thủ khi làm việc với dự án King Neon.

---

## 1. Quy Tắc Chung

### 1.1 Trước Khi Code

- [ ] Kiểm tra các file liên quan đã tồn tại trong codebase.
- [ ] Xác định component/module sẽ bị ảnh hưởng.

### 1.2 Đồng Bộ Với Codebase

- Tuân thủ naming convention đã có trong dự án.
- Sử dụng lại các utility, hook, component đã tồn tại thay vì tạo mới.
- Giữ consistency về styling (SCSS Modules, CSS Variables, Glassmorphism).

---

## 2. Frontend/UI Rules

### 2.1 Loading States ⏳

> [!IMPORTANT]
> Mọi phần UI có fetch data PHẢI có loading state.

```typescript
// ✅ Đúng
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage message={error} />;

// ❌ Sai - Không có loading state
const data = await fetchData(); // User thấy blank screen
```

**Checklist:**

- [ ] Có skeleton/spinner khi đang load data
- [ ] Có loading state khi submit form
- [ ] Button disabled trong khi đang submit
- [ ] Hiển thị trạng thái "đang xử lý" cho các action bất đồng bộ

### 2.2 Error Handling & Toast 🍞

> [!IMPORTANT]  
> Mọi API call PHẢI có error handling và thông báo cho user.

```typescript
// ✅ Đúng
try {
  await api.post("/orders", data);
  toast.success("Đặt hàng thành công!");
} catch (error) {
  toast.error(getErrorMessage(error));
  console.error("[Orders]", error);
}

// ❌ Sai - Lỗi silent
await api.post("/orders", data);
```

**Checklist:**

- [ ] Hiển thị toast success khi action thành công
- [ ] Hiển thị toast error với message có ý nghĩa
- [ ] Log error ra console với context rõ ràng
- [ ] Không để lỗi silent failure

### 2.3 Search & Filter - Debounce/Abort 🔍

> [!CAUTION]
> Search/Filter PHẢI có debounce và abort controller để tránh race condition.

```typescript
// ✅ Đúng
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebounce(searchTerm, 300);

useEffect(() => {
  const controller = new AbortController();

  const fetchResults = async () => {
    try {
      const data = await api.get("/search", {
        params: { q: debouncedSearch },
        signal: controller.signal,
      });
      setResults(data);
    } catch (error) {
      if (!axios.isCancel(error)) {
        toast.error("Lỗi tìm kiếm");
      }
    }
  };

  if (debouncedSearch) fetchResults();

  return () => controller.abort();
}, [debouncedSearch]);

// ❌ Sai - Không debounce, không abort
useEffect(() => {
  api.get("/search", { params: { q: searchTerm } }).then(setResults);
}, [searchTerm]); // Race condition!
```

**Checklist:**

- [ ] Sử dụng `useDebounce` hook (300-500ms)
- [ ] Sử dụng `AbortController` để cancel request cũ
- [ ] Không gọi API khi search term rỗng (nếu applicable)
- [ ] Hiển thị loading state khi đang search

### 2.4 UI Consistency 🎨

```scss
// Sử dụng CSS variables có sẵn
.component {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  color: var(--color-text);
}
```

**Checklist:**

- [ ] Sử dụng CSS variables từ `_variables.scss`
- [ ] Tuân thủ design system (spacing, colors, typography)
- [ ] Consistency với các component tương tự đã có
- [ ] Responsive design (mobile-first)
- [ ] Hover/focus states cho interactive elements

### 2.5 UX Best Practices

- [ ] Form validation với feedback real-time
- [ ] Confirmation dialog cho destructive actions (delete, cancel order)
- [ ] Breadcrumb hoặc back navigation cho nested pages
- [ ] Empty state với CTA rõ ràng
- [ ] Optimistic UI updates khi phù hợp
- [ ] Keyboard accessibility (Tab, Enter, Escape)

### 2.6 SEO (apps/web only) 🌐

> [!IMPORTANT]
> Mọi page trong `apps/web` PHẢI tối ưu SEO.

```typescript
// ✅ Đúng - Export metadata
export const metadata: Metadata = {
  title: "Custom Neon Signs | King Neon",
  description: "Design your own LED neon sign with our configurator...",
  openGraph: {
    title: "Custom Neon Signs | King Neon",
    description: "...",
    images: ["/og-image.jpg"],
  },
};

// Dynamic metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  return {
    title: `${product.name} | King Neon`,
    description: product.description,
  };
}
```

**SEO Checklist:**

- [ ] Unique title tag cho mỗi page
- [ ] Meta description có nội dung meaningful
- [ ] Open Graph tags cho social sharing
- [ ] Semantic HTML (h1, h2, nav, main, article)
- [ ] Alt text cho images
- [ ] Structured data (JSON-LD) cho products

### 2.7 Internationalization - i18n (apps/web và apps/admin) 🌍

> [!IMPORTANT]
> Mọi text hiển thị cho user trong `apps/web` và `apps/admin` PHẢI hỗ trợ đa ngôn ngữ.

---

## 3. Backend/API Rules

### 3.1 Security - Input Validation 🔒

> [!CAUTION]
> KHÔNG BAO GIỜ trust input từ client!

```typescript
// ✅ Đúng - Validation với class-validator
export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

// Controller sử dụng ValidationPipe
@Post()
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
async create(@Body() dto: CreateOrderDto) {}
```

**Input Validation Checklist:**

- [ ] Sử dụng `class-validator` decorators cho tất cả DTOs
- [ ] `whitelist: true` để strip unknown properties
- [ ] `forbidNonWhitelisted: true` để reject unknown properties
- [ ] Validate types, ranges, formats (email, UUID, etc.)
- [ ] Sanitize string inputs (trim, escape HTML nếu cần)

### 3.2 Security - Authorization & Access Control 🛡️

> [!CAUTION]
> Kiểm tra quyền truy cập cho TẤT CẢ endpoints!

```typescript
// ✅ Đúng - Kiểm tra ownership
@Get(':id')
@UseGuards(JwtAuthGuard)
async findOne(@Param('id') id: string, @CurrentUser() user: User) {
  const order = await this.ordersService.findOne(id);

  // IDOR Prevention: Verify ownership
  if (order.userId !== user.id && user.role !== UserRole.ADMIN) {
    throw new ForbiddenException('Access denied');
  }

  return order;
}

// ✅ Đúng - Role-based guard
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
async create(@Body() dto: CreateProductDto) {}
```

**Authorization Checklist:**

- [ ] Authenticate: `@UseGuards(JwtAuthGuard)`
- [ ] Authorize: `@Roles()` decorator cho admin endpoints
- [ ] IDOR Prevention: Verify resource ownership
- [ ] Không expose sensitive data trong responses

### 3.3 API Response Consistency

```typescript
// Success Response
{
  "data": { ... },
  "message": "Order created successfully"
}

// Error Response (sử dụng ErrorCode enum)
{
  "statusCode": 400,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": { ... }
}
```

### 3.4 Error Tracing & Logging 📝

> [!IMPORTANT]
> Mọi error PHẢI dễ trace trong production.

```typescript
// ✅ Đúng - Structured logging
this.logger.error("Failed to create order", {
  userId: user.id,
  dto: sanitizeDto(dto), // Remove sensitive data
  error: error.message,
  stack: error.stack,
});

// Throw với context
throw new BadRequestException({
  message: "Invalid product ID",
  code: ErrorCode.INVALID_PRODUCT,
  details: { productId },
});
```

**Logging Checklist:**

- [ ] Log errors với context (userId, requestId, etc.)
- [ ] Không log sensitive data (passwords, tokens)
- [ ] Use appropriate log levels (error, warn, info, debug)
- [ ] Include stack trace cho unexpected errors

### 3.5 Safe Data Operations

```typescript
// ✅ Đúng - Transaction cho multiple operations
async createOrderWithItems(dto: CreateOrderDto) {
  return this.dataSource.transaction(async (manager) => {
    const order = manager.create(Order, { ... });
    await manager.save(order);

    const items = dto.items.map(item =>
      manager.create(OrderItem, { orderId: order.id, ...item })
    );
    await manager.save(items);

    return order;
  });
}
```

**Data Safety Checklist:**

- [ ] Sử dụng transactions cho operations liên quan
- [ ] Soft delete thay vì hard delete (khi applicable)
- [ ] Validate foreign key references tồn tại
- [ ] Handle concurrent updates (optimistic locking nếu cần)

---

## 4. Database Rules

### 4.1 Migration Files 📦

> [!CAUTION]
> Mọi thay đổi schema PHẢI có migration file!

```bash
# Tạo migration
pnpm --filter @king-neon/api migration:generate -- src/migrations/AddOrderNotes

# Cấu trúc migration
export class AddOrderNotes1703000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('orders', new TableColumn({
      name: 'notes',
      type: 'varchar',
      length: '500',
      isNullable: true,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('orders', 'notes');
  }
}
```

**Migration Checklist:**

- [ ] KHÔNG sửa entity mà không tạo migration
- [ ] Migration có cả `up()` và `down()`
- [ ] Test rollback (`down()`) trước khi commit
- [ ] Đặt tên migration mô tả rõ thay đổi

### 4.2 Backward Compatibility 🔄

> [!WARNING]
> Với thay đổi LỚN, phải đảm bảo tương thích ngược!

```typescript
// ❌ Breaking change - Đổi tên column
await queryRunner.renameColumn("users", "name", "full_name");

// ✅ Safe migration - 3 bước
// Step 1: Add new column
await queryRunner.addColumn(
  "users",
  new TableColumn({
    name: "full_name",
    type: "varchar",
    isNullable: true,
  })
);

// Step 2: Copy data (trong migration hoặc script riêng)
await queryRunner.query(`UPDATE users SET full_name = name`);

// Step 3: (After deployment) Remove old column in future migration
```

**Backward Compatibility Checklist:**

- [ ] Additive changes preferred (add column, add table)
- [ ] Với destructive changes, dùng multi-step migration
- [ ] Notify team về breaking changes
- [ ] Update code để handle cả old và new format (nếu cần)
- [ ] Deprecate trước khi remove

### 4.3 Performance Considerations

- [ ] Index cho columns thường query (foreign keys, search fields)
- [ ] Avoid N+1 queries (use `leftJoinAndSelect`)
- [ ] Pagination cho large datasets
- [ ] Consider partial indexes cho conditional queries

---

## 5. Quick Reference

### Do's ✅

- Loading states cho mọi async operation
- Toast notifications cho user feedback
- Debounce + Abort cho search/filter
- Input validation cho mọi API
- Authorization checks cho protected resources
- Migration files cho database changes
- Structured logging với context

### Don'ts ❌

- Silent failures (no error handling)
- Trust client input
- Expose sensitive data in responses
- Direct schema changes without migrations
- Breaking changes without compatibility plan
- Hard-coded values (use env/config)
- Console.log in production code

---

## 6. Pre-Commit Checklist

Trước khi hoàn thành task, AI Agent PHẢI verify:

### Frontend

- [ ] Loading states ✓
- [ ] Error handling với toast ✓
- [ ] Debounce/Abort cho search ✓
- [ ] UI consistency với design system ✓
- [ ] SEO metadata (apps/web) ✓
- [ ] Responsive design ✓

### Backend

- [ ] Input validation với DTOs ✓
- [ ] Authorization guards ✓
- [ ] IDOR prevention ✓
- [ ] Structured error responses ✓
- [ ] Logging với context ✓

### Database

- [ ] Migration file created ✓
- [ ] Rollback tested ✓
- [ ] Backward compatible ✓

---
