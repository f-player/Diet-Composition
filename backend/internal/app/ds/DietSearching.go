package ds

import "time"

// DietSearching соответствует таблице "DietSearching".
type DietSearching struct {
	ID             uint       `gorm:"primaryKey;column:id"`
	Status         int        `gorm:"column:status;not null"`
	CreationDate   time.Time  `gorm:"column:creation_date;not null"`
	CreatorID      uint       `gorm:"column:creator_id;not null"`
	ModeratorID    *uint      `gorm:"column:moderator_id"`
	FormingDate    *time.Time `gorm:"column:forming_date"`
	ComplitionDate *time.Time `gorm:"column:complition_date"`
	C_pol int      `gorm:"column:c_pol;not null"`
	N_pol int      `gorm:"column:n_pol;not null"`
	PRP   *float64 `gorm:"column:prp"`
	PGP   *float64 `gorm:"column:pgp"`

	Creator     Users          `gorm:"foreignKey:CreatorID"`
	Moderator   *Users         `gorm:"foreignKey:ModeratorID"`
	ProductsLink []ProductToDiet `gorm:"foreignKey:DietID"`
}
