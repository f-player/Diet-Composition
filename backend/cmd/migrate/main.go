package main

import (
	"RIP/internal/app/ds"
	"RIP/internal/app/dsn"
	"fmt"
	"log"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	_ = godotenv.Load()

	// Читаем DSN из переменных окружения
	dsnStr := dsn.FromEnv()
	if dsnStr == "" {
		// Если env не установлены, используем значения по умолчанию
		dsnStr = "host=localhost user=postgres password=postgres dbname=rip port=5432 sslmode=disable"
	}
	fmt.Println("Attempting to connect with DSN:", dsnStr)

	db, err := gorm.Open(postgres.Open(dsnStr), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect database:", err)
	}

	fmt.Println("Successfully connected to database!")

	err = db.AutoMigrate(
		&ds.Products{},
		&ds.DietSearching{},
		&ds.ProductToDiet{},
		&ds.Users{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	fmt.Println("Migration completed successfully!")
}
