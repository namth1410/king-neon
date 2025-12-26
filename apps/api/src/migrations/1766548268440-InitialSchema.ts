import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1766548268440 implements MigrationInterface {
  name = 'InitialSchema1766548268440';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "icon" character varying, "image" character varying, "sortOrder" integer NOT NULL DEFAULT '0', "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text NOT NULL, "basePrice" numeric(10,2) NOT NULL, "categoryId" uuid, "isCustom" boolean NOT NULL DEFAULT false, "options" jsonb, "active" boolean NOT NULL DEFAULT true, "images" text, "featuredImage" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE ("slug"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "neon_fonts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "fontFileUrl" character varying, "previewUrl" character varying, "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6d8bc35e4bf9dc7f0aa3225e348" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "neon_colors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "hexCode" character varying NOT NULL, "siliconeColor" character varying, "priceModifier" numeric(10,2) NOT NULL DEFAULT '0', "previewUrl" character varying, "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4fb1b960a5aadeb1a043d8e1f55" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "neon_sizes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "widthInches" integer NOT NULL, "maxLetters" integer NOT NULL, "price" numeric(10,2) NOT NULL, "active" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_18f043cb6fddd69e79d4d877b16" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "neon_materials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "priceModifier" numeric(10,2) NOT NULL DEFAULT '0', "isWaterproof" boolean NOT NULL DEFAULT false, "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_610bf04d42b918b99a6b8eeca27" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."neon_backboards_type_enum" AS ENUM('cut-to-shape', 'rectangle', 'acrylic', 'no-backboard')`,
    );
    await queryRunner.query(
      `CREATE TABLE "neon_backboards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."neon_backboards_type_enum" NOT NULL DEFAULT 'cut-to-shape', "name" character varying NOT NULL, "priceModifier" numeric(10,2) NOT NULL DEFAULT '0', "availableColors" text, "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f6ace5313b8512da2421d80b376" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "custom_designs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "textLines" text NOT NULL, "fontId" uuid NOT NULL, "colorId" uuid NOT NULL, "sizeId" uuid NOT NULL, "materialId" uuid NOT NULL, "backboardId" uuid NOT NULL, "backboardColor" character varying, "calculatedPrice" numeric(10,2) NOT NULL, "previewImageUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3283017fc1cdce9a03a8e786a42" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid NOT NULL, "productId" uuid, "customDesignId" uuid, "quantity" integer NOT NULL DEFAULT '1', "unitPrice" numeric(10,2) NOT NULL, "options" jsonb, "productName" character varying, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_paymentstatus_enum" AS ENUM('pending', 'paid', 'failed', 'refunded')`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderNumber" character varying NOT NULL, "userId" uuid NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "subtotal" numeric(10,2) NOT NULL, "shipping" numeric(10,2) NOT NULL DEFAULT '0', "tax" numeric(10,2) NOT NULL DEFAULT '0', "total" numeric(10,2) NOT NULL, "shippingAddress" jsonb NOT NULL, "billingAddress" jsonb, "customerEmail" character varying, "customerName" character varying, "customerPhone" character varying, "stripePaymentIntentId" character varying, "paymentStatus" "public"."orders_paymentstatus_enum" NOT NULL DEFAULT 'pending', "paidAt" TIMESTAMP, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_59b0c3b34ea0fa5562342f24143" UNIQUE ("orderNumber"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."quotes_status_enum" AS ENUM('pending', 'reviewing', 'quoted', 'accepted', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "quotes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "companyName" character varying NOT NULL, "contactName" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying, "requirements" text NOT NULL, "attachments" text, "status" "public"."quotes_status_enum" NOT NULL DEFAULT 'pending', "adminNotes" text, "quotedPrice" numeric(10,2), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "respondedAt" TIMESTAMP, CONSTRAINT "PK_99a0e8bcbcd8719d3a41f23c263" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('customer', 'admin')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "name" character varying NOT NULL, "phone" character varying, "address" jsonb, "role" "public"."users_role_enum" NOT NULL DEFAULT 'customer', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "preview_backgrounds" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "imageKey" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fc2a83633f76c49b9d97d776fdb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "carts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "sessionId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cart_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cartId" uuid NOT NULL, "productId" character varying NOT NULL, "productName" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "image" character varying, "type" character varying NOT NULL DEFAULT 'product', "options" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_designs" ADD CONSTRAINT "FK_94f129e5255a48b2eb861c855e2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_designs" ADD CONSTRAINT "FK_357b1b688da7d710cf1a75e54fb" FOREIGN KEY ("fontId") REFERENCES "neon_fonts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_designs" ADD CONSTRAINT "FK_be1622c4d41c7e20a05acc5afc7" FOREIGN KEY ("colorId") REFERENCES "neon_colors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_designs" ADD CONSTRAINT "FK_7fb69712a8f55c88143258558d5" FOREIGN KEY ("sizeId") REFERENCES "neon_sizes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_designs" ADD CONSTRAINT "FK_2d46ea2dc0c37b16983b0a9057a" FOREIGN KEY ("materialId") REFERENCES "neon_materials"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_designs" ADD CONSTRAINT "FK_c5b3bdb61cef52df2df88ccce54" FOREIGN KEY ("backboardId") REFERENCES "neon_backboards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_a11954b5c9e76413d4253a10363" FOREIGN KEY ("customDesignId") REFERENCES "custom_designs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" ADD CONSTRAINT "FK_8bad8bd49d1dd6954b46366349c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" ADD CONSTRAINT "FK_69828a178f152f157dcf2f70a89" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_edd714311619a5ad09525045838" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_edd714311619a5ad09525045838"`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" DROP CONSTRAINT "FK_69828a178f152f157dcf2f70a89"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" DROP CONSTRAINT "FK_8bad8bd49d1dd6954b46366349c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_a11954b5c9e76413d4253a10363"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_cdb99c05982d5191ac8465ac010"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_designs" DROP CONSTRAINT "FK_c5b3bdb61cef52df2df88ccce54"`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_designs" DROP CONSTRAINT "FK_2d46ea2dc0c37b16983b0a9057a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_designs" DROP CONSTRAINT "FK_7fb69712a8f55c88143258558d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_designs" DROP CONSTRAINT "FK_be1622c4d41c7e20a05acc5afc7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_designs" DROP CONSTRAINT "FK_357b1b688da7d710cf1a75e54fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_designs" DROP CONSTRAINT "FK_94f129e5255a48b2eb861c855e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_ff56834e735fa78a15d0cf21926"`,
    );
    await queryRunner.query(`DROP TABLE "cart_items"`);
    await queryRunner.query(`DROP TABLE "carts"`);
    await queryRunner.query(`DROP TABLE "preview_backgrounds"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "quotes"`);
    await queryRunner.query(`DROP TYPE "public"."quotes_status_enum"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TYPE "public"."orders_paymentstatus_enum"`);
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "custom_designs"`);
    await queryRunner.query(`DROP TABLE "neon_backboards"`);
    await queryRunner.query(`DROP TYPE "public"."neon_backboards_type_enum"`);
    await queryRunner.query(`DROP TABLE "neon_materials"`);
    await queryRunner.query(`DROP TABLE "neon_sizes"`);
    await queryRunner.query(`DROP TABLE "neon_colors"`);
    await queryRunner.query(`DROP TABLE "neon_fonts"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
