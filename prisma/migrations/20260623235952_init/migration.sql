-- CreateTable
CREATE TABLE "municipios" (
    "geocodigo" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "populacao" INTEGER NOT NULL,

    CONSTRAINT "municipios_pkey" PRIMARY KEY ("geocodigo")
);

-- CreateTable
CREATE TABLE "registros_semanais" (
    "id" SERIAL NOT NULL,
    "municipio_geocodigo" INTEGER NOT NULL,
    "semana_epidemiologica" INTEGER NOT NULL,
    "data_inicio_semana" TIMESTAMP(3) NOT NULL,
    "casos" INTEGER NOT NULL,
    "nivel_alerta" INTEGER NOT NULL,
    "rt" DOUBLE PRECISION NOT NULL,
    "temp_media" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "registros_semanais_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "registros_semanais_municipio_geocodigo_semana_epidemiologic_key" ON "registros_semanais"("municipio_geocodigo", "semana_epidemiologica");

-- AddForeignKey
ALTER TABLE "registros_semanais" ADD CONSTRAINT "registros_semanais_municipio_geocodigo_fkey" FOREIGN KEY ("municipio_geocodigo") REFERENCES "municipios"("geocodigo") ON DELETE RESTRICT ON UPDATE CASCADE;
