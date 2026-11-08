-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(25) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "avatar_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specializations" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "icon_url" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" UUID NOT NULL,
    "specialization_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "hospital_name" VARCHAR(200) NOT NULL,
    "rating" DECIMAL(2,1) NOT NULL DEFAULT 0.0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "profile_image_url" VARCHAR(500) NOT NULL,
    "bio" TEXT,
    "consultation_fee" DECIMAL(10,2) DEFAULT 0.00,
    "is_recommended" BOOLEAN NOT NULL DEFAULT false,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE INDEX "password_resets_token_hash_idx" ON "password_resets"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "specializations_name_key" ON "specializations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "specializations_slug_key" ON "specializations"("slug");

-- CreateIndex
CREATE INDEX "doctors_specialization_id_idx" ON "doctors"("specialization_id");

-- CreateIndex
CREATE INDEX "doctors_rating_review_count_idx" ON "doctors"("rating", "review_count");

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_specialization_id_fkey" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
