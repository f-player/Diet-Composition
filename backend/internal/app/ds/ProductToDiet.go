package ds

// ProductToDiet соответствует таблице "ProductToDiet"
type ProductToDiet struct {
	ID          uint    `gorm:"primaryKey;column:id"`
	DietID      uint    `gorm:"column:diet_id;not null"`   // Внешний ключ к DietSearching
	ProductID    uint    `gorm:"column:product_id;not null"` // Внешний ключ к Products
	Description *string `gorm:"column:description;type:text"`

	// --- СВЯЗИ ---
	// Отношение "принадлежит к" для каждой из связанных таблиц.
	Diet   DietSearching `gorm:"foreignKey:DietID"`
	Product Products       `gorm:"foreignKey:ProductID"`
}
